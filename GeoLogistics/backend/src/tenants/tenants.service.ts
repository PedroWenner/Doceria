import { Injectable, NotFoundException } from '@nestjs/common';
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

  findAll(slug?: string) {
    if (slug) {
      return this.tenantRepository.find({ where: { slug } });
    }
    return this.tenantRepository.find();
  }

  findOne(id: string) {
    return this.tenantRepository.findOneBy({ id });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const result = await this.tenantRepository.update(id, updateTenantDto);
    if (result.affected === 0) {
      // Import NotFoundException at top of file if not specificed, but for now assuming it handles standard NestJS error flow
      // Actually need to ensure import exists
      throw new Error(`Tenant with ID ${id} not found`);
    }
    return result;
  }

  remove(id: string) {
    return this.tenantRepository.delete(id);
  }
}
