import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { RoutingModule } from '../routing/routing.module';
import { TenantsModule } from '../tenants/tenants.module';
import { WebhookModule } from '../webhooks/webhook.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    RoutingModule, // To use PricingService
    TenantsModule,
    WebhookModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule { }
