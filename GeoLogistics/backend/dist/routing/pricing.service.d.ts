import { RoutingService } from './routing.service';
import { TenantsService } from '../tenants/tenants.service';
export declare class PricingService {
    private readonly routingService;
    private readonly tenantsService;
    constructor(routingService: RoutingService, tenantsService: TenantsService);
    calculatePrice(tenantId: string, originLat: number, originLon: number, destLat: number, destLon: number): Promise<{
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
