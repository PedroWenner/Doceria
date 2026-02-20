import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';
import { Driver } from './entities/driver.entity';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private tenantsService: TenantsService,
  ) { }

  async create(createDriverDto: CreateDriverDto, apiKey?: string) {
    const driver = this.driverRepository.create(createDriverDto);

    if (apiKey) {
      const tenants = await this.tenantsService.findAll(undefined, apiKey);
      if (tenants.length > 0) {
        driver.tenant = tenants[0];
        driver.tenantId = tenants[0].id; // Optimization for direct column access
      }
    }

    return this.driverRepository.save(driver);
  }

  async findAll(type?: string, apiKey?: string) {
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (apiKey) {
      const tenants = await this.tenantsService.findAll(undefined, apiKey);
      if (tenants.length > 0) {
        where.tenantId = tenants[0].id;
      } else {
        // If API key is provided but invalid, return empty array to prevent data leak
        return [];
      }
    }

    return this.driverRepository.find({ where });
  }

  findOne(id: string) {
    return this.driverRepository.findOneBy({ id });
  }

  update(id: string, updateDriverDto: UpdateDriverDto) {
    return this.driverRepository.update(id, updateDriverDto);
  }

  async updateLocation(id: string, locationDto: UpdateDriverLocationDto) {
    const driver = await this.findOne(id);
    if (!driver) throw new NotFoundException('Driver not found');

    return this.driverRepository.update(id, {
      latitude: locationDto.latitude,
      longitude: locationDto.longitude,
    });
  }

  remove(id: string) {
    return this.driverRepository.delete(id);
  }
}
