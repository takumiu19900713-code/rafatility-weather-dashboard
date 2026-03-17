import type { Field } from '../types';

export const FIELDS: Field[] = [
  {
    id: 'F001',
    name: '総領第1圃場',
    lat: 34.763,
    lon: 132.921,
    elevation: 380,
    aspect: 'south',
    location: '庄原市総領町中領家',
  },
  {
    id: 'F002',
    name: '総領第2圃場',
    lat: 34.768,
    lon: 132.928,
    elevation: 420,
    aspect: 'east',
    location: '庄原市総領町中領家',
  },
  {
    id: 'F003',
    name: '総領第3圃場',
    lat: 34.757,
    lon: 132.915,
    elevation: 350,
    aspect: 'southwest',
    location: '庄原市総領町中領家',
  },
];

export const REFERENCE_POINT = {
  name: '庄原市総領町代表点',
  lat: 34.763,
  lon: 132.921,
};
