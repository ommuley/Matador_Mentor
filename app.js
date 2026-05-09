/* ═══════════ MATADOR MENTOR — APP.JS ═══════════ */

// ── Synthetic Data ──────────────────────────────────────────
const SUBJECTS = [
    { code: 'CS4354', name: 'Concepts of Database Systems', level: 'Undergraduate' },
    { code: 'CS3364', name: 'Design & Analysis of Algorithms', level: 'Undergraduate' },
    { code: 'CS4352', name: 'Operating Systems', level: 'Undergraduate' },
    { code: 'CS1411', name: 'Programming Principles I', level: 'Undergraduate' },
    { code: 'CS1412', name: 'Programming Principles II', level: 'Undergraduate' },
    { code: 'MATH2450', name: 'Calculus III', level: 'Undergraduate' },
    { code: 'PHYS1408', name: 'Principles of Physics I', level: 'Undergraduate' },
];

const COLORS = ['#e74c3c','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#06b6d4'];

const FIRST = ['Alex','Maria','James','Priya','Liam','Sofia','Noah','Ava','Carlos','Chen','Aisha','Ryan','Maya','Ethan','Zara','Diego','Emma','Kai','Sara','Tyler'];
const LAST = ['Johnson','Patel','Garcia','Kim','Williams','Chen','Martinez','Brown','Lee','Davis','Singh','Taylor','Rodriguez','Wilson','Thomas','Anderson','White','Harris','Clark','Lopez'];
const MODES = ['online','in-person','hybrid'];
const LOCATIONS = ['Zoom','TTU Library','Holden Hall','SUB'];
const METHODS = ['Credit Card','PayPal','Venmo'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function genName() { return { first: rand(FIRST), last: rand(LAST) }; }
function genInitials(f, l) { return f[0] + l[0]; }

// Build tutor data
const TUTORS = [];
for (let i = 1; i <= 20; i++) {
    const n = genName();
    const numSub = randInt(1, 3);
    const subs = [];
    const pool = [...SUBJECTS];
    for (let j = 0; j < numSub; j++) {
        const idx = randInt(0, pool.length - 1);
        subs.push(pool.splice(idx, 1)[0]);
    }
    TUTORS.push({
        id: i, first: n.first, last: n.last,
        rate: +(randInt(15, 50) + Math.random()).toFixed(2),
        mode: rand(MODES),
        bg: rand(['cleared','cleared','pending']),
        subjects: subs,
        rating: +(3.2 + Math.random() * 1.8).toFixed(2),
        reviews: randInt(2, 28),
        color: COLORS[i % COLORS.length],
    });
}

// Build booking data
const STATUSES = ['confirmed','pending','completed','completed','canceled'];
const BOOKINGS = [];
for (let i = 1; i <= 18; i++) {
    const tutor = rand(TUTORS);
    const subj = rand(tutor.subjects);
    const day = randInt(0, 14);
    const hour = randInt(8, 17);
    const st = new Date(); st.setDate(st.getDate() + day); st.setHours(hour, 0, 0, 0);
    const et = new Date(st); et.setHours(hour + 1);
    const status = rand(STATUSES);
    BOOKINGS.push({
        id: 1000 + i,
        studentId: 151,
        tutor,
        subject: subj,
        start: st, end: et,
        mode: rand(['online','in-person']),
        location: rand(LOCATIONS),
        status,
        note: status === 'pending' ? 'Need help with normalization' : '',
    });
}
BOOKINGS.sort((a, b) => a.start - b.start);

// Build payment data
const PAYMENTS = [];
let payId = 1;
BOOKINGS.filter(b => b.status === 'completed' || b.status === 'confirmed').forEach(b => {
    PAYMENTS.push({
        id: 5000 + payId++,
        bookingId: b.id,
        amount: b.tutor.rate,
        method: rand(METHODS),
        status: b.status === 'completed' ? 'completed' : rand(['completed','pending']),
        paidAt: new Date(b.start.getTime() - randInt(1, 48) * 3600000),
    });
});

// Build review data
const REVIEWS_DATA = [];
TUTORS.forEach(t => {
    const dist = [0, 0, 0, 0, 0];
    for (let i = 0; i < t.reviews; i++) {
        const r = Math.random() > 0.2 ? randInt(3, 5) : randInt(1, 3);
        dist[r - 1]++;
    }
    REVIEWS_DATA.push({ tutor: t, distribution: dist, total: t.reviews, avg: t.rating });
});

// ── Navigation ──────────────────────────────────────────────
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

function switchView(viewId) {
    views.forEach(v => v.classList.remove('active'));
    navBtns.forEach(b => b.classList.remove('active'));
    document.getElementById('view-' + viewId)?.classList.add('active');
    document.querySelector(`[data-view="${viewId}"]`)?.classList.add('active');
}

navBtns.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
document.getElementById('btn-view-all-bookings')?.addEventListener('click', () => switchView('bookings'));

// ── Role Switcher ──────────────────────────────────────────
const roleBtns = document.querySelectorAll('.role-btn');
const roleIndicator = document.querySelector('.role-indicator');

function updateRoleIndicator() {
    const active = document.querySelector('.role-btn.active');
    if (!active || !roleIndicator) return;
    roleIndicator.style.width = active.offsetWidth + 'px';
    roleIndicator.style.left = active.offsetLeft + 'px';
}

function updateRoleView(role) {
    const navFindTutor = document.getElementById('nav-find-tutor');
    const navAdmin = document.getElementById('nav-admin');
    const navPayments = document.getElementById('nav-payments');
    
    // Dashboard Stats elements
    const spentLabel = document.querySelector('#stat-spent .stat-label');
    const spentVal = document.querySelector('#stat-spent .stat-value');
    const rateLabel = document.querySelector('#stat-rating .stat-label');
    const rateVal = document.querySelector('#stat-rating .stat-value');
    const upcomingLabel = document.querySelector('#stat-upcoming .stat-label');
    const upcomingVal = document.querySelector('#stat-upcoming .stat-value');
    const completedLabel = document.querySelector('#stat-completed .stat-label');
    const completedVal = document.querySelector('#stat-completed .stat-value');
    
    const upcomingTitle = document.querySelector('.upcoming-card h2');
    const chartCard = document.querySelector('.chart-card');
    const upcomingCard = document.querySelector('.upcoming-card');
    
    if (role === 'student') {
        if (navFindTutor) navFindTutor.style.display = 'flex';
        if (navAdmin) navAdmin.style.display = 'none';
        if (navPayments) navPayments.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg> Payments';
        document.querySelector('.user-role').textContent = 'Student';
        
        if (spentLabel) spentLabel.textContent = 'Total Spent';
        if (spentVal) { spentVal.dataset.count = "384"; spentVal.dataset.prefix = "$"; }
        if (rateLabel) rateLabel.textContent = 'Avg Rating Given';
        if (rateVal) rateVal.dataset.count = "4.7";
        if (upcomingLabel) upcomingLabel.textContent = 'Upcoming Sessions';
        if (upcomingVal) upcomingVal.dataset.count = "3";
        if (completedLabel) completedLabel.textContent = 'Completed';
        if (completedVal) completedVal.dataset.count = "12";
        
        if (upcomingTitle) upcomingTitle.textContent = 'Upcoming Sessions';
        if (chartCard) chartCard.style.display = 'block';
        if (upcomingCard) upcomingCard.style.display = 'block';
    } else if (role === 'tutor') {
        if (navFindTutor) navFindTutor.style.display = 'none';
        if (navAdmin) navAdmin.style.display = 'none';
        if (navPayments) navPayments.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg> Earnings';
        document.querySelector('.user-role').textContent = 'Tutor';
        
        if (spentLabel) spentLabel.textContent = 'Total Earnings';
        if (spentVal) { spentVal.dataset.count = "840"; spentVal.dataset.prefix = "$"; }
        if (rateLabel) rateLabel.textContent = 'Avg Rating Received';
        if (rateVal) rateVal.dataset.count = "4.9";
        if (upcomingLabel) upcomingLabel.textContent = 'Upcoming Appts';
        if (upcomingVal) upcomingVal.dataset.count = "8";
        if (completedLabel) completedLabel.textContent = 'Completed';
        if (completedVal) completedVal.dataset.count = "34";
        
        if (upcomingTitle) upcomingTitle.textContent = 'Your Appointments';
        if (chartCard) chartCard.style.display = 'block';
        if (upcomingCard) upcomingCard.style.display = 'block';
    } else if (role === 'admin') {
        if (navFindTutor) navFindTutor.style.display = 'flex';
        if (navAdmin) navAdmin.style.display = 'flex';
        if (navPayments) navPayments.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg> Transactions';
        document.querySelector('.user-role').textContent = 'System Admin';
        
        if (spentLabel) spentLabel.textContent = 'Platform Revenue';
        if (spentVal) { spentVal.dataset.count = "12450"; spentVal.dataset.prefix = "$"; }
        if (rateLabel) rateLabel.textContent = 'Avg Platform Rating';
        if (rateVal) rateVal.dataset.count = "4.5";
        if (upcomingLabel) upcomingLabel.textContent = 'Active Users';
        if (upcomingVal) upcomingVal.dataset.count = "200";
        if (completedLabel) completedLabel.textContent = 'Total Bookings';
        if (completedVal) completedVal.dataset.count = "100";
        
        // Hide the upcoming sessions and subject chart for admin to focus on stats
        if (chartCard) chartCard.style.display = 'none';
        if (upcomingCard) upcomingCard.style.display = 'none';
    }
    
    // Re-animate counters to show updated stats
    if (typeof animateCounters === 'function') {
        animateCounters();
    }
    
    // Redirect to dashboard if the current view is hidden
    const activeNav = document.querySelector('.nav-btn.active');
    if (activeNav && activeNav.style.display === 'none') {
        switchView('dashboard');
    }
}

roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        roleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateRoleIndicator();
        updateRoleView(btn.dataset.role);
        showToast(`Switched to ${btn.dataset.role} view`, 'info');
    });
});
setTimeout(() => { updateRoleIndicator(); updateRoleView('student'); }, 100);
window.addEventListener('resize', updateRoleIndicator);

