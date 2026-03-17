import React from 'react';
import type { Field } from '../types';

interface Props {
  fields: Field[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddField: () => void;
  onDeleteField?: (id: string) => void;
}

export const FieldSelector: React.FC<Props> = ({ fields, selectedId, onSelect, onAddField, onDeleteField }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-600">圃場選択</h2>
        <button
          onClick={onAddField}
          className="flex items-center gap-1 bg-primary text-white text-xs px-3 py-1.5 rounded-full font-bold hover:bg-primary-hover transition-colors"
        >
          ＋ 圃場を追加
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {fields.map((f) => (
          <div key={f.id} className="relative group">
            <button
              onClick={() => onSelect(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors pr-${f.isCustom ? '8' : '4'} ${
                selectedId === f.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🌿 {f.name}
              {f.crop && <span className="ml-1 text-xs opacity-70">({f.crop})</span>}
            </button>
            {f.isCustom && onDeleteField && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteField(f.id); }}
                className="absolute -top-1 -right-1 bg-red-400 text-white rounded-full w-4 h-4 text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="削除"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
