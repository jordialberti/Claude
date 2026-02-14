/**
 * WD1 — App principal
 * Gestiona la llista de sol·licituds de compra i la conversió simulada a comandes.
 */

(function () {
    "use strict";

    // --- DOM refs ---
    const tbody = document.getElementById("pr-tbody");
    const emptyState = document.getElementById("empty-state");
    const selectAllCb = document.getElementById("select-all");
    const selectionCount = document.getElementById("selection-count");
    const btnConvert = document.getElementById("btn-convert");
    const btnFilter = document.getElementById("btn-filter");
    const filterStatus = document.getElementById("filter-status");
    const filterDateFrom = document.getElementById("filter-date-from");
    const filterDateTo = document.getElementById("filter-date-to");
    const filterSupplier = document.getElementById("filter-supplier");
    const modalOverlay = document.getElementById("modal-overlay");
    const modalBody = document.getElementById("modal-body");
    const modalClose = document.getElementById("modal-close");
    const modalOk = document.getElementById("modal-ok");

    // --- State ---
    let displayedRequests = [];
    const selected = new Set();

    // --- Init ---
    function init() {
        populateSupplierFilter();
        applyFilters();
        bindEvents();
    }

    function populateSupplierFilter() {
        const suppliers = new Map();
        PURCHASE_REQUESTS.forEach(function (pr) {
            if (!suppliers.has(pr.supplierCode)) {
                suppliers.set(pr.supplierCode, pr.supplierName);
            }
        });
        suppliers.forEach(function (name, code) {
            const opt = document.createElement("option");
            opt.value = code;
            opt.textContent = name;
            filterSupplier.appendChild(opt);
        });
    }

    // --- Filtering ---
    function applyFilters() {
        var status = filterStatus.value;
        var dateFrom = filterDateFrom.value;
        var dateTo = filterDateTo.value;
        var supplier = filterSupplier.value;

        displayedRequests = PURCHASE_REQUESTS.filter(function (pr) {
            if (status !== "all" && pr.status !== status) return false;
            if (dateFrom && pr.docDate < dateFrom) return false;
            if (dateTo && pr.docDate > dateTo) return false;
            if (supplier !== "all" && pr.supplierCode !== supplier) return false;
            return true;
        });

        selected.clear();
        renderTable();
        updateSelectionUI();
    }

    // --- Rendering ---
    function renderTable() {
        tbody.innerHTML = "";

        if (displayedRequests.length === 0) {
            emptyState.classList.remove("hidden");
            document.getElementById("pr-table").querySelector("thead").classList.add("hidden");
            return;
        }

        emptyState.classList.add("hidden");
        document.getElementById("pr-table").querySelector("thead").classList.remove("hidden");

        displayedRequests.forEach(function (pr) {
            var tr = document.createElement("tr");
            tr.dataset.docNum = pr.docNum;

            var statusLabel = pr.status === "pending" ? "Pendent" : "Parcial";
            var statusClass = pr.status === "pending" ? "status-pending" : "status-partial";

            tr.innerHTML =
                '<td class="col-check"><input type="checkbox" data-doc="' + pr.docNum + '"></td>' +
                '<td class="col-doc"><strong>' + pr.docNum + '</strong></td>' +
                '<td class="col-date">' + formatDate(pr.docDate) + '</td>' +
                '<td class="col-supplier">' + escapeHtml(pr.supplierName) + '</td>' +
                '<td class="col-lines">' + pr.lines.length + '</td>' +
                '<td class="col-total">' + formatCurrency(pr.total) + '</td>' +
                '<td class="col-status"><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>';

            tbody.appendChild(tr);
        });
    }

    // --- Selection ---
    function updateSelectionUI() {
        var count = selected.size;
        selectionCount.textContent = count === 0
            ? "0 sol\u00B7licituds seleccionades"
            : count + " sol\u00B7licitud" + (count > 1 ? "s" : "") + " seleccionada" + (count > 1 ? "es" : "");
        btnConvert.disabled = count === 0;

        // Update header checkbox
        if (displayedRequests.length === 0) {
            selectAllCb.checked = false;
            selectAllCb.indeterminate = false;
        } else if (count === displayedRequests.length) {
            selectAllCb.checked = true;
            selectAllCb.indeterminate = false;
        } else if (count > 0) {
            selectAllCb.checked = false;
            selectAllCb.indeterminate = true;
        } else {
            selectAllCb.checked = false;
            selectAllCb.indeterminate = false;
        }

        // Highlight selected rows
        var rows = tbody.querySelectorAll("tr");
        rows.forEach(function (row) {
            var docNum = parseInt(row.dataset.docNum);
            row.classList.toggle("selected", selected.has(docNum));
            var cb = row.querySelector('input[type="checkbox"]');
            if (cb) cb.checked = selected.has(docNum);
        });
    }

    function toggleSelection(docNum) {
        if (selected.has(docNum)) {
            selected.delete(docNum);
        } else {
            selected.add(docNum);
        }
        updateSelectionUI();
    }

    function toggleAll() {
        if (selected.size === displayedRequests.length) {
            selected.clear();
        } else {
            displayedRequests.forEach(function (pr) {
                selected.add(pr.docNum);
            });
        }
        updateSelectionUI();
    }

    // --- Conversion (simulated) ---
    function convertSelected() {
        var results = [];
        var nextPO = 5000 + Math.floor(Math.random() * 1000);

        displayedRequests.forEach(function (pr) {
            if (!selected.has(pr.docNum)) return;
            results.push({
                prDocNum: pr.docNum,
                poDocNum: nextPO++,
                supplier: pr.supplierName,
                total: pr.total,
            });
        });

        showResultsModal(results);

        // Remove converted from displayed list (simulate status change)
        results.forEach(function (r) {
            selected.delete(r.prDocNum);
        });
    }

    function showResultsModal(results) {
        var html = '<p style="margin-bottom:12px;">S\'han creat <strong>' + results.length +
            '</strong> comanda' + (results.length > 1 ? 'es' : '') + ' de compra:</p>';

        results.forEach(function (r) {
            html +=
                '<div class="result-item">' +
                '<span class="icon-ok">&#10003;</span>' +
                '<span>Sol\u00B7licitud <strong>' + r.prDocNum + '</strong>' +
                ' &rarr; Comanda <strong>' + r.poDocNum + '</strong>' +
                ' &mdash; ' + escapeHtml(r.supplier) +
                ' (' + formatCurrency(r.total) + ')</span>' +
                '</div>';
        });

        modalBody.innerHTML = html;
        modalOverlay.classList.remove("hidden");
    }

    function closeModal() {
        modalOverlay.classList.add("hidden");
    }

    // --- Events ---
    function bindEvents() {
        btnFilter.addEventListener("click", function () {
            applyFilters();
        });

        selectAllCb.addEventListener("change", function () {
            toggleAll();
        });

        tbody.addEventListener("change", function (e) {
            if (e.target.type === "checkbox") {
                toggleSelection(parseInt(e.target.dataset.doc));
            }
        });

        tbody.addEventListener("click", function (e) {
            var row = e.target.closest("tr");
            if (!row || e.target.type === "checkbox") return;
            var docNum = parseInt(row.dataset.docNum);
            toggleSelection(docNum);
        });

        btnConvert.addEventListener("click", function () {
            convertSelected();
        });

        modalClose.addEventListener("click", closeModal);
        modalOk.addEventListener("click", closeModal);
        modalOverlay.addEventListener("click", function (e) {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // --- Helpers ---
    function formatDate(isoDate) {
        var parts = isoDate.split("-");
        return parts[2] + "/" + parts[1] + "/" + parts[0];
    }

    function formatCurrency(value) {
        return value.toLocaleString("ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // --- Start ---
    init();
})();
