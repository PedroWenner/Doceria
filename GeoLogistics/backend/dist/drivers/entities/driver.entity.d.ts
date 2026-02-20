import { Tenant } from '../../tenants/entities/tenant.entity';
export declare enum DriverStatus {
    AVAILABLE = "AVAILABLE",
    BUSY = "BUSY",
    OFFLINE = "OFFLINE"
}
export declare enum DriverType {
    OWN_FLEET = "OWN_FLEET",
    FREELANCER = "FREELANCER"
}
export declare class Driver {
    id: string;
    name: string;
    type: DriverType;
    status: DriverStatus;
    latitude: number;
    longitude: number;
    tenant: Tenant;
    tenantId: string;
    created_at: Date;
    updated_at: Date;
}
