// Create gauges
// function createGauge(elementId, value, max, colorScheme) {
//   const ctx = document.getElementById(elementId).getContext('2d');
//   new Chart(ctx, {
//     type: 'doughnut',
//     data: {
//       datasets: [{
//         data: [value, max - value],
//         backgroundColor: [colorScheme, '#4a5568'],
//         borderWidth: 0,
//         circumference: 180,
//         rotation: 270
//       }]
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       cutout: '70%',
//       plugins: {
//         legend: { display: false },
//         tooltip: { enabled: false }
//       }
//     }
//   });
// }

// // Initialize gauges
// createGauge('dsoGauge', 45, 90, '#38b2ac');
// createGauge('dpoGauge', 32, 60, '#ecc94b');
// createGauge('equityGauge', 75.38, 100, '#f56565');
// createGauge('debtGauge', 1.1, 5, '#48bb78');

// // Aging Chart
// const agingCtx = document.getElementById('agingChart').getContext('2d');
// new Chart(agingCtx, {
//   type: 'bar',
//   data: {
//     labels: ['Current', '1-30', '31-60', '61-90', '91+'],
//     datasets: [
//       {
//         label: 'Accounts Receivable',
//         data: [2500000, 1800000, 1200000, 800000, 321280],
//         backgroundColor: '#38b2ac',
//         order: 1
//       },
//       {
//         label: 'Accounts Payable',
//         data: [900000, 450000, 150000, 80000, 50270],
//         backgroundColor: '#e53e3e',
//         order: 2
//       }
//     ]
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       x: { grid: { display: false } },
//       y: {
//         beginAtZero: true,
//         ticks: {
//           callback: function(value) {
//             return '$' + (value/1000000).toFixed(1) + 'M';
//           }
//         }
//       }
//     },
//     plugins: {
//       legend: { position: 'bottom', labels: { color: '#e2e8f0' } }
//     }
//   }
// });

// // Profit and Loss Chart
// const plCtx = document.getElementById('profitLossChart').getContext('2d');
// new Chart(plCtx, {
//   type: 'bar',
//   data: {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//     datasets: [
//       {
//         label: 'Revenue',
//         data: [800000, 820000, 850000, 880000, 900000, 950000, 1000000, 1050000, 1100000, 1150000, 1200000, 1250000],
//         backgroundColor: '#48bb78',
//         stack: 'stack1'
//       },
//       {
//         label: 'Cost',
//         data: [500000, 510000, 520000, 530000, 540000, 550000, 560000, 570000, 580000, 590000, 600000, 610000],
//         backgroundColor: '#ecc94b',
//         stack: 'stack1'
//       },
//       {
//         label: 'Profit',
//         data: [300000, 310000, 330000, 350000, 360000, 400000, 440000, 480000, 520000, 560000, 600000, 640000],
//         backgroundColor: '#38b2ac',
//         stack: 'stack1'
//       }
//     ]
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       x: { grid: { display: false } },
//       y: {
//         beginAtZero: true,
//         position: 'left',
//         ticks: {
//           callback: function(value) {
//             return '$' + (value/1000).toFixed(0) + 'K';
//           }
//         }
//       }
//     },
//     plugins: {
//       legend: { position: 'bottom', labels: { color: '#e2e8f0' } }
//     }
//   }
// });

// // Working Capital Chart
// const wcCtx = document.getElementById('workingCapitalChart').getContext('2d');
// new Chart(wcCtx, {
//   type: 'line',
//   data: {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//     datasets: [
//       {
//         label: 'Net Working Capital',
//         data: [1200000, 1400000, 1300000, 1500000, 1600000, 1400000, 1500000, 2300000, 2100000, 1900000, 1700000, 1500000],
//         borderColor: '#38b2ac',
//         backgroundColor: 'rgba(56, 178, 172, 0.1)',
//         fill: true,
//         tension: 0.3
//       },
//       {
//         label: 'Gross Working Capital',
//         data: [2000000, 2100000, 1900000, 2000000, 2200000, 2100000, 2300000, 3000000, 2700000, 2500000, 2300000, 2100000],
//         borderColor: '#ecc94b',
//         backgroundColor: 'rgba(236, 201, 75, 0.1)',
//         fill: true,
//         tension: 0.3
//       }
//     ]
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       x: { grid: { display: false } },
//       y: {
//         beginAtZero: true,
//         position: 'left',
//         ticks: {
//           callback: function(value) {
//             return '$' + (value/1000000).toFixed(1) + 'M';
//           }
//         }
//       }
//     },
//     plugins: {
//       legend: { display: false }
//     }
//   }
// });








// Update real-time date

