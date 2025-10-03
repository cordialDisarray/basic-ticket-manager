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

      const titleMap = {
        users: "Users",
        createUser: "Create User",
        editUser: "Edit User",
        tickets: "Tickets",
        home: "Dashboard"
      }

      const pageTitle = document.getElementById("pageTitle");
      if (pageTitle && titleMap[pageName]) {
        pageTitle.textContent = titleMap[pageName];
      }

      const initFuncName = 'init' + pageName.charAt(0).toUpperCase() + pageName.slice(1) + 'Page';

      if (typeof window[initFuncName] === 'function') {
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

  const assignBtn = document.getElementById("assign-ticket-btn");
  if (assignBtn) {
    assignBtn.addEventListener("click", () => {
      loadPage("tickets")
    })
  }

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
    if (assignmentCount['unassigned'] === 1) {
      unassignedNum.textContent = assignmentCount["unassigned"] + " is unassigned";
    } else {
      unassignedNum.textContent = assignmentCount["unassigned"] + " are unassigned";
    }
  });

  axios.get('/api/tickets?page=0&size=50')
    .then(response => {
      const tickets = response.data.content;
      const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
      const weights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const colors = { CRITICAL: "critical", HIGH: "high", MEDIUM: "medium", LOW: "low" };

      const userStats = {};

      tickets.forEach(ticket => {
        if (!ticket.assignedTo) return;
        const name = ticket.assignedTo.fullName;
        const priority = ticket.priority;

        if (!userStats[name]) {
          userStats[name] = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
        }

        userStats[name][priority]++;
      });

      const sortedUsers = [];

      for (const [name, stats] of Object.entries(userStats)) {
        let score = 0;
        for (let i = 0; i < priorities.length; i++) {
          const p = priorities[i];
          score += stats[p] * weights[p];
        }
        sortedUsers.push({ name, stats, score });
      }

      sortedUsers.sort((a, b) => b.score - a.score);

      const ul = document.querySelector("#user-list-section ul");
      ul.innerHTML = "";

      sortedUsers.slice(0, 5).forEach(user => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center flex-wrap";

        li.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="bi bi-person-circle me-2"></i>${user.name}
        </div>
        <div>
          ${priorities.map(p =>
          `<span class="badge rounded-pill me-1 ${colors[p]}">${user.stats[p]}</span>`
        ).join("")}
        </div>
      `;

        ul.appendChild(li);
      });
    })
    .catch(error => {
      console.error("Error fetching tickets: ", error);
    });
}

function initUsersPage() {
  const container = document.getElementById("user-cards");
  const sortBySelect = document.getElementById("sortBy");
  const orderBtn = document.getElementById("orderBtn");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  let currentSortBy = "fullName";
  let currentOrder = "asc";
  let currentPage = 0;
  const pageSize = 6;
  let totalPages = 1;
  let ticketsData = [];

  const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const weights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  const colors = { CRITICAL: "critical", HIGH: "high", MEDIUM: "medium", LOW: "low" };

  axios.get("/api/tickets?page=0&size=50")
    .then(res => {
      ticketsData = res.data.content;
      fetchUsers();
    })
    .catch(err => console.error("Error fetching tickets:", err));

  function fetchUsers() {
    axios.get("/api/users", {
      params: { page: currentPage, size: pageSize, sortBy: currentSortBy, order: currentOrder }
    })
      .then(res => {
        const users = res.data.content;
        totalPages = res.data.totalPages;

        if (!container) return;
        container.innerHTML = "";

        const userStats = {};
        ticketsData.forEach(ticket => {
          if (!ticket.assignedTo) return;
          const name = ticket.assignedTo.fullName;
          const priority = ticket.priority;
          if (!userStats[name]) userStats[name] = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
          userStats[name][priority]++;
        });

        users.forEach(user => {
          const stats = userStats[user.fullName] || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
          const col = document.createElement("div");
          col.classList.add("col-md-4");

          col.innerHTML = `
          <div class="card border-0 rounded-5 ${user.position.toLowerCase()}">
            <h2></h2>
            <div class="d-flex justify-content-center align-items-center flex-column position-relative" style="color: #557089ff;">
              <i class="fa-solid fa-user fa-2x"></i>
              <h5 class="mt-2 mb-0">${user.fullName}</h5>
              <p id="position-color"><strong>⬤ ${user.position}</strong></p>

              <i class="fa-solid fa-pencil position-absolute" style="top: 0; right: 0; transform: translateY(30%); cursor: pointer; color: #7a96b1ff;" title="Edit"></i>
              <i class="fa-solid fa-user-minus position-absolute" style="top: 0; left: 0; transform: translateY(30%); cursor: pointer; color: #7a96b1ff;" title="Delete"></i>
            </div>

            <span class="section-title">Email</span>
            <div class="section"><p style="margin-bottom: 0px; color: #748ba1ff">${user.email}</p></div>

            <span class="section-title">Tickets</span>
            <div class="section" style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap">
              ${priorities.map(p =>
            `<span class="badge rounded-pill ${colors[p]}">${stats[p]}</span>`
          ).join("")}
            </div>
          </div>
          `;

          col.querySelector(".fa-pencil").addEventListener("click", () => {
            window.currentEditingUserId = user.userId;
            loadPage("editUser");
          });


          col.querySelector(".fa-user-minus").addEventListener("click", () => {
            const deleteMsg = `Are you sure you want to delete user ${user.fullName}?\n(All assigned tickets will become unassigned.)`;
            if (confirm(deleteMsg) === true) {
              axios.delete(`/api/users/${user.userId}`)
                .then(() => {
                  alert(`User ${user.fullName} has been deleted from user profiles, and their tickets are now unassigned.`);
                  fetchUsers();
                }).catch(error => {
                  console.log("Error deleting user.", error);
                  alert("Failed to delete user.");
                })
            }
          });

          container.appendChild(col);
        });

        pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage + 1 >= totalPages;

        const createUserBtn = document.getElementById("create-ticket-btn");
        if (createUserBtn) {
          createUserBtn.addEventListener("click", () => {
            loadPage("createUser");
          });
        }
      })
      .catch(err => console.error("Error fetching users:", err));
  }

  sortBySelect.addEventListener("change", e => { currentSortBy = e.target.value; currentPage = 0; fetchUsers(); });
  orderBtn.addEventListener("click", () => { currentOrder = currentOrder === "asc" ? "desc" : "asc"; orderBtn.textContent = currentOrder.toUpperCase(); currentPage = 0; fetchUsers(); });
  prevBtn.addEventListener("click", () => { if (currentPage > 0) { currentPage--; fetchUsers(); } });
  nextBtn.addEventListener("click", () => { if (currentPage + 1 < totalPages) { currentPage++; fetchUsers(); } });


}

function initEditUserPage() {
  const userId = window.currentEditingUserId;
  if (!userId) return;

  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const positionInput = document.getElementById("position");

  axios.get(`/api/users/${userId}`)
    .then(response => {
      const user = response.data;
      fullNameInput.value = user.fullName;
      emailInput.value = user.email;
      positionInput.value = user.position;
    })
    .catch(err => console.error("Failed to load user data.", err));

  const editForm = document.getElementById("editUserForm");
  if (editForm) {
    editForm.addEventListener("submit", e => {
      e.preventDefault();

      const fullName = fullNameInput.value.trim();
      const email = emailInput.value.trim();
      const position = positionInput.value.trim();

      if (!fullName || !email || !position) {
        alert("All fields are required!");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email address!");
        return;
      }

      const updatedUser = { userId, fullName, email, position };

      axios.put(`/api/users/${userId}`, updatedUser, {
        headers: { "Content-Type": "application/json" }
      })
        .then(() => {
          alert("User updated successfully.");
          loadPage("users");
        })
        .catch(err => {
          alert("Failed to update user.");
          console.error(err);
        });
    });
  }

  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      loadPage("users");
    });
  }
}



function initCreateUserPage() {
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const positionInput = document.getElementById("position");

  const createForm = document.getElementById("createUserForm");
  if (createForm) {
    createForm.addEventListener("submit", e => {
      e.preventDefault();

      const fullName = fullNameInput.value.trim();
      const email = emailInput.value.trim();
      const position = positionInput.value.trim();

      if (!fullName || !email || !position) {
        alert("All fields are required!");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email address!");
        return;
      }

      const newUser = { fullName, email, position };

      axios.post("/api/users", newUser)
        .then(() => {
          alert("User created successfully.");
          loadPage("users");
        })
        .catch(err => {
          alert("Failed to create user.");
          console.error(err);
        });
    });
  }
}