// ── Stat Counter Animation ──────────────────────────────────
function animateCounters() {
    document.querySelectorAll('.stat-value').forEach(el => {
        const target = parseFloat(el.dataset.count);
        const prefix = el.dataset.prefix || '';
        const isFloat = String(target).includes('.');
        let current = 0;
        const step = target / 40;
        const interval = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(interval); }
            el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current));
        }, 30);
    });
}
animateCounters();

// ── Render Upcoming Sessions ────────────────────────────────
function renderUpcoming() {
    const container = document.getElementById('upcoming-sessions');
    if (!container) return;
    const upcoming = BOOKINGS.filter(b => b.status === 'confirmed' || b.status === 'pending').slice(0, 5);
    container.innerHTML = upcoming.map(b => {
        const badgeClass = b.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending';
        const timeStr = b.start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + b.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `<div class="session-item">
            <div class="session-avatar" style="background:${b.tutor.color}">${genInitials(b.tutor.first, b.tutor.last)}</div>
            <div class="session-info">
                <div class="session-name">${b.tutor.first} ${b.tutor.last}</div>
                <div class="session-meta">${b.subject.code} · ${timeStr}</div>
            </div>
            <span class="session-badge ${badgeClass}">${b.status}</span>
        </div>`;
    }).join('');
}
renderUpcoming();

