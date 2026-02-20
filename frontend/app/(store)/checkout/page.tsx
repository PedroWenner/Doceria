'use client';

import { useCart } from '@/app/context/CartContext';
import { useStoreAuth } from '@/app/context/StoreAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import jsCookie from 'js-cookie';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import AddressModal from '@/app/components/store/AddressModal';
import dynamic from 'next/dynamic';
const LocationMap = dynamic(() => import('@/app/components/LocationMap'), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-[300px] w-full" />
});
import DeliveryOptionsPanel from '@/app/components/store/checkout/DeliveryOptionsPanel';
import PaymentMethodsPanel from '@/app/components/store/checkout/PaymentMethodsPanel';
import OrderSummaryPanel from '@/app/components/store/checkout/OrderSummaryPanel';
import { MapPin, X } from 'lucide-react';
import { initMercadoPago } from '@mercadopago/sdk-react';

interface PaymentMethod {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    public_key?: string;
}

interface CompanySettings {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
}

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useStoreAuth();
    const router = useRouter();

    // States
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
    const [changeFor, setChangeFor] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingMethods, setIsLoadingMethods] = useState(true);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalTotal, setFinalTotal] = useState(cartTotal);

    // Settings & Map State
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    // Delivery States
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
    const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);

    const isMoney = paymentMethods.find(m => m.id === selectedMethodId)?.slug.includes('money') ||
        paymentMethods.find(m => m.id === selectedMethodId)?.slug.includes('dinheiro');

    const selectedSlug = paymentMethods.find(m => m.id === selectedMethodId)?.slug || '';
    const isPix = selectedSlug.includes('pix');
    const isCard = selectedSlug.includes('card') || selectedSlug.includes('credito');

    const paymentInitialization = useMemo(() => ({
        amount: finalTotal,
        payer: {
            email: user?.email || 'guest@sweetstore.com',
        },
    }), [finalTotal, user]);

    const paymentCustomization = useMemo(() => ({
        paymentMethods: {
            ticket: [],
            bankTransfer: isPix ? ['all'] : [],
            creditCard: isCard ? ['all'] : [],
            debitCard: isCard ? ['all'] : [],
            mercadoPago: []
        },
    }), [isPix, isCard]);

    const [isMercadoPagoInitialized, setIsMercadoPagoInitialized] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const token = jsCookie.get('store_token');
        if (!token) {
            router.push('/signin?redirect=/checkout');
        }
    }, [router]);

    const initializationRef = useMemo(() => ({ current: false }), []);

    useEffect(() => {
        if (!paymentMethods.length) return;

        const mpMethod = paymentMethods.find((m: PaymentMethod) => m.public_key);
        if (mpMethod && mpMethod.public_key) {
            const cleanKey = mpMethod.public_key.trim();
            if (cleanKey && !initializationRef.current) {
                initMercadoPago(cleanKey, { locale: 'pt-BR' });
                initializationRef.current = true;
                setIsMercadoPagoInitialized(true);
            } else if (initializationRef.current) {
                setIsMercadoPagoInitialized(true);
            }
        } else {
            setIsMercadoPagoInitialized(true);
        }
    }, [paymentMethods, initializationRef]);

    // Calculate Delivery Fee
    useEffect(() => {
        const calculateDeliveryFee = async () => {
            if (deliveryType === 'pickup' || !selectedAddressId) {
                setDeliveryFee(0);
                return;
            }

            setIsCalculatingFee(true);
            try {
                const token = jsCookie.get('store_token');
                const res = await fetch(`${apiUrl}/delivery/estimate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ address_id: selectedAddressId })
                });

                if (res.ok) {
                    const data = await res.json();
                    setDeliveryFee(data.data?.fee || 0);
                } else {
                    const err = await res.json();
                    toast.error(err.message || 'Erro ao calcular frete.');
                    setDeliveryFee(0);
                }
            } catch (error) {
                console.error('Error calculating delivery fee', error);
                setDeliveryFee(0);
            } finally {
                setIsCalculatingFee(false);
            }
        };

        calculateDeliveryFee();
    }, [deliveryType, selectedAddressId, apiUrl]);

    // Fetch Payment Methods
    useEffect(() => {
        const fetchMethods = async () => {
            try {
                const res = await fetch(`${apiUrl}/payment-methods`);
                if (res.ok) {
                    const response = await res.json();
                    const activeMethods = response.data.filter((m: PaymentMethod) => m.is_active);
                    setPaymentMethods(activeMethods);

                    // Select first method by default if available and none selected
                    if (activeMethods.length > 0 && !selectedMethodId) {
                        // Prefer Pix if available
                        const pix = activeMethods.find((m: PaymentMethod) => m.slug.includes('pix'));
                        if (pix) setSelectedMethodId(pix.id);
                        else setSelectedMethodId(activeMethods[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching payment methods', error);
                toast.error('Erro ao carregar formas de pagamento');
            } finally {
                setIsLoadingMethods(false);
            }
        };

        if (items.length > 0) {
            fetchMethods();
        }
    }, [apiUrl, items.length]);

    // Fetch Company Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${apiUrl}/settings`);
                if (res.ok) {
                    const response = await res.json();
                    setSettings(response.data);
                }
            } catch (error) {
                console.error('Error fetching settings', error);
            } finally {
                setIsLoadingSettings(false);
            }
        };

        fetchSettings();
    }, [apiUrl]);

    // Fetch Customer Addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return;
            try {
                const token = jsCookie.get('store_token');
                const res = await fetch(`${apiUrl}/addresses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCustomerAddresses(data.data || []);
                    // Auto-select default address
                    const defaultAddr = data.data?.find((a: any) => a.is_default);
                    if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                }
            } catch (error) {
                console.error('Error fetching addresses', error);
            }
        };

        if (user) {
            fetchAddresses();
        }
    }, [apiUrl, user]);

    // Calculate Discount
    useEffect(() => {
        if (!selectedMethodId) return;

        let totalDiscount = 0;

        items.forEach(item => {
            // Find discount for this product and selected payment method
            const discountRule = item.product.discounts?.find(
                d => d.payment_method_id === selectedMethodId
            );

            if (discountRule) {
                const itemTotal = parseFloat(item.product.price) * item.quantity;
                totalDiscount += itemTotal * (Number(discountRule.percentage) / 100);
            }
        });

        setDiscountAmount(totalDiscount);
        setFinalTotal(cartTotal - totalDiscount + deliveryFee);

    }, [selectedMethodId, items, cartTotal, deliveryFee]);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fadeIn">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl opacity-50 grayscale">🛒</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Cesta Vazia</h2>
                <p className="text-gray-400 mb-6">Você precisa adicionar delícias antes de finalizar.</p>
                <Link href="/" className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/10">
                    Voltar para o Cardápio
                </Link>
            </div>
        );
    }

    if (isLoadingMethods) return <LoadingSpinner />;

    const handleBrickSubmit = async (param: any) => {
        const { formData } = param;
        if (!user || !selectedMethodId) return false;

        try {
            const token = jsCookie.get('store_token');
            const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);

            // Format delivery address if needed
            let formattedAddress = null;
            if (deliveryType === 'delivery' && selectedAddressId) {
                const addr = customerAddresses.find(a => a.id === selectedAddressId);
                if (addr) {
                    formattedAddress = {
                        street: addr.street,
                        number: addr.number,
                        neighborhood: addr.neighborhood,
                        city: addr.city,
                        state: addr.state,
                        zip_code: addr.zip_code,
                        complement: addr.complement
                    };
                }
            }

            // 1. Create Order
            const orderData = {
                items: items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    unit_price: parseFloat(item.product.price),
                    observation: item.observation
                })),
                total_amount: finalTotal,
                payment_method: selectedMethod?.slug,
                delivery_type: deliveryType,
                delivery_address: formattedAddress,
                notes: JSON.stringify({
                    change_for: null,
                    pickup_info: deliveryType === 'pickup' ? 'Retirada na loja' : `Entregar em: ${formattedAddress?.street}, ${formattedAddress?.number}`
                })
            };

            const res = await fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.message || 'Erro ao criar pedido.');
                return Promise.reject();
            }

            const response = await res.json();
            const orderId = response.data.id;

            // 2. Process Payment via Backend (passing Brick Data)
            const payRes = await fetch(`${apiUrl}/orders/${orderId}/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    brick_data: {
                        ...formData,
                        description: `Pedido #${orderId} - SweetStore`
                    }
                })
            });

            if (payRes.ok) {
                const payData = await payRes.json();
                clearCart();
                router.push(`/checkout/success?order_id=${orderId}`);
                // Return a pending promise to prevent the Brick from trying to render its own success view (which might be causing SVG errors) while we redirect.
                return new Promise(() => { });
            } else {
                const errPay = await payRes.json();
                toast.error(`Erro: ${errPay.message}`);
                return Promise.reject();
            }

        } catch (e) {
            console.error(e);
            toast.error('Erro de conexão.');
            return Promise.reject();
        }
    };

    // Handle Manual Submission (Direct Money)
    const handleFinishOrder = async () => {
        if (!user || !selectedMethodId) return;
        setIsSubmitting(true);

        const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);

        // Format delivery address if needed
        let formattedAddress = null;
        if (deliveryType === 'delivery' && selectedAddressId) {
            const addr = customerAddresses.find(a => a.id === selectedAddressId);
            if (addr) {
                formattedAddress = {
                    street: addr.street,
                    number: addr.number,
                    neighborhood: addr.neighborhood,
                    city: addr.city,
                    state: addr.state,
                    zip_code: addr.zip_code,
                    complement: addr.complement
                };
            }
        }

        const orderData = {
            items: items.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: parseFloat(item.product.price),
                observation: item.observation
            })),
            total_amount: finalTotal,
            payment_method: selectedMethod?.slug,
            delivery_type: deliveryType,
            delivery_address: formattedAddress,
            notes: JSON.stringify({
                change_for: selectedMethod?.slug === 'money' || selectedMethod?.slug === 'dinheiro' ? changeFor : null,
                pickup_info: deliveryType === 'pickup' ? 'Retirada na loja' : `Entregar em: ${formattedAddress?.street}, ${formattedAddress?.number}`
            })
        };

        try {
            const token = jsCookie.get('store_token');
            const res = await fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const response = await res.json();
                const orderId = response.data.id;

                toast.success("Pedido realizado com sucesso! 🎉");
                clearCart();
                router.push(`/checkout/success?order_id=${orderId}`);

            } else {
                const errorData = await res.json();
                console.error("Order error", errorData);
                toast.error(errorData.message || "Erro ao realizar pedido.");
            }
        } catch (error) {
            console.error("Order error", error);
            toast.error("Erro de conexão.");
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="min-h-screen pb-32 animate-fadeIn" style={{ backgroundColor: 'var(--store-bg)' }}>
            <div className="max-w-6xl mx-auto px-4 pt-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/cart" className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-sm hover:scale-105"
                        style={{
                            backgroundColor: 'var(--store-card)',
                            borderColor: 'var(--store-border)',
                            color: 'var(--store-text-muted)'
                        }}>
                        ←
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--store-text)' }}>Finalizar Pedido</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="md:col-span-2 space-y-6">
                        <DeliveryOptionsPanel
                            deliveryType={deliveryType}
                            setDeliveryType={setDeliveryType}
                            settings={settings}
                            setIsMapOpen={setIsMapOpen}
                            customerAddresses={customerAddresses}
                            selectedAddressId={selectedAddressId}
                            setSelectedAddressId={setSelectedAddressId}
                            setIsAddressModalOpen={setIsAddressModalOpen}
                        />

                        <PaymentMethodsPanel
                            paymentMethods={paymentMethods}
                            selectedMethodId={selectedMethodId ? String(selectedMethodId) : ''}
                            setSelectedMethodId={(id: string) => setSelectedMethodId(Number(id))}
                            items={items}
                            changeFor={changeFor}
                            setChangeFor={setChangeFor}
                            isMoney={isMoney || false}
                            isSubmitting={isSubmitting}
                            handleFinishOrder={handleFinishOrder}
                            isMercadoPagoInitialized={isMercadoPagoInitialized || false}
                            isPix={isPix || false}
                            isCard={isCard || false}
                            paymentInitialization={paymentInitialization}
                            paymentCustomization={paymentCustomization}
                            handleBrickSubmit={async (formData) => { await handleBrickSubmit(formData); }}
                        />
                    </div>

                    {/* Right Column - Summary */}
                    <div className="md:col-span-1">
                        <OrderSummaryPanel
                            items={items}
                            selectedMethodId={selectedMethodId ? String(selectedMethodId) : ''}
                            cartTotal={cartTotal}
                            discountAmount={discountAmount}
                            deliveryFee={deliveryFee}
                            finalTotal={finalTotal}
                            deliveryType={deliveryType as 'pickup' | 'delivery'}
                            isCalculatingFee={isCalculatingFee}
                        />
                    </div>
                </div>

                {/* Map Modal */}
                {
                    isMapOpen && settings && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn relative">
                                <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
                                    <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--store-text)' }}>
                                        <MapPin className="text-red-500" />
                                        Localização da Loja
                                    </h3>
                                    <button
                                        onClick={() => setIsMapOpen(false)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-950">
                                    <LocationMap
                                        lat={Number(settings.latitude)}
                                        lng={Number(settings.longitude)}
                                        readOnly={true}
                                    />
                                    <div className="mt-4 text-center">
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${settings.latitude},${settings.longitude}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                                            style={{ backgroundColor: 'var(--store-primary)', color: 'var(--store-primary-fg)' }}
                                        >
                                            Abrir no Google Maps 🗺️
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Address Modal */}
                <AddressModal
                    isOpen={isAddressModalOpen}
                    onClose={() => setIsAddressModalOpen(false)}
                    onSave={() => {
                        // Refresh addresses
                        const fetchAddresses = async () => {
                            const token = jsCookie.get('store_token');
                            if (!token) return;
                            try {
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/addresses`, {
                                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                                });
                                if (res.ok) {
                                    const data = await res.json();
                                    setCustomerAddresses(data.data || []);
                                }
                            } catch (e) {
                                console.error("Error fetching addresses", e);
                            }
                        };
                        fetchAddresses();
                    }}
                />
            </div>
        </div >
    );
}
