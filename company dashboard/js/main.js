// Initialize values
let revenue = 1000;
let productivity = 70;
let satisfaction = 80;

// Select display elements
const revElem = document.getElementById('revenue');
const prodElem = document.getElementById('productivity');
const satElem = document.getElementById('satisfaction');
const fileInput = document.getElementById('dataFile');
const uploadStatus = document.getElementById('uploadStatus');
const uploadGate = document.getElementById('uploadGate');
const dashboardSection = document.getElementById('dashboardSection');
const skipButton = document.getElementById('skipToDashboard');

// Holds the live random update interval so we can stop it when user uploads data
let liveIntervalId = null;

// Small helper to add a brief "pop" animation whenever a metric updates
function bumpStat(el) {
  if (!el) return;
  el.classList.remove('updated');
  // Force reflow so the animation can restart
  void el.offsetWidth;
  el.classList.add('updated');
}

// Create live charts
const revChart = new Chart(document.getElementById('revenueChart'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Revenue ($)',
      data: [],
      borderColor: 'rgba(56, 189, 248, 0.95)',
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
      borderWidth: 2,
      tension: 0.35,
      fill: true,
      pointRadius: 0,
      pointHitRadius: 12
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
          font: {
            family: 'Poppins'
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af',
          maxTicksLimit: 5
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.18)'
        }
      },
      y: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.16)'
        }
      }
    }
  }
});

const prodChart = new Chart(document.getElementById('productivityChart'), {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Productivity (%)',
      data: [],
      backgroundColor: 'rgba(74, 222, 128, 0.75)',
      borderColor: 'rgba(22, 163, 74, 0.9)',
      borderWidth: 1.2,
      borderRadius: 12,
      maxBarThickness: 40
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 450,
      easing: 'easeOutCubic'
    },
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
          font: {
            family: 'Poppins'
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          display: false
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)'
        },
        suggestedMin: 50,
        suggestedMax: 100
      }
    }
  }
});

const satChart = new Chart(document.getElementById('satisfactionChart'), {
  type: 'doughnut',
  data: {
    labels: ['Satisfied', 'Unsatisfied'],
    datasets: [{
      data: [satisfaction, 100 - satisfaction],
      backgroundColor: ['#facc15', 'rgba(30, 64, 175, 0.9)'],
      borderColor: ['rgba(250, 204, 21, 0.95)', 'rgba(15, 23, 42, 0.95)'],
      borderWidth: 2,
      hoverOffset: 10
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 600
    },
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
          font: {
            family: 'Poppins'
          }
        }
      }
    }
  }
});

// Start / stop demo live data mode
function startLiveMode() {
  if (liveIntervalId !== null) return;

  if (uploadStatus) {
    uploadStatus.textContent = 'Live demo mode is running…';
  }

  liveIntervalId = setInterval(() => {
    // Generate random changes
    revenue += Math.floor(Math.random() * 200 - 50);
    productivity = Math.min(100, Math.max(50, productivity + (Math.random() * 4 - 2)));
    satisfaction = Math.min(100, Math.max(60, satisfaction + (Math.random() * 3 - 1.5)));

    // Update text with subtle "bump" animation
    revElem.textContent = `$${revenue.toLocaleString()}`;
    prodElem.textContent = `${productivity.toFixed(1)}%`;
    satElem.textContent = `${satisfaction.toFixed(1)}%`;

    bumpStat(revElem);
    bumpStat(prodElem);
    bumpStat(satElem);

    // Update charts
    const now = new Date().toLocaleTimeString();

    // Revenue line
    revChart.data.labels.push(now);
    revChart.data.datasets[0].data.push(revenue);
    if (revChart.data.labels.length > 10) {
      revChart.data.labels.shift();
      revChart.data.datasets[0].data.shift();
    }
    revChart.update();

    // Productivity bar
    prodChart.data.labels.push(now);
    prodChart.data.datasets[0].data.push(productivity);
    if (prodChart.data.labels.length > 10) {
      prodChart.data.labels.shift();
      prodChart.data.datasets[0].data.shift();
    }
    prodChart.update();

    // Satisfaction doughnut
    satChart.data.datasets[0].data = [satisfaction, 100 - satisfaction];
    satChart.update();
  }, 2000); // updates every 2 seconds
}

