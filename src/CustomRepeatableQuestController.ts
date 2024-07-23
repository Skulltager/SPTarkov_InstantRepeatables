import { inject, injectable } from "tsyringe";
import { RepeatableQuestController } from "@spt/controllers/RepeatableQuestController";
import { RepeatableQuestGenerator } from "@spt/generators/RepeatableQuestGenerator";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { QuestHelper } from "@spt/helpers/QuestHelper";
import { RepeatableQuestHelper } from "@spt/helpers/RepeatableQuestHelper";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { EventOutputHolder } from "@spt/routers/EventOutputHolder";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { PaymentService } from "@spt/services/PaymentService";
import { ProfileFixerService } from "@spt/services/ProfileFixerService";
import { HttpResponseUtil } from "@spt/utils/HttpResponseUtil";
import { ObjectId } from "@spt/utils/ObjectId";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { TimeUtil } from "@spt/utils/TimeUtil";
import { IRepeatableQuestConfig } from "@spt/models/spt/config/IQuestConfig";
import { IPmcData } from "@spt/models/eft/common/IPmcData";
import { IPmcDataRepeatableQuest, IRepeatableQuest } from "@spt/models/eft/common/tables/IRepeatableQuests";
import { IQuestTypePool } from "@spt/models/spt/repeatable/IQuestTypePool";
import { TraderInfo } from "@spt/models/eft/common/tables/IBotBase";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { DatabaseService } from "@spt/services/DatabaseService";
import { LocalisationService } from "@spt/services/LocalisationService";


@injectable()
export class CustomRepeatableQuestController extends RepeatableQuestController 
{
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("TimeUtil") protected timeUtil: TimeUtil,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
        @inject("ProfileFixerService") protected profileFixerService: ProfileFixerService,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("EventOutputHolder") protected eventOutputHolder: EventOutputHolder,
        @inject("PaymentService") protected paymentService: PaymentService,
        @inject("ObjectId") protected objectId: ObjectId,
        @inject("RepeatableQuestGenerator") protected repeatableQuestGenerator: RepeatableQuestGenerator,
        @inject("RepeatableQuestHelper") protected repeatableQuestHelper: RepeatableQuestHelper,
        @inject("QuestHelper") protected questHelper: QuestHelper,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("PrimaryCloner") protected cloner: ICloner,
    ) 
    {
        // Pass the parent class the callback dependencies it needs.
        
        super(logger, databaseService, timeUtil, randomUtil, httpResponse, profileHelper, profileFixerService, localisationService, eventOutputHolder, paymentService, objectId, repeatableQuestGenerator, repeatableQuestHelper, questHelper, configServer, cloner);
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