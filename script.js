/* ==========================================================================
   StockMaster - Front-end Stock Management System
   Developed by Omar Derdare, Full Stack Developer
   100% front end: data is persisted in the browser (localStorage).
   ========================================================================== */
'use strict';

const STORAGE_KEY = 'stockmaster_v1';
const THEME_KEY = 'stockmaster_theme';

/* ---------- Date helpers ---------- */
const todayStr = () => new Date().toISOString().split('T')[0];
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; };

/* ---------- Seed (demo) data ---------- */
function seedData() {
    const suppliers = [
        { id: 1, name: 'TechSource Distribution', email: 'sales@techsource.example', phone: '+212 600 000 001', city: 'Casablanca' },
        { id: 2, name: 'OfficePlus Wholesale', email: 'orders@officeplus.example', phone: '+212 600 000 002', city: 'Rabat' },
        { id: 3, name: 'FreshHome Supplies', email: 'contact@freshhome.example', phone: '+212 600 000 003', city: 'Tangier' }
    ];
    const products = [
        { id: 1, sku: 'ELC-001', name: 'Wireless Mouse', category: 'Electronics', supplierId: 1, cost: 90, price: 149, quantity: 42, minStock: 10, unit: 'pcs', location: 'A1-01', description: '2.4GHz ergonomic wireless mouse.' },
        { id: 2, sku: 'ELC-002', name: 'Mechanical Keyboard', category: 'Electronics', supplierId: 1, cost: 280, price: 449, quantity: 8, minStock: 10, unit: 'pcs', location: 'A1-02', description: 'RGB mechanical keyboard, blue switches.' },
        { id: 3, sku: 'ELC-003', name: 'USB-C Cable 1m', category: 'Electronics', supplierId: 1, cost: 12, price: 29, quantity: 0, minStock: 25, unit: 'pcs', location: 'A2-04', description: 'Fast charging braided cable.' },
        { id: 4, sku: 'OFF-001', name: 'A4 Paper Ream (500)', category: 'Office', supplierId: 2, cost: 32, price: 49, quantity: 120, minStock: 40, unit: 'ream', location: 'B1-01', description: '80g/m2 white paper.' },
        { id: 5, sku: 'OFF-002', name: 'Ballpoint Pens (Box of 50)', category: 'Office', supplierId: 2, cost: 25, price: 45, quantity: 15, minStock: 20, unit: 'box', location: 'B1-03', description: 'Blue ink, medium tip.' },
        { id: 6, sku: 'OFF-003', name: 'Stapler Pro', category: 'Office', supplierId: 2, cost: 40, price: 69, quantity: 33, minStock: 8, unit: 'pcs', location: 'B2-02', description: 'Heavy-duty desktop stapler.' },
        { id: 7, sku: 'HOM-001', name: 'Dish Soap 750ml', category: 'Household', supplierId: 3, cost: 9, price: 18, quantity: 96, minStock: 30, unit: 'btl', location: 'C1-01', description: 'Lemon scented dish soap.' },
        { id: 8, sku: 'HOM-002', name: 'Microfiber Cloths (Pack of 6)', category: 'Household', supplierId: 3, cost: 14, price: 29, quantity: 5, minStock: 15, unit: 'pack', location: 'C1-04', description: 'Reusable cleaning cloths.' }
    ];
    const movements = [];
    let mid = 1;
    const add = (productId, type, qty, daysBack, party, reference, note) =>
        movements.push({ id: mid++, productId, type, qty, date: daysAgo(daysBack), party, reference, note });

    add(1, 'in', 60, 28, 'TechSource Distribution', 'PO-1001', 'Initial stock');
    add(2, 'in', 30, 28, 'TechSource Distribution', 'PO-1001', 'Initial stock');
    add(3, 'in', 50, 26, 'TechSource Distribution', 'PO-1002', 'Initial stock');
    add(4, 'in', 150, 25, 'OfficePlus Wholesale', 'PO-1003', 'Initial stock');
    add(5, 'in', 40, 25, 'OfficePlus Wholesale', 'PO-1003', 'Initial stock');
    add(6, 'in', 40, 22, 'OfficePlus Wholesale', 'PO-1004', 'Initial stock');
    add(7, 'in', 120, 20, 'FreshHome Supplies', 'PO-1005', 'Initial stock');
    add(8, 'in', 30, 20, 'FreshHome Supplies', 'PO-1005', 'Initial stock');
    add(1, 'out', 10, 12, 'Retail customer', 'INV-2001', 'Sale');
    add(2, 'out', 22, 9, 'Gaming Zone', 'INV-2002', 'Bulk order');
    add(3, 'out', 50, 7, 'Mobile Hub', 'INV-2003', 'Bulk order');
    add(4, 'out', 30, 6, 'City School', 'INV-2004', 'Sale');
    add(5, 'out', 25, 5, 'City School', 'INV-2004', 'Sale');
    add(6, 'out', 7, 4, 'Retail customer', 'INV-2005', 'Sale');
    add(7, 'out', 24, 3, 'Supermarket Atlas', 'INV-2006', 'Sale');
    add(8, 'out', 25, 2, 'Supermarket Atlas', 'INV-2006', 'Sale');
    add(1, 'in', 20, 1, 'TechSource Distribution', 'PO-1006', 'Restock');
    add(4, 'in', 20, 1, 'OfficePlus Wholesale', 'PO-1007', 'Restock');
    add(1, 'out', 28, 0, 'Retail customer', 'INV-2007', 'Sale');

    return { products, suppliers, movements, settings: { company: 'My Company', currency: 'MAD' } };
}

/* ---------- State & persistence ---------- */
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            if (data && Array.isArray(data.products)) {
                data.suppliers = data.suppliers || [];
                data.movements = data.movements || [];
                data.settings = Object.assign({ company: 'My Company', currency: 'MAD' }, data.settings);
                return data;
            }
        }
    } catch (e) { console.warn('Could not read saved data, loading demo data.', e); }
    return seedData();
}

let state = loadState();
function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { toast('Could not save data (storage full or blocked).', 'error'); }
}
saveState();

/* ---------- Utilities ---------- */
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const generateId = (arr) => (arr.length ? Math.max(...arr.map((i) => i.id)) + 1 : 1);
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

