# Evolt Scanner Globe

Interactive globe UI for Evolt scanner status with a simple Express + SQLite backend.

## Structure

- `backend/` Express API + SQLite database
- `frontend/` Static UI with Globe.gl + Three.js

## Quick start

Backend (Python stdlib, no dependencies):

```bash
cd /home/user/projects/evolt/globe/backend
python3 seed.py
python3 server.py
```

Frontend:

```bash
cd /home/user/projects/evolt/globe/frontend
python3 -m http.server 5173
```

Then open `http://localhost:5173` in your browser.

## API

- `GET /api/scanners`
- `GET /api/scanners/:id`
- `POST /api/scanners`
- `PUT /api/scanners/:id`
- `DELETE /api/scanners/:id`

Example create:

```bash
curl -X POST http://localhost:4000/api/scanners \
  -H "Content-Type: application/json" \
  -d '{"id":"ev-par-13","name":"Evolt Scanner - Paris","latitude":48.8566,"longitude":2.3522,"status":"online"}'
```

Example update:

```bash
curl -X PUT http://localhost:4000/api/scanners/ev-par-13 \
  -H "Content-Type: application/json" \
  -d '{"status":"offline","last_seen":"2024-06-10T16:30:00.000Z"}'
```

## Notes

- Database file: `backend/data.sqlite`
- Update the UI by editing `frontend/app.js` and `frontend/styles.css`.
- The UI polls the API every 30 seconds.
