// ── API CONFIGURATION ─────────────────────────────────────────────
// When VMS Techs provides a real API, replace the URL below and
// set USE_REAL_API to true. No other changes needed.
const API_URL      = 'https://your-api-endpoint.com/data';
const USE_REAL_API = false; // ← flip to true when real API is ready

// ── State ─────────────────────────────────────────────────────────
const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

let revenueData    = [95000, 93500, 84500, 96000, 83800, 88500, 93500];
let userData       = [1130,  1140,  1270,  1280,  1060,  1130,  1120];
let conversionData = [4.2,   3.9,   4.5,   5.1,   3.6,   4.8,   4.1];
let ticketData     = [22,    18,    30,    14,    28,    20,    25];

let prevRevenue    = null;
let prevUsers      = null;
let prevConversion = null;
let prevTickets    = null;

// ── Clock ─────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleTimeString('en-GB', { hour12: false });
  document.getElementById('date').textContent =
    now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
updateClock();
setInterval(updateClock, 1000);

// ── Sparkline charts (mini charts inside KPI cards) ───────────────
function makeSparkline(id, data, color) {
  return new Chart(document.getElementById(id).getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{ data, borderColor: color, borderWidth: 1.5,
        pointRadius: 0, tension: 0.4, fill: false }]
    },
    options: {
      responsive: false, animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });
}

const sparkRevenue    = makeSparkline('spark-revenue',    [...revenueData],    '#3b82f6');
const sparkUsers      = makeSparkline('spark-users',      [...userData],       '#06d6a0');
const sparkConversion = makeSparkline('spark-conversion', [...conversionData], '#f59e0b');
const sparkTickets    = makeSparkline('spark-tickets',    [...ticketData],     '#ef4444');

// ── Main charts ───────────────────────────────────────────────────
Chart.defaults.color = '#5a7199';
Chart.defaults.borderColor = 'rgba(99,179,255,0.08)';

const revenueChart = new Chart(
  document.getElementById('revenueChart').getContext('2d'), {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'Revenue ($)',
      data: [...revenueData],
      borderColor: '#3b82f6',
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, 'rgba(59,130,246,0.25)');
        gradient.addColorStop(1, 'rgba(59,130,246,0.01)');
        return gradient;
      },
      tension: 0.4, fill: true, pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#070b14', pointBorderWidth: 2,
      pointHoverRadius: 6
    }]
  },
  options: {
    responsive: true,
    animation: { duration: 700, easing: 'easeInOutQuart' },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(99,179,255,0.06)' }, ticks: { font: { family: 'Space Mono', size: 10 } } },
      y: { grid: { color: 'rgba(99,179,255,0.06)' }, ticks: { font: { family: 'Space Mono', size: 10 },
        callback: v => '$' + (v/1000).toFixed(0) + 'k' } }
    }
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
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, 'rgba(6,214,160,0.7)');
        gradient.addColorStop(1, 'rgba(6,214,160,0.15)');
        return gradient;
      },
      borderRadius: 6, borderSkipped: false
    }]
  },
  options: {
    responsive: true,
    animation: { duration: 700, easing: 'easeInOutQuart' },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Space Mono', size: 10 } } },
      y: { grid: { color: 'rgba(99,179,255,0.06)' }, ticks: { font: { family: 'Space Mono', size: 10 } } }
    }
  }
});

// ── Delta badge helper ────────────────────────────────────────────
function setDelta(elId, current, previous, prefix='', suffix='', lowerIsBetter=false) {
  if (previous === null) return;
  const el   = document.getElementById(elId);
  const diff = current - previous;
  const pct  = ((diff / Math.abs(previous)) * 100).toFixed(1);
  const up   = diff >= 0;
  const good = lowerIsBetter ? !up : up;
  el.textContent = (up ? '▲ +' : '▼ ') + prefix + Math.abs(diff).toLocaleString() + suffix + ' (' + Math.abs(pct) + '%)';
  el.className   = 'kpi-delta ' + (diff === 0 ? 'neutral' : good ? 'up' : 'down');
}

