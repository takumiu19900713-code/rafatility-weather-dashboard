import { useState, useCallback } from 'react';
import type { Field } from '../types';
import { FIELDS as DEFAULT_FIELDS } from '../data/fields';

const STORAGE_KEY = 'rafatility_custom_fields';
const OVERRIDES_KEY = 'rafatility_field_overrides';

function loadCustomFields(): Field[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function loadOverrides(): Record<string, Partial<Field>> {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveCustomFields(fields: Field[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
}

function saveOverrides(overrides: Record<string, Partial<Field>>) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

export function useFields() {
  const [customFields, setCustomFields] = useState<Field[]>(loadCustomFields);
  const [overrides, setOverrides] = useState<Record<string, Partial<Field>>>(loadOverrides);

  const allFields = [...DEFAULT_FIELDS, ...customFields].map(f => ({
    ...f,
    ...(overrides[f.id] ?? {}),
  }));

  const addField = useCallback((field: Omit<Field, 'id' | 'isCustom'>) => {
    const newField: Field = {
      ...field,
      id: `CF${Date.now()}`,
      isCustom: true,
    };
    const updated = [...loadCustomFields(), newField];
    saveCustomFields(updated);
    setCustomFields(updated);
    return newField;
  }, []);

  const deleteField = useCallback((id: string) => {
    const updated = loadCustomFields().filter(f => f.id !== id);
    saveCustomFields(updated);
    setCustomFields(updated);
  }, []);

  // デフォルト圃場を含む全圃場のフィールドを部分更新
  const updateField = useCallback((id: string, partial: Partial<Field>) => {
    const custom = loadCustomFields();
    const isCustom = custom.some(f => f.id === id);
    if (isCustom) {
      const updated = custom.map(f => f.id === id ? { ...f, ...partial } : f);
      saveCustomFields(updated);
      setCustomFields(updated);
    } else {
      const next = { ...loadOverrides(), [id]: { ...(loadOverrides()[id] ?? {}), ...partial } };
      saveOverrides(next);
      setOverrides(next);
    }
  }, []);

  return { fields: allFields, customFields, addField, deleteField, updateField };
}
