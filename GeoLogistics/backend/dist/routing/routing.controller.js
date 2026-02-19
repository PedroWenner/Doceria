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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingController = void 0;
const common_1 = require("@nestjs/common");
const routing_service_1 = require("./routing.service");
const pricing_service_1 = require("./pricing.service");
let RoutingController = class RoutingController {
    constructor(routingService, pricingService) {
        this.routingService = routingService;
        this.pricingService = pricingService;
    }
    calculateRoute(originLat, originLon, destLat, destLon) {
        return this.routingService.getRoute(parseFloat(originLat), parseFloat(originLon), parseFloat(destLat), parseFloat(destLon));
    }
    estimatePrice(tenantId, originLat, originLon, destLat, destLon) {
        return this.pricingService.calculatePrice(tenantId, parseFloat(originLat), parseFloat(originLon), parseFloat(destLat), parseFloat(destLon));
    }
};
exports.RoutingController = RoutingController;
__decorate([
    (0, common_1.Get)('calculate'),
    __param(0, (0, common_1.Query)('originLat')),
    __param(1, (0, common_1.Query)('originLon')),
    __param(2, (0, common_1.Query)('destLat')),
    __param(3, (0, common_1.Query)('destLon')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], RoutingController.prototype, "calculateRoute", null);
__decorate([
    (0, common_1.Get)('estimate'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('originLat')),
    __param(2, (0, common_1.Query)('originLon')),
    __param(3, (0, common_1.Query)('destLat')),
    __param(4, (0, common_1.Query)('destLon')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], RoutingController.prototype, "estimatePrice", null);
exports.RoutingController = RoutingController = __decorate([
    (0, common_1.Controller)('routing'),
    __metadata("design:paramtypes", [routing_service_1.RoutingService,
        pricing_service_1.PricingService])
], RoutingController);
//# sourceMappingURL=routing.controller.js.map