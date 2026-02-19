import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { PricingService } from '../routing/pricing.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private readonly pricingService: PricingService,
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

    return this.orderRepository.save(order);
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
}
