const API_BASE = `${window.location.protocol}//${window.location.hostname}:4000/api`;

const onlineCountEl = document.getElementById('onlineCount');
const offlineCountEl = document.getElementById('offlineCount');
const totalCountEl = document.getElementById('totalCount');
const listEl = document.getElementById('scannerList');
const lastUpdatedEl = document.getElementById('lastUpdated');

const globe = Globe()(document.getElementById('globe'))
  .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
  .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
  .backgroundColor('#0b0e12')
  .atmosphereColor('#2ec4b6')
  .atmosphereAltitude(0.22)
  .pointLat('latitude')
  .pointLng('longitude')
  .pointAltitude(0.02)
  .pointRadius(0.4)
  .pointColor((d) => (d.status === 'online' ? '#32d296' : '#ef476f'))
  .pointLabel((d) => `
    <div style="font-family: 'IBM Plex Mono', monospace; font-size: 12px;">
      <strong>${d.name}</strong><br />
      ${d.status.toUpperCase()} · ${d.id}
    </div>
  `);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.4;
globe.controls().enableZoom = true;

globe.onPointClick((d) => {
  globe.pointOfView({ lat: d.latitude, lng: d.longitude, altitude: 1.2 }, 900);
});

function renderList(scanners) {
  listEl.innerHTML = '';
  scanners.forEach((scanner) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <strong>${scanner.name}</strong>
      <span>${scanner.id} · ${scanner.latitude.toFixed(2)}, ${scanner.longitude.toFixed(2)}</span>
      <span class="status-pill ${scanner.status === 'online' ? 'status-online' : 'status-offline'}">
        ${scanner.status}
      </span>
    `;
    item.addEventListener('click', () => {
      globe.pointOfView({ lat: scanner.latitude, lng: scanner.longitude, altitude: 1.2 }, 900);
    });
    listEl.appendChild(item);
  });
}

function updateStats(scanners) {
  const online = scanners.filter((s) => s.status === 'online').length;
  const offline = scanners.length - online;
  onlineCountEl.textContent = online;
  offlineCountEl.textContent = offline;
  totalCountEl.textContent = scanners.length;
}

function setLastUpdated() {
  const now = new Date();
  lastUpdatedEl.textContent = `Updated: ${now.toLocaleString()}`;
}

async function loadScanners() {
  try {
    const res = await fetch(`${API_BASE}/scanners`);
    if (!res.ok) {
      throw new Error('Failed to load scanners');
    }
    const scanners = await res.json();
    globe.pointsData(scanners);
    renderList(scanners);
    updateStats(scanners);
    setLastUpdated();
  } catch (err) {
    lastUpdatedEl.textContent = 'Updated: API unavailable';
    console.error(err);
  }
}

loadScanners();
setInterval(loadScanners, 30000);
