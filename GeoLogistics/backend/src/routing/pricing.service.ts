import { Injectable, NotFoundException } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class PricingService {
    constructor(
        private readonly routingService: RoutingService,
        private readonly tenantsService: TenantsService,
    ) { }

    async calculatePrice(tenantId: string, originLat: number, originLon: number, destLat: number, destLon: number) {
        const tenant = await this.tenantsService.findOne(tenantId);
        if (!tenant) throw new NotFoundException('Tenant not found for pricing');

        const route = await this.routingService.getRoute(originLat, originLon, destLat, destLon);

        const BASE_FARE = Number(tenant.base_fare);
        const RATE_PER_KM = Number(tenant.price_per_km);
        const RATE_PER_MIN = Number(tenant.price_per_min);

        const distanceKm = route.distance / 1000;
        const durationMin = route.duration / 60;

        const price = BASE_FARE + (distanceKm * RATE_PER_KM) + (durationMin * RATE_PER_MIN);

        return {
            price: parseFloat(price.toFixed(2)),
            breakdown: {
                base: BASE_FARE,
                distance_fare: parseFloat((distanceKm * RATE_PER_KM).toFixed(2)),
                time_fare: parseFloat((durationMin * RATE_PER_MIN).toFixed(2)),
            },
            route,
        };
    }
}
