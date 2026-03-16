import type { Field } from '../types';

export const FIELDS: Field[] = [
  {
    id: 'F001',
    name: '緑井第1圃場',
    lat: 34.918,
    lon: 133.051,
    elevation: 350,
    aspect: 'south',
    location: '安芸市緑井町',
  },
  {
    id: 'F002',
    name: '緑井第2圃場',
    lat: 34.922,
    lon: 133.058,
    elevation: 420,
    aspect: 'east',
    location: '安芸市緑井町',
  },
  {
    id: 'F003',
    name: '安芸圃場',
    lat: 34.857,
    lon: 133.017,
    elevation: 280,
    aspect: 'southwest',
    location: '安芸市',
  },
];

export const REFERENCE_POINT = {
  name: '安芸市代表点',
  lat: 34.857,
  lon: 133.017,
};