// ── Subject Distribution Chart (Pure Canvas) ────────────────
function renderChart() {
    const canvas = document.getElementById('subject-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const counts = SUBJECTS.map(s => BOOKINGS.filter(b => b.subject.code === s.code).length);
    const total = counts.reduce((a, b) => a + b, 0) || 1;
    const cx = rect.width / 2, cy = rect.height / 2, r = Math.min(cx, cy) - 20;

    let startAngle = -Math.PI / 2;
    counts.forEach((c, i) => {
        const slice = (c / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();
        startAngle += slice;
    });
    // Inner circle for donut
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim();
    ctx.fill();
    // Center text
    ctx.fillStyle = '#f0f0f5';
    ctx.font = 'bold 22px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy - 8);
    ctx.font = '11px Inter';
    ctx.fillStyle = '#9898b0';
    ctx.fillText('sessions', cx, cy + 12);

    // Legend
    const legend = document.getElementById('chart-legend');
    if (legend) {
        legend.innerHTML = SUBJECTS.map((s, i) => `<div class="legend-item"><span class="legend-dot" style="background:${COLORS[i]}"></span>${s.code} (${counts[i]})</div>`).join('');
    }
}
renderChart();
window.addEventListener('resize', renderChart);

// ── Find Tutor ──────────────────────────────────────────────
function renderTutors(filter = {}) {
    const grid = document.getElementById('tutor-grid');
    if (!grid) return;

    let filtered = [...TUTORS];
    if (filter.subject) filtered = filtered.filter(t => t.subjects.some(s => s.code === filter.subject));
    if (filter.mode) filtered = filtered.filter(t => t.mode === filter.mode);
    if (filter.search) {
        const q = filter.search.toLowerCase();
        filtered = filtered.filter(t => `${t.first} ${t.last}`.toLowerCase().includes(q) || t.subjects.some(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)));
    }
    if (filter.sort === 'price-low') filtered.sort((a, b) => a.rate - b.rate);
    else if (filter.sort === 'price-high') filtered.sort((a, b) => b.rate - a.rate);
    else filtered.sort((a, b) => b.rating - a.rating);

    grid.innerHTML = filtered.map(t => `
        <div class="tutor-card" data-tutor-id="${t.id}">
            <div class="tutor-top">
                <div class="tutor-avatar" style="background:${t.color}">${genInitials(t.first, t.last)}</div>
                <div>
                    <div class="tutor-name">${t.first} ${t.last}</div>
                    <div class="tutor-rate">$${t.rate.toFixed(2)}/hr</div>
                </div>
            </div>
            <div class="tutor-subjects">${t.subjects.map(s => `<span class="subject-tag">${s.code}</span>`).join('')}</div>
            <div class="tutor-bottom">
                <div class="tutor-rating">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ${t.rating} <span style="color:var(--text-muted);font-weight:400">(${t.reviews})</span>
                </div>
                <span class="tutor-mode">${t.mode}</span>
            </div>
        </div>
    `).join('');

    // Click handler for booking modal
    grid.querySelectorAll('.tutor-card').forEach(card => {
        card.addEventListener('click', () => openBookingModal(TUTORS.find(t => t.id === +card.dataset.tutorId)));
    });

    // Update SQL preview
    const sqlCode = document.getElementById('sql-code-find');
    if (sqlCode) {
        const where = filter.subject ? `WHERE ts.subject_code = '${filter.subject}'` : '-- No subject filter applied';
        sqlCode.textContent = `SELECT t.user_id, u.first_name, u.last_name,
       t.hourly_rate, t.meeting_mode,
       AVG(r.rating) AS avg_rating,
       COUNT(r.review_id) AS total_reviews
FROM TUTOR t
JOIN USER u ON t.user_id = u.user_id
JOIN TUTOR_SUBJECT ts ON t.user_id = ts.tutor_id
LEFT JOIN BOOKING b ON t.user_id = b.tutor_id
LEFT JOIN REVIEW r ON b.booking_id = r.booking_id
${where}
GROUP BY t.user_id
ORDER BY avg_rating DESC;`;
    }
}

document.getElementById('filter-subject')?.addEventListener('change', applyFilters);
document.getElementById('filter-mode')?.addEventListener('change', applyFilters);
document.getElementById('filter-sort')?.addEventListener('change', applyFilters);
document.getElementById('search-input')?.addEventListener('input', applyFilters);

function applyFilters() {
    renderTutors({
        subject: document.getElementById('filter-subject')?.value,
        mode: document.getElementById('filter-mode')?.value,
        sort: document.getElementById('filter-sort')?.value,
        search: document.getElementById('search-input')?.value,
    });
}
renderTutors();

// ── Booking Modal ───────────────────────────────────────────
const overlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const modalTitle = document.getElementById('modal-title');

function openBookingModal(tutor) {
    if (!tutor) return;
    modalTitle.textContent = `Book ${tutor.first} ${tutor.last}`;
    const slots = [];
    for (let d = 1; d <= 7; d++) {
        const dt = new Date(); dt.setDate(dt.getDate() + d);
        const h = randInt(9, 16);
        dt.setHours(h, 0, 0, 0);
        slots.push(dt);
    }
    modalBody.innerHTML = `
        <div class="form-group">
            <label for="modal-subject">Subject</label>
            <select id="modal-subject">${tutor.subjects.map(s => `<option value="${s.code}">${s.code} — ${s.name}</option>`).join('')}</select>
        </div>
        <div class="form-group">
            <label for="modal-slot">Available Slot</label>
            <select id="modal-slot">${slots.map((s, i) => `<option value="${i}">${s.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</option>`).join('')}</select>
        </div>
        <div class="form-group">
            <label for="modal-note">Note (optional)</label>
            <textarea id="modal-note" placeholder="Describe what you need help with..."></textarea>
        </div>
        <div style="padding:12px;background:var(--bg-secondary);border-radius:var(--radius-xs);font-size:.82rem;color:var(--text-secondary);margin-top:4px">
            <strong style="color:var(--text-primary)">Rate:</strong> $${tutor.rate.toFixed(2)}/hr &nbsp;·&nbsp;
            <strong style="color:var(--text-primary)">Mode:</strong> ${tutor.mode} &nbsp;·&nbsp;
            <strong style="color:var(--text-primary)">Rating:</strong> ⭐ ${tutor.rating}
        </div>`;
    overlay.classList.add('open');
}

document.getElementById('modal-close')?.addEventListener('click', () => overlay.classList.remove('open'));
document.getElementById('modal-cancel')?.addEventListener('click', () => overlay.classList.remove('open'));
overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

document.getElementById('modal-confirm')?.addEventListener('click', () => {
    overlay.classList.remove('open');
    showToast('Booking confirmed! Slot locked via FOR UPDATE.', 'success');
});

// ── Bookings View ───────────────────────────────────────────
function renderBookings(tab = 'upcoming') {
    const list = document.getElementById('booking-list');
    if (!list) return;
    const statusMap = { upcoming: ['confirmed', 'pending'], completed: ['completed'], canceled: ['canceled'] };
    const filtered = BOOKINGS.filter(b => statusMap[tab]?.includes(b.status));

    list.innerHTML = filtered.length ? filtered.map(b => {
        const badgeClass = `badge-${b.status}`;
        const timeStr = b.start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + b.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `<div class="booking-item">
            <span class="booking-id">#${b.id}</span>
            <div class="session-avatar" style="background:${b.tutor.color}">${genInitials(b.tutor.first, b.tutor.last)}</div>
            <div class="booking-details">
                <div class="booking-subject">${b.subject.code} — ${b.subject.name}</div>
                <div class="booking-tutor">${b.tutor.first} ${b.tutor.last} · ${b.mode} · ${b.location}</div>
                <div class="booking-time">${timeStr}</div>
            </div>
            <span class="session-badge ${badgeClass}">${b.status}</span>
            ${b.status === 'pending' ? `<div class="booking-actions"><button class="btn btn-primary btn-sm">Accept</button><button class="btn btn-ghost btn-sm">Decline</button></div>` : ''}
        </div>`;
    }).join('') : '<p style="color:var(--text-muted);padding:20px;text-align:center">No bookings found.</p>';
}

document.querySelectorAll('#booking-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#booking-tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderBookings(tab.dataset.tab);
    });
});
renderBookings();

