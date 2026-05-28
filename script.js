
const projects = Array.from({ length: 40 }, (_, i) => {
  const clusters = [
    "Infrastructure",
    "Governance",
    "Commerce & Industry",
    "Social: Health & Edu",
    "Social: Services"
  ];

  const statuses = ["Completed", "In progress", "Not started"];
  const sdgs = ["SDG 1", "SDG 3", "SDG 4", "SDG 8", "SDG 9", "SDG 11", "SDG 16"];

  const budget = Math.floor(Math.random() * 5000000000);

  return {
    id: i + 1,
    name: `Project ${i + 1}`,
    cluster: clusters[Math.floor(Math.random() * clusters.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    year: Math.random() > 0.5 ? 2025 : 2026,
    budget,
    progress: Math.floor(Math.random() * 100),
    sdg: sdgs[Math.floor(Math.random() * sdgs.length)],
    impacted: Math.floor(Math.random() * 200000),
    jobs: Math.floor(Math.random() * 1000)
  };
});

const elements = {
  table: document.getElementById("projectsTable"),
  totalProjects: document.getElementById("totalProjects"),
  totalBudget: document.getElementById("totalBudget"),
  totalImpact: document.getElementById("totalImpact"),
  jobsCreated: document.getElementById("jobsCreated"),
  clusterChart: document.getElementById("clusterChart"),
  statusChart: document.getElementById("statusChart"),
  yearFilter: document.getElementById("yearFilter"),
  statusFilter: document.getElementById("statusFilter"),
  searchInput: document.getElementById("searchInput"),
  modal: document.getElementById("projectModal"),
  modalBody: document.getElementById("modalBody"),
  closeModal: document.getElementById("closeModal")
};

function currency(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);
}

function getFilteredProjects() {
  const year = elements.yearFilter.value;
  const status = elements.statusFilter.value;
  const search = elements.searchInput.value.toLowerCase();

  return projects.filter(project => {
    const yearMatch = year === "all" || String(project.year) === year;
    const statusMatch = status === "all" || project.status === status;
    const searchMatch = project.name.toLowerCase().includes(search);

    return yearMatch && statusMatch && searchMatch;
  });
}

function renderKPIs(data) {
  elements.totalProjects.textContent = data.length;

  const budget = data.reduce((sum, item) => sum + item.budget, 0);
  const impact = data.reduce((sum, item) => sum + item.impacted, 0);
  const jobs = data.reduce((sum, item) => sum + item.jobs, 0);

  elements.totalBudget.textContent = currency(budget);
  elements.totalImpact.textContent = impact.toLocaleString();
  elements.jobsCreated.textContent = jobs.toLocaleString();
}

function renderTable(data) {
  elements.table.innerHTML = "";

  data.forEach(project => {
    const row = document.createElement("tr");

    let statusClass = "progress";

    if (project.status === "Completed") {
      statusClass = "completed";
    }

    if (project.status === "Not started") {
      statusClass = "not-started";
    }

    row.innerHTML = `
      <td>
        <button class="project-link" data-id="${project.id}">
          ${project.name}
        </button>
      </td>
      <td>${project.cluster}</td>
      <td>
        <span class="status-pill ${statusClass}">
          ${project.status}
        </span>
      </td>
      <td>${currency(project.budget)}</td>
      <td>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${project.progress}%"></div>
        </div>
        <small>${project.progress}%</small>
      </td>
      <td>${project.sdg}</td>
    `;

    elements.table.appendChild(row);
  });

  document.querySelectorAll(".project-link").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.dataset.id));
  });
}

function renderChart(container, counts) {
  container.innerHTML = "";

  Object.entries(counts).forEach(([label, count]) => {
    const item = document.createElement("div");
    item.className = "chart-item";

    item.innerHTML = `
      <span>${label}</span>
      <div style="width:60%">
        <div class="bar" style="width:${count * 10}%"></div>
      </div>
      <strong>${count}</strong>
    `;

    container.appendChild(item);
  });
}

function renderCharts(data) {
  const clusterCounts = {};
  const statusCounts = {};

  data.forEach(project => {
    clusterCounts[project.cluster] = (clusterCounts[project.cluster] || 0) + 1;
    statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;
  });

  renderChart(elements.clusterChart, clusterCounts);
  renderChart(elements.statusChart, statusCounts);
}

function openModal(id) {
  const project = projects.find(item => item.id == id);

  elements.modalBody.innerHTML = `
    <h2>${project.name}</h2>
    <br/>
    <p><strong>Cluster:</strong> ${project.cluster}</p>
    <p><strong>Status:</strong> ${project.status}</p>
    <p><strong>Budget:</strong> ${currency(project.budget)}</p>
    <p><strong>Progress:</strong> ${project.progress}%</p>
    <p><strong>SDG Alignment:</strong> ${project.sdg}</p>
    <p><strong>Citizens Impacted:</strong> ${project.impacted.toLocaleString()}</p>
    <p><strong>Jobs Created:</strong> ${project.jobs.toLocaleString()}</p>
  `;

  elements.modal.classList.remove("hidden");
}

elements.closeModal.addEventListener("click", () => {
  elements.modal.classList.add("hidden");
});

function render() {
  const filtered = getFilteredProjects();

  renderKPIs(filtered);
  renderTable(filtered);
  renderCharts(filtered);
}

elements.yearFilter.addEventListener("change", render);
elements.statusFilter.addEventListener("change", render);
elements.searchInput.addEventListener("input", render);

render();
