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
  }
  function setQuizScore(slug, n, score) {
    const p = loadProgress();
    p[slug] = p[slug] || { done: {}, quizScores: {}, lastModule: null };
    p[slug].quizScores[n] = score;
    saveProgress(p);
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
          el('a', { href: '#/progress', class: route.name === 'progress' ? 'active' : '' }, 'My progress'),
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
          renderAuthBadge()
        )
      )
    );
    return bar;
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
          ? el('p', null, 'Subscription: ', el('b', null, 'Premium'))
          : el('p', null, 'Subscription: ', el('b', null, 'Free'), '  ',
              el('button', { class: 'btn btn-accent btn-sm', onclick: () => { closeModal(); subscribePrompt('monthly'); } }, 'Upgrade')),
        el('div', { class: 'modal-actions' },
          el('button', { class: 'btn btn-ghost', onclick: closeModal }, 'Close'),
          el('button', { class: 'btn btn-ghost', onclick: signOut }, 'Sign out')
        )
      )
    });
  }

  async function signOut() {
    try {
      if (typeof AuthManager !== 'undefined' && AuthManager.signOut) {
        // AuthManager.signOut does its own reload via window.location.reload();
        // strip it first so we re-render in place.
        setCurrentUser(null);
      }
      if (typeof SupabaseManager !== 'undefined') {
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
  function showModal({ title, body }) {
    closeModal();
    const overlay = el('div', { class: 'modal-overlay', id: 'modalOverlay', onclick: (e) => { if (e.target === overlay) closeModal(); } },
      el('div', { class: 'modal' },
        el('div', { class: 'modal-head' },
          el('h3', null, title || ''),
          el('button', { class: 'icon-btn', onclick: closeModal, 'aria-label': 'Close' }, '×')
        ),
        body instanceof Node ? body : el('div', null, body || '')
      )
    );
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    const o = document.getElementById('modalOverlay');
    if (o) o.remove();
    document.body.style.overflow = '';
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
        el('div', { class: 'module-meta' }, `Week ${m.n} · ~${Math.round(c.hours / c.modules.length)}h`),
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
    const aiBar = el('div', { class: 'ai-bar' }, aiTutorBtn, summaryBtn, flashBtn);

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
        } else {
          const a = (ans || '').toLowerCase();
          correct = (q.acceptable_answers || []).some(x => a && (a === x.toLowerCase() || a.includes(x.toLowerCase())));
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
    else                                 body = renderNotFound();

    root.appendChild(body);
    root.appendChild(renderFooter());

    // theme toggle icon
    const tt = document.getElementById('themeToggle');
    if (tt) {
      const cur = document.documentElement.getAttribute('data-theme');
      tt.innerHTML = cur === 'dark' ? ICONS.sun : ICONS.moon;
    }

    // search behavior
    const search = document.getElementById('globalSearch');
    if (search) {
      search.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        // simple in-page: only meaningful on home; navigate if course matches
      });
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
    // ⌘K
    document.onkeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const s = document.getElementById('globalSearch');
        if (s) s.focus();
      }
    };
  }

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

    showModal({
      title: 'AI Tutor · ' + course.title,
      body: el('div', { class: 'ai-tutor' },
        el('p', { class: 'muted tiny' }, 'Context: ' + mod.title),
        log,
        el('div', { class: 'ai-input-row' }, input, send)
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
        body.appendChild(el('article', { class: 'prose', html: window.marked ? window.marked.parse(result.summary) : escapeHtml(result.summary) }));
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
      } catch (e) {
        clear(body);
        body.appendChild(el('p', { class: 'muted' }, e.message || 'Flashcards unavailable.'));
      }
    })();
  }

  /* --------------------- certificate --------------------- */
  function maybeIssueCertificate(course) {
    try {
      if (typeof CertificateManager === 'undefined') return;
      // Don't double-issue.
      const existing = CertificateManager.getCertificatesForUser
        ? CertificateManager.getCertificatesForUser((currentUser() && currentUser().email) || '')
        : [];
      if (existing.some(c => c.courseId === course.slug)) return;
      const cert = CertificateManager.generateCertificate(course.slug, course.title);
      showModal({
        title: '🎓 Course completed',
        body: el('div', { class: 'cert-modal' },
          el('p', null, 'Congratulations — you finished ', el('b', null, course.title), '.'),
          el('p', { class: 'tiny muted' }, 'Certificate ' + cert.certificateNumber),
          el('div', { class: 'modal-actions' },
            el('button', { class: 'btn btn-primary', onclick: () => window.downloadCertificate(cert.id) }, 'Download PDF'),
            el('button', { class: 'btn btn-ghost', onclick: closeModal }, 'Close')
          )
        )
      });
    } catch (e) { console.warn('cert issue:', e); }
  }

  /* --------------------- init --------------------- */
  initTheme();
  window.addEventListener('hashchange', render);
  // Pick up Supabase session if the user just came back from an OAuth redirect.
  handleOAuthCallback();
  // Refresh premium status from the backend on load (don't trust localStorage).
  if (window.PaymentManager?.refreshPremiumFromServer) {
    PaymentManager.refreshPremiumFromServer();
  }
  // Handle ?payment=success|cancel coming back from Stripe Checkout.
  if (window.PaymentManager?.checkPaymentStatus) {
    PaymentManager.checkPaymentStatus();
  }
  // Configure marked
  if (window.marked) {
    window.marked.setOptions({
      gfm: true,
      breaks: false,
      headerIds: false,
      mangle: false
    });
  }
  document.addEventListener('DOMContentLoaded', render);
  // Fallback if already loaded:
  if (document.readyState !== 'loading') render();
})();
