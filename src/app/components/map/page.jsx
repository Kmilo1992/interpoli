"use client";

import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { db } from "../../../service/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import Spinner from "../spinner/Spinner";

const containerStyle = { width: "100%", height: "100%" };

const priorityColors = {
  Alta: "red",
  Media: "orange",
  Baja: "yellow",
};

const mapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
];

const fallbackCenter = { lat: 4.711, lng: -74.0721 };

export default function Map() {
  const pathname = usePathname();
  const router = useRouter();
  const mapRef = useRef(null);

  const [map, setMap] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [center, setCenter] = useState(fallbackCenter);
  const [activeAlert, setActiveAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const selectedId = React.useMemo(() => {
    if (!pathname) return null;
    const m = pathname.match(/\/detail\/([^/]+)/);
    return m ? m[1] : null;
  }, [pathname]);

  useEffect(() => {
    const handler = (e) => {
      const found = alerts.find((a) => a.id === e.detail);
      if (found && found.coordinates && map) {
        map.panTo(found.coordinates);
        map.setZoom(15);
        setActiveAlert(found);
      }
    };

    window.addEventListener("alert-selected", handler);
    return () => window.removeEventListener("alert-selected", handler);
  }, [alerts, map]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        console.warn("No se pudo obtener la ubicación, usando fallback.");
      }
    );
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "alerts"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAlerts(data);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedId || !map || alerts.length === 0) {
      if (!selectedId) setActiveAlert(null);
      return;
    }
    const found = alerts.find((a) => a.id === selectedId);
    if (found && found.coordinates) {
      const pos = { lat: found.coordinates.lat, lng: found.coordinates.lng };
      map.panTo(pos);
      map.setZoom(15);
      setActiveAlert(found);
    }
  }, [selectedId, alerts, map]);

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
    mapRef.current = mapInstance;
  };

  const handleMarkerClick = (alert) => {
    setActiveAlert(alert);
    if (map && alert.coordinates) {
      map.panTo({ lat: alert.coordinates.lat, lng: alert.coordinates.lng });
      map.setZoom(15);
    }
    router.push(`/detail/${alert.id}`);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <LoadScript googleMapsApiKey={mapApiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={handleMapLoad}
        options={{ styles: mapStyles, streetViewControl: false }}
      >
        {/* Markers */}
        {alerts.map((alert) =>
          alert.coordinates ? (
            <Marker
              key={alert.id}
              position={{
                lat: alert.coordinates.lat,
                lng: alert.coordinates.lng,
              }}
              onClick={() => handleMarkerClick(alert)}
              icon={
                typeof window !== "undefined" && window.google
                  ? {
                      path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                      fillColor: priorityColors[alert.priority] || "gray",
                      fillOpacity: 1,
                      strokeWeight: 1,
                      scale: 6,
                    }
                  : undefined
              }
            />
          ) : null
        )}
        {center && (
          <Marker
            position={center}
            icon={{
              path: window.google?.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}