function money(v) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: state.settings.currency }).format(v); }
    catch (e) { return `${(+v).toFixed(2)} ${state.settings.currency}`; }
}
function fmtDate(s) {
    if (!s) return 'N/A';
    return new Date(s + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
function toast(title, icon = 'success') {
    Swal.fire({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 2600, timerProgressBar: true });
}
function alertBox(title, text, icon = 'info') {
    Swal.fire({ title, text, icon, confirmButtonColor: '#2f6fed' });
}
function confirmBox(title, text, confirmText = 'Yes') {
    return Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d6336c', cancelButtonColor: '#6c757d', confirmButtonText: confirmText });
}

function downloadCSV(filename, rows) {
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- Domain helpers ---------- */
const productById = (id) => state.products.find((p) => p.id === id);
const supplierById = (id) => state.suppliers.find((s) => s.id === id);

function stockStatus(p) {
    if (p.quantity <= 0) return { key: 'out', label: 'Out of stock', cls: 'danger' };
    if (p.quantity <= p.minStock) return { key: 'low', label: 'Low stock', cls: 'warning text-dark' };
    return { key: 'ok', label: 'In stock', cls: 'success' };
}

function computeStats() {
    const p = state.products;
    return {
        products: p.length,
        units: p.reduce((s, x) => s + x.quantity, 0),
        costValue: p.reduce((s, x) => s + x.quantity * x.cost, 0),
        retailValue: p.reduce((s, x) => s + x.quantity * x.price, 0),
        low: p.filter((x) => stockStatus(x).key === 'low').length,
        out: p.filter((x) => stockStatus(x).key === 'out').length,
        suppliers: state.suppliers.length
    };
}

function recordMovement({ productId, type, qty, date, party, reference, note }) {
    const p = productById(productId);
    if (!p) return { ok: false, msg: 'Product not found.' };
    if (!(qty > 0)) return { ok: false, msg: 'Quantity must be greater than zero.' };
    if (type === 'out' && qty > p.quantity) return { ok: false, msg: `Only ${p.quantity} ${p.unit} available in stock.` };
    p.quantity += type === 'in' ? qty : -qty;
    state.movements.push({ id: generateId(state.movements), productId, type, qty, date: date || todayStr(), party: party || '', reference: reference || '', note: note || '' });
    saveState();
    return { ok: true, product: p };
}

/* ---------- DOM refs ---------- */
const mainContent = document.getElementById('main-content');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const pageWrapper = document.getElementById('page-content-wrapper');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const topbarTitle = document.getElementById('topbarTitle');

/* ---------- Sidebar / theme ---------- */
function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.style.display = 'none';
}
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    sidebarOverlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
});
sidebarOverlay.addEventListener('click', closeSidebar);

function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.querySelector('#themeToggle i').className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    Chart.defaults.color = theme === 'dark' ? '#b8c2cc' : '#495057';
    Chart.defaults.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
}
(function initTheme() {
    let theme = 'light';
    try { theme = localStorage.getItem(THEME_KEY) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (e) { /* ignore */ }
    applyTheme(theme);
})();
document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    applyTheme(next);
    navigateTo(currentPage, currentParams, true);
});

/* ---------- Charts ---------- */
let charts = [];
function destroyCharts() { charts.forEach((c) => c.destroy()); charts = []; }
function makeChart(id, config) {
    const el = document.getElementById(id);
    if (!el) return;
    config.options = Object.assign({ responsive: true, maintainAspectRatio: false }, config.options);
    charts.push(new Chart(el.getContext('2d'), config));
}
const PALETTE = ['#2f6fed', '#159a63', '#f08c00', '#d6336c', '#6f42c1', '#0dcaf0', '#fd7e14', '#20c997'];

function lastNDays(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) out.push(daysAgo(i));
    return out;
}

/* ---------- DataTable helper ---------- */
function initTable(selector, options = {}) {
    if ($.fn.DataTable.isDataTable(selector)) $(selector).DataTable().destroy();
    return $(selector).DataTable(Object.assign({ responsive: true, pageLength: 10, lengthMenu: [[10, 25, 50, -1], [10, 25, 50, 'All']] }, options));
}

/* ==========================================================================
   PAGES
   ========================================================================== */

