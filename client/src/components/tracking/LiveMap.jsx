import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Phone, MessageSquare, Navigation, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { getSocket } from '../../services/socket.js';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';

// Custom Map Marker Icons using Leaflet divIcon
const createCustomIcon = (bgColor, iconText) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background-color: ${bgColor};
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 3px solid white;
      font-size: 16px;
      font-weight: bold;
    ">${iconText}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const providerIcon = createCustomIcon('#2563eb', '🛠️');
const destinationIcon = createCustomIcon('#059669', '📍');

const LiveMap = ({ bookingId, initialData, onCallProvider, onChatProvider }) => {
  const [providerLocation, setProviderLocation] = useState({
    lat: initialData?.tracking?.latitude || 28.6220,
    lng: initialData?.tracking?.longitude || 77.3550,
  });

  const [customerLocation] = useState({
    lat: initialData?.booking?.address?.latitude || 28.6280,
    lng: initialData?.booking?.address?.longitude || 77.3649,
  });

  const [distanceKm, setDistanceKm] = useState(
    initialData?.tracking?.distanceRemainingKm || 2.1
  );
  const [etaMinutes, setEtaMinutes] = useState(
    initialData?.tracking?.estimatedArrivalMinutes || 8
  );
  const [isArrived, setIsArrived] = useState(
    initialData?.booking?.status === 'arrived'
  );
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const socket = getSocket();
    socket.emit('booking:join', { bookingId });

    socket.on('tracking:location-received', (data) => {
      if (data.bookingId === bookingId) {
        setProviderLocation({ lat: data.latitude, lng: data.longitude });
        if (data.distanceRemainingKm !== undefined) setDistanceKm(data.distanceRemainingKm);
        if (data.estimatedArrivalMinutes !== undefined) setEtaMinutes(data.estimatedArrivalMinutes);
        setLastUpdated(new Date());
      }
    });

    socket.on('tracking:arrived', () => {
      setIsArrived(true);
      setEtaMinutes(0);
      setDistanceKm(0);
    });

    return () => {
      socket.off('tracking:location-received');
      socket.off('tracking:arrived');
    };
  }, [bookingId]);

  const polylineCoords = [
    [providerLocation.lat, providerLocation.lng],
    [customerLocation.lat, customerLocation.lng],
  ];

  const provider = initialData?.booking?.provider;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-premium overflow-hidden">
      {/* Live Status Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center font-bold text-brand-700 text-sm overflow-hidden">
            {provider?.userId?.profileImage ? (
              <img src={provider.userId.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              provider?.businessName?.charAt(0) || 'P'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">{provider?.businessName || 'Service Provider'}</h3>
              <Badge variant="verified" showVerifiedIcon>Verified</Badge>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Technician: {provider?.userId?.name || 'Assigned Pro'}</span>
              <span>•</span>
              <span>⭐ {provider?.rating || '5.0'}</span>
            </p>
          </div>
        </div>

        {/* Quick Contact Buttons */}
        <div className="flex items-center gap-2">
          {onCallProvider && (
            <Button variant="outline" size="sm" icon={Phone} onClick={onCallProvider}>
              Call Provider
            </Button>
          )}
          {onChatProvider && (
            <Button variant="primary" size="sm" icon={MessageSquare} onClick={onChatProvider}>
              Live Chat
            </Button>
          )}
        </div>
      </div>

      {/* ETA & Metrics Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-white text-center py-3">
        <div className="px-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Estimated Arrival</p>
          <p className="text-lg font-extrabold text-brand-600 mt-0.5 flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-brand-500" />
            {isArrived ? 'Arrived!' : `~${etaMinutes} mins`}
          </p>
        </div>
        <div className="px-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Distance Remaining</p>
          <p className="text-lg font-extrabold text-slate-800 mt-0.5 flex items-center justify-center gap-1">
            <Navigation className="w-4 h-4 text-slate-500" />
            {isArrived ? 'At Doorstep' : `${distanceKm} km`}
          </p>
        </div>
        <div className="px-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</p>
          <p className="text-sm font-bold text-emerald-600 mt-1">
            {isArrived ? 'Arrived' : 'En Route to Site'}
          </p>
        </div>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="h-[400px] w-full relative">
        <MapContainer
          center={[customerLocation.lat, customerLocation.lng]}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Provider Marker */}
          <Marker position={[providerLocation.lat, providerLocation.lng]} icon={providerIcon}>
            <Popup>
              <div className="text-xs">
                <strong>{provider?.businessName}</strong>
                <p>On the way with tools and equipment</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker position={[customerLocation.lat, customerLocation.lng]} icon={destinationIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Your Destination</strong>
                <p>{initialData?.booking?.address?.street || 'Customer Address'}</p>
              </div>
            </Popup>
          </Marker>

          {/* Route path line */}
          <Polyline positions={polylineCoords} color="#2563eb" weight={4} dashArray="6, 8" />
        </MapContainer>

        {/* Live Tracking Active Pill Indicator */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Live GPS Stream Active</span>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>LocalTrust SafeArrival™: Real-time location is shared strictly during active journey.</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Updated: {lastUpdated.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default LiveMap;
