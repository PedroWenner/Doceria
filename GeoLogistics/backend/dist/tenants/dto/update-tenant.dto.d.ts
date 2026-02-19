import { CreateTenantDto } from './create-tenant.dto';
declare const UpdateTenantDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTenantDto>>;
export declare class UpdateTenantDto extends UpdateTenantDto_base {
    base_fare?: number;
    price_per_km?: number;
    price_per_min?: number;
}
export {};
