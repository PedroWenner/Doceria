import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) { }

  @Post()
  create(
    @Body() createDriverDto: CreateDriverDto,
    @Headers('x-api-key') apiKey?: string
  ) {
    return this.driversService.create(createDriverDto, apiKey);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Headers('x-api-key') apiKey?: string
  ) {
    return this.driversService.findAll(type, apiKey);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Patch(':id/location')
  updateLocation(
    @Param('id') id: string,
    @Body() updateDriverLocationDto: UpdateDriverLocationDto,
  ) {
    return this.driversService.updateLocation(id, updateDriverLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }
}
