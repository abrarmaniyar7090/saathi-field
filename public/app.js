const app = document.getElementById('app');
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const COPY = {
  hi: {
    brand: 'साथी', subbrand: 'फील्ड कलेक्शन्स', collections: 'कलेक्शन्स', home: 'आज की सूची', promises: 'भुगतान के वादे', import: 'CSV आयात', manager: 'प्रबंधक दृश्य', logout: 'साइन आउट',
    field: 'फ़ील्ड अधिकारी', managerRole: 'शाखा प्रबंधक', today: 'आज', contact: 'संपर्क समय', allowed: 'संपर्क खुला · रात 8–सुबह 7 बंद', closed: 'संपर्क बंद · केवल सुबह 8–शाम 7 बजे', online: 'ऑनलाइन', offline: 'ऑफ़लाइन',
    loginTitle: 'काम की शुरुआत यहाँ से।', loginCopy: 'हर दिन की सही प्राथमिकता, वजह के साथ। भरोसेमंद ऑफ़लाइन लॉग और सुरक्षित संपर्क समय।', loginHello: 'आपके खाते में साइन इन करें', loginIntro: 'आपका आज का काम और वादे एक जगह दिखेंगे।', email: 'ईमेल', password: 'पासवर्ड', signIn: 'साइन इन करें', demoAccounts: 'डेमो खाते', officerDemo: 'फ़ील्ड अधिकारी', managerDemo: 'शाखा प्रबंधक', loginError: 'ईमेल या पासवर्ड सही नहीं है।',
    listTitle: 'आज किस पर ध्यान दें', listSub: 'प्राथमिकता स्कोर मदद के लिए है; अगला कदम आप तय करें।', priority: 'प्राथमिकता', high: 'उच्च', medium: 'मध्यम', low: 'कम', outstanding: 'बकाया राशि', dpd: 'बकाया दिन', promise: 'अगला वादा', why: 'स्कोर क्यों?', call: 'कॉल लॉग', map: 'मैप', outcome: 'नतीजा दर्ज करें', assigned: 'अधिकारी', reasons: 'मुख्य कारण',
    activeLoans: 'आज की बकाया सूची', amountAtRisk: 'कुल बकाया राशि', dueToday: 'आज के वादे', broken: 'टूटे वादे', total: 'लोन', priorityOrder: 'AI प्राथमिकता', dpdOrder: 'सबसे ज़्यादा दिन', amountOrder: 'सबसे बड़ी राशि', noLoans: 'आज कोई लोन नहीं', noLoansSub: 'CSV आयात होने पर असाइन किए गए लोन यहाँ दिखेंगे।',
    upcoming: 'आने वाले', followUp: 'तारीख जाँचें', brokenGroup: 'टूटे वादे', noPromises: 'कोई वादा दर्ज नहीं', noPromisesSub: 'ऑफ़िसर जब भुगतान की तारीख दर्ज करेंगे, वादा यहाँ दिखाई देगा।', followUpTag: 'फॉलो-अप जाँचें',
    managerTitle: 'कलेक्शन्स का त्वरित दृश्य', managerSub: 'शाखा की स्थिति, वादे और स्कोर का साप्ताहिक बैकटेस्ट।', baseline: 'ग्राहक का रोल-रेट आधार', target: 'लक्ष्य', sampleRate: 'वर्तमान DPD बकेट', sampleNote: '22% आधार और 16% लक्ष्य ब्रीफ़ से लिए गए हैं। डेमो केवल मौजूदा DPD बकेट दिखाता है; वास्तविक रोल-रेट के लिए एक ही लोन के तारीख़ सहित स्नैपशॉट चाहिए।', branches: 'शाखा अनुसार', branch: 'शाखा', rollRate: '31–60 DPD', active: 'सक्रिय लोन', backtest: 'पिछले 7 दिन · स्कोर बैकटेस्ट', noBacktest: 'अभी परिणाम उपलब्ध नहीं', noBacktestSub: 'भुगतान नतीजे जमा होने पर स्कोर बैंड के अनुसार तुलना यहाँ दिखेगी।', download: 'CSV डाउनलोड',
    importTitle: 'दैनिक overdue सूची लाएँ', importSub: 'CSV को पिनकोड और अधिकारी के मौजूदा काम के हिसाब से असाइन करें।', chooseFile: 'CSV फ़ाइल चुनें', dropHere: 'फ़ाइल यहाँ छोड़ें या ब्राउज़ करें', csvLimit: 'अधिकतम 1 MB · 1,000 पंक्तियाँ · UTF-8', template: 'टेम्पलेट डाउनलोड', demoCSV: 'डेमो CSV आज़माएँ', importAssign: 'आयात और असाइन', workflow: 'आयात कैसे काम करता है', step1: 'फ़ाइल और फ़ील्ड जाँचे जाते हैं', step1sub: 'अमान्य रकम, DPD या पिनकोड वाली पंक्तियाँ रुकती हैं।', step2: 'पिनकोड शाखा चुनता है', step2sub: 'इस डेमो में 452, 453 और 454 पिनकोड इंदौर की तीन नमूना शाखाओं में जाते हैं।', step3: 'काम का बोझ बराबर बाँटता है', step3sub: 'एक ही शाखा में सबसे कम खुले लोन वाले अधिकारी को दिया जाता है।', importDone: 'आयात पूरा',
    kindPaid: 'भुगतान', kindPromise: 'वादा', kindNotReachable: 'संपर्क नहीं', kindDispute: 'विवाद', amountCollected: 'आज मिली राशि (₹)', promiseDate: 'भुगतान की वादा तारीख', note: 'संक्षिप्त टिप्पणी', noteHint: 'वैकल्पिक · 240 अक्षरों तक · अनावश्यक निजी जानकारी न लिखें', save: 'नतीजा सेव करें', cancel: 'रद्द करें', gps: 'वर्तमान लोकेशन जोड़ें', gpsNone: 'लोकेशन नहीं जोड़ी गई', gpsAdded: 'लोकेशन जुड़ गई (लगभग)', gpsDenied: 'लोकेशन उपलब्ध नहीं · आप बिना लोकेशन सेव कर सकते हैं',
    reminder: 'रिमाइंडर ड्राफ़्ट', reminderPreview: 'स्वीकृत टेम्पलेट · भेजने से पहले अधिकारी की मंज़ूरी ज़रूरी', queueReminder: 'मॉक रिमाइंडर लॉग करें', noSend: 'यह डेमो किसी को संदेश या कॉल नहीं भेजता।', contactBlocked: 'RBI संपर्क समय के बाहर कॉल और रिमाइंडर बंद हैं। अगला संपर्क सुबह 8 बजे IST से किया जा सकता है।',
    scoreTitle: 'प्राथमिकता स्कोर का कारण', scoreMethod: 'DPD, बकाया राशि, टूटे वादे और हाल के भुगतान से पारदर्शी 0–100 स्कोर। यह सलाह है, अंतिम निर्णय नहीं।', override: 'प्रबंधक प्राथमिकता बदलें', newPriority: 'नई प्राथमिकता (1–100)', overrideReason: 'बदलाव का कारण', setPriority: 'प्राथमिकता लागू करें', clearPriority: 'मैन्युअल बदलाव हटाएँ',
    managerOnly: 'प्रबंधक कार्रवाई', emptyError: 'कुछ लोड नहीं हो पाया। फिर कोशिश करें।', refresh: 'फिर कोशिश करें', retry: 'सिंक फिर शुरू करें', syncing: 'सिंक हो रहा है', queued: 'डिवाइस पर सेव · सिंक बाकी', queuedTitle: 'सिंक बाकी नतीजे', queueHint: 'नेटवर्क लौटने पर सेव नतीजे अपने-आप अपलोड होंगे। इस डिवाइस की निजी जानकारी नहीं, सिर्फ़ नतीजे की ज़रूरी जानकारी रखी जाती है।',
    csvInvalid: 'CSV नहीं पढ़ी जा सकी। टेम्पलेट फ़ॉर्मैट देखें।', fileRequired: 'पहले CSV चुनें।', notEnough: 'स्कोर सलाह है और इसे मैनेजर बदल सकते हैं। इस डेमो में साप्ताहिक तुलना तभी दिखती है जब नतीजे दर्ज हों।', language: 'भाषा', close: 'बंद करें',
  },
  en: {
    brand: 'Saathi', subbrand: 'FIELD COLLECTIONS', collections: 'Collections', home: "Today's list", promises: 'Promises', import: 'CSV import', manager: 'Manager view', logout: 'Sign out',
    field: 'Field officer', managerRole: 'Branch manager', today: 'Today', contact: 'Contact window', allowed: 'Open now · closed 7 pm–8 am', closed: 'Contact blocked · 8 am–7 pm only', online: 'Online', offline: 'Offline',
    loginTitle: 'Start the day with clarity.', loginCopy: 'The right priority with a reason. Reliable offline logging and respectful contact hours.', loginHello: 'Sign in to your workspace', loginIntro: "Your daily route and promises, in one place.", email: 'Email', password: 'Password', signIn: 'Sign in', demoAccounts: 'Demo accounts', officerDemo: 'Field officer', managerDemo: 'Branch manager', loginError: 'Email or password was not recognised.',
    listTitle: 'Who needs attention today', listSub: 'Priority scores offer a guide; you decide what to do next.', priority: 'Priority', high: 'High', medium: 'Medium', low: 'Low', outstanding: 'Outstanding', dpd: 'Days overdue', promise: 'Promise date', why: 'Why this score?', call: 'Log call', map: 'Map', outcome: 'Log outcome', assigned: 'Officer', reasons: 'Key reasons',
    activeLoans: 'Active overdue loans', amountAtRisk: 'Outstanding balance', dueToday: 'Promises due today', broken: 'Broken promises', total: 'loans', priorityOrder: 'AI priority', dpdOrder: 'Most overdue', amountOrder: 'Largest amount', noLoans: 'No loans in this list', noLoansSub: 'Assigned loans will appear here after a CSV import.',
    upcoming: 'Upcoming', followUp: 'Check date', brokenGroup: 'Broken', noPromises: 'No promises recorded', noPromisesSub: 'When an officer records a payment date, it will appear here.', followUpTag: 'Check follow-up',
    managerTitle: 'Collections at a glance', managerSub: 'Branch status, promises and a weekly score back-test.', baseline: 'Client roll-rate baseline', target: 'Target', sampleRate: 'Current DPD buckets', sampleNote: 'The 22% baseline and 16% target come from the brief. The demo shows current DPD buckets only; a real roll rate needs dated snapshots for the same loans.', branches: 'By branch', branch: 'Branch', rollRate: '31–60 DPD', active: 'Active loans', backtest: 'Last 7 days · score back-test', noBacktest: 'No outcomes yet', noBacktestSub: 'Once payment outcomes are recorded, compare payment rates across score bands.', download: 'Download CSV',
    importTitle: 'Import the daily overdue list', importSub: 'Assign the CSV using pincode and each officer’s current workload.', chooseFile: 'Choose CSV file', dropHere: 'Drop a file here or browse', csvLimit: 'Up to 1 MB · 1,000 rows · UTF-8', template: 'Download template', demoCSV: 'Try demo CSV', importAssign: 'Import and assign', workflow: 'How imports work', step1: 'Validate the file and fields', step1sub: 'Rows with invalid amounts, DPD or pincodes are held back.', step2: 'Pincode selects a branch', step2sub: 'In this demo, 452, 453 and 454 map to three sample Indore branches.', step3: 'Balance the workload', step3sub: 'Within each branch, new loans go to the officer with the fewest open loans.', importDone: 'Import complete',
    kindPaid: 'Paid', kindPromise: 'Promise', kindNotReachable: 'Not reached', kindDispute: 'Dispute', amountCollected: 'Amount received today (₹)', promiseDate: 'Promised payment date', note: 'Short note', noteHint: 'Optional · up to 240 characters · avoid unnecessary personal details', save: 'Save outcome', cancel: 'Cancel', gps: 'Add current location', gpsNone: 'No location added', gpsAdded: 'Approximate location added', gpsDenied: 'Location unavailable · you can still save without it',
    reminder: 'Reminder draft', reminderPreview: 'Approved template · officer approval required before sending', queueReminder: 'Log mock reminder', noSend: 'This demo does not call or message anyone.', contactBlocked: 'Calls and reminders are blocked outside the permitted contact window. Contact opens at 8:00 am IST.',
    scoreTitle: 'Why this priority score', scoreMethod: 'Transparent 0–100 score from DPD, outstanding, broken promises and recent payment history. Advisory only; never an automated recovery decision.', override: 'Manager priority adjustment', newPriority: 'New priority (1–100)', overrideReason: 'Reason for change', setPriority: 'Apply priority', clearPriority: 'Clear manual priority',
    managerOnly: 'Manager action', emptyError: 'We could not load this screen. Try again.', refresh: 'Try again', retry: 'Sync now', syncing: 'Syncing', queued: 'Saved on device · waiting to sync', queuedTitle: 'Outcomes waiting to sync', queueHint: 'Saved outcomes sync when the network returns. Only the minimum outcome details are stored on this device.', csvInvalid: 'Could not read that CSV. Check the template format.', fileRequired: 'Choose a CSV file first.', notEnough: 'The score is advisory and managers can change the order. This demo back-test needs recorded outcomes.', language: 'Language', close: 'Close',
  }
};

