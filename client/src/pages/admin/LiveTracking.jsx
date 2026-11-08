import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Clock, ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';

const createMarkerIcon = (color, emoji) => {
  return L.divIcon({
    className: 'admin-tracking-marker',
    html: `<div style="
      background-color: ${color};
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      font-size: 14px;
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const journeyIcon = createMarkerIcon('#2563eb', '🚗');

const AdminLiveTracking = () => {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/live-tracking')
      .then((res) => {
        if (res?.data) setJourneys(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Active Journey GPS Monitor</h1>
          <p className="text-xs text-slate-500">
            Real-time compliance monitoring of all active technician trips on the road.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          {journeys.length} Active En Route
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden h-[500px]">
          <MapContainer
            center={[28.6280, 77.3649]}
            zoom={12}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {journeys.map((j) => (
              <Marker key={j._id} position={[j.latitude, j.longitude]} icon={journeyIcon}>
                <Popup>
                  <div className="text-xs space-y-1">
                    <strong>{j.providerId?.businessName}</strong>
                    <p>En route to: {j.customerId?.name}</p>
                    <p>ETA: ~{j.estimatedArrivalMinutes} mins ({j.distanceRemainingKm} km remaining)</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Active Journeys Sidebar List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-5 space-y-4 flex flex-col h-[500px]">
          <h3 className="font-bold text-slate-900 text-sm">Active En-Route Missions</h3>

          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading journeys...</div>
            ) : journeys.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active journeys right now. Technicians broadcast GPS strictly while en route to accepted jobs.
              </div>
            ) : (
              journeys.map((j) => (
                <div key={j._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{j.providerId?.businessName}</span>
                    <Badge variant="teal">En Route</Badge>
                  </div>
                  <p className="text-slate-500">
                    Client: {j.customerId?.name} ({j.customerId?.phone})
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                    <span>ETA: ~{j.estimatedArrivalMinutes} mins</span>
                    <span>Distance: {j.distanceRemainingKm} km</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveTracking;
