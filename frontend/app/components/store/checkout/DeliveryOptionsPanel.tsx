import React from 'react';
import { MapPin, Plus, Home, Briefcase } from 'lucide-react';

interface DeliveryOptionsPanelProps {
    deliveryType: 'pickup' | 'delivery';
    setDeliveryType: (type: 'pickup' | 'delivery') => void;
    settings: any;
    setIsMapOpen: (open: boolean) => void;
    customerAddresses: any[];
    selectedAddressId: number | null;
    setSelectedAddressId: (id: number) => void;
    setIsAddressModalOpen: (open: boolean) => void;
}

export default function DeliveryOptionsPanel({
    deliveryType,
    setDeliveryType,
    settings,
    setIsMapOpen,
    customerAddresses,
    selectedAddressId,
    setSelectedAddressId,
    setIsAddressModalOpen
}: DeliveryOptionsPanelProps) {
    return (
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
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsMapOpen(true)}
                                disabled={!settings?.latitude || !settings.longitude}
                                className="text-xs font-bold hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                                style={{ color: 'var(--store-text)' }}
                                title={(!settings?.latitude || !settings.longitude) ? 'Localização não cadastrada' : 'Ver localização exata'}
                            >
                                <MapPin size={12} className="group-hover:scale-110 transition-transform" />
                                {(!settings?.latitude || !settings.longitude) ? 'Mapa indisponível' : 'Ver no mapa ↗'}
                            </button>
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
    );
}
