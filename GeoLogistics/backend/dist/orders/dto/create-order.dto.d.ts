export declare class CreateOrderDto {
    tenant_id: string;
    pickup_lat: number;
    pickup_lon: number;
    pickup_address?: string;
    dropoff_lat: number;
    dropoff_lon: number;
    dropoff_address?: string;
    driver_id?: string;
}
