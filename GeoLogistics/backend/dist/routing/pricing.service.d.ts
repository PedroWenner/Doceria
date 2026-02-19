import { RoutingService } from './routing.service';
export declare class PricingService {
    private readonly routingService;
    constructor(routingService: RoutingService);
    calculatePrice(originLat: number, originLon: number, destLat: number, destLon: number): Promise<{
        price: number;
        breakdown: {
            base: number;
            distance_fare: number;
            time_fare: number;
        };
        route: {
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
        };
    }>;
}
