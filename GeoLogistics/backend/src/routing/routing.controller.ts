import { Controller, Get, Query } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { PricingService } from './pricing.service';

@Controller('routing')
export class RoutingController {
  constructor(
    private readonly routingService: RoutingService,
    private readonly pricingService: PricingService,
  ) { }

  @Get('calculate')
  calculateRoute(
    @Query('originLat') originLat: string,
    @Query('originLon') originLon: string,
    @Query('destLat') destLat: string,
    @Query('destLon') destLon: string,
  ) {
    return this.routingService.getRoute(
      parseFloat(originLat),
      parseFloat(originLon),
      parseFloat(destLat),
      parseFloat(destLon),
    );
  }

  @Get('estimate')
  estimatePrice(
    @Query('tenantId') tenantId: string,
    @Query('originLat') originLat: string,
    @Query('originLon') originLon: string,
    @Query('destLat') destLat: string,
    @Query('destLon') destLon: string,
  ) {
    return this.pricingService.calculatePrice(
      tenantId,
      parseFloat(originLat),
      parseFloat(originLon),
      parseFloat(destLat),
      parseFloat(destLon),
    );
  }
}
