Chart.register(ChartDataLabels);

const toggler = document.querySelector(".toggle-btn");
const icon = toggler.querySelector("i");

toggler.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("expand");

  icon.classList.toggle("fa-square-caret-left");
  icon.classList.toggle("fa-square-caret-right");
})

const content = document.getElementById('content');

function loadPage(pageName) {
  axios.get(`/pages/${pageName}.html`)
    .then(response => {
      content.innerHTML = response.data;
      window.history.pushState({}, "", `/${pageName}`)

      const initFuncName = 'init' + pageName.charAt(0).toUpperCase() + pageName.slice(1) + 'Page';

      if (typeof window[initFuncName] == 'function') {
        window[initFuncName]();
      }
    })
    .catch(error => {
      content.innerHTML = `<p style="color:red">Failed to load ${pageName}</p>`
    })
}

document.querySelectorAll('.sidebar-link[data-page]')
  .forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const page = link.getAttribute('data-page');
      loadPage(page);
    })
  })

window.addEventListener('popstate', () => {
  const path = window.location.pathname.slice(1);
  if (path) {
    loadPage(path);
  } else {
    loadPage('home')
  }
})

const path = window.location.pathname.slice(1);
if (path) {
  loadPage(path);
} else {
  loadPage('home');
}

function initHomePage() {

  axios.get('/api/tickets/count/priority')
    .then(response => {
      const counts = response.data;

      document.getElementById('critical-count').textContent = counts.CRITICAL;
      document.getElementById('high-count').textContent = counts.HIGH;
      document.getElementById('medium-count').textContent = counts.MEDIUM;
      document.getElementById('low-count').textContent = counts.LOW;
    })
    .catch(error => {
      console.error('Failed to fetch priority counts;', error);
    })

  axios.get('/api/tickets/count/status')
    .then(response => {
      const counts = response.data;

      const labels = ["To Do", "In Progress", "Review", "Blocked"];
      const data = [
        counts["TO_DO"],
        counts["IN_PROGRESS"],
        counts["REVIEW"],
        counts["BLOCKED"]
      ];

      const ctx = document.getElementById('status-chart').getContext('2d');

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: ["#749BCF", "#4FC1CD", "#FFE0A9", "#f4A8BD"],
            borderRadius: 12,
            borderSkipped: false,
            barThickness: 32
          }]
        },
        options: {
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            datalabels: {
              color: '#ffffff',
              anchor: 'start',
              align: 'right',
              clamp: true,
              textShadowColor: 'grey',
              textShadowBlur: 3,
              font: {
                family: 'Instrument Sans',
                size: 14
              },
              formatter: value => value
            }
          },
          scales: {
            x: {
              display: false
            },
            y: {
              border: { display: false },
              grid: { display: false },
              ticks: {
                padding: 16,
                crossAlign: 'inner',
                color: ['#749BCF', '#4BC8D0', '#F1C687', '#F6B0CD'],
                font: {
                  family: 'Instrument sans',
                  size: 14,
                  weight: 500
                }
              }
            }
          }
        }
      });
    })
    .catch(error => {
      console.error("Failed to fetch status coutns", error);
    });

  axios.get("/api/tickets/count/assignment").then(response => {
    const assignmentCount = response.data;

    const data = [
      assignmentCount["assigned"],
      assignmentCount["unassigned"]
    ]

    const pie = document.getElementById('assignment-chart').getContext('2d');

    new Chart(pie, {
      type: 'pie',
      data: {
        labels: ['Assigned', 'Unassigned'],
        datasets: [{
          data: data,
          backgroundColor: ['#C8BBED', '#E6E6E6'],
          datalabels: {
            color: 'white',
            labels: {
              title: {
                font: {
                  size: 15,
                  family: 'Instrument sans'
                }
              },
            }
          }
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    document.getElementById("all-tickets-count").textContent = assignmentCount["unassigned"] + assignmentCount["assigned"];

    const unassignedNum = document.getElementById("unassigned-tickets-count");
    if (assignmentCount['unassigned'] == 1){
      unassignedNum.textContent = assignmentCount["unassigned"] + " is unassigned";
    } else {
      unassignedNum.textContent = assignmentCount["unassigned"] + " are unassigned";
    }
  });

 axios.get('http://localhost:8080/api/tickets?page=0&size=50')
  .then(response => {
    const tickets = response.data.content;
    const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
    const userStats = {};

    tickets.forEach(ticket => {
      if (!ticket.assignedTo) return;
      const name = ticket.assignedTo.fullName;
      const priority = ticket.priority;

      if (!userStats[name]) {
        userStats[name] = {CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0};
      }

      userStats[name][priority]++;
    });

    const sortedUsers = [];
    const weights = {CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1};

    for (const [name, stats] of Object.entries(userStats)) {
      let score = 0;
      for (const p of priorities) {
        score += stats[p] * weights[p];
      }
      sortedUsers.push({name, stats, score});
    }

    sortedUsers.sort((a, b) => b.score - a.score);

    const ul = document.querySelector("#user-list-section ul");

    sortedUsers.slice(0, 5).forEach(user => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center flex-wrap";

      const nameContainer = document.createElement("div");
      nameContainer.className = "d-flex align-items-center";

      const icon = document.createElement("i");
      icon.className = "bi bi-person-circle me-2";
      nameContainer.appendChild(icon);

      const userName = document.createTextNode(user.name);
      nameContainer.appendChild(userName);

      li.appendChild(nameContainer);

      const badgeContainer = document.createElement("div");
      const colors = {CRITICAL: "critical", HIGH: "high", MEDIUM: "medium", LOW: "low"};
      priorities.forEach(p => {
        const badge = document.createElement("span");
        badge.className = `badge rounded-pill me-1 ${colors[p]}`;
        badge.textContent = user.stats[p];
        badgeContainer.appendChild(badge);
      });

      li.appendChild(badgeContainer);
      ul.appendChild(li);
    });
  })
  .catch(error => {
    console.error("Error fetching tickets: ", error);
  });
}




