export declare enum DriverStatus {
    AVAILABLE = "AVAILABLE",
    BUSY = "BUSY",
    OFFLINE = "OFFLINE"
}
export declare class Driver {
    id: string;
    name: string;
    status: DriverStatus;
    latitude: number;
    longitude: number;
    created_at: Date;
    updated_at: Date;
}
