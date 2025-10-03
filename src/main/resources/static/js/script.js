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
  const createUserBtn = document.getElementById("create-ticket-btn");

  let currentSortBy = "fullName";
  let currentOrder = "asc";
  let currentPage = 0;
  const pageSize = 6;
  let totalPages = 1;
  let ticketsData = [];

  const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const colors = { CRITICAL: "critical", HIGH: "high", MEDIUM: "medium", LOW: "low" };

  const defaultStats = () => Object.fromEntries(priorities.map(p => [p, 0]));

  axios.get("/api/tickets?page=0&size=50")
    .then(response => {
      ticketsData = response.data.content;
      fetchUsers();
    })
    .catch(error => console.error("Error fetching tickets:", error));

  function calculateUserStats() {
    const stats = {};
    for (const ticket of ticketsData) {
      const name = ticket.assignedTo?.fullName;
      const priority = ticket.priority;

      if (!name || !priorities.includes(priority)) continue;

      if (!stats[name]) {
        stats[name] = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
      }

      stats[name][priority]++;
    }
    return stats;
  }

  function renderUserCard(user, stats) {
    const card = document.createElement("div");
    card.classList.add("col-md-4");

    card.innerHTML =
      `<div class="card border-0 rounded-5 ${user.position.toLowerCase()}"> 
      <h2></h2> 

      <div class="d-flex justify-content-center align-items-center flex-column position-relative" style="color: #557089ff;">
        <i class="fa-solid fa-user fa-2x"></i> <h5 class="mt-2 mb-0">${user.fullName}</h5>
        <p id="position-color"><strong>⬤ ${user.position.replace("_", " ")}</strong></p>

        <i class="fa-solid fa-pencil position-absolute" style="top: 0; right: 0; transform: translateY(30%); cursor: pointer; color: #7a96b1ff;" title="Edit"></i>
        <i class="fa-solid fa-user-minus position-absolute" style="top: 0; left: 0; transform: translateY(30%); cursor: pointer; color: #7a96b1ff;" title="Delete"></i>
      </div>

      <span class="section-title">Email</span>

      <div class="section">
        <p style="margin-bottom: 0px; color: #748ba1ff">${user.email}</p>
      </div>

      <span class="section-title">Tickets</span>

      <div class="section" style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap">
        ${priorities.map(p => `<span class="badge rounded-pill ${colors[p]}">${stats[p]}</span>`).join("")} 
      </div>
    </div> `;

    card.querySelector(".fa-pencil").addEventListener("click", () => {
      window.currentEditingUserId = user.userId;
      loadPage("editUser");
    });

    card.querySelector(".fa-user-minus").addEventListener("click", () => {
      if (confirm(`Delete ${user.fullName}? Tickets will be unassigned.`)) {
        axios.delete(`/api/users/${user.userId}`)
          .then(() => {
            alert(`User ${user.fullName} deleted.`);
            fetchUsers();
          })
          .catch(() => alert("Failed to delete user."));
      }
    });

    container.appendChild(card);
  }

  function fetchUsers() {
    axios.get("/api/users", {
      params: { page: currentPage, size: pageSize, sortBy: currentSortBy, order: currentOrder }
    })
      .then(response => {
        const users = response.data.content;
        totalPages = response.data.totalPages;
        container.innerHTML = "";
        const userStats = calculateUserStats();
        users.forEach(user => renderUserCard(user, userStats[user.fullName] ?? defaultStats()));
        pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage + 1 >= totalPages;
      })
      .catch(error => console.error("Error fetching users:", error));
  }

  sortBySelect?.addEventListener("change", e => {
    currentSortBy = e.target.value;
    currentPage = 0;
    fetchUsers();
  });

  orderBtn?.addEventListener("click", () => {
    currentOrder = currentOrder === "asc" ? "desc" : "asc";
    orderBtn.textContent = currentOrder.toUpperCase();
    currentPage = 0;
    fetchUsers();
  });

  prevBtn?.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      fetchUsers();
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (currentPage + 1 < totalPages) {
      currentPage++;
      fetchUsers();
    }
  });

  createUserBtn?.addEventListener("click", () => loadPage("createUser"));
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
    .catch(error => console.error("Failed to load user data.", error));

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

      axios.put(`/api/users/${userId}`, updatedUser)
        .then(() => {
          alert("User updated successfully.");
          loadPage("users");
        })
        .catch(error => {
          alert("Failed to update user.");
          console.error(error);
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
        .catch(error => {
          alert("Failed to create user.");
          console.error(error);
        });
    });

    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        loadPage("users");
      });
    }
  }
}

