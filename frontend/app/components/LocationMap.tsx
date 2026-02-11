'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Loader2, MapPin } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

// Fix for default Leaflet markers in Next.js/Webpack
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapProps {
    lat: number;
    lng: number;
    onChange?: (lat: number, lng: number) => void;
    readOnly?: boolean;
}

// Default center (São Paulo)
const defaultCenter = {
    lat: -23.550520,
    lng: -46.633308
};

// Component to handle map clicks and drag events
function LocationMarker({
    position,
    onChange,
    readOnly
}: {
    position: { lat: number, lng: number } | null,
    onChange?: (lat: number, lng: number) => void,
    readOnly: boolean
}) {
    const map = useMap();

    // Fly to position when it changes programmatically
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    useMapEvents({
        click(e) {
            if (readOnly || !onChange) return;
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend(e: any) {
                if (readOnly || !onChange) return;
                const marker = e.target;
                if (marker != null) {
                    const pos = marker.getLatLng();
                    onChange(pos.lat, pos.lng);
                }
            },
        }),
        [onChange, readOnly],
    );

    return position === null ? null : (
        <Marker
            position={position}
            draggable={!readOnly}
            eventHandlers={eventHandlers}
        />
    );
}

// Map Updater to handle external prop changes (initial load)
function MapUpdater({ center }: { center: { lat: number, lng: number } }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 15);
    }, [center, map]);
    return null;
}

export default function LocationMap({ lat, lng, onChange, readOnly = false }: LocationMapProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Ensure we run only on client to avoid "window is not defined"
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const center = useMemo(() => {
        if (lat && lng) return { lat, lng };
        return defaultCenter;
    }, [lat, lng]);

    if (!mounted) {
        return (
            <div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm z-0">
            <MapContainer
                center={center}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={isDark
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    }
                />
                <LocationMarker
                    position={lat && lng ? { lat, lng } : null}
                    onChange={onChange}
                    readOnly={readOnly}
                />
                <MapUpdater center={center} />
            </MapContainer>

            <div className="absolute top-4 left-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 max-w-xs transition-colors z-[1000]">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Localização Selecionada</p>
                {lat && lng ? (
                    <div className="font-mono text-sm text-slate-900 dark:text-slate-100">
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 italic text-red-500">Sem coordenadas</p>
                )}
            </div>
        </div>
    );
}