function stopLiveMode() {
  if (liveIntervalId !== null) {
    clearInterval(liveIntervalId);
    liveIntervalId = null;
  }
}

// Reveal dashboard and optionally start demo mode
function showDashboard(useLiveDemo) {
  if (uploadGate) {
    uploadGate.style.display = 'none';
  }
  if (dashboardSection) {
    dashboardSection.classList.remove('dashboard-hidden');
  }

  if (useLiveDemo) {
    startLiveMode();
  }
}

// Parse a simple CSV string into chart-ready arrays
function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);
  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row.');
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const timeIdx = header.indexOf('time');
  const revIdx = header.indexOf('revenue');
  const prodIdx = header.indexOf('productivity');
  const satIdx = header.indexOf('satisfaction');

  if (timeIdx === -1 || revIdx === -1 || prodIdx === -1 || satIdx === -1) {
    throw new Error('Header must include time,revenue,productivity,satisfaction.');
  }

  const labels = [];
  const revenueData = [];
  const prodData = [];
  const satData = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim());
    if (parts.length <= Math.max(timeIdx, revIdx, prodIdx, satIdx)) continue;

    const t = parts[timeIdx];
    const r = Number(parts[revIdx]);
    const p = Number(parts[prodIdx]);
    const s = Number(parts[satIdx]);

    if (!t || Number.isNaN(r) || Number.isNaN(p) || Number.isNaN(s)) {
      continue;
    }

    labels.push(t);
    revenueData.push(r);
    prodData.push(p);
    satData.push(s);
  }

  if (labels.length === 0) {
    throw new Error('No valid data rows found in CSV.');
  }

  return { labels, revenueData, prodData, satData };
}

// Apply uploaded CSV data to charts and headline stats
function applyUploadedData(parsed) {
  const { labels, revenueData, prodData, satData } = parsed;

  // Stop demo/live mode, then overwrite data
  stopLiveMode();

  if (uploadStatus) {
    uploadStatus.textContent = `Showing uploaded data (${labels.length} points). Demo mode paused.`;
  }

  // Update headline values using the last row
  const lastIdx = labels.length - 1;
  revenue = revenueData[lastIdx];
  productivity = prodData[lastIdx];
  satisfaction = satData[lastIdx];

  revElem.textContent = `$${revenue.toLocaleString()}`;
  prodElem.textContent = `${productivity.toFixed(1)}%`;
  satElem.textContent = `${satisfaction.toFixed(1)}%`;

  bumpStat(revElem);
  bumpStat(prodElem);
  bumpStat(satElem);

  // Revenue line chart
  revChart.data.labels = labels.slice();
  revChart.data.datasets[0].data = revenueData.slice();
  revChart.update();

  // Productivity bar chart
  prodChart.data.labels = labels.slice();
  prodChart.data.datasets[0].data = prodData.slice();
  prodChart.update();

  // Satisfaction doughnut chart (last values only)
  satChart.data.datasets[0].data = [satisfaction, 100 - satisfaction];
  satChart.update();
}

// File upload handling
if (fileInput) {
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    if (uploadStatus) {
      uploadStatus.textContent = 'Reading file…';
    }

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = String(e.target && e.target.result || '');
        const parsed = parseCsv(text);
        applyUploadedData(parsed);
        // Show dashboard using uploaded data, keep demo mode stopped
        showDashboard(false);
      } catch (err) {
        if (uploadStatus) {
          uploadStatus.textContent = `Could not use file: ${err.message}`;
        }
      }
    };
    reader.onerror = () => {
      if (uploadStatus) {
        uploadStatus.textContent = 'Error reading file. Please try again.';
      }
    };
    reader.readAsText(file);
  });
}

// Skip button to go straight to live demo dashboard
if (skipButton) {
  skipButton.addEventListener('click', () => {
    if (uploadStatus) {
      uploadStatus.textContent = 'Live demo mode is running…';
    }
    showDashboard(true);
  });
}
