import React, { useEffect, useRef } from 'react';

const MapDisplay = ({ coordinates }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  useEffect(() => {
    if (!coordinates || !window.google) return;

    // Parse coordinates (expected "lat,lng" or "Lat: x, Lng: y")
    let lat, lng;
    try {
      if (typeof coordinates === 'string') {
        const parts = coordinates.split(',').map(p => parseFloat(p.replace(/[^\d.-]/g, '')));
        lat = parts[0];
        lng = parts[1];
      }
    } catch (e) {
      console.error("Failed to parse coordinates", coordinates);
      return;
    }

    if (isNaN(lat) || isNaN(lng)) return;

    const mapOptions = {
      center: { lat, lng },
      zoom: 15,
      mapId: 'DEMO_MAP_ID', // For advanced markers if needed
      disableDefaultUI: true,
      zoomControl: true,
    };

    if (!googleMapRef.current) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
    } else {
      googleMapRef.current.setCenter({ lat, lng });
    }

    new window.google.maps.Marker({
      position: { lat, lng },
      map: googleMapRef.current,
      title: "Incident Location",
      animation: window.google.maps.Animation.DROP
    });

  }, [coordinates]);

  if (!coordinates) return null;

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden shadow-inner border border-slate-200 mt-4 relative">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 shadow-sm border border-slate-200 z-10 uppercase tracking-tighter">
        Verified Satellite Lock
      </div>
    </div>
  );
};

export default MapDisplay;