function updateDate() {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('currentDateDashboard').textContent = today;
  document.getElementById('currentDateMyProfile').textContent = today;
  document.getElementById('currentDateTransactions').textContent = today;
  document.getElementById('currentDateAssets').textContent = today;
  document.getElementById('currentDateGoals').textContent = today;
  document.getElementById('currentDateIncome').textContent = today;
  document.getElementById('currentDateLiabilities').textContent = today;
  document.getElementById('currentDateExpenses').textContent = today;
  document.getElementById('currentDateCategory').textContent = today;
  document.getElementById('currentDateReminder').textContent = today;
  document.getElementById('currentDateCalculator').textContent = today;
  updateNotifications(); // Update notifications with the current date
}
document.addEventListener('DOMContentLoaded', () => {
  updateDate();
});

// Sidebar navigation functionality
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    if (item.querySelector('a')) return; // Skip if it's the Home link

    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // Get the section name and convert to ID format
    const section = item.querySelector('div:last-child').textContent.toLowerCase().replace(' ', '-');
        document.querySelectorAll('.dashboard-section, .form-container').forEach(container => {
          container.style.display = 'none';
        });
        document.querySelector('#my-profile-tabs').style.display = 'none';

    // Show the appropriate section
    if (section === 'dashboard') {
      document.querySelector('#dashboard').style.display = 'block';
      document.querySelector('#my-profile-tabs').style.display = 'none';
    } else {
      document.querySelector('#my-profile-tabs').style.display = 'flex';
      document.querySelector(`#${section}`).style.display = 'block';

      // Sync the active tab with the sidebar selection
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        const tabText = tab.querySelector('.tab-icon + div').textContent.toLowerCase().replace(' ','-');
        if (tabText === section) {
          tab.classList.add('active');
        }
      });
    }
  });
});

// Tab switching functionality
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const tabId = tab.querySelector('.tab-icon + div').textContent.toLowerCase().replace(' ','-');
    document.querySelectorAll('.form-container').forEach(container => {
      container.style.display = 'none';
      if (container.id === tabId) {
        container.style.display = 'block';
      }
    });
  });
});

// Notification functionality
let reminders = [];
const notificationSidebar = document.getElementById('notificationSidebar');
const notificationList = document.getElementById('notificationList');
const bellIcons = document.querySelectorAll('.notifications');
const closeSidebarBtn = document.getElementById('closeSidebar');
const saveReminderBtn = document.getElementById('saveReminder');

function updateNotifications() {
  const today = new Date().toISOString().split('T')[0];
  if (reminders.length === 0) {
    notificationList.innerHTML = '<li>No reminders</li>';
  } else {
    notificationList.innerHTML = reminders.map(reminder => {
      const isToday = reminder.date === today;
      return `<li class="${isToday ? 'today' : ''}">${reminder.title} - ${reminder.priority} Priority<br>${reminder.notes}<br>Due: ${new Date(reminder.date).toLocaleDateString()}</li>`;
    }).join('');
  }
  
  const badges = document.querySelectorAll('.notification-badge');
  badges.forEach(badge => {
    badge.style.display = 'flex';
    badge.textContent = reminders.length;
  });
}

bellIcons.forEach(bell => {
  bell.addEventListener('click', () => {
    notificationSidebar.classList.add('active');
  });
});

closeSidebarBtn.addEventListener('click', () => {
  notificationSidebar.classList.remove('active');
});

saveReminderBtn.addEventListener('click', () => {
  const title = document.getElementById('reminderTitle').value;
  const date = document.getElementById('reminderDate').value;
  const priority = document.getElementById('reminderPriority').value;
  const notes = document.getElementById('reminderNotes').value;

  if (title && date) {
    reminders.push({ title, date, priority, notes });
    document.getElementById('reminderTitle').value = '';
    document.getElementById('reminderDate').value = '';
    document.getElementById('reminderPriority').value = 'Low';
    document.getElementById('reminderNotes').value = '';
    updateNotifications(); // Update notifications immediately after saving
  }
});

// Initial setup
document.querySelector('#my-profile').style.display = 'block'; // Start with My Profile
document.querySelector('.nav-item:nth-child(3)').classList.add('active'); // Set My Profile as active
document.querySelector('#my-profile-tabs').style.display = 'flex'; // Show tabs initially
updateDate();
setInterval(updateDate, 60000); // Update date every minute
updateNotifications(); // Initial notification update



function renderArcGauge(canvasId, percent, labelId, current, goal, color = '#22c55e') {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const percentDisplay = Math.min(100, Math.round(percent));

  if (Chart.getChart(canvasId)) {
    Chart.getChart(canvasId).destroy();
  }

  document.getElementById(labelId).textContent = `${percentDisplay}%`;
  if (canvasId === 'goalCompletionGauge') {
    document.getElementById('goalStatsText').textContent = `₹${current.toLocaleString()} / ₹${goal.toLocaleString()}`;
  } else if (canvasId === 'assetLiabilityGauge') {
    document.getElementById('assetStatsText').textContent = `₹${current.toLocaleString()} / ₹${goal.toLocaleString()}`;
  }

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [percentDisplay, 100 - percentDisplay],
        backgroundColor: [color, '#334155'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      rotation: -90,
      circumference: 180,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
}


