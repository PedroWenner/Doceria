import { HttpService } from '@nestjs/axios';
export declare class RoutingService {
    private readonly httpService;
    constructor(httpService: HttpService);
    getRoute(originLat: number, originLon: number, destLat: number, destLon: number): Promise<{
        distance: any;
        duration: any;
        origin: {
            lat: number;
            lon: number;
        };
        destination: {
            lat: number;
            lon: number;
        };
    }>;
}
