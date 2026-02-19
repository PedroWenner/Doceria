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
exports.RoutingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let RoutingService = class RoutingService {
    constructor(httpService) {
        this.httpService = httpService;
    }
    async getRoute(originLat, originLon, destLat, destLon) {
        const url = `http://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`;
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(url));
            if (!response.data.routes || response.data.routes.length === 0) {
                throw new common_1.HttpException('No route found', common_1.HttpStatus.NOT_FOUND);
            }
            const route = response.data.routes[0];
            return {
                distance: route.distance,
                duration: route.duration,
                origin: { lat: originLat, lon: originLon },
                destination: { lat: destLat, lon: destLon },
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to fetch route', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.RoutingService = RoutingService;
exports.RoutingService = RoutingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], RoutingService);
//# sourceMappingURL=routing.service.js.map