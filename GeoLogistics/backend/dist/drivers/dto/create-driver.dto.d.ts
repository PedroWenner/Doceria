import { DriverStatus, DriverType } from '../entities/driver.entity';
export declare class CreateDriverDto {
    name: string;
    type?: DriverType;
    status?: DriverStatus;
}
