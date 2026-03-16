import React from 'react';
import type { Field } from '../types';

interface Props {
  fields: Field[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const FieldSelector: React.FC<Props> = ({ fields, selectedId, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-bold text-gray-600 mb-3">圃場選択</h2>
      <div className="flex flex-wrap gap-2">
        {fields.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedId === f.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌿 {f.name}
          </button>
        ))}
      </div>
    </div>
  );
};
