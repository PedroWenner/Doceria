import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException('API Key is missing');
        }

        const tenant = await this.tenantRepository.findOneBy({ api_key: apiKey });

        if (!tenant) {
            throw new UnauthorizedException('Invalid API Key');
        }

        // Attach tenant to request for controllers to use
        request.tenant = tenant;
        return true;
    }
}
