import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { PricingService } from '../routing/pricing.service';
import { WebhookService } from '../webhooks/webhook.service';
import { TenantsService } from '../tenants/tenants.service';
export declare class OrdersService {
    private orderRepository;
    private readonly pricingService;
    private readonly webhookService;
    private readonly tenantsService;
    constructor(orderRepository: Repository<Order>, pricingService: PricingService, webhookService: WebhookService, tenantsService: TenantsService);
    create(createOrderDto: CreateOrderDto, apiKey?: string): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    getStats(): Promise<{
        totalOrders: number;
        statusCounts: any;
        totalRevenue: number;
    }>;
}
