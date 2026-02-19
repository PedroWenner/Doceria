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
exports.Driver = exports.DriverType = exports.DriverStatus = void 0;
const typeorm_1 = require("typeorm");
var DriverStatus;
(function (DriverStatus) {
    DriverStatus["AVAILABLE"] = "AVAILABLE";
    DriverStatus["BUSY"] = "BUSY";
    DriverStatus["OFFLINE"] = "OFFLINE";
})(DriverStatus || (exports.DriverStatus = DriverStatus = {}));
var DriverType;
(function (DriverType) {
    DriverType["OWN_FLEET"] = "OWN_FLEET";
    DriverType["FREELANCER"] = "FREELANCER";
})(DriverType || (exports.DriverType = DriverType = {}));
let Driver = class Driver {
};
exports.Driver = Driver;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Driver.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Driver.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DriverType,
        default: DriverType.FREELANCER,
    }),
    __metadata("design:type", String)
], Driver.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DriverStatus,
        default: DriverStatus.OFFLINE,
    }),
    __metadata("design:type", String)
], Driver.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], Driver.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], Driver.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Driver.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Driver.prototype, "updated_at", void 0);
exports.Driver = Driver = __decorate([
    (0, typeorm_1.Entity)('drivers')
], Driver);
//# sourceMappingURL=driver.entity.js.map