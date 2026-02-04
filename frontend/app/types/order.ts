export interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: string;
    product?: {
        name: string;
    }
}

export interface Order {
    id: number;
    customer_name: string;
    status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'canceled';
    payment_status: 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded';
    total_amount: string;
    payment_method: string;
    delivery_type: 'pickup' | 'delivery';
    delivery_address?: {
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        zip_code: string;
    };
    customer_phone?: string;
    courier_name?: string;
    created_at: string;
    items: OrderItem[];
    notes?: string;
}
