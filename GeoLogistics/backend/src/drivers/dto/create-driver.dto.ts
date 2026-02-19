import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { DriverStatus, DriverType } from '../entities/driver.entity';

export class CreateDriverDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(DriverType)
    @IsOptional()
    type?: DriverType;

    @IsEnum(DriverStatus)
    @IsOptional()
    status?: DriverStatus;
}
