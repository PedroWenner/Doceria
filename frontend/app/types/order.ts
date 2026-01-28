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
    total_amount: string;
    payment_method: string;
    created_at: string;
    items: OrderItem[];
    notes?: string;
}
