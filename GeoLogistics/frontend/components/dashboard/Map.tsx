'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
    lat: number;
    lng: number;
}

interface MapProps {
    center: [number, number];
    zoom?: number;
    orders?: any[]; // For now using any, will define types properly later
}

const Map = ({ center, zoom = 13, orders = [] }: MapProps) => {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render Orders Markers */}
            {orders.map((order) => (
                <Marker
                    key={order.id}
                    position={[order.pickup_lat, order.pickup_lon]}
                >
                    <Popup>
                        <strong>Pickup:</strong> {order.pickup_address || 'Address not found'}
                        <br />
                        Price: R$ {order.price}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;