/* ---------- Dashboard ---------- */
function renderDashboard() {
    const s = computeStats();
    const alerts = state.products.filter((p) => stockStatus(p).key !== 'ok')
        .sort((a, b) => a.quantity - b.quantity).slice(0, 5);
    const recent = [...state.movements].sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id)).slice(0, 6);

    const alertRows = alerts.length ? alerts.map((p) => {
        const st = stockStatus(p);
        return `<tr><td><div class="product-name">${esc(p.name)}</div><div class="product-sku">${esc(p.sku)}</div></td>
            <td class="qty-pill">${p.quantity} / ${p.minStock}</td>
            <td><span class="badge bg-${st.cls}">${st.label}</span></td>
            <td class="text-end"><button class="btn btn-sm btn-primary" data-page="stockIn" data-params='${JSON.stringify({ productId: p.id })}'><i class="fas fa-plus"></i> Restock</button></td></tr>`;
    }).join('') : `<tr><td colspan="4" class="text-center text-muted py-3"><i class="fas fa-circle-check text-success me-1"></i>All products are well stocked.</td></tr>`;

    const recentRows = recent.length ? recent.map((m) => {
        const p = productById(m.productId);
        return `<tr><td>${esc(p ? p.name : 'Deleted product')}</td>
            <td><span class="badge bg-${m.type === 'in' ? 'success' : 'danger'}">${m.type === 'in' ? 'IN' : 'OUT'}</span></td>
            <td class="qty-pill">${m.type === 'in' ? '+' : '-'}${m.qty}</td><td>${fmtDate(m.date)}</td></tr>`;
    }).join('') : `<tr><td colspan="4" class="text-center text-muted py-3">No movements yet.</td></tr>`;

    mainContent.innerHTML = `
        <div class="content-section">
            <h2 class="section-title"><i class="fas fa-gauge-high me-2"></i>Dashboard Overview</h2>
            <div class="row g-4">
                ${statCard('Products', s.products, 'fa-box', 'bg-grad-blue', 'products')}
                ${statCard('Units in Stock', s.units.toLocaleString(), 'fa-cubes', 'bg-grad-green', 'products')}
                ${statCard('Stock Value (cost)', money(s.costValue), 'fa-coins', 'bg-grad-purple', 'reports')}
                ${statCard('Low Stock', s.low, 'fa-triangle-exclamation', 'bg-grad-orange', 'lowStock')}
                ${statCard('Out of Stock', s.out, 'fa-ban', 'bg-grad-red', 'lowStock')}
                ${statCard('Suppliers', s.suppliers, 'fa-truck-field', 'bg-grad-blue', 'suppliers')}
                ${statCard('Retail Value', money(s.retailValue), 'fa-tags', 'bg-grad-green', 'reports')}
                ${statCard('Potential Profit', money(s.retailValue - s.costValue), 'fa-chart-line', 'bg-grad-purple', 'reports')}
            </div>
        </div>

        <div class="row g-4">
            <div class="col-xl-8">
                <div class="content-section h-100">
                    <h2 class="section-title"><i class="fas fa-right-left me-2"></i>Last 7 Days Movements</h2>
                    <div class="chart-box"><canvas id="weekChart"></canvas></div>
                </div>
            </div>
            <div class="col-xl-4">
                <div class="content-section h-100">
                    <h2 class="section-title"><i class="fas fa-chart-pie me-2"></i>Value by Category</h2>
                    <div class="chart-box"><canvas id="categoryChart"></canvas></div>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-xl-6">
                <div class="content-section h-100">
                    <h2 class="section-title"><i class="fas fa-triangle-exclamation me-2"></i>Needs Attention</h2>
                    <div class="table-responsive"><table class="table table-hover align-middle mb-0">
                        <thead><tr><th>Product</th><th>Qty / Min</th><th>Status</th><th></th></tr></thead><tbody>${alertRows}</tbody></table></div>
                </div>
            </div>
            <div class="col-xl-6">
                <div class="content-section h-100">
                    <h2 class="section-title"><i class="fas fa-clock-rotate-left me-2"></i>Recent Movements</h2>
                    <div class="table-responsive"><table class="table table-hover align-middle mb-0">
                        <thead><tr><th>Product</th><th>Type</th><th>Qty</th><th>Date</th></tr></thead><tbody>${recentRows}</tbody></table></div>
                </div>
            </div>
        </div>`;

    const days = lastNDays(7);
    const sumFor = (type, d) => state.movements.filter((m) => m.type === type && m.date === d).reduce((a, m) => a + m.qty, 0);
    makeChart('weekChart', {
        type: 'bar',
        data: {
            labels: days.map((d) => fmtDate(d)),
            datasets: [
                { label: 'Stock In', data: days.map((d) => sumFor('in', d)), backgroundColor: 'rgba(21,154,99,0.8)', borderRadius: 4 },
                { label: 'Stock Out', data: days.map((d) => sumFor('out', d)), backgroundColor: 'rgba(214,51,108,0.8)', borderRadius: 4 }
            ]
        },
        options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { position: 'top' } } }
    });

    const byCat = {};
    state.products.forEach((p) => { byCat[p.category || 'Uncategorized'] = (byCat[p.category || 'Uncategorized'] || 0) + p.quantity * p.cost; });
    makeChart('categoryChart', {
        type: 'doughnut',
        data: { labels: Object.keys(byCat), datasets: [{ data: Object.values(byCat), backgroundColor: PALETTE, borderWidth: 0 }] },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

function statCard(label, value, icon, bg, page) {
    return `<div class="col-xl-3 col-md-6">
        <div class="card stat-card ${bg} h-100" data-page="${page}" role="button">
            <div class="card-body"><div><div class="stat-label">${label}</div><p class="stat-value">${value}</p></div><div class="stat-icon"><i class="fas ${icon}"></i></div></div>
        </div></div>`;
}

/* ---------- Products ---------- */
function renderProducts() {
    const rows = state.products.map((p) => {
        const st = stockStatus(p);
        const sup = supplierById(p.supplierId);
        const pct = Math.min(100, p.minStock > 0 ? (p.quantity / (p.minStock * 3)) * 100 : 100);
        const barColor = st.key === 'out' ? '#d6336c' : st.key === 'low' ? '#f08c00' : '#159a63';
        return `<tr>
            <td><div class="product-name">${esc(p.name)}</div><div class="product-sku">${esc(p.sku)}</div></td>
            <td>${esc(p.category)}</td>
            <td>${sup ? esc(sup.name) : '<span class="text-muted">-</span>'}</td>
            <td data-order="${p.cost}">${money(p.cost)}</td>
            <td data-order="${p.price}">${money(p.price)}</td>
            <td data-order="${p.quantity}"><div class="qty-pill">${p.quantity} ${esc(p.unit)}</div><div class="stock-bar mt-1"><span style="width:${pct}%;background:${barColor}"></span></div></td>
            <td><span class="badge bg-${st.cls}">${st.label}</span></td>
            <td data-order="${p.quantity * p.cost}">${money(p.quantity * p.cost)}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-success btn-icon act-in" data-id="${p.id}" title="Stock in"><i class="fas fa-plus"></i></button>
                <button class="btn btn-sm btn-danger btn-icon act-out ms-1" data-id="${p.id}" title="Stock out"><i class="fas fa-minus"></i></button>
                <button class="btn btn-sm btn-info btn-icon act-view ms-1" data-id="${p.id}" title="Details"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-warning btn-icon act-edit ms-1" data-id="${p.id}" title="Edit"><i class="fas fa-pen"></i></button>
                <button class="btn btn-sm btn-outline-danger btn-icon act-del ms-1" data-id="${p.id}" title="Delete"><i class="fas fa-trash"></i></button>
            </td></tr>`;
    }).join('');

    mainContent.innerHTML = `
        <div class="content-section">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <h2 class="section-title mb-0"><i class="fas fa-box me-2"></i>Products</h2>
                <div class="d-flex gap-2 no-print">
                    <button class="btn btn-outline-secondary" id="exportProductsBtn"><i class="fas fa-file-csv me-1"></i>Export CSV</button>
                    <button class="btn btn-primary" data-page="addProduct"><i class="fas fa-plus-circle me-1"></i>Add Product</button>
                </div>
            </div>
            <div class="table-responsive mt-3">
                <table id="productsTable" class="table table-striped table-hover align-middle" style="width:100%">
                    <thead><tr><th>Product</th><th>Category</th><th>Supplier</th><th>Cost</th><th>Price</th><th>Stock</th><th>Status</th><th>Value</th><th>Actions</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;

    initTable('#productsTable', { columnDefs: [{ targets: [8], orderable: false, searchable: false }] });

    const idOf = (e) => parseInt(e.currentTarget.dataset.id, 10);
    document.querySelectorAll('.act-in').forEach((b) => b.addEventListener('click', (e) => navigateTo('stockIn', { productId: idOf(e) })));
    document.querySelectorAll('.act-out').forEach((b) => b.addEventListener('click', (e) => navigateTo('stockOut', { productId: idOf(e) })));
    document.querySelectorAll('.act-view').forEach((b) => b.addEventListener('click', (e) => viewProduct(idOf(e))));
    document.querySelectorAll('.act-edit').forEach((b) => b.addEventListener('click', (e) => navigateTo('addProduct', { productId: idOf(e), isEdit: true })));
    document.querySelectorAll('.act-del').forEach((b) => b.addEventListener('click', (e) => deleteProduct(idOf(e))));
    document.getElementById('exportProductsBtn').addEventListener('click', exportProductsCSV);
}

function viewProduct(id) {
    const p = productById(id);
    if (!p) return alertBox('Error', 'Product not found.', 'error');
    const sup = supplierById(p.supplierId);
    const st = stockStatus(p);
    const hist = state.movements.filter((m) => m.productId === id).sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id)).slice(0, 6);
    const histHtml = hist.length ? `<ul class="list-group list-group-flush">${hist.map((m) =>
        `<li class="list-group-item d-flex justify-content-between px-0"><span><span class="badge bg-${m.type === 'in' ? 'success' : 'danger'} me-2">${m.type === 'in' ? 'IN' : 'OUT'}</span>${fmtDate(m.date)}${m.reference ? ' &middot; ' + esc(m.reference) : ''}</span><strong>${m.type === 'in' ? '+' : '-'}${m.qty}</strong></li>`).join('')}</ul>`
        : '<p class="text-muted mb-0">No movements yet.</p>';
    Swal.fire({
        title: esc(p.name),
        html: `<div class="text-start">
            <p class="mb-1"><strong>SKU:</strong> ${esc(p.sku)} &nbsp; <span class="badge bg-${st.cls}">${st.label}</span></p>
            <p class="mb-1"><strong>Category:</strong> ${esc(p.category)}</p>
            <p class="mb-1"><strong>Supplier:</strong> ${sup ? esc(sup.name) : '-'}</p>
            <p class="mb-1"><strong>Location:</strong> ${esc(p.location || '-')}</p>
            <p class="mb-1"><strong>Cost / Price:</strong> ${money(p.cost)} / ${money(p.price)}</p>
            <p class="mb-1"><strong>Quantity:</strong> ${p.quantity} ${esc(p.unit)} (min ${p.minStock})</p>
            <p class="mb-2"><strong>Description:</strong> ${esc(p.description || '-')}</p>
            <hr><h6>Latest movements</h6>${histHtml}</div>`,
        width: 560, confirmButtonText: 'Close', confirmButtonColor: '#2f6fed'
    });
}

function deleteProduct(id) {
    const p = productById(id);
    if (!p) return;
    confirmBox('Delete this product?', `"${p.name}" and its movement history will be removed. This cannot be undone.`, 'Yes, delete it')
        .then((r) => {
            if (!r.isConfirmed) return;
            state.products = state.products.filter((x) => x.id !== id);
            state.movements = state.movements.filter((m) => m.productId !== id);
            saveState();
            toast('Product deleted');
            navigateTo('products');
        });
}

function exportProductsCSV() {
    const rows = [['SKU', 'Name', 'Category', 'Supplier', 'Cost', 'Price', 'Quantity', 'Unit', 'Min stock', 'Status', 'Location', 'Stock value (cost)']];
    state.products.forEach((p) => {
        const sup = supplierById(p.supplierId);
        rows.push([p.sku, p.name, p.category, sup ? sup.name : '', p.cost, p.price, p.quantity, p.unit, p.minStock, stockStatus(p).label, p.location, (p.quantity * p.cost).toFixed(2)]);
    });
    downloadCSV(`products-${todayStr()}.csv`, rows);
}

/* ---------- Add / Edit product ---------- */
function renderProductForm(params = {}) {
    const isEdit = !!params.isEdit;
    const p = isEdit ? productById(params.productId) : null;
    if (isEdit && !p) { alertBox('Error', 'Product not found.', 'error'); return navigateTo('products'); }

    const categories = [...new Set(state.products.map((x) => x.category).filter(Boolean))];
    const supplierOptions = state.suppliers.map((s) => `<option value="${s.id}" ${p && p.supplierId === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
    const nextSku = `PRD-${String(state.products.length + 1).padStart(3, '0')}`;

    mainContent.innerHTML = `
        <div class="content-section">
            <h2 class="section-title"><i class="fas ${isEdit ? 'fa-pen' : 'fa-plus-circle'} me-2"></i>${isEdit ? 'Edit Product' : 'Add New Product'}</h2>
            <form id="productForm" class="needs-validation" novalidate>
                <div class="row g-3">
                    <div class="col-md-4"><label class="form-label" for="pSku">SKU / Reference <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="pSku" required value="${esc(p ? p.sku : nextSku)}"><div class="invalid-feedback">SKU is required.</div></div>
                    <div class="col-md-8"><label class="form-label" for="pName">Product name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="pName" required value="${esc(p ? p.name : '')}"><div class="invalid-feedback">Name is required.</div></div>
                    <div class="col-md-4"><label class="form-label" for="pCategory">Category <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="pCategory" list="categoryList" required value="${esc(p ? p.category : '')}">
                        <datalist id="categoryList">${categories.map((c) => `<option value="${esc(c)}">`).join('')}</datalist><div class="invalid-feedback">Category is required.</div></div>
                    <div class="col-md-4"><label class="form-label" for="pSupplier">Supplier</label>
                        <select class="form-select" id="pSupplier"><option value="">- None -</option>${supplierOptions}</select></div>
                    <div class="col-md-4"><label class="form-label" for="pLocation">Warehouse location</label>
                        <input type="text" class="form-control" id="pLocation" placeholder="e.g. A1-03" value="${esc(p ? p.location : '')}"></div>
                    <div class="col-md-3"><label class="form-label" for="pCost">Cost price <span class="text-danger">*</span></label>
                        <input type="number" class="form-control" id="pCost" min="0" step="0.01" required value="${p ? p.cost : ''}"><div class="invalid-feedback">Enter a valid cost.</div></div>
                    <div class="col-md-3"><label class="form-label" for="pPrice">Selling price <span class="text-danger">*</span></label>
                        <input type="number" class="form-control" id="pPrice" min="0" step="0.01" required value="${p ? p.price : ''}"><div class="invalid-feedback">Enter a valid price.</div></div>
                    <div class="col-md-2"><label class="form-label" for="pUnit">Unit</label>
                        <input type="text" class="form-control" id="pUnit" value="${esc(p ? p.unit : 'pcs')}"></div>
                    <div class="col-md-2"><label class="form-label" for="pQty">${isEdit ? 'Current stock' : 'Initial stock'}</label>
                        <input type="number" class="form-control" id="pQty" min="0" step="1" value="${p ? p.quantity : 0}" ${isEdit ? 'readonly' : ''}>
                        ${isEdit ? '<div class="form-text">Use Stock In / Out to change.</div>' : ''}</div>
                    <div class="col-md-2"><label class="form-label" for="pMin">Alert threshold</label>
                        <input type="number" class="form-control" id="pMin" min="0" step="1" value="${p ? p.minStock : 5}"></div>
                    <div class="col-12"><label class="form-label" for="pDesc">Description</label>
                        <textarea class="form-control" id="pDesc" rows="2">${esc(p ? p.description : '')}</textarea></div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="btn btn-primary me-2"><i class="fas fa-save me-1"></i>${isEdit ? 'Save changes' : 'Add product'}</button>
                    <button type="button" class="btn btn-secondary" data-page="products"><i class="fas fa-xmark me-1"></i>Cancel</button>
                </div>
            </form>
        </div>`;

    document.getElementById('productForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.target;
        if (!form.checkValidity()) { form.classList.add('was-validated'); return toast('Please fill all required fields', 'warning'); }

        const data = {
            sku: document.getElementById('pSku').value.trim(),
            name: document.getElementById('pName').value.trim(),
            category: document.getElementById('pCategory').value.trim(),
            supplierId: parseInt(document.getElementById('pSupplier').value, 10) || null,
            location: document.getElementById('pLocation').value.trim(),
            cost: num(document.getElementById('pCost').value),
            price: num(document.getElementById('pPrice').value),
            unit: document.getElementById('pUnit').value.trim() || 'pcs',
            minStock: Math.max(0, parseInt(document.getElementById('pMin').value, 10) || 0),
            description: document.getElementById('pDesc').value.trim()
        };
        const duplicate = state.products.some((x) => x.sku.toLowerCase() === data.sku.toLowerCase() && (!isEdit || x.id !== p.id));
        if (duplicate) return alertBox('Duplicate SKU', `The SKU "${data.sku}" already exists.`, 'error');

        if (isEdit) {
            Object.assign(p, data);
            toast('Product updated');
        } else {
            const qty = Math.max(0, parseInt(document.getElementById('pQty').value, 10) || 0);
            const newProduct = Object.assign({ id: generateId(state.products), quantity: 0 }, data);
            state.products.push(newProduct);
            if (qty > 0) {
                const sup = supplierById(data.supplierId);
                recordMovement({ productId: newProduct.id, type: 'in', qty, date: todayStr(), party: sup ? sup.name : '', reference: 'INIT', note: 'Initial stock' });
            }
            toast('Product added');
        }
        saveState();
        navigateTo('products');
    });
}

/* ---------- Stock In / Out ---------- */
function renderMovementForm(type, params = {}) {
    const isIn = type === 'in';
    const options = state.products.map((p) =>
        `<option value="${p.id}" ${params.productId === p.id ? 'selected' : ''}>${esc(p.name)} (${esc(p.sku)}) - ${p.quantity} ${esc(p.unit)}</option>`).join('');
    const supplierList = state.suppliers.map((s) => `<option value="${esc(s.name)}">`).join('');

    mainContent.innerHTML = `
        <div class="content-section">
            <h2 class="section-title"><i class="fas ${isIn ? 'fa-arrow-down-long' : 'fa-arrow-up-long'} me-2"></i>${isIn ? 'Stock In (Receive goods)' : 'Stock Out (Issue goods)'}</h2>
            ${state.products.length ? '' : '<div class="alert alert-warning">Add a product first.</div>'}
            <form id="movementForm" class="needs-validation" novalidate>
                <div class="row g-3">
                    <div class="col-md-6"><label class="form-label" for="mProduct">Product <span class="text-danger">*</span></label>
                        <select class="form-select" id="mProduct" required><option value="" disabled ${params.productId ? '' : 'selected'}>Choose product...</option>${options}</select>
                        <div class="invalid-feedback">Please select a product.</div>
                        <div class="form-text" id="mHint"></div></div>
                    <div class="col-md-3"><label class="form-label" for="mQty">Quantity <span class="text-danger">*</span></label>
                        <input type="number" class="form-control" id="mQty" min="1" step="1" required><div class="invalid-feedback" id="mQtyFeedback">Enter a quantity of at least 1.</div></div>
                    <div class="col-md-3"><label class="form-label" for="mDate">Date</label>
                        <input type="text" class="form-control" id="mDate" placeholder="Select date"></div>
                    <div class="col-md-4"><label class="form-label" for="mParty">${isIn ? 'Supplier' : 'Customer / Destination'}</label>
                        <input type="text" class="form-control" id="mParty" ${isIn ? 'list="supplierNames"' : ''} placeholder="${isIn ? 'Supplier name' : 'Customer name'}">
                        ${isIn ? `<datalist id="supplierNames">${supplierList}</datalist>` : ''}</div>
                    <div class="col-md-4"><label class="form-label" for="mRef">${isIn ? 'Purchase order / Invoice no.' : 'Invoice / Delivery note no.'}</label>
                        <input type="text" class="form-control" id="mRef"></div>
                    <div class="col-md-4"><label class="form-label" for="mNote">Note</label>
                        <input type="text" class="form-control" id="mNote" placeholder="${isIn ? 'e.g. Restock' : 'e.g. Sale, damaged, sample'}"></div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="btn btn-${isIn ? 'success' : 'danger'} me-2"><i class="fas fa-check-circle me-1"></i>${isIn ? 'Receive stock' : 'Issue stock'}</button>
                    <button type="button" class="btn btn-secondary" data-page="products"><i class="fas fa-xmark me-1"></i>Cancel</button>
                </div>
            </form>
        </div>`;

    const fp = flatpickr('#mDate', { dateFormat: 'Y-m-d', defaultDate: 'today', maxDate: 'today', altInput: true, altFormat: 'F j, Y' });
    const productSel = document.getElementById('mProduct');
    const qtyInput = document.getElementById('mQty');
    const hint = document.getElementById('mHint');
    const updateHint = () => {
        const p = productById(parseInt(productSel.value, 10));
        hint.textContent = p ? `Current stock: ${p.quantity} ${p.unit}` : '';
        if (!isIn && p) qtyInput.max = p.quantity; else qtyInput.removeAttribute('max');
    };
    productSel.addEventListener('change', updateHint);
    updateHint();

    document.getElementById('movementForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.target;
        const p = productById(parseInt(productSel.value, 10));
        const qty = parseInt(qtyInput.value, 10);
        if (!isIn && p && qty > p.quantity) {
            document.getElementById('mQtyFeedback').textContent = `Only ${p.quantity} ${p.unit} available.`;
            qtyInput.setCustomValidity('Too many');
        } else {
            qtyInput.setCustomValidity('');
        }
        if (!form.checkValidity()) { form.classList.add('was-validated'); return toast('Please check the form', 'warning'); }

        const res = recordMovement({
            productId: p.id, type, qty,
            date: fp.input.value || todayStr(),
            party: document.getElementById('mParty').value.trim(),
            reference: document.getElementById('mRef').value.trim(),
            note: document.getElementById('mNote').value.trim()
        });
        if (!res.ok) return alertBox('Error', res.msg, 'error');
        toast(`${isIn ? 'Received' : 'Issued'} ${qty} x ${p.name}`);
        const after = res.product;
        if (!isIn && stockStatus(after).key !== 'ok') {
            alertBox('Stock alert', `${after.name} is now ${stockStatus(after).label.toLowerCase()} (${after.quantity} ${after.unit} left).`, 'warning');
        }
        navigateTo('movements');
    });
}

/* ---------- Movements history ---------- */
function renderMovements() {
    const list = [...state.movements].sort((a, b) => (b.date + String(b.id).padStart(8, '0')).localeCompare(a.date + String(a.id).padStart(8, '0')));
    const rows = list.map((m) => {
        const p = productById(m.productId);
        return `<tr>
            <td data-order="${m.date}">${fmtDate(m.date)}</td>
            <td><div class="product-name">${esc(p ? p.name : 'Deleted product')}</div><div class="product-sku">${esc(p ? p.sku : '')}</div></td>
            <td><span class="badge bg-${m.type === 'in' ? 'success' : 'danger'}">${m.type === 'in' ? 'IN' : 'OUT'}</span></td>
            <td class="qty-pill">${m.type === 'in' ? '+' : '-'}${m.qty}</td>
            <td>${esc(m.party || '-')}</td><td>${esc(m.reference || '-')}</td><td>${esc(m.note || '-')}</td></tr>`;
    }).join('');

    mainContent.innerHTML = `
        <div class="content-section">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <h2 class="section-title mb-0"><i class="fas fa-right-left me-2"></i>Stock Movements</h2>
                <div class="d-flex gap-2 no-print">
                    <button class="btn btn-outline-secondary" id="exportMovementsBtn"><i class="fas fa-file-csv me-1"></i>Export CSV</button>
                    <button class="btn btn-success" data-page="stockIn"><i class="fas fa-arrow-down-long me-1"></i>Stock In</button>
                    <button class="btn btn-danger" data-page="stockOut"><i class="fas fa-arrow-up-long me-1"></i>Stock Out</button>
                </div>
            </div>
            <div class="table-responsive mt-3">
                <table id="movementsTable" class="table table-striped table-hover align-middle" style="width:100%">
                    <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Supplier / Customer</th><th>Reference</th><th>Note</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
    initTable('#movementsTable', { order: [] });
    document.getElementById('exportMovementsBtn').addEventListener('click', exportMovementsCSV);
}

function exportMovementsCSV() {
    const rows = [['Date', 'SKU', 'Product', 'Type', 'Quantity', 'Supplier / Customer', 'Reference', 'Note']];
    [...state.movements].sort((a, b) => b.date.localeCompare(a.date)).forEach((m) => {
        const p = productById(m.productId);
        rows.push([m.date, p ? p.sku : '', p ? p.name : 'Deleted product', m.type === 'in' ? 'IN' : 'OUT', m.qty, m.party, m.reference, m.note]);
    });
    downloadCSV(`movements-${todayStr()}.csv`, rows);
}

/* ---------- Suppliers ---------- */
function renderSuppliers() {
    const rows = state.suppliers.map((s) => {
        const count = state.products.filter((p) => p.supplierId === s.id).length;
        return `<tr><td>${s.id}</td><td class="product-name">${esc(s.name)}</td>
            <td>${s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : '-'}</td>
            <td>${esc(s.phone || '-')}</td><td>${esc(s.city || '-')}</td><td>${count}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-warning btn-icon sup-edit" data-id="${s.id}" title="Edit"><i class="fas fa-pen"></i></button>
                <button class="btn btn-sm btn-danger btn-icon sup-del ms-1" data-id="${s.id}" title="Delete"><i class="fas fa-trash"></i></button>
            </td></tr>`;
    }).join('');

    mainContent.innerHTML = `
        <div class="content-section">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <h2 class="section-title mb-0"><i class="fas fa-truck-field me-2"></i>Suppliers</h2>
                <button class="btn btn-primary" id="addSupplierBtn"><i class="fas fa-plus me-1"></i>Add Supplier</button>
            </div>
            <div class="table-responsive mt-3">
                <table id="suppliersTable" class="table table-striped table-hover align-middle" style="width:100%">
                    <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Products</th><th>Actions</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
    initTable('#suppliersTable', { columnDefs: [{ targets: [6], orderable: false, searchable: false }] });
    document.getElementById('addSupplierBtn').addEventListener('click', () => supplierDialog());
    document.querySelectorAll('.sup-edit').forEach((b) => b.addEventListener('click', (e) => supplierDialog(parseInt(e.currentTarget.dataset.id, 10))));
    document.querySelectorAll('.sup-del').forEach((b) => b.addEventListener('click', (e) => deleteSupplier(parseInt(e.currentTarget.dataset.id, 10))));
}

function supplierDialog(id) {
    const s = id ? supplierById(id) : null;
    Swal.fire({
        title: s ? 'Edit supplier' : 'Add supplier',
        html: `<input id="swName" class="swal2-input" placeholder="Company name *" value="${esc(s ? s.name : '')}">
               <input id="swEmail" type="email" class="swal2-input" placeholder="Email" value="${esc(s ? s.email : '')}">
               <input id="swPhone" class="swal2-input" placeholder="Phone" value="${esc(s ? s.phone : '')}">
               <input id="swCity" class="swal2-input" placeholder="City" value="${esc(s ? s.city : '')}">`,
        focusConfirm: false, showCancelButton: true, confirmButtonText: 'Save', confirmButtonColor: '#2f6fed',
        preConfirm: () => {
            const name = document.getElementById('swName').value.trim();
            const email = document.getElementById('swEmail').value.trim();
            if (!name) { Swal.showValidationMessage('Company name is required'); return false; }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Swal.showValidationMessage('Please enter a valid email'); return false; }
            return { name, email, phone: document.getElementById('swPhone').value.trim(), city: document.getElementById('swCity').value.trim() };
        }
    }).then((r) => {
        if (!r.isConfirmed) return;
        if (s) Object.assign(s, r.value);
        else state.suppliers.push(Object.assign({ id: generateId(state.suppliers) }, r.value));
        saveState();
        toast(s ? 'Supplier updated' : 'Supplier added');
        renderSuppliers();
    });
}

