import { IsNumber, IsNotEmpty, IsString, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class CreateOrderDto {
    @IsUUID()
    @IsOptional()
    tenant_id: string;

    @IsNumber()
    @Min(-90) @Max(90)
    pickup_lat: number;

    @IsNumber()
    @Min(-180) @Max(180)
    pickup_lon: number;

    @IsString()
    @IsOptional()
    pickup_address?: string;

    @IsNumber()
    @Min(-90) @Max(90)
    dropoff_lat: number;

    @IsNumber()
    @Min(-180) @Max(180)
    dropoff_lon: number;

    @IsString()
    @IsOptional()
    dropoff_address?: string;

    @IsUUID()
    @IsOptional()
    driver_id?: string;
}
