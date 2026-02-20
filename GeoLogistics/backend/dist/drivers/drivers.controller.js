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
exports.DriversController = void 0;
const common_1 = require("@nestjs/common");
const drivers_service_1 = require("./drivers.service");
const create_driver_dto_1 = require("./dto/create-driver.dto");
const update_driver_dto_1 = require("./dto/update-driver.dto");
const update_driver_location_dto_1 = require("./dto/update-driver-location.dto");
let DriversController = class DriversController {
    constructor(driversService) {
        this.driversService = driversService;
    }
    create(createDriverDto, apiKey) {
        return this.driversService.create(createDriverDto, apiKey);
    }
    findAll(type, apiKey) {
        return this.driversService.findAll(type, apiKey);
    }
    findOne(id) {
        return this.driversService.findOne(id);
    }
    update(id, updateDriverDto) {
        return this.driversService.update(id, updateDriverDto);
    }
    updateLocation(id, updateDriverLocationDto) {
        return this.driversService.updateLocation(id, updateDriverLocationDto);
    }
    remove(id) {
        return this.driversService.remove(id);
    }
};
exports.DriversController = DriversController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_driver_dto_1.CreateDriverDto, String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_driver_dto_1.UpdateDriverDto]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/location'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_driver_location_dto_1.UpdateDriverLocationDto]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "remove", null);
exports.DriversController = DriversController = __decorate([
    (0, common_1.Controller)('drivers'),
    __metadata("design:paramtypes", [drivers_service_1.DriversService])
], DriversController);
//# sourceMappingURL=drivers.controller.js.map