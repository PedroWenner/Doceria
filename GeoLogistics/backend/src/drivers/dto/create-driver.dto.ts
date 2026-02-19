import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { DriverStatus } from '../entities/driver.entity';

export class CreateDriverDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(DriverStatus)
    @IsOptional()
    status?: DriverStatus;
}
