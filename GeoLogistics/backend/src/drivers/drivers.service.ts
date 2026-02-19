import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) { }

  create(createDriverDto: CreateDriverDto) {
    return this.driverRepository.save(createDriverDto);
  }

  findAll() {
    return this.driverRepository.find();
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
