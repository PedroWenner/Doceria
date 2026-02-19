import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    constructor(private readonly httpService: HttpService) { }

    async notify(url: string, event: string, payload: any) {
        if (!url) return;

        try {
            this.logger.log(`Sending webhook ${event} to ${url}`);
            await lastValueFrom(
                this.httpService.post(url, {
                    event,
                    timestamp: new Date().toISOString(),
                    data: payload,
                }),
            );
        } catch (error) {
            this.logger.error(`Failed to send webhook to ${url}`, error.message);
            // Fire-and-forget, do not throw
        }
    }
}
