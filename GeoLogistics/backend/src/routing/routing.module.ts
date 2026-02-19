import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RoutingService } from './routing.service';
import { PricingService } from './pricing.service';
import { RoutingController } from './routing.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [HttpModule, TenantsModule],
  controllers: [RoutingController],
  providers: [RoutingService, PricingService],
  exports: [PricingService],
})
export class RoutingModule { }