// ── AI Insights engine ────────────────────────────────────────────
function generateInsights(data) {
  const insights = [];

  // Revenue check
  const totalRev  = data.revenueHistory.reduce((a,b)=>a+b,0);
  const avgRev    = totalRev / data.revenueHistory.length;
  const minRevDay = labels[data.revenueHistory.indexOf(Math.min(...data.revenueHistory))];
  const maxRevDay = labels[data.revenueHistory.indexOf(Math.max(...data.revenueHistory))];
  if (avgRev < 88000) {
    insights.push({ type:'alert', label:'Revenue Warning',
      text: `Average weekly revenue is $${Math.round(avgRev).toLocaleString()} — below the $88k target. Lowest day: <strong>${minRevDay}</strong>. Consider reviewing pricing or promotions.` });
  } else {
    insights.push({ type:'good', label:'Revenue Health',
      text: `Revenue is performing well. Peak day is <strong>${maxRevDay}</strong> at $${Math.max(...data.revenueHistory).toLocaleString()}. Sustain current strategy.` });
  }

  // Conversion check
  if (parseFloat(data.conversion) < 4.0) {
    insights.push({ type:'alert', label:'Conversion Drop',
      text: `Conversion rate is at <strong>${data.conversion}%</strong> — below the 4% threshold. Users may be dropping off at checkout or sign-up. Review the funnel.` });
  } else if (parseFloat(data.conversion) > 5.0) {
    insights.push({ type:'good', label:'Conversion Strong',
      text: `Conversion rate hit <strong>${data.conversion}%</strong> — above target. Current campaigns or UX changes appear to be working effectively.` });
  } else {
    insights.push({ type:'warn', label:'Conversion Watch',
      text: `Conversion at <strong>${data.conversion}%</strong> — within range but trending near the lower boundary. Monitor closely over the next 24h.` });
  }

  // Tickets check
  if (data.tickets > 25) {
    insights.push({ type:'alert', label:'High Ticket Volume',
      text: `<strong>${data.tickets}</strong> open support tickets detected — above the 25-ticket threshold. Customer satisfaction may be at risk. Escalate to support team.` });
  } else if (data.tickets < 12) {
    insights.push({ type:'good', label:'Support Healthy',
      text: `Only <strong>${data.tickets}</strong> open tickets — well within acceptable range. Support team is keeping up with demand.` });
  } else {
    insights.push({ type:'info', label:'Tickets Normal',
      text: `<strong>${data.tickets}</strong> open tickets — normal operational load. No immediate action needed.` });
  }

  // User trend
  const userTrend = data.userHistory[6] - data.userHistory[0];
  if (userTrend > 100) {
    insights.push({ type:'good', label:'User Growth',
      text: `Active users grew by <strong>${userTrend.toLocaleString()}</strong> over the week. Retention and acquisition are both trending positively.` });
  } else if (userTrend < -100) {
    insights.push({ type:'alert', label:'User Decline',
      text: `Active users dropped by <strong>${Math.abs(userTrend).toLocaleString()}</strong> over the week. Investigate churn causes — check onboarding and recent feature changes.` });
  } else {
    insights.push({ type:'info', label:'Users Stable',
      text: `User count is stable this week with minimal fluctuation (Δ${userTrend > 0 ? '+' : ''}${userTrend}). Consistent but no growth momentum detected.` });
  }

  return insights;
}

function renderInsights(insights) {
  const body = document.getElementById('insights-body');
  body.innerHTML = insights.map(i => `
    <div class="insight-item ${i.type}">
      <span class="insight-label">${i.label}</span>
      ${i.text}
    </div>
  `).join('');
}

// ── Real API fetch ────────────────────────────────────────────────
async function fetchFromAPI() {
  const res  = await fetch(API_URL);
  const json = await res.json();
  return {
    revenue:        json.total_revenue,
    users:          json.active_users,
    conversion:     json.conversion_rate,
    tickets:        json.open_tickets,
    revenueHistory: json.revenue_history,
    userHistory:    json.user_history,
  };
}

// ── Smooth random walk ────────────────────────────────────────────
function nudge(value, min, max, maxStep) {
  const change = (Math.random() - 0.5) * 2 * maxStep;
  return Math.min(max, Math.max(min, parseFloat((value + change).toFixed(2))));
}

function getMockData() {
  revenueData    = revenueData.map(v    => Math.round(nudge(v,    75000, 115000, 2800)));
  userData       = userData.map(v       => Math.round(nudge(v,    800,   1600,   70)));
  conversionData = conversionData.map(v => nudge(v, 2.5, 6.5, 0.3));
  ticketData     = ticketData.map(v     => Math.round(nudge(v, 5, 45, 3)));

  return {
    revenue:        revenueData.reduce((a,b)=>a+b,0),
    users:          Math.round(userData.reduce((a,b)=>a+b,0)/userData.length),
    conversion:     (conversionData.reduce((a,b)=>a+b,0)/conversionData.length).toFixed(1),
    tickets:        Math.round(ticketData.reduce((a,b)=>a+b,0)/ticketData.length),
    revenueHistory: [...revenueData],
    userHistory:    [...userData],
  };
}

// ── Update KPI cards ──────────────────────────────────────────────
function updateKPIs(data) {
  document.getElementById('revenue').textContent    = '$' + Number(data.revenue).toLocaleString();
  document.getElementById('users').textContent      = Number(data.users).toLocaleString();
  document.getElementById('conversion').textContent = data.conversion + '%';
  document.getElementById('tickets').textContent    = data.tickets;
  document.getElementById('last-updated').textContent = 'Updated ' + new Date().toLocaleTimeString();

  setDelta('revenue-delta',    data.revenue,           prevRevenue,    '$', '', false);
  setDelta('users-delta',      data.users,             prevUsers,      '',  '', false);
  setDelta('conversion-delta', parseFloat(data.conversion), prevConversion, '', '%', false);
  setDelta('tickets-delta',    data.tickets,           prevTickets,    '',  '', true);

  prevRevenue    = data.revenue;
  prevUsers      = data.users;
  prevConversion = parseFloat(data.conversion);
  prevTickets    = data.tickets;
}

// ── Update all charts ─────────────────────────────────────────────
function updateCharts(data) {
  revenueChart.data.datasets[0].data = data.revenueHistory;
  revenueChart.update();
  userChart.data.datasets[0].data = data.userHistory;
  userChart.update();

  sparkRevenue.data.datasets[0].data    = data.revenueHistory;    sparkRevenue.update();
  sparkUsers.data.datasets[0].data      = data.userHistory;       sparkUsers.update();
  sparkConversion.data.datasets[0].data = [...conversionData];    sparkConversion.update();
  sparkTickets.data.datasets[0].data    = [...ticketData];        sparkTickets.update();
}

// ── Main tick ─────────────────────────────────────────────────────
async function tick() {
  try {
    const data = USE_REAL_API ? await fetchFromAPI() : getMockData();
    updateKPIs(data);
    updateCharts(data);
    renderInsights(generateInsights(data));
  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

tick();
setInterval(tick, 2000);