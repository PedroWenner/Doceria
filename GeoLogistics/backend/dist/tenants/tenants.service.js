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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("./entities/tenant.entity");
let TenantsService = class TenantsService {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }
    create(createTenantDto) {
        const tenant = this.tenantRepository.create(createTenantDto);
        tenant.api_key = 'sk_' + crypto.randomUUID();
        return this.tenantRepository.save(tenant);
    }
    findAll(slug, api_key) {
        const where = {};
        if (slug)
            where.slug = slug;
        if (api_key)
            where.api_key = api_key;
        if (Object.keys(where).length > 0) {
            return this.tenantRepository.find({ where });
        }
        return this.tenantRepository.find();
    }
    findOne(id) {
        return this.tenantRepository.findOneBy({ id });
    }
    async update(id, updateTenantDto) {
        const result = await this.tenantRepository.update(id, updateTenantDto);
        if (result.affected === 0) {
            throw new Error(`Tenant with ID ${id} not found`);
        }
        return result;
    }
    remove(id) {
        return this.tenantRepository.delete(id);
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map