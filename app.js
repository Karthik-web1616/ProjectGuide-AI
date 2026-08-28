/* =============================================================
   app.js — Shared utilities: storage, routing, toast, nav
   ============================================================= */

/* ── LocalStorage helpers ── */
const Store = {
  set(key, val) { localStorage.setItem(`aip_${key}`, JSON.stringify(val)); },
  get(key)      { try { return JSON.parse(localStorage.getItem(`aip_${key}`)); } catch { return null; } },
  remove(key)   { localStorage.removeItem(`aip_${key}`); },
  clear()       { Object.keys(localStorage).filter(k => k.startsWith('aip_')).forEach(k => localStorage.removeItem(k)); }
};

/* ── Auth guard ── 
   Call requireAuth() at the top of any protected page.
   Pass 'faculty' to restrict to faculty only.
*/
function requireAuth(role = null) {
  const user = Store.get('currentUser');
  if (!user || !user.loggedIn) {
    window.location.replace('auth.html');
    return null;
  }
  if (role && user.role !== role) {
    // Wrong role — redirect to their correct dashboard
    if (user.role === 'faculty') window.location.replace('faculty-dashboard.html');
    else window.location.replace('dashboard.html');
    return null;
  }
  return user;
}

/* ── Logout ── */
function logout() {
  Store.remove('currentUser');
  window.location.href = 'auth.html';
}

/* ── Toast notifications ── */
function showToast(msg, icon = '✅', duration = 3000) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── Navbar scroll effect ── */
function initNavScroll() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40));
}

/* ── Active nav link ── */
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.includes(page)) a.classList.add('active');
  });
}

/* ── Populate nav avatar from stored user/profile ── */
function initNavAvatar() {
  const user      = Store.get('currentUser');
  const profile   = Store.get('profile');
  const avatarUrl = Store.get('avatarDataUrl') || (profile && profile.avatar) || (user && user.avatar);
  const avatar    = document.querySelector('.nav-avatar');
  const nameEl    = document.querySelector('.nav-user-name');
  const name      = (profile && profile.name) || (user && user.name) || '';

  if (avatar) {
    if (avatarUrl) {
      avatar.innerHTML = `<img src="${avatarUrl}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">`;
    } else if (name) {
      avatar.textContent = name.charAt(0).toUpperCase();
    }
  }
  if (nameEl && name) {
    nameEl.textContent = name.split(' ')[0];
  }
}

/* ── Scroll-reveal for elements ── */
function initReveal(selector = '.reveal') {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('animate-fade-up');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ── Format date ── */
function fmtDate(d = new Date()) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Format relative time ── */
function fmtRelative(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return fmtDate(new Date(isoString));
}

/* ── Init all shared features ── */
document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  setActiveNav();
  initNavAvatar();
  initReveal();
});
