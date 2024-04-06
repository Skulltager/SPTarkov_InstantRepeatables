import { inject, injectable } from "tsyringe";
import { RepeatableQuestController } from "@spt-aki/controllers/RepeatableQuestController";
import { RepeatableQuestGenerator } from "@spt-aki/generators/RepeatableQuestGenerator";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import { QuestHelper } from "@spt-aki/helpers/QuestHelper";
import { RagfairServerHelper } from "@spt-aki/helpers/RagfairServerHelper";
import { RepeatableQuestHelper } from "@spt-aki/helpers/RepeatableQuestHelper";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { EventOutputHolder } from "@spt-aki/routers/EventOutputHolder";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { PaymentService } from "@spt-aki/services/PaymentService";
import { ProfileFixerService } from "@spt-aki/services/ProfileFixerService";
import { HttpResponseUtil } from "@spt-aki/utils/HttpResponseUtil";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ObjectId } from "@spt-aki/utils/ObjectId";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { TimeUtil } from "@spt-aki/utils/TimeUtil";
import { IRepeatableQuestConfig } from "@spt-aki/models/spt/config/IQuestConfig";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { IPmcDataRepeatableQuest, IRepeatableQuest } from "@spt-aki/models/eft/common/tables/IRepeatableQuests";
import { IQuestTypePool } from "@spt-aki/models/spt/repeatable/IQuestTypePool";
import { TraderInfo } from "@spt-aki/models/eft/common/tables/IBotBase";


@injectable()
export class CustomRepeatableQuestController extends RepeatableQuestController 
{
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("TimeUtil") protected timeUtil: TimeUtil,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
        @inject("JsonUtil") protected jsonUtil: JsonUtil,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
        @inject("ProfileFixerService") protected profileFixerService: ProfileFixerService,
        @inject("EventOutputHolder") protected eventOutputHolder: EventOutputHolder,
        @inject("PaymentService") protected paymentService: PaymentService,
        @inject("ObjectId") protected objectId: ObjectId,
        @inject("RepeatableQuestGenerator") protected repeatableQuestGenerator: RepeatableQuestGenerator,
        @inject("RepeatableQuestHelper") protected repeatableQuestHelper: RepeatableQuestHelper,
        @inject("QuestHelper") protected questHelper: QuestHelper,
        @inject("ConfigServer") protected configServer: ConfigServer
    ) 
    {
        // Pass the parent class the callback dependencies it needs.
        
        super(logger, databaseServer, timeUtil, randomUtil, httpResponse, jsonUtil, profileHelper, profileFixerService, eventOutputHolder, paymentService, objectId, repeatableQuestGenerator, repeatableQuestHelper, questHelper, configServer);
    }

    public getRepeatableQuestSubTypeFromProfilePublic(repeatableConfig: IRepeatableQuestConfig, pmcData: IPmcData): IPmcDataRepeatableQuest
    {
        return super.getRepeatableQuestSubTypeFromProfile(repeatableConfig, pmcData);
    }

    public generateQuestPoolPublic(repeatableConfig: IRepeatableQuestConfig, pmcLevel: number) : IQuestTypePool
    {
        return super.generateQuestPool(repeatableConfig, pmcLevel);
    }

    public generateRepeatableQuestPublic(pmcLevel: number, pmcTraderInfo: Record<string, TraderInfo>, questTypePool: IQuestTypePool, repeatableConfig: IRepeatableQuestConfig) : IRepeatableQuest
    {
        return this.repeatableQuestGenerator.generateRepeatableQuest(pmcLevel, pmcTraderInfo, questTypePool, repeatableConfig);
    }
}