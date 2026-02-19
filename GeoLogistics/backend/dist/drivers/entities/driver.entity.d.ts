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
    created_at: Date;
    updated_at: Date;
}
