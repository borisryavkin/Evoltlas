const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./scanners.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.serialize(() => {
      createTable();
      insertSampleData();
      // Start server after DB is ready
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    });
  }
});
function createTable() {
  db.run(`CREATE TABLE IF NOT EXISTS scanners (
    id TEXT PRIMARY KEY,
    name TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT
  )`);
}

// Insert sample data
function insertSampleData() {
  const scanners = [
    { id: 'SC001', name: 'New York Hub', latitude: 40.7128, longitude: -74.0060, status: 'online' },
    { id: 'SC002', name: 'London Center', latitude: 51.5074, longitude: -0.1278, status: 'online' },
    { id: 'SC003', name: 'Tokyo Station', latitude: 35.6762, longitude: 139.6503, status: 'offline' },
    { id: 'SC004', name: 'Sydney Outpost', latitude: -33.8688, longitude: 151.2093, status: 'online' },
    { id: 'SC005', name: 'Berlin Node', latitude: 52.5200, longitude: 13.4050, status: 'offline' },
    { id: 'SC006', name: 'Paris Relay', latitude: 48.8566, longitude: 2.3522, status: 'online' },
    { id: 'SC007', name: 'Mumbai Scanner', latitude: 19.0760, longitude: 72.8777, status: 'online' },
    { id: 'SC008', name: 'Los Angeles Hub', latitude: 34.0522, longitude: -118.2437, status: 'offline' },
    { id: 'SC009', name: 'Toronto Station', latitude: 43.6532, longitude: -79.3832, status: 'online' },
    { id: 'SC010', name: 'Singapore Node', latitude: 1.3521, longitude: 103.8198, status: 'online' }
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO scanners (id, name, latitude, longitude, status) VALUES (?, ?, ?, ?, ?)');

  scanners.forEach(scanner => {
    stmt.run(scanner.id, scanner.name, scanner.latitude, scanner.longitude, scanner.status);
  });

  stmt.finalize();
}

// API endpoint
app.get('/api/scanners', (req, res) => {
  db.all('SELECT * FROM scanners', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });