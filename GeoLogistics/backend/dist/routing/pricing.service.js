"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const routing_service_1 = require("./routing.service");
const tenants_service_1 = require("../tenants/tenants.service");
let PricingService = class PricingService {
    constructor(routingService, tenantsService) {
        this.routingService = routingService;
        this.tenantsService = tenantsService;
    }
    async calculatePrice(tenantId, originLat, originLon, destLat, destLon) {
        const tenant = await this.tenantsService.findOne(tenantId);
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found for pricing');
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
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [routing_service_1.RoutingService,
        tenants_service_1.TenantsService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map