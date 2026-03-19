import React from 'react';
import type { Field } from '../types';

interface Props {
  fields: Field[];
  selectedField: Field | null;
  onSelectField: (id: string) => void;
}

export const FieldMap: React.FC<Props> = ({ fields, selectedField }) => {
  const field = selectedField ?? fields[0];
  if (!field) return null;

  // Google Maps embed（APIキー不要）
  const embedUrl = `https://maps.google.com/maps?q=${field.lat},${field.lon}&z=15&output=embed&hl=ja`;
  const mapsUrl = `https://www.google.com/maps?q=${field.lat},${field.lon}&z=15`;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-600">📍 圃場マップ</h2>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Googleマップで開く ↗
        </a>
      </div>
      {/* 圃場リスト（簡易） */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-b bg-gray-50">
        {fields.map((f) => (
          <span
            key={f.id}
            className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${
              f.id === field.id
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            📌 {f.name}
          </span>
        ))}
      </div>
      <iframe
        src={embedUrl}
        width="100%"
        height="240"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`${field.name}の地図`}
      />
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t">
        {field.name}｜標高 {field.elevation}m｜{field.location}
      </div>
    </div>
  );
};
