import { Tenant } from '../../tenants/entities/tenant.entity';
import { Driver } from '../../drivers/entities/driver.entity';
export declare enum OrderStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    PICKED_UP = "PICKED_UP",
    DELIVERED = "DELIVERED",
    CANCELED = "CANCELED"
}
export declare class Order {
    id: string;
    tenant_id: string;
    tenant: Tenant;
    driver_id: string;
    driver: Driver;
    status: OrderStatus;
    pickup_lat: number;
    pickup_lon: number;
    pickup_address: string;
    dropoff_lat: number;
    dropoff_lon: number;
    dropoff_address: string;
    price: number;
    distance_km: number;
    created_at: Date;
    updated_at: Date;
}
