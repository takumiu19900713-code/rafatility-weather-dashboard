import { useState, useCallback } from 'react';
import type { KnowledgeRule } from '../types';

const STORAGE_KEY = 'rafatility_knowledge_rules';

function load(): KnowledgeRule[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function save(rules: KnowledgeRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

export function useKnowledge() {
  const [rules, setRules] = useState<KnowledgeRule[]>(load);

  const addRule = useCallback((rule: Omit<KnowledgeRule, 'id' | 'createdAt'>) => {
    const newRule: KnowledgeRule = {
      ...rule,
      id: `K${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRules(prev => {
      const next = [...prev, newRule];
      save(next);
      return next;
    });
  }, []);

  const toggleRule = useCallback((id: string) => {
    setRules(prev => {
      const next = prev.map(r => r.id === id ? { ...r, active: !r.active } : r);
      save(next);
      return next;
    });
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules(prev => {
      const next = prev.filter(r => r.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { rules, addRule, toggleRule, deleteRule };
}
