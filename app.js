// ── Chart setup ───────────────────────────────────────────────────
const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Seed with realistic starting values
let revenueData = [95000, 93500, 84500, 96000, 83800, 88500, 93500];
let userData    = [1130,  1140,  1270,  1280,  1060,  1130,  1120];

const revenueChart = new Chart(
  document.getElementById('revenueChart').getContext('2d'), {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'Revenue ($)',
      data: [...revenueData],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79,70,229,0.08)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  },
  options: {
    responsive: true,
    animation: { duration: 800, easing: 'easeInOutQuart' },
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: false } }
  }
});

const userChart = new Chart(
  document.getElementById('userChart').getContext('2d'), {
  type: 'bar',
  data: {
    labels,
    datasets: [{
      label: 'Active Users',
      data: [...userData],
      backgroundColor: '#0ea5e9',
      borderRadius: 4
    }]
  },
  options: {
    responsive: true,
    animation: { duration: 800, easing: 'easeInOutQuart' },
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: false } }
  }
});

// ── Smooth random walk — nudges each value up or down slightly ────
function nudge(value, min, max, maxStep) {
  const change = (Math.random() - 0.5) * 2 * maxStep;
  return Math.min(max, Math.max(min, Math.round(value + change)));
}

function generateNextData() {
  revenueData = revenueData.map(v => nudge(v, 75000, 115000, 3000));
  userData    = userData.map(v =>    nudge(v, 800,   1600,   80));
}

// ── Update KPI cards ──────────────────────────────────────────────
function updateKPIs() {
  const totalRevenue = revenueData.reduce((a, b) => a + b, 0);
  const avgUsers     = Math.round(userData.reduce((a, b) => a + b, 0) / userData.length);
  const conversion   = (3.5 + Math.random() * 1.5).toFixed(1);
  const tickets      = Math.floor(Math.random() * 25 + 8);

  document.getElementById('revenue').textContent    = '$' + totalRevenue.toLocaleString();
  document.getElementById('users').textContent      = avgUsers.toLocaleString();
  document.getElementById('conversion').textContent = conversion + '%';
  document.getElementById('tickets').textContent    = tickets;
  document.getElementById('last-updated').textContent =
    'Last updated: ' + new Date().toLocaleTimeString();
}

// ── Update charts with smooth animation ──────────────────────────
function updateCharts() {
  revenueChart.data.datasets[0].data = [...revenueData];
  revenueChart.update();
  userChart.data.datasets[0].data = [...userData];
  userChart.update();
}

// ── Main tick ─────────────────────────────────────────────────────
function tick() {
  generateNextData();
  updateKPIs();
  updateCharts();
}

// Run immediately then every 5 seconds for lively updates
tick();
setInterval(tick, 5000);