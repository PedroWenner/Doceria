import { Injectable } from '@nestjs/common';
import { RoutingService } from './routing.service';

@Injectable()
export class PricingService {
    constructor(private readonly routingService: RoutingService) { }

    async calculatePrice(originLat: number, originLon: number, destLat: number, destLon: number) {
        const route = await this.routingService.getRoute(originLat, originLon, destLat, destLon);

        // Pricing Strategy (Mock)
        const BASE_FARE = 5.00; // R$ 5,00
        const RATE_PER_KM = 2.00; // R$ 2,00 per km
        const RATE_PER_MIN = 0.50; // R$ 0,50 per min

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
