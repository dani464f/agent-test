const STORAGE_KEY = "servicenow-addon-prototype-incidents";

const form = document.getElementById("incidentForm");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const tableContainer = document.getElementById("incidentTableContainer");
const resetSeedButton = document.getElementById("resetSeed");

const seededIncidents = [
  {
    number: "INC001001",
    shortDescription: "VPN access failing for remote sales team",
    description: "Multiple users report auth failures after MFA prompt.",
    category: "Network",
    priority: "2",
    assignmentGroup: "Network Operations",
    requestedBy: "Dana Rivers",
    status: "In Progress",
    createdAt: new Date().toISOString(),
  },
  {
    number: "INC001002",
    shortDescription: "New hire cannot access CRM dashboard",
    description: "Account provisioned but SSO group membership appears missing.",
    category: "Access",
    priority: "3",
    assignmentGroup: "Identity Management",
    requestedBy: "Jordan Lee",
    status: "New",
    createdAt: new Date().toISOString(),
  },
];

function loadIncidents() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...seededIncidents];

  try {
    return JSON.parse(raw);
  } catch {
    return [...seededIncidents];
  }
}

function persistIncidents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.incidents));
}

function priorityLabel(level) {
  const map = {
    "1": "1 - Critical",
    "2": "2 - High",
    "3": "3 - Moderate",
    "4": "4 - Low",
  };

  return map[level] ?? level;
}

function getNextNumber(incidents) {
  const max = incidents
    .map((item) => Number(item.number.replace("INC", "")))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 1000);

  return `INC${String(max + 1).padStart(6, "0")}`;
}

const state = {
  incidents: loadIncidents(),
};

function cycleStatus(current) {
  if (current === "New") return "In Progress";
  if (current === "In Progress") return "Resolved";
  return "New";
}

function matchesFilter(incident) {
  const searchValue = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedPriority = priorityFilter.value;

  const text = [
    incident.number,
    incident.shortDescription,
    incident.description,
    incident.requestedBy,
    incident.assignmentGroup,
  ]
    .join(" ")
    .toLowerCase();

  const searchMatch = searchValue.length === 0 || text.includes(searchValue);
  const statusMatch = selectedStatus === "all" || incident.status === selectedStatus;
  const priorityMatch = selectedPriority === "all" || incident.priority === selectedPriority;

  return searchMatch && statusMatch && priorityMatch;
}

function buildTable(filtered) {
  if (filtered.length === 0) {
    const template = document.getElementById("emptyStateTemplate");
    tableContainer.innerHTML = "";
    tableContainer.append(template.content.cloneNode(true));
    return;
  }

  const rows = filtered
    .map(
      (incident) => `
      <tr>
        <td><strong>${incident.number}</strong></td>
        <td>
          <div><strong>${incident.shortDescription}</strong></div>
          <div>${incident.category} • ${incident.assignmentGroup}</div>
          <small>${incident.requestedBy}</small>
        </td>
        <td class="priority-${incident.priority}">${priorityLabel(incident.priority)}</td>
        <td>
          <span class="status-pill status-${incident.status.replace(" ", "")}">
            ${incident.status}
          </span>
        </td>
        <td class="actions">
          <button data-action="cycle" data-number="${incident.number}">Advance Status</button>
          <button data-action="delete" data-number="${incident.number}" class="danger">Delete</button>
        </td>
      </tr>`
    )
    .join("");

  tableContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Number</th>
          <th>Summary</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function render() {
  const filtered = state.incidents.filter(matchesFilter);
  buildTable(filtered);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);

  const incident = {
    number: getNextNumber(state.incidents),
    shortDescription: data.get("shortDescription").toString().trim(),
    description: data.get("description").toString().trim(),
    category: data.get("category").toString(),
    priority: data.get("priority").toString(),
    assignmentGroup: data.get("assignmentGroup").toString(),
    requestedBy: data.get("requestedBy").toString().trim(),
    status: "New",
    createdAt: new Date().toISOString(),
  };

  state.incidents = [incident, ...state.incidents];
  persistIncidents();
  render();
  form.reset();
});

[searchInput, statusFilter, priorityFilter].forEach((element) => {
  element.addEventListener("input", render);
  element.addEventListener("change", render);
});

tableContainer.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const action = target.dataset.action;
  const number = target.dataset.number;
  if (!action || !number) return;

  if (action === "delete") {
    state.incidents = state.incidents.filter((item) => item.number !== number);
  }

  if (action === "cycle") {
    state.incidents = state.incidents.map((item) => {
      if (item.number !== number) return item;
      return {
        ...item,
        status: cycleStatus(item.status),
      };
    });
  }

  persistIncidents();
  render();
});

resetSeedButton.addEventListener("click", () => {
  state.incidents = [...seededIncidents];
  persistIncidents();
  render();
});

render();
