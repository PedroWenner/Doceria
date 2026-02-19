import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';
export declare class DriversController {
    private readonly driversService;
    constructor(driversService: DriversService);
    create(createDriverDto: CreateDriverDto): Promise<CreateDriverDto & import("./entities/driver.entity").Driver>;
    findAll(): Promise<import("./entities/driver.entity").Driver[]>;
    findOne(id: string): Promise<import("./entities/driver.entity").Driver | null>;
    update(id: string, updateDriverDto: UpdateDriverDto): Promise<import("typeorm").UpdateResult>;
    updateLocation(id: string, updateDriverLocationDto: UpdateDriverLocationDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
