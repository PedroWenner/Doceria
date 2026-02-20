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
import { MapPin, Plus, Home, Briefcase, X } from 'lucide-react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

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

    // Derived State & Memoization (Moved up to avoid Hook Order errors)
    const isMoney = paymentMethods.find(m => m.id === selectedMethodId)?.slug.includes('money') ||
        paymentMethods.find(m => m.id === selectedMethodId)?.slug.includes('dinheiro');

    const selectedSlug = paymentMethods.find(m => m.id === selectedMethodId)?.slug || '';
    const isPix = selectedSlug.includes('pix');
    const isCard = selectedSlug.includes('card') || selectedSlug.includes('credito');

    const paymentInitialization = useMemo(() => ({
        amount: finalTotal, // Updates only when total changes
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

    // Protect Route
    useEffect(() => {
        const token = jsCookie.get('store_token');
        if (!token) {
            router.push('/signin?redirect=/checkout');
        }
    }, [router]);

    // Initialize MP - dedicated effect
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
        setFinalTotal(cartTotal - totalDiscount);

    }, [selectedMethodId, items, cartTotal]);

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

                        {/* 1. Delivery Options */}
                        <section className="p-6 rounded-xl shadow-sm border"
                            style={{
                                backgroundColor: 'var(--store-card)',
                                borderColor: 'var(--store-border)'
                            }}>
                            <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--store-text)' }}>Opções de Entrega</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    onClick={() => setDeliveryType('pickup')}
                                    className={`flex p-3 rounded-lg border-2 font-bold text-sm items-center justify-center gap-2 transition-colors ${deliveryType === 'pickup' ? 'opacity-100 shadow-sm' : 'opacity-60'}`}
                                    style={{ borderColor: deliveryType === 'pickup' ? 'var(--store-text)' : 'var(--store-border)', backgroundColor: 'transparent', color: 'var(--store-text)' }}
                                >
                                    🏪 Retirar
                                </button>
                                <button
                                    onClick={() => setDeliveryType('delivery')}
                                    className={`flex p-3 rounded-lg border-2 font-bold text-sm items-center justify-center gap-2 transition-colors ${deliveryType === 'delivery' ? 'opacity-100 shadow-sm' : 'opacity-60'}`}
                                    style={{ borderColor: deliveryType === 'delivery' ? 'var(--store-text)' : 'var(--store-border)', backgroundColor: 'transparent', color: 'var(--store-text)' }}
                                >
                                    🛵 Entrega
                                </button>
                            </div>

                            {deliveryType === 'pickup' ? (
                                <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--store-bg)' }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl grayscale bg-white shadow-sm border" style={{ borderColor: 'var(--store-border)' }}>
                                        🏪
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--store-text)' }}>Retirar no local</h4>
                                        <div className="text-xs leading-relaxed" style={{ color: 'var(--store-text-muted)' }}>
                                            {settings ? (
                                                <>
                                                    {settings.street || 'Endereço não configurado'}, {settings.number}<br />
                                                    {settings.neighborhood && <>{settings.neighborhood},</>} {settings.city}
                                                </>
                                            ) : (
                                                <span className="animate-pulse bg-gray-200 h-3 w-24 block rounded"></span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-sm" style={{ color: 'var(--store-text)' }}>Seus Endereços</h4>
                                        <button onClick={() => setIsAddressModalOpen(true)} className="text-xs font-bold transition-opacity hover:opacity-80 flex items-center gap-1" style={{ color: 'var(--store-primary)' }}>
                                            <Plus size={14} /> Novo Endereço
                                        </button>
                                    </div>

                                    {customerAddresses.length === 0 ? (
                                        <div className="text-center p-6 border border-dashed rounded-xl" style={{ borderColor: 'var(--store-border)' }}>
                                            <p className="text-sm mb-3" style={{ color: 'var(--store-text-muted)' }}>Nenhum endereço salvo.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {customerAddresses.map(address => (
                                                <label key={address.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAddressId === address.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} style={{ borderColor: selectedAddressId === address.id ? 'var(--store-text)' : 'var(--store-border)', backgroundColor: selectedAddressId === address.id ? 'var(--store-bg)' : 'transparent' }}>
                                                    <input
                                                        type="radio"
                                                        name="address"
                                                        className="mt-1 flex-shrink-0 cursor-pointer"
                                                        checked={selectedAddressId === address.id}
                                                        onChange={() => setSelectedAddressId(address.id)}
                                                        style={{ accentColor: 'var(--store-primary)' }}
                                                    />
                                                    <div>
                                                        <span className="font-bold text-sm block flex items-center gap-1" style={{ color: 'var(--store-text)' }}>
                                                            {address.name.toLowerCase().includes('casa') ? <Home size={12} /> : (address.name.toLowerCase().includes('trabalho') ? <Briefcase size={12} /> : <MapPin size={12} />)}
                                                            {address.name}
                                                        </span>
                                                        <span className="text-xs block mt-1" style={{ color: 'var(--store-text-muted)' }}>{address.street}, {address.number} {address.complement ? `- ${address.complement}` : ''}</span>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 mt-1 block" style={{ color: 'var(--store-text-muted)' }}>{address.neighborhood}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* 2. Payment Method */}
                        <section className="p-6 rounded-xl shadow-sm border"
                            style={{
                                backgroundColor: 'var(--store-card)',
                                borderColor: 'var(--store-border)'
                            }}>
                            <h3 className="font-bold text-lg mb-5 flex items-center gap-2" style={{ color: 'var(--store-text)' }}>
                                Pagamento
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {paymentMethods.map(method => {
                                    // Calculate discount just to show badge
                                    const hasDiscount = items.some(item =>
                                        item.product.discounts?.some(d => d.payment_method_id === method.id)
                                    );

                                    return (
                                        <label key={method.id} className={`relative group p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2`}
                                            style={{
                                                borderColor: selectedMethodId === method.id ? 'var(--store-text)' : 'var(--store-border)',
                                                backgroundColor: selectedMethodId === method.id ? 'var(--store-bg)' : 'transparent'
                                            }}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                className="sr-only"
                                                checked={selectedMethodId === method.id}
                                                onChange={() => setSelectedMethodId(method.id)}
                                            />
                                            <div className="flex justify-between items-center">
                                                <span className="text-2xl grayscale">
                                                    {method.slug.includes('pix') ? '💠' :
                                                        method.slug.includes('money') || method.slug.includes('dinheiro') ? '💵' :
                                                            method.slug.includes('card') || method.slug.includes('cartao') ? '💳' : '💰'}
                                                </span>
                                                {selectedMethodId === method.id && (
                                                    <div className="w-4 h-4 rounded-full flex items-center justify-center"
                                                        style={{ backgroundColor: 'var(--store-text)' }}>
                                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-bold block" style={{ color: selectedMethodId === method.id ? 'var(--store-text)' : 'var(--store-text-muted)' }}>{method.name}</span>
                                                <span className="text-xs font-medium" style={{ color: 'var(--store-text-muted)' }}>{method.slug.includes('pix') ? 'Aprovação imediata' : 'Pagar na retirada'}</span>
                                            </div>

                                            {/* Dynamic Discount Badge Check */}
                                            {hasDiscount && (
                                                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full border"
                                                    style={{
                                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                        color: 'rgb(21, 128, 61)',
                                                        borderColor: 'rgba(34, 197, 94, 0.2)'
                                                    }}>
                                                    DESCONTOS
                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>

                            {/* Change Input Animation */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${(paymentMethods.find(m => m.id === selectedMethodId)?.slug === 'money' ||
                                paymentMethods.find(m => m.id === selectedMethodId)?.slug === 'dinheiro')
                                ? 'max-h-32 opacity-100 mt-5' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 rounded-xl border"
                                    style={{
                                        backgroundColor: 'var(--store-bg)',
                                        borderColor: 'var(--store-border)'
                                    }}>
                                    <label className="text-xs font-bold mb-2 block uppercase tracking-wide" style={{ color: 'var(--store-text)' }}>Troco para quanto?</label>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg" style={{ color: 'var(--store-text-muted)' }}>R$</span>
                                        <input
                                            type="text"
                                            placeholder="Ex: 50,00"
                                            className="flex-1 border rounded-lg p-3 font-bold outline-none transition-all placeholder:text-gray-300 focus:ring-1"
                                            style={{
                                                backgroundColor: 'var(--store-card)',
                                                borderColor: 'var(--store-border)',
                                                color: 'var(--store-text)',
                                                '--tw-ring-color': 'var(--store-text)'
                                            } as React.CSSProperties}
                                            value={changeFor}
                                            onChange={(e) => setChangeFor(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="my-6 border-t border-dashed" style={{ borderColor: 'var(--store-border)' }}></div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                                    <span>Subtotal</span>
                                    <span className="font-medium">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                                    <span>Descontos</span>
                                    {discountAmount > 0 ? (
                                        <span className="font-bold" style={{ color: 'rgb(22, 163, 74)' }}>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                                    ) : (
                                        <span className="text-gray-300">-</span>
                                    )}
                                </div>
                                {deliveryType === 'delivery' && (
                                    <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                                        <span>Taxa de Entrega</span>
                                        {isCalculatingFee ? (
                                            <span className="animate-pulse">Calculando...</span>
                                        ) : (
                                            <span className="font-bold">
                                                {deliveryFee > 0 ? `+ R$ ${deliveryFee.toFixed(2).replace('.', ',')}` : 'Grátis'}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-extrabold mt-6 pt-4 border-t"
                                    style={{ color: 'var(--store-text)', borderColor: 'var(--store-border)' }}>
                                    <span>Total</span>
                                    <span>R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            {/* Conditional Button: Money uses normal button, Online uses Brick */}
                            {isMoney ? (
                                <button
                                    onClick={handleFinishOrder}
                                    disabled={isSubmitting || !selectedMethodId}
                                    className={`w-full py-4 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition-all mt-8 group hover:opacity-90 active:scale-[0.98]
                                        ${(isSubmitting || !selectedMethodId) ? 'opacity-70 cursor-not-allowed' : ''}
                                    `}
                                    style={{
                                        backgroundColor: 'var(--store-primary)',
                                        color: 'var(--store-primary-fg)',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin text-xl">🍩</span>
                                            <span>Processando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Confirmar Pedido</span>
                                            <span>➜</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="mt-8">
                                    {isMercadoPagoInitialized && (isPix || isCard) ? (
                                        <div key={selectedMethodId} className="min-h-[200px]">
                                            <Payment
                                                initialization={paymentInitialization}
                                                customization={paymentCustomization}
                                                onSubmit={handleBrickSubmit}
                                                onError={(error) => {
                                                    console.error('Brick error:', error);
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3 border-2 border-dashed border-slate-200 rounded-xl">
                                            <span className="animate-pulse text-2xl">⏳</span>
                                            <span className="text-sm font-medium">Carregando gateway seguro...</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="text-center text-[10px] mt-4 leading-relaxed" style={{ color: 'var(--store-text-muted)' }}>
                                Ao confirmar, você concorda com nossos <br /><Link href="#" className="underline hover:text-gray-900">termos de serviço</Link>.
                            </p>
                        </section>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="md:col-span-1">
                        <div className="p-6 rounded-xl shadow-lg border sticky top-24"
                            style={{
                                backgroundColor: 'var(--store-card)',
                                borderColor: 'var(--store-border)',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}>
                            <h3 className="font-bold text-lg mb-6 flex items-center justify-between border-b pb-4"
                                style={{ color: 'var(--store-text)', borderColor: 'var(--store-border)' }}>
                                <span>Resumo do Pedido</span>
                                <span className="text-xs font-bold px-2 py-1 rounded-md"
                                    style={{ backgroundColor: 'var(--store-bg)', color: 'var(--store-text-muted)' }}>{items.length} itens</span>
                            </h3>

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map(item => {
                                    const discountRule = selectedMethodId ? item.product.discounts?.find(d => d.payment_method_id === selectedMethodId) : null;
                                    const hasDiscount = !!discountRule;
                                    const itemPrice = parseFloat(item.product.price);
                                    const discountedPrice = hasDiscount ? itemPrice * (1 - Number(discountRule.percentage) / 100) : itemPrice;

                                    return (
                                        <div key={item.product.id} className="flex justify-between items-start text-sm group">
                                            <div className="flex gap-3">
                                                <span className="font-bold px-2 py-0.5 rounded text-xs h-fit"
                                                    style={{ backgroundColor: 'var(--store-bg)', color: 'var(--store-text)' }}>{item.quantity}x</span>
                                                <div className="flex flex-col">
                                                    <span className="w-32 truncate" style={{ color: 'var(--store-text-muted)' }}>{item.product.name}</span>
                                                    {hasDiscount && (
                                                        <span className="text-[10px] text-green-600 font-bold">{Number(discountRule.percentage)}% OFF</span>
                                                    )}
                                                    {item.observation && (
                                                        <span className="text-[10px] italic mt-0.5 opacity-70" style={{ color: 'var(--store-text-muted)' }}>"{item.observation}"</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {hasDiscount && (
                                                    <span className="block text-[10px] line-through text-red-400">R$ {(itemPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                                                )}
                                                <span className="font-medium whitespace-nowrap" style={{ color: 'var(--store-text)' }}>R$ {(discountedPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="my-6 border-t border-dashed" style={{ borderColor: 'var(--store-border)' }}></div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                                    <span>Subtotal</span>
                                    <span className="font-medium">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm" style={{ color: 'var(--store-text-muted)' }}>
                                    <span>Descontos</span>
                                    {discountAmount > 0 ? (
                                        <span className="font-bold" style={{ color: 'rgb(22, 163, 74)' }}>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                                    ) : (
                                        <span className="text-gray-300">-</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-xl font-extrabold mt-6 pt-4 border-t"
                                    style={{ color: 'var(--store-text)', borderColor: 'var(--store-border)' }}>
                                    <span>Total</span>
                                    <span>R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>
                        </div>
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
            </div>
        </div >
    );
}