function initTicketsPage() {
  const container = document.getElementById("user-cards");
  const sortBySelect = document.getElementById("sortBy");
  const orderBtn = document.getElementById("orderBtn");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const createTicketBtn = document.getElementById("create-ticket-btn");

  let currentSortBy = "priority";
  let currentOrder = "asc";
  let currentPage = 0;
  const pageSize = 6;
  let totalPages = 1;

  const colors = { CRITICAL: "critical", HIGH: "high", MEDIUM: "medium", LOW: "low" };

  function renderTicketCard(ticket) {
    const card = document.createElement("div");
    card.classList.add("col-md-4");

    const assignedTo = ticket.assignedTo?.fullName;
    const priorityClass = colors[ticket.priority];

    card.innerHTML = `
      <div class="card border-0 rounded-5 ${priorityClass}">
        <h2></h2>
        <div class="d-flex justify-content-center align-items-center flex-column position-relative" style="color: #557089ff;">
          <h5 class="text-center" style="max-width:240px;">${ticket.title}</h5>
          <div class="d-flex gap-3 justify-content-center mb-2">
            <p><strong>⬤ ${ticket.priority}</strong></p>
            <p><strong style="color: rgba(136, 158, 178, 1);">⬤ ${ticket.type}</strong></p>
          </div>

          <i class="fa-solid fa-pencil position-absolute" style="top: 0; right: 0; transform: translateY(30%); cursor: pointer; color: #7a96b1ff" title="Edit"></i>
          <i class="fa-solid fa-trash position-absolute" style="top: 0; left: 0; transform: translateY(30%); cursor: pointer; color: #7a96b1ff" title="Delete"></i>
        </div>

        <div class="mt-auto">
          <p style="color: #7a96b1ff">Created at: ${ticket.createdAt} | Deadline: ${ticket.deadline}</p>
          <span class="section-title">Assigned To</span>
          <div class="section">
            <p style="margin-bottom: 0px; color: #748ba1ff">${ticket.assignedTo.fullName || "Unassigned."}</p>
          </div>

          <span class="section-title">Description</span>
          <div class="section">
            <p style="margin-bottom: 0px; color: #748ba1ff">${ticket.description || "No description provided."}</p>
          </div>
        </div>
      </div>
    `;

    card.querySelector(".fa-pencil").addEventListener("click", () => {
      window.currentEditingTicketId = ticket.ticketId;
      loadPage("editTicket");
    });

    card.querySelector(".fa-trash").addEventListener("click", () => {
      if (confirm(`Delete ticket "${ticket.title}"?`)) {
        axios.delete(`/api/tickets/${ticket.ticketId}`)
          .then(() => {
            alert(`Ticket "${ticket.title}" deleted.`);
            fetchTickets();
          })
          .catch(() => alert("Failed to delete ticket."));
      }
    });

    container.appendChild(card);
  }

  function fetchTickets() {
    axios.get("/api/tickets", {
      params: {
        page: currentPage,
        size: pageSize,
        sortBy: currentSortBy,
        order: currentOrder
      }
    })
      .then(response => {
        const tickets = response.data.content;
        totalPages = response.data.totalPages;
        container.innerHTML = "";
        tickets.forEach(ticket => renderTicketCard(ticket));
        pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage + 1 >= totalPages;
      })
      .catch(error => console.error("Error fetching tickets:", error));
  }

  sortBySelect?.addEventListener("change", e => {
    currentSortBy = e.target.value;
    currentPage = 0;
    fetchTickets();
  });

  orderBtn?.addEventListener("click", () => {
    currentOrder = currentOrder === "asc" ? "desc" : "asc";
    orderBtn.textContent = currentOrder.toUpperCase();
    currentPage = 0;
    fetchTickets();
  });

  prevBtn?.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      fetchTickets();
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (currentPage + 1 < totalPages) {
      currentPage++;
      fetchTickets();
    }
  });

  createTicketBtn?.addEventListener("click", () => {
    loadPage("createTicket");
  });

  fetchTickets();
}

function initEditTicketPage() {
  const ticketId = window.currentEditingTicketId;
  if (!ticketId) return;

  const titleInput = document.getElementById("ticketTitle");
  const descriptionInput = document.getElementById("description");
  const typeSelect = document.getElementById("type");
  const statusRadios = document.querySelectorAll('input[name="status"]');
  const deadlineInput = document.getElementById("deadline");
  const editForm = document.getElementById("editTicketForm");
  const cancelBtn = document.getElementById("cancelBtn");

  let originalCreatedAt = "";
  let assignedUserId = "";
  axios.get(`/api/tickets/${ticketId}`)
    .then(response => {
      const ticket = response.data;

      originalCreatedAt = ticket.createdAt;
      titleInput.value = ticket.title || "";
      descriptionInput.value = ticket.description || "";
      typeSelect.value = ticket.type || "OTHER";
      deadlineInput.value = ticket.deadline ? ticket.deadline.slice(0, 10) : "";
      assignedUserId = ticket.assignedTo.userId;

      statusRadios.forEach(radio => {
        radio.checked = radio.value === ticket.status;
      });
    })
    .catch(error => {
      console.error("Failed to load ticket data.", error);
      alert("Could not load ticket details.");
    });

  if (editForm) {
    editForm.addEventListener("submit", e => {
      e.preventDefault();

      const title = titleInput.value.trim();
      const description = descriptionInput.value.trim();
      const type = typeSelect.value;
      const status = document.querySelector('input[name="status"]:checked')?.value;
      const deadline = deadlineInput.value;

      if (!title || !description || !type || !status || !deadline) {
        alert("All fields are required.");
        return;
      }

      const updatedTicket = { ticketId, title, description, type, status, deadline, createdAt: originalCreatedAt, assignedTo: assignedUserId};
      console.log("Sending ticket update:", JSON.stringify(updatedTicket, null, 2));

      axios.put(`/api/tickets/${ticketId}`, updatedTicket)
        .then(() => {
          alert("Ticket updated successfully.");
          loadPage("tickets");
        })
        .catch(error => {
          console.error("Failed to update ticket:", error.response?.data || error.message);
          alert("Failed to update ticket.");
        });

    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      loadPage("tickets");
    });
  }
}