const ICONS = {
  list: '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  promise: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 15v5h14v-5"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 19V5m0 14h17M8 15l4-4 3 2 5-6"/></svg>',
  logout: '<svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5M15 12H3M21 4v16"/></svg>',
  money: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M7 9h.01M17 15h.01"/></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6m3-3h-6"/></svg>',
  alert: '<svg viewBox="0 0 24 24"><path d="M10.3 4.1 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M3 16l6-6 4 4 8-9M15 5h6v6"/></svg>',
  location: '<svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
};

const state = {
  user: null, csrf: localStorage.getItem('saathi_csrf') || '', lang: localStorage.getItem('saathi_lang') || 'hi',
  route: location.pathname, loans: [], promises: [], summary: null, loading: false, error: '',
  pending: 0, fileText: '', fileName: '', importResult: null, sort: 'score', modal: null,
  gps: null, managerQueue: false,
};

const t = (key) => (COPY[state.lang] || COPY.hi)[key] || key;
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const icon = (name) => `<span class="button-icon">${ICONS[name] || ''}</span>`;
const fmtMoney = (value) => new Intl.NumberFormat(state.lang === 'hi' ? 'hi-IN' : 'en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
const fmtShort = (value) => new Intl.NumberFormat(state.lang === 'hi' ? 'hi-IN' : 'en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0));
const fmtDate = (value) => value ? new Intl.DateTimeFormat(state.lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(`${value}T12:00:00+05:30`)) : '—';
const localBranch = (value) => {
  const parts = String(value || '').split(' / ');
  return parts.length > 1 ? (state.lang === 'hi' ? parts[0] : parts[1]) : (value || '');
};
const initial = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const roleLabel = () => state.user?.role === 'manager' ? t('managerRole') : t('field');

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (['POST', 'PATCH'].includes(options.method)) headers['X-CSRF-Token'] = state.csrf;
  let response;
  try {
    response = await fetch(path, { ...options, headers, credentials: 'same-origin' });
  } catch (error) {
    error.networkFailure = true;
    throw error;
  }
  const nextToken = response.headers.get('X-Saathi-CSRF');
  if (nextToken) {
    state.csrf = nextToken;
    localStorage.setItem('saathi_csrf', nextToken);
  }
  const contentType = response.headers.get('Content-Type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(data?.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function contactAllowed() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':');
  const minutes = Number(parts[0]) * 60 + Number(parts[1]);
  return minutes >= 480 && minutes < 1140;
}

function currentPageTitle() {
  if (state.route.startsWith('/manager')) return t('manager');
  if (state.route.startsWith('/promises')) return t('promises');
  if (state.route.startsWith('/import')) return t('import');
  return t('home');
}

function navItem(href, key, iconName, active, count = '') {
  return `<a class="nav-link ${active ? 'active' : ''}" href="${href}" data-nav="${href}"><span class="nav-icon">${ICONS[iconName] || ''}</span><span class="nav-text">${t(key)}</span>${count ? `<span class="nav-count">${count}</span>` : ''}</a>`;
}

function pageNav() {
  const manager = state.user?.role === 'manager';
  const isHome = state.route === '/' || state.route.startsWith('/today') || state.route.startsWith('/loans/');
  const links = [
    navItem('/today', 'home', 'list', isHome, state.loans.length || ''),
    navItem('/promises', 'promises', 'promise', state.route.startsWith('/promises')),
    manager ? navItem('/import', 'import', 'upload', state.route.startsWith('/import')) : '',
    manager ? navItem('/manager', 'manager', 'chart', state.route.startsWith('/manager')) : '',
  ].filter(Boolean).join('');
  return links;
}

function appFrame(content) {
  const allowed = contactAllowed();
  const title = currentPageTitle();
  return `<div class="app-frame">
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">S</span><div><div class="brand-title">${t('brand')}</div><span class="brand-sub">${t('subbrand')}</span></div></div>
      <div class="nav-label">${t('collections')}</div><nav class="nav-list">${pageNav()}</nav>
      <div class="sidebar-spacer"></div>
      <div class="sidebar-privacy"><span class="privacy-dot"></span>${state.lang === 'hi' ? 'संपर्क और हर नतीजा समय के साथ लॉग होता है।' : 'Contact attempts and outcomes are time-stamped.'}</div>
      <div class="profile-row"><span class="avatar">${escapeHTML(initial(state.user?.name))}</span><div class="profile-text"><div class="profile-name">${escapeHTML(state.user?.name)}</div><div class="profile-role">${roleLabel()}</div></div><button class="logout-icon" data-action="logout" aria-label="${t('logout')}">${ICONS.logout}</button></div>
    </aside>
    <header class="mobile-header"><div class="mobile-brand"><span class="brand-mark">S</span><span>${t('brand')}</span></div><div class="mobile-user"><span class="avatar">${escapeHTML(initial(state.user?.name))}</span>${escapeHTML(state.user?.name || '')}<button class="mobile-logout" data-action="logout" aria-label="${t('logout')}">${ICONS.logout}</button></div></header>
    <section class="workspace">
      <header class="topbar"><div class="crumbs">${t('collections')} <span> / </span> <strong>${title}</strong></div>
        <div class="topbar-right">
          <div class="window-pill ${allowed ? '' : 'closed'}"><span class="status-dot"></span><span>${allowed ? t('allowed') : t('closed')}</span></div>
          <div class="net-pill ${navigator.onLine ? '' : 'offline'}"><span class="status-dot"></span><span>${navigator.onLine ? t('online') : t('offline')}</span></div>
          <div class="language-switch" aria-label="${t('language')}"><button data-action="lang-hi" class="${state.lang === 'hi' ? 'selected' : ''}">हिंदी</button><button data-action="lang-en" class="${state.lang === 'en' ? 'selected' : ''}">EN</button></div>
        </div>
      </header>
      <main class="main" id="main-content">${content}</main>
      <nav class="nav-bottom">${pageNav()}</nav>
    </section>
  </div>
  ${state.modal ? renderModal() : ''}<div class="toast-region" id="toast-region" aria-live="assertive"></div>`;
}

function renderLogin(errorText = '') {
  document.documentElement.lang = state.lang;
  app.innerHTML = `<main class="login-wrap">
    <section class="login-art">
      <div class="login-art-top"><span class="brand-mark">S</span><div><strong>${t('brand')}</strong><span class="brand-sub">${t('subbrand')}</span></div></div>
      <div class="login-art-copy"><p class="eyebrow">${state.lang === 'hi' ? 'कलेक्शन्स · इंदौर' : 'COLLECTIONS · INDORE'}</p><h1>${t('loginTitle')}</h1><p>${t('loginCopy')}</p>
        <div class="login-art-stats"><div class="login-stat"><strong>8–7</strong><span>${state.lang === 'hi' ? 'नियमित संपर्क समय' : 'Respectful contact hours'}</span></div><div class="login-stat"><strong>0–100</strong><span>${state.lang === 'hi' ? 'समझने योग्य स्कोर' : 'Explainable priority score'}</span></div><div class="login-stat"><strong>Offline</strong><span>${state.lang === 'hi' ? 'कमज़ोर नेटवर्क में लॉग' : 'Outcome logging that waits'}</span></div></div>
      </div><div class="login-art-foot">${state.lang === 'hi' ? 'डेमो डेटा · कोई वास्तविक भुगतान या संदेश नहीं' : 'Demo data · no real payment or message is sent'}</div>
    </section>
    <section class="login-panel"><div class="login-card">
      <div class="language-switch" style="margin-bottom:23px;width:max-content"><button data-action="lang-hi" class="${state.lang === 'hi' ? 'selected' : ''}">हिंदी</button><button data-action="lang-en" class="${state.lang === 'en' ? 'selected' : ''}">EN</button></div>
      <h2>${t('loginHello')}</h2><p class="login-intro">${t('loginIntro')}</p>
      ${errorText ? `<div class="notice" style="margin-bottom:13px">${escapeHTML(errorText)}</div>` : ''}
      <form class="form-grid" id="login-form">
        <div class="field"><label for="email">${t('email')}</label><input id="email" type="email" name="email" required autocomplete="username" placeholder="officer@demo.local"></div>
        <div class="field"><label for="password">${t('password')}</label><input id="password" type="password" name="password" required autocomplete="current-password" placeholder="••••••••••••"></div>
        <button class="button full" type="submit">${t('signIn')} ${icon('up')}</button>
      </form>
      <div class="demo-box"><p class="demo-box-title">${t('demoAccounts')}</p><div class="demo-buttons">
        <button class="demo-pick" data-action="pick-officer"><strong>${t('officerDemo')}</strong><span>Rahul · इंदौर</span></button>
        <button class="demo-pick" data-action="pick-manager"><strong>${t('managerDemo')}</strong><span>Dashboard · CSV</span></button>
      </div></div>
      <div class="login-window"><span>${ICONS.alert}</span><span>${state.lang === 'hi' ? 'कॉल और रिमाइंडर सिर्फ़ सुबह 8 से शाम 7 बजे IST। यह नियम स्क्रीन और सर्वर दोनों पर लागू है।' : 'Calls and reminders are limited to 8 am–7 pm IST in both the interface and server.'}</span></div>
    </div></section>
  </main><div class="toast-region" id="toast-region" aria-live="assertive"></div>`;
}

function kpi(label, value, note, iconName, alert = false) {
  return `<article class="kpi-card ${alert ? 'alert' : ''}"><div class="kpi-top"><span>${label}</span><span class="kpi-icon">${ICONS[iconName] || ''}</span></div><strong class="kpi-value">${value}</strong><span class="kpi-note">${note}</span></article>`;
}

function cardLoan(loan, manager = false) {
  const p = loan.priority || { score: 0, effective_score: 0, band: 'low', reasons: [] };
  const promise = loan.promise_date ? fmtDate(loan.promise_date) : '—';
  const a = loan.officer_name || state.user?.name || '';
  const showCall = state.user?.role === 'officer';
  const allowed = contactAllowed();
  const online = navigator.onLine;
  return `<article class="loan-card" data-loan="${escapeHTML(loan.id)}">
    <div class="loan-card-top"><div>
      <div class="borrower-line"><span class="loan-id">${escapeHTML(loan.id)}</span><span class="risk-pill ${p.band}">${t(p.band)}</span></div>
      <h3 class="borrower-name">${escapeHTML(loan.borrower)}</h3>
      <div class="loan-meta"><span>${ICONS.location}${escapeHTML(localBranch(loan.branch_name))}</span><span><i class="meta-dot"></i>${state.lang === 'hi' ? 'पिन' : 'PIN'} ${escapeHTML(loan.pincode)}</span><span><i class="meta-dot"></i>${state.lang === 'hi' ? 'असाइन' : 'Assigned'} ${escapeHTML(a)}</span></div>
    </div><div class="score-block"><div class="score-number">${p.score}</div><div class="score-caption">${t('priority')} / 100${p.effective_score !== p.score ? `<br><span style="color:#9a6b1c">${state.lang === 'hi' ? 'मैन्युअल' : 'manual'} ${p.effective_score}</span>` : ''}</div><div class="score-track"><div class="score-fill ${p.band}" style="width:${p.score}%"></div></div></div></div>
    <div class="loan-stats"><div class="loan-stat"><span class="loan-stat-label">${t('outstanding')}</span><strong class="loan-stat-value">${fmtMoney(loan.outstanding)}</strong></div><div class="loan-stat"><span class="loan-stat-label">${t('dpd')}</span><strong class="loan-stat-value">${loan.dpd} ${state.lang === 'hi' ? 'दिन' : 'days'}</strong></div><div class="loan-stat"><span class="loan-stat-label">${t('promise')}</span><strong class="loan-stat-value">${promise}</strong></div></div>
    <div class="reasons"><span class="reasons-label">${t('reasons')}</span>${(state.lang === 'hi' ? (p.reasons_hi || p.reasons) : p.reasons).map((r) => `<span class="reason-chip">${escapeHTML(r)}</span>`).join('')}<button class="text-button" data-action="why" data-id="${escapeHTML(loan.id)}">${t('why')}</button></div>
    <div class="loan-card-bottom"><div class="assignment"><span class="mini-avatar">${escapeHTML(initial(a))}</span><span>${manager ? `${t('assigned')} · ${escapeHTML(a)}` : (state.lang === 'hi' ? 'आज आपकी सूची में' : 'On your list today')}</span></div>
      <div class="card-actions">${showCall ? `<button class="button secondary small" data-action="call" data-id="${escapeHTML(loan.id)}" ${!allowed || !online ? 'disabled title="Contact is blocked or offline"' : ''}>${icon('promise')}${t('call')}</button>` : ''}
      <a class="button secondary small" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loan.pincode} Indore`)}" target="_blank" rel="noopener noreferrer">${icon('location')}${t('map')}</a>
      ${showCall ? `<button class="button small" data-action="outcome" data-id="${escapeHTML(loan.id)}" ${!allowed ? 'disabled title="Contact window is closed"' : ''}>${t('outcome')}</button>` : `<button class="button secondary small" data-action="override" data-id="${escapeHTML(loan.id)}">${t('managerOnly')}</button>`}</div>
    </div>
  </article>`;
}

function renderHome() {
  const isManager = state.user?.role === 'manager';
  const rows = state.loans;
  const broken = rows.filter((x) => Number(x.broken_promises || 0) > 0).length;
  const due = rows.filter((x) => x.promise_date === TODAY).length;
  const total = rows.reduce((sum, x) => sum + Number(x.outstanding || 0), 0);
  const queueHtml = state.pending ? `<div class="queue-banner"><span><strong>${state.pending} ${t('queuedTitle')}</strong> · ${t('queueHint')}</span><div class="queue-actions"><button class="button secondary small" data-action="sync">${navigator.onLine ? t('retry') : t('offline')}</button></div></div>` : '';
  return `<div class="page-head"><div><p class="eyebrow">${t('today')} · ${new Intl.DateTimeFormat(state.lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' }).format(new Date())}</p><h1>${isManager ? t('managerTitle') : t('listTitle')}</h1><p class="page-subtitle">${isManager ? t('managerSub') : t('listSub')}</p></div><div class="date-label">${state.user?.role === 'officer' ? `${t('assigned')} · ${escapeHTML(state.user.name)}` : `${rows.length} ${t('total')}`}</div></div>
    ${queueHtml}
    <section class="grid kpi-grid">${kpi(t('activeLoans'), rows.length, `${rows.filter((x) => x.dpd <= 30).length} ${state.lang === 'hi' ? 'DPD 1–30' : 'in 1–30 DPD'}`, 'users')}${kpi(t('amountAtRisk'), fmtShort(total), state.lang === 'hi' ? '₹ में कुल पोर्टफ़ोलियो' : 'Across this assigned list', 'money')}${kpi(t('dueToday'), due, state.lang === 'hi' ? 'भुगतान तारीख आज' : 'Promise date is today', 'promise')}${kpi(t('broken'), broken, state.lang === 'hi' ? 'फ़ॉलो-अप ज़रूरी' : 'Follow-up needed', 'alert', broken > 0)}</section>
    <div class="section-title-row"><div><h2>${isManager ? t('home') : t('priority')}</h2><p>${rows.length} ${t('total')}</p></div><select id="sort-select" class="select" aria-label="Sort loans"><option value="score" ${state.sort === 'score' ? 'selected' : ''}>${t('priorityOrder')}</option><option value="dpd" ${state.sort === 'dpd' ? 'selected' : ''}>${t('dpdOrder')}</option><option value="amount" ${state.sort === 'amount' ? 'selected' : ''}>${t('amountOrder')}</option></select></div>
    ${state.loading ? `<div class="skeleton"></div>` : state.error ? `<div class="muted-empty"><strong>${t('emptyError')}</strong><span>${escapeHTML(state.error)}</span><button class="button secondary small" data-action="reload">${t('refresh')}</button></div>` : rows.length ? `<div class="loan-list">${rows.map((loan) => cardLoan(loan, isManager)).join('')}</div>` : `<div class="muted-empty"><span class="empty-icon">${ICONS.list}</span><strong>${t('noLoans')}</strong><span>${t('noLoansSub')}</span>${isManager ? `<a class="button secondary small" href="/import" data-nav="/import">${t('importTitle')}</a>` : ''}</div>`}
    <div class="footer-note">${state.lang === 'hi' ? '<strong>स्कोर पर भरोसा, नियंत्रण आपके हाथ में।</strong> यह प्राथमिकता नियम DPD, राशि, वादे और भुगतान इतिहास पर चलता है। कोई अपने-आप संदेश या कानूनी कार्रवाई नहीं होती।' : '<strong>Transparent support, officer judgment.</strong> This priority score uses DPD, amount, promises and payment history. It never sends a message or starts a legal action automatically.'}</div>`;
}

function renderPromises() {
  const groups = { broken: [], follow_up: [], due_today: [], upcoming: [] };
  for (const item of state.promises) groups[item.promise_state].push(item);
  const definitions = [
    ['broken', t('brokenGroup'), 'broken'], ['follow_up', t('followUp'), 'follow_up'],
    ['due_today', state.lang === 'hi' ? 'आज देय' : 'Due today', 'due_today'], ['upcoming', t('upcoming'), 'upcoming'],
  ];
  return `<div class="page-head"><div><p class="eyebrow">${state.lang === 'hi' ? 'फ़ॉलो-अप · वादे का ट्रैकर' : 'FOLLOW-UP · PROMISE TRACKER'}</p><h1>${t('promises')}</h1><p class="page-subtitle">${state.lang === 'hi' ? 'भुगतान की तारीख़ें और अगले फ़ॉलो-अप एक नज़र में।' : 'Payment dates and the next follow-up at a glance.'}</p></div></div>
  <div class="promise-groups">${definitions.map(([key, label, kind]) => `<section class="promise-group"><div class="promise-group-head"><h2>${label}</h2><span class="count-badge">${groups[key].length}</span></div>${groups[key].length ? groups[key].map((item) => `<article class="promise-item"><div class="promise-item-top"><span>${escapeHTML(item.borrower)}</span><span class="promise-date">${fmtDate(item.promise_date)}</span></div><div class="promise-item-meta">${escapeHTML(item.id)} · ${fmtMoney(item.outstanding)}<br>${state.user?.role === 'manager' ? `${escapeHTML(item.officer_name)} · ` : ''}${escapeHTML(localBranch(item.branch_name))}</div>${state.user?.role === 'officer' ? `<button class="text-button" data-action="reminder" data-id="${escapeHTML(item.id)}">${t('reminder')} →</button>` : ''}<span class="state-tag ${kind}">${kind === 'broken' ? t('brokenGroup') : kind === 'follow_up' ? t('followUpTag') : kind === 'due_today' ? t('dueToday') : t('upcoming')}</span></article>`).join('') : `<div class="backtest-empty"><strong>${t('noPromises')}</strong><span>${t('noPromisesSub')}</span></div>`}</section>`).join('')}</div>
  <div class="footer-note">${state.lang === 'hi' ? 'वादे की तारीख़ निकलना अपने-आप कानूनी स्थिति नहीं बदलता। विवाद दर्ज होने पर मैनेजर को समीक्षा करनी चाहिए।' : 'A missed promise does not automatically change a legal status. A manager should review disputed accounts.'}</div>`;
}

function renderManager() {
  if (!state.summary) return `<div class="skeleton"></div>`;
  const { metrics, branches, backtest } = state.summary;
  const current = metrics.roll_rate_baseline;
  const target = metrics.roll_rate_target;
  return `<div class="page-head"><div><p class="eyebrow">${state.lang === 'hi' ? 'प्रबंधन · पोर्टफ़ोलियो' : 'MANAGEMENT · PORTFOLIO'}</p><h1>${t('managerTitle')}</h1><p class="page-subtitle">${t('managerSub')}</p></div><div class="page-actions"><a class="button secondary" href="/backtest.csv" download>${icon('upload')}${t('download')}</a></div></div>
    <section class="grid kpi-grid manager-grid">${kpi(t('activeLoans'), metrics.active_loans, state.lang === 'hi' ? 'आयातित नमूना' : 'Imported sample', 'users')}${kpi(t('amountAtRisk'), fmtShort(metrics.outstanding), state.lang === 'hi' ? '₹ कुल बकाया' : '₹ outstanding', 'money')}${kpi(t('dueToday'), metrics.promises_due_today, state.lang === 'hi' ? 'आज की तय तारीख़' : 'Promise date is today', 'promise')}${kpi(t('broken'), metrics.broken_promises, state.lang === 'hi' ? 'रिव्यू ज़रूरी' : 'Review needed', 'alert', metrics.broken_promises > 0)}</section>
    <div class="manager-layout">
      <section class="panel panel-pad"><div class="panel-heading"><div><h2>${t('branches')}</h2><p>${state.lang === 'hi' ? 'वर्तमान दैनिक इम्पोर्ट में DPD बकेट' : 'Current daily-import DPD buckets'}</p></div><span class="count-badge">${branches.length}</span></div>
        <div class="table-wrap"><table class="branch-table"><thead><tr><th>${t('branch')}</th><th>${t('active')}</th><th>${state.lang === 'hi' ? '1–30 DPD' : '1–30 DPD'}</th><th>${t('rollRate')}</th><th>${t('broken')}</th></tr></thead><tbody>${branches.map((branch) => `<tr><td><span class="branch-name">${escapeHTML(localBranch(branch.name))}</span></td><td>${branch.active_count || 0}</td><td>${branch.bucket_1_30 || 0}</td><td>${branch.bucket_31_60 || 0}</td><td>${branch.broken_promises || 0}</td></tr>`).join('')}</tbody></table></div>
      </section>
      <section class="panel panel-pad"><div class="panel-heading"><div><h2>${t('baseline')}</h2><p>${state.lang === 'hi' ? 'ब्रीफ़ का वर्तमान बनाम लक्ष्य' : 'Client brief: current vs target'}</p></div></div><div class="rate-compare"><div class="rate-top"><div><span class="rate-big">${current}%</span><span class="small-note"> ${t('baseline')}</span></div><div class="rate-side"><strong>${target}%</strong><br>${t('target')}</div></div><div class="rate-line"><span class="rate-current" style="width:${Math.min(100,current)}%"></span><span class="rate-target" style="left:${target}%"></span></div><div class="legend-row"><span>${t('target')} · ${target}%</span><span>${t('sampleRate')}: 31–60 DPD ${metrics.dpd_31_60} / 1–30 DPD ${metrics.dpd_1_30}</span></div><p class="small-note">${t('sampleNote')}</p></div>
      </section>
      <section class="panel panel-pad" style="grid-column:1/-1"><div class="panel-heading"><div><h2>${t('backtest')}</h2><p>${state.lang === 'hi' ? 'स्कोर बैंड और दर्ज भुगतान नतीजों की तुलना' : 'Compare priority bands with logged payment outcomes'}</p></div></div>${backtest.length ? backtest.map((row) => { const rate = row.total ? Math.round(row.paid / row.total * 100) : 0; return `<div class="backtest-row"><strong>${t(row.band)}</strong><div class="backtest-bar"><span style="width:${rate}%"></span></div><span>${row.paid || 0}/${row.total} · ${rate}%</span></div>`; }).join('') : `<div class="backtest-empty"><span class="empty-icon">${ICONS.chart}</span><strong>${t('noBacktest')}</strong><span>${t('noBacktestSub')}</span></div>`}</section>
    </div>
    <div class="footer-note">${t('sampleNote')}</div>`;
}

const DEMO_CSV = `loan_id,borrower,outstanding,dpd,promise_date,pincode,broken_promises,missed_payments_90d,payment_ratio,product\nLN-10293,Company B (packaging unit),640000,12,2026-11-05,452001,0,1,0.67,Business loan\nLN-10871,Company C (fertiliser shop),310000,27,,453001,0,3,0.40,Business loan\nLN-11930,Company D (printing press),220000,19,2026-10-31,454001,1,2,0.50,Business loan\nLN-20452,Demo borrower - sample packaging,245000,9,,452003,0,0,0.85,Business loan`;

function renderImport() {
  const preview = state.fileText ? parseCsvPreview(state.fileText) : [];
  const table = preview.length ? `<div class="preview-table"><table><thead><tr>${preview[0].map((h) => `<th>${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${preview.slice(1, 6).map((row) => `<tr>${row.map((cell) => `<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  const result = state.importResult ? `<div class="notice" style="margin-top:14px;background:#eaf4ec;border-color:#d1e4d5;color:#36694a"><strong>${t('importDone')}:</strong> ${escapeHTML(state.importResult.message)}${state.importResult.errors?.length ? `<br>${state.importResult.errors.map(escapeHTML).join('<br>')}` : ''}</div>` : '';
  return `<div class="page-head"><div><p class="eyebrow">${state.lang === 'hi' ? 'दैनिक फ़ाइल · इम्पोर्ट' : 'DAILY FILE · IMPORT'}</p><h1>${t('importTitle')}</h1><p class="page-subtitle">${t('importSub')}</p></div></div>
    <div class="import-layout">
      <section class="panel panel-pad"><div class="panel-heading"><div><h2>${state.lang === 'hi' ? 'Overdue CSV' : 'Overdue CSV'}</h2><p>${state.lang === 'hi' ? 'नई फ़ाइल पुराने सक्रिय लोन को अपडेट भी कर सकती है।' : 'A new file can also update existing active loans.'}</p></div></div>
        <div class="dropzone" id="dropzone"><span class="upload-icon">${ICONS.upload}</span><strong>${state.fileName ? escapeHTML(state.fileName) : t('dropHere')}</strong><span>${t('csvLimit')}</span><div class="upload-actions"><label class="button secondary small" for="csv-file">${t('chooseFile')}</label><button class="button ghost small" data-action="demo-csv">${t('demoCSV')}</button></div><input class="file-input" id="csv-file" type="file" accept=".csv,text/csv"></div>
        ${table}${result}
        <div class="page-actions" style="margin-top:15px"><button class="button" data-action="import" ${!state.fileText ? 'disabled' : ''}>${t('importAssign')}</button><button class="button secondary" data-action="template">${t('template')}</button></div>
      </section>
      <aside class="panel panel-pad"><div class="panel-heading"><div><h2>${t('workflow')}</h2><p>${state.lang === 'hi' ? 'पंक्तियाँ पिनकोड से सुरक्षित रूप से शाखा में जाती हैं।' : 'Rows are routed to a branch by pincode.'}</p></div></div><div class="workflow-list"><div class="workflow-step"><span class="step-no">1</span><div><strong>${t('step1')}</strong><p>${t('step1sub')}</p></div></div><div class="workflow-step"><span class="step-no">2</span><div><strong>${t('step2')}</strong><p>${t('step2sub')}</p></div></div><div class="workflow-step"><span class="step-no">3</span><div><strong>${t('step3')}</strong><p>${t('step3sub')}</p></div></div></div><div class="hint-box" style="margin-top:17px">${state.lang === 'hi' ? '<strong>पिनकोड शाखा तय करता है।</strong> CSV में officer_id कॉलम स्वीकार नहीं होता; असाइनमेंट भरोसेमंद नियम से होता है।' : '<strong>Pincode controls branch routing.</strong> The importer ignores any officer_id column and applies the workload rule.'}</div></aside>
    </div>`;
}

function parseCsvPreview(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const parseLine = (line) => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((x) => x.replace(/^"|"$/g, '').replace(/""/g, '"'));
  return lines.slice(0, 7).map(parseLine);
}

function reminderText(loan, language = state.lang) {
  if (language === 'en') return `Hello, this is a courtesy reminder about loan account ${loan.id}. Please contact your branch at a convenient time to discuss your account. No action is required outside permitted contact hours.`;
  return `नमस्ते, यह ऋण खाते ${loan.id} के बारे में एक विनम्र अनुस्मारक है। कृपया अपनी सुविधा के समय शाखा से संपर्क करें। अनुमत संपर्क समय के बाहर किसी कार्रवाई की आवश्यकता नहीं है।`;
}

function renderModal() {
  const modal = state.modal;
  if (!modal) return '';
  const loan = state.loans.find((x) => x.id === modal.id) || state.promises.find((x) => x.id === modal.id);
  if (!loan) return '';
  if (modal.type === 'outcome') {
    const options = [['paid', '💸', t('kindPaid')], ['promise', '📅', t('kindPromise')], ['not_reachable', '☎', t('kindNotReachable')], ['dispute', '⚑', t('kindDispute')]];
    const isAllowed = contactAllowed();
    return `<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-head"><div><h2 id="modal-title">${t('outcome')} · ${escapeHTML(loan.id)}</h2><p>${escapeHTML(loan.borrower)} · ${fmtMoney(loan.outstanding)}</p></div><button class="close-button" data-action="close" aria-label="${t('close')}">${ICONS.close}</button></header>
      <div class="modal-body"><div class="outcome-options">${options.map(([kind, emo, label]) => `<button class="outcome-option ${modal.kind === kind ? 'selected' : ''}" data-action="pick-outcome" data-kind="${kind}"><span class="option-icon">${emo}</span><span>${label}</span></button>`).join('')}</div>
        ${!isAllowed ? `<div class="contact-locked">${ICONS.alert}<span>${t('contactBlocked')}</span></div>` : ''}
        <div class="form-grid">${modal.kind === 'paid' ? `<div class="field"><label for="collected-amount">${t('amountCollected')}</label><input id="collected-amount" type="number" min="1" max="${loan.outstanding}" step="1" value="${loan.outstanding}" inputmode="numeric"></div>` : ''}${modal.kind === 'promise' ? `<div class="field"><label for="promise-date">${t('promiseDate')}</label><input id="promise-date" type="date" min="${TODAY}" max="${addDays(TODAY, 30)}" value="${modal.promiseDate || ''}"></div>` : ''}
        <div class="field"><label for="outcome-note">${t('note')}</label><textarea id="outcome-note" maxlength="240" placeholder="${t('noteHint')}">${escapeHTML(modal.note || '')}</textarea><small>${t('noteHint')}</small></div>
        <div class="gps-row"><span>${icon('location')} <span class="gps-status">${modal.gps ? t('gpsAdded') : modal.gpsError ? t('gpsDenied') : t('gpsNone')}</span></span><button class="text-button" data-action="gps">${t('gps')}</button></div>
        <div class="modal-footer"><button class="button secondary" data-action="close">${t('cancel')}</button><button class="button" data-action="save-outcome" ${!modal.kind || !isAllowed ? 'disabled' : ''}>${t('save')}</button></div></div>
      </div></section></div>`;
  }
  if (modal.type === 'why' || modal.type === 'override') {
    const p = loan.priority || {};
    const manager = state.user?.role === 'manager';
    return `<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-head"><div><h2 id="modal-title">${t('scoreTitle')}</h2><p>${escapeHTML(loan.id)} · ${escapeHTML(loan.borrower)} · ${p.score || 0}/100</p></div><button class="close-button" data-action="close" aria-label="${t('close')}">${ICONS.close}</button></header>
      <div class="modal-body"><div class="hint-box" style="margin-bottom:14px">${t('scoreMethod')}</div><div class="score-explanation">${(p.factors || []).map((factor) => `<div class="factor-row"><span class="factor-label">${escapeHTML(state.lang === 'hi' ? (factor.label_hi || factor.label) : factor.label)}</span><span class="factor-detail">${escapeHTML(state.lang === 'hi' ? (factor.detail_hi || factor.detail) : factor.detail)}</span><span class="factor-points">+${factor.points}</span></div>`).join('')}</div>
      ${manager ? `<form class="override-form form-grid" id="override-form"><strong>${t('override')}</strong><div class="form-row"><div class="field"><label for="priority-override">${t('newPriority')}</label><input id="priority-override" type="number" min="1" max="100" required value="${p.effective_score || p.score || 50}"></div><div class="field"><label for="priority-reason">${t('overrideReason')}</label><input id="priority-reason" maxlength="200" required minlength="8" placeholder="${state.lang === 'hi' ? 'संक्षिप्त कारण लिखें' : 'Short reason'}" value="${escapeHTML(p.override_reason || '')}"></div></div><button class="button small" type="submit">${t('setPriority')}</button>${p.override_reason ? `<button class="text-button danger" type="button" data-action="clear-override" data-id="${escapeHTML(loan.id)}">${t('clearPriority')}</button>` : ''}</form>` : ''}
      <div class="modal-footer"><button class="button secondary" data-action="close">${t('close')}</button></div></div></section></div>`;
  }
  if (modal.type === 'reminder') {
    const isAllowed = contactAllowed();
    const draft = reminderText(loan, modal.language || state.lang);
    return `<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-head"><div><h2 id="modal-title">${t('reminder')}</h2><p>${escapeHTML(loan.id)} · ${escapeHTML(loan.borrower)}</p></div><button class="close-button" data-action="close" aria-label="${t('close')}">${ICONS.close}</button></header><div class="modal-body"><span class="reminder-tag">${t('reminderPreview')}</span><div class="reminder-preview">${escapeHTML(draft)}</div><div class="contact-locked">${ICONS.alert}<span>${isAllowed ? t('noSend') : t('contactBlocked')}</span></div><div class="modal-footer"><button class="button secondary" data-action="close">${t('cancel')}</button><button class="button" data-action="send-reminder" data-id="${escapeHTML(loan.id)}" ${!isAllowed || !navigator.onLine ? 'disabled' : ''}>${t('queueReminder')}</button></div></div></section></div>`;
  }
  return '';
}

function addDays(dateString, days) {
  const d = new Date(`${dateString}T12:00:00+05:30`);
  d.setDate(d.getDate() + days);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function routeContent() {
  if (state.route.startsWith('/manager') && state.user?.role === 'manager') return renderManager();
  if (state.route.startsWith('/import') && state.user?.role === 'manager') return renderImport();
  if (state.route.startsWith('/promises')) return renderPromises();
  return renderHome();
}

function render() {
  document.documentElement.lang = state.lang;
  if (!state.user) return renderLogin();
  app.innerHTML = appFrame(routeContent());
  if (state.modal) {
    const focus = app.querySelector('.modal input, .modal textarea, .modal button');
    focus?.focus({ preventScroll: true });
  }
}

async function loadRoute() {
  if (!state.user) return;
  state.loading = true;
  state.error = '';
  render();
  try {
    if (state.route.startsWith('/promises')) {
      const data = await api('/api/promises');
      state.promises = data.promises;
    } else if (state.route.startsWith('/manager') && state.user.role === 'manager') {
      const [summary, loans] = await Promise.all([api('/api/manager/summary'), api(`/api/loans?sort=${state.sort}`)]);
      state.summary = summary;
      state.loans = loans.loans;
    } else if (state.route.startsWith('/import') && state.user.role === 'manager') {
      // Import screen data is submitted explicitly; no sensitive cache is required.
    } else {
      const data = await api(`/api/loans?sort=${state.sort}`);
      state.loans = data.loans;
    }
  } catch (error) {
    state.error = error.message || t('emptyError');
    if (error.status === 401) {
      state.user = null;
      localStorage.removeItem('saathi_user');
    }
  }
  state.loading = false;
  render();
}

function showToast(message, type = 'success') {
  const region = document.getElementById('toast-region');
  if (!region) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  region.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

function openRoute(path) {
  state.route = path;
  history.pushState({}, '', path);
  state.modal = null;
  state.importResult = null;
  loadRoute();
}

function openModal(type, id) {
  state.modal = { type, id, kind: null, gps: null, note: '', promiseDate: '', language: state.lang };
  render();
}

function dbRequest(mode, operation) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('saathi-offline-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('outbox', { keyPath: 'client_event_id' });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('outbox', mode);
      const store = tx.objectStore('outbox');
      const req = operation(store);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
  });
}

async function queueOutcome(payload) {
  await dbRequest('readwrite', (store) => store.put(payload));
  await updatePendingCount();
}

async function pendingOutcomes() {
  try { return await dbRequest('readonly', (store) => store.getAll()) || []; }
  catch { return []; }
}

async function updatePendingCount() {
  state.pending = (await pendingOutcomes()).length;
  if (state.user) render();
}

let syncing = false;
async function syncOutcomes() {
  if (!navigator.onLine || !state.user || syncing) return;
  syncing = true;
  const queued = await pendingOutcomes();
  let saved = 0;
  for (const item of queued) {
    try {
      await api('/api/outcomes', { method: 'POST', body: JSON.stringify(item) });
      await dbRequest('readwrite', (store) => store.delete(item.client_event_id));
      saved += 1;
    } catch (error) {
      if (error.status === 403 && /8:00|8 am/i.test(error.message)) break;
      if (error.status === 401) break;
      if (!error.networkFailure && error.status !== 503) {
        showToast(error.message, 'error');
        break;
      }
      break;
    }
  }
  await updatePendingCount();
  syncing = false;
  if (saved) {
    showToast(`${saved} ${state.lang === 'hi' ? 'नतीजे सर्वर पर सिंक हुए' : 'outcome(s) synced to the server'}`);
    loadRoute();
  }
}

async function login(form) {
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    const data = await api('/api/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    state.user = data.user;
    state.route = state.user.role === 'manager' ? '/manager' : '/today';
    history.replaceState({}, '', state.route);
    localStorage.setItem('saathi_user', JSON.stringify(state.user));
    await updatePendingCount();
    render();
    await loadRoute();
    syncOutcomes();
  } catch (error) {
    renderLogin(error.message || t('loginError'));
  }
}

async function logout() {
  try { await api('/api/logout', { method: 'POST', body: '{}' }); } catch { /* Expired sessions can still return to sign-in. */ }
  state.user = null;
  state.loans = [];
  state.promises = [];
  state.summary = null;
  history.replaceState({}, '', '/login');
  localStorage.removeItem('saathi_user');
  render();
}

async function saveOutcome() {
  const modal = state.modal;
  const loan = state.loans.find((x) => x.id === modal.id);
  if (!modal.kind || !loan) return;
  if (!contactAllowed()) return showToast(t('contactBlocked'), 'error');
  const amount = modal.kind === 'paid' ? Number(document.getElementById('collected-amount')?.value || 0) : 0;
  const promiseDate = modal.kind === 'promise' ? document.getElementById('promise-date')?.value : null;
  const note = document.getElementById('outcome-note')?.value || '';
  if (modal.kind === 'paid' && (!Number.isInteger(amount) || amount < 1 || amount > loan.outstanding)) return showToast(`${t('amountCollected')}: ₹1–${Number(loan.outstanding).toLocaleString('en-IN')}`, 'error');
  if (modal.kind === 'promise' && !promiseDate) return showToast(t('promiseDate'), 'error');
  const payload = {
    client_event_id: crypto.randomUUID(), loan_id: loan.id, kind: modal.kind,
    amount_collected: amount, promise_date: promiseDate || null,
    note: note.trim(), latitude: modal.gps?.latitude ?? null, longitude: modal.gps?.longitude ?? null,
    logged_at: new Date().toISOString(),
  };
  try {
    if (!navigator.onLine) throw Object.assign(new Error('offline'), { networkFailure: true });
    await api('/api/outcomes', { method: 'POST', body: JSON.stringify(payload) });
    state.modal = null;
    showToast(state.lang === 'hi' ? 'नतीजा सर्वर पर सेव हुआ।' : 'Outcome saved to the server.');
    await loadRoute();
  } catch (error) {
    if (error.networkFailure) {
      try {
        await queueOutcome(payload);
        state.modal = null;
        showToast(t('queued'), 'success');
        render();
      } catch {
        showToast(state.lang === 'hi' ? 'इस डिवाइस पर सेव नहीं हो पाया। स्टोरेज अनुमति देखें।' : 'Could not save offline. Check device storage permissions.', 'error');
      }
    } else {
      showToast(error.message, 'error');
    }
  }
}

async function logCall(loanId) {
  if (!contactAllowed()) return showToast(t('contactBlocked'), 'error');
  try {
    const data = await api('/api/contact-attempt', { method: 'POST', body: JSON.stringify({ loan_id: loanId, channel: 'call' }) });
    showToast(data.message);
    await loadRoute();
  } catch (error) { showToast(error.message, 'error'); }
}

async function logReminder(loanId) {
  if (!contactAllowed() || !navigator.onLine) return showToast(t('contactBlocked'), 'error');
  const loan = state.loans.find((x) => x.id === loanId) || state.promises.find((x) => x.id === loanId);
  const language = state.modal?.language || state.lang;
  try {
    const data = await api('/api/contact-attempt', { method: 'POST', body: JSON.stringify({ loan_id: loanId, channel: 'reminder', language, draft: reminderText(loan, language) }) });
    state.modal = null;
    showToast(data.message);
    await loadRoute();
  } catch (error) { showToast(error.message, 'error'); }
}

async function importCsv() {
  if (!state.fileText) return showToast(t('fileRequired'), 'error');
  try {
    const result = await api('/api/import', { method: 'POST', body: JSON.stringify({ csv: state.fileText }) });
    state.importResult = result;
    showToast(result.message);
    await loadRoute();
  } catch (error) { showToast(error.message || t('csvInvalid'), 'error'); }
}

function downloadFile(filename, content, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function saveOverride(form) {
  const id = state.modal.id;
  const priority_override = Number(form.querySelector('#priority-override').value);
  const reason = form.querySelector('#priority-reason').value.trim();
  try {
    await api(`/api/loans/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ priority_override, reason }) });
    state.modal = null;
    showToast(state.lang === 'hi' ? 'प्राथमिकता अपडेट हुई। कारण ऑडिट में दर्ज है।' : 'Priority updated. The reason is in the audit log.');
    await loadRoute();
  } catch (error) { showToast(error.message, 'error'); }
}

async function clearOverride(id) {
  try {
    await api('/api/manager/clear-override', { method: 'POST', body: JSON.stringify({ loan_id: id }) });
    state.modal = null;
    showToast(state.lang === 'hi' ? 'मैन्युअल प्राथमिकता हटी।' : 'Manual priority cleared.');
    await loadRoute();
  } catch (error) { showToast(error.message, 'error'); }
}

function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('saathi_lang', lang);
  render();
}

app.addEventListener('click', async (event) => {
  const nav = event.target.closest('[data-nav]');
  if (nav) {
    event.preventDefault();
    const destination = nav.dataset.nav;
    if (destination === '/manager' && state.user?.role !== 'manager') return showToast(t('managerOnly'), 'error');
    if (destination === '/import' && state.user?.role !== 'manager') return showToast(t('managerOnly'), 'error');
    openRoute(destination);
    return;
  }
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'lang-hi') return setLanguage('hi');
  if (action === 'lang-en') return setLanguage('en');
  if (action === 'pick-officer' || action === 'pick-manager') {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    if (email && password) {
      email.value = action === 'pick-officer' ? 'rahul@demo.local' : 'manager@demo.local';
      password.value = action === 'pick-officer' ? 'FieldDemo2026!' : 'ManagerDemo2026!';
      password.focus();
    }
    return;
  }
  if (action === 'logout') return logout();
  if (action === 'reload') return loadRoute();
  if (action === 'sync') return syncOutcomes();
  if (action === 'call') return logCall(button.dataset.id);
  if (action === 'outcome') return openModal('outcome', button.dataset.id);
  if (action === 'why' || action === 'override') return openModal(action, button.dataset.id);
  if (action === 'pick-outcome') {
    state.modal.kind = button.dataset.kind;
    render();
    return;
  }
  if (action === 'close' || action === 'backdrop' && event.target === button) {
    state.modal = null;
    render();
    return;
  }
  if (action === 'gps') {
    if (!navigator.geolocation) {
      state.modal.gpsError = true;
      return render();
    }
    button.disabled = true;
    navigator.geolocation.getCurrentPosition((position) => {
      state.modal.gps = { latitude: Math.round(position.coords.latitude * 10000) / 10000, longitude: Math.round(position.coords.longitude * 10000) / 10000 };
      state.modal.gpsError = false;
      render();
    }, () => {
      state.modal.gpsError = true;
      render();
    }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 });
    return;
  }
  if (action === 'save-outcome') return saveOutcome();
  if (action === 'reminder') return openModal('reminder', button.dataset.id);
  if (action === 'send-reminder') return logReminder(button.dataset.id);
  if (action === 'demo-csv') {
    state.fileText = DEMO_CSV;
    state.fileName = 'saathi-demo-overdue.csv';
    state.importResult = null;
    return render();
  }
  if (action === 'template') {
    const template = 'loan_id,borrower,outstanding,dpd,promise_date,pincode,broken_promises,missed_payments_90d,payment_ratio,product\nLN-10001,Demo borrower - sample,250000,12,,452001,0,1,0.70,Business loan\n';
    return downloadFile('saathi-overdue-template.csv', template);
  }
  if (action === 'import') return importCsv();
  if (action === 'clear-override') return clearOverride(button.dataset.id);
});

app.addEventListener('change', (event) => {
  if (event.target.id === 'sort-select') {
    state.sort = event.target.value;
    loadRoute();
  }
  if (event.target.id === 'csv-file') {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_100_000) return showToast(t('csvLimit'), 'error');
    file.text().then((text) => {
      state.fileText = text;
      state.fileName = file.name;
      state.importResult = null;
      render();
    }).catch(() => showToast(t('csvInvalid'), 'error'));
  }
});

app.addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.target.id === 'login-form') login(event.target);
  if (event.target.id === 'override-form') saveOverride(event.target);
});

app.addEventListener('dragover', (event) => {
  if (event.target.closest('#dropzone')) {
    event.preventDefault();
    document.getElementById('dropzone')?.classList.add('dragover');
  }
});
app.addEventListener('dragleave', (event) => {
  if (!event.relatedTarget || !event.target.closest('#dropzone')?.contains(event.relatedTarget)) document.getElementById('dropzone')?.classList.remove('dragover');
});
app.addEventListener('drop', (event) => {
  if (!event.target.closest('#dropzone')) return;
  event.preventDefault();
  document.getElementById('dropzone')?.classList.remove('dragover');
  const file = event.dataTransfer.files[0];
  if (file?.size > 1_100_000) return showToast(t('csvLimit'), 'error');
  if (file) file.text().then((text) => { state.fileText = text; state.fileName = file.name; render(); });
});

window.addEventListener('popstate', () => {
  state.route = location.pathname;
  loadRoute();
});
window.addEventListener('online', () => {
  if (state.user) {
    showToast(state.lang === 'hi' ? 'नेटवर्क मिला · सेव नतीजे सिंक होंगे।' : 'Network restored · syncing saved outcomes.');
    syncOutcomes();
    render();
  }
});
window.addEventListener('offline', () => {
  if (state.user) { render(); showToast(state.lang === 'hi' ? 'ऑफ़लाइन मोड · नतीजे इस डिवाइस पर कतार में सेव होंगे।' : 'Offline mode · outcomes can queue on this device.'); }
});
setInterval(() => { if (state.user) render(); }, 60_000);

async function start() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  try {
    const data = await api('/api/session');
    state.user = data.user;
    state.csrf = data.csrf || state.csrf;
    if (state.csrf) localStorage.setItem('saathi_csrf', state.csrf);
    if (state.user) {
      localStorage.setItem('saathi_user', JSON.stringify(state.user));
      if (state.route === '/login' || state.route === '/') state.route = state.user.role === 'manager' ? '/manager' : '/today';
      await updatePendingCount();
      render();
      await loadRoute();
      syncOutcomes();
    } else {
      render();
    }
  } catch (error) {
    state.user = null;
    renderLogin(state.lang === 'hi' ? 'सर्वर से संपर्क नहीं हुआ। कृपया लोकल सर्वर चालू रखें।' : 'Cannot reach the server. Please start the local app server.');
  }
}

start();