// ── Payments View ───────────────────────────────────────────
function renderPayments() {
    const tbody = document.getElementById('payment-tbody');
    if (!tbody) return;
    tbody.innerHTML = PAYMENTS.map(p => {
        const statusClass = p.status === 'completed' ? 'badge-completed' : 'badge-pending';
        return `<tr>
            <td>#${p.id}</td>
            <td>#${p.bookingId}</td>
            <td>$${p.amount.toFixed(2)}</td>
            <td>${p.method}</td>
            <td><span class="session-badge ${statusClass}">${p.status}</span></td>
            <td>${p.paidAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
        </tr>`;
    }).join('');
}
renderPayments();

// ── Reviews View ────────────────────────────────────────────
function renderReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    const sorted = [...REVIEWS_DATA].sort((a, b) => b.avg - a.avg);

    grid.innerHTML = sorted.map(r => {
        const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(r.avg) ?
            `<svg viewBox="0 0 24 24" class="star-filled"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` :
            `<svg viewBox="0 0 24 24" class="star-empty"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`).join('');
        const maxDist = Math.max(...r.distribution, 1);
        const bars = r.distribution.map((d, i) => `<div class="review-bar-row"><span>${i + 1}★</span><div class="review-bar"><div class="review-bar-fill" style="width:${(d / maxDist) * 100}%"></div></div><span>${d}</span></div>`).reverse().join('');
        return `<div class="review-card">
            <div class="review-top">
                <div>
                    <div class="review-tutor">${r.tutor.first} ${r.tutor.last}</div>
                    <div class="review-stats"><span class="review-stat"><strong>${r.avg}</strong> avg</span><span class="review-stat"><strong>${r.total}</strong> reviews</span></div>
                </div>
                <div class="review-stars">${stars}</div>
            </div>
            <div class="review-bar-container">${bars}</div>
        </div>`;
    }).join('');
}
renderReviews();

