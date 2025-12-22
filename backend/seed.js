import { initDb } from './db.js';

const mockScanners = [
  {
    id: 'ev-nyc-01',
    name: 'Evolt Scanner - NYC Midtown',
    latitude: 40.7549,
    longitude: -73.984,
    status: 'online',
    last_seen: '2024-06-10T15:42:00.000Z'
  },
  {
    id: 'ev-sfo-02',
    name: 'Evolt Scanner - San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    status: 'offline',
    last_seen: '2024-06-08T10:05:00.000Z'
  },
  {
    id: 'ev-chi-03',
    name: 'Evolt Scanner - Chicago',
    latitude: 41.8781,
    longitude: -87.6298,
    status: 'online',
    last_seen: '2024-06-10T15:20:00.000Z'
  },
  {
    id: 'ev-mia-04',
    name: 'Evolt Scanner - Miami',
    latitude: 25.7617,
    longitude: -80.1918,
    status: 'offline',
    last_seen: '2024-06-09T21:11:00.000Z'
  },
  {
    id: 'ev-lon-05',
    name: 'Evolt Scanner - London',
    latitude: 51.5072,
    longitude: -0.1276,
    status: 'online',
    last_seen: '2024-06-10T15:50:00.000Z'
  },
  {
    id: 'ev-ber-06',
    name: 'Evolt Scanner - Berlin',
    latitude: 52.52,
    longitude: 13.405,
    status: 'offline',
    last_seen: '2024-06-08T07:40:00.000Z'
  },
  {
    id: 'ev-dub-07',
    name: 'Evolt Scanner - Dubai',
    latitude: 25.2048,
    longitude: 55.2708,
    status: 'online',
    last_seen: '2024-06-10T14:32:00.000Z'
  },
  {
    id: 'ev-sgp-08',
    name: 'Evolt Scanner - Singapore',
    latitude: 1.3521,
    longitude: 103.8198,
    status: 'online',
    last_seen: '2024-06-10T16:02:00.000Z'
  },
  {
    id: 'ev-syd-09',
    name: 'Evolt Scanner - Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    status: 'offline',
    last_seen: '2024-06-09T19:45:00.000Z'
  },
  {
    id: 'ev-tok-10',
    name: 'Evolt Scanner - Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    status: 'online',
    last_seen: '2024-06-10T16:05:00.000Z'
  },
  {
    id: 'ev-sea-11',
    name: 'Evolt Scanner - Seattle',
    latitude: 47.6062,
    longitude: -122.3321,
    status: 'offline',
    last_seen: '2024-06-09T08:12:00.000Z'
  },
  {
    id: 'ev-jhb-12',
    name: 'Evolt Scanner - Johannesburg',
    latitude: -26.2041,
    longitude: 28.0473,
    status: 'online',
    last_seen: '2024-06-10T13:58:00.000Z'
  }
];

const db = initDb();

db.serialize(() => {
  db.run('DELETE FROM scanners');
  const stmt = db.prepare(
    'INSERT INTO scanners (id, name, latitude, longitude, status, last_seen) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (const scanner of mockScanners) {
    stmt.run(
      scanner.id,
      scanner.name,
      scanner.latitude,
      scanner.longitude,
      scanner.status,
      scanner.last_seen
    );
  }

  stmt.finalize();
});

db.close();
console.log(`Seeded ${mockScanners.length} scanners.`);
