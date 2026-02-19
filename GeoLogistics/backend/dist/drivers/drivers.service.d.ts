import { Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';
import { Driver } from './entities/driver.entity';
export declare class DriversService {
    private driverRepository;
    constructor(driverRepository: Repository<Driver>);
    create(createDriverDto: CreateDriverDto): Promise<CreateDriverDto & Driver>;
    findAll(type?: string): Promise<Driver[]>;
    findOne(id: string): Promise<Driver>;
    update(id: string, updateDriverDto: UpdateDriverDto): Promise<import("typeorm").UpdateResult>;
    updateLocation(id: string, locationDto: UpdateDriverLocationDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
