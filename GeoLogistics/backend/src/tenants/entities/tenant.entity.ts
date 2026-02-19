import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenants')
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string; // url-friendly name

    @Column({ nullable: true })
    api_key: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 5.00 })
    base_fare: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 2.00 })
    price_per_km: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.50 })
    price_per_min: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
