import json
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

DB_PATH = 'data.sqlite'

CREATE_SQL = """
CREATE TABLE IF NOT EXISTS scanners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  status TEXT NOT NULL,
  last_seen TEXT NOT NULL
)
"""


def init_db():
  conn = sqlite3.connect(DB_PATH)
  conn.execute(CREATE_SQL)
  conn.commit()
  conn.close()


class Handler(BaseHTTPRequestHandler):
  def _set_headers(self, status=200, content_type='application/json'):
    self.send_response(status)
    self.send_header('Content-Type', content_type)
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    self.end_headers()

  def _json(self, status, payload):
    self._set_headers(status)
    self.wfile.write(json.dumps(payload).encode('utf-8'))

  def do_OPTIONS(self):
    self._set_headers(204)

  def do_GET(self):
    parsed = urlparse(self.path)
    if parsed.path == '/api/health':
      self._json(200, {'ok': True})
      return

    if parsed.path == '/api/scanners':
      conn = sqlite3.connect(DB_PATH)
      conn.row_factory = sqlite3.Row
      rows = conn.execute('SELECT * FROM scanners').fetchall()
      conn.close()
      self._json(200, [dict(r) for r in rows])
      return

    if parsed.path.startswith('/api/scanners/'):
      scanner_id = parsed.path.split('/')[-1]
      conn = sqlite3.connect(DB_PATH)
      conn.row_factory = sqlite3.Row
      row = conn.execute('SELECT * FROM scanners WHERE id = ?', (scanner_id,)).fetchone()
      conn.close()
      if not row:
        self._json(404, {'error': 'Scanner not found'})
        return
      self._json(200, dict(row))
      return

    self._json(404, {'error': 'Not found'})

  def do_POST(self):
    if self.path != '/api/scanners':
      self._json(404, {'error': 'Not found'})
      return

    length = int(self.headers.get('Content-Length', 0))
    body = self.rfile.read(length).decode('utf-8')
    data = json.loads(body or '{}')

    required = ('id', 'name', 'latitude', 'longitude', 'status')
    if any(k not in data for k in required):
      self._json(400, {'error': 'id, name, latitude, longitude, and status are required'})
      return

    if data['status'] not in ('online', 'offline'):
      self._json(400, {'error': 'status must be online or offline'})
      return

    last_seen = data.get('last_seen') or __import__('datetime').datetime.utcnow().isoformat() + 'Z'

    try:
      conn = sqlite3.connect(DB_PATH)
      conn.execute(
        'INSERT INTO scanners (id, name, latitude, longitude, status, last_seen) VALUES (?, ?, ?, ?, ?, ?)',
        (data['id'], data['name'], data['latitude'], data['longitude'], data['status'], last_seen)
      )
      conn.commit()
      conn.close()
    except sqlite3.IntegrityError:
      self._json(409, {'error': 'Scanner already exists'})
      return

    self._json(201, {
      'id': data['id'],
      'name': data['name'],
      'latitude': data['latitude'],
      'longitude': data['longitude'],
      'status': data['status'],
      'last_seen': last_seen
    })

  def do_PUT(self):
    if not self.path.startswith('/api/scanners/'):
      self._json(404, {'error': 'Not found'})
      return

    scanner_id = self.path.split('/')[-1]
    length = int(self.headers.get('Content-Length', 0))
    body = self.rfile.read(length).decode('utf-8')
    data = json.loads(body or '{}')

    if 'status' in data and data['status'] not in ('online', 'offline'):
      self._json(400, {'error': 'status must be online or offline'})
      return

    fields = []
    values = []
    for key in ('name', 'latitude', 'longitude', 'status', 'last_seen'):
      if key in data:
        fields.append(f"{key} = ?")
        values.append(data[key])

    if not fields:
      self._json(400, {'error': 'No valid fields to update'})
      return

    values.append(scanner_id)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.execute(f"UPDATE scanners SET {', '.join(fields)} WHERE id = ?", values)
    conn.commit()
    conn.close()

    if cur.rowcount == 0:
      self._json(404, {'error': 'Scanner not found'})
      return

    self._json(200, {'ok': True})

  def do_DELETE(self):
    if not self.path.startswith('/api/scanners/'):
      self._json(404, {'error': 'Not found'})
      return

    scanner_id = self.path.split('/')[-1]
    conn = sqlite3.connect(DB_PATH)
    cur = conn.execute('DELETE FROM scanners WHERE id = ?', (scanner_id,))
    conn.commit()
    conn.close()

    if cur.rowcount == 0:
      self._json(404, {'error': 'Scanner not found'})
      return

    self._json(200, {'ok': True})


def run():
  init_db()
  server = HTTPServer(('0.0.0.0', 4000), Handler)
  print('Backend listening on http://localhost:4000')
  server.serve_forever()


if __name__ == '__main__':
  run()
