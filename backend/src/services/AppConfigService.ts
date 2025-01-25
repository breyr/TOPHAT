import { AppConfig } from '@prisma/client';
import { IAppConfigRepository, IAppConfigService } from '../types/classInterfaces';

export class AppConfigService implements IAppConfigService {
    private appConfigRepository: IAppConfigRepository;

    constructor(appConfigRepository: IAppConfigRepository) {
        this.appConfigRepository = appConfigRepository;
    }

    async updateConfig(key: string, value: string): Promise<AppConfig> {
        return this.appConfigRepository.upsertConfig(key, value);
    }

    async getConfigByKey(key: string): Promise<AppConfig | null> {
        return this.appConfigRepository.findByKey(key);
    }
}