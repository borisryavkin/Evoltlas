import express from 'express';
import cors from 'cors';
import { initDb, getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

initDb();

function isValidStatus(status) {
  return status === 'online' || status === 'offline';
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/scanners', (req, res) => {
  const status = req.query.status;
  const db = getDb();
  const params = [];
  let sql = 'SELECT * FROM scanners';
  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  db.all(sql, params, (err, rows) => {
    db.close();
    if (err) {
      res.status(500).json({ error: 'Failed to load scanners' });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/scanners/:id', (req, res) => {
  const db = getDb();
  db.get('SELECT * FROM scanners WHERE id = ?', [req.params.id], (err, row) => {
    db.close();
    if (err) {
      res.status(500).json({ error: 'Failed to load scanner' });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Scanner not found' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/scanners', (req, res) => {
  const { id, name, latitude, longitude, status, last_seen } = req.body;
  if (!id || !name || typeof latitude !== 'number' || typeof longitude !== 'number') {
    res.status(400).json({ error: 'id, name, latitude, and longitude are required' });
    return;
  }
  if (!isValidStatus(status)) {
    res.status(400).json({ error: 'status must be online or offline' });
    return;
  }
  const seen = last_seen || new Date().toISOString();

  const db = getDb();
  db.run(
    'INSERT INTO scanners (id, name, latitude, longitude, status, last_seen) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, latitude, longitude, status, seen],
    (err) => {
      db.close();
      if (err) {
        res.status(500).json({ error: 'Failed to create scanner' });
        return;
      }
      res.status(201).json({ id, name, latitude, longitude, status, last_seen: seen });
    }
  );
});

app.put('/api/scanners/:id', (req, res) => {
  const { name, latitude, longitude, status, last_seen } = req.body;
  if (status && !isValidStatus(status)) {
    res.status(400).json({ error: 'status must be online or offline' });
    return;
  }

  const updates = [];
  const params = [];
  if (name) {
    updates.push('name = ?');
    params.push(name);
  }
  if (typeof latitude === 'number') {
    updates.push('latitude = ?');
    params.push(latitude);
  }
  if (typeof longitude === 'number') {
    updates.push('longitude = ?');
    params.push(longitude);
  }
  if (status) {
    updates.push('status = ?');
    params.push(status);
  }
  if (last_seen) {
    updates.push('last_seen = ?');
    params.push(last_seen);
  }

  if (!updates.length) {
    res.status(400).json({ error: 'No valid fields to update' });
    return;
  }

  params.push(req.params.id);

  const db = getDb();
  db.run(`UPDATE scanners SET ${updates.join(', ')} WHERE id = ?`, params, function (err) {
    db.close();
    if (err) {
      res.status(500).json({ error: 'Failed to update scanner' });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Scanner not found' });
      return;
    }
    res.json({ ok: true });
  });
});

app.delete('/api/scanners/:id', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM scanners WHERE id = ?', [req.params.id], function (err) {
    db.close();
    if (err) {
      res.status(500).json({ error: 'Failed to delete scanner' });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Scanner not found' });
      return;
    }
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
