import React from 'react';
import type { Field } from '../types';

interface Props {
  fields: Field[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddField: () => void;
  onDeleteField?: (id: string) => void;
  onUpdateRoofType?: (id: string, roofType: Field['roofType']) => void;
}

const ROOF_LABELS: Record<NonNullable<Field['roofType']>, string> = {
  open:           '露地',
  unheated_house: '無加温ハウス',
  heated_house:   '加温ハウス',
};

export const FieldSelector: React.FC<Props> = ({
  fields, selectedId, onSelect, onAddField, onDeleteField, onUpdateRoofType,
}) => {
  const selectedField = fields.find(f => f.id === selectedId);
  const currentRoof = selectedField?.roofType ?? 'open';

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
      <div className="flex flex-wrap gap-2 mb-3">
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

      {/* 栽培形態クイック切替 */}
      {onUpdateRoofType && selectedField && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 shrink-0">栽培形態：</span>
          <div className="flex gap-1">
            {(['open', 'unheated_house', 'heated_house'] as const).map(rt => (
              <button
                key={rt}
                onClick={() => onUpdateRoofType(selectedId, rt)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  currentRoof === rt
                    ? 'bg-primary text-white border-primary font-bold'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {ROOF_LABELS[rt]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
