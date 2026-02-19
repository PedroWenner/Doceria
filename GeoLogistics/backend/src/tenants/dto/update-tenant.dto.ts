import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantDto } from './create-tenant.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
    @IsNumber()
    @IsOptional()
    base_fare?: number;

    @IsNumber()
    @IsOptional()
    price_per_km?: number;

    @IsNumber()
    @IsOptional()
    price_per_min?: number;

    @IsString()
    @IsOptional()
    webhook_url?: string;
}
