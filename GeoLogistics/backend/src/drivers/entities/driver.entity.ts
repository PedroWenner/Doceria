import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DriverStatus {
    AVAILABLE = 'AVAILABLE',
    BUSY = 'BUSY',
    OFFLINE = 'OFFLINE',
}

export enum DriverType {
    OWN_FLEET = 'OWN_FLEET',
    FREELANCER = 'FREELANCER',
}

@Entity('drivers')
export class Driver {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: DriverType,
        default: DriverType.FREELANCER,
    })
    type: DriverType;

    @Column({
        type: 'enum',
        enum: DriverStatus,
        default: DriverStatus.OFFLINE,
    })
    status: DriverStatus;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    longitude: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
