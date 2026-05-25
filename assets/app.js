/* ============================================================
   School — app
   Vanilla JS, hash router, localStorage progress.
   ============================================================ */
(function () {
  'use strict';

  const root = document.getElementById('app');
  const STORE = 'school.progress.v1';
  const THEME = 'school.theme.v1';

  /* --------------------- progress store --------------------- */
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    localStorage.setItem(STORE, JSON.stringify(p));
  }
  function getCourseProgress(slug) {
    const p = loadProgress();
    return p[slug] || { done: {}, quizScores: {}, lastModule: null };
  }
  function setModuleDone(slug, n, done) {
    const p = loadProgress();
    p[slug] = p[slug] || { done: {}, quizScores: {}, lastModule: null };
    if (done) p[slug].done[n] = true;
    else delete p[slug].done[n];
    p[slug].lastModule = n;
    saveProgress(p);
    // Best-effort cross-device sync — write to Supabase if signed in.
    syncProgressToSupabase(slug, n, done).catch(() => {});
    // Streak bookkeeping any time the learner actively touches a module.
    if (done) bumpStreak().catch(() => {});
  }
  function setQuizScore(slug, n, score) {
    const p = loadProgress();
    p[slug] = p[slug] || { done: {}, quizScores: {}, lastModule: null };
    p[slug].quizScores[n] = score;
    saveProgress(p);
    syncQuizScoreToSupabase(slug, n, score).catch(() => {});
  }

  // ---------- P1.5 Cross-device progress sync -------------------------------
  async function syncProgressToSupabase(slug, n, done) {
    const u = currentUser(); if (!u) return;
    const client = await supaClient(); if (!client) return;
    await client.from('user_progress').upsert({
      user_id: u.id,
      course_id: slug,
      module_id: String(n),
      completed: !!done,
      completed_at: done ? new Date().toISOString() : null,
      progress_percentage: done ? 100 : 0
    }, { onConflict: 'user_id,course_id,module_id' });
  }
  async function syncQuizScoreToSupabase(slug, n, score) {
    const u = currentUser(); if (!u) return;
    const client = await supaClient(); if (!client) return;
    await client.from('quiz_scores').insert({
      user_id: u.id,
      course_id: slug,
      module_id: String(n),
      score: score,
      total: 0 // Caller doesn't pass total; we keep raw count for now.
    }).then(() => {}).catch(() => {});
  }
  // On sign-in, pull progress from Supabase and merge into local store.
  async function pullProgressFromSupabase() {
    const u = currentUser(); if (!u) return;
    const client = await supaClient(); if (!client) return;
    const { data } = await client.from('user_progress').select('*').eq('user_id', u.id);
    if (!data) return;
    const p = loadProgress();
    for (const row of data) {
      if (!p[row.course_id]) p[row.course_id] = { done: {}, quizScores: {}, lastModule: null };
      if (row.completed) p[row.course_id].done[row.module_id] = true;
    }
    saveProgress(p);
  }

  // ---------- P4.3 Streaks --------------------------------------------------
  async function bumpStreak() {
    const u = currentUser(); if (!u) return;
    const client = await supaClient(); if (!client) return;
    const today = new Date().toISOString().slice(0, 10);
    const { data: row } = await client.from('user_streaks').select('*').eq('user_id', u.id).maybeSingle();
    if (!row) {
      await client.from('user_streaks').upsert({ user_id: u.id, current_streak: 1, longest_streak: 1, last_active_date: today });
      return;
    }
    if (row.last_active_date === today) return; // already counted
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const cur = row.last_active_date === yesterday ? (row.current_streak || 0) + 1 : 1;
    const longest = Math.max(row.longest_streak || 0, cur);
    await client.from('user_streaks').upsert({ user_id: u.id, current_streak: cur, longest_streak: longest, last_active_date: today });
    if (cur === 7) maybeAwardBadge('streak_7');
    if (cur === 30) maybeAwardBadge('streak_30');
  }
  async function maybeAwardBadge(key) {
    const u = currentUser(); if (!u) return;
    const client = await supaClient(); if (!client) return;
    await client.from('user_badges').upsert({ user_id: u.id, badge_key: key }, { onConflict: 'user_id,badge_key' });
  }
  function pctForCourse(course) {
    const cp = getCourseProgress(course.slug);
    const done = Object.keys(cp.done).length;
    return Math.round((done / course.modules.length) * 100);
  }

  /* --------------------- theme --------------------- */
  function initTheme() {
    const saved = localStorage.getItem(THEME);
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (sys ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME, next);
  }

  /* --------------------- utility --------------------- */
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'style') node.style.cssText = attrs[k];
        else if (k.startsWith('on') && typeof attrs[k] === 'function') node.addEventListener(k.slice(2), attrs[k]);
        else if (k === 'data') { for (const d in attrs.data) node.dataset[d] = attrs.data[d]; }
        else node.setAttribute(k, attrs[k]);
      }
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      if (typeof c === 'string' || typeof c === 'number') node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    }
    return node;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function getCourse(slug) { return window.COURSES.find(c => c.slug === slug); }
  function accentOf(name) { return window.ACCENTS[name] || window.ACCENTS.indigo; }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Render untrusted markdown (e.g. AI-generated text). Marked alone passes
  // raw HTML through, so a prompt-injection could echo a <script>. Use
  // marked → then strip dangerous elements via a temp DOM scrub.
  function renderSafeMarkdown(md) {
    if (!window.marked) return escapeHtml(md || '');
    const raw = window.marked.parse(String(md || ''));
    const tmp = document.createElement('div');
    tmp.innerHTML = raw;
    // Remove script/style/iframe/object/embed and any on* attributes.
    tmp.querySelectorAll('script, style, iframe, object, embed, link').forEach(n => n.remove());
    tmp.querySelectorAll('*').forEach(n => {
      [...n.attributes].forEach(a => {
        const name = a.name.toLowerCase();
        if (name.startsWith('on')) n.removeAttribute(a.name);
        if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name);
      });
    });
    return tmp.innerHTML;
  }

  // Map a course slug to its on-disk content directory. The legacy folders
  // are kept (course-finance, course-ios, etc) so we don't have to migrate
  // hundreds of .md files — data.js declares the mapping.
  function contentDirFor(slug) {
    return (window.COURSE_CONTENT_DIR && window.COURSE_CONTENT_DIR[slug]) || `content/${slug}`;
  }
  function modulePath(slug, n) {
    const num = String(n).padStart(2, '0');
    return `${contentDirFor(slug)}/modules/module${num}.md`;
  }
  function quizPath(slug, n) {
    return `${contentDirFor(slug)}/quizzes/quiz${n}.json`;
  }
  function syllabusPath(slug) {
    return `${contentDirFor(slug)}/syllabus.md`;
  }

  async function fetchText(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error('Failed to load ' + path);
    return r.text();
  }
  async function fetchJSON(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error('Failed to load ' + path);
    return r.json();
  }

  /* --------------------- auth + premium glue --------------------- */
  const BACKEND_URL = localStorage.getItem('backend_url') || 'https://school-backend.fly.dev';

  function currentUser() {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch (e) { return null; }
  }
  function setCurrentUser(u) {
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
    window.user = u;
  }
  function hasPremium() {
    try {
      return !!(window.PaymentManager && PaymentManager.hasPremiumAccess && PaymentManager.hasPremiumAccess());
    } catch (e) { return false; }
  }

  // Fetch the current Supabase access token (for attaching as Bearer on
  // backend calls). Returns null if not signed in.
  async function supaToken() {
    try {
      if (typeof SupabaseManager === 'undefined') return null;
      const client = await SupabaseManager.init();
      if (!client?.auth) return null;
      const { data } = await client.auth.getSession();
      return data?.session?.access_token || null;
    } catch (_) { return null; }
  }
  async function authHeaders(extra) {
    const token = await supaToken();
    return Object.assign({ 'Content-Type': 'application/json' }, extra || {}, token ? { Authorization: `Bearer ${token}` } : {});
  }
  // Shortcut: fetch backend route with auto-attached auth.
  async function apiFetch(path, opts = {}) {
    const headers = await authHeaders(opts.headers);
    return fetch(`${BACKEND_URL}${path}`, { ...opts, headers });
  }
  // Direct Supabase client (RLS scoped to caller). Returns null if not init.
  async function supaClient() {
    try {
      if (typeof SupabaseManager === 'undefined') return null;
      return await SupabaseManager.init();
    } catch (_) { return null; }
  }
  window.__schoolApi = { apiFetch, supaToken, supaClient }; // for legacy modules

  // After OAuth redirect, Supabase JS auto-parses #access_token. We read the
  // session, persist it into localStorage as our `user` object, strip the
  // fragment from the URL, then re-render so the topbar updates.
  async function handleOAuthCallback() {
    try {
      if (typeof SupabaseManager === 'undefined') return;
      const client = await SupabaseManager.init();
      if (!client || !client.auth) return;
      const { data: { session } } = await client.auth.getSession();
      if (!session || !session.user) return;
      if (location.hash && location.hash.includes('access_token')) {
        history.replaceState({}, document.title, location.pathname + location.search);
      }
      const supa = session.user;
      const meta = supa.user_metadata || {};
      const u = {
        id: supa.id,
        email: supa.email,
        name: meta.full_name || meta.name || (supa.email ? supa.email.split('@')[0] : 'Learner'),
        avatar: meta.avatar_url || meta.picture || null,
        verified: true,
        authMethod: supa.app_metadata && supa.app_metadata.provider || 'oauth',
        createdAt: supa.created_at || new Date().toISOString()
      };
      setCurrentUser(u);
      if (window.PaymentManager && PaymentManager.refreshPremiumFromServer) {
        PaymentManager.refreshPremiumFromServer();
      }
      pullProgressFromSupabase().catch(() => {});
      render();
    } catch (e) { console.warn('OAuth callback:', e); }
  }

  /* --------------------- icons --------------------- */
  const ICONS = {
    sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
    arrowLeft: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 19l-7-7 7-7"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    clock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    book: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/></svg>'
  };

  /* --------------------- router --------------------- */
  function parseRoute() {
    const h = location.hash.replace(/^#\/?/, '');
    if (!h) return { name: 'home' };
    const parts = h.split('/').filter(Boolean);
    if (parts[0] === 'course' && parts.length === 2) return { name: 'course', slug: parts[1] };
    if (parts[0] === 'course' && parts[2] === 'module' && parts[3]) return { name: 'module', slug: parts[1], n: +parts[3] };
    if (parts[0] === 'course' && parts[2] === 'syllabus') return { name: 'syllabus', slug: parts[1] };
    if (parts[0] === 'progress') return { name: 'progress' };
    if (parts[0] === 'about') return { name: 'about' };
    if (parts[0] === 'verify' && parts[1]) return { name: 'verify', certNumber: parts[1] };
    if (parts[0] === 'review') return { name: 'review' };
    if (parts[0] === 'community') return { name: 'community' };
    if (parts[0] === 'paths') return { name: 'paths' };
    if (parts[0] === 'path' && parts[1]) return { name: 'path', slug: parts[1] };
    if (parts[0] === 'dashboard') return { name: 'dashboard' };
    if (parts[0] === 'admin') return { name: 'admin' };
    if (parts[0] === 'u' && parts[1]) return { name: 'profile', handle: parts[1] };
    if (parts[0] === 'search') return { name: 'search' };
    if (parts[0] === 'onboarding') return { name: 'onboarding' };
    return { name: 'home' };
  }
  function go(hash) { location.hash = hash; }

  /* --------------------- views --------------------- */
  function renderTopbar() {
    const route = parseRoute();
    const bar = el('div', { class: 'topbar' },
      el('div', { class: 'topbar-inner' },
        el('div', { class: 'brand', onclick: () => go('#/') },
          el('div', { class: 'brand-mark', html: 'School<em>.</em>' }),
          el('div', { class: 'brand-sub' }, 'est. 2026')
        ),
        el('nav', { class: 'nav' },
          el('a', { href: '#/', class: route.name === 'home' ? 'active' : '' }, 'Catalog'),
          el('a', { href: '#/paths', class: route.name === 'paths' || route.name === 'path' ? 'active' : '' }, 'Paths'),
          el('a', { href: '#/community', class: route.name === 'community' ? 'active' : '' }, 'Community'),
          el('a', { href: '#/progress', class: route.name === 'progress' ? 'active' : '' }, 'Progress'),
          el('a', { href: '#/review', class: route.name === 'review' ? 'active' : '' }, 'Review'),
          el('a', { href: '#/about', class: route.name === 'about' ? 'active' : '' }, 'About')
        ),
        el('div', { class: 'topbar-spacer' }),
        el('div', { class: 'search' },
          el('span', { html: ICONS.search }),
          el('input', { type: 'text', placeholder: 'Search courses…', id: 'globalSearch', autocomplete: 'off' }),
          el('span', { class: 'search-kbd' }, '⌘K')
        ),
        el('div', { class: 'topbar-actions' },
          el('button', { class: 'icon-btn', onclick: toggleTheme, title: 'Toggle theme', id: 'themeToggle' }),
          renderNotifBell(),
          renderAuthBadge()
        )
      )
    );
    return bar;
  }

  function renderNotifBell() {
    const u = currentUser();
    if (!u) return el('span', null);
    const badge = el('span', { class: 'notif-dot', id: 'notifDot', style: 'display:none' });
    const bell = el('button', { class: 'icon-btn notif-bell', title: 'Notifications', onclick: openNotifications },
      el('span', { html: '🔔' }), badge
    );
    refreshNotifBadge();
    return bell;
  }
  async function refreshNotifBadge() {
    try {
      const r = await apiFetch('/api/notifications');
      if (!r.ok) return;
      const data = await r.json();
      const dot = document.getElementById('notifDot');
      if (!dot) return;
      if (data.unread > 0) { dot.style.display = 'inline-flex'; dot.textContent = data.unread; }
      else { dot.style.display = 'none'; }
    } catch (_) {}
  }
  async function openNotifications() {
    const list = el('div', { class: 'notif-list' }, el('div', { class: 'center-state' }, el('span', { class: 'spinner' })));
    showModal({ title: 'Notifications', body: list });
    try {
      const r = await apiFetch('/api/notifications');
      const data = await r.json();
      clear(list);
      if (!data.notifications || data.notifications.length === 0) {
        list.appendChild(el('p', { class: 'muted' }, 'No notifications yet.'));
        return;
      }
      for (const n of data.notifications) {
        const item = el('div', { class: 'notif-item' + (n.read_at ? ' read' : '') },
          el('div', { class: 'notif-title' }, n.title),
          n.body ? el('div', { class: 'tiny muted' }, n.body) : null,
          el('div', { class: 'tiny muted' }, new Date(n.created_at).toLocaleString())
        );
        item.onclick = async () => {
          if (!n.read_at) { await apiFetch(`/api/notifications/${n.id}/read`, { method: 'POST' }); item.classList.add('read'); }
          if (n.url) { closeModal(); location.hash = n.url; }
          refreshNotifBadge();
        };
        list.appendChild(item);
      }
    } catch (e) {
      clear(list); list.appendChild(el('p', { class: 'muted' }, 'Could not load notifications.'));
    }
  }

  function renderAuthBadge() {
    const u = currentUser();
    if (u && u.email) {
      const premium = hasPremium();
      return el('div', { class: 'auth-badge', onclick: openAccountMenu },
        u.avatar
          ? el('img', { class: 'auth-avatar', src: u.avatar, alt: u.name })
          : el('div', { class: 'auth-avatar auth-avatar-initial' }, (u.name || 'L').charAt(0).toUpperCase()),
        el('span', { class: 'auth-name' }, u.name || u.email.split('@')[0]),
        premium ? el('span', { class: 'auth-pill mono' }, 'PRO') : null
      );
    }
    return el('button', { class: 'btn btn-ghost btn-sm', onclick: openSignInModal }, 'Sign in');
  }

  function openAccountMenu() {
    const u = currentUser();
    if (!u) return;
    showModal({
      title: u.name || 'Account',
      body: el('div', { class: 'account-body' },
        el('div', { class: 'muted tiny' }, u.email),
        hasPremium()
          ? el('p', null, 'Subscription: ', el('b', null, 'Premium'), '  ',
              el('button', { class: 'btn btn-ghost btn-sm', onclick: openStripePortal }, 'Manage billing'))
          : el('p', null, 'Subscription: ', el('b', null, 'Free'), '  ',
              el('button', { class: 'btn btn-accent btn-sm', onclick: () => { closeModal(); subscribePrompt('monthly'); } }, 'Upgrade')),
        el('hr'),
        el('div', { class: 'account-links' },
          el('a', { href: '#/dashboard', onclick: closeModal }, 'Instructor dashboard'),
          el('a', { href: '#/admin', onclick: closeModal }, 'Admin'),
          el('a', { href: '#/onboarding', onclick: closeModal }, 'Study plan')
        ),
        el('div', { class: 'modal-actions', style: 'flex-wrap:wrap' },
          el('button', { class: 'btn btn-ghost btn-sm', onclick: downloadDataExport }, 'Export my data'),
          el('button', { class: 'btn btn-ghost btn-sm', onclick: confirmDeleteAccount }, 'Delete account'),
          el('button', { class: 'btn btn-ghost', onclick: closeModal }, 'Close'),
          el('button', { class: 'btn btn-ghost', onclick: signOut }, 'Sign out')
        )
      )
    });
  }

  async function openStripePortal() {
    try {
      const r = await apiFetch('/api/payments/portal', { method: 'POST', body: JSON.stringify({ returnUrl: location.href }) });
      const data = await r.json();
      if (r.ok && data.url) location.href = data.url;
      else alert(data.error || 'Could not open billing portal.');
    } catch (e) { alert(e.message || 'Could not open billing portal.'); }
  }
  async function downloadDataExport() {
    try {
      const r = await apiFetch('/api/user/export');
      if (!r.ok) throw new Error('Export failed');
      const blob = await r.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `school-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) { alert(e.message || 'Export failed.'); }
  }
  async function confirmDeleteAccount() {
    if (!confirm('Permanently delete your account, all progress, comments, certificates, and cancel any active subscription? This cannot be undone.')) return;
    if (!confirm('Are you absolutely sure?')) return;
    try {
      const r = await apiFetch('/api/user/delete', { method: 'DELETE' });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Delete failed'); }
      setCurrentUser(null);
      closeModal();
      alert('Your account has been deleted.');
      location.hash = '#/';
      render();
    } catch (e) { alert(e.message || 'Could not delete account.'); }
  }

  async function signOut() {
    // AuthManager.signOut() now revokes the Supabase session and clears
    // localStorage without reloading. We re-render in place after.
    try {
      if (typeof AuthManager !== 'undefined' && AuthManager.signOut) {
        await AuthManager.signOut();
      } else if (typeof SupabaseManager !== 'undefined') {
        const c = await SupabaseManager.init();
        if (c && c.auth) await c.auth.signOut();
      }
    } catch (e) { console.warn('signOut:', e); }
    setCurrentUser(null);
    closeModal();
    render();
  }

  function openSignInModal() {
    const formState = { mode: 'signin', email: '', password: '', name: '', code: '', pendingEmail: '' };

    const errBox = el('div', { class: 'modal-error', style: 'display:none' });
    const setErr = (m) => {
      if (!m) { errBox.style.display = 'none'; errBox.textContent = ''; return; }
      errBox.style.display = 'block'; errBox.textContent = m;
    };

    function renderForm() {
      const wrap = el('div', { class: 'auth-form' });
      wrap.appendChild(errBox);

      const tabs = el('div', { class: 'auth-tabs' },
        el('button', { class: 'auth-tab ' + (formState.mode === 'signin' ? 'active' : ''), onclick: () => { formState.mode = 'signin'; refresh(); } }, 'Sign in'),
        el('button', { class: 'auth-tab ' + (formState.mode === 'signup' ? 'active' : ''), onclick: () => { formState.mode = 'signup'; refresh(); } }, 'Create account')
      );
      wrap.appendChild(tabs);

      if (formState.mode === 'verify') {
        wrap.appendChild(el('p', { class: 'muted' }, 'We sent a 6-digit code to ' + formState.pendingEmail));
        const codeIn = el('input', { class: 'q-input', type: 'text', placeholder: '6-digit code', maxlength: 6 });
        codeIn.value = formState.code;
        codeIn.oninput = () => { formState.code = codeIn.value; };
        wrap.appendChild(codeIn);
        wrap.appendChild(el('button', { class: 'btn btn-primary', onclick: doVerify }, 'Verify email'));
        return wrap;
      }

      if (formState.mode === 'signup') {
        const nameIn = el('input', { class: 'q-input', type: 'text', placeholder: 'Your name', autocomplete: 'name' });
        nameIn.value = formState.name; nameIn.oninput = () => { formState.name = nameIn.value; };
        wrap.appendChild(nameIn);
      }
      const emailIn = el('input', { class: 'q-input', type: 'email', placeholder: 'Email', autocomplete: 'email' });
      emailIn.value = formState.email; emailIn.oninput = () => { formState.email = emailIn.value; };
      wrap.appendChild(emailIn);
      const passIn = el('input', { class: 'q-input', type: 'password', placeholder: 'Password', autocomplete: formState.mode === 'signin' ? 'current-password' : 'new-password' });
      passIn.value = formState.password; passIn.oninput = () => { formState.password = passIn.value; };
      wrap.appendChild(passIn);

      wrap.appendChild(el('button',
        { class: 'btn btn-primary', onclick: formState.mode === 'signin' ? doSignIn : doSignUp },
        formState.mode === 'signin' ? 'Sign in' : 'Send verification code'));

      wrap.appendChild(el('div', { class: 'auth-divider' }, 'or'));
      wrap.appendChild(el('div', { class: 'auth-oauth' },
        el('button', { class: 'btn btn-ghost', onclick: () => doOAuth('google') },   'Continue with Google'),
        el('button', { class: 'btn btn-ghost', onclick: () => doOAuth('facebook') }, 'Continue with Facebook'),
        el('button', { class: 'btn btn-ghost', onclick: () => doOAuth('apple') },    'Continue with Apple')
      ));
      return wrap;
    }

    let modalBody = renderForm();
    function refresh() {
      const newBody = renderForm();
      modalBody.replaceWith(newBody);
      modalBody = newBody;
    }

    async function doSignIn() {
      setErr('');
      try {
        if (typeof AuthManager === 'undefined') throw new Error('Auth system not loaded.');
        const result = await AuthManager.signInWithEmail(formState.email, formState.password);
        if (result && result.user) {
          setCurrentUser({
            id: result.user.id,
            email: result.user.email,
            name: result.user.user_metadata?.name || result.user.email.split('@')[0],
            verified: true,
            authMethod: 'email',
            createdAt: result.user.created_at || new Date().toISOString()
          });
          closeModal();
          render();
          if (window.PaymentManager?.refreshPremiumFromServer) PaymentManager.refreshPremiumFromServer();
          pullProgressFromSupabase().catch(() => {});
        }
      } catch (e) { setErr(e.message || 'Sign in failed.'); }
    }

    async function doSignUp() {
      setErr('');
      try {
        if (!formState.name || formState.name.trim().length < 2) throw new Error('Name must be at least 2 characters.');
        await AuthManager.signUpWithEmail(formState.email, formState.password, formState.name);
        formState.pendingEmail = formState.email;
        formState.mode = 'verify';
        formState.code = '';
        refresh();
      } catch (e) { setErr(e.message || 'Sign up failed.'); }
    }

    async function doVerify() {
      setErr('');
      try {
        const result = await AuthManager.verifyEmail(formState.pendingEmail, formState.code);
        if (result?.user) {
          setCurrentUser({
            id: result.user.id,
            email: result.user.email || formState.pendingEmail,
            name: result.user.user_metadata?.name || formState.email.split('@')[0],
            verified: true,
            authMethod: 'email',
            createdAt: new Date().toISOString()
          });
          closeModal();
          render();
        }
      } catch (e) { setErr(e.message || 'Verification failed.'); }
    }

    async function doOAuth(provider) {
      setErr('');
      try {
        if (provider === 'google')   await AuthManager.signInWithGoogle();
        if (provider === 'facebook') await AuthManager.signInWithFacebook();
        if (provider === 'apple')    await AuthManager.signInWithApple();
        // The provider page takes over the tab. handleOAuthCallback() picks
        // up the session when the user comes back.
      } catch (e) {
        if (/provider is not enabled/i.test(e.message || '')) {
          setErr(provider.charAt(0).toUpperCase() + provider.slice(1) + ' sign-in is not configured yet. Use email or another provider.');
        } else {
          setErr(e.message || (provider + ' sign in failed.'));
        }
      }
    }

    showModal({ title: 'Welcome to School', body: modalBody });
  }

  /* --------------------- modal primitives --------------------- */
  let _modalEscHandler = null;
  function showModal({ title, body }) {
    closeModal();
    const overlay = el('div', { class: 'modal-overlay', id: 'modalOverlay', onclick: (e) => { if (e.target === overlay) closeModal(); } },
      el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
        el('div', { class: 'modal-head' },
          el('h3', null, title || ''),
          el('button', { class: 'icon-btn', onclick: closeModal, 'aria-label': 'Close' }, '×')
        ),
        body instanceof Node ? body : el('div', null, body || '')
      )
    );
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    // Escape to close — a11y + UX
    _modalEscHandler = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', _modalEscHandler);
  }
  function closeModal() {
    const o = document.getElementById('modalOverlay');
    if (o) o.remove();
    document.body.style.overflow = '';
    if (_modalEscHandler) {
      document.removeEventListener('keydown', _modalEscHandler);
      _modalEscHandler = null;
    }
  }
  window.closeSchoolModal = closeModal;

  /* --------------------- subscription glue --------------------- */
  async function subscribePrompt(planId) {
    const u = currentUser();
    if (!u) { openSignInModal(); return; }
    if (typeof PaymentManager === 'undefined') {
      alert('Payments are not available right now.');
      return;
    }
    try {
      const result = await PaymentManager.createCheckoutSession(planId || 'monthly');
      if (result && result.url) {
        location.href = result.url;
      } else if (result && result.success === false) {
        alert(result.message || 'Could not start checkout.');
      }
    } catch (e) {
      alert(e.message || 'Could not start checkout.');
    }
  }

  function renderFooter() {
    return el('footer', null,
      el('div', { class: 'foot-inner' },
        el('div', null,
          el('div', { class: 'foot-brand', html: 'School<em>.</em>' }),
          el('p', { class: 'foot-tag' }, 'A small, independent school for self-directed learners. Short courses on hard subjects, taught carefully.')
        ),
        el('div', { class: 'foot-col' },
          el('h6', null, 'Learn'),
          el('a', { href: '#/' }, 'All courses'),
          el('a', { href: '#/progress' }, 'My progress'),
          el('a', { href: '#/about' }, 'About'),
          el('a', { href: '#/' }, 'Pricing')
        ),
        el('div', { class: 'foot-col' },
          el('h6', null, 'School'),
          el('a', { href: '#/about' }, 'Pedagogy'),
          el('a', { href: '#/about' }, 'Instructors'),
          el('a', { href: '#/about' }, 'Community'),
          el('a', { href: '#/about' }, 'Press')
        ),
        el('div', { class: 'foot-col' },
          el('h6', null, 'Get in touch'),
          el('a', { href: 'mailto:hello@school.example' }, 'hello@school.example'),
          el('a', { href: '#/' }, 'Help center'),
          el('a', { href: '#/' }, 'Terms'),
          el('a', { href: '#/' }, 'Privacy')
        )
      ),
      el('div', { class: 'foot-baseline' },
        el('span', null, '© 2026 School. A learning experiment.'),
        el('span', { class: 'mono' }, 'v 2.0')
      )
    );
  }

  /* ---------- HOME ---------- */
  function renderHome() {
    const courses = window.COURSES;
    const totalHours = courses.reduce((s, c) => s + c.hours, 0);
    const totalModules = courses.reduce((s, c) => s + c.modules.length, 0);

    // Tabs: All + each category
    const cats = ['All', ...Array.from(new Set(courses.map(c => c.category)))];
    let activeCat = sessionStorage.getItem('school.cat') || 'All';

    const grid = el('div', { class: 'grid', id: 'courseGrid' });

    function paintGrid() {
      clear(grid);
      const list = activeCat === 'All' ? courses : courses.filter(c => c.category === activeCat);
      for (const c of list) grid.appendChild(courseCard(c));
    }

    const filters = el('div', { class: 'filters', id: 'filters' },
      ...cats.map(cat => {
        const count = cat === 'All' ? courses.length : courses.filter(c => c.category === cat).length;
        const chip = el('button',
          { class: 'chip' + (cat === activeCat ? ' active' : ''),
            onclick: () => {
              activeCat = cat;
              sessionStorage.setItem('school.cat', cat);
              filters.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
              chip.classList.add('active');
              paintGrid();
            } },
          cat, ' ', el('small', null, count)
        );
        return chip;
      })
    );
    paintGrid();

    return el('main', { class: 'page' },
      el('section', { class: 'hero' },
        el('div', null,
          el('div', { class: 'eyebrow' }, '— A library of short, careful courses'),
          el('h1', { class: 'serif', html: 'Learn one good thing at a time. <em>Properly.</em>' }),
          el('p', { class: 'hero-lede' }, 'Ten courses on reasoning, money, code, language, and life — each built to be finished in eight weeks, carried for the rest of your life.')
        ),
        el('div', { class: 'hero-side' },
          el('div', { class: 'hero-stat' }, el('span', null, 'Courses'),    el('b', null, courses.length)),
          el('div', { class: 'hero-stat' }, el('span', null, 'Modules'),    el('b', null, totalModules)),
          el('div', { class: 'hero-stat' }, el('span', null, 'Total hours'),el('b', null, totalHours)),
          el('div', { class: 'hero-stat' }, el('span', null, 'Instructors'),el('b', null, '8')),
          el('div', { class: 'hero-stat' }, el('span', null, 'Next cohort'),el('b', null, 'Sep 14'))
        )
      ),
      el('div', { class: 'hero-divider' }),
      el('div', { class: 'section-head' },
        el('h2', null, 'Catalog'),
        el('div', { class: 'right' }, `${courses.length} courses · self-paced or cohort`)
      ),
      filters,
      grid
    );
  }

  function courseCard(c) {
    const a = accentOf(c.accent);
    const pct = pctForCourse(c);
    const cp = getCourseProgress(c.slug);
    const status = pct >= 100 ? 'Completed' : pct > 0 ? 'In progress' : `${c.weeks} weeks · ${c.hours}h`;

    return el('div',
      { class: 'card', style: `--card-accent:${a.dot}`, onclick: () => go(`#/course/${c.slug}`) },
      el('div', { class: 'card-top' },
        el('div', { class: 'card-tag' }, el('span', { class: 'dot' }), c.category),
        el('div', { class: 'card-meta' }, c.level)
      ),
      el('h3', { class: 'card-title' }, c.title),
      el('div', { class: 'card-sub' }, c.subtitle),
      el('p', { class: 'card-blurb' }, c.blurb),
      el('div', { class: 'card-foot' },
        pct > 0
          ? el('div', { class: 'card-progress' },
              el('div', { class: 'card-progress-bar', style: `--p:${pct}%` }, el('i')),
              el('span', null, `${pct}%`))
          : el('div', { class: 'card-progress' }, el('span', null, status)),
        el('div', { class: 'card-cta' }, pct > 0 ? 'Continue' : 'Start', el('span', { class: 'arr', html: ICONS.arrow }))
      )
    );
  }

  /* ---------- COURSE ---------- */
  function renderCourse(slug) {
    const c = getCourse(slug);
    if (!c) return renderNotFound();
    const a = accentOf(c.accent);
    const cp = getCourseProgress(slug);
    const pct = pctForCourse(c);

    const rows = c.modules.map((m, i) => {
      const done = !!cp.done[m.n];
      const inProgress = cp.lastModule === m.n && !done;
      return el('div',
        { class: 'module-row' + (done ? ' done' : ''),
          onclick: () => go(`#/course/${c.slug}/module/${m.n}`) },
        el('div', { class: 'module-num', style: done ? `color:${a.dot}` : '' }, String(m.n).padStart(2, '0')),
        el('div', null,
          el('div', { class: 'module-title' }, m.title),
          el('div', { class: 'module-sub' }, m.sub)
        ),
        el('div', { class: 'module-meta' }, `Module ${m.n} · ~${Math.round(c.hours / c.modules.length)}h`),
        el('div', { class: 'module-status' + (done ? ' done' : inProgress ? ' progress' : '') },
           done ? 'Completed' : inProgress ? 'In progress' : 'Not started'),
        el('div', { class: 'arr', html: ICONS.arrow })
      );
    });

    const premium = hasPremium();
    const headerActions = el('div', { class: 'course-actions' },
      el('button', { class: 'btn btn-primary',
        onclick: () => {
          const next = cp.lastModule || 1;
          go(`#/course/${c.slug}/module/${next}`);
        } },
        pct > 0 ? 'Continue learning' : 'Start course',
        el('span', { html: ICONS.arrow })
      ),
      c.hasSyllabus
        ? el('button', { class: 'btn btn-ghost', onclick: () => go(`#/course/${c.slug}/syllabus`) }, 'View syllabus')
        : null,
      premium
        ? null
        : el('button', { class: 'btn btn-accent', onclick: () => subscribePrompt('monthly') },
            'Unlock all courses — €9.99/mo')
    );

    return el('main', { class: 'page' },
      el('div', { class: 'crumbs' },
        el('a', { href: '#/' }, 'Catalog'),
        el('span', { class: 'sep' }, '/'),
        el('span', null, c.category),
        el('span', { class: 'sep' }, '/'),
        el('span', null, c.title)
      ),
      el('section', { class: 'course-hero' },
        el('div', null,
          el('div', { class: 'eyebrow', style: `color:${a.dot}` }, c.category, ' · ', c.level),
          el('h1', null, c.title),
          el('div', { class: 'sub' }, c.subtitle),
          el('p', { class: 'lede' }, c.blurb),
          headerActions
        ),
        el('aside', { class: 'course-stats' },
          el('div', { class: 'course-stat' }, el('label', null, 'Duration'),  el('value', null, c.weeks + ' weeks')),
          el('div', { class: 'course-stat' }, el('label', null, 'Effort'),    el('value', null, '~' + Math.round(c.hours / c.weeks) + ' h/wk')),
          el('div', { class: 'course-stat' }, el('label', null, 'Modules'),   el('value', null, c.modules.length)),
          el('div', { class: 'course-stat' }, el('label', null, 'Quizzes'),   el('value', null, c.hasQuizzes ? c.modules.length : '—')),
          el('div', { class: 'course-stat' }, el('label', null, 'Tuition'),   el('value', null, '€' + c.price)),
          el('div', { class: 'course-stat' }, el('label', null, 'Instructor'),el('value', null, c.instructor)),
          pct > 0
            ? el('div', { class: 'course-stat', style: 'grid-column:1/-1;margin-top:4px' },
                el('label', null, 'Your progress'),
                el('div', { style: 'display:flex;align-items:center;gap:10px;margin-top:6px' },
                  el('div', { class: 'card-progress-bar', style: `--p:${pct}%;width:100%;height:6px;--card-accent:${a.dot}` }, el('i')),
                  el('b', { class: 'mono', style: 'font-size:13px;color:var(--ink);font-variant-numeric:tabular-nums' }, pct + '%')
                )
              )
            : null
        )
      ),
      el('div', { class: 'section-head' },
        el('h2', null, 'Modules'),
        el('div', { class: 'right' }, `${c.modules.length} modules · ${c.hours} hours total`)
      ),
      el('section', { class: 'module-table' }, ...rows)
    );
  }

  /* ---------- SYLLABUS ---------- */
  async function renderSyllabus(slug) {
    const c = getCourse(slug);
    if (!c) return renderNotFound();
    const container = el('main', { class: 'page narrow' },
      el('div', { class: 'crumbs' },
        el('a', { href: '#/' }, 'Catalog'),
        el('span', { class: 'sep' }, '/'),
        el('a', { href: `#/course/${c.slug}` }, c.title),
        el('span', { class: 'sep' }, '/'),
        el('span', null, 'Syllabus')
      ),
      el('div', { class: 'reader-meta' },
        el('span', { class: 'pill', html: ICONS.book + '<span style="margin-left:6px">Syllabus</span>' }),
        el('span', null, c.title)
      ),
      el('article', { class: 'prose', id: 'syllabusBody' },
        el('div', { class: 'center-state' }, el('span', { class: 'spinner' }))
      )
    );

    try {
      const md = await fetchText(syllabusPath(c.slug));
      const body = container.querySelector('#syllabusBody');
      body.innerHTML = window.marked.parse(md);
    } catch (e) {
      container.querySelector('#syllabusBody').innerHTML = '<p class="muted">Syllabus not available for this course.</p>';
    }
    return container;
  }

  /* ---------- MODULE READER ---------- */
  async function renderModule(slug, n) {
    const c = getCourse(slug);
    if (!c) return renderNotFound();
    const a = accentOf(c.accent);
    const m = c.modules.find(x => x.n === n);
    if (!m) return renderNotFound();
    const cp = getCourseProgress(slug);

    // Rail
    const rail = el('aside', { class: 'reader-rail' },
      el('h6', null, c.title),
      el('ul', { class: 'rail-list' },
        ...c.modules.map(mm => el('li', null,
          el('a', { href: `#/course/${c.slug}/module/${mm.n}`,
            class: 'rail-link' + (mm.n === n ? ' active' : '') + (cp.done[mm.n] ? ' done' : '') },
            el('span', { class: 'n' }, String(mm.n).padStart(2, '0')),
            el('span', { class: 't' }, mm.title.replace(/^Module \d+:?\s*/i, ''))
          )
        ))
      ),
      c.hasSyllabus ? el('a', { href: `#/course/${c.slug}/syllabus`, class: 'rail-link' },
        el('span', { class: 'n', html: ICONS.book }), el('span', { class: 't' }, 'Course syllabus')) : null,
      el('a', { href: `#/course/${c.slug}`, class: 'rail-link' },
        el('span', { class: 'n', html: ICONS.arrowLeft }), el('span', { class: 't' }, 'Back to course'))
    );

    // Main content
    const prose = el('article', { class: 'prose', id: 'proseBody' },
      el('div', { class: 'center-state' }, el('span', { class: 'spinner' }))
    );

    const prev = c.modules.find(x => x.n === n - 1);
    const next = c.modules.find(x => x.n === n + 1);

    const completeBtn = el('button',
      { class: 'btn ' + (cp.done[n] ? 'btn-ghost' : 'btn-accent'),
        id: 'completeBtn',
        onclick: () => {
          const done = !cp.done[n];
          setModuleDone(slug, n, done);
          // If the course just hit 100%, issue a certificate.
          if (done) {
            const newPct = pctForCourse(c);
            if (newPct >= 100) maybeIssueCertificate(c);
          }
          render();
        } },
      cp.done[n] ? el('span', { html: ICONS.check }) : null,
      cp.done[n] ? 'Module completed' : 'Mark as complete'
    );

    const aiTutorBtn = el('button',
      { class: 'btn btn-ghost', onclick: () => openAITutor(c, m) },
      '💬  Ask AI tutor'
    );
    const summaryBtn = el('button',
      { class: 'btn btn-ghost', onclick: () => openModuleSummary(c, m) },
      '📝  AI summary'
    );
    const flashBtn = el('button',
      { class: 'btn btn-ghost', onclick: () => openFlashcards(c, m) },
      '🃏  Flashcards'
    );
    // P6.3 Module audio — browser TTS over the rendered prose text.
    const listenBtn = el('button',
      { class: 'btn btn-ghost', onclick: () => toggleModuleTTS(main.querySelector('#proseBody'), listenBtn) },
      '🔊  Listen'
    );
    const aiBar = el('div', { class: 'ai-bar' }, aiTutorBtn, summaryBtn, flashBtn, listenBtn);

    const main = el('div', { class: 'reader-main' },
      el('div', { class: 'crumbs' },
        el('a', { href: '#/' }, 'Catalog'),
        el('span', { class: 'sep' }, '/'),
        el('a', { href: `#/course/${c.slug}` }, c.title),
        el('span', { class: 'sep' }, '/'),
        el('span', null, 'Module ' + n)
      ),
      el('div', { class: 'reader-meta' },
        el('span', { class: 'pill', style: `color:${a.dot}` }, '● ' + c.category),
        el('span', null, 'Module ' + n + ' of ' + c.modules.length),
        el('span', { html: ICONS.clock + '<span style="margin-left:6px">~' + Math.round(c.hours / c.modules.length) + ' hours</span>' })
      ),
      prose,
      aiBar,
      // quiz placeholder appended after content loads
      el('div', { id: 'quizSlot' }),
      // Per-lesson notes (P1.7) + comments (P1.1) get appended below after content loads.
      el('div', { id: 'notesSlot' }),
      el('div', { id: 'commentsSlot' }),
      el('div', { class: 'complete-row' },
        el('div', { class: 'copy', html: cp.done[n]
          ? 'You\'ve completed <b>this module</b>. Keep going.'
          : 'Done with this module? <b>Mark it complete</b> to track your progress.' }),
        completeBtn
      ),
      el('div', { class: 'reader-foot' },
        prev
          ? el('a', { href: `#/course/${c.slug}/module/${prev.n}` },
              el('label', null, '← Previous'),
              el('div', { class: 'ft' }, prev.title))
          : el('a', { class: 'disabled', href: '#' },
              el('label', null, 'Start of course'),
              el('div', { class: 'ft' }, c.title)),
        next
          ? el('a', { class: 'next', href: `#/course/${c.slug}/module/${next.n}` },
              el('label', null, 'Next →'),
              el('div', { class: 'ft' }, next.title))
          : el('a', { class: 'next', href: `#/course/${c.slug}` },
              el('label', null, 'Finish'),
              el('div', { class: 'ft' }, 'Back to course'))
      )
    );

    // Mark this as the lastModule (visited)
    const p = loadProgress();
    p[slug] = p[slug] || { done: {}, quizScores: {}, lastModule: null };
    p[slug].lastModule = n;
    saveProgress(p);

    // Fetch markdown
    (async () => {
      try {
        const md = await fetchText(modulePath(slug, n));
        // strip the leading "# Module N: ..." H1 / "## ..." H2 because we use them as crumbs already
        prose.innerHTML = window.marked.parse(md);
      } catch (e) {
        prose.innerHTML = '<p class="muted">Could not load this module.</p>';
      }
      // Append quiz if available
      if (c.hasQuizzes) {
        const slot = main.querySelector('#quizSlot');
        renderQuiz(slug, n).then(q => { if (q) slot.appendChild(q); });
      }
      // P1.7 notes panel
      const notesSlot = main.querySelector('#notesSlot');
      if (notesSlot) mountNotesPanel(notesSlot, slug, n);
      // P1.1 comments thread
      const commentsSlot = main.querySelector('#commentsSlot');
      if (commentsSlot) mountComments(commentsSlot, slug, n);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });
    })();

    return el('main', { class: 'page' }, el('section', { class: 'reader' }, rail, main));
  }

  /* ---------- QUIZ ---------- */
  async function renderQuiz(slug, n) {
    let quiz;
    try { quiz = await fetchJSON(quizPath(slug, n)); } catch (e) { return null; }
    const cp = getCourseProgress(slug);
    const prevScore = cp.quizScores[n];

    const state = { answers: {}, submitted: false };

    const items = quiz.questions.map((q, idx) => {
      const item = el('div', { class: 'q-item', data: { qid: q.id } },
        el('div', { class: 'q-num' }, 'Q' + String(idx + 1).padStart(2, '0')),
        el('div', { class: 'q-text' }, q.question)
      );
      if (q.type === 'multiple_choice') {
        const opts = el('div', { class: 'q-options' });
        q.options.forEach((opt, i) => {
          const lbl = el('label', { class: 'q-option' },
            el('input', { type: 'radio', name: 'q' + q.id, value: i,
              onchange: () => { state.answers[q.id] = i; }
            }),
            el('span', null, opt)
          );
          opts.appendChild(lbl);
        });
        item.appendChild(opts);
      } else if (q.type === 'true_false') {
        const opts = el('div', { class: 'q-options' });
        ['True', 'False'].forEach((opt, i) => {
          const lbl = el('label', { class: 'q-option' },
            el('input', { type: 'radio', name: 'q' + q.id, value: i,
              onchange: () => { state.answers[q.id] = i === 0; }
            }),
            el('span', null, opt)
          );
          opts.appendChild(lbl);
        });
        item.appendChild(opts);
      } else if (q.type === 'multi_select') {
        state.answers[q.id] = [];
        const opts = el('div', { class: 'q-options' });
        q.options.forEach((opt, i) => {
          const lbl = el('label', { class: 'q-option' },
            el('input', { type: 'checkbox', name: 'q' + q.id, value: i,
              onchange: (e) => {
                const arr = state.answers[q.id] || [];
                if (e.target.checked) arr.push(i); else { const k = arr.indexOf(i); if (k >= 0) arr.splice(k, 1); }
                state.answers[q.id] = arr;
              }
            }),
            el('span', null, opt)
          );
          opts.appendChild(lbl);
        });
        item.appendChild(opts);
      } else if (q.type === 'fill_blank') {
        item.appendChild(el('input', { class: 'q-input', type: 'text', placeholder: 'Fill in the blank…',
          oninput: (e) => { state.answers[q.id] = e.target.value.trim(); } }));
      } else { // short_answer
        item.appendChild(el('input', { class: 'q-input', type: 'text', placeholder: 'Type your answer…',
          oninput: (e) => { state.answers[q.id] = e.target.value.trim(); } }));
      }
      item.appendChild(el('div', { class: 'q-feedback' }));
      return item;
    });

    const scoreLine = el('div', { class: 'quiz-score' },
      prevScore !== undefined
        ? ['Best score: ', el('b', null, prevScore + ' / ' + quiz.questions.length)]
        : ['Passing score: ', el('b', null, (quiz.passing_score || Math.ceil(quiz.questions.length * 0.75)) + ' / ' + quiz.questions.length)]
    );

    const submitBtn = el('button', { class: 'btn btn-primary', onclick: submit }, 'Submit answers');
    const resetBtn  = el('button', { class: 'btn btn-ghost', onclick: () => location.reload() }, 'Try again');

    function submit() {
      if (state.submitted) return;
      state.submitted = true;
      let score = 0;
      quiz.questions.forEach((q, idx) => {
        const ans = state.answers[q.id];
        const item = items[idx];
        const fb = item.querySelector('.q-feedback');
        let correct = false;
        if (q.type === 'multiple_choice') {
          correct = ans === q.correct_answer;
          item.querySelectorAll('.q-option').forEach((opt, i) => {
            if (i === q.correct_answer) opt.classList.add('correct');
            else if (i === ans) opt.classList.add('incorrect');
            opt.querySelector('input').disabled = true;
          });
        } else if (q.type === 'true_false') {
          correct = ans === !!q.correct_answer;
          item.querySelectorAll('.q-option').forEach((opt, i) => {
            const isCorrect = (i === 0) === !!q.correct_answer;
            if (isCorrect) opt.classList.add('correct');
            else if (i === (ans ? 0 : 1)) opt.classList.add('incorrect');
            opt.querySelector('input').disabled = true;
          });
        } else if (q.type === 'multi_select') {
          const sel = Array.isArray(ans) ? [...ans].sort() : [];
          const target = Array.isArray(q.correct_answer) ? [...q.correct_answer].sort() : [];
          correct = sel.length === target.length && sel.every((v, i) => v === target[i]);
          item.querySelectorAll('.q-option').forEach((opt, i) => {
            if (target.includes(i)) opt.classList.add('correct');
            else if (sel.includes(i)) opt.classList.add('incorrect');
            opt.querySelector('input').disabled = true;
          });
        } else if (q.type === 'fill_blank') {
          const a = (ans || '').toLowerCase().trim();
          correct = (q.acceptable_answers || []).some(x => a === String(x).toLowerCase().trim());
          item.querySelector('.q-input').disabled = true;
        } else {
          const a = (ans || '').toLowerCase();
          // Match acceptable answers by whole-word token, not substring,
          // so "no" doesn't get a pass for "normal" / "north".
          correct = (q.acceptable_answers || []).some(x => {
            if (!a) return false;
            const target = String(x).toLowerCase().trim();
            if (a === target) return true;
            const re = new RegExp('\\b' + target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
            return re.test(a);
          });
          item.querySelector('.q-input').disabled = true;
        }
        if (correct) score++;
        fb.classList.add('show', correct ? 'right' : 'wrong');
        fb.innerHTML = (correct ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + (q.explanation || '');
      });
      setQuizScore(slug, n, score);
      const total = quiz.questions.length;
      const pass = quiz.passing_score || Math.ceil(total * 0.75);
      scoreLine.innerHTML = '';
      scoreLine.appendChild(document.createTextNode('Your score: '));
      scoreLine.appendChild(el('b', null, score + ' / ' + total));
      scoreLine.appendChild(document.createTextNode(score >= pass ? ' — passed.' : ' — try again to pass.'));
      submitBtn.replaceWith(resetBtn);

      // P3.3 — if they didn't pass, offer an AI practice quiz on missed concepts.
      if (score < pass) {
        const missed = quiz.questions.filter((q, i) => {
          const ans = state.answers[q.id];
          if (q.type === 'multiple_choice') return ans !== q.correct_answer;
          return true;
        }).map(q => q.question.slice(0, 120));
        const c = getCourse(slug);
        const mod = c && c.modules.find(m => m.n === n);
        const practiceBtn = el('button', { class: 'btn btn-accent btn-sm', onclick: () => openPracticeQuiz(c, mod, missed) }, '🎯 Practice the misses');
        scoreLine.parentNode.appendChild(practiceBtn);
      }
    }

    return el('section', { class: 'quiz' },
      el('div', { class: 'quiz-head' },
        el('div', null,
          el('h3', null, 'Module ' + n + ' quiz'),
          el('div', { class: 'quiz-meta' }, quiz.questions.length + ' questions · ' + (quiz.time_limit ? quiz.time_limit + ' minutes suggested' : 'untimed'))
        )
      ),
      el('div', { class: 'quiz-body' }, ...items),
      el('div', { class: 'quiz-foot' }, scoreLine, submitBtn)
    );
  }

  /* ---------- PROGRESS ---------- */
  function renderProgress() {
    const courses = window.COURSES;
    const all = courses.map(c => ({ c, pct: pctForCourse(c), cp: getCourseProgress(c.slug) }));
    const started = all.filter(x => x.pct > 0);
    const totalDone = started.reduce((s, x) => s + Object.keys(x.cp.done).length, 0);
    const totalCourses = started.length;

    return el('main', { class: 'page' },
      el('section', { class: 'hero' },
        el('div', null,
          el('div', { class: 'eyebrow' }, '— Where you are in the work'),
          el('h1', { html: 'My <em>progress.</em>' }),
          el('p', { class: 'hero-lede' }, totalCourses === 0
            ? "You haven't started a course yet. Pick one — the calmest one wins."
            : `You've completed ${totalDone} module${totalDone === 1 ? '' : 's'} across ${totalCourses} course${totalCourses === 1 ? '' : 's'}. Keep going.`)
        ),
        el('div', { class: 'hero-side' },
          el('div', { class: 'hero-stat' }, el('span', null, 'Active courses'), el('b', null, totalCourses)),
          el('div', { class: 'hero-stat' }, el('span', null, 'Modules done'),    el('b', null, totalDone)),
          el('div', { class: 'hero-stat' }, el('span', null, 'Quizzes taken'),
            el('b', null, all.reduce((s, x) => s + Object.keys(x.cp.quizScores).length, 0))),
          el('div', { class: 'hero-stat' }, el('span', null, 'Streak'), el('b', null, '—'))
        )
      ),
      el('div', { class: 'hero-divider' }),
      el('div', { class: 'section-head' },
        el('h2', null, 'In progress'),
        el('div', { class: 'right' }, started.length + ' courses')
      ),
      started.length === 0
        ? el('div', { class: 'center-state' },
            el('h3', null, 'Nothing started yet.'),
            el('p', null, 'Open a course from the catalog and your progress will appear here.'),
            el('p', { style: 'margin-top:18px' }, el('a', { class: 'btn btn-primary', href: '#/' }, 'Browse catalog', el('span', { html: ICONS.arrow }))))
        : el('div', { class: 'grid' }, ...started.map(x => courseCard(x.c))),
      el('div', { class: 'hero-divider' }),
      el('div', { class: 'section-head' },
        el('h2', null, 'All courses'),
        el('div', { class: 'right' }, courses.length + ' total')
      ),
      el('div', { class: 'grid' }, ...courses.map(c => courseCard(c)))
    );
  }

  /* ---------- ABOUT ---------- */
  function renderAbout() {
    return el('main', { class: 'page narrow' },
      el('div', { class: 'crumbs' },
        el('a', { href: '#/' }, 'Catalog'),
        el('span', { class: 'sep' }, '/'),
        el('span', null, 'About')
      ),
      el('article', { class: 'prose' },
        el('div', { class: 'eyebrow', style: 'margin-bottom:14px' }, '— About'),
        el('h1', { html: 'A small school for <em>hard subjects</em>, taught carefully.' }),
        el('h2', null, 'What we believe.'),
        el('p', null, 'Most online courses are bloated. They promise everything, deliver shallow tours, and depend on you to backfill the rigor yourself. We do less, more carefully.'),
        el('p', null, 'Every course here is eight weeks long. Eight modules. Each module is a single coherent lesson — a piece of reading, a worked example, a problem set, a short quiz. No fluff. No filler.'),
        el('h3', null, 'Three rules'),
        el('p', null, el('strong', null, 'One thing at a time.'), ' Each module teaches one idea well enough that you can teach it back.'),
        el('p', null, el('strong', null, 'Practice over recognition.'), ' Quizzes test whether you can do the thing, not whether you remember the term for it.'),
        el('p', null, el('strong', null, 'Finished is better than fancy.'), ' Better to finish a small course than abandon a large one. We design for completion.'),
        el('h3', null, 'Instructors'),
        el('p', null, 'Our instructors are working practitioners — engineers, financial planners, philosophers, ASL teachers, working physicists — not full-time content producers. They teach what they live with.'),
        el('h3', null, 'Pricing'),
        el('p', null, 'Self-paced courses are €120–200. Cohort experiences with live sessions are double. If price is the only barrier, write to us; we run a quiet scholarship.'),
        el('h2', null, 'Get in touch.'),
        el('p', null, 'Write to ', el('a', { href: 'mailto:hello@school.example' }, 'hello@school.example'), '. We read everything.')
      )
    );
  }

  /* ============================================================
     PHASE 1–6 — extra routes
     ============================================================ */

  // ---------- P1.2 Verify certificate ---------------------------------------
  async function renderVerify(certNumber) {
    const container = el('main', { class: 'page narrow' },
      el('div', { class: 'crumbs' },
        el('a', { href: '#/' }, 'Catalog'),
        el('span', { class: 'sep' }, '/'),
        el('span', null, 'Verify')
      ),
      el('div', { class: 'cert-verify' },
        el('div', { class: 'center-state' }, el('span', { class: 'spinner' }))
      )
    );
    (async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/api/certificates/verify/${encodeURIComponent(certNumber)}`);
        const data = await r.json();
        const slot = container.querySelector('.cert-verify');
        clear(slot);
        if (!r.ok || !data.certificate) {
          slot.appendChild(el('div', { class: 'cert-verify-bad' },
            el('h2', null, 'Certificate not found.'),
            el('p', { class: 'muted' }, certNumber)
          ));
          return;
        }
        const c = data.certificate;
        slot.appendChild(el('div', { class: 'cert-verify-ok' },
          el('div', { class: 'eyebrow' }, '— Verified certificate'),
          el('h1', { class: 'serif' }, c.student_name),
          el('p', null, 'completed ', el('strong', null, c.course_title)),
          el('p', { class: 'muted tiny' }, new Date(c.issued_at).toLocaleDateString()),
          el('p', { class: 'mono tiny' }, c.certificate_number),
          c.revoked ? el('p', { class: 'muted' }, '⚠️ This certificate has been revoked.') : null
        ));
      } catch (e) {
        const slot = container.querySelector('.cert-verify');
        clear(slot);
        slot.appendChild(el('p', { class: 'muted' }, 'Verification service unavailable.'));
      }
    })();
    return container;
  }

  // ---------- P3.2 Daily review queue ---------------------------------------
  function renderReview() {
    const u = currentUser();
    if (!u) return signedOutPlaceholder('Daily review',
      'Sign in to see your spaced-repetition flashcard queue.');
    const wrap = el('main', { class: 'page narrow' },
      el('div', { class: 'crumbs' }, el('a', { href: '#/' }, 'Catalog'), el('span', { class: 'sep' }, '/'), el('span', null, 'Daily review')),
      el('section', { class: 'hero' },
        el('div', null,
          el('div', { class: 'eyebrow' }, '— Spaced repetition'),
          el('h1', { html: 'Today\'s <em>review.</em>' }),
          el('p', { class: 'hero-lede' }, 'Cards you flagged from your courses, scheduled with FSRS.')
        )
      ),
      el('div', { id: 'reviewBody', class: 'review-body' }, el('div', { class: 'center-state' }, el('span', { class: 'spinner' })))
    );
    (async () => {
      try {
        const client = await supaClient();
        if (!client) throw new Error('Supabase not ready');
        const now = new Date().toISOString();
        const { data: due, error } = await client
          .from('flashcard_reviews')
          .select('card_id, due_at, stability, difficulty, reps, lapses, flashcards!inner(id, front, back, course_slug)')
          .lte('due_at', now)
          .order('due_at', { ascending: true })
          .limit(30);
        const slot = wrap.querySelector('#reviewBody');
        clear(slot);
        if (error || !due || due.length === 0) {
          slot.appendChild(el('p', { class: 'muted' }, due ? 'No cards due. Come back tomorrow.' : (error?.message || 'Could not load review queue.')));
          return;
        }
        startReviewSession(slot, due, client);
      } catch (e) {
        const slot = wrap.querySelector('#reviewBody');
        clear(slot);
        slot.appendChild(el('p', { class: 'muted' }, e.message || 'Could not load review queue.'));
      }
    })();
    return wrap;
  }

  // FSRS-lite scheduler. Grades: 1=Again, 2=Hard, 3=Good, 4=Easy.
  function fsrsNext(card, grade) {
    let { stability, difficulty, reps, lapses } = card;
    stability = Number(stability) || 1; difficulty = Number(difficulty) || 5;
    reps = Number(reps) || 0; lapses = Number(lapses) || 0;
    if (grade === 1) { lapses += 1; stability = Math.max(0.5, stability * 0.5); difficulty = Math.min(10, difficulty + 1); }
    else if (grade === 2) { stability = stability * 1.2; difficulty = Math.min(10, difficulty + 0.15); }
    else if (grade === 3) { stability = stability * (2.5 - difficulty / 10); difficulty = Math.max(1, difficulty - 0.05); }
    else if (grade === 4) { stability = stability * (3.5 - difficulty / 10); difficulty = Math.max(1, difficulty - 0.3); }
    reps += 1;
    const days = Math.max(1, Math.round(stability));
    const due = new Date(Date.now() + days * 86400000).toISOString();
    return { stability, difficulty, reps, lapses, due_at: due, last_reviewed_at: new Date().toISOString() };
  }
  function startReviewSession(slot, cards, client) {
    let i = 0; let correct = 0;
    function show() {
      if (i >= cards.length) {
        clear(slot);
        slot.appendChild(el('h2', null, `Done. ${correct} / ${cards.length} correct.`));
        return;
      }
      const c = cards[i];
      const card = c.flashcards;
      let flipped = false;
      const front = el('div', { class: 'flashcard-front' }, card.front);
      const back  = el('div', { class: 'flashcard-back', style: 'display:none' }, card.back);
      const flipBtn = el('button', { class: 'btn btn-primary', onclick: () => {
        flipped = true;
        back.style.display = 'block';
        flipBtn.style.display = 'none';
        grades.style.display = 'flex';
      }}, 'Show answer');
      async function grade(g) {
        const next = fsrsNext(c, g);
        await client.from('flashcard_reviews').update(next).eq('card_id', c.card_id).eq('user_id', (await client.auth.getUser()).data.user.id);
        if (g >= 3) correct += 1;
        i += 1; show();
      }
      const grades = el('div', { class: 'grades', style: 'display:none;gap:8px;margin-top:12px' },
        el('button', { class: 'btn btn-ghost', onclick: () => grade(1) }, 'Again'),
        el('button', { class: 'btn btn-ghost', onclick: () => grade(2) }, 'Hard'),
        el('button', { class: 'btn btn-primary', onclick: () => grade(3) }, 'Good'),
        el('button', { class: 'btn btn-accent', onclick: () => grade(4) }, 'Easy')
      );
      clear(slot);
      slot.appendChild(el('div', { class: 'review-card' },
        el('div', { class: 'tiny muted' }, `${i + 1} / ${cards.length} · ${card.course_slug || ''}`),
        front, back, flipBtn, grades
      ));
    }
    show();
  }

  // ---------- P4.1 Community feed -------------------------------------------
  function renderCommunity() {
    const u = currentUser();
    const wrap = el('main', { class: 'page' },
      el('section', { class: 'hero' },
        el('div', null,
          el('div', { class: 'eyebrow' }, '— Community'),
          el('h1', { html: 'What people are <em>learning.</em>' }),
          el('p', { class: 'hero-lede' }, 'Wins, questions, study check-ins. Be kind. Be specific.')
        ),
        el('div', { class: 'hero-side' },
          el('div', { class: 'hero-stat' }, el('span', null, 'Be the first'), el('b', null, '✎'))
        )
      ),
      el('div', { class: 'hero-divider' }),
      u ? communityComposer() : el('p', { class: 'muted' }, 'Sign in to post.'),
      el('div', { id: 'feed', class: 'feed' }, el('div', { class: 'center-state' }, el('span', { class: 'spinner' })))
    );
    loadFeed(wrap.querySelector('#feed'));
    return wrap;
  }
  function communityComposer() {
    const ta = el('textarea', { class: 'q-input composer', placeholder: "What's on your mind?", rows: 3 });
    const post = el('button', { class: 'btn btn-primary', onclick: async () => {
      const body = ta.value.trim();
      if (!body) return;
      post.disabled = true;
      try {
        const client = await supaClient();
        if (!client) throw new Error('Sign in first.');
        const { data: { user } } = await client.auth.getUser();
        await client.from('community_posts').insert({ user_id: user.id, body });
        ta.value = '';
        loadFeed(document.getElementById('feed'));
      } catch (e) { alert(e.message); }
      post.disabled = false;
    }}, 'Post');
    return el('div', { class: 'composer-wrap' }, ta, el('div', { style: 'text-align:right;margin-top:6px' }, post));
  }
  async function loadFeed(slot) {
    try {
      const client = await supaClient();
      if (!client) throw new Error('Supabase not ready');
      const { data: posts, error } = await client
        .from('community_posts')
        .select('id, user_id, body, created_at, like_count, comment_count, profiles!inner(name, avatar_url, handle)')
        .order('created_at', { ascending: false }).limit(40);
      clear(slot);
      if (error) { slot.appendChild(el('p', { class: 'muted' }, error.message)); return; }
      if (posts.length === 0) { slot.appendChild(el('p', { class: 'muted' }, 'No posts yet.')); return; }
      posts.forEach(p => slot.appendChild(renderPostCard(p, client)));
    } catch (e) {
      clear(slot);
      slot.appendChild(el('p', { class: 'muted' }, e.message || 'Feed unavailable.'));
    }
  }
  function renderPostCard(p, client) {
    const card = el('article', { class: 'post-card' },
      el('header', { class: 'post-head' },
        el('div', { class: 'auth-avatar auth-avatar-initial' }, (p.profiles?.name || '?').charAt(0).toUpperCase()),
        el('div', null,
          el('div', { class: 'post-name' }, p.profiles?.name || 'Anon'),
          el('div', { class: 'tiny muted' }, new Date(p.created_at).toLocaleString())
        )
      ),
      el('div', { class: 'post-body', html: renderSafeMarkdown(p.body) }),
      el('div', { class: 'post-foot' },
        el('button', { class: 'btn btn-ghost btn-sm', onclick: async () => {
          const { data: { user } } = await client.auth.getUser();
          if (!user) { openSignInModal(); return; }
          // Toggle like
          const { data: existing } = await client.from('post_likes').select('*').eq('post_id', p.id).eq('user_id', user.id).maybeSingle();
          if (existing) await client.from('post_likes').delete().eq('post_id', p.id).eq('user_id', user.id);
          else await client.from('post_likes').insert({ post_id: p.id, user_id: user.id });
          loadFeed(document.getElementById('feed'));
        }}, `♡ ${p.like_count || 0}`),
        el('span', { class: 'tiny muted' }, `💬 ${p.comment_count || 0}`)
      )
    );
    return card;
  }

  // ---------- P4.2 Learning paths -------------------------------------------
  const LEARNING_PATHS = [
    { slug: 'developer', title: 'Become a developer', blurb: 'Web Dev → Vibecoding → iOS. Build, ship, repeat.', courses: ['webdev', 'vibecoding', 'ios'] },
    { slug: 'thinker', title: 'Sharpen your mind', blurb: 'Critical Thinking → Human Minds → Finance. Reason about anything.', courses: ['critical-thinking', 'minds', 'finance'] },
    { slug: 'physics', title: 'Physics, all the way up', blurb: 'Elementary → High school → Advanced.', courses: ['physics-elementary', 'physics-highschool', 'physics-advanced'] },
    { slug: 'connect',  title: 'Connect with others', blurb: 'Sign Language + Human Minds.', courses: ['sign-language', 'minds'] }
  ];
  function renderPaths() {
    return el('main', { class: 'page' },
      el('section', { class: 'hero' },
        el('div', null,
          el('div', { class: 'eyebrow' }, '— Learning paths'),
          el('h1', { html: 'Multi-course <em>journeys.</em>' }),
          el('p', { class: 'hero-lede' }, 'Stack courses into something bigger than one.')
        )
      ),
      el('div', { class: 'hero-divider' }),
      el('div', { class: 'grid' }, ...LEARNING_PATHS.map(p => el('div', { class: 'card', onclick: () => go(`#/path/${p.slug}`) },
        el('h3', { class: 'card-title' }, p.title),
        el('p', { class: 'card-blurb' }, p.blurb),
        el('div', { class: 'card-foot' },
          el('span', null, `${p.courses.length} courses`),
          el('div', { class: 'card-cta' }, 'Open', el('span', { class: 'arr', html: ICONS.arrow }))
        )
      )))
    );
  }
  function renderPath(slug) {
    const p = LEARNING_PATHS.find(x => x.slug === slug);
    if (!p) return renderNotFound();
    const list = p.courses.map(id => window.COURSES.find(c => c.slug === id)).filter(Boolean);
    return el('main', { class: 'page' },
      el('div', { class: 'crumbs' },
        el('a', { href: '#/' }, 'Catalog'), el('span', { class: 'sep' }, '/'),
        el('a', { href: '#/paths' }, 'Paths'), el('span', { class: 'sep' }, '/'),
        el('span', null, p.title)
      ),
      el('h1', null, p.title),
      el('p', { class: 'hero-lede' }, p.blurb),
      el('div', { class: 'grid' }, ...list.map(c => courseCard(c)))
    );
  }

  // ---------- P4.4 Public profile -------------------------------------------
  function renderPublicProfile(handle) {
    const wrap = el('main', { class: 'page narrow' },
      el('div', { class: 'crumbs' }, el('a', { href: '#/' }, 'Catalog'), el('span', { class: 'sep' }, '/'), el('span', null, '@' + handle)),
      el('div', { id: 'profileBody' }, el('div', { class: 'center-state' }, el('span', { class: 'spinner' })))
    );
    (async () => {
      try {
        const client = await supaClient();
        if (!client) throw new Error('Supabase not ready');
        const { data: prof, error } = await client.from('profiles').select('*').eq('handle', handle).maybeSingle();
        const slot = wrap.querySelector('#profileBody');
        clear(slot);
        if (error || !prof) { slot.appendChild(el('p', { class: 'muted' }, 'Profile not found.')); return; }
        const { data: certs } = await client.from('certificates').select('*').eq('user_id', prof.id).eq('revoked', false);
        const { data: badges } = await client.from('user_badges').select('*').eq('user_id', prof.id);
        slot.appendChild(el('article', { class: 'profile-card' },
          el('h1', { class: 'serif' }, prof.name || '@' + handle),
          prof.bio ? el('p', { class: 'lede' }, prof.bio) : null,
          el('div', { class: 'tiny muted' }, `${(certs || []).length} certificates · ${(badges || []).length} badges`),
          el('h3', null, 'Certificates'),
          el('ul', null, ...(certs || []).map(c => el('li', null,
            el('a', { href: `#/verify/${c.certificate_number}` }, c.course_title), ' · ', new Date(c.issued_at).toLocaleDateString()
          )))
        ));
      } catch (e) {
        const slot = wrap.querySelector('#profileBody');
        clear(slot);
        slot.appendChild(el('p', { class: 'muted' }, e.message || 'Profile unavailable.'));
      }
    })();
    return wrap;
  }

  // ---------- P2.1 Instructor dashboard -------------------------------------
  function renderDashboard() {
    const u = currentUser();
    if (!u) return signedOutPlaceholder('Instructor dashboard', 'Sign in to access the dashboard.');
    const wrap = el('main', { class: 'page' },
      el('div', { class: 'crumbs' }, el('a', { href: '#/' }, 'Catalog'), el('span', { class: 'sep' }, '/'), el('span', null, 'Dashboard')),
      el('h1', null, 'Instructor dashboard'),
      el('div', { id: 'dashBody' }, el('div', { class: 'center-state' }, el('span', { class: 'spinner' })))
    );
    (async () => {
      const client = await supaClient();
      const slot = wrap.querySelector('#dashBody');
      clear(slot);
      if (!client) { slot.appendChild(el('p', { class: 'muted' }, 'Supabase not ready.')); return; }
      const { data: prof } = await client.from('profiles').select('is_instructor, is_admin').eq('id', u.id).maybeSingle();
      if (!prof || (!prof.is_instructor && !prof.is_admin)) {
        slot.appendChild(el('p', { class: 'muted' }, 'You don\'t have instructor access. Contact an admin to be granted instructor status.'));
        return;
      }
      // Counts
      const { count: students } = await client.from('user_progress').select('user_id', { count: 'exact', head: true });
      const { count: comments } = await client.from('lesson_comments').select('id', { count: 'exact', head: true });
      const { count: posts } = await client.from('community_posts').select('id', { count: 'exact', head: true });
      slot.appendChild(el('div', { class: 'grid' },
        el('div', { class: 'card' }, el('h3', null, students || 0), el('p', { class: 'muted' }, 'Student progress rows')),
        el('div', { class: 'card' }, el('h3', null, comments || 0), el('p', { class: 'muted' }, 'Lesson comments')),
        el('div', { class: 'card' }, el('h3', null, posts || 0), el('p', { class: 'muted' }, 'Community posts'))
      ));
    })();
    return wrap;
  }

  // ---------- P2.2 Admin (basic) --------------------------------------------
  function renderAdmin() {
    const u = currentUser();
    if (!u) return signedOutPlaceholder('Admin', 'Sign in to access admin tools.');
    const wrap = el('main', { class: 'page' },
      el('div', { class: 'crumbs' }, el('a', { href: '#/' }, 'Catalog'), el('span', { class: 'sep' }, '/'), el('span', null, 'Admin')),
      el('h1', null, 'Admin'),
      el('div', { id: 'adminBody' }, el('div', { class: 'center-state' }, el('span', { class: 'spinner' })))
    );
    (async () => {
      const client = await supaClient();
      const slot = wrap.querySelector('#adminBody');
      clear(slot);
      if (!client) { slot.appendChild(el('p', { class: 'muted' }, 'Supabase not ready.')); return; }
      const { data: prof } = await client.from('profiles').select('is_admin').eq('id', u.id).maybeSingle();
      if (!prof || !prof.is_admin) {
        slot.appendChild(el('p', { class: 'muted' }, 'You do not have admin access.'));
        return;
      }
      const { data: subs } = await client.from('subscriptions').select('*').order('updated_at', { ascending: false }).limit(50);
      slot.appendChild(el('h3', null, 'Recent subscriptions'));
      const table = el('table', { class: 'admin-table' },
        el('thead', null, el('tr', null,
          ...['email', 'plan', 'status', 'end'].map(h => el('th', null, h))
        )),
        el('tbody', null, ...(subs || []).map(s => el('tr', null,
          el('td', null, s.user_email),
          el('td', null, s.plan),
          el('td', null, s.status),
          el('td', null, s.end_date ? new Date(s.end_date).toLocaleDateString() : '—')
        )))
      );
      slot.appendChild(table);
    })();
    return wrap;
  }

  // ---------- P1.6 Search page ----------------------------------------------
  function renderSearchPage() {
    const q = new URLSearchParams(location.search).get('q') || '';
    const wrap = el('main', { class: 'page narrow' },
      el('div', { class: 'crumbs' }, el('a', { href: '#/' }, 'Catalog'), el('span', { class: 'sep' }, '/'), el('span', null, 'Search')),
      el('h1', null, 'Search'),
      el('input', { class: 'q-input', id: 'searchInput', type: 'text', placeholder: 'Search courses and modules…', value: q }),
      el('div', { id: 'searchResults', class: 'search-results' })
    );
    setTimeout(() => {
      const inp = wrap.querySelector('#searchInput');
      const out = wrap.querySelector('#searchResults');
      function runSearch() {
        const term = inp.value.toLowerCase().trim();
        clear(out);
        if (!term) return;
        const hits = [];
        for (const c of window.COURSES) {
          if (c.title.toLowerCase().includes(term) || c.subtitle.toLowerCase().includes(term) || c.category.toLowerCase().includes(term) || (c.blurb || '').toLowerCase().includes(term)) {
            hits.push({ kind: 'course', course: c });
          }
          for (const m of c.modules) {
            if (m.title.toLowerCase().includes(term) || (m.sub || '').toLowerCase().includes(term)) {
              hits.push({ kind: 'module', course: c, module: m });
            }
          }
        }
        if (hits.length === 0) { out.appendChild(el('p', { class: 'muted' }, 'No matches.')); return; }
        hits.slice(0, 50).forEach(h => {
          if (h.kind === 'course') {
            out.appendChild(el('a', { class: 'search-hit', href: `#/course/${h.course.slug}` },
              el('div', { class: 'tiny muted' }, h.course.category),
              el('div', null, h.course.title)
            ));
          } else {
            out.appendChild(el('a', { class: 'search-hit', href: `#/course/${h.course.slug}/module/${h.module.n}` },
              el('div', { class: 'tiny muted' }, h.course.title + ' · Module ' + h.module.n),
              el('div', null, h.module.title)
            ));
          }
        });
      }
      inp.addEventListener('input', runSearch);
      runSearch();
      inp.focus();
    }, 0);
    return wrap;
  }

  // ---------- P3.4 Onboarding study plan ------------------------------------
  function renderOnboarding() {
    return el('main', { class: 'page narrow' },
      el('h1', null, 'Build your study plan'),
      el('p', { class: 'muted' }, 'Pick goals and weekly time. We\'ll draft a 4-week plan.'),
      el('div', { class: 'onboarding-form' },
        el('label', null, 'Goals (one per line)',
          el('textarea', { id: 'obGoals', class: 'q-input', rows: 5, placeholder: 'Finish Web Dev\nUnderstand Bayes\nLearn ASL basics' })
        ),
        el('label', null, 'Hours per week',
          el('input', { id: 'obHours', class: 'q-input', type: 'number', min: 1, max: 40, value: 5 })
        ),
        el('button', { class: 'btn btn-primary', onclick: async () => {
          const goals = document.getElementById('obGoals').value.split('\n').map(s => s.trim()).filter(Boolean);
          const hours = +document.getElementById('obHours').value || 5;
          const u = currentUser();
          if (!u) { openSignInModal(); return; }
          const out = document.getElementById('obOutput');
          clear(out);
          out.appendChild(el('div', { class: 'center-state' }, el('span', { class: 'spinner' })));
          try {
            if (typeof AIEnhanced === 'undefined') throw new Error('AI not loaded');
            const plan = await AIEnhanced.generateStudyPlan(goals);
            clear(out);
            out.appendChild(el('article', { class: 'prose', html: renderSafeMarkdown(plan?.plan || 'No plan generated.') }));
            const client = await supaClient();
            if (client) await client.from('profiles').update({ goals, study_plan: plan }).eq('id', u.id);
          } catch (e) { clear(out); out.appendChild(el('p', { class: 'muted' }, e.message)); }
        } }, 'Generate plan'),
        el('div', { id: 'obOutput', class: 'onboarding-output' })
      )
    );
  }

  // ---------- P3.3 Practice quiz from gaps ---------------------------------
  async function openPracticeQuiz(course, mod, missed) {
    const body = el('div', null, el('div', { class: 'center-state' }, el('span', { class: 'spinner' })));
    showModal({ title: '🎯 Practice quiz · ' + (mod?.title || course.title), body });
    try {
      const r = await fetch(`${BACKEND_URL}/api/ai/practice-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseTitle: course.title, moduleTitle: mod?.title, missedConcepts: missed, count: 5 })
      });
      const data = await r.json();
      clear(body);
      if (!r.ok || !data.questions) { body.appendChild(el('p', { class: 'muted' }, data.error || 'Could not generate practice quiz.')); return; }
      runInlineQuiz(body, data.questions);
    } catch (e) {
      clear(body);
      body.appendChild(el('p', { class: 'muted' }, e.message || 'Practice quiz failed.'));
    }
  }
  function runInlineQuiz(slot, questions) {
    const answers = {};
    const items = questions.map((q, i) => {
      const wrap = el('div', { class: 'q-item' },
        el('div', { class: 'q-num' }, 'Q' + (i + 1)),
        el('div', { class: 'q-text' }, q.question)
      );
      const opts = el('div', { class: 'q-options' });
      (q.options || []).forEach((opt, idx) => {
        const lbl = el('label', { class: 'q-option' },
          el('input', { type: 'radio', name: 'pq' + i, value: idx, onchange: () => { answers[q.id] = idx; } }),
          el('span', null, opt)
        );
        opts.appendChild(lbl);
      });
      wrap.appendChild(opts);
      wrap.appendChild(el('div', { class: 'q-feedback' }));
      return wrap;
    });
    const score = el('div');
    const submit = el('button', { class: 'btn btn-primary', onclick: () => {
      let correct = 0;
      questions.forEach((q, i) => {
        const fb = items[i].querySelector('.q-feedback');
        const ok = answers[q.id] === q.correct_answer;
        if (ok) correct++;
        fb.classList.add('show', ok ? 'right' : 'wrong');
        fb.innerHTML = (ok ? '<b>Correct.</b> ' : '<b>Wrong.</b> ') + (q.explanation || '');
        items[i].querySelectorAll('.q-option input').forEach(inp => inp.disabled = true);
      });
      score.innerHTML = `<b>${correct} / ${questions.length}</b>`;
      submit.disabled = true;
    } }, 'Check');
    items.forEach(it => slot.appendChild(it));
    slot.appendChild(el('div', { class: 'quiz-foot' }, score, submit));
  }

  // ---------- P1.7 Notes panel ----------------------------------------------
  function mountNotesPanel(slot, slug, n) {
    const u = currentUser();
    const wrap = el('section', { class: 'notes-panel' },
      el('div', { class: 'notes-head' },
        el('h3', null, '📝 Your notes'),
        el('span', { class: 'tiny muted', id: 'notesStatus' }, u ? '' : 'Sign in to save')
      ),
      el('textarea', { class: 'notes-ta', placeholder: u ? 'Quick notes for this module…' : 'Sign in to save notes…', disabled: u ? null : 'disabled', rows: 4 })
    );
    slot.appendChild(wrap);
    if (!u) return;
    const ta = wrap.querySelector('.notes-ta');
    const status = wrap.querySelector('#notesStatus');
    (async () => {
      const client = await supaClient();
      if (!client) { status.textContent = 'Offline'; return; }
      const { data } = await client.from('user_notes').select('body').eq('user_id', u.id).eq('course_slug', slug).eq('module_n', n).maybeSingle();
      if (data?.body) ta.value = data.body;
      let timer = null;
      ta.addEventListener('input', () => {
        status.textContent = 'Saving…';
        clearTimeout(timer);
        timer = setTimeout(async () => {
          await client.from('user_notes').upsert({ user_id: u.id, course_slug: slug, module_n: n, body: ta.value, updated_at: new Date().toISOString() });
          status.textContent = '✓ Saved';
          setTimeout(() => { if (status.textContent === '✓ Saved') status.textContent = ''; }, 1500);
        }, 600);
      });
    })();
  }

  // ---------- P1.1 Comments thread ------------------------------------------
  function mountComments(slot, slug, n) {
    const u = currentUser();
    const list = el('div', { class: 'comments-list' }, el('div', { class: 'tiny muted' }, 'Loading comments…'));
    const composer = u
      ? (() => {
          const ta = el('textarea', { class: 'q-input', placeholder: 'Add a comment…', rows: 2 });
          const send = el('button', { class: 'btn btn-primary btn-sm', onclick: async () => {
            const body = ta.value.trim();
            if (!body) return;
            send.disabled = true;
            try {
              const r = await apiFetch(`/api/comments/${slug}/${n}`, { method: 'POST', body: JSON.stringify({ body }) });
              if (!r.ok) throw new Error((await r.json()).error || 'Post failed');
              ta.value = '';
              loadList();
            } catch (e) { alert(e.message); }
            send.disabled = false;
          }}, 'Post');
          return el('div', { class: 'comments-composer' }, ta, el('div', { style: 'text-align:right' }, send));
        })()
      : el('p', { class: 'muted tiny' }, 'Sign in to comment.');
    const wrap = el('section', { class: 'comments-section' },
      el('h3', null, '💬 Discussion'),
      list, composer
    );
    slot.appendChild(wrap);
    async function loadList() {
      try {
        const r = await fetch(`${BACKEND_URL}/api/comments/${slug}/${n}`);
        const data = await r.json();
        clear(list);
        if (!data.comments || data.comments.length === 0) {
          list.appendChild(el('p', { class: 'muted tiny' }, 'No comments yet.'));
          return;
        }
        data.comments.forEach(c => {
          list.appendChild(el('article', { class: 'comment-item' },
            el('header', null,
              el('strong', null, c.profiles?.name || 'Anon'),
              ' ', el('span', { class: 'tiny muted' }, new Date(c.created_at).toLocaleString())
            ),
            el('div', { class: 'comment-body' }, c.body)
          ));
        });
      } catch (e) {
        clear(list);
        list.appendChild(el('p', { class: 'muted tiny' }, 'Comments unavailable.'));
      }
    }
    loadList();
  }

  // ---------- P3.1 AI tutor floating front-door -----------------------------
  function ensureAIFab() {
    if (document.getElementById('aiFab')) return;
    const fab = el('button', { id: 'aiFab', class: 'ai-fab', onclick: () => openAITutor(currentCourseForFab(), currentModuleForFab()), title: 'Ask AI Tutor' },
      '💬'
    );
    document.body.appendChild(fab);
  }
  function currentCourseForFab() {
    const r = parseRoute();
    if (r.slug) return getCourse(r.slug) || { title: 'School', slug: 'general' };
    return { title: 'School', slug: 'general' };
  }
  function currentModuleForFab() {
    const r = parseRoute();
    if (r.slug && r.n) {
      const c = getCourse(r.slug);
      return c && c.modules.find(m => m.n === r.n) || { n: 0, title: 'Anywhere' };
    }
    return { n: 0, title: 'General' };
  }

  // ---------- P5.4 Mobile bottom nav ----------------------------------------
  function ensureBottomNav() {
    if (document.getElementById('bottomNav')) return;
    const route = parseRoute();
    const nav = el('nav', { id: 'bottomNav', class: 'bottom-nav' },
      el('a', { href: '#/', class: route.name === 'home' ? 'active' : '' }, el('span', null, '📚'), el('label', null, 'Catalog')),
      el('a', { href: '#/progress', class: route.name === 'progress' ? 'active' : '' }, el('span', null, '📈'), el('label', null, 'Progress')),
      el('a', { href: '#/community', class: route.name === 'community' ? 'active' : '' }, el('span', null, '🫶'), el('label', null, 'Feed')),
      el('a', { href: '#/review', class: route.name === 'review' ? 'active' : '' }, el('span', null, '🃏'), el('label', null, 'Review')),
      el('a', { href: '#', onclick: (e) => { e.preventDefault(); const u = currentUser(); if (u) openAccountMenu(); else openSignInModal(); } },
        el('span', null, '👤'), el('label', null, 'Me'))
    );
    document.body.appendChild(nav);
  }
  function updateBottomNav() {
    const old = document.getElementById('bottomNav');
    if (old) old.remove();
    ensureBottomNav();
  }

  function signedOutPlaceholder(title, msg) {
    return el('main', { class: 'page' },
      el('div', { class: 'center-state' },
        el('h2', null, title),
        el('p', null, msg),
        el('p', { style: 'margin-top:14px' },
          el('button', { class: 'btn btn-primary', onclick: openSignInModal }, 'Sign in')
        )
      )
    );
  }

  function renderNotFound() {
    return el('main', { class: 'page' },
      el('div', { class: 'center-state' },
        el('h3', null, 'Not found.'),
        el('p', null, 'That route doesn\'t exist. Try the catalog.'),
        el('p', { style: 'margin-top:20px' }, el('a', { class: 'btn btn-primary', href: '#/' }, 'Go to catalog'))
      )
    );
  }

  /* --------------------- mount --------------------- */
  async function render() {
    const route = parseRoute();
    clear(root);
    root.appendChild(renderTopbar());

    let body;
    if (route.name === 'home')           body = renderHome();
    else if (route.name === 'progress')  body = renderProgress();
    else if (route.name === 'about')     body = renderAbout();
    else if (route.name === 'course')    body = renderCourse(route.slug);
    else if (route.name === 'syllabus')  body = await renderSyllabus(route.slug);
    else if (route.name === 'module')    body = await renderModule(route.slug, route.n);
    else if (route.name === 'verify')    body = await renderVerify(route.certNumber);
    else if (route.name === 'review')    body = renderReview();
    else if (route.name === 'community') body = renderCommunity();
    else if (route.name === 'paths')     body = renderPaths();
    else if (route.name === 'path')      body = renderPath(route.slug);
    else if (route.name === 'dashboard') body = renderDashboard();
    else if (route.name === 'admin')     body = renderAdmin();
    else if (route.name === 'profile')   body = renderPublicProfile(route.handle);
    else if (route.name === 'search')    body = renderSearchPage();
    else if (route.name === 'onboarding')body = renderOnboarding();
    else                                 body = renderNotFound();

    root.appendChild(body);
    root.appendChild(renderFooter());

    // Sticky AI tutor button + mobile bottom nav are siblings of #app — only
    // create them once, then refresh the nav's active state.
    ensureAIFab();
    updateBottomNav();

    // theme toggle icon
    const tt = document.getElementById('themeToggle');
    if (tt) {
      const cur = document.documentElement.getAttribute('data-theme');
      tt.innerHTML = cur === 'dark' ? ICONS.sun : ICONS.moon;
    }

    // search behavior — Enter navigates to the first match
    const search = document.getElementById('globalSearch');
    if (search) {
      search.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && search.value.trim()) {
          const q = search.value.toLowerCase();
          const hit = window.COURSES.find(c =>
            c.title.toLowerCase().includes(q) ||
            c.subtitle.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q));
          if (hit) { go('#/course/' + hit.slug); search.blur(); }
        }
      });
    }
  }
  // ⌘K registered once at module load (not per-render — assigning
  // document.onkeydown clobbered any other key handler).
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const s = document.getElementById('globalSearch');
      if (s) s.focus();
    }
  });

  /* --------------------- AI features --------------------- */
  function openAITutor(course, mod) {
    const history = [];
    const log = el('div', { class: 'ai-log' });
    const input = el('input', { class: 'q-input', type: 'text', placeholder: 'Ask anything about this module…' });
    const send = el('button', { class: 'btn btn-primary' }, 'Send');

    function appendMsg(role, text) {
      log.appendChild(el('div', { class: 'ai-msg ai-msg-' + role },
        el('div', { class: 'ai-role' }, role === 'user' ? 'You' : 'AI Tutor'),
        el('div', { class: 'ai-text' }, text)
      ));
      log.scrollTop = log.scrollHeight;
    }

    async function submit() {
      const q = input.value.trim();
      if (!q) return;
      input.value = '';
      appendMsg('user', q);
      const thinking = el('div', { class: 'ai-msg ai-msg-assistant ai-thinking' },
        el('div', { class: 'ai-role' }, 'AI Tutor'),
        el('div', { class: 'ai-text muted' }, 'Thinking…')
      );
      log.appendChild(thinking); log.scrollTop = log.scrollHeight;
      try {
        let reply;
        if (typeof AIEnhanced !== 'undefined' && AIEnhanced.generateEnhancedTutorResponse) {
          reply = await AIEnhanced.generateEnhancedTutorResponse(q, null, course.slug, mod.n);
        } else if (typeof AIConfig !== 'undefined' && AIConfig.callGroqAPI) {
          reply = await AIConfig.callGroqAPI([
            { role: 'system', content: 'You are a helpful tutor for the course "' + course.title + '", module: "' + mod.title + '". Keep answers concise (2-4 sentences).' },
            { role: 'user', content: q }
          ], { temperature: 0.7, max_tokens: 300 });
        } else {
          reply = 'AI is not configured. Please try again later.';
        }
        thinking.remove();
        appendMsg('assistant', reply);
        history.push({ q, a: reply });
      } catch (e) {
        thinking.remove();
        appendMsg('assistant', 'Sorry, the AI tutor is unavailable right now. ' + (e.message || ''));
      }
    }

    send.onclick = submit;
    input.onkeydown = (e) => { if (e.key === 'Enter') submit(); };

    // ---------- Voice tutor (Whisper → input) -------------------------------
    const mic = el('button', { class: 'btn btn-ghost btn-sm', title: 'Voice input', onclick: toggleRecord }, '🎙');
    let recorder = null; let chunks = []; let recording = false;
    async function toggleRecord() {
      if (recording) { recorder.stop(); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '' });
        chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          recording = false; mic.textContent = '🎙';
          stream.getTracks().forEach(t => t.stop());
          if (!chunks.length) return;
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          input.placeholder = 'Transcribing…';
          try {
            const r = await fetch(`${BACKEND_URL}/api/ai/whisper`, {
              method: 'POST',
              headers: { 'Content-Type': blob.type },
              body: blob
            });
            const data = await r.json();
            if (data.text) { input.value = data.text.trim(); submit(); }
          } catch (e) { appendMsg('assistant', 'Voice transcription failed: ' + (e.message || '')); }
          input.placeholder = 'Ask anything about this module…';
        };
        recorder.start();
        recording = true; mic.textContent = '⏹';
      } catch (e) {
        alert('Microphone access denied or unavailable.');
      }
    }

    // Speak responses out loud (browser TTS) if user enabled it.
    const speakToggle = el('button', { class: 'btn btn-ghost btn-sm', title: 'Toggle voice replies',
      onclick: () => {
        const next = !(localStorage.getItem('school.tts') === '1');
        localStorage.setItem('school.tts', next ? '1' : '0');
        speakToggle.textContent = next ? '🔊' : '🔇';
      }
    }, localStorage.getItem('school.tts') === '1' ? '🔊' : '🔇');

    const _appendMsg = appendMsg;
    appendMsg = function (role, text) {
      _appendMsg(role, text);
      if (role === 'assistant' && localStorage.getItem('school.tts') === '1' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.05; u.pitch = 1.0;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      }
    };

    showModal({
      title: 'AI Tutor · ' + course.title,
      body: el('div', { class: 'ai-tutor' },
        el('p', { class: 'muted tiny' }, 'Context: ' + mod.title),
        log,
        el('div', { class: 'ai-input-row' }, mic, speakToggle, input, send)
      )
    });
    setTimeout(() => input.focus(), 50);
  }

  function openModuleSummary(course, mod) {
    const body = el('div', { class: 'ai-summary' },
      el('div', { class: 'center-state' }, el('span', { class: 'spinner' }))
    );
    showModal({ title: 'Module summary · ' + mod.title, body });
    (async () => {
      try {
        if (typeof AIEnhanced === 'undefined') throw new Error('AI module not loaded.');
        const result = await AIEnhanced.generateModuleSummary(course.slug, mod.n);
        clear(body);
        if (!result) {
          body.appendChild(el('p', { class: 'muted' }, 'Could not generate a summary right now.'));
          return;
        }
        body.appendChild(el('article', { class: 'prose', html: renderSafeMarkdown(result.summary) }));
      } catch (e) {
        clear(body);
        body.appendChild(el('p', { class: 'muted' }, e.message || 'Summary unavailable.'));
      }
    })();
  }

  function openFlashcards(course, mod) {
    const body = el('div', { class: 'ai-flashcards' },
      el('div', { class: 'center-state' }, el('span', { class: 'spinner' }))
    );
    showModal({ title: 'Flashcards · ' + mod.title, body });
    (async () => {
      try {
        if (typeof AIEnhanced === 'undefined') throw new Error('AI module not loaded.');
        const cards = await AIEnhanced.generateFlashcardsFromModule(course.slug, mod.n, 8);
        clear(body);
        if (!Array.isArray(cards) || cards.length === 0) {
          body.appendChild(el('p', { class: 'muted' }, 'Could not generate flashcards right now.'));
          return;
        }
        const grid = el('div', { class: 'flashcard-grid' });
        cards.forEach((card, i) => {
          const c = el('div', { class: 'flashcard', onclick: () => c.classList.toggle('flipped') },
            el('div', { class: 'flashcard-front' }, el('div', { class: 'flashcard-n' }, '#' + (i + 1)), el('div', null, card.front)),
            el('div', { class: 'flashcard-back' }, card.back)
          );
          grid.appendChild(c);
        });
        body.appendChild(el('p', { class: 'tiny muted' }, 'Click a card to flip.'));
        body.appendChild(grid);
        // Save to Supabase for spaced repetition (P3.2).
        const saveBtn = el('button', { class: 'btn btn-primary', onclick: async () => {
          saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
          try {
            const u = currentUser();
            if (!u) { openSignInModal(); saveBtn.disabled = false; saveBtn.textContent = 'Save to review'; return; }
            const client = await supaClient();
            if (!client) throw new Error('Sign in to save');
            for (const c of cards) {
              const { data: card, error } = await client.from('flashcards').insert({
                user_id: u.id, course_slug: course.slug, module_n: mod.n, front: c.front, back: c.back
              }).select().single();
              if (!error && card) {
                await client.from('flashcard_reviews').insert({
                  card_id: card.id, user_id: u.id, due_at: new Date().toISOString()
                });
              }
            }
            saveBtn.textContent = '✓ Saved to /review';
          } catch (e) { saveBtn.textContent = 'Failed: ' + (e.message || ''); }
        }}, 'Save to review queue');
        body.appendChild(el('div', { style: 'margin-top:14px;text-align:right' }, saveBtn));
      } catch (e) {
        clear(body);
        body.appendChild(el('p', { class: 'muted' }, e.message || 'Flashcards unavailable.'));
      }
    })();
  }

  /* --------------------- module TTS (P6.3) ------------------------ */
  let _ttsActive = false;
  function toggleModuleTTS(proseEl, btn) {
    if (!window.speechSynthesis) { alert('Speech synthesis not supported on this browser.'); return; }
    if (_ttsActive) {
      speechSynthesis.cancel();
      _ttsActive = false;
      btn.textContent = '🔊  Listen';
      return;
    }
    const text = (proseEl?.innerText || '').slice(0, 6000);
    if (!text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0; u.pitch = 1.0;
    u.onend = () => { _ttsActive = false; btn.textContent = '🔊  Listen'; };
    speechSynthesis.speak(u);
    _ttsActive = true;
    btn.textContent = '⏹  Stop';
  }

  /* --------------------- certificate --------------------- */
  async function maybeIssueCertificate(course) {
    try {
      if (typeof CertificateManager === 'undefined') return;
      const u = currentUser();
      // Anonymous users get a "sign in to claim" nudge instead of a
      // certificate with `studentName: 'Student'` and a blank email.
      if (!u || !u.email) {
        showModal({
          title: '🎓 Course completed',
          body: el('div', { class: 'cert-modal' },
            el('p', null, "You finished ", el('b', null, course.title), '. Sign in to claim your certificate.'),
            el('div', { class: 'modal-actions' },
              el('button', { class: 'btn btn-primary', onclick: () => { closeModal(); openSignInModal(); } }, 'Sign in'),
              el('button', { class: 'btn btn-ghost', onclick: closeModal }, 'Close')
            )
          )
        });
        return;
      }
      // Certificates are a premium feature (see /api/payments/plans).
      if (!hasPremium()) {
        showModal({
          title: '🎓 Course completed',
          body: el('div', { class: 'cert-modal' },
            el('p', null, "Great work finishing ", el('b', null, course.title), '. Certificates are a premium feature.'),
            el('div', { class: 'modal-actions' },
              el('button', { class: 'btn btn-accent', onclick: () => { closeModal(); subscribePrompt('monthly'); } }, 'Unlock premium'),
              el('button', { class: 'btn btn-ghost', onclick: closeModal }, 'Maybe later')
            )
          )
        });
        return;
      }
      // Don't double-issue (local cache).
      const existing = CertificateManager.getCertificatesForUser
        ? CertificateManager.getCertificatesForUser(u.email)
        : [];
      if (existing.some(c => c.courseId === course.slug)) return;

      // Issue locally for instant PDF, also persist via backend (premium-gated,
      // service-role write) so the cert is verifiable from /verify/:certNumber.
      const cert = CertificateManager.generateCertificate(course.slug, course.title);
      try {
        const r = await apiFetch('/api/certificates/issue', {
          method: 'POST',
          body: JSON.stringify({
            courseSlug: course.slug,
            courseTitle: course.title,
            studentName: u.name
          })
        });
        if (r.ok) {
          const data = await r.json();
          if (data.certificate) {
            cert.certificateNumber = data.certificate.certificate_number;
            cert.verifyUrl = `${location.origin}/#/verify/${data.certificate.certificate_number}`;
            CertificateManager.certificates = (CertificateManager.certificates || []).map(c =>
              c.id === cert.id ? cert : c);
            localStorage.setItem('certificates', JSON.stringify(CertificateManager.certificates));
            maybeAwardBadge('course_complete').catch(() => {});
          }
        }
      } catch (_) { /* offline → local-only cert */ }

      const verifyUrl = cert.verifyUrl || `${location.origin}/#/verify/${cert.certificateNumber}`;
      showModal({
        title: '🎓 Course completed',
        body: el('div', { class: 'cert-modal' },
          el('p', null, 'Congratulations — you finished ', el('b', null, course.title), '.'),
          el('p', { class: 'tiny muted' }, 'Certificate ' + cert.certificateNumber),
          el('p', { class: 'tiny' },
            'Verify: ',
            el('a', { href: verifyUrl, target: '_blank' }, verifyUrl)
          ),
          el('div', { class: 'modal-actions' },
            el('button', { class: 'btn btn-primary', onclick: () => window.downloadCertificate(cert.id) }, 'Download PDF'),
            el('a', { class: 'btn btn-ghost', target: '_blank',
              href: `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(course.title)}&organizationName=School&certUrl=${encodeURIComponent(verifyUrl)}&certId=${encodeURIComponent(cert.certificateNumber)}` },
              'Add to LinkedIn'),
            el('button', { class: 'btn btn-ghost', onclick: closeModal }, 'Close')
          )
        )
      });
    } catch (e) { console.warn('cert issue:', e); }
  }

  /* --------------------- init --------------------- */
  initTheme();
  window.addEventListener('hashchange', render);
  // Configure marked once.
  if (window.marked) {
    window.marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });
  }

  // Render first, then post-DOM bootstrap (OAuth callback + premium
  // refresh + Stripe return). Doing post-DOM work in this order avoids
  // a stale auth badge flashing on the first paint.
  function bootstrapPostRender() {
    // Pick up Supabase session if the user just came back from an OAuth redirect.
    handleOAuthCallback();
    if (window.PaymentManager?.refreshPremiumFromServer) {
      PaymentManager.refreshPremiumFromServer();
    }
    if (window.PaymentManager?.checkPaymentStatus) {
      PaymentManager.checkPaymentStatus();
    }
  }

  if (document.readyState !== 'loading') {
    render();
    bootstrapPostRender();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      render();
      bootstrapPostRender();
    });
  }
})();