function deleteSupplier(id) {
    const s = supplierById(id);
    if (!s) return;
    const used = state.products.filter((p) => p.supplierId === id).length;
    if (used) return alertBox('Cannot delete', `${s.name} is linked to ${used} product(s). Reassign them first.`, 'error');
    confirmBox('Delete supplier?', `${s.name} will be removed.`, 'Yes, delete').then((r) => {
        if (!r.isConfirmed) return;
        state.suppliers = state.suppliers.filter((x) => x.id !== id);
        saveState();
        toast('Supplier deleted');
        renderSuppliers();
    });
}

/* ---------- Stock alerts ---------- */
function renderLowStock() {
    const items = state.products.filter((p) => stockStatus(p).key !== 'ok').sort((a, b) => a.quantity - b.quantity);
    const rows = items.map((p) => {
        const st = stockStatus(p);
        const sup = supplierById(p.supplierId);
        const suggested = Math.max(1, p.minStock * 2 - p.quantity);
        return `<tr class="${st.key === 'out' ? 'table-danger' : 'table-warning'}">
            <td><div class="product-name">${esc(p.name)}</div><div class="product-sku">${esc(p.sku)}</div></td>
            <td class="qty-pill">${p.quantity} ${esc(p.unit)}</td><td>${p.minStock}</td>
            <td><span class="badge bg-${st.cls}">${st.label}</span></td>
            <td>${sup ? esc(sup.name) : '-'}</td><td>${suggested}</td>
            <td><button class="btn btn-sm btn-success restock-btn" data-id="${p.id}"><i class="fas fa-plus me-1"></i>Restock</button></td></tr>`;
    }).join('');

    mainContent.innerHTML = `
        <div class="content-section">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <h2 class="section-title mb-0"><i class="fas fa-triangle-exclamation me-2"></i>Stock Alerts</h2>
                <button class="btn btn-outline-secondary no-print" id="exportAlertsBtn" ${items.length ? '' : 'disabled'}><i class="fas fa-file-csv me-1"></i>Export reorder list</button>
            </div>
            ${items.length ? `<div class="table-responsive mt-3"><table id="alertsTable" class="table table-hover align-middle" style="width:100%">
                <thead><tr><th>Product</th><th>In stock</th><th>Minimum</th><th>Status</th><th>Supplier</th><th>Suggested order</th><th></th></tr></thead>
                <tbody>${rows}</tbody></table></div>`
            : `<div class="text-center py-5"><i class="fas fa-circle-check fa-3x text-success mb-3"></i><h5>All good!</h5><p class="text-muted mb-0">No product is below its alert threshold.</p></div>`}
        </div>`;

    if (items.length) {
        initTable('#alertsTable', { order: [[1, 'asc']], columnDefs: [{ targets: [6], orderable: false, searchable: false }] });
        document.querySelectorAll('.restock-btn').forEach((b) => b.addEventListener('click', (e) => navigateTo('stockIn', { productId: parseInt(e.currentTarget.dataset.id, 10) })));
        document.getElementById('exportAlertsBtn').addEventListener('click', () => {
            const out = [['SKU', 'Product', 'In stock', 'Minimum', 'Supplier', 'Suggested order']];
            items.forEach((p) => { const sup = supplierById(p.supplierId); out.push([p.sku, p.name, p.quantity, p.minStock, sup ? sup.name : '', Math.max(1, p.minStock * 2 - p.quantity)]); });
            downloadCSV(`reorder-list-${todayStr()}.csv`, out);
        });
    }
}

