'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix Leaflet default icon issue in Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface Driver {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    status: string;
    type?: 'OWN_FLEET' | 'FREELANCER';
}

export default function Map({ drivers }: { drivers: Driver[] }) {
    // Default to Sao Paulo center if no drivers
    const center: [number, number] = [-23.550520, -46.633309];

    return (
        <MapContainer center={center} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {drivers.map((driver) => (
                driver.latitude && driver.longitude ? (
                    <Marker
                        key={driver.id}
                        position={[driver.latitude, driver.longitude]}
                        icon={icon}
                    >
                        <Popup>
                            <strong>{driver.name}</strong><br />
                            <span className="text-xs text-zinc-500">{driver.type === 'OWN_FLEET' ? 'Frota Própria' : 'Parceiro'}</span><br />
                            Status: {driver.status}
                        </Popup>
                    </Marker>
                ) : null
            ))}
        </MapContainer>
    );
}
