import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) { }

  create(createTenantDto: CreateTenantDto) {
    const tenant = this.tenantRepository.create(createTenantDto);
    tenant.api_key = 'sk_' + crypto.randomUUID();
    return this.tenantRepository.save(tenant);
  }

  findAll() {
    return this.tenantRepository.find();
  }

  findOne(id: string) {
    return this.tenantRepository.findOneBy({ id });
  }

  update(id: string, updateTenantDto: UpdateTenantDto) {
    return this.tenantRepository.update(id, updateTenantDto);
  }

  remove(id: string) {
    return this.tenantRepository.delete(id);
  }
}
