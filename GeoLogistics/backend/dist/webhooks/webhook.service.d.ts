import { HttpService } from '@nestjs/axios';
export declare class WebhookService {
    private readonly httpService;
    private readonly logger;
    constructor(httpService: HttpService);
    notify(url: string, event: string, payload: any): Promise<void>;
}
