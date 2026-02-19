import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Driver } from '../../drivers/entities/driver.entity';

export enum OrderStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    PICKED_UP = 'PICKED_UP',
    DELIVERED = 'DELIVERED',
    CANCELED = 'CANCELED',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ type: 'uuid', nullable: true })
    driver_id: string;

    @ManyToOne(() => Driver)
    @JoinColumn({ name: 'driver_id' })
    driver: Driver;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    // Pickup Location
    @Column({ type: 'float' })
    pickup_lat: number;

    @Column({ type: 'float' })
    pickup_lon: number;

    @Column({ nullable: true })
    pickup_address: string;

    // Dropoff Location
    @Column({ type: 'float' })
    dropoff_lat: number;

    @Column({ type: 'float' })
    dropoff_lon: number;

    @Column({ nullable: true })
    dropoff_address: string;

    // Pricing
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'float' })
    distance_km: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
