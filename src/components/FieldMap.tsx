import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Field } from '../types';

// Fix default marker icon
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Props {
  fields: Field[];
  selectedField: Field | null;
  onSelectField: (id: string) => void;
}

export const FieldMap: React.FC<Props> = ({ fields, selectedField, onSelectField }) => {
  const center: [number, number] = selectedField
    ? [selectedField.lat, selectedField.lon]
    : [34.9, 133.04];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-bold text-gray-600">📍 圃場マップ</h2>
      </div>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '280px', width: '100%' }}
        key={selectedField?.id}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fields.map((f) => (
          <Marker
            key={f.id}
            position={[f.lat, f.lon]}
            eventHandlers={{ click: () => onSelectField(f.id) }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{f.name}</strong><br />
                標高: {f.elevation}m | 斜面: {f.aspect}<br />
                {f.location}
              </div>
            </Popup>
          </Marker>
        ))}
        {selectedField && (
          <Circle
            center={[selectedField.lat, selectedField.lon]}
            radius={300}
            pathOptions={{ color: '#2e7d32', fillColor: '#66bb6a', fillOpacity: 0.2 }}
          />
        )}
      </MapContainer>
    </div>
  );
};
