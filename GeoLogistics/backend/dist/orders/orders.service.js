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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const pricing_service_1 = require("../routing/pricing.service");
const webhook_service_1 = require("../webhooks/webhook.service");
const tenants_service_1 = require("../tenants/tenants.service");
let OrdersService = class OrdersService {
    constructor(orderRepository, pricingService, webhookService, tenantsService) {
        this.orderRepository = orderRepository;
        this.pricingService = pricingService;
        this.webhookService = webhookService;
        this.tenantsService = tenantsService;
    }
    async create(createOrderDto, apiKey) {
        if (apiKey) {
            const tenants = await this.tenantsService.findAll(undefined, apiKey);
            if (tenants && tenants.length > 0) {
                createOrderDto.tenant_id = tenants[0].id;
            }
        }
        if (!createOrderDto.tenant_id) {
            throw new Error('Tenant ID is required. Please provide it directly or via headers.');
        }
        const pricing = await this.pricingService.calculatePrice(createOrderDto.tenant_id, createOrderDto.pickup_lat, createOrderDto.pickup_lon, createOrderDto.dropoff_lat, createOrderDto.dropoff_lon);
        const order = this.orderRepository.create({
            ...createOrderDto,
            price: pricing.price,
            distance_km: pricing.route.distance / 1000,
            status: createOrderDto.driver_id ? order_entity_1.OrderStatus.ACCEPTED : order_entity_1.OrderStatus.PENDING,
            driver_id: createOrderDto.driver_id || null,
        });
        const savedOrder = await this.orderRepository.save(order);
        const tenant = await this.tenantsService.findOne(createOrderDto.tenant_id);
        if (tenant?.webhook_url) {
            this.webhookService.notify(tenant.webhook_url, 'order.created', savedOrder);
        }
        return savedOrder;
    }
    findAll() {
        return this.orderRepository.find({
            order: { created_at: 'DESC' },
        });
    }
    findOne(id) {
        return this.orderRepository.findOneBy({ id });
    }
    update(id, updateOrderDto) {
        return this.orderRepository.update(id, updateOrderDto);
    }
    remove(id) {
        return this.orderRepository.delete(id);
    }
    async getStats() {
        const totalOrders = await this.orderRepository.count();
        const statusCounts = await this.orderRepository
            .createQueryBuilder('order')
            .select('order.status', 'status')
            .addSelect('COUNT(order.status)', 'count')
            .groupBy('order.status')
            .getRawMany();
        const revenue = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.price)', 'total')
            .where('order.status = :status', { status: order_entity_1.OrderStatus.DELIVERED })
            .getRawOne();
        return {
            totalOrders,
            statusCounts: statusCounts.reduce((acc, curr) => ({ ...acc, [curr.status]: Number(curr.count) }), {}),
            totalRevenue: Number(revenue?.total || 0),
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        pricing_service_1.PricingService,
        webhook_service_1.WebhookService,
        tenants_service_1.TenantsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map