/* ---------- Reports ---------- */
function renderReports() {
    const s = computeStats();
    const from30 = daysAgo(30);
    const last30 = state.movements.filter((m) => m.date >= from30);
    const in30 = last30.filter((m) => m.type === 'in').reduce((a, m) => a + m.qty, 0);
    const out30 = last30.filter((m) => m.type === 'out').reduce((a, m) => a + m.qty, 0);

    mainContent.innerHTML = `
        <div class="content-section">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h2 class="section-title mb-0"><i class="fas fa-chart-pie me-2"></i>Reports &amp; Statistics</h2>
                <button class="btn btn-outline-secondary no-print" onclick="window.print()"><i class="fas fa-print me-1"></i>Print</button>
            </div>
            <div class="row g-3 mb-2">
                <div class="col-md-3"><div class="p-3 border rounded"><div class="text-muted small">Stock value (cost)</div><div class="fs-5 fw-bold">${money(s.costValue)}</div></div></div>
                <div class="col-md-3"><div class="p-3 border rounded"><div class="text-muted small">Retail value</div><div class="fs-5 fw-bold">${money(s.retailValue)}</div></div></div>
                <div class="col-md-3"><div class="p-3 border rounded"><div class="text-muted small">Units received (30 days)</div><div class="fs-5 fw-bold text-success">+${in30}</div></div></div>
                <div class="col-md-3"><div class="p-3 border rounded"><div class="text-muted small">Units issued (30 days)</div><div class="fs-5 fw-bold text-danger">-${out30}</div></div></div>
            </div>
        </div>
        <div class="row g-4">
            <div class="col-lg-6"><div class="content-section h-100"><h2 class="section-title">Top products by stock value</h2><div class="chart-box"><canvas id="topValueChart"></canvas></div></div></div>
            <div class="col-lg-6"><div class="content-section h-100"><h2 class="section-title">Units by category</h2><div class="chart-box"><canvas id="unitsCatChart"></canvas></div></div></div>
            <div class="col-lg-8"><div class="content-section h-100"><h2 class="section-title">Movements - last 6 months</h2><div class="chart-box"><canvas id="monthlyChart"></canvas></div></div></div>
            <div class="col-lg-4"><div class="content-section h-100"><h2 class="section-title">Stock health</h2><div class="chart-box"><canvas id="healthChart"></canvas></div></div></div>
        </div>`;

    const top = [...state.products].sort((a, b) => b.quantity * b.cost - a.quantity * a.cost).slice(0, 8);
    makeChart('topValueChart', {
        type: 'bar',
        data: { labels: top.map((p) => p.name), datasets: [{ label: 'Value (cost)', data: top.map((p) => +(p.quantity * p.cost).toFixed(2)), backgroundColor: '#2f6fed', borderRadius: 4 }] },
        options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
    });

    const units = {};
    state.products.forEach((p) => { const c = p.category || 'Uncategorized'; units[c] = (units[c] || 0) + p.quantity; });
    makeChart('unitsCatChart', {
        type: 'pie',
        data: { labels: Object.keys(units), datasets: [{ data: Object.values(units), backgroundColor: PALETTE, borderWidth: 0 }] },
        options: { plugins: { legend: { position: 'bottom' } } }
    });

    const months = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); months.push(d.toISOString().slice(0, 7)); }
    const monthSum = (type, ym) => state.movements.filter((m) => m.type === type && m.date.startsWith(ym)).reduce((a, m) => a + m.qty, 0);
    makeChart('monthlyChart', {
        type: 'line',
        data: {
            labels: months.map((m) => new Date(m + '-01T00:00:00').toLocaleDateString(undefined, { month: 'short', year: '2-digit' })),
            datasets: [
                { label: 'In', data: months.map((m) => monthSum('in', m)), borderColor: '#159a63', backgroundColor: 'rgba(21,154,99,0.15)', fill: true, tension: 0.3 },
                { label: 'Out', data: months.map((m) => monthSum('out', m)), borderColor: '#d6336c', backgroundColor: 'rgba(214,51,108,0.15)', fill: true, tension: 0.3 }
            ]
        },
        options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { position: 'top' } } }
    });

    const okCount = state.products.length - s.low - s.out;
    makeChart('healthChart', {
        type: 'doughnut',
        data: { labels: ['In stock', 'Low stock', 'Out of stock'], datasets: [{ data: [okCount, s.low, s.out], backgroundColor: ['#159a63', '#f08c00', '#d6336c'], borderWidth: 0 }] },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

/* ---------- Settings ---------- */
function renderSettings() {
    mainContent.innerHTML = `
        <div class="content-section">
            <h2 class="section-title"><i class="fas fa-gear me-2"></i>Settings</h2>
            <form id="settingsForm" class="row g-3">
                <div class="col-md-6"><label class="form-label" for="sCompany">Company name</label>
                    <input class="form-control" id="sCompany" value="${esc(state.settings.company)}"></div>
                <div class="col-md-6"><label class="form-label" for="sCurrency">Currency</label>
                    <select class="form-select" id="sCurrency">${['MAD', 'EUR', 'USD', 'GBP', 'AED', 'SAR', 'CAD'].map((c) => `<option ${state.settings.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
                <div class="col-12"><button class="btn btn-primary" type="submit"><i class="fas fa-save me-1"></i>Save settings</button></div>
            </form>
        </div>

        <div class="content-section">
            <h2 class="section-title"><i class="fas fa-database me-2"></i>Data &amp; Backup</h2>
            <p class="text-muted">Your data is stored locally in this browser. Export a backup regularly, or move your data to another device with import.</p>
            <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-outline-primary" id="exportJsonBtn"><i class="fas fa-download me-1"></i>Export backup (JSON)</button>
                <button class="btn btn-outline-primary" id="importJsonBtn"><i class="fas fa-upload me-1"></i>Import backup</button>
                <input type="file" id="importFile" accept="application/json,.json" class="d-none">
                <button class="btn btn-outline-warning" id="demoBtn"><i class="fas fa-wand-magic-sparkles me-1"></i>Load demo data</button>
                <button class="btn btn-outline-danger" id="clearBtn"><i class="fas fa-trash me-1"></i>Erase all data</button>
            </div>
        </div>`;

    document.getElementById('settingsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        state.settings.company = document.getElementById('sCompany').value.trim() || 'My Company';
        state.settings.currency = document.getElementById('sCurrency').value;
        saveState(); refreshChrome(); toast('Settings saved');
    });
    document.getElementById('exportJsonBtn').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = `stockmaster-backup-${todayStr()}.json`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    const fileInput = document.getElementById('importFile');
    document.getElementById('importJsonBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                if (!data || !Array.isArray(data.products) || !Array.isArray(data.movements) || !Array.isArray(data.suppliers)) throw new Error('Invalid file');
                confirmBox('Replace current data?', 'Importing will overwrite everything currently stored.', 'Yes, import').then((r) => {
                    if (!r.isConfirmed) return;
                    state = Object.assign(seedData(), data);
                    state.settings = Object.assign({ company: 'My Company', currency: 'MAD' }, data.settings);
                    saveState(); refreshChrome(); toast('Backup imported'); navigateTo('dashboard');
                });
            } catch (err) { alertBox('Import failed', 'This file is not a valid StockMaster backup.', 'error'); }
        };
        reader.readAsText(file);
    });
    document.getElementById('demoBtn').addEventListener('click', () => {
        confirmBox('Load demo data?', 'Your current data will be replaced by sample data.', 'Yes, load demo').then((r) => {
            if (!r.isConfirmed) return;
            state = seedData(); saveState(); refreshChrome(); toast('Demo data loaded'); navigateTo('dashboard');
        });
    });
    document.getElementById('clearBtn').addEventListener('click', () => {
        confirmBox('Erase everything?', 'All products, suppliers and movements will be permanently deleted.', 'Yes, erase all').then((r) => {
            if (!r.isConfirmed) return;
            state = { products: [], suppliers: [], movements: [], settings: state.settings };
            saveState(); refreshChrome(); toast('All data erased'); navigateTo('dashboard');
        });
    });
}

/* ---------- Help ---------- */
function renderHelp() {
    const faqs = [
        { q: 'How do I add a product?', a: "Open 'Add Product', fill in the SKU, name, category, prices and the alert threshold. An initial quantity automatically creates a Stock In movement." },
        { q: 'How do I receive or issue stock?', a: "Use 'Stock In' for deliveries and 'Stock Out' for sales or consumption. You can also click the + / - buttons next to a product. Stock can never go below zero." },
        { q: 'What does the alert threshold do?', a: "When a product's quantity falls to its threshold it is flagged 'Low stock'; at zero it is 'Out of stock'. Both appear in Stock Alerts and on the dashboard." },
        { q: 'Where is my data stored?', a: 'Only in your browser (localStorage). Nothing is sent to a server. Use Settings > Export backup to keep a copy or move it to another device.' },
        { q: 'Can I export my data?', a: 'Yes. Products, movements and the reorder list export to CSV (opens in Excel). A full JSON backup is available in Settings.' },
        { q: 'How do I change the currency?', a: 'Go to Settings and pick your currency. Amounts are formatted automatically everywhere.' }
    ];
    mainContent.innerHTML = `
        <div class="content-section">
            <h2 class="section-title"><i class="fas fa-circle-question me-2"></i>Help Center</h2>
            ${faqs.map((f) => `<div class="faq-item"><div class="faq-question"><i class="fas fa-circle-question me-2"></i>${f.q}</div><div class="faq-answer">${f.a}</div></div>`).join('')}
            <div class="text-center text-muted mt-4 small">StockMaster &mdash; designed &amp; developed by <strong>Omar Derdare</strong>, Full Stack Developer.</div>
        </div>`;
}

/* ==========================================================================
   NAVIGATION
   ========================================================================== */
const PAGES = {
    dashboard: { title: 'Dashboard', render: renderDashboard },
    products: { title: 'Products', render: renderProducts },
    addProduct: { title: 'Add Product', render: renderProductForm, nav: 'addProduct' },
    stockIn: { title: 'Stock In', render: (p) => renderMovementForm('in', p) },
    stockOut: { title: 'Stock Out', render: (p) => renderMovementForm('out', p) },
    movements: { title: 'Movements', render: renderMovements },
    suppliers: { title: 'Suppliers', render: renderSuppliers },
    lowStock: { title: 'Stock Alerts', render: renderLowStock },
    reports: { title: 'Reports', render: renderReports },
    settings: { title: 'Settings', render: renderSettings },
    help: { title: 'Help', render: renderHelp }
};

let currentPage = 'dashboard';
let currentParams = {};

function setActiveLink(page) {
    document.querySelectorAll('#sidebar .nav-link').forEach((l) => l.classList.toggle('active', l.dataset.page === page));
}

function refreshChrome() {
    const alerts = state.products.filter((p) => stockStatus(p).key !== 'ok').length;
    const badge = document.getElementById('alertBadge');
    badge.textContent = alerts;
    badge.classList.toggle('d-none', alerts === 0);
    document.getElementById('companyNameLabel').textContent = state.settings.company;
    document.title = `StockMaster | ${state.settings.company}`;
}

function navigateTo(page, params = {}, silent = false) {
    if (!PAGES[page]) page = 'dashboard';
    currentPage = page;
    currentParams = params;
    destroyCharts();
    if (window.innerWidth < 992) closeSidebar();

    PAGES[page].render(params);
    topbarTitle.textContent = PAGES[page].title;
    setActiveLink(page);
    refreshChrome();
    try { history.replaceState(null, '', '#' + page); } catch (e) { /* file:// restrictions */ }
    if (!silent) window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Delegated navigation: any element with data-page (+ optional data-params JSON) */
document.addEventListener('click', (event) => {
    const el = event.target.closest('[data-page]');
    if (!el) return;
    event.preventDefault();
    let params = {};
    if (el.dataset.params) { try { params = JSON.parse(el.dataset.params); } catch (e) { /* ignore */ } }
    navigateTo(el.dataset.page, params);
});

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('footerYear').textContent = new Date().getFullYear();
    document.getElementById('topbarDate').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const startPage = (location.hash || '').replace('#', '');
    navigateTo(PAGES[startPage] && startPage !== 'addProduct' ? startPage : 'dashboard', {}, true);
});