// ── Concurrency Demo ────────────────────────────────────────
const terminal = document.getElementById('demo-terminal');
const lockBtn = document.getElementById('btn-lock-slot');

function typeTerminal(lines, callback) {
    if (!terminal) return;
    let i = 0;
    function next() {
        if (i >= lines.length) { if (callback) callback(); return; }
        const line = lines[i++];
        const div = document.createElement('div');
        div.innerHTML = line;
        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
        setTimeout(next, 400);
    }
    next();
}

lockBtn?.addEventListener('click', () => {
    const slotId = document.getElementById('demo-slot-id')?.value || 5;
    terminal.innerHTML = '';
    lockBtn.disabled = true;
    typeTerminal([
        `<span class="terminal-prompt">mysql&gt;</span> START TRANSACTION;`,
        `<span style="color:#9898b0">Query OK, 0 rows affected</span>`,
        ``,
        `<span class="terminal-prompt">mysql&gt;</span> SELECT slot_id, slot_status FROM AVAILABILITY_SLOT WHERE slot_id = ${slotId} FOR UPDATE;`,
        `<span style="color:#9898b0">+─────────+─────────────+</span>`,
        `<span style="color:#9898b0">| slot_id | slot_status |</span>`,
        `<span style="color:#9898b0">+─────────+─────────────+</span>`,
        `<span style="color:#f59e0b">|   ${String(slotId).padEnd(5)} | available   |</span>`,
        `<span style="color:#9898b0">+─────────+─────────────+</span>`,
        `<span style="color:var(--green)">🔒 Exclusive lock acquired on slot ${slotId}</span>`,
        ``,
        `<span class="terminal-prompt">mysql&gt;</span> UPDATE AVAILABILITY_SLOT SET slot_status = 'booked' WHERE slot_id = ${slotId};`,
        `<span style="color:#9898b0">Query OK, 1 row affected</span>`,
        ``,
        `<span class="terminal-prompt">mysql&gt;</span> INSERT INTO BOOKING (...) VALUES (...);`,
        `<span style="color:#9898b0">Query OK, 1 row affected</span>`,
        ``,
        `<span class="terminal-prompt">mysql&gt;</span> COMMIT;`,
        `<span style="color:var(--green)">✓ Transaction committed. Slot ${slotId} is now booked.</span>`,
    ], () => {
        lockBtn.disabled = false;
        showToast(`Slot ${slotId} locked and booked successfully`, 'success');
    });
});

// ── Toast Notifications ─────────────────────────────────────
function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ── Accept / Decline buttons ────────────────────────────────
document.addEventListener('click', e => {
    if (e.target.matches('.booking-actions .btn-primary')) {
        e.target.closest('.booking-item')?.remove();
        showToast('Booking accepted!', 'success');
    }
    if (e.target.matches('.booking-actions .btn-ghost')) {
        e.target.closest('.booking-item')?.remove();
        showToast('Booking declined.', 'error');
    }
});
