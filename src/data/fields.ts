import type { Field } from '../types';

export const FIELDS: Field[] = [
  {
    id: 'F001',
    name: '総領第1圃場',
    lat: 34.92,
    lon: 133.05,
    elevation: 350,
    aspect: 'south',
    location: '庄原市総領町中領家',
  },
  {
    id: 'F002',
    name: '総領第2圃場',
    lat: 34.925,
    lon: 133.052,
    elevation: 420,
    aspect: 'east',
    location: '庄原市総領町',
  },
  {
    id: 'F003',
    name: '三次圃場',
    lat: 34.8,
    lon: 133.0,
    elevation: 280,
    aspect: 'southwest',
    location: '三次市',
  },
];

export const REFERENCE_POINT = {
  name: '庄原市AMeDAS基準点',
  lat: 34.85,
  lon: 133.017,
  elevation: 150,
};
