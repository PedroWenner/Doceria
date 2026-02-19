import { RoutingService } from './routing.service';
import { PricingService } from './pricing.service';
export declare class RoutingController {
    private readonly routingService;
    private readonly pricingService;
    constructor(routingService: RoutingService, pricingService: PricingService);
    calculateRoute(originLat: string, originLon: string, destLat: string, destLon: string): Promise<{
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
    estimatePrice(originLat: string, originLon: string, destLat: string, destLon: string): Promise<{
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
