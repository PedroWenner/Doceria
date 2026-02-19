import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RoutingService } from './routing.service';
import { PricingService } from './pricing.service';
import { RoutingController } from './routing.controller';

@Module({
  imports: [HttpModule],
  controllers: [RoutingController],
  providers: [RoutingService, PricingService],
  exports: [PricingService],
})
export class RoutingModule { }
