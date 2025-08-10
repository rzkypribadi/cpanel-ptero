let currentUser = null;
let userIP = 'unknown';
let panels = {};

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

async function detectIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    userIP = data.ip;
  } catch (e) {
    userIP = 'local-dev';
  }
  loadUserData();
}

function loadUserData() {
  const saved = localStorage.getItem(`panel_data_${userIP}`);
  if (saved) {
    panels = JSON.parse(saved);
  }
}

function saveUserData() {
  localStorage.setItem(`panel_data_${userIP}`, JSON.stringify(panels));
}

function showLogin(role) {
  document.getElementById('main-container').style.display = 'none';
  document.getElementById('login-container').style.display = 'flex';
  const title = document.getElementById('form-title');
  const tokenField = document.getElementById('token');
  const userField = document.getElementById('username');
  const passField = document.getElementById('password');

  if (role === 'developer') {
    title.innerText = 'Login as Developer';
    userField.style.display = 'block';
    passField.style.display = 'block';
    tokenField.style.display = 'none';
  } else {
    title.innerText = 'Login as Reseller';
    userField.style.display = 'none';
    passField.style.display = 'none';
    tokenField.style.display = 'block';
  }

  currentUser = role;
}

function goBack() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('main-container').style.display = 'flex';
}

function handleLogin(e) {
  e.preventDefault();

  if (currentUser === 'developer') {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (u === 'zkydev' && p === 'zky') {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('developer-dashboard').style.display = 'flex';
      document.getElementById('dev-name').innerText = u;
    } else {
      alert('Invalid credentials!');
    }
  } else {
    const t = document.getElementById('token').value;
    if (t === 'zkycoder') {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('reseller-dashboard').style.display = 'flex';
      if (Object.keys(panels).length > 0) {
        showSection('create-panel-reseller');
      }
    } else {
      alert('Invalid token!');
    }
  }
}

function showSection(id) {
  const content = document.getElementById('dashboard-content') || document.getElementById('reseller-content');
  let html = '';

  if (id === 'create-panel-reseller') {
    html = `
      <h3>Create New Panel</h3>
      <input type="text" id="res-username" placeholder="Username" required />
      <input type="password" id="res-password" placeholder="Password" required />
      <div class="spec-options">
        ${Object.keys(specs).map(key => `
          <div class="spec-btn" onclick="selectSpec('${key}')">${specs[key].name}</div>
        `).join('')}
      </div>
      <button class="btn submit-btn" onclick="createPanelReseller()">Create Panel</button>
      <div id="result"></div>
    `;
  } else if (id === 'hapus-data') {
    html = `
      <h3>Hapus Data Dashboard</h3>
      <p>Ini hanya menghapus data di dashboard, TIDAK menghapus panel di server.</p>
      <button class="confirm-delete" onclick="confirmDelete()">Konfirmasi Hapus</button>
    `;
  } else if (id === 'create-panel') {
    html = `<h3>Create Panel (Developer)</h3>
      <p>Fitur lengkap akan diintegrasikan dengan API.</p>`;
  } else {
    html = `<h3>${id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
      <p>Fitur ini sedang dalam pengembangan.</p>`;
  }

  if (content.id === 'reseller-content') {
    content.innerHTML = html;
  } else {
    document.getElementById('dashboard-content').innerHTML = html;
  }
}

let selectedSpec = null;

function selectSpec(key) {
  selectedSpec = key;
  document.querySelectorAll('.spec-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

function createPanelReseller() {
  const username = document.getElementById('res-username').value;
  const password = document.getElementById('res-password').value;
  if (!username || !password || !selectedSpec) {
    alert('Lengkapi semua field!');
    return;
  }

  const spec = specs[selectedSpec];
  const now = new Date().toLocaleString();

  const panelData = {
    email: `${username}@example.com`,
    id_server: Math.floor(1000 + Math.random() * 9000),
    id_user: Math.floor(1000 + Math.random() * 9000),
    created_at: now,
    created_by: 'zkydev',
    username,
    ram: spec.ram,
    disk: spec.disk,
    cpu: spec.cpu,
    eggid: defaults.eggid,
    nestid: defaults.nestid,
    loc: defaults.loc,
    domain: defaults.domain,
    plta: defaults.plta,
    pltc: defaults.pltc
  };

  panels[username] = panelData;
  saveUserData();

  const resultText = `
Panel Created Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email       : ${panelData.email}
ID Server   : ${panelData.id_server}
ID User     : ${panelData.id_user}
Username    : ${panelData.username}
Password    : ${panelData.password}
RAM         : ${spec.name}
Disk        : ${spec.disk} MB
CPU         : ${spec.cpu}%
EggID       : ${defaults.eggid}
NestID      : ${defaults.nestid}
Location    : ${defaults.loc}
Domain      : ${defaults.domain}
PLTA        : ${defaults.plta}
PLTC        : ${defaults.pltc}
Created At  : ${now}
Created By  : ${panelData.created_by}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API: https://restapi.mat.web.id/api/pterodactyl/create?username=${username}&ram=${spec.ram}&disk=${spec.disk}&cpu=${spec.cpu}&eggid=${defaults.eggid}&nestid=${defaults.nestid}&loc=${defaults.loc}&domain=${defaults.domain}&ptla=${defaults.plta}&ptlc=${defaults.pltc}
  `;

  document.getElementById('result').innerHTML = `
    <div class="result-box">${resultText.replace(/\n/g, '<br>')}</div>
    <button class="download-btn" onclick="downloadText('${btoa(resultText)}')">Download .txt</button>
  `;
}

function downloadText(data) {
  const blob = new Blob([atob(data)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'panel_created.txt';
  a.click();
}

function confirmDelete() {
  if (confirm("Yakin ingin menghapus data dashboard? Ini tidak menghapus panel di server.")) {
    panels = {};
    saveUserData();
    document.getElementById('result').innerHTML = '<p style="color: #ff9800;">Data dashboard berhasil dihapus.</p>';
  }
}

function logout() {
  document.getElementById('developer-dashboard').style.display = 'none';
  document.getElementById('reseller-dashboard').style.display = 'none';
  document.getElementById('main-container').style.display = 'flex';
  currentUser = null;
}

detectIP();
