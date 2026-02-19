import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { RoutingModule } from '../routing/routing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    RoutingModule, // To use PricingService
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule { }
