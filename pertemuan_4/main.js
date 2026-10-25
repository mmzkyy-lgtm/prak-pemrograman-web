
"use strict";

// Data awal proyek
let projects = [
    {
        id: 1,
        title: "Sistem Inventaris Keuangan",
        category: "Web App",
        budget: 2500000,
        completed: true
    },
    {
        id: 2,
        title: "Sistem Kasir Digital POS",
        category: "Desktop App",
        budget: 5000000,
        completed: true
    },
    {
        id: 3,
        title: "Landing Page Profil Perusahaan",
        category: "Web App",
        budget: 1500000,
        completed: false
    },
    {
        id: 4,
        title: "Aplikasi Presensi GPS Mobile",
        category: "Mobile App",
        budget: 4500000,
        completed: false
    }
];

// Elemen HTML
const projectForm = document.getElementById("project-form");
const titleInput = document.getElementById("project-title");
const categoryInput = document.getElementById("project-category");
const budgetInput = document.getElementById("project-budget");
const completedInput = document.getElementById("project-completed");
const searchInput = document.getElementById("search-input");
const projectList = document.getElementById("project-list");
const filterButtons = document.querySelectorAll(".filter-btn");

// Kategori filter yang sedang aktif
let activeCategory = "Semua";

// Format angka menjadi Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);
}

// Mencegah teks input dianggap sebagai HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Memperbarui statistik dari seluruh data proyek
function updateStats() {
    const totalProjects = projects.length;

    const completedProjects = projects.filter(function (project) {
        return project.completed;
    }).length;

    const ongoingProjects = projects.filter(function (project) {
        return !project.completed;
    }).length;

    const totalBudget = projects.reduce(function (total, project) {
        return total + project.budget;
    }, 0);

    document.getElementById("total-projects").textContent = totalProjects;
    document.getElementById("completed-projects").textContent = completedProjects;
    document.getElementById("ongoing-projects").textContent = ongoingProjects;
    document.getElementById("total-budget").textContent =
        formatRupiah(totalBudget);
}

// Menampilkan kartu proyek
function renderProjects() {
    const keyword = searchInput.value.trim().toLowerCase();

    // Filter berdasarkan nama proyek dan kategori
    const filteredProjects = projects.filter(function (project) {
        const matchesName = project.title
            .toLowerCase()
            .includes(keyword);

        const matchesCategory =
            activeCategory === "Semua" ||
            project.category === activeCategory;

        return matchesName && matchesCategory;
    });

    if (filteredProjects.length === 0) {
        projectList.innerHTML = `
            <div class="empty-state">
                Tidak ada proyek yang cocok dengan pencarian atau kategori ini.
            </div>
        `;
        return;
    }

    projectList.innerHTML = filteredProjects.map(function (project) {
        const safeTitle = escapeHTML(project.title);
        const safeCategory = escapeHTML(project.category);

        const statusClass = project.completed ? "done" : "pending";

        const statusText = project.completed
            ? "Selesai"
            : "Dalam Pengerjaan";

        const buttonText = project.completed
            ? "Ubah ke Dalam Pengerjaan"
            : "Ubah Status";

        return `
            <article class="project-card">
                <h3>${safeTitle}</h3>

                <p class="project-category">
                    Kategori: ${safeCategory}
                </p>

                <p class="project-budget">
                    ${formatRupiah(project.budget)}
                </p>

                <span class="status ${statusClass}">
                    ${statusText}
                </span>

                <div class="card-actions">
                    <button
                        type="button"
                        class="btn-status"
                        data-action="toggle"
                        data-id="${project.id}"
                    >
                        ${buttonText}
                    </button>

                    <button
                        type="button"
                        class="btn-delete"
                        data-action="delete"
                        data-id="${project.id}"
                    >
                        Hapus Proyek
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

// Merender ulang daftar proyek dan statistik
function refreshDashboard() {
    renderProjects();
    updateStats();
}

// Fitur 1: menangani pengiriman formulir
projectForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const budget = Number(budgetInput.value);
    const completed = completedInput.checked;

    // Validasi judul
    if (title === "") {
        alert("Judul proyek tidak boleh kosong.");
        titleInput.focus();
        return;
    }

    // Validasi anggaran
    if (!Number.isFinite(budget) || budget <= 0) {
        alert("Anggaran harus berupa angka yang lebih besar dari 0.");
        budgetInput.focus();
        return;
    }

    // Membuat objek proyek baru dengan ID unik
    const newProject = {
        id: Date.now(),
        title: title,
        category: category,
        budget: budget,
        completed: completed
    };

    // Menambahkan proyek ke array menggunakan spread operator
    projects = [...projects, newProject];

    // Mengembalikan filter ke Semua agar proyek baru langsung terlihat
    activeCategory = "Semua";
    searchInput.value = "";

    filterButtons.forEach(function (button) {
        button.classList.toggle(
            "active",
            button.dataset.category === "Semua"
        );
    });

    projectForm.reset();

    // Memperbarui daftar dan statistik
    refreshDashboard();
});

// Fitur 2: pencarian real-time
searchInput.addEventListener("input", function () {
    renderProjects();
});

// Filter kategori
filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        activeCategory = button.dataset.category;

        filterButtons.forEach(function (filterButton) {
            filterButton.classList.toggle(
                "active",
                filterButton === button
            );
        });

        renderProjects();
    });
});

// Fitur 3: tombol ubah status dan hapus proyek
// Event delegation digunakan untuk tombol pada setiap kartu.
projectList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const projectId = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "toggle") {
        projects = projects.map(function (project) {
            if (project.id === projectId) {
                return {
                    ...project,
                    completed: !project.completed
                };
            }

            return project;
        });
    }

    if (action === "delete") {
        const confirmed = confirm(
            "Apakah kamu yakin ingin menghapus proyek ini?"
        );

        if (!confirmed) {
            return;
        }

        projects = projects.filter(function (project) {
            return project.id !== projectId;
        });
    }

    // Langsung memperbarui kartu dan statistik
    refreshDashboard();
});

// Tampilan awal saat halaman dibuka
refreshDashboard();
