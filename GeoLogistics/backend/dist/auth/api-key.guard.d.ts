import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Repository } from 'typeorm';
export declare class ApiKeyGuard implements CanActivate {
    private tenantRepository;
    constructor(tenantRepository: Repository<Tenant>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
