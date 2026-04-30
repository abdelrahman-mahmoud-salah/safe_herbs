'use strict';

/* ════════════════════════════════════════════════════
   SAFE HERBS INTELLIGENT CHAT WIDGET
   chat.js — self-contained, injects HTML + CSS + logic
   Just add: <script src="js/chat.js" defer></script>
════════════════════════════════════════════════════ */

(function () {

  /* ══════════════════════════════════
     INJECT CSS
  ══════════════════════════════════ */
  var style = document.createElement('style');
  style.id = 'sh-widget-css';
  style.textContent = [
    /* FAB */
    '#sh-chat-fab{position:fixed;bottom:24px;right:24px;width:58px;height:58px;border-radius:50%;background:#3d5c3d;border:2px solid #c8a052;cursor:pointer;z-index:9000;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(61,92,61,.45),0 2px 8px rgba(0,0,0,.25);transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s,background .3s;overflow:hidden}',
    '#sh-chat-fab:hover{transform:scale(1.09) translateY(-2px);box-shadow:0 16px 44px rgba(61,92,61,.55);background:#4a7a4a}',
    '#sh-chat-fab.open{transform:scale(1) rotate(45deg);background:#1e2318}',
    '#sh-chat-fab svg{transition:opacity .2s,transform .2s;pointer-events:none}',
    '#sh-chat-fab .fab-icon-chat{position:absolute}',
    '#sh-chat-fab .fab-icon-close{position:absolute;opacity:0;transform:rotate(-45deg) scale(.6)}',
    '#sh-chat-fab.open .fab-icon-chat{opacity:0;transform:scale(.6)}',
    '#sh-chat-fab.open .fab-icon-close{opacity:1;transform:rotate(0) scale(1)}',
    '#sh-chat-fab .fab-dot{position:absolute;top:9px;right:9px;width:10px;height:10px;background:#e2c07a;border-radius:50%;border:2px solid #3d5c3d;animation:sh-pulse 2.4s ease-in-out infinite}',
    '@keyframes sh-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.35);opacity:.55}}',
    '#sh-chat-fab.open .fab-dot{display:none}',

    /* PANEL base — mobile first: bottom sheet full width */
    '#sh-chat-panel{position:fixed;bottom:0;left:0;right:0;z-index:8999;height:min(92vh,680px);background:#1a1f14;border-top:1px solid rgba(200,160,82,.25);border-radius:18px 18px 0 0;display:flex;flex-direction:column;transform:translateY(110%);transition:transform .42s cubic-bezier(.16,1,.3,1),opacity .42s;opacity:0;box-shadow:0 -8px 48px rgba(0,0,0,.5);overflow:hidden;visibility:hidden}',
    '#sh-chat-panel.open{transform:translateY(0);opacity:1;visibility:visible}',

    /* PANEL — tablet 540px+ */
    '@media(min-width:540px){#sh-chat-panel{left:auto;right:24px;width:380px;bottom:94px;border-radius:16px;border:1px solid rgba(200,160,82,.22);height:min(80vh,640px)}}',
    /* PANEL — desktop 900px+ */
    '@media(min-width:900px){#sh-chat-panel{right:28px;width:410px;bottom:98px;height:min(74vh,660px)}}',

    /* BACKDROP — mobile only */
    '#sh-backdrop{position:fixed;inset:0;z-index:8998;background:rgba(0,0,0,.6);opacity:0;visibility:hidden;transition:opacity .35s,visibility .35s}',
    '#sh-backdrop.open{opacity:1;visibility:visible}',
    '@media(min-width:540px){#sh-backdrop{display:none}}',

    /* DRAG HANDLE */
    '.sh-handle{width:38px;height:4px;background:rgba(245,240,232,.18);border-radius:2px;margin:11px auto 0;flex-shrink:0;cursor:grab}',
    '@media(min-width:540px){.sh-handle{display:none}}',

    /* HEADER */
    '.sh-header{display:flex;align-items:center;gap:12px;padding:14px 18px 12px;border-bottom:1px solid rgba(200,160,82,.12);flex-shrink:0;background:rgba(255,255,255,.025)}',
    '.sh-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#3d5c3d,#243318);border:1.5px solid #c8a052;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.sh-avatar svg{width:20px;height:20px}',
    '.sh-hdr-info{flex:1;min-width:0}',
    '.sh-name{font-family:"Cormorant Garamond",Georgia,serif;font-size:16px;font-weight:300;color:#f5f0e8;letter-spacing:.4px;line-height:1;margin-bottom:3px}',
    '.sh-status{font-size:9.5px;letter-spacing:1.8px;text-transform:uppercase;color:#c8a052;display:flex;align-items:center;gap:5px}',
    '.sh-dot{width:6px;height:6px;border-radius:50%;background:#7ec860;animation:sh-pulse 2.5s ease-in-out infinite}',
    '.sh-close-btn{width:30px;height:30px;background:rgba(245,240,232,.06);border:1px solid rgba(245,240,232,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s;color:#f5f0e8;font-size:16px;line-height:1;font-family:sans-serif;flex-shrink:0}',
    '.sh-close-btn:hover{background:rgba(200,160,82,.18)}',

    /* MESSAGES AREA */
    '.sh-messages{flex:1;overflow-y:auto;padding:14px 15px;display:flex;flex-direction:column;gap:9px;scrollbar-width:thin;scrollbar-color:rgba(200,160,82,.18) transparent}',
    '.sh-messages::-webkit-scrollbar{width:3px}',
    '.sh-messages::-webkit-scrollbar-thumb{background:rgba(200,160,82,.2);border-radius:2px}',

    /* MESSAGE ROW */
    '.sh-msg{display:flex;gap:7px;align-items:flex-end;animation:sh-in .32s cubic-bezier(.16,1,.3,1) both}',
    '@keyframes sh-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '.sh-msg.user{flex-direction:row-reverse}',
    '.sh-bubble{max-width:88%;padding:9px 13px;font-size:12.5px;font-weight:300;line-height:1.7;border-radius:14px;word-break:break-word}',
    '.sh-msg.bot .sh-bubble{background:rgba(245,240,232,.07);color:rgba(245,240,232,.88);border-radius:4px 14px 14px 14px;border:1px solid rgba(200,160,82,.1)}',
    '.sh-msg.user .sh-bubble{background:#c8a052;color:#1a1f14;border-radius:14px 14px 4px 14px;font-weight:400}',
    '.sh-av{width:26px;height:26px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,#3d5c3d,#243318);border:1px solid rgba(200,160,82,.28);display:flex;align-items:center;justify-content:center;font-size:11px;color:#c8a052}',
    '.sh-msg.user .sh-av{display:none}',

    /* TYPING */
    '.sh-typing-row{display:flex;gap:5px;align-items:center;padding:9px 13px;min-width:52px}',
    '.sh-typing-row span{width:6px;height:6px;border-radius:50%;background:rgba(200,160,82,.5);animation:sh-bounce .85s ease-in-out infinite both}',
    '.sh-typing-row span:nth-child(2){animation-delay:.14s}',
    '.sh-typing-row span:nth-child(3){animation-delay:.28s}',
    '@keyframes sh-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}',

    /* PRODUCT CARDS */
    '.sh-products-wrap{display:flex;flex-direction:column;gap:4px;margin-top:8px;width:100%}',
    '.sh-cat-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#c8a052;font-weight:500;padding:4px 0 2px;border-bottom:1px solid rgba(200,160,82,.15);margin-bottom:4px}',
    '.sh-prod-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:6px}',
    '.sh-prod-card{background:rgba(255,255,255,.04);border:1px solid rgba(200,160,82,.13);border-radius:8px;padding:8px 9px;cursor:pointer;transition:background .18s,border-color .18s;display:flex;flex-direction:column;gap:2px}',
    '.sh-prod-card:hover{background:rgba(200,160,82,.1);border-color:rgba(200,160,82,.4)}',
    '.sh-prod-icon{font-size:14px;line-height:1}',
    '.sh-prod-name{font-size:11.5px;font-weight:400;color:#f5f0e8;line-height:1.3}',
    '.sh-prod-sub{font-size:10px;color:rgba(200,160,82,.72);line-height:1.3}',

    /* CERT BADGES */
    '.sh-certs-wrap{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}',
    '.sh-cert-badge{background:rgba(200,160,82,.1);border:1px solid rgba(200,160,82,.3);border-radius:4px;padding:4px 8px;font-size:10.5px;font-weight:500;color:#e2c07a;letter-spacing:.5px}',

    /* CHIPS */
    '.sh-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 15px 9px;flex-shrink:0}',
    '.sh-chip{font-size:10.5px;letter-spacing:.8px;padding:5px 11px;background:rgba(200,160,82,.08);border:1px solid rgba(200,160,82,.25);color:#e2c07a;border-radius:20px;cursor:pointer;transition:background .18s,border-color .18s,color .18s;white-space:nowrap}',
    '.sh-chip:hover{background:rgba(200,160,82,.2);border-color:#c8a052;color:#f5f0e8}',

    /* INPUT ROW */
    '.sh-input-row{display:flex;align-items:center;gap:9px;padding:10px 14px;border-top:1px solid rgba(200,160,82,.1);flex-shrink:0;background:rgba(0,0,0,.15)}',
    '#sh-input{flex:1;background:rgba(245,240,232,.06);border:1px solid rgba(245,240,232,.12);color:#f5f0e8;font-family:"Jost",sans-serif;font-size:12.5px;font-weight:300;padding:10px 15px;outline:none;border-radius:22px;transition:border-color .22s,background .22s;min-width:0}',
    '#sh-input::placeholder{color:rgba(245,240,232,.28);letter-spacing:.4px}',
    '#sh-input:focus{border-color:#c8a052;background:rgba(200,160,82,.05)}',
    '#sh-send{width:40px;height:40px;flex-shrink:0;background:#c8a052;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .18s,transform .18s}',
    '#sh-send:hover{background:#e2c07a;transform:scale(1.07)}',
    '#sh-send svg{width:17px;height:17px;fill:#1a1f14}',
    '#sh-send:disabled{background:rgba(200,160,82,.28);cursor:not-allowed;transform:none}',

    /* CTA */
    '.sh-cta{display:inline-flex;align-items:center;gap:7px;margin-top:9px;padding:8px 14px;background:#c8a052;color:#1a1f14;font-size:10.5px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;border-radius:4px;text-decoration:none;cursor:pointer;border:none;font-family:"Jost",sans-serif;transition:background .18s}',
    '.sh-cta:hover{background:#e2c07a}'
  ].join('');
  document.head.appendChild(style);

  /* ══════════════════════════════════
     INJECT HTML
  ══════════════════════════════════ */
  var tpl = document.createElement('div');
  tpl.innerHTML = [
    '<div id="sh-backdrop"></div>',
    '<button id="sh-chat-fab" aria-label="Chat with Safe Herbs AI">',
    '<svg class="fab-icon-chat" width="25" height="25" viewBox="0 0 24 24" fill="none">',
    '<path d="M12 3C7.03 3 3 6.58 3 11c0 2.1.87 4.02 2.3 5.47L4 21l4.7-1.55A9.3 9.3 0 0012 20c4.97 0 9-3.58 9-9s-4.03-9-9-9z" fill="rgba(245,240,232,.9)"/>',
    '<circle cx="8.5" cy="11" r="1.2" fill="#3d5c3d"/>',
    '<circle cx="12" cy="11" r="1.2" fill="#3d5c3d"/>',
    '<circle cx="15.5" cy="11" r="1.2" fill="#3d5c3d"/>',
    '</svg>',
    '<svg class="fab-icon-close" width="21" height="21" viewBox="0 0 24 24" fill="none">',
    '<path d="M18 6L6 18M6 6l12 12" stroke="rgba(245,240,232,.9)" stroke-width="2.2" stroke-linecap="round"/>',
    '</svg>',
    '<span class="fab-dot"></span>',
    '</button>',
    '<div id="sh-chat-panel" role="dialog" aria-label="Safe Herbs AI Assistant" aria-modal="true">',
    '<div class="sh-handle"></div>',
    '<div class="sh-header">',
    '<div class="sh-avatar">',
    '<svg viewBox="0 0 24 24" fill="none">',
    '<path d="M12 3C9 7 5 8 5 13a7 7 0 0014 0c0-5-4-6-7-10z" fill="#8ab870"/>',
    '<path d="M12 7C10 10 8 11 8 14a4 4 0 008 0c0-3-2-4-4-7z" fill="#c8a052" opacity=".7"/>',
    '</svg>',
    '</div>',
    '<div class="sh-hdr-info">',
    '<div class="sh-name">Safe Herbs Assistant</div>',
    '<div class="sh-status"><span class="sh-dot"></span>Online &middot; Organic Experts</div>',
    '</div>',
    '<button class="sh-close-btn" id="sh-close-btn" aria-label="Close">&#215;</button>',
    '</div>',
    '<div class="sh-messages" id="sh-messages"></div>',
    '<div class="sh-chips" id="sh-chips"></div>',
    '<div class="sh-input-row">',
    '<input id="sh-input" type="text" placeholder="اسأل عن المنتجات، المزارع، الشهادات..." autocomplete="off" maxlength="400">',
    '<button id="sh-send" aria-label="Send">',
    '<svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>',
    '</button>',
    '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(tpl);

  /* ═══════════════════════════════════════
     PRODUCT DATA — detailed
  ═══════════════════════════════════════ */
  var PRODUCTS = {
    herbs: {
      label_en: 'Herbs & Infusions',
      label_ar: 'أعشاب ونباتات',
      icon: '🌿',
      items: [
        { en: 'Chamomile', ar: 'بابونج', icon: '🌼', note_en: 'Whole & broken', note_ar: 'كاملة ومكسرة' },
        { en: 'Peppermint', ar: 'نعناع فلفلي', icon: '🌱', note_en: 'Dried leaves', note_ar: 'أوراق مجففة' },
        { en: 'Spearmint', ar: 'نعناع أخضر', icon: '🌿', note_en: 'Dried leaves', note_ar: 'أوراق مجففة' },
        { en: 'Hibiscus', ar: 'كركديه', icon: '🌺', note_en: 'Whole flowers', note_ar: 'زهور كاملة' },
        { en: 'Rosemary', ar: 'روزماري', icon: '🌾', note_en: 'Whole & rubbed', note_ar: 'كامل ومطحون' },
        { en: 'Basil', ar: 'ريحان', icon: '🌱', note_en: 'Dried & sweet', note_ar: 'مجفف وحلو' },
        { en: 'Sage', ar: 'مريمية', icon: '🌿', note_en: 'Whole & rubbed', note_ar: 'كاملة ومفرومة' },
        { en: 'Marjoram', ar: 'مردقوش', icon: '🌾', note_en: 'Whole & rubbed', note_ar: 'كامل ومفروم' },
        { en: 'Calendula', ar: 'قطيفة', icon: '🌸', note_en: 'Petals & whole', note_ar: 'بتلات وكاملة' },
        { en: 'Lemongrass', ar: 'حشيشة الليمون', icon: '🌿', note_en: 'Dried & cut', note_ar: 'مجفف ومقطع' },
        { en: 'Licorice', ar: 'عرق السوس', icon: '🌱', note_en: 'Root & extract', note_ar: 'جذر ومستخلص' },
        { en: 'Parsley', ar: 'بقدونس', icon: '🌿', note_en: 'Flakes & whole', note_ar: 'رقائق وكامل' },
        { en: 'Bay Leaves', ar: 'ورق الغار', icon: '🍃', note_en: 'Whole dried', note_ar: 'كاملة مجففة' },
        { en: 'Echinacea', ar: 'قنفذية', icon: '🌼', note_en: 'Aerial parts', note_ar: 'أجزاء هوائية' },
        { en: 'Molokhia', ar: 'ملوخية', icon: '🌿', note_en: 'Dried & cut', note_ar: 'مجففة ومقطعة' }
      ]
    },
    seeds: {
      label_en: 'Premium Seeds',
      label_ar: 'بذور فاخرة',
      icon: '🌾',
      items: [
        { en: 'White Sesame', ar: 'سمسم أبيض', icon: '⭐', note_en: 'Fairtrade certified', note_ar: 'Fairtrade معتمد' },
        { en: 'Golden Sesame', ar: 'سمسم ذهبي', icon: '✨', note_en: 'Fairtrade certified', note_ar: 'Fairtrade معتمد' },
        { en: ' Sesame', ar: 'سمسم', icon: '✨', note_en: 'Fairtrade certified', note_ar: 'Fairtrade معتمد' },
        { en: 'Nigella', ar: 'حبة سوداء', icon: '🖤', note_en: 'Black seed', note_ar: 'حبة البركة' },
        { en: 'Fennel', ar: 'شمر', icon: '🌿', note_en: 'Whole & ground', note_ar: 'كامل ومطحون' },
        { en: 'Cumin', ar: 'كمون', icon: '🌾', note_en: 'Whole & ground', note_ar: 'كامل ومطحون' },
        { en: 'Coriander', ar: 'كزبرة', icon: '🌱', note_en: 'Whole & ground', note_ar: 'كاملة ومطحونة' },
        { en: 'Fenugreek', ar: 'حلبة', icon: '🌿', note_en: 'Whole & powder', note_ar: 'كاملة ومسحوق' },
        { en: 'Anise', ar: 'يانسون', icon: '🌾', note_en: 'Whole & ground', note_ar: 'كامل ومطحون' },
        { en: 'Caraway', ar: 'كراوية', icon: '🌱', note_en: 'Whole & ground', note_ar: 'كاملة ومطحونة' }
      ]
    },
    onionGarlic: {
      label_en: 'Onion & Garlic',
      label_ar: 'ثوم وبصل',
      icon: '🧅',
      items: [
        { en: 'Garlic Flakes', ar: 'رقائق ثوم', icon: '🧄', note_en: 'Dehydrated', note_ar: 'مجفف' },
        { en: 'Garlic Powder', ar: 'مسحوق ثوم', icon: '🧄', note_en: 'Fine ground', note_ar: 'ناعم' },
        { en: 'Garlic Granules', ar: 'حبيبات ثوم', icon: '🧄', note_en: 'Coarse', note_ar: 'خشن' },
        { en: 'Onion Sliced', ar: 'بصل مقطع', icon: '🧅', note_en: 'Dehydrated', note_ar: 'مجفف' },
        { en: 'Onion Powder', ar: 'مسحوق بصل', icon: '🧅', note_en: 'Fine ground', note_ar: 'ناعم' },
        { en: 'Onion Minced', ar: 'بصل مفروم', icon: '🧅', note_en: 'Dehydrated', note_ar: 'مجفف' }
      ]
    }
  };

  var CHIPS_1 = ['What products do you offer?', 'عندكم شهادات ايه؟', 'Where are your farms?', 'ايه اكتر منتج مبيعا؟'];
  var CHIPS_2 = ['هل انتم معتمدين FDA؟', 'How to request a sample?', 'كام هكتار عندكم؟'];

  /* ═══════════════════════════════════════
     SIMILARITY HELPERS
  ═══════════════════════════════════════ */
  function lev(a, b) {
    var m = a.length, n = b.length, dp = [], i, j;
    for (i = 0; i <= m; i++)dp[i] = [i];
    for (j = 0; j <= n; j++)dp[0][j] = j;
    for (i = 1; i <= m; i++)for (j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
  }
  function sim(a, b) { a = (a || '').toLowerCase().trim(); b = (b || '').toLowerCase().trim(); if (!a || !b) return 0; if (a === b) return 1; var ml = Math.max(a.length, b.length); return ml === 0 ? 1 : 1 - lev(a, b) / ml; }
  function tokSc(q, p) { var qt = q.toLowerCase().split(/\s+/), pt = p.toLowerCase().split(/\s+/), s = 0; qt.forEach(function (a) { pt.forEach(function (b) { var r = sim(a, b); if (r > s) s = r; }); }); return s; }
  function bestMatch(q, cands) { var best = { score: 0, value: null }; cands.forEach(function (c) { var s = Math.max(sim(q, c), tokSc(q, c)); if (s > best.score) { best.score = s; best.value = c; } }); return best; }
  function isAr(t) { return /[\u0600-\u06FF]/.test(t); }
  function normAr(t) { return t.replace(/[\u0623\u0625\u0622\u0627]/g, '\u0627').replace(/\u0629/g, '\u0647').replace(/\u0649/g, '\u064a').replace(/\s+/g, ' ').trim(); }

  var AR_MAP = {
    '\u0628\u0627\u0628\u0648\u0646\u062c': 'chamomile', '\u0643\u0627\u0645\u0648\u0645\u064a\u0644': 'chamomile',
    '\u0646\u0639\u0646\u0627\u0639': 'peppermint', '\u0646\u0639\u0646\u0639': 'peppermint', '\u0646\u0639\u0646\u0627\u0639 \u0641\u0644\u0641\u0644\u064a': 'peppermint',
    '\u0646\u0639\u0646\u0627\u0639 \u0627\u062e\u0636\u0631': 'spearmint', '\u0646\u0639\u0646\u0627\u0639 \u0623\u062e\u0636\u0631': 'spearmint',
    '\u0643\u0631\u0643\u062f\u064a\u0647': 'hibiscus', '\u0647\u064a\u0628\u0633\u0643\u0633': 'hibiscus',
    '\u0627\u0643\u0644\u064a\u0644 \u0627\u0644\u062c\u0628\u0644': 'rosemary', '\u0631\u0648\u0632\u0645\u0627\u0631\u064a': 'rosemary',
    '\u0631\u064a\u062d\u0627\u0646': 'basil', '\u0645\u0631\u064a\u0645\u064a\u0629': 'sage', '\u0635\u0627\u0644\u0628\u064a\u0629': 'sage',
    '\u0645\u0631\u062f\u0642\u0648\u0634': 'marjoram', '\u0642\u0637\u064a\u0641\u0629': 'calendula',
    '\u062d\u0634\u064a\u0634\u0629 \u0627\u0644\u0644\u064a\u0645\u0648\u0646': 'lemongrass', '\u0639\u0631\u0642 \u0627\u0644\u0633\u0648\u0633': 'licorice',
    '\u0628\u0642\u062f\u0648\u0646\u0633': 'parsley', '\u0648\u0631\u0642 \u0627\u0644\u063a\u0627\u0631': 'bay leaves',
    '\u0642\u0646\u0641\u0630\u064a\u0629': 'echinacea', '\u0645\u0644\u0648\u062e\u064a\u0629': 'molokhia',
    '\u0633\u0645\u0633\u0645 \u0627\u0628\u064a\u0636': 'white sesame', '\u0633\u0645\u0633\u0645 \u0623\u0628\u064a\u0636': 'white sesame',
    '\u0633\u0645\u0633\u0645 \u0630\u0647\u0628\u064a': 'golden sesame', '\u0633\u0645\u0633\u0645': 'sesame',
    '\u062d\u0628\u0629 \u0633\u0648\u062f\u0627\u0621': 'nigella', '\u062d\u0628\u0629 \u0627\u0644\u0628\u0631\u0643\u0629': 'nigella', '\u0646\u064a\u062c\u064a\u0644\u0627': 'nigella',
    '\u0634\u0645\u0631': 'fennel', '\u0634\u0648\u0645\u0631': 'fennel', '\u0643\u0645\u0648\u0646': 'cumin',
    '\u0643\u0632\u0628\u0631\u0629': 'coriander', '\u062d\u0644\u0628\u0629': 'fenugreek', '\u064a\u0627\u0646\u0633\u0648\u0646': 'anise', '\u0643\u0631\u0627\u0648\u064a\u0629': 'caraway',
    '\u062b\u0648\u0645': 'garlic', '\u0628\u0635\u0644': 'onion',
    '\u0631\u0642\u0627\u0626\u0642': 'flakes', '\u0645\u0633\u062d\u0648\u0642': 'powder', '\u062d\u0628\u064a\u0628\u0627\u062a': 'granules'
  };

  function trAr(text) {
    var norm = normAr(text.toLowerCase());
    for (var k in AR_MAP) { if (norm.includes(normAr(k))) return AR_MAP[k]; }
    return null;
  }

  /* ═══════════════════════════════════════
     INTENT DETECTION
  ═══════════════════════════════════════ */
  function has(q, kws, thr) {
    thr = thr || 0.75; var ql = q.toLowerCase();
    for (var i = 0; i < kws.length; i++) {
      var k = kws[i].toLowerCase();
      if (ql.includes(k)) return true;
      if (sim(ql, k) >= thr) return true;
      var t = ql.split(/\s+/);
      for (var j = 0; j < t.length; j++)if (sim(t[j], k) >= thr) return true;
    }
    return false;
  }

  var allHerbNames = PRODUCTS.herbs.items.map(function (i) { return i.en.toLowerCase(); });
  var allSeedNames = PRODUCTS.seeds.items.map(function (i) { return i.en.toLowerCase(); });
  var allOGNames = PRODUCTS.onionGarlic.items.map(function (i) { return i.en.toLowerCase(); });

  var INTENTS = {
    greeting: function (q) { return has(q, ['hello', 'hi', 'hey', 'good morning', 'good evening', 'greetings', 'howdy', '\u0633\u0644\u0627\u0645', '\u0645\u0631\u062d\u0628\u0627', '\u0623\u0647\u0644\u0627', '\u0627\u0647\u0644\u0627', '\u0635\u0628\u0627\u062d \u0627\u0644\u062e\u064a\u0631', '\u0645\u0633\u0627\u0621 \u0627\u0644\u062e\u064a\u0631']); },
    bestSeller: function (q) { return has(q, ['best selling', 'best seller', 'top selling', 'most sold', 'popular', '\u0627\u0643\u062a\u0631 \u0645\u0646\u062a\u062c', '\u0627\u0643\u062b\u0631 \u0645\u0646\u062a\u062c', '\u0627\u0644\u0627\u0643\u062b\u0631 \u0645\u0628\u064a\u0639\u0627', '\u0623\u0643\u062b\u0631 \u0645\u0628\u064a\u0639\u0627', '\u0627\u0644\u0627\u0634\u0647\u0631', '\u0627\u0643\u062a\u0631 \u0645\u0646\u062a\u062c \u0645\u0628\u064a\u0639\u0627'], 0.72); },
    certifications: function (q) { return has(q, ['certif', 'cert', 'iso', 'organic', 'usda', 'nop', 'fairtrade', 'rainforest', 'uebt', 'sedex', 'fda', 'fssc', 'fsma', 'nfsa', 'brc', 'halal', '\u0634\u0647\u0627\u062f\u0629', '\u0634\u0647\u0627\u062f\u0627\u062a', '\u0645\u0639\u062a\u0645\u062f', '\u0627\u0639\u062a\u0645\u0627\u062f'], 0.68); },
    products: function (q) { return has(q, ['product', 'herb', 'spice', 'range', 'offer', 'sell', 'supply', 'catalogue', 'catalog', 'items', 'what do you offer', 'what products', '\u0645\u0646\u062a\u062c\u0627\u062a', '\u0645\u0646\u062a\u062c', '\u0627\u0639\u0634\u0627\u0628', '\u0639\u0646\u062f\u0643\u0645 \u0627\u064a\u0647', '\u0628\u062a\u0628\u064a\u0639\u0648\u0627 \u0627\u064a\u0647', '\u0627\u064a\u0647 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a', '\u0643\u0644 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a'], 0.70); },
    herbs: function (q) { return has(q, allHerbNames.concat(['herb', 'infusion', 'dried', 'tea', '\u0627\u0639\u0634\u0627\u0628', '\u0639\u0634\u0628']), 0.72); },
    seeds: function (q) { return has(q, allSeedNames.concat(['seed', 'seeds', '\u0628\u0630\u0648\u0631', '\u0628\u0630\u0631\u0629', '\u062d\u0628\u0648\u0628']), 0.72); },
    onionGarlic: function (q) { return has(q, ['garlic', 'onion', '\u062b\u0648\u0645', '\u0628\u0635\u0644', 'dehydrat'], 0.74); },
    farms: function (q) { return has(q, ['farm', 'farms', 'land', 'location', 'where', 'hectare', 'soil', 'fayoum', 'beni suef', 'luxor', 'wahat', '\u0645\u0632\u0627\u0631\u0639', '\u0645\u0632\u0631\u0639\u0629', '\u0647\u0643\u062a\u0627\u0631', '\u0645\u0648\u0642\u0639'], 0.68); },
    stats: function (q) { return has(q, ['hectare', 'size', 'how many', 'statistics', 'numbers', '\u0647\u0643\u062a\u0627\u0631', '\u0643\u0627\u0645 \u0647\u0643\u062a\u0627\u0631', '\u062d\u062c\u0645', '\u0639\u062f\u062f', '\u0645\u0633\u0627\u062d\u0629'], 0.70); },
    contact: function (q) { return has(q, ['contact', 'email', 'phone', 'reach', 'call', 'whatsapp', 'sample', 'quote', 'order', 'price', 'pricing', 'minimum', 'moq', '\u062a\u0648\u0627\u0635\u0644', '\u0627\u064a\u0645\u064a\u0644', '\u062a\u0644\u064a\u0641\u0648\u0646', '\u0633\u0639\u0631', '\u0639\u064a\u0646\u0629', '\u0637\u0644\u0628'], 0.72); }
  };

  function findProduct(q) {
    var ql = q.toLowerCase(), all = allHerbNames.concat(allSeedNames, allOGNames);
    var tr = trAr(q); if (tr) return tr;
    var m = bestMatch(ql, all); return m.score >= 0.68 ? m.value : null;
  }

  /* ═══════════════════════════════════════
     RICH CONTENT BUILDERS
  ═══════════════════════════════════════ */
  function buildProductsCard(ar, singleCat) {
    var wrap = document.createElement('div');
    wrap.className = 'sh-products-wrap';
    var cats = singleCat ? [singleCat] : ['herbs', 'seeds', 'onionGarlic'];
    cats.forEach(function (ck) {
      var cat = PRODUCTS[ck];
      var title = document.createElement('div');
      title.className = 'sh-cat-title';
      title.textContent = cat.icon + ' ' + (ar ? cat.label_ar : cat.label_en);
      wrap.appendChild(title);
      var grid = document.createElement('div');
      grid.className = 'sh-prod-grid';
      cat.items.forEach(function (item) {
        var card = document.createElement('div');
        card.className = 'sh-prod-card';
        card.innerHTML =
          '<div class="sh-prod-icon">' + item.icon + '</div>' +
          '<div class="sh-prod-name">' + (ar ? item.ar : item.en) + '</div>' +
          '<div class="sh-prod-sub">' + (ar ? item.note_ar : item.note_en) + '</div>';
        card.onclick = function () { processInput(ar ? ('\u0639\u0646\u062f\u0643\u0645 ' + item.ar + '?') : ('Tell me about ' + item.en)); };
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
    });
    return wrap;
  }

  function buildCertsCard() {
    var wrap = document.createElement('div');
    wrap.className = 'sh-certs-wrap';
    ['ISO 9001', 'ISO 22000', 'FSSC 22000', 'EU Organic', 'USDA NOP', 'Fairtrade', 'Rainforest Alliance', 'UEBT', 'Sedex', 'NFSA', 'FDA / FSMA'].forEach(function (c) {
      var b = document.createElement('span'); b.className = 'sh-cert-badge'; b.textContent = c; wrap.appendChild(b);
    });
    return wrap;
  }

  function ctaBtn(label, href) {
    var a = document.createElement('a');
    a.className = 'sh-cta';
    a.href = href || 'contactUs.html';
    a.textContent = label || 'Contact Our Team \u2192';
    a.onclick = function () { window.SHChat.close(); };
    return a;
  }

  /* ═══════════════════════════════════════
     RESPONSE GENERATOR  — returns {text, extra?, richContent?}
  ═══════════════════════════════════════ */
  function generateResponse(raw) {
    var q = raw.trim(), ar = isAr(q), ql = q.toLowerCase();

    if (INTENTS.greeting(ql)) return {
      text: ar
        ? '\u0623\u0647\u0644\u0627\u064b \u0648\u0633\u0647\u0644\u0627\u064b! \uD83C\uDF3F \u0623\u0646\u0627 \u0645\u0633\u0627\u0639\u062f **Safe Herbs & Spices**.\n\u064a\u0645\u0643\u0646\u0646\u064a \u0627\u0644\u0625\u062c\u0627\u0628\u0629 \u0639\u0646 \u0645\u0646\u062a\u062c\u0627\u062a\u0646\u0627\u060c \u0645\u0632\u0627\u0631\u0639\u0646\u0627\u060c \u0648\u0634\u0647\u0627\u062f\u0627\u062a\u0646\u0627. \u0643\u064a\u0641 \u0623\u0633\u0627\u0639\u062f\u0643\u061f'
        : 'Hello! \uD83C\uDF3F Welcome to **Safe Herbs & Spices**.\nI can answer questions about our products, farms, certifications, and ordering. What would you like to know?'
    };

    if (INTENTS.bestSeller(ql)) return {
      text: ar
        ? '\u0627\u0644\u0633\u0645\u0633\u0645 \u2014 **\u0627\u0644\u0623\u0628\u064a\u0636 \u0648\u0627\u0644\u0630\u0647\u0628\u064a** \u2014 \u0647\u0648 \u0623\u0643\u062b\u0631 \u0645\u0646\u062a\u062c\u0627\u062a\u0646\u0627 \u0645\u0628\u064a\u0639\u064b\u0627.\n\u0646\u0635\u062f\u0651\u0631\u0647 \u0628\u0643\u0645\u064a\u0627\u062a \u0643\u0628\u064a\u0631\u0629 \u0625\u0644\u0649 \u0623\u0648\u0631\u0648\u0628\u0627 \u0648\u0627\u0644\u062e\u0644\u064a\u062c\u060c \u0648\u0647\u0648 \u0645\u0639\u062a\u0645\u062f **Fairtrade**.'
        : 'Sesame \u2014 **White & Golden** \u2014 is our best-selling product.\nExported in large volumes to Europe and the Gulf, **Fairtrade certified**.'
    };

    /* specific product lookup */
    var sp = findProduct(q);
    if (sp) {
      var found = null, catLabel = '', catKey = '';
      ['herbs', 'seeds', 'onionGarlic'].forEach(function (ck) {
        PRODUCTS[ck].items.forEach(function (item) {
          if (item.en.toLowerCase().includes(sp) || sp.includes(item.en.toLowerCase())) {
            found = item; catLabel = ar ? PRODUCTS[ck].label_ar : PRODUCTS[ck].label_en; catKey = ck;
          }
        });
      });
      if (found) return {
        text: ar
          ? '\u0646\u0639\u0645\u060c \u0646\u0648\u0641\u0651\u0631 **' + found.ar + '** \u0636\u0645\u0646 ' + catLabel + '.\n' + found.note_ar + '\n\u0644\u0644\u0627\u0633\u062a\u0641\u0633\u0627\u0631 \u0623\u0648 \u0637\u0644\u0628 \u0639\u064a\u0646\u0629 \u0645\u062c\u0627\u0646\u064a\u0629\u060c \u062a\u0648\u0627\u0635\u0644 \u0639\u0644\u0649 info@safeherbsco.com'
          : 'Yes, we supply **' + found.en + '** in our ' + catLabel + ' range.\n' + found.note_en + '\nFor quantities or a free sample, contact us at info@safeherbsco.com',
        extra: ctaBtn(ar ? '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0641\u0631\u064a\u0642 \u2190' : 'Contact Our Team \u2192')
      };
    }

    if (INTENTS.certifications(ql)) return {
      text: ar
        ? '\u0646\u062d\u0645\u0644 **11 \u0634\u0647\u0627\u062f\u0629 \u062f\u0648\u0644\u064a\u0629**:'
        : 'We hold **11 international certifications**:',
      richContent: buildCertsCard()
    };

    /* ── ALL PRODUCTS — show full cards ── */
    if (INTENTS.products(ql)) return {
      text: ar
        ? '\u0646\u0642\u062f\u0651\u0645 **3 \u0641\u0626\u0627\u062a \u0631\u0626\u064a\u0633\u064a\u0629** \u2014 \u0627\u0636\u063a\u0637 \u0639\u0644\u0649 \u0623\u064a \u0645\u0646\u062a\u062c \u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644:'
        : 'We offer **3 main product categories** \u2014 tap any product for details:',
      richContent: buildProductsCard(ar)
    };

    if (INTENTS.herbs(ql)) return {
      text: ar
        ? '\u0644\u062f\u064a\u0646\u0627 **15 \u0646\u0648\u0639\u064b\u0627** \u0645\u0646 \u0627\u0644\u0623\u0639\u0634\u0627\u0628 \u0627\u0644\u0639\u0636\u0648\u064a\u0629:'
        : 'We offer **15 varieties** of organic herbs:',
      richContent: buildProductsCard(ar, 'herbs')
    };

    if (INTENTS.seeds(ql)) return {
      text: ar
        ? '\u0644\u062f\u064a\u0646\u0627 **9 \u0623\u0646\u0648\u0627\u0639** \u0645\u0646 \u0627\u0644\u0628\u0630\u0648\u0631 \u0627\u0644\u0639\u0636\u0648\u064a\u0629:'
        : 'We offer **9 varieties** of premium organic seeds:',
      richContent: buildProductsCard(ar, 'seeds')
    };

    if (INTENTS.onionGarlic(ql)) return {
      text: ar
        ? '\u0646\u0648\u0641\u0651\u0631 \u0627\u0644\u062b\u0648\u0645 \u0648\u0627\u0644\u0628\u0635\u0644 \u0627\u0644\u0645\u062c\u0641\u0641 \u0628\u0623\u0634\u0643\u0627\u0644 \u0645\u062a\u0639\u062f\u062f\u0629:'
        : 'We supply dehydrated **Garlic & Onion** in multiple forms:',
      richContent: buildProductsCard(ar, 'onionGarlic')
    };

    if (INTENTS.farms(ql)) return {
      text: ar
        ? '\u0645\u0632\u0627\u0631\u0639\u0646\u0627 \u0645\u0648\u0632\u0651\u0639\u0629 \u0639\u0644\u0649 **6 \u0645\u062d\u0627\u0641\u0638\u0627\u062a \u0645\u0635\u0631\u064a\u0629**:\n\u2022 \u0627\u0644\u0641\u064a\u0648\u0645 (\u0627\u0644\u0645\u062d\u0648\u0631 \u0627\u0644\u0631\u0626\u064a\u0633\u064a)\n\u2022 \u0628\u0646\u064a \u0633\u0648\u064a\u0641 \u00b7 \u0627\u0644\u0645\u0646\u064a\u0627\n\u2022 \u0623\u0633\u064a\u0648\u0637 \u00b7 \u0627\u0644\u0623\u0642\u0635\u0631 \u00b7 \u0627\u0644\u0648\u0627\u062d\u0627\u062a\n\n\u062a\u0645\u062a\u062f \u0639\u0644\u0649 \u0623\u0643\u062b\u0631 \u0645\u0646 **1,060 \u0647\u0643\u062a\u0627\u0631** \u0648\u062a\u0636\u0645 **12+ \u0645\u0632\u0631\u0639\u0629** \u0645\u0639\u062a\u0645\u062f\u0629 \u0639\u0636\u0648\u064a\u064b\u0627.'
        : 'Our farms span **6 Egyptian governorates**:\n\u2022 Fayoum (Primary Hub)\n\u2022 Beni Suef \u00b7 Al Minia\n\u2022 Assuit \u00b7 Luxor \u00b7 Al Wahat\n\nCovering **1,060+ hectares** across **12+ certified** organic farms.'
    };

    if (INTENTS.stats(ql)) return {
      text: ar
        ? '\u0625\u062d\u0635\u0627\u0621\u0627\u062a\u0646\u0627 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629:\n\u2022 **1,060+ \u0647\u0643\u062a\u0627\u0631** \u0645\u0646 \u0627\u0644\u0623\u0631\u0627\u0636\u064a \u0627\u0644\u0639\u0636\u0648\u064a\u0629\n\u2022 **12+ \u0645\u0632\u0631\u0639\u0629** \u0645\u0639\u062a\u0645\u062f\u0629\n\u2022 **20+ \u0645\u062d\u0635\u0648\u0644** \u0645\u062e\u062a\u0644\u0641\n\u2022 **30+ \u0639\u0627\u0645** \u0645\u0646 \u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644\n\u2022 **100%** \u0646\u0633\u0628\u0629 \u0646\u062c\u0627\u062d \u0641\u064a \u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u062a\u062f\u0642\u064a\u0642'
        : 'Our key stats:\n\u2022 **1,060+ hectares** of organic farmland\n\u2022 **12+ certified** farms\n\u2022 **20+ crops** cultivated\n\u2022 **30+ years** of compliance\n\u2022 **100% audit** pass rate'
    };

    if (INTENTS.contact(ql)) return {
      text: ar
        ? '\u0644\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631 \u0623\u0648 \u0639\u064a\u0646\u0629 \u0645\u062c\u0627\u0646\u064a\u0629:\n\uD83D\uDCE7 **info@safeherbsco.com**\n\uD83D\uDCDE **+20 115 929 5447**\n\uD83D\uDCDE **+20 114 567 0606**'
        : 'For quotes, free samples, or MOQ inquiries:\n\uD83D\uDCE7 **info@safeherbsco.com**\n\uD83D\uDCDE **+20 115 929 5447**\n\uD83D\uDCDE **+20 114 567 0606**',
      extra: ctaBtn(ar ? '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0641\u0631\u064a\u0642 \u2190' : 'Contact Our Team \u2192')
    };

    return {
      text: ar
        ? '\u0634\u0643\u0631\u064b\u0627 \u0644\u062a\u0648\u0627\u0635\u0644\u0643! \uD83C\uDF3F \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0633\u0624\u0627\u0644 \u0639\u0646 \u0645\u0646\u062a\u062c\u0627\u062a\u0646\u0627\u060c \u0645\u0632\u0627\u0631\u0639\u0646\u0627\u060c \u0623\u0648 \u0634\u0647\u0627\u062f\u0627\u062a\u0646\u0627.\n\u0644\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629 \u062a\u0648\u0627\u0635\u0644 \u0639\u0644\u0649 **info@safeherbsco.com**'
        : "Thanks for reaching out! \uD83C\uDF3F I didn't quite catch that. You can ask about our products, farms, or certifications.\nFor direct help, contact us at **info@safeherbsco.com**"
    };
  }

  /* ═══════════════════════════════════════
     UI HELPERS
  ═══════════════════════════════════════ */
  var $f = document.getElementById('sh-chat-fab');
  var $p = document.getElementById('sh-chat-panel');
  var $bd = document.getElementById('sh-backdrop');
  var $m = document.getElementById('sh-messages');
  var $c = document.getElementById('sh-chips');
  var $i = document.getElementById('sh-input');
  var $s = document.getElementById('sh-send');
  var isOpen = false, turns = 0, chipsShown = false;

  function fmt(t) { return t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>'); }
  function scrollBottom() { requestAnimationFrame(function () { $m.scrollTop = $m.scrollHeight; }); }

  function addMsg(text, type, extra, richContent) {
    var row = document.createElement('div'); row.className = 'sh-msg ' + type;
    var av = document.createElement('div'); av.className = 'sh-av'; av.textContent = '\uD83C\uDF3F';
    var bub = document.createElement('div'); bub.className = 'sh-bubble';
    bub.innerHTML = fmt(text);
    if (richContent) bub.appendChild(richContent);
    if (extra) bub.appendChild(extra);
    if (type === 'bot') row.appendChild(av);
    row.appendChild(bub);
    $m.appendChild(row);
    scrollBottom();
  }

  function addTyping() {
    var row = document.createElement('div'); row.className = 'sh-msg bot'; row.id = 'sh-typ';
    var av = document.createElement('div'); av.className = 'sh-av'; av.textContent = '\uD83C\uDF3F';
    var bub = document.createElement('div'); bub.className = 'sh-bubble';
    bub.innerHTML = '<div class="sh-typing-row"><span></span><span></span><span></span></div>';
    row.appendChild(av); row.appendChild(bub); $m.appendChild(row); scrollBottom();
  }
  function removeTyping() { var t = document.getElementById('sh-typ'); if (t) t.remove(); }

  function showChips(set) {
    $c.innerHTML = '';
    (set || CHIPS_1).forEach(function (q) {
      var b = document.createElement('button'); b.className = 'sh-chip'; b.textContent = q;
      b.onclick = function () { $c.innerHTML = ''; processInput(q); };
      $c.appendChild(b);
    });
  }

  function greet() {
    addMsg(
      '\u0645\u0631\u062d\u0628\u064b\u0627! \uD83C\uDF3F \u0623\u0646\u0627 \u0645\u0633\u0627\u0639\u062f **Safe Herbs & Spices**.\n\nHello! I answer in **Arabic or English** about our products, farms & certifications.\n\n\u0645\u0627 \u0627\u0644\u0630\u064a \u062a\u0648\u062f\u0651 \u0645\u0639\u0631\u0641\u062a\u0647\u061f / What would you like to know?',
      'bot'
    );
    setTimeout(function () { showChips(CHIPS_1); }, 500);
  }

  /* ═══════════════════════════════════════
     PROCESS INPUT
  ═══════════════════════════════════════ */
  function processInput(text) {
    if (!text.trim()) return;
    $c.innerHTML = '';
    addMsg(text, 'user');
    $i.value = ''; $s.disabled = true;
    turns++;
    addTyping();
    setTimeout(function () {
      removeTyping();
      var resp = generateResponse(text);
      addMsg(resp.text, 'bot', resp.extra || null, resp.richContent || null);
      $s.disabled = false; $i.focus();
      if (turns === 2 && !chipsShown) { chipsShown = true; setTimeout(function () { showChips(CHIPS_2); }, 600); }
    }, 520 + Math.random() * 280);
  }

  /* ═══════════════════════════════════════
     PUBLIC API
  ═══════════════════════════════════════ */
  window.SHChat = {
    toggle: function () { isOpen ? this.close() : this.open(); },
    open: function () {
      isOpen = true;
      $f.classList.add('open'); $p.classList.add('open'); $bd.classList.add('open');
      $i.focus();
      if (!turns && $m.children.length === 0) greet();
      scrollBottom();
    },
    close: function () {
      isOpen = false;
      $f.classList.remove('open'); $p.classList.remove('open'); $bd.classList.remove('open');
    }
  };

  /* ═══════════════════════════════════════
     EVENTS
  ═══════════════════════════════════════ */
  $f.addEventListener('click', function () { window.SHChat.toggle(); });
  $bd.addEventListener('click', function () { window.SHChat.close(); });
  var cb = document.getElementById('sh-close-btn');
  if (cb) cb.addEventListener('click', function () { window.SHChat.close(); });
  $i.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); processInput($i.value); } });
  $s.addEventListener('click', function () { processInput($i.value); });

  /* drag-to-dismiss on mobile */
  var hnd = document.querySelector('.sh-handle');
  if (hnd) {
    var sy = 0, drag = false;
    hnd.addEventListener('touchstart', function (e) { sy = e.touches[0].clientY; drag = true; }, { passive: true });
    document.addEventListener('touchmove', function (e) { if (!drag) return; if (e.touches[0].clientY - sy > 55) { drag = false; window.SHChat.close(); } }, { passive: true });
    hnd.addEventListener('touchend', function () { drag = false; });
  }

})();