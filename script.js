let currentUser = null;
let userIP = 'unknown';
let panels = {};

async function detectIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    userIP = data.ip;
  } catch (e) {
    userIP = 'local-' + Date.now();
  }
  loadUserData();
}

function loadUserData() {
  const saved = localStorage.getItem(`zkypanel_data_${userIP}`);
  if (saved) panels = JSON.parse(saved);
}

function saveUserData() {
  localStorage.setItem(`zkypanel_data_${userIP}`, JSON.stringify(panels));
}

function goToLogin(role) {
  localStorage.setItem('pending-role', role);
  window.location.href = 'login.html';
}

function handleLogin(e) {
  e.preventDefault();
  const role = localStorage.getItem('pending-role');
  const u = document.getElementById('username')?.value;
  const p = document.getElementById('password')?.value;
  const t = document.getElementById('token')?.value;

  if (role === 'dev') {
    if (u === 'zkydev' && p === 'zky') {
      window.location.href = 'dashboard-dev.html';
    } else {
      alert('Nama pengguna atau kata sandi salah!');
    }
  } else {
    if (t === 'zkycoder') {
      window.location.href = 'dashboard-res.html';
    } else {
      alert('Token tidak valid!');
    }
  }
}

function logout() {
  localStorage.removeItem('pending-role');
  window.location.href = 'index.html';
}

function loadSection(id) {
  const content = document.getElementById('main-content');
  if (id === 'create-panel') {
    content.innerHTML = `
      <h2>Buat Panel Baru</h2>
      <div style="margin:2rem 0;">
        <input type="text" id="dev-username" placeholder="Nama Pengguna" class="input-field" />
        <input type="password" id="dev-password" placeholder="Kata Sandi" class="input-field" />
      </div>
      <div class="specs-grid">
        ${Object.keys(specs).map(key => `
          <div class="spec-btn" onclick="selectDevSpec('${key}', this)">${specs[key].name}</div>
        `).join('')}
      </div>
      <button onclick="createDevPanel()" class="btn-primary" style="margin-top:1.5rem;">Buat Panel</button>
      <div id="dev-result"></div>
    `;
  } else {
    content.innerHTML = `<div class="info-card"><h3>${menuTitles[id] || id}</h3><p>Fitur ini siap digunakan.</p></div>`;
  }
}

function loadResSection(id) {
  const content = document.getElementById('res-content');
  if (id === 'create-panel') {
    content.innerHTML = `
      <h2>Buat Panel Instan</h2>
      <div style="margin:2rem 0;">
        <input type="text" id="res-username" placeholder="Nama Pengguna" class="input-field" />
        <input type="password" id="res-password" placeholder="Kata Sandi" class="input-field" />
      </div>
      <div class="specs-grid">
        ${Object.keys(specs).map(key => `
          <div class="spec-btn" onclick="selectResSpec('${key}', this)">${specs[key].name}</div>
        `).join('')}
      </div>
      <button onclick="createResPanel()" class="btn-primary" style="margin-top:1.5rem;">Buat Panel</button>
      <div id="res-result"></div>
    `;
  } else if (id === 'hapus-data') {
    content.innerHTML = `
      <h2>Hapus Data Lokal</h2>
      <p>Data ini hanya dihapus dari dashboard Anda, TIDAK menghapus panel di server.</p>
      <button onclick="confirmHapusData()" class="btn-danger">Hapus Data</button>
    `;
  }
}

let selectedDevSpec = null;
let selectedResSpec = null;

function selectDevSpec(key, el) {
  document.querySelectorAll('.spec-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedDevSpec = key;
}

function selectResSpec(key, el) {
  document.querySelectorAll('.spec-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedResSpec = key;
}

const specs = {
  "1gb": { ram: 1024, disk: 1024, cpu: 100, name: "1GB" },
  "2gb": { ram: 2048, disk: 2048, cpu: 100, name: "2GB" },
  "3gb": { ram: 3072, disk: 3072, cpu: 100, name: "3GB" },
  "4gb": { ram: 4096, disk: 4096, cpu: 100, name: "4GB" },
  "5gb": { ram: 5120, disk: 5120, cpu: 100, name: "5GB" },
  "6gb": { ram: 6144, disk: 6144, cpu: 100, name: "6GB" },
  "7gb": { ram: 7168, disk: 7168, cpu: 100, name: "7GB" },
  "8gb": { ram: 8192, disk: 8192, cpu: 100, name: "8GB" },
  "9gb": { ram: 9216, disk: 9216, cpu: 100, name: "9GB" },
  "10gb": { ram: 10240, disk: 10240, cpu: 100, name: "10GB" },
  "unli": { ram: 0, disk: 0, cpu: 0, name: "UNLIMITED" }
};

const defaults = {
  domain: "https",
  plta: "plta",
  pltc: "pltc",
  eggid: "15",
  nestid: "5",
  loc: "1"
};

const menuTitles = {
  'cek-domain': 'Cek Domain',
  'ubah-domain': 'Ubah Domain',
  'hapus-domain': 'Hapus Domain',
  // ... tambahkan sesuai
};

function createDevPanel() {
  const u = document.getElementById('dev-username').value;
  const p = document.getElementById('dev-password').value;
  if (!u || !p || !selectedDevSpec) return alert('Isi semua data!');
  createPanel(u, p, selectedDevSpec);
}

function createResPanel() {
  const u = document.getElementById('res-username').value;
  const p = document.getElementById('res-password').value;
  if (!u || !p || !selectedResSpec) return alert('Isi semua data!');
  createPanel(u, p, selectedResSpec);
}

function createPanel(username, password, specKey) {
  const spec = specs[specKey];
  const now = new Date().toLocaleString('id-ID');
  const idServer = Math.floor(10000 + Math.random() * 90000);
  const idUser = Math.floor(10000 + Math.random() * 90000);

  const data = `
PANEL DIBUAT
────────────────────────────
Nama Pengguna : ${username}
Kata Sandi    : ${password}
Email         : ${username}@zkypanel.id
ID Server     : ${idServer}
ID Pengguna   : ${idUser}
Spesifikasi   : ${spec.name}
RAM           : ${spec.ram === 0 ? 'Tak Terbatas' : spec.ram + ' MB'}
Disk          : ${spec.disk === 0 ? 'Tak Terbatas' : spec.disk + ' MB'}
CPU           : ${spec.cpu === 0 ? 'Tak Terbatas' : spec.cpu + '%'}
EggID         : ${defaults.eggid}
NestID        : ${defaults.nestid}
Lokasi        : ${defaults.loc}
Domain        : ${defaults.domain}
PLTA          : ${defaults.plta}
PLTC          : ${defaults.pltc}
Dibuat Pada   : ${now}
Dibuat Oleh   : zkydev
────────────────────────────
API: https://restapi.mat.web.id/api/pterodactyl/create?username=${username}&ram=${spec.ram}&disk=${spec.disk}&cpu=${spec.cpu}&eggid=${defaults.eggid}&nestid=${defaults.nestid}&loc=${defaults.loc}&domain=${defaults.domain}&ptla=${defaults.plta}&ptlc=${defaults.pltc}
  `;

  panels[username] = { ...spec, username, password, idServer, createdAt: now };
  saveUserData();

  const el = document.getElementById('dev-result') || document.getElementById('res-result');
  el.innerHTML = `
    <pre class="result-box">${data}</pre>
    <button onclick="download(data)" class="btn-primary">Unduh .txt</button>
  `;
}

function download(text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `panel_${Date.now()}.txt`;
  a.click();
}

function confirmHapusData() {
  if (confirm('Hapus semua data lokal di dashboard ini? Ini tidak menghapus panel di server.')) {
    panels = {};
    saveUserData();
    document.getElementById('res-content').innerHTML = '<p>Data berhasil dihapus.</p>';
  }
}

if (window.location.pathname.includes('login.html')) {
  const role = localStorage.getItem('pending-role');
  document.getElementById('login-title').textContent = role === 'dev' 
    ? 'Masuk sebagai Developer' 
    : 'Masuk sebagai Reseller';
  if (role !== 'dev') {
    document.getElementById('dev-fields').style.display = 'none';
    document.getElementById('token').style.display = 'block';
  }
}

detectIP();
