'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Loader2, MapPin } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface LocationMapProps {
    lat: number;
    lng: number;
    onChange?: (lat: number, lng: number) => void;
    readOnly?: boolean;
}

// Default center (São Paulo) if no coordinates provided
const defaultCenter = {
    lat: -23.550520,
    lng: -46.633308
};

const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
};

const containerStyle = {
    width: '100%',
    height: '400px'
};

export default function LocationMap({ lat, lng, onChange, readOnly = false }: LocationMapProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [center, setCenter] = useState(defaultCenter);
    const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    });

    useEffect(() => {
        if (lat && lng) {
            const pos = { lat, lng };
            setCenter(pos);
            setMarkerPos(pos);
        }
    }, [lat, lng]);

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (readOnly) return;
        if (e.latLng && onChange) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            setMarkerPos({ lat: newLat, lng: newLng });
            onChange(newLat, newLng);
        }
    }, [onChange, readOnly]);

    const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
        if (readOnly) return;
        if (e.latLng && onChange) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            setMarkerPos({ lat: newLat, lng: newLng });
            onChange(newLat, newLng);
        }
    }, [onChange, readOnly]);


    if (loadError) {
        return (
            <div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center border border-slate-200 dark:border-slate-700">
                <MapPin className="text-slate-400 mb-2" size={32} />
                <p className="text-slate-600 dark:text-slate-300 font-medium">Erro ao carregar o mapa</p>
                <p className="text-xs text-slate-500 mt-1">Verifique a chave de API nas configurações ou se o serviço está habilitado.</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={15}
                onClick={handleMapClick}
                options={{
                    ...mapOptions,
                    styles: isDark ? darkMapStyle : undefined
                }}
            >
                {markerPos && (
                    <Marker
                        position={markerPos}
                        draggable={!readOnly}
                        onDragEnd={handleMarkerDragEnd}
                        animation={google.maps.Animation.DROP}
                    />
                )}
            </GoogleMap>
            <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 max-w-xs transition-colors">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Localização Selecionada</p>
                {markerPos ? (
                    <div className="font-mono text-sm text-slate-900 dark:text-slate-100">
                        {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 italic text-red-500">Sem coordenadas</p>
                )}
            </div>
        </div>
    );
}

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
];
