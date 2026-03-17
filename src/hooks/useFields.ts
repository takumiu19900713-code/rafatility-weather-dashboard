import { useState, useCallback } from 'react';
import type { Field } from '../types';
import { FIELDS as DEFAULT_FIELDS } from '../data/fields';

const STORAGE_KEY = 'rafatility_custom_fields';

function loadCustomFields(): Field[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveCustomFields(fields: Field[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
}

export function useFields() {
  const [customFields, setCustomFields] = useState<Field[]>(loadCustomFields);

  const allFields = [...DEFAULT_FIELDS, ...customFields];

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

  return { fields: allFields, customFields, addField, deleteField };
}
