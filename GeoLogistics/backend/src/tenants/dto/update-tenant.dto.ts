import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantDto } from './create-tenant.dto';
import { IsNumber, IsOptional } from 'class-validator';

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
}
