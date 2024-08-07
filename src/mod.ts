import { DependencyContainer } from "tsyringe";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { QuestController } from "@spt/controllers/QuestController";
import { RepeatableQuestController } from "@spt/controllers/RepeatableQuestController";
import { IPmcData } from "@spt/models/eft/common/IPmcData";
import { ICompleteQuestRequestData } from "@spt/models/eft/quests/ICompleteQuestRequestData";
import { IQuestConfig } from "@spt/models/spt/config/IQuestConfig";
import { CustomRepeatableQuestController } from "./CustomRepeatableQuestController";
import { IPmcDataRepeatableQuest, IRepeatableQuest } from "@spt/models/eft/common/tables/IRepeatableQuests";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { IItemEventRouterResponse } from "@spt/models/eft/itemEvent/IItemEventRouterResponse";

class InstantRepeatables implements IPreSptLoadMod
{
    private logger: ILogger
    private static container: DependencyContainer;
    
    preSptLoad(container: DependencyContainer): void 
    {
        InstantRepeatables.container = container;
        this.logger = container.resolve<ILogger>("WinstonLogger");
        container.afterResolution(
            "QuestController",
            (_t, result: QuestController) => 
            {
                result.completeQuest = this.refreshDailyOrWeekly;
            },
            {frequency: "Always"});
        
        
        container.register<QuestController>("QuestControllerOriginal", QuestController);
        container.register<CustomRepeatableQuestController>("CustomRepeatableQuestController", CustomRepeatableQuestController);
        container.register<RepeatableQuestController>("RepeatableQuestController", { useToken: "CustomRepeatableQuestController" });
    }

    refreshDailyOrWeekly(pmcData: IPmcData, body: ICompleteQuestRequestData, sessionID: string) : IItemEventRouterResponse
    {
        const questController = InstantRepeatables.container.resolve<QuestController>("QuestControllerOriginal");

        const configServer = InstantRepeatables.container.resolve<ConfigServer>("ConfigServer"); 
        const jsonUtil: JsonUtil = InstantRepeatables.container.resolve<JsonUtil>("JsonUtil");
        const questConfig: IQuestConfig = configServer.getConfig(ConfigTypes.QUEST);
        
        const repeatableQuestController = InstantRepeatables.container.resolve<CustomRepeatableQuestController>("CustomRepeatableQuestController");

        let repeatableToChange: IPmcDataRepeatableQuest;
        this.logger.success("Quest complete event");
        for (const currentRepeatable of pmcData.RepeatableQuests)
        {
            if (!currentRepeatable.activeQuests.find(x => x._id === body.qid)) 
                continue;

            this.logger.success("Generating new quest");
            delete currentRepeatable.changeRequirement[body.qid];
            const repeatableConfig = questConfig.repeatableQuests.find(x => x.name === currentRepeatable.name);
            const questTypePool = repeatableQuestController.generateQuestPoolPublic(repeatableConfig, pmcData.Info.Level);

            let quest: IRepeatableQuest = null;
            let lifeline = 0;
            while (!quest && questTypePool.types.length > 0)
            {
                quest = repeatableQuestController.generateRepeatableQuestPublic(
                    pmcData.Info.Level,
                    pmcData.TradersInfo,
                    questTypePool,
                    repeatableConfig
                );
                lifeline++;
                if (lifeline > 10)
                {
                    this.logger.debug("We were stuck in repeatable quest generation. This should never happen. Please report");
                    break;
                }
            }
            if (quest)
            {
                quest.side = repeatableConfig.side;
                currentRepeatable.activeQuests.push(quest);
                currentRepeatable.changeRequirement[quest._id] = {
                    changeCost: quest.changeCost,
                    changeStandingCost: quest.changeStandingCost
                };
            }
            repeatableToChange = jsonUtil.clone(currentRepeatable);
            delete repeatableToChange.inactiveQuests;
            break;
        }

        const output = questController.completeQuest(pmcData, body, sessionID);
        if (!repeatableToChange)
            return output;

        output.profileChanges[sessionID].repeatableQuests = [repeatableToChange];

        return output;
    }
}

export const mod = new InstantRepeatables();
