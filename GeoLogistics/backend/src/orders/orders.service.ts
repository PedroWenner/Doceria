import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { PricingService } from '../routing/pricing.service';
import { WebhookService } from '../webhooks/webhook.service';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private readonly pricingService: PricingService,
    private readonly webhookService: WebhookService,
    private readonly tenantsService: TenantsService,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    // 1. Calculate Price based on coordinates
    const pricing = await this.pricingService.calculatePrice(
      createOrderDto.tenant_id,
      createOrderDto.pickup_lat,
      createOrderDto.pickup_lon,
      createOrderDto.dropoff_lat,
      createOrderDto.dropoff_lon,
    );

    // 2. Create Order
    const order = this.orderRepository.create({
      ...createOrderDto,
      price: pricing.price,
      distance_km: pricing.route.distance / 1000,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 3. Trigger Webhook
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

  findOne(id: string) {
    return this.orderRepository.findOneBy({ id });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.update(id, updateOrderDto);
  }

  remove(id: string) {
    return this.orderRepository.delete(id);
  }
  async getStats() {
    const totalOrders = await this.orderRepository.count();

    // Status Breakdwon
    const statusCounts = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.status)', 'count')
      .groupBy('order.status')
      .getRawMany();

    // Revenue
    const revenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.price)', 'total')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .getRawOne();

    return {
      totalOrders,
      statusCounts: statusCounts.reduce((acc, curr) => ({ ...acc, [curr.status]: Number(curr.count) }), {}),
      totalRevenue: Number(revenue?.total || 0),
    };
  }
}
