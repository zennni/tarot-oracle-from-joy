// app.js — Tarot Oracle interaction engine

// ─── State ───────────────────────────────────────────────────────────────────
let lang = 'en';
window.__deckStyle = localStorage.getItem('tarot-deck-style') || 'rws';
let currentSpread = 'single';
let fanCards = [];
let drawnEntries = [];    // { card, position, reversed }
let readingsRevealed = [];
let chatHistory = [];
let majorArcanaOnly = localStorage.getItem('tarot-major-only') === '1';
let aiSettings = { engine: 'gemini', apiKey: '', model: 'gemini-2.0-flash-exp', persona: 'healer', apiUrl: '', customModel: '' };

// 转义模型/中转站返回的文本，防止 XSS（对方可能返回 <script>/<img onerror> 等，而本机存有 API 密钥）。
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function renderAIText(s) { return escapeHtml(s).replace(/\n/g, '<br>'); }

const PERSONAS = {
  mirror: {
    label: '玄镜', labelEN: 'Void Mirror',
    desc: '苏格拉底式——从不给答案，只以反问帮你看见自己。话极少，字字有重量。',
    systemCN: '你是玄镜。你从不直接给出建议或答案——只用精准的反问，帮对方看清自己。话极简，语气平静如深水。不评判，不安慰，不说废话。每次回应最多两三句，且必须以问句结尾。',
    systemEN: 'You are the Void Mirror. Never give direct advice — only ask precise questions that help the querent see themselves clearly. Speak minimally. No judgment, no comfort, no filler. End every response with a question.',
  },
  astrologer: {
    label: '星官', labelEN: 'Court Astrologer',
    desc: '古典神秘——宫廷占星师风格，典雅优美，时引天象与神话，带仪式感。',
    systemCN: '你是星官，一位出入帝王宫廷的占星师与塔罗解读者。语言典雅、带有仪式感，时而引用星象、五行或神话意象。将牌阵视为天意的投影，以诗意揭示命运的脉络。',
    systemEN: 'You are the Court Astrologer — a tarot reader from palace halls. Your language is elegant and ceremonial, invoking celestial imagery, myth, and cosmic symbolism. Treat the spread as a reflection of cosmic will. Speak with gravity and beauty.',
  },
  healer: {
    label: '治愈者', labelEN: 'The Healer',
    desc: '心理咨询师风格——先共情，再洞见。温柔但有边界，不迎合，不说空话。',
    systemCN: '你是治愈者，一位有深度的心理咨询师式塔罗引导者。先充分共情，再给出洞见。让对方感到被接纳、被看见，但不回避真相。温柔而有边界，从不迎合，从不说空话。',
    systemEN: 'You are the Healer — a psychologically-informed tarot guide. Lead with empathy before insight. Make the querent feel truly seen, while never avoiding honest truth. Warm but boundaried; compassionate but never sycophantic.',
  },
  philosopher: {
    label: '暗夜哲人', labelEN: 'Night Philosopher',
    desc: '荣格/尼采式——用原型、阴影、集体无意识解读，锐利，直击不舒服的深度。',
    systemCN: '你是暗夜哲人，融合荣格心理学与尼采思想的塔罗解读者。用原型、阴影、集体无意识来解读牌。分析锐利，不惮于触碰令人不舒服的深度。你认为牌是潜意识的镜子——它揭示的，往往是人最不愿正视的部分。',
    systemEN: 'You are the Night Philosopher — a Jungian-Nietzschean tarot reader. Interpret cards through archetypes, shadow, and the collective unconscious. Be analytically sharp, willing to reach uncomfortable depths. The cards mirror what the querent least wants to see.',
  },
};

// ─── Spread definitions ───────────────────────────────────────────────────────
const SPREADS = {
  single: {
    name: 'Single Card', nameCN: '单张牌',
    icon: '✦', count: 1, layout: 'flex',
    desc: 'Quick insight — one card, one answer', descCN: '快速洞察——一张牌，一个答案',
    topics: ['general'],
    positions: [{ en: 'Your Guidance', cn: '指引' }]
  },
  three: {
    name: 'Three Card', nameCN: '时间之流',
    icon: '✦✦✦', count: 3, layout: 'flex',
    desc: 'Past → Present → Future timeline', descCN: '过去→现在→未来 时间线',
    topics: ['general', 'work'],
    positions: [
      { en: 'Past', cn: '过去' },
      { en: 'Present', cn: '现在' },
      { en: 'Future', cn: '未来' }
    ]
  },
  twochoices: {
    name: 'Two Choices', nameCN: '二择一',
    icon: '⑂', count: 5, layout: 'twochoices',
    desc: 'Fork in the road — compare two paths', descCN: '岔路口——两条路的比较与抉择',
    topics: ['general', 'work', 'relationship'],
    positions: [
      { en: 'Current Situation', cn: '当前处境' },
      { en: 'Path A', cn: '选项A' },
      { en: 'Path A Outcome', cn: '选项A结果' },
      { en: 'Path B', cn: '选项B' },
      { en: 'Path B Outcome', cn: '选项B结果' }
    ]
  },
  lovecross: {
    name: 'Love Cross', nameCN: '爱情十字',
    icon: '♡', count: 5, layout: 'lovecross',
    desc: 'Relationship dynamics — self, partner, connection', descCN: '情感关系——你、对方、联结、阻碍、走向',
    topics: ['love'],
    positions: [
      { en: 'You (Your Feelings)', cn: '你（你的感受）' },
      { en: 'The Other Person', cn: '对方' },
      { en: 'The Connection', cn: '你们之间' },
      { en: 'The Challenge', cn: '障碍' },
      { en: 'Where This Leads', cn: '走向' }
    ]
  },
  pentagram: {
    name: 'Pentagram', nameCN: '五芒星',
    icon: '⛤', count: 5, layout: 'pentagram',
    desc: 'Five-pointed deep analysis', descCN: '五角深度剖析',
    topics: ['spiritual', 'general'],
    positions: [
      { en: 'Present Situation', cn: '当前处境' },
      { en: 'What Challenges You', cn: '挑战' },
      { en: 'Subconscious Influence', cn: '潜意识影响' },
      { en: 'Past Foundation', cn: '过去基础' },
      { en: 'Potential Future', cn: '潜在未来' }
    ]
  },
  horseshoe: {
    name: 'Horseshoe', nameCN: '马蹄铁',
    icon: '⌒', count: 7, layout: 'horseshoe',
    desc: 'Seven-card arc — from past to advice to outcome', descCN: '七张弧形牌阵——从过去到建议到结果',
    topics: ['work', 'general', 'health'],
    positions: [
      { en: 'Past', cn: '过去' },
      { en: 'Present', cn: '现在' },
      { en: 'Hidden Influence', cn: '隐藏影响' },
      { en: 'The Obstacle', cn: '障碍' },
      { en: 'Environment', cn: '外部环境' },
      { en: 'Advice', cn: '建议' },
      { en: 'Outcome', cn: '结果' }
    ]
  },
  celtic: {
    name: 'Celtic Cross', nameCN: '凯尔特十字',
    icon: '☩', count: 10, layout: 'celtic',
    desc: 'Classic 10-card deep reading — the full picture', descCN: '经典十张牌深度解读——全景分析',
    topics: ['general', 'relationship', 'work', 'spiritual'],
    positions: [
      { en: 'The Present', cn: '当前' },
      { en: 'The Challenge', cn: '挑战' },
      { en: 'Distant Past', cn: '远过去' },
      { en: 'Recent Past', cn: '近过去' },
      { en: 'Best Outcome', cn: '最佳结果' },
      { en: 'Near Future', cn: '近未来' },
      { en: 'Your Attitude', cn: '你的态度' },
      { en: "Others' Views", cn: '他人观点' },
      { en: 'Hopes & Fears', cn: '希望与恐惧' },
      { en: 'Final Outcome', cn: '最终结果' }
    ]
  },
  lifetree: {
    name: 'Tree of Life', nameCN: '生命之树',
    icon: '🜂', count: 10, layout: 'lifetree',
    desc: 'Kabbalistic Tree — spiritual journey from crown to earth', descCN: '卡巴拉生命之树——从灵性之冠到物质大地的旅程',
    topics: ['spiritual', 'general'],
    positions: [
      { en: 'Kether (Crown — Highest Self)', cn: '王冠（最高自我）' },
      { en: 'Chokmah (Wisdom — Creative Force)', cn: '智慧（创造力量）' },
      { en: 'Binah (Understanding — Receptive Form)', cn: '理解（接纳形式）' },
      { en: 'Chesed (Mercy — Abundance)', cn: '慈悲（丰盛）' },
      { en: 'Geburah (Severity — Discipline)', cn: '严厉（纪律）' },
      { en: 'Tiphareth (Beauty — True Self)', cn: '美（真实自我）' },
      { en: 'Netzach (Victory — Desire)', cn: '胜利（欲望）' },
      { en: 'Hod (Splendour — Intellect)', cn: '辉煌（理智）' },
      { en: 'Yesod (Foundation — Unconscious)', cn: '基础（潜意识）' },
      { en: 'Malkuth (Kingdom — Manifest Reality)', cn: '王国（现实）' }
    ]
  }
};

function t(en, cn) { return lang === 'zh' ? cn : en; }

// ─── AI Provider Registry ──────────────────────────────────────────────────────
// tag: 'free' | 'free-r' (free reasoning) | 'paid-low' | 'paid' | 'paid-top'
// 各家可选模型（列表仅为常用清单；未列出的新模型可在「自定义模型名」里直接填写）。
const PROVIDER_MODELS = {
  claude: [
    { id: 'claude-opus-4-8',           tag: 'paid-top', desc: '最新顶级旗舰，解读最深刻，适合复杂牌阵' },
    { id: 'claude-sonnet-5',           tag: 'paid',     desc: '最新强力，性价比最佳，推荐首选' },
    { id: 'claude-haiku-4-5-20251001', tag: 'paid-low', desc: '最新快速轻量，适合频繁追问' },
    { id: 'claude-opus-4-5',           tag: 'paid-top', desc: '前代顶级旗舰，深度解读' },
    { id: 'claude-sonnet-4-5',         tag: 'paid',     desc: '前代强力，均衡稳定' },
    { id: 'claude-3-5-haiku-20241022', tag: 'paid-low', desc: '经济快速，日常追问' },
  ],
  openai: [
    { id: 'gpt-4.1',      tag: 'paid',     desc: '旗舰·长上下文，推理强，推荐首选' },
    { id: 'gpt-4o',       tag: 'paid',     desc: '旗舰多模态，推理强、速度快' },
    { id: 'gpt-4.1-mini', tag: 'paid-low', desc: '轻量·长上下文，性价比高' },
    { id: 'gpt-4o-mini',  tag: 'paid-low', desc: '轻量快速，费用低，适合简单占卜' },
    { id: 'o3',           tag: 'paid-top', desc: '顶级推理模型，擅长深度逻辑分析' },
    { id: 'o4-mini',      tag: 'paid',     desc: '推理模型，经济，擅长逻辑' },
    { id: 'gpt-4-turbo',  tag: 'paid',     desc: '前代长上下文推理，适合大型牌阵' },
  ],
  grok: [
    { id: 'grok-4',       tag: 'paid-top', desc: '最新旗舰，最强推理' },
    { id: 'grok-3',       tag: 'paid',     desc: '旗舰，强力推理，思维流畅' },
    { id: 'grok-3-mini',  tag: 'paid-low', desc: '轻量快速，费用低' },
    { id: 'grok-2',       tag: 'paid',     desc: '前代旗舰，稳定可靠' },
  ],
  deepseek: [
    { id: 'deepseek-chat',     tag: 'paid-low', desc: 'V3·强力推理，全球性价比最高之一，推荐' },
    { id: 'deepseek-reasoner', tag: 'paid',     desc: 'R1·深度思考模型，适合复杂问题分析' },
  ],
  qwen: [
    { id: 'qwen-max',        tag: 'paid-top', desc: '最强推理，适合深度解读' },
    { id: 'qwen-max-latest', tag: 'paid-top', desc: '最新旗舰版，能力持续更新' },
    { id: 'qwen-plus',       tag: 'paid',     desc: '均衡性能，推荐首选' },
    { id: 'qwen-turbo',      tag: 'paid-low', desc: '快速响应，费用低，适合简单占卜' },
    { id: 'qwen-long',       tag: 'paid',     desc: '超长上下文，适合历史记录丰富时' },
  ],
  zhipu: [
    { id: 'glm-4.6',            tag: 'paid-top', desc: '最新旗舰，最强推理，深度解读首选' },
    { id: 'glm-4.5',            tag: 'paid',     desc: '强力旗舰，均衡出色' },
    { id: 'glm-4-plus',         tag: 'paid',     desc: '强力推理，深度解读' },
    { id: 'glm-4-flash',        tag: 'free',     desc: '完全免费，快速轻量，入门首选' },
    { id: 'glm-4-flash-250414', tag: 'free',     desc: '最新免费版，比上一版更优' },
    { id: 'glm-z1-flash',       tag: 'free-r',   desc: '免费推理模型，擅长复杂逻辑分析' },
    { id: 'glm-4-air',          tag: 'paid-low', desc: '均衡性能，低价可用' },
    { id: 'glm-4-long',         tag: 'paid-low', desc: '超长上下文，适合长历史记录' },
  ],
  minimax: [
    { id: 'MiniMax-Text-01', tag: 'paid',     desc: '超长上下文（400万token），适合复杂牌阵' },
    { id: 'abab6.5s-chat',   tag: 'paid-low', desc: '快速响应，日常占卜' },
  ],
  gemini: [
    { id: 'gemini-2.5-pro',        tag: 'paid-top', desc: '最强推理旗舰，深度解读首选' },
    { id: 'gemini-2.5-flash',      tag: 'free',     desc: '免费·快速推理，日常占卜首选' },
    { id: 'gemini-2.5-flash-lite', tag: 'free',     desc: '免费·极速经济，轻量入门' },
    { id: 'gemini-2.0-flash',      tag: 'free',     desc: '免费·均衡性能，速度极快' },
    { id: 'gemini-1.5-pro',        tag: 'paid',     desc: '100万token超长上下文，适合复杂牌阵' },
    { id: 'gemini-1.5-flash',      tag: 'free',     desc: '免费·轻量快速，入门首选' },
  ],
  kimi: [
    { id: 'kimi-latest',      tag: 'paid',     desc: '最新版·自动上下文，中文极佳，推荐' },
    { id: 'moonshot-v1-128k', tag: 'paid',     desc: '128k超长上下文，推理细腻' },
    { id: 'moonshot-v1-32k',  tag: 'paid-low', desc: '32k上下文，均衡性价比' },
    { id: 'moonshot-v1-8k',   tag: 'paid-low', desc: '8k轻量快速，日常追问' },
  ],
  doubao: [
    { id: 'doubao-1-5-pro-32k',  tag: 'paid-low', desc: '1.5旗舰，32k上下文，中文强，推荐' },
    { id: 'doubao-1-5-pro-256k', tag: 'paid',     desc: '1.5旗舰·超长上下文，适合长历史' },
    { id: 'doubao-pro-32k',      tag: 'paid-low', desc: '前代旗舰，32k上下文' },
    { id: 'doubao-pro-128k',     tag: 'paid',     desc: '前代·超长上下文' },
    { id: 'doubao-lite-32k',     tag: 'paid-low', desc: '轻量低价，速度快，日常占卜' },
  ],
};

const TAG_LABELS = {
  'free':     { cls: 'model-tag-free',   label: '🆓 免费' },
  'free-r':   { cls: 'model-tag-free-r', label: '🆓 免费·推理' },
  'paid-low': { cls: 'model-tag-paid',   label: '付费·低价' },
  'paid':     { cls: 'model-tag-paid',   label: '付费' },
  'paid-top': { cls: 'model-tag-paid',   label: '付费·旗舰' },
};

const AI_PROVIDERS = {
  openai:   { label: 'GPT-4o (OpenAI)',    url: 'https://api.openai.com/v1/chat/completions',                                             model: 'gpt-4o' },
  grok:     { label: 'Grok (xAI)',         url: 'https://api.x.ai/v1/chat/completions',                                                  model: 'grok-3' },
  deepseek: { label: 'DeepSeek',           url: 'https://api.deepseek.com/chat/completions',                                             model: 'deepseek-chat' },
  qwen:     { label: '通义千问 (Qwen)',     url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',                   model: 'qwen-plus' },
  zhipu:    { label: '智谱 GLM',            url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',                               model: 'glm-4-flash' },
  minimax:  { label: 'MiniMax',            url: 'https://api.minimax.chat/v1/chat/completions',                                          model: 'MiniMax-Text-01' },
  gemini:   { label: 'Gemini (Google)',    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',             model: 'gemini-2.5-flash' },
  kimi:     { label: 'Kimi (月之暗面)',     url: 'https://api.moonshot.cn/v1/chat/completions',                                         model: 'moonshot-v1-32k' },
  doubao:   { label: '豆包 (ByteDance)',    url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',                           model: 'doubao-pro-32k' },
  custom:   { label: '自定义 / 中转站',      url: '',                                                                                      model: '' },
};

// Resolve the effective endpoint + model, honoring custom relay URL and free-text model overrides.
function resolveEndpoint() {
  const prov = AI_PROVIDERS[aiSettings.engine] || {};
  const url   = (aiSettings.apiUrl || '').trim() || prov.url || '';
  const model = (aiSettings.customModel || '').trim() || aiSettings.model || prov.model || '';
  return { url, model };
}

// Resolve the Claude (Anthropic-format) endpoint + model, honoring a relay URL override.
function resolveClaudeEndpoint() {
  const url   = (aiSettings.apiUrl || '').trim() || 'https://api.anthropic.com/v1/messages';
  const model = (aiSettings.customModel || '').trim() || aiSettings.model || 'claude-opus-4-5';
  return { url, model };
}

// Auto-complete a bare domain or version-only path to a full /v1/chat/completions URL.
function normalizeApiUrl(url) {
  url = (url || '').trim();
  if (!url) return url;
  try {
    // Ensure the URL has a protocol so we can parse it reliably.
    const withProto = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    const u = new URL(withProto);
    const path = u.pathname.replace(/\/+$/, ''); // strip trailing slashes
    if (!path || path === '') {
      // Bare domain: https://gcli.ggchan.dev  →  append /v1/chat/completions
      u.pathname = '/v1/chat/completions';
    } else if (/^\/v\d+$/.test(path) || /^\/api\/v\d+$/.test(path)) {
      // Version-only: /v1 or /api/v1  →  append /chat/completions
      u.pathname = path + '/chat/completions';
    } else if (!path.includes('completions')) {
      // Has a path but doesn't look like an endpoint — probably a bare domain with a port or sub-path.
      // Only auto-append if the path has no dot (not a file) and doesn't already look like an API call.
      if (!path.includes('.') && !path.includes('messages')) {
        u.pathname = path + '/v1/chat/completions';
      }
    }
    // Re-add protocol if user didn't have one originally.
    return /^https?:\/\//i.test(url) ? u.href : u.href;
  } catch {
    return url; // not parseable — return as-is
  }
}

// Called onblur on the URL input: normalize, update the field, and show a note.
function normalizeApiUrlInput(el) {
  const original = (el.value || '').trim();
  if (!original) return;
  const normalized = normalizeApiUrl(original);
  const noteEl = document.getElementById('api-url-autocomplete-note');
  const textEl = document.getElementById('api-url-autocomplete-text');
  if (normalized !== original) {
    el.value = normalized;
    if (noteEl && textEl) {
      textEl.textContent = t(
        `Auto-completed to: ${normalized}`,
        `已自动补全为：${normalized}`
      );
      noteEl.style.display = 'block';
    }
  } else {
    if (noteEl) noteEl.style.display = 'none';
  }
}

// ─── Stars ────────────────────────────────────────────────────────────────────
(function initStars() {
  const c = document.getElementById('stars-canvas');
  const ctx = c.getContext('2d');
  let stars = [];
  function resize() { c.width = innerWidth; c.height = innerHeight; }
  function init() {
    resize(); stars = [];
    for (let i = 0; i < 180; i++) stars.push({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.1 + .2,
      a: Math.random(), da: (Math.random() - .5) * .004,
      vy: Math.random() * .12 + .03
    });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    stars.forEach(s => {
      s.a += s.da; if (s.a < 0 || s.a > 1) s.da *= -1;
      s.y += s.vy; if (s.y > c.height) s.y = 0;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${s.a * .55})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', init);
  init(); draw();
})();

// ─── Intro ────────────────────────────────────────────────────────────────────
function setLang(l) {
  lang = l;
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active',
      (l === 'en' && b.textContent.trim() === 'English') ||
      (l === 'zh' && b.textContent.trim() === '中文'));
  });
}

function enterApp() {
  document.getElementById('intro').style.display = 'none';
  document.getElementById('main').style.display = 'flex';
  applyLang();
  loadSettings();
  renderHistory();
  initDailyCard();
}

function applyLang() {
  document.getElementById('btn-reading').textContent   = t('Reading', '占卜');
  document.getElementById('btn-history').textContent   = t('History', '历史');
  const galleryBtn = document.getElementById('btn-gallery');
  if (galleryBtn) galleryBtn.textContent = t('Gallery', '牌库');
  document.getElementById('lbl-spread').textContent    = t('Choose Your Spread', '选择牌阵');
  document.getElementById('lbl-q').textContent         = t('What is your question?', '你的问题是什么？');
  document.getElementById('q-input').placeholder       = t('Speak what weighs on your heart — the cards will listen…', '说出你心中所想——牌会倾听…');
  document.getElementById('shuffle-btn').innerHTML     = t('✦ SHUFFLE &amp; SPREAD ✦', '✦ 洗牌展开 ✦');
  document.getElementById('hist-title').textContent    = t('Reading History', '占卜记录');
  document.getElementById('hist-clear-btn').textContent = t('Clear All', '清除全部');
  document.getElementById('chat-title').textContent    = t('Continue with the Oracle', '继续问神谕');
  document.getElementById('chat-input').placeholder    = t('Ask a follow-up question…', '继续追问…');
  document.getElementById('chat-send').textContent     = t('Send', '发送');
  document.getElementById('modal-title').textContent   = t('⚙ Oracle Settings', '⚙ 神谕设置');
  document.getElementById('modal-lbl-ai').textContent    = t('AI Reading Engine', 'AI 解读引擎');
  document.getElementById('modal-lbl-model').textContent = t('Model', '模型');
  document.getElementById('modal-lbl-key').textContent   = t('API Key', 'API 密钥');
  const lblCM = document.getElementById('modal-lbl-custom-model');
  if (lblCM) lblCM.textContent = t('Custom Model Name', '自定义模型名');
  const hintCM = document.getElementById('modal-hint-custom-model');
  if (hintCM) hintCM.textContent = t('Overrides the model selected above — lets you use models not listed officially. Leave blank to use the selected one.', '填写后将覆盖上方所选模型；可接入官方未列出的更多模型。留空则使用所选模型。');
  const lblUrl = document.getElementById('modal-lbl-url');
  if (lblUrl) lblUrl.textContent = t('API URL / Relay', 'API 网址 / 中转站');
  const hintUrl = document.getElementById('modal-hint-url');
  if (hintUrl) hintUrl.textContent = t('Optional: full endpoint of a relay / self-hosted proxy (OpenAI-compatible). Leave blank for the provider\'s official URL.', '可选：填写中转站 / 自建代理的完整接口地址（OpenAI 兼容格式）。留空则使用所选服务商的官方地址。');
  document.getElementById('modal-hint').textContent    = t(
    'Your key is stored only in your browser and sent solely to the chosen AI provider.',
    '密钥仅存储在浏览器本地，只会发送给所选的 AI 服务商。');
  document.getElementById('modal-save').textContent    = t('Save Settings', '保存设置');
  document.getElementById('fan-instr').textContent     = t(
    'Hover to sense a card · Click to draw it', '悬停感应 · 点击抽取');
  document.getElementById('sel-label').textContent     = t('Your drawn cards — click to reveal', '你的牌 — 点击翻牌');
  document.getElementById('reveal-btn').textContent    = t('✦ Reveal All ✦', '✦ 一键翻牌 ✦');
  const majorLbl = document.getElementById('lbl-major-only');
  if (majorLbl) majorLbl.textContent = t('Draw from the 22 Major Arcana only', '仅用 22 张大阿尔卡那抽牌');
  // Help / FAQ button
  const helpBtn = document.getElementById('help-btn-label');
  if (helpBtn) helpBtn.textContent = t('? Help', '？帮助');
  // Support / donation
  const supBtn = document.getElementById('support-btn-label');
  if (supBtn) supBtn.textContent = t('Support', '支持');
  const supTitle = document.getElementById('support-title');
  if (supTitle) supTitle.innerHTML = t('❤ Support the Author', '❤ 支持作者');
  const supSub = document.getElementById('support-sub');
  if (supSub) supSub.innerHTML = t('If this little oracle helped you, consider buying the author a cup of tea ☕<br>Your support keeps it running.', '如果这个小工具帮到了你，欢迎请作者喝杯茶 ☕<br>你的支持是它继续运转的动力。');
  const supCap = document.getElementById('support-caption');
  if (supCap) supCap.textContent = t('Scan to support · Qiao Xia Qiu Shui', '扫码打赏 · 桥下秋水');
  const supThanks = document.getElementById('support-thanks');
  if (supThanks) supThanks.textContent = t('✦ Any amount is a gentle echo ✦', '✦ 无论金额，都是温柔的回响 ✦');
  const lblAlipay = document.getElementById('lbl-alipay');
  if (lblAlipay) lblAlipay.textContent = t('Alipay', '支付宝');
  const lblWechat = document.getElementById('lbl-wechat');
  if (lblWechat) lblWechat.textContent = t('WeChat Pay', '微信');
  // Tip banner
  const tipEm = document.getElementById('tip-em');
  if (tipEm) tipEm.textContent = t('If this reading resonated with you', '如果这次解读对你有所启发');
  const tipText = document.getElementById('tip-text');
  if (tipText) { const em = tipText.querySelector('em'); tipText.childNodes[tipText.childNodes.length-1].textContent = t(', consider buying the author a cup of tea ☕', '，欢迎请作者喝杯茶 ☕'); }
  const tipBtn = document.getElementById('tip-btn');
  if (tipBtn) tipBtn.textContent = t('❤ Support', '❤ 支持作者');
  const majorChk = document.getElementById('major-only-check');
  if (majorChk) majorChk.checked = majorArcanaOnly;

  // Build spread buttons dynamically
  buildSpreadButtons();

  // Guide button label
  const guideBtn = document.getElementById('guide-btn');
  if (guideBtn) guideBtn.textContent = t('☽ What is Tarot?', '☽ 什么是塔罗？');

  // Attach question input listener for smart recommendation
  const qInput = document.getElementById('q-input');
  qInput.removeEventListener('input', onQuestionInput);
  qInput.addEventListener('input', onQuestionInput);

  // Update guide if already open
  applyGuideI18n();
}

// ─── Build spread buttons from SPREADS config ────────────────────────────────
function buildSpreadButtons() {
  const grid = document.getElementById('spread-grid');
  grid.innerHTML = '';
  for (const [key, sp] of Object.entries(SPREADS)) {
    const btn = document.createElement('button');
    btn.className = 'spread-btn' + (key === currentSpread ? ' active' : '');
    btn.id = 'sbtn-' + key;
    btn.onclick = () => selectSpread(key);
    btn.innerHTML = `<span class="si">${sp.icon}</span><span class="sn">${t(sp.name, sp.nameCN)}</span><span class="sc">${sp.count}${t(' cards', '张')}</span>`;
    grid.appendChild(btn);
  }
  // Adjust grid columns based on count
  const count = Object.keys(SPREADS).length;
  grid.style.gridTemplateColumns = `repeat(${Math.min(count, 4)}, 1fr)`;
  updateSpreadDesc();
}

// ─── Smart spread recommendation based on question ───────────────────────────
let _recTimeout = null;
function onQuestionInput() {
  clearTimeout(_recTimeout);
  _recTimeout = setTimeout(recommendSpread, 400);
}

function recommendSpread() {
  const q = document.getElementById('q-input').value.trim();
  const recEl = document.getElementById('spread-recommend');
  if (!q || q.length < 4) {
    recEl.style.display = 'none';
    document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('recommended'));
    return;
  }
  const topic = detectTopic(q);
  const ql = q.toLowerCase();

  // Detect question complexity & type
  const isYesNo = /^(是否|会不会|能不能|should i|will |can i|does |is |am i)/i.test(ql) || /吗[？?]?\s*$/.test(q);
  const isChoice = /(还是|或者|choose|choice|which|二选|两个|option|path|左|右|A还是B)/i.test(ql);
  const isDeep = q.length > 40 || /(人生|生命|意义|purpose|life path|soul|灵魂|使命|spiritual|修行|内在)/i.test(ql);
  const isTimeline = /(未来|过去|接下来|what will|what happens|走向|发展|趋势|timeline)/i.test(ql);

  let rec, reason;
  if (isChoice) {
    rec = 'twochoices';
    reason = t('Your question involves a choice — the Two Choices spread maps both paths.', '你的问题涉及选择——二择一牌阵可以对比两条路。');
  } else if (topic === 'love') {
    rec = 'lovecross';
    reason = t('A relationship question — the Love Cross reveals dynamics between you and the other person.', '感情问题——爱情十字牌阵可以揭示你和对方之间的能量。');
  } else if (isDeep) {
    rec = 'lifetree';
    reason = t('A deep life question — the Tree of Life maps your spiritual journey from crown to earth.', '深层生命议题——生命之树牌阵从灵性之冠到现实大地。');
  } else if (isTimeline) {
    rec = 'three';
    reason = t('A timeline question — Past → Present → Future gives you the arc.', '时间线问题——过去→现在→未来呈现事态发展弧线。');
  } else if (topic === 'career' || topic === 'health') {
    rec = 'horseshoe';
    reason = t('The Horseshoe spread gives a thorough 7-card analysis with clear advice.', '马蹄铁牌阵提供7张牌的全面分析，包含明确的建议。');
  } else if (isYesNo && q.length < 20) {
    rec = 'single';
    reason = t('A yes/no question — a single card cuts through to the answer.', '是非题——单张牌直指答案。');
  } else if (q.length > 25) {
    rec = 'celtic';
    reason = t('A complex question — the Celtic Cross gives you the full picture.', '复杂的问题——凯尔特十字给你全景分析。');
  } else {
    rec = 'pentagram';
    reason = t('The Pentagram gives a balanced 5-card insight into your situation.', '五芒星牌阵提供平衡的五张牌洞察。');
  }

  recEl.style.display = 'block';
  recEl.innerHTML = `✦ ${reason}`;

  // Highlight recommended button
  document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('recommended'));
  const recBtn = document.getElementById('sbtn-' + rec);
  if (recBtn) recBtn.classList.add('recommended');

  // Auto-select if user hasn't manually chosen
  if (!_userManualSpread) selectSpread(rec, true);
}

let _userManualSpread = false;

// ─── Spread selection ─────────────────────────────────────────────────────────
function selectSpread(s, isAuto) {
  currentSpread = s;
  if (!isAuto) _userManualSpread = true;
  document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('sbtn-' + s);
  if (btn) btn.classList.add('active');
  updateSpreadDesc();
}

function updateSpreadDesc() {
  const sp = SPREADS[currentSpread];
  const descEl = document.getElementById('spread-desc');
  if (descEl && sp) descEl.textContent = t(sp.desc, sp.descCN);
}

function onMajorOnlyChange() {
  const chk = document.getElementById('major-only-check');
  majorArcanaOnly = !!(chk && chk.checked);
  localStorage.setItem('tarot-major-only', majorArcanaOnly ? '1' : '0');
}

// ─── Shuffle & Fan ────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startShuffle() {
  // ── FIX 1: full state reset so second+ readings work ──
  drawnEntries = [];
  readingsRevealed = [];
  chatHistory = [];

  document.getElementById('readings-output').innerHTML = '';
  document.getElementById('chat-section').style.display = 'none';
  dismissTipBanner(); _tipDismissed = false; // reset so banner shows again next reading

  // Reset selected row completely
  const slotsEl = document.getElementById('selected-slots');
  slotsEl.innerHTML = '';
  slotsEl.className = 'selected-slots';
  document.getElementById('selected-row').style.display = 'none';
  document.getElementById('reveal-btn').style.display = 'none';

  // Reset fan stage & grid
  const fanWrap = document.getElementById('fan-stage-wrap');
  fanWrap.style.opacity = '1';
  fanWrap.style.transition = '';
  fanWrap.style.display = 'none'; // will be shown by buildFan

  const btn = document.getElementById('shuffle-btn');
  btn.disabled = true;

  let count = 0;
  const interval = setInterval(() => {
    count++;
    const frames = ['✦ ·  ·  ·', '·  ✦ ·  ·', '·  ·  ✦ ·', '·  ·  ·  ✦', '·  ·  ✦ ·', '·  ✦ ·  ·'];
    btn.textContent = t('Shuffling ' + frames[count % frames.length], '洗牌中 ' + frames[count % frames.length]);
    if (count >= 12) {
      clearInterval(interval);
      btn.textContent = t('✦ Draw your cards ✦', '✦ 请抽取你的牌 ✦');
      btn.disabled = false;
      buildFan();
    }
  }, 150);
}

function buildFan() {
  const pool = majorArcanaOnly ? DECK.filter(c => c.suit === 'major') : DECK;
  fanCards = shuffle(pool);
  const stage = document.getElementById('fan-stage');
  const wrap = document.getElementById('fan-stage-wrap');
  stage.innerHTML = '';
  wrap.style.display = 'block';

  const isMobile = window.innerWidth <= 600;

  if (isMobile) {
    // ── Mobile: multi-row grid, each card individually tappable ──
    wrap.classList.add('mobile-grid-wrap');
    stage.classList.add('mobile-grid-stage');
    // Force pixel width so flex-wrap works (% can resolve to max-content in some browsers)
    stage.style.width = (wrap.clientWidth || window.innerWidth) + 'px';
    document.getElementById('fan-instr').textContent = t('Tap any card to draw it', '点击任意一张牌');

    fanCards.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = 'fan-card mobile-grid-card';
      el.dataset.idx = i;
      const _backUrl = (typeof cardBackImg === 'function') ? cardBackImg() : null;
      el.innerHTML = `<div class="fc-back" style="${_backUrl ? 'background-image:none;border:none;' : ''}">` +
        (_backUrl ? `<img class="fc-back-img" src="${_backUrl}" alt="card back">` : `<div class="fc-back-inner" style="font-size:.5rem">✦</div>`) +
        `</div>`;
      el.addEventListener('click', () => onFanCardClick(el, i));
      stage.appendChild(el);
    });
  } else {
    // ── Desktop: arc fan layout ──
    wrap.classList.remove('mobile-grid-wrap');
    stage.classList.remove('mobile-grid-stage');
    stage.style.cssText = '';
    document.getElementById('fan-instr').textContent = t('Hover to sense a card · Click to draw it', '感受牌的能量 · 点击抽取');

    const total = fanCards.length;
    const stageW = wrap.offsetWidth || 800;
    const cardW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-w')) || 80;
    const arcSpan = Math.min(stageW * 0.48, 420);
    const rotSpan = 64;

    fanCards.forEach((card, i) => {
      const pct = i / (total - 1);
      const tx = (pct - .5) * arcSpan * 2;
      const rot = (pct - .5) * rotSpan;
      const ty = Math.abs(pct - .5) * 28;

      const el = document.createElement('div');
      el.className = 'fan-card';
      el.dataset.idx = i;
      el.style.cssText = `
        transform: translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg);
        z-index: ${i};
        left: calc(50% - ${cardW / 2}px);
      `;
      const _backUrl = (typeof cardBackImg === 'function') ? cardBackImg() : null;
      el.innerHTML = `<div class="fc-back" style="${_backUrl ? 'background-image:none;border:none;' : ''}">` +
        (_backUrl ? `<img class="fc-back-img" src="${_backUrl}" alt="card back">` : `<div class="fc-back-inner">✦</div>`) +
        `</div>`;

      el.addEventListener('mouseenter', () => {
        if (el.classList.contains('drawn')) return;
        el.style.transform = `translateX(${tx}px) translateY(${ty - 22}px) rotate(${rot}deg) scale(1.08)`;
        el.style.zIndex = 150;
        el.style.filter = 'drop-shadow(0 0 14px rgba(201,168,76,.75))';
      });
      el.addEventListener('mouseleave', () => {
        if (el.classList.contains('drawn')) return;
        el.style.transform = `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg)`;
        el.style.zIndex = i;
        el.style.filter = '';
      });
      el.addEventListener('click', () => onFanCardClick(el, i));
      stage.appendChild(el);
    });
  }

  // Show spread layout with dotted placeholders immediately
  const spread = SPREADS[currentSpread];
  ensureSelectedRow(spread.positions.length);
}

// ─── Fan card click ───────────────────────────────────────────────────────────
function onFanCardClick(el, fanIdx) {
  const spread = SPREADS[currentSpread];
  const needed = spread.positions.length;
  if (drawnEntries.length >= needed || el.classList.contains('drawn')) return;

  el.classList.add('drawn');
  el.style.pointerEvents = 'none';
  el.style.filter = 'brightness(.3) saturate(.3)';

  const slotIdx = drawnEntries.length;
  const card = fanCards[fanIdx];
  const reversed = Math.random() < .33;
  drawnEntries.push({ card, position: spread.positions[slotIdx], reversed });

  ensureSelectedRow(needed);
  animateCardToSlot(el, slotIdx, card, reversed, () => {
    if (drawnEntries.length === needed) onAllDrawn();
  });
}

function ensureSelectedRow(needed) {
  const row = document.getElementById('selected-row');
  const slots = document.getElementById('selected-slots');
  row.style.display = 'block';

  if (slots.children.length === 0) {
    // Remove all layout classes, then add current one
    slots.className = 'selected-slots';
    const sp = SPREADS[currentSpread];
    if (sp.layout && sp.layout !== 'flex') {
      slots.classList.add(sp.layout + '-layout');
    }
    for (let i = 0; i < needed; i++) {
      const pos = sp.positions[i];
      const slotDiv = document.createElement('div');
      slotDiv.className = 'sel-slot';
      slotDiv.id = 'sel-slot-' + i;
      slotDiv.innerHTML = `
        <div class="sel-pos-label">${t(pos.en, pos.cn)}</div>
        <div class="card-placeholder" id="placeholder-${i}"></div>`;
      slots.appendChild(slotDiv);
    }
  }
}

function animateCardToSlot(fanEl, slotIdx, card, reversed, cb) {
  // Replace placeholder with flip-card structure
  const placeholder = document.getElementById('placeholder-' + slotIdx);
  if (!placeholder) { cb && cb(); return; }

  const fanRect = fanEl.getBoundingClientRect();
  const destRect = placeholder.getBoundingClientRect();

  // Build the flip card (back + front) and replace the placeholder
  const flipWrap = document.createElement('div');
  flipWrap.className = 'card-flip-wrap';
  flipWrap.id = 'flip-wrap-' + slotIdx;
  const _cfBackUrl = (typeof cardBackImg === 'function') ? cardBackImg() : null;
  flipWrap.innerHTML = `
    <div class="card-flip-inner">
      <div class="cf-back" style="${_cfBackUrl ? 'background-image:none;border:none;padding:0;' : ''}">` +
        (_cfBackUrl
          ? `<img class="cf-back-img" src="${_cfBackUrl}" alt="card back">`
          : `<div class="cf-back-inner">✦</div>`) +
      `</div>
      <div class="cf-front${reversed ? ' reversed' : ''}" id="cf-front-${slotIdx}">
        <img class="img-skeleton" src="${cardImg(card.id)}" alt="${card.name}"
             onload="this.classList.remove('img-skeleton')"
             onerror="this.parentNode.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:2.5rem;background:linear-gradient(160deg,#1a1a2e,#0f0f20);color:#c9a84c\\'>${card.symbol||'✦'}</div>'">
        ${reversed ? `<div class="cf-reversed-tag">${t('Reversed','逆位')}</div>` : ''}
      </div>
    </div>`;
  placeholder.replaceWith(flipWrap);

  // Animate fan card flying to this slot
  const clone = fanEl.cloneNode(true);
  clone.style.cssText = `
    position:fixed;
    width:${fanRect.width}px;height:${fanRect.height}px;
    left:${fanRect.left}px;top:${fanRect.top}px;
    transition:all .6s cubic-bezier(.4,0,.2,1);
    z-index:500;pointer-events:none;border-radius:6px;
  `;
  document.body.appendChild(clone);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    const newRect = flipWrap.getBoundingClientRect();
    clone.style.left   = newRect.left + 'px';
    clone.style.top    = newRect.top + 'px';
    clone.style.width  = newRect.width + 'px';
    clone.style.height = newRect.height + 'px';
    clone.style.transform = 'rotate(0deg) scale(1)';
    clone.style.filter = 'drop-shadow(0 0 16px rgba(201,168,76,.6))';
  }));

  setTimeout(() => {
    clone.remove();
    // Now card back is visible; click to flip and reveal
    flipWrap.style.cursor = 'pointer';
    flipWrap.onclick = () => revealCard(slotIdx);
    cb && cb();
  }, 680);
}

function onAllDrawn() {
  document.getElementById('reveal-btn').style.display = 'inline-block';
  document.getElementById('sel-label').textContent = t(
    'Click a card to reveal · or reveal all', '点击翻牌 · 或一键全部揭示');
  setTimeout(() => {
    const fw = document.getElementById('fan-stage-wrap');
    fw.style.transition = 'opacity .5s';
    fw.style.opacity = '0';
    setTimeout(() => fw.style.display = 'none', 500);
  }, 600);
}

// ─── Reveal cards ─────────────────────────────────────────────────────────────
function revealCard(idx) {
  if (readingsRevealed.includes(idx)) return;
  const wrap = document.getElementById('flip-wrap-' + idx);
  if (!wrap) return;
  wrap.classList.add('flipped');
  wrap.onclick = null;
  wrap.style.cursor = 'default';
  readingsRevealed.push(idx);

  // Show card name label under the flipped card
  const entry = drawnEntries[idx];
  if (entry) {
    const slot = document.getElementById('sel-slot-' + idx);
    if (slot && !slot.querySelector('.cf-name-label')) {
      const lbl = document.createElement('div');
      lbl.className = 'cf-name-label';
      lbl.innerHTML = `${lang === 'zh' ? entry.card.nameCN : entry.card.name}${entry.reversed ? `<span class="cf-rev-tag">${t(' Rev','逆')}</span>` : ''}`;
      slot.appendChild(lbl);
    }
  }

  // Only append readings AFTER all cards are flipped
  if (readingsRevealed.length === drawnEntries.length) {
    setTimeout(() => {
      // Append all readings at once
      for (let i = 0; i < drawnEntries.length; i++) {
        appendReading(i);
      }
      onAllRevealed();
    }, 600);
  }
}

function revealAll() {
  const total = drawnEntries.length;
  for (let i = 0; i < total; i++) {
    if (!readingsRevealed.includes(i)) setTimeout(() => revealCard(i), i * 220);
  }
  document.getElementById('reveal-btn').style.display = 'none';
}

// ─── Per-card contextual reading ──────────────────────────────────────────────
// FIX 2 & 3: interpretations are now woven around the question

function detectTopic(question) {
  if (!question) return 'general';
  const q = question.toLowerCase();
  if (q.match(/love|relation|partner|romance|heart|marriage|dating|boyfriend|girlfriend|husband|wife|crush|ex |情|爱|感情|恋|婚|伴侣|喜欢|在一起|分手|复合|暧昧|对象|男友|女友|老公|老婆|前任|他.{0,4}(我|吗|呢)|她.{0,4}(我|吗|呢)/)) return 'love';
  if (q.match(/work|career|job|business|money|finance|success|职|工作|事业|钱|财|成功/)) return 'career';
  if (q.match(/health|body|illness|heal|energy|sick|身体|健康|疾|病/)) return 'health';
  if (q.match(/family|parent|child|home|mother|father|家|父|母|孩|子女/)) return 'family';
  if (q.match(/decision|choice|should i|path|direction|选择|决定|方向|要不要/)) return 'decision';
  if (q.match(/spirit|soul|purpose|meaning|grow|destiny|灵|使命|成长|目的|意义/)) return 'spiritual';
  return 'general';
}

// Generates a Waite-grounded interpretation for a single card in its position
function buildCardNarrative(card, reversed, positionEn, question, topic) {
  const lore = (typeof WAITE_LORE !== 'undefined') ? WAITE_LORE[waiteId(card.id)] : null;
  const d    = reversed ? card.reversed : card.upright;
  const kw   = d.kw.split(',').map(s => s.trim());
  const kw1  = kw[0], kw2 = kw[1] || '';
  const name = card.name;
  const q    = question || '';

  // Waite lore from PDF
  const waiteSym  = lore?.sym || '';
  const loreText  = lore ? (reversed ? lore.rev : lore.up) : d.meaning;

  const posFrames = {
    'Past':                   'Looking back at what brought you here',
    'Present':                'At this very moment',
    'Future':                 'Moving ahead',
    'The Present':            'At the heart of your current situation',
    'The Challenge':          'The real challenge standing before you',
    'Distant Past':           'In the deeper roots beneath the surface',
    'Recent Past':            'Just behind you, still casting its shadow',
    'Best Outcome':           'The highest possibility available to you',
    'Near Future':            'What is moving toward you',
    'Your Attitude':          'The energy you yourself bring to this',
    "Others' Views":          'How those around you see this situation',
    'Hopes & Fears':          'The hope and fear intertwined here',
    'Final Outcome':          'Where this path ultimately leads',
    'What Challenges You':    'The hidden friction blocking you',
    'Subconscious Influence': 'Operating beneath the surface, quietly shaping things',
    'Past Foundation':        'The experience that set all this in motion',
    'Potential Future':       'The path opening ahead of you',
    'Your Guidance':          "The card's direct counsel",
  };
  const posNote = posFrames[positionEn] || 'In this position';
  const frame   = q ? `${posNote} — in the context of "${q}" —` : `${posNote} —`;

  return `${frame} <strong>${name}${reversed ? ' (Reversed)' : ''}</strong> · <em>${kw1}${kw2 ? ` &amp; ${kw2}` : ''}</em>`
    + (waiteSym ? `<br><span style="color:var(--text2);font-size:.87em;font-style:italic">☽ ${waiteSym}</span>` : '')
    + `<br><br>${loreText}`;
}

function buildCardNarrativeCN(card, reversed, positionCN, question, topic) {
  const lore = (typeof WAITE_LORE !== 'undefined') ? WAITE_LORE[waiteId(card.id)] : null;
  const isXYJ = window.__deckStyle === 'xiyouji';
  const xyjLore = (isXYJ && typeof XYJ_LORE !== 'undefined') ? XYJ_LORE[card.id] : null;
  const d    = reversed ? card.reversed : card.upright;
  const kw   = d.kwCN.split('·').map(s => s.trim());
  const kw1  = kw[0], kw2 = kw[1] || '';
  const name = card.nameCN;
  const q    = question || '';

  const cnMeaning = d.meaningCN;
  const loreText = lore ? (reversed ? (lore.revCN || lore.rev) : (lore.upCN || lore.up)) : '';

  // Position-aware extensions (Chinese, topic-sensitive)
  const topicEnrich = {
    love:     { '过去':'这段感情的源头埋藏于此。', '现在':'此刻，这段关系正处于关键时刻。', '未来':'前方的情感走向由此牌揭示。', 'default':'在感情层面，' },
    career:   { '过去':'职业道路的根基在此显露。', '现在':'工作与事业正在经历这股能量。', '未来':'职业的下一步将受此影响。', 'default':'在事业层面，' },
    health:   { 'default':'在身心状态上，' },
    decision: { 'default':'关于这个选择，' },
    spiritual:{ 'default':'在灵性与成长的层面上，' },
    general:  { 'default':'' },
  };
  const topicMap = topicEnrich[topic] || topicEnrich.general;
  const topicNote = topicMap[positionCN] || topicMap['default'] || '';

  const posFramesCN = {
    '过去':       '回望是什么将你带到这里',
    '现在':       '就在此刻',
    '未来':       '向前看',
    '当前':       '在你当前处境的核心',
    '挑战':       '摆在你面前的真正挑战',
    '远过去':     '在表面之下更深的根源',
    '近过去':     '就在你身后，仍投下阴影',
    '最佳结果':   '对你而言最高的可能性',
    '近未来':     '正向你走来的',
    '你的态度':   '你自身带入这里的能量',
    '他人观点':   '周围的人如何看待这个处境',
    '希望与恐惧': '在此交织的希望与恐惧',
    '最终结果':   '这条路最终通向',
    '潜意识影响': '在表面下悄然运作、塑造着一切的力量',
    '过去基础':   '引发这一切的根源体验',
    '潜在未来':   '在你面前展开的道路',
    '指引':       '这张牌给你的直接指引',
  };
  const posNote = posFramesCN[positionCN] || '在这个位置';
  const frame   = q ? `${posNote}——在"${q}"的语境下——` : `${posNote}——`;

  // For XYJ deck, append the official handbook character & lore as a styled note
  let xyjSupplement = '';
  if (xyjLore) {
    xyjSupplement = `<br><span style="color:var(--accent2,#b8860b);font-size:.83em;font-style:italic">☯ ${xyjLore.character}</span>`;
  }

  // Build Waite symbol note (non-XYJ)
  let loreSupplement = '';
  if (!xyjLore && loreText) {
    const waiteSymCN = lore.sym ? `【韦特象征：${lore.symCN || lore.sym}】` : '';
    loreSupplement = waiteSymCN
      ? `<br><span style="color:var(--text2);font-size:.83em;font-style:italic">${waiteSymCN}</span>`
      : '';
  }

  // Body: for XYJ, use official lore text; otherwise use card meaning
  let body;
  if (xyjLore) {
    const xyjKeywords = reversed ? xyjLore.reversed : xyjLore.upright;
    const xyjText = xyjLore.lore;
    body = (topicNote ? topicNote : '') + xyjText;
  } else {
    body = topicNote ? `${topicNote}${cnMeaning}` : cnMeaning;
  }

  return `${frame}<strong>${name}${reversed ? '（逆位）' : ''}</strong>·<em>${kw1}${kw2 ? `·${kw2}` : ''}</em>`
    + (xyjSupplement || loreSupplement)
    + `<br><br>${body}`;
}

function appendReading(idx) {
  const entry = drawnEntries[idx];
  if (!entry) return;
  const { card, position, reversed } = entry;
  const d = reversed ? card.reversed : card.upright;
  const question = document.getElementById('q-input').value.trim();
  const topic = detectTopic(question);
  const out = document.getElementById('readings-output');

  const div = document.createElement('div');
  div.className = `rcb ${reversed ? 'reversed' : 'upright'}`;
  div.id = 'rcb-' + idx;
  div.style.animationDelay = (idx * 0.07) + 's';

  const kwArr = d.kw.split(',').map(k => `<span class="kw">${k.trim()}</span>`).join('');
  const kwCNArr = d.kwCN.split('·').map(k => `<span class="kw">${k.trim()}</span>`).join('');

  // Context-aware narrative
  const narrative = buildCardNarrative(card, reversed, position.en, question, topic);
  const narrativeCN = buildCardNarrativeCN(card, reversed, position.cn, question, topic);

  div.innerHTML = `
    <div class="rcb-head">
      <img class="rcb-img${reversed ? ' reversed-img' : ''} img-skeleton"
           src="${cardImg(card.id)}" alt="${lang === 'zh' ? card.nameCN : card.name}" loading="lazy"
           onload="this.classList.remove('img-skeleton')"
           onerror="this.style.display='none'">
      <div class="rcb-meta">
        <div class="rcb-pos">${t(position.en, position.cn)}</div>
        <div class="rcb-title">
          ${lang === 'zh' ? card.nameCN : card.name}
          ${reversed ? `<span class="rcb-rev">${t('Reversed','逆位')}</span>` : ''}
        </div>
        <div class="rcb-kws">${lang === 'zh' ? kwCNArr : kwArr}</div>
      </div>
    </div>
    <div class="rcb-meaning">${lang === 'zh' ? narrativeCN : narrative}</div>
  `;
  out.appendChild(div);

  // Wire the card slot in the spread row → click to jump back to this reading
  const slot = document.getElementById('sel-slot-' + idx);
  const wrap = document.getElementById('flip-wrap-' + idx);
  if (slot) slot.classList.add('revealed');
  if (wrap) {
    wrap.style.cursor = 'pointer';
    wrap.onclick = () => {
      document.getElementById('rcb-' + idx)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    wrap.title = t('Jump to reading', '跳转到解读');
  }
}

// ─── Daily Card ───────────────────────────────────────────────────────────────
function getUserId() {
  let uid = localStorage.getItem('tarot-uid');
  if (!uid) {
    uid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('tarot-uid', uid);
  }
  return uid;
}

function initDailyCard() {
  const today = new Date().toISOString().slice(0, 10);
  const uid = getUserId();
  const saved = JSON.parse(localStorage.getItem('tarot-daily') || 'null');
  let entry = saved && saved.date === today && saved.uid === uid ? saved : null;
  if (!entry) {
    // Per-user daily seed: hash date + userId
    const raw = today + uid;
    let seed = 0;
    for (let i = 0; i < raw.length; i++) seed = ((seed << 5) - seed + raw.charCodeAt(i)) | 0;
    seed = Math.abs(seed);
    const card = DECK[seed % DECK.length];
    const reversed = seed % 7 < 2;
    entry = { date: today, uid, id: card.id, reversed };
    localStorage.setItem('tarot-daily', JSON.stringify(entry));
  }
  const card = DECK.find(c => c.id === entry.id);
  if (!card) return;
  window._dailyEntry = entry;
  const d = entry.reversed ? card.reversed : card.upright;
  const banner = document.getElementById('daily-banner');
  const dailyImgEl = document.getElementById('daily-img');
  dailyImgEl.src = cardImg(card.id);
  dailyImgEl.dataset.cardId = card.id;
  document.getElementById('daily-name').textContent = (lang === 'zh' ? card.nameCN : card.name) + (entry.reversed ? t(' (Reversed)', '（逆位）') : '');
  document.getElementById('daily-kw').textContent = lang === 'zh' ? d.kwCN : d.kw;
  document.getElementById('daily-label').textContent = t("Today's Card · " + today, '今日之牌 · ' + today);
  document.getElementById('daily-tap-hint').textContent = t('Tap to see today\'s energy guidance ▾', '点击查看今日能量指引 ▾');
  banner.style.display = 'flex';
  document.getElementById('daily-reading').style.display = 'none';
}

function toggleDailyReading() {
  const el = document.getElementById('daily-reading');
  if (el.style.display !== 'none') {
    el.style.display = 'none';
    return;
  }
  const entry = window._dailyEntry;
  if (!entry) return;
  const card = DECK.find(c => c.id === entry.id);
  if (!card) return;

  // Build daily energy reading from Waite lore
  const lore = (typeof WAITE_LORE !== 'undefined') ? WAITE_LORE[(typeof waiteId === 'function') ? waiteId(card.id) : card.id] : null;
  const dir = entry.reversed ? 'rev' : 'up';
  const d = entry.reversed ? card.reversed : card.upright;

  let html = '';
  if (lang === 'zh') {
    html += `<div style="color:var(--gold);font-size:.85rem;margin-bottom:.5rem">✦ 今日能量指引</div>`;
    html += `<p><b>核心关键词：</b>${d.kwCN}</p>`;
    if (d.meaningCN) html += `<p>${d.meaningCN}</p>`;
    if (lore) {
      const cn = dir + 'CN';
      html += `<p><b>韦特意象：</b>${lore.symCN || lore.sym}</p>`;
      html += `<p><b>牌意：</b>${entry.reversed ? '逆位 — ' : ''}${lore[cn] || lore[dir]}</p>`;
      if (lore.advice) html += `<p style="color:var(--gold2)"><b>今日建议：</b>${lore.advice[cn] || lore.advice[dir]}</p>`;
      if (lore.work) html += `<p><b>工作方面：</b>${lore.work[cn] || lore.work[dir]}</p>`;
      if (lore.love) html += `<p><b>感情方面：</b>${lore.love[cn] || lore.love[dir]}</p>`;
    }
  } else {
    html += `<div style="color:var(--gold);font-size:.85rem;margin-bottom:.5rem">✦ Today's Energy Guidance</div>`;
    html += `<p><b>Core keywords:</b> ${d.kw}</p>`;
    if (d.meaning) html += `<p>${d.meaning}</p>`;
    if (lore) {
      html += `<p><b>Waite imagery:</b> ${lore.sym}</p>`;
      html += `<p><b>Meaning:</b> ${entry.reversed ? 'Reversed — ' : ''}${lore[dir]}</p>`;
      if (lore.advice) html += `<p style="color:var(--gold2)"><b>Today's advice:</b> ${lore.advice[dir]}</p>`;
      if (lore.work) html += `<p><b>At work:</b> ${lore.work[dir]}</p>`;
      if (lore.love) html += `<p><b>In love:</b> ${lore.love[dir]}</p>`;
    }
  }

  el.innerHTML = html;
  el.style.display = 'block';
}

function dismissDaily() {
  document.getElementById('daily-banner').style.display = 'none';
  document.getElementById('daily-reading').style.display = 'none';
}

// ─── Guide Modal ──────────────────────────────────────────────────────────────
function openGuide() {
  applyGuideI18n();
  document.getElementById('guide-modal').classList.add('open');
}
function closeGuide() {
  document.getElementById('guide-modal').classList.remove('open');
}
function applyGuideI18n() {
  if (lang !== 'zh') return; // English is default text in HTML
  const map = {
    'guide-title':       '☽ 塔罗神谕 · 使用指南',
    'guide-lbl-what':    '什么是塔罗？',
    'guide-p-what1':     '塔罗是一套78张牌——每张都是人类经验的镜子。22张大阿尔卡那讲述灵魂旅程的故事；56张小阿尔卡那透过四个牌组映照日常生活：权杖（火·意志）、圣杯（水·情感）、宝剑（风·思维）、星币（土·身体）。',
    'guide-p-what2':     '塔罗不预测固定的未来——它揭示你处境中已然存在的能量、模式与可能性。一次占卜，是你的潜意识与牌上符号之间的对话。',
    'guide-lbl-ask':     '如何提出好问题',
    'guide-li-1':        '<b>开放式问题效果最好。</b>"我的事业现在是什么能量？"比"我能得到这份工作吗？"揭示更多。',
    'guide-li-2':        '<b>用"我"的视角提问。</b>询问你自己的能量和选择——而非他人会怎么做。',
    'guide-li-3':        '<b>描述具体的处境，</b>而非你期望的答案。牌回应的是诚实。',
    'guide-li-4':        '<b>不需要问题也可以占卜。</b>你可以带着开放的心抽牌，让牌自己说话。',
    'guide-examples':    '✦ "这段感情我需要了解什么？" · "我的能量在哪里受阻？" · "这件事的课题是什么？" · "这个月我应该专注于什么？"',
    'guide-lbl-ritual':  '营造合适的空间',
    'guide-p-ritual1':   '塔罗在你放慢脚步、真正到场时效果最好。你不需要蜡烛或水晶——你需要的是临在。',
    'guide-li-r1':       '开始前做三次缓慢的深呼吸',
    'guide-li-r2':       '手机静音，关闭其他标签页',
    'guide-li-r3':       '在心中持守你的问题——不要急着打字，让它沉淀',
    'guide-li-r4':       '当牌扇展开时，停顿一下，留意哪些牌吸引了你的注意',
    'guide-li-r5':       '解读结束后，与涌现的感受同在——不要急着用理智解释',
    'guide-lbl-spreads': '选择牌阵',
    'guide-li-s1':       '<b>单张牌</b> — 每日焦点、快速答案、是非题',
    'guide-li-s2':       '<b>时间之流</b> — 过去 / 现在 / 未来；处境 / 行动 / 结果',
    'guide-li-s3':       '<b>爱情十字</b> — 你与另一人之间的关系动态',
    'guide-li-s4':       '<b>二择一</b> — 在两条明确的路之间做决定时',
    'guide-li-s5':       '<b>马蹄铁</b> — 七张牌的全面视角，含隐藏影响与建议',
    'guide-li-s6':       '<b>凯尔特十字</b> — 经典十张牌深度解读；适合复杂处境',
    'guide-li-s7':       '<b>生命之树</b> — 卡巴拉体系；适合灵性与人生使命类问题',
    'guide-p-spreads2':  '神谕会根据你的问题推荐牌阵——你随时可以更改。',
    'guide-begin-btn':   '✦ 开始占卜 ✦',
    'guide-btn':         '☽ 什么是塔罗？',
  };
  for (const [id, text] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = text;
  }
}


// ─── Restart ──────────────────────────────────────────────────────────────────
function resetReading() {
  drawnEntries = []; readingsRevealed = []; chatHistory = [];
  _userManualSpread = false;
  document.getElementById('readings-output').innerHTML = '';
  document.getElementById('chat-section').style.display = 'none';
  const slots = document.getElementById('selected-slots');
  slots.innerHTML = '';
  slots.className = 'selected-slots';
  document.getElementById('selected-row').style.display = 'none';
  document.getElementById('reveal-btn').style.display = 'none';
  document.getElementById('fan-stage-wrap').style.display = 'none';
  document.getElementById('q-input').value = '';
  document.getElementById('spread-recommend').style.display = 'none';
  document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('recommended'));
  const btn = document.getElementById('shuffle-btn');
  btn.textContent = t('✦ SHUFFLE & SPREAD ✦', '✦ 洗牌开始 ✦');
  btn.disabled = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── All revealed → Oracle synthesis ─────────────────────────────────────────
function onAllRevealed() {
  document.getElementById('reveal-btn').style.display = 'none';
  // Scroll to the first reading card
  const firstRcb = document.querySelector('#readings-output .rcb');
  if (firstRcb) firstRcb.scrollIntoView({ behavior: 'smooth', block: 'start' });
  generateOracleSummary();
}

function generateOracleSummary() {
  const question = document.getElementById('q-input').value.trim();
  const spread = SPREADS[currentSpread];
  const out = document.getElementById('readings-output');

  // Remove any existing summary block and its preceding divider to prevent duplicates on retry
  const existing = document.getElementById('summary-block');
  if (existing) {
    const prev = existing.previousElementSibling;
    if (prev && prev.classList.contains('reading-divider')) prev.remove();
    existing.remove();
  }
  // Also remove stale save button (will be re-added by openChatSection)
  out.querySelectorAll('.save-reading-btn').forEach(b => b.remove());

  const div = document.createElement('div');
  div.className = 'reading-divider';
  div.textContent = t('· · ✦ THE ORACLE SPEAKS ✦ · ·', '· · ✦ 神谕开口 ✦ · ·');
  out.appendChild(div);

  const summaryBlock = document.createElement('div');
  summaryBlock.className = 'summary-block';
  summaryBlock.id = 'summary-block';
  summaryBlock.innerHTML = `<h3>${t('✦ Oracle\'s Reading', '✦ 神谕解读')}</h3>
    <div class="summary-text" id="summary-text"><em>${t('The Oracle is contemplating…','神谕正在沉思…')}</em></div>`;
  out.appendChild(summaryBlock);
  summaryBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const prompt = buildSummaryPrompt(question, spread);

  if (aiSettings.engine === 'builtin') {
    const { en, cn } = buildSmartBuiltinSummary(question, spread);
    document.getElementById('summary-text').innerHTML = lang === 'zh' ? cn : en;
    appendBackToCardsBtn(summaryBlock);
    showTipBanner();
    openChatSection(prompt);
  } else {
    streamAIResponse(prompt, 'summary-text', () => {
      appendBackToCardsBtn(summaryBlock);
      showTipBanner();
      openChatSection(prompt);
    });
  }
}

function appendBackToCardsBtn(summaryBlock) {
  const btn = document.createElement('button');
  btn.className = 'back-to-cards-btn';
  btn.innerHTML = t('↑ Back to cards', '↑ 回到牌面');
  btn.onclick = () => {
    const firstRcb = document.querySelector('#readings-output .rcb');
    (firstRcb || document.getElementById('readings-output'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  summaryBlock.appendChild(btn);

  const shareBtn = document.createElement('button');
  shareBtn.className = 'back-to-cards-btn';
  shareBtn.style.marginLeft = '.6rem';
  shareBtn.innerHTML = t('⎘ Copy Reading', '⎘ 复制占卜');
  shareBtn.onclick = shareReading;
  summaryBlock.appendChild(shareBtn);

  const exportBtn = document.createElement('button');
  exportBtn.className = 'back-to-cards-btn';
  exportBtn.style.marginLeft = '.6rem';
  exportBtn.innerHTML = t('⬇ Save Image', '⬇ 保存图片');
  exportBtn.onclick = exportImage;
  summaryBlock.appendChild(exportBtn);
}

function exportImage() {
  if (typeof html2canvas === 'undefined') { notify(t('Export unavailable','导出不可用')); return; }
  notify(t('Generating image…','生成图片中…'));

  // Build a wrapper that includes the card spread + readings
  const selectedRow = document.getElementById('selected-row');
  const readingsOutput = document.getElementById('readings-output');
  if (!readingsOutput) { notify(t('Export unavailable','导出不可用')); return; }

  // Create a temp container with both sections for capture
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'background:#13102a;padding:20px 24px;max-width:860px;font-family:Georgia,serif;';

  // Header
  const question = document.getElementById('q-input').value.trim();
  const spread = SPREADS[currentSpread];
  const hdr = document.createElement('div');
  hdr.style.cssText = 'text-align:center;margin-bottom:16px;';
  hdr.innerHTML = `<div style="color:#c9a84c;font-size:1rem;letter-spacing:.2em;margin-bottom:6px">✦ TAROT ORACLE ✦</div>${question ? `<div style="color:#b8a9d0;font-size:.8rem;font-style:italic">"${question}"</div>` : ''}`;
  wrapper.appendChild(hdr);

  // Cards section clone
  if (selectedRow && selectedRow.style.display !== 'none') {
    const cardsClone = selectedRow.cloneNode(true);
    cardsClone.style.cssText = 'margin-bottom:20px;overflow:visible;';
    // Remove labels/buttons that shouldn't appear
    cardsClone.querySelectorAll('.back-to-cards-btn').forEach(el => el.remove());
    wrapper.appendChild(cardsClone);
  }

  // Readings clone
  const readingsClone = readingsOutput.cloneNode(true);
  readingsClone.querySelectorAll('.back-to-cards-btn, .save-reading-btn').forEach(el => el.remove());
  wrapper.appendChild(readingsClone);

  document.body.appendChild(wrapper);

  html2canvas(wrapper, {
    backgroundColor: '#13102a',
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    onclone: (clonedDoc) => {
      // Strip CSS animations so elements aren't frozen at opacity:0 (fadeUp start state)
      const fix = clonedDoc.createElement('style');
      fix.textContent = `
        * { animation: none !important; transition: none !important; }
        .rcb, .summary-block, .reading-divider {
          opacity: 1 !important;
          transform: none !important;
        }
      `;
      clonedDoc.head.appendChild(fix);
    },
  }).then(canvas => {
    document.body.removeChild(wrapper);
    const link = document.createElement('a');
    const date = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
    link.download = `tarot-reading-${date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    notify(t('Image saved!','图片已保存！'));
  }).catch(() => {
    if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
    notify(t('Export failed — try screenshot instead','导出失败，请手动截图'));
  });
}

function shareReading() {
  const question = document.getElementById('q-input').value.trim();
  const spread = SPREADS[currentSpread];
  const lines = [];
  const date = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US');

  lines.push(t('✦ ✦ ✦  TAROT ORACLE READING  ✦ ✦ ✦', '✦ ✦ ✦  塔罗神谕占卜记录  ✦ ✦ ✦'));
  lines.push(date);
  lines.push(t(`Spread: ${spread.name}`, `牌阵：${spread.nameCN}`));
  if (question) lines.push(t(`Question: "${question}"`, `问题：「${question}」`));
  lines.push('');
  lines.push(t('─── CARDS DRAWN ───', '─── 抽取的牌 ───'));
  lines.push('');

  // Per-card readings
  drawnEntries.forEach((e, idx) => {
    const d = e.reversed ? e.card.reversed : e.card.upright;
    const name = lang === 'zh' ? e.card.nameCN : e.card.name;
    const pos  = lang === 'zh' ? e.position.cn : e.position.en;
    const rev  = e.reversed ? t(' (Reversed)', '（逆位）') : '';
    const kw   = lang === 'zh' ? d.kwCN : d.kw;
    lines.push(`【${pos}】${name}${rev}`);
    lines.push(t(`Keywords: ${kw}`, `关键词：${kw}`));
    const rcbMeaning = document.querySelector(`#rcb-${idx} .rcb-meaning`);
    if (rcbMeaning) {
      const text = rcbMeaning.textContent.trim();
      if (text) lines.push(text);
    }
    lines.push('');
  });

  // Oracle synthesis
  const summaryText = document.getElementById('summary-text');
  const placeholder = t('The Oracle is contemplating…', '神谕正在沉思…');
  if (summaryText) {
    const oracle = summaryText.textContent.trim();
    if (oracle && oracle !== placeholder) {
      lines.push(t('─── ORACLE\'S INTERPRETATION ───', '─── 神谕综合解读 ───'));
      lines.push('');
      lines.push(oracle);
      lines.push('');
    }
  }

  // Chat conversation
  const chatMsgs = chatHistory.filter(m => m.role !== 'system');
  if (chatMsgs.length > 0) {
    lines.push(t('─── FOLLOW-UP CONVERSATION ───', '─── 继续问神谕 ───'));
    lines.push('');
    chatMsgs.forEach(m => {
      if (m.role === 'user') {
        lines.push(t(`You: ${m.content}`, `你：${m.content}`));
      } else if (m.role === 'assistant') {
        lines.push(t(`Oracle: ${m.content}`, `神谕：${m.content}`));
      }
      lines.push('');
    });
  }

  lines.push('─────────────────────────────');
  lines.push(t('Reading by Tarot Oracle · zennni.github.io/tarot-oracle-from-joy/', '占卜来自塔罗神谕 · zennni.github.io/tarot-oracle-from-joy/'));

  const text = lines.join('\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => notify(t('Full reading copied!', '完整占卜已复制！')));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    notify(t('Full reading copied!', '完整占卜已复制！'));
  }
}

function buildSummaryPrompt(question, spread) {
  const topic = detectTopic(question);
  const isXYJ = window.__deckStyle === 'xiyouji';

  // Build per-card context — XYJ deck uses official handbook lore
  const cardLines = drawnEntries.map(e => {
    const waiteLore = (typeof getWaiteLore === 'function') ? getWaiteLore(e.card.id, e.reversed, topic) : '';
    const kwLine = (e.reversed ? e.card.reversed.kw : e.card.upright.kw);
    const meaningLine = (e.reversed ? e.card.reversed.meaning : e.card.upright.meaning);
    let line = `【${t(e.position.en, e.position.cn)}】${e.card.name}（${e.card.nameCN}）${e.reversed ? ' 逆位' : ' 正位'}`;

    if (isXYJ && typeof XYJ_LORE !== 'undefined' && XYJ_LORE[e.card.id]) {
      const xl = XYJ_LORE[e.card.id];
      line += `\n  西游记角色/场景：${xl.character}`;
      line += `\n  ${e.reversed ? '逆位含义' : '正位含义'}：${e.reversed ? xl.reversed : xl.upright}`;
      line += `\n  官方手册解读：${xl.lore}`;
    } else if (waiteLore) {
      line += `\n  韦特传统：${waiteLore}`;
    } else {
      line += `\n  关键词：${kwLine}`;
      if (meaningLine) line += `\n  牌义：${meaningLine}`;
    }
    return line;
  }).join('\n\n');

  const xyjContext = isXYJ ? `
══════════════════════════════════════
本次占卜使用「西游记塔罗牌」官方设定手册解读。
本套牌将《西游记》的78个关键人物与场景深度映射到韦特体系——
  棍（权杖·火）：孙悟空的意志、金箍棒的变化形态，象征行动力与被压制后的反弹
  瓶（圣杯·水）：净瓶与甘露，观音、唐僧、女儿国的情感线，象征慈悲与内在关系
  剑（宝剑·风）：天庭法剑与裁断，代表真相、冲突、因果裁决
  丹（星币·土）：太上老君金丹炉、人参果、修炼积累，代表物质与世间事

解读要求：
- 上方每张牌已提供官方手册中的西游记场景与解读文本，请以此为核心展开解牌
- 让西游记的人物故事与提问者的现实处境产生真实共鸣，而非只是列举故事情节
- 不必每张牌都重复"这张牌的场景是…"这样的格式，像在讲故事、在对话
══════════════════════════════════════
` : '';

  return `${getPersonaSystem()}
${xyjContext}
你是一位有着二十年以上经验的塔罗占卜师，精通韦特牌传统，也深谙人心。你不是在机械地解释牌义，而是在和一个真实的人对话——他们带着真实的困惑、焦虑、期待来到你面前。${isXYJ ? '你正在使用「西游记塔罗牌」，每张牌都有其独特的西游记场景设定，请以上方提供的官方手册解读为基础，让古典名著的人物智慧照进提问者的现实。' : ''}

提问者的问题："${question || '（无具体问题——综合解读）'}"

牌阵：${spread.name}
问题领域：${topic}

抽到的牌：
${cardLines}

【解读方式——像真正的占卜师那样说话】

真正好的占卜师不会念关键词清单，也不会每张牌都用同一个句式开头。他们这样解牌：

1. 先说你看到这个牌阵时的第一感受——整体气场、核心张力是什么？像一句真心话说出来，不是在介绍牌
2. 解每张牌时，把它和提问者的具体处境连接起来。牌在"过去"位置与在"建议"位置说的是完全不同的话
3. 把几张牌的关系读出来：哪两张在呼应？哪张在和另一张较劲？大阿尔卡那多意味着命运在推动；逆位集中意味着能量在内转
4. 逆位牌不是简单的"坏"——它可能是内化的、受阻的、正在萌发的力量。在具体语境里解读
5. 结尾给一个真实可用的建议——不是"保持开放心态"这种空话，而是"在接下来一个月内，你需要特别注意……"

说话风格：用"你"，温暖但直接。不美化困难的牌，但永远指出主动权在哪里。不要用"然而"、"因此"、"综上所述"这类书面语开头。不要用编号列表——用流畅的段落说话，像在面对面交谈。

${lang === 'zh' ? '请全程用简体中文回答。第一次提到牌名时同时写出中文名和英文名。语言要有温度、有质感，像一位经验丰富的老师在和你说心里话，而不是在背课文。' : 'Respond in English.'}
字数控制在400-500字——每一句都要有重量，不要用废话填充。`;
}

// ─── Smart built-in oracle ────────────────────────────────────────────────────
function buildSmartBuiltinSummary(question, spread) {
  const topic = detectTopic(question);
  const entries = drawnEntries;
  const q = question || '';
  const uprightCount = entries.filter(e => !e.reversed).length;
  const reversedCount = entries.length - uprightCount;
  const dominantSuit = getDominantSuit(entries);
  const suitWisdom = getSuitWisdom(dominantSuit);

  const first = entries[0];
  const last  = entries[entries.length - 1];
  const mid   = entries.length > 2 ? entries[Math.floor(entries.length / 2)] : null;

  const firstD  = first.reversed ? first.card.reversed : first.card.upright;
  const lastD   = last.reversed  ? last.card.reversed  : last.card.upright;
  const firstKw = firstD.kw.split(',')[0].trim();
  const lastKw  = lastD.kw.split(',')[0].trim();
  const firstKwCN = firstD.kwCN.split('·')[0].trim();
  const lastKwCN  = lastD.kwCN.split('·')[0].trim();

  // ── Openings — speak TO the person about their real situation ──────────────
  const openings = {
    love: {
      en: q ? `What you're really asking, beneath the words of "${q}", is whether genuine connection is possible — or whether the distance you feel is real. The cards don't give reassurance. They give honesty.`
            : `Something in you is ready to look clearly at love right now. The cards respond to that readiness.`,
      cn: q ? `你真正在问的，隐藏在"${q}"这些文字之下的，是真实的连接是否还可能——还是你感受到的距离是真实的。这些牌不给安慰，它们给你的是诚实。`
            : `你内心有一部分准备好了清晰地看待感情。这些牌回应的正是这份准备。`
    },
    career: {
      en: q ? `"${q}" — underneath this question is a deeper one: am I on the right path, and is what I'm building actually mine? The cards see this layer too.`
            : `Your professional energy has arrived at a turning point. The cards see where you are clearly.`,
      cn: q ? `"${q}"——这个问题之下藏着一个更深的问题：我走在正确的路上吗？我正在建立的东西真的是我想要的吗？这些牌也看见了这一层。`
            : `你的职业能量已经到了一个转折点。这些牌清晰地看见了你现在的位置。`
    },
    decision: {
      en: q ? `You already sense the answer to "${q}" — you've sensed it for a while. The cards aren't here to tell you what to choose. They're here to show you what you're actually afraid to choose.`
            : `At every real crossroads, the hardest part isn't making the choice — it's being willing to see clearly what you're actually choosing between.`,
      cn: q ? `关于"${q}"，你其实已经隐约感知到答案了——有一段时间了。这些牌不是来替你做决定的。它们是来让你看清，你真正害怕选择的是什么。`
            : `每一个真实的十字路口，最难的部分不是做出选择——而是愿意清晰地看见你真正在什么之间做选择。`
    },
    health: {
      en: q ? `Your body doesn't lie. "${q}" — perhaps you've been wondering whether to listen more deeply. The cards say: yes, and here's what it's telling you.`
            : `Body and inner life are always in conversation. What you've brought to these cards today is part of that dialogue.`,
      cn: q ? `身体不会说谎。"${q}"——也许你一直在想，是否该更深地倾听它。这些牌说：是的，而且它在告诉你这些。`
            : `身体与内在生命一直在对话。你今天带给这些牌的，就是那段对话的一部分。`
    },
    family: {
      en: q ? `Family questions carry the weight of years — patterns, unspoken things, love tangled with expectation. "${q}" is no exception. The cards see beneath the surface.`
            : `Family is where we learn our first stories about worth and belonging. These cards ask: which of those stories are you still living by?`,
      cn: q ? `家庭的问题承载着多年的重量——模式、未说出口的事、与期待交织的爱。"${q}"也不例外。这些牌看见了表面之下的东西。`
            : `家庭是我们学习关于价值与归属的最初故事的地方。这些牌在问：你仍在按照哪些故事生活？`
    },
    spiritual: {
      en: q ? `"${q}" has arrived now for a reason. Growth rarely waits for a convenient moment. The cards see exactly where you are on this path.`
            : `The soul tends to arrive at questions before the mind has words for them. These cards speak to precisely that.`,
      cn: q ? `"${q}"在此刻到来不是偶然的。成长很少等待方便的时机。这些牌清晰地看见了你在这条路上的位置。`
            : `灵魂总是在心智找到措辞之前就先抵达了问题。这些牌正是在说这件事。`
    },
    general: {
      en: q ? `You brought "${q}" to the cards. What they return is not a prediction — it's a mirror, reflecting the energies already moving through your life.`
            : `There are no accidental draws. Whatever brought you here today, the cards respond with what is most relevant right now.`,
      cn: q ? `你把"${q}"带给了这些牌。它们回赠的不是预言——而是一面镜子，映照出已经在你生命中流动的能量。`
            : `没有偶然的抽牌。无论什么将你带到这里，这些牌以当下最相关的东西作答。`
    }
  };
  const opening = (openings[topic] || openings.general);

  // ── Card arc — per-card Waite readings ───────────────────────────────────
  const flowDir   = uprightCount > reversedCount ? 'with clear forward momentum' : reversedCount > uprightCount ? 'through significant inner friction' : 'between clarity and complexity';
  const flowDirCN = uprightCount > reversedCount ? '具有清晰的前进动能' : reversedCount > uprightCount ? '伴随着显著的内在摩擦' : '在清明与复杂之间';

  const cardBlocksEn = entries.map(e => {
    const lore = (typeof WAITE_LORE !== 'undefined') ? WAITE_LORE[waiteId(e.card.id)] : null;
    const d    = e.reversed ? e.card.reversed : e.card.upright;
    const sym  = lore?.sym  || '';
    const meaning = lore ? (e.reversed ? lore.rev : lore.up) : d.meaning;
    return `<p><strong>${e.card.name}${e.reversed ? ' (Reversed)' : ''}</strong> · ${e.position.en}`
      + (sym ? ` — <em>${sym}</em>` : '')
      + `<br>${meaning}</p>`;
  }).join('');

  const cardBlocksCN = entries.map(e => {
    const d = e.reversed ? e.card.reversed : e.card.upright;
    return `<p><strong>${e.card.nameCN}${e.reversed ? '（逆位）' : ''}</strong>（${e.position.cn}）`
      + `<br>${d.meaningCN}</p>`;
  }).join('');

  const arcEn = `The cards lay out a reading ${flowDir}:<br>${cardBlocksEn}`;
  const arcCN = `这些牌呈现了一次${flowDirCN}的解读：<br>${cardBlocksCN}`;

  // ── Energy read ────────────────────────────────────────────────────────────
  const energyEn = reversedCount === 0
    ? `All cards upright: the energy is genuinely open and moving. This doesn't mean the path is effortless — it means conditions are aligned and your next honest step will land.`
    : reversedCount > uprightCount
    ? `More reversed than upright cards points to something important: the outer situation may feel stuck, but the real work right now is internal. Resistance, looked at honestly, becomes direction.`
    : `A balance of upright and reversed: real progress is possible, but something internal needs honest attention alongside any outer moves you make. Both are true at the same time.`;

  const energyCN = reversedCount === 0
    ? `所有牌均为正位：能量真正开放，正在流动。这不意味着道路毫不费力——而是说条件已经对齐，你诚实的下一步会落地。`
    : reversedCount > uprightCount
    ? `逆位多于正位，这指向了一件重要的事：外部处境可能感觉停滞，但现在真正的工作在内部。阻力，被诚实地看见时，就成为了方向。`
    : `正逆位平衡：真实的进展是可能的，但与你做出的任何外部行动同步，有些内在的事情需要诚实地关注。两者同时为真。`;

  const guidanceEn = buildGuidanceEn(topic, entries, question);
  const guidanceCN = buildGuidanceCN(topic, entries, question);

  const en = `<p>${opening.en}</p>
<p>${arcEn}${dominantSuit !== 'mixed' ? ' ' + suitWisdom.en : ''}</p>
<p>${energyEn}</p>
<p><strong>The oracle's guidance:</strong> ${guidanceEn}</p>
<p><em>Ask me anything — about a specific card, your next step, or what these cards mean for your real situation.</em></p>`;

  const cn = `<p>${opening.cn}</p>
<p>${arcCN}${dominantSuit !== 'mixed' ? ' ' + suitWisdom.cn : ''}</p>
<p>${energyCN}</p>
<p><strong>神谕的指引：</strong>${guidanceCN}</p>
<p><em>你可以继续问——关于某张具体的牌、你的下一步，或这些牌对你真实处境意味着什么。</em></p>`;

  return { en, cn };
}

function getDominantSuit(entries) {
  const counts = { wands: 0, cups: 0, swords: 0, pentacles: 0, major: 0 };
  entries.forEach(e => { if (e.card.suit) counts[e.card.suit]++; });
  const max = Math.max(...Object.values(counts));
  if (max < 2) return 'mixed';
  return Object.keys(counts).find(k => counts[k] === max) || 'mixed';
}

function getSuitWisdom(suit) {
  const wisdom = {
    wands:     { en: 'The prevalence of Wands points to a situation driven by passion, will, and creative fire — act, but with intention.', cn: '权杖牌的主导暗示这是一个由激情、意志和创造之火驱动的处境——行动，但要有意图。' },
    cups:      { en: 'The prominence of Cups signals that emotions, relationships, and inner feeling are the true terrain of this question.', cn: '圣杯牌的突出表明，情感、关系和内在感受才是这个问题的真实领域。' },
    swords:    { en: 'Many Swords suggest that clarity of thought, honest communication, and mental courage are what this situation demands.', cn: '大量宝剑牌暗示，这个处境需要思维的清明、诚实的沟通和精神上的勇气。' },
    pentacles: { en: 'The Pentacles\' presence grounds this reading in the practical world — tangible steps, steady effort, and material reality are key.', cn: '星币牌的存在将这次解读扎根于现实世界——切实的步骤、稳定的努力和物质现实是关键。' },
    major:     { en: 'Multiple Major Arcana cards signal that this is a significant, soul-level moment — larger forces are at work here.', cn: '多张大阿尔卡纳牌表明这是一个重大的、灵魂层面的时刻——更大的力量在此运作。' },
    mixed:     { en: '', cn: '' }
  };
  return wisdom[suit] || wisdom.mixed;
}

function buildGuidanceEn(topic, entries, question) {
  const e0    = entries[0];
  const eLast = entries[entries.length - 1];
  const d0    = e0.reversed    ? e0.card.reversed    : e0.card.upright;
  const dLast = eLast.reversed ? eLast.card.reversed : eLast.card.upright;
  const firstKw = d0.kw.split(',')[0].trim();
  const lastKw  = dLast.kw.split(',')[0].trim();
  const q = question ? `"${question}"` : 'this situation';

  const base = {
    love: `In love, the most courageous thing you can do right now is not strategy — it's honesty. The energy of <em>${firstKw}</em> is where you need to start: with yourself. What do you actually want, and have you been willing to say it clearly — to yourself first? ${lastKw !== firstKw ? `The cards point from <em>${firstKw}</em> toward <em>${lastKw}</em> — that movement is the relationship's real arc.` : "Once you're honest with yourself, your next move in the relationship will be obvious."}`,
    career: `Don't wait for the perfect moment or the full plan. The energy of <em>${firstKw}</em> is what you have access to right now — that's what to move with. In ${q}, one concrete, specific step this week matters more than the entire strategy. ${lastKw !== firstKw ? `Keep <em>${lastKw}</em> as your destination: it's already showing up.` : 'Take the next available step that aligns with this energy.'}`,
    health: `Your body communicates through sensation long before symptoms arrive. Right now, it's asking for <em>${firstKw}</em>. The most powerful thing you can do is make one honest commitment to your wellbeing this week — not a grand overhaul, but something specific and doable. What would honouring <em>${firstKw}</em> look like in a single day?`,
    decision: `The answer to ${q} is not missing — it's being obscured by something. The cards point to <em>${firstKw}</em> as what needs to come first: get quiet enough to hear your own deepest knowing, separate from what others expect or what seems logical. ${lastKw !== firstKw ? `Then move with <em>${lastKw}</em>. That sequence — internal clarity first, then action — is what makes this choice land well.` : `Once you can feel <em>${firstKw}</em> clearly in yourself, the path becomes visible.`}`,
    family: `In family dynamics, the most powerful change rarely comes from confrontation — it comes from one person shifting how they show up. The quality of <em>${firstKw}</em> is what this situation needs from you. Not from them — from you. What would it look like to embody <em>${firstKw}</em> in your next real interaction, without waiting for them to change first?`,
    spiritual: `Your growth right now is calling for <em>${firstKw}</em> — not as a concept but as a lived experience. This is a time to trust the slower, quieter forms of knowing. Journaling, sitting in silence, or simply staying with what feels unresolved without rushing to fix it — these are not passive. They are the work. ${lastKw !== firstKw ? `The movement is from <em>${firstKw}</em> toward <em>${lastKw}</em>: let that arc be your guide.` : ''}`,
    general: `The quality this reading circles back to is <em>${firstKw}</em>. Whatever your next step in ${q}, bring this consciously. ${lastKw !== firstKw ? `The arc moves from <em>${firstKw}</em> toward <em>${lastKw}</em> — let that guide your choices over the coming days.` : `Trust what you already sense to be true. You know more than you're giving yourself credit for.`}`
  };

  return base[topic] || base.general;
}

function buildGuidanceCN(topic, entries, question) {
  const e0    = entries[0];
  const eLast = entries[entries.length - 1];
  const d0    = e0.reversed    ? e0.card.reversed    : e0.card.upright;
  const dLast = eLast.reversed ? eLast.card.reversed : eLast.card.upright;
  const firstKw = d0.kwCN.split('·')[0].trim();
  const lastKw  = dLast.kwCN.split('·')[0].trim();
  const q = question ? `"${question}"` : '这件事';

  const base = {
    love: `在感情中，你现在能做的最勇敢的事不是谋略——而是诚实。<em>${firstKw}</em>是你需要从自己开始的地方：你真正想要什么，你愿意清楚地说出来吗——先对自己说？${lastKw !== firstKw ? `牌指向从<em>${firstKw}</em>走向<em>${lastKw}</em>——那个移动就是这段关系真实的弧线。` : '一旦你对自己诚实，你在这段关系中的下一步就会变得显而易见。'}`,
    career: `不要等待完美的时机或完整的计划。<em>${firstKw}</em>的能量是你现在就可以调用的——就用它来行动。在${q}上，本周一个具体的、特定的步骤，比整个战略都重要。${lastKw !== firstKw ? `以<em>${lastKw}</em>作为你的目的地：它已经在显现了。` : '迈出下一个与这种能量相符的、你力所能及的步骤。'}`,
    health: `你的身体在症状出现之前早就通过感知在沟通了。现在，它在寻求<em>${firstKw}</em>。你能做的最有力的事是本周对自己的健康做出一个诚实的具体承诺——不是大规模改革，而是某件具体可行的事。让<em>${firstKw}</em>在一天之内是什么样子？`,
    decision: `${q}的答案不是缺失的——它被某些东西遮蔽了。这些牌指向<em>${firstKw}</em>需要先来：让自己安静到足以听见自己最深的声音，与他人的期待和看似合理的逻辑分开来听。${lastKw !== firstKw ? `然后以<em>${lastKw}</em>行动。这个顺序——先内在清明，再行动——才能让这个选择落地得好。` : `一旦你能在自己身上清晰地感受到<em>${firstKw}</em>，道路就会变得可见。`}`,
    family: `在家庭动态中，最有力的改变很少来自对抗——它来自一个人改变自己的出现方式。<em>${firstKw}</em>的品质是这个处境需要从你这里得到的，不是从他们那里——是从你这里。在下一次真实互动中，不等他们先改变，你来体现<em>${firstKw}</em>，会是什么样子？`,
    spiritual: `你现在的成长在呼唤<em>${firstKw}</em>——不是作为概念，而是作为活生生的体验。这是信任更缓慢、更安静的知晓方式的时刻。写日记、在寂静中坐着，或者单纯地与还未解决的事共处而不急于修复——这些不是被动的，这就是工作本身。${lastKw !== firstKw ? `这一运动从<em>${firstKw}</em>走向<em>${lastKw}</em>：让那条弧线作为你的引导。` : ''}`,
    general: `这次解读反复指向的品质是<em>${firstKw}</em>。无论你在${q}上的下一步是什么，有意识地带入这一点。${lastKw !== firstKw ? `这一弧线从<em>${firstKw}</em>走向<em>${lastKw}</em>——让它在接下来的日子里引导你的选择。` : `信任你已经隐约感知到的真相。你知道的比你给自己的信任要多。`}`
  };

  return base[topic] || base.general;
}

function getPersonaSystem() {
  const p = PERSONAS[aiSettings.persona] || PERSONAS.healer;
  return lang === 'zh' ? p.systemCN : p.systemEN;
}

// ─── AI streaming ─────────────────────────────────────────────────────────────
async function streamAIResponse(prompt, targetId, onDone) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.innerHTML = `<em>${t('The Oracle is gazing into the cards…','神谕正在凝视牌阵…')}</em>`;
  try {
    if (aiSettings.engine === 'claude') {
      await streamClaude(prompt, el, onDone);
    } else {
      const prov = AI_PROVIDERS[aiSettings.engine];
      if (!prov) { if (onDone) onDone(); return; }
      const { url, model } = resolveEndpoint();
      if (!url) throw new Error(t('No API URL configured — set a relay/base URL in settings.', '未配置 API 网址——请在设置中填写中转站/接口地址。'));
      await streamOpenAICompat(url, model, aiSettings.apiKey, prompt, el, onDone);
    }
  } catch (err) {
    const { url, model } = resolveEndpoint();
    const hint = aiSettings.engine === 'custom'
      ? t('Check: ① URL must include the full path (e.g. /v1/chat/completions) ② Model name must be filled in ③ API key is correct',
          '检查：① URL 需含完整路径（如 /v1/chat/completions）② 自定义模型名不能为空 ③ API 密钥正确')
      : t('Check your API key in settings.', '请在设置中检查 API 密钥。');
    el.innerHTML = `<em style="color:var(--red)">${t('The Oracle is silent.','神谕沉默。')}</em>
<div style="margin:.5rem 0;padding:.45rem .7rem;background:rgba(200,50,50,.12);border:1px solid rgba(255,80,80,.3);border-radius:4px;font-size:.78rem;color:#ff9a9a;word-break:break-all;line-height:1.55">
  <b>${t('Error:','错误：')}</b> ${err.message || t('Unknown error','未知错误')}
</div>
<div style="font-size:.75rem;color:var(--text2);margin-bottom:.5rem;line-height:1.55">${hint}</div>
<button onclick="generateOracleSummary()" style="margin-top:.2rem;padding:.35rem 1rem;border:1px solid var(--gold);background:transparent;color:var(--gold);cursor:pointer;border-radius:2px;font-family:Georgia,serif;font-size:.78rem">${t('↺ Retry','↺ 点击重试')}</button>
<button onclick="openSettings()" style="margin:.2rem 0 0 .5rem;padding:.35rem 1rem;border:1px solid rgba(201,168,76,.4);background:transparent;color:var(--text2);cursor:pointer;border-radius:2px;font-family:Georgia,serif;font-size:.78rem">${t('⚙ Settings','⚙ 设置')}</button>`;
    // hide any stale chat section so it also rebuilds cleanly on retry
    document.getElementById('chat-section').style.display = 'none';
    if (onDone) onDone();
  }
}

async function streamClaude(prompt, el, onDone) {
  const { url, model } = resolveClaudeEndpoint();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': aiSettings.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({ model, max_tokens: 1024, stream: true, messages: [{ role: 'user', content: prompt }] })
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  el.innerHTML = '';
  el.setAttribute('data-streaming', '1');
  const reader = res.body.getReader(), dec = new TextDecoder();
  let buf = '', full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n'); buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const p = JSON.parse(line.slice(6));
        if (p.type === 'content_block_delta' && p.delta?.text) {
          full += p.delta.text;
          el.innerHTML = renderAIText(full);
        }
      } catch {}
    }
  }
  el.removeAttribute('data-streaming');
  if (!full.trim()) el.innerHTML += `<em style="color:var(--text2)">${t('…(response truncated)','…（回应中断）')}</em>`;
  if (onDone) onDone();
}

async function streamOpenAICompat(url, model, apiKey, prompt, el, onDone) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({ model, stream: true, messages: [{ role: 'user', content: prompt }] })
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  el.innerHTML = '';
  el.setAttribute('data-streaming', '1');
  const reader = res.body.getReader(), dec = new TextDecoder();
  let buf = '', full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n'); buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const p = JSON.parse(line.slice(6));
        const delta = p.choices?.[0]?.delta?.content;
        if (delta) { full += delta; el.innerHTML = renderAIText(full); }
      } catch {}
    }
  }
  el.removeAttribute('data-streaming');
  if (!full.trim()) el.innerHTML += `<em style="color:var(--text2)">${t('…(response truncated)','…（回应中断）')}</em>`;
  if (onDone) onDone();
}

// ─── Streaming chat (follow-up) ───────────────────────────────────────────────
async function streamChatAI(history, el) {
  const system = history.find(m => m.role === 'system')?.content || '';
  const sysPrefix = getPersonaSystem() + '\n\n';
  const chatDirective = '\n\nIMPORTANT: The initial reading has ALREADY been delivered. In follow-up conversation:\n- Do NOT repeat or re-summarize card meanings, symbolism, or interpretations already given\n- Focus directly and concisely on the querent\'s NEW question\n- Add NEW insights, deeper layers, practical advice, or connections not mentioned before\n- If they ask about a specific card, go DEEPER — don\'t restate what was said, explore what wasn\'t\n- Keep responses focused (150-250 words) — this is a conversation, not another full reading\n';
  if (aiSettings.engine === 'claude') {
    const msgs = history.filter(m => m.role !== 'system');
    return await streamClaudeMessages(msgs, sysPrefix + system + chatDirective, el);
  }
  const { url, model } = resolveEndpoint();
  if (!url) throw new Error(t('No API URL configured — set a relay/base URL in settings.', '未配置 API 网址——请在设置中填写中转站/接口地址。'));
  const msgs = history.map((m, i) =>
    m.role === 'system' ? { role: 'system', content: sysPrefix + m.content + chatDirective } : m
  );
  return await streamOpenAICompatMessages(url, model, aiSettings.apiKey, msgs, el);
}

async function streamClaudeMessages(messages, system, el) {
  const { url, model } = resolveClaudeEndpoint();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': aiSettings.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({ model, max_tokens: 800, stream: true, system, messages })
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  el.innerHTML = '';
  el.setAttribute('data-streaming', '1');
  const reader = res.body.getReader(), dec = new TextDecoder();
  let buf = '', full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n'); buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const p = JSON.parse(line.slice(6));
        if (p.type === 'content_block_delta' && p.delta?.text) {
          full += p.delta.text;
          el.innerHTML = renderAIText(full);
        }
      } catch {}
    }
  }
  el.removeAttribute('data-streaming');
  if (!full.trim()) el.innerHTML += `<em style="color:var(--text2)">${t('…(response truncated)','…（回应中断）')}</em>`;
  return full;
}

async function streamOpenAICompatMessages(url, model, apiKey, messages, el) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({ model, stream: true, messages })
  });
  if (!res.ok) throw new Error(`${res.status}`);
  el.innerHTML = '';
  el.setAttribute('data-streaming', '1');
  const reader = res.body.getReader(), dec = new TextDecoder();
  let buf = '', full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n'); buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const d = line.slice(6).trim();
      if (d === '[DONE]') break;
      try {
        const p = JSON.parse(d);
        const delta = p.choices?.[0]?.delta?.content;
        if (delta) { full += delta; el.innerHTML = renderAIText(full); }
      } catch {}
    }
  }
  el.removeAttribute('data-streaming');
  if (!full.trim()) el.innerHTML += `<em style="color:var(--text2)">${t('…(response truncated)','…（回应中断）')}</em>`;
  return full;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
function openChatSection(systemContext) {
  const section = document.getElementById('chat-section');
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  const provLabels = { builtin: t('Built-in Oracle','内置神谕'), claude: 'Claude', openai: 'GPT-4o', grok: 'Grok', deepseek: 'DeepSeek', qwen: '通义千问', zhipu: '智谱 GLM', minimax: 'MiniMax', gemini: 'Gemini', kimi: 'Kimi', doubao: '豆包', custom: t('Custom / Relay','自定义 / 中转站') };
  const cm = (aiSettings.customModel || '').trim();
  document.getElementById('chat-model-label').textContent = cm || provLabels[aiSettings.engine] || '';
  chatHistory = [{ role: 'system', content: systemContext }];

  // Clear previous messages
  document.getElementById('chat-messages').innerHTML = '';

  const personaIntros = {
    mirror:      { en: 'The cards are laid. What do you see in them that you haven\'t yet said aloud?', cn: '牌已展开。你在其中看见了什么，是你还没说出口的？' },
    astrologer:  { en: 'The celestial tableau is set. The stars have spoken through these cards — ask what you seek to know.', cn: '星象已定，天意借牌而言。你有何所问，尽可道来。' },
    healer:      { en: 'I\'ve read your spread. There\'s a lot here — take your time. What part of this feels most true to you right now?', cn: '我已解读了你的牌阵。这里有很多值得深入的。你现在感觉哪个部分最触动你？' },
    philosopher: { en: 'The unconscious has spoken through these cards. What it reveals is rarely comfortable. What are you prepared to look at honestly?', cn: '潜意识已借牌发言。它揭示的往往令人不安。你准备好诚实地看见什么？' },
  };
  const pi = personaIntros[aiSettings.persona] || personaIntros.healer;
  addChatMsg('oracle', lang === 'zh' ? pi.cn : pi.en);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-reading-btn';
  saveBtn.textContent = t('✦ Save This Reading ✦','✦ 保存此次占卜 ✦');
  saveBtn.onclick = saveReading;
  document.getElementById('readings-output').appendChild(saveBtn);

  const restartBtn = document.createElement('button');
  restartBtn.className = 'save-reading-btn';
  restartBtn.style.cssText = 'background:transparent;border-color:rgba(201,168,76,.25);color:var(--text2);margin-top:.4rem';
  restartBtn.textContent = t('↺ New Reading','↺ 重新占卜');
  restartBtn.onclick = resetReading;
  document.getElementById('readings-output').appendChild(restartBtn);
}

function addChatMsg(role, text) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.innerHTML = renderAIText(text);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  addChatMsg('user', msg);
  chatHistory.push({ role: 'user', content: msg });

  const sendBtn = document.getElementById('chat-send');
  sendBtn.disabled = true;

  if (aiSettings.engine === 'builtin') {
    const reply = buildSmartChatReply(msg);
    const div = addChatMsg('oracle', '');
    await typeText(div, reply);
    chatHistory.push({ role: 'assistant', content: reply });
  } else {
    const div = addChatMsg('oracle', '');
    try {
      const full = await streamChatAI(chatHistory, div);
      chatHistory.push({ role: 'assistant', content: full || div.textContent });
    } catch (err) {
      const retryMsg = msg;
      div.innerHTML = `<span style="color:var(--red)">${t('The Oracle is silent — check your API key.','神谕沉默——请检查API密钥。')}</span><br><button onclick="(()=>{this.closest('.msg').remove();document.getElementById('chat-input').value=${JSON.stringify(retryMsg)};sendChat()})()" style="margin-top:.5rem;padding:.3rem .9rem;border:1px solid var(--gold);background:transparent;color:var(--gold);cursor:pointer;border-radius:2px;font-family:Georgia,serif;font-size:.75rem">${t('↺ Retry','↺ 点击重试')}</button>`;
    }
  }
  sendBtn.disabled = false;
  document.getElementById('chat-messages').scrollTop = 9999;
}

async function callAIChat(history) {
  const messages = history.filter(m => m.role !== 'system');
  const system = history.find(m => m.role === 'system')?.content || '';
  const chatRule = '\nThe initial reading was already delivered. Do NOT repeat card meanings or symbolism. Focus on the querent\'s new question with fresh, deeper insight. Keep it concise (150-250 words).';
  if (aiSettings.engine === 'claude') {
    const { url, model } = resolveClaudeEndpoint();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': aiSettings.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model, max_tokens: 600, system: 'You are a wise, deeply insightful tarot oracle. Context: ' + system + chatRule, messages })
    });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data.content?.[0]?.text || '';
  } else {
    const { url, model } = resolveEndpoint();
    if (!url) throw new Error('No API URL configured');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + aiSettings.apiKey },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: 'You are a wise, deeply insightful tarot oracle. ' + system + chatRule }, ...messages] })
    });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }
}

// Built-in chat reply — grounded in Waite lore for the drawn cards
function buildSmartChatReply(question) {
  const q = question.toLowerCase();
  const userQ = document.getElementById('q-input').value.trim();
  const entries = drawnEntries;

  // Pick the most relevant card based on keywords in the follow-up
  let focusEntry = entries[0];
  if (entries.length > 1) {
    if (q.match(/past|过去/))      focusEntry = entries.find(e => /past/i.test(e.position.en))      || entries[0];
    else if (q.match(/future|未来/)) focusEntry = entries.find(e => /future/i.test(e.position.en))   || entries[entries.length - 1];
    else if (q.match(/challenge|挑战/)) focusEntry = entries.find(e => /challenge/i.test(e.position.en)) || entries[1];
    else if (q.match(/outcome|result|结果/)) focusEntry = entries.find(e => /outcome/i.test(e.position.en)) || entries[entries.length - 1];
  }

  const fc    = focusEntry.card;
  const fd    = focusEntry.reversed ? fc.reversed : fc.upright;
  const lore  = (typeof WAITE_LORE !== 'undefined') ? WAITE_LORE[waiteId(fc.id)] : null;
  const loreMeaning = lore ? (focusEntry.reversed ? lore.rev : lore.up) : fd.meaning;
  const loreSym     = lore?.sym || '';
  const fkw   = fd.kw.split(',')[0].trim();
  const fkwCN = fd.kwCN.split('·')[0].trim();

  // All cards summary for default reply
  const allCards = entries.map(e => {
    const ld = (typeof WAITE_LORE !== 'undefined') ? WAITE_LORE[waiteId(e.card.id)] : null;
    const d2  = e.reversed ? e.card.reversed : e.card.upright;
    const m   = ld ? (e.reversed ? ld.rev : ld.up) : d2.meaning;
    const mCN = d2.meaningCN;
    return { nameEN: e.card.name + (e.reversed ? ' (R)' : ''), nameCN: e.card.nameCN + (e.reversed ? '（逆）' : ''), pos: e.position, m, mCN };
  });

  const persona = aiSettings.persona || 'healer';

  if (q.match(/why|reason|cause|为什么|原因|为何/)) {
    return t(
      `${fc.name} (${focusEntry.position.en}) points to the root of this.${loreSym ? ` Waite's image: ${loreSym}.` : ''} ${loreMeaning} This energy didn't arrive suddenly — it has been shaping the situation over time.${persona === 'mirror' ? ' What within you already knows this to be true?' : persona === 'philosopher' ? ' The question is not why it happened — but why you have allowed it to continue.' : persona === 'astrologer' ? ' The stars rarely bring what is undeserved — what lesson has this pattern been preparing you for?' : ' What within you already knows this to be true?'}`,
      `${fc.nameCN}（${focusEntry.position.cn}）指向了这件事的根源。${fd.meaningCN} 这种能量不是突然出现的——它一直在塑造这个处境。${persona === 'mirror' ? '你内心已经知道这是真的，那部分是什么？' : persona === 'philosopher' ? '问题不是它为何发生，而是你为何允许它持续。' : persona === 'astrologer' ? '天意鲜少带来不该承受的事——这个模式一直在为你准备什么课题？' : '你内心已经知道这是真的，那部分是什么？'}`
    );
  }

  if (q.match(/what should i do|how|action|step|该怎么|怎么办|建议|下一步|怎么做/)) {
    return t(
      `${fc.name} in the ${focusEntry.position.en} position speaks directly to this.${loreSym ? ` ${loreSym}.` : ''} ${loreMeaning} The most important move is rarely the most dramatic one — it's the honest one you can take today.`,
      `${fc.nameCN}（${focusEntry.position.cn}）直接指向了行动的方向。${fd.meaningCN} 最重要的那一步，往往不是最戏剧性的那个，而是今天就能诚实迈出的那个。`
    );
  }

  if (q.match(/when|time|timing|how long|什么时候|多久|时机/)) {
    return t(
      `Tarot speaks in energies, not dates. ${fc.name} (${focusEntry.position.en}) is ${focusEntry.reversed ? 'still turning inward — outer movement may need the inner work to complete first' : 'active and outward-moving — conditions are ripening now'}. ${loreMeaning}`,
      `塔罗以能量说话，不以日期。${fc.nameCN}（${focusEntry.position.cn}）${focusEntry.reversed ? '仍在向内——外部行动可能需要先完成内在的功课' : '正向外流动——条件已在成熟'}。${fd.meaningCN}`
    );
  }

  if (q.match(/yes|no|will|can|是否|会不会|能不能|可以吗/)) {
    const favour = entries.filter(e => !e.reversed).length > entries.length / 2;
    return t(
      `The cards don't answer yes or no — they describe energy. The spread is ${favour ? 'predominantly upright — the current moves toward resolution' : 'showing significant reversal — something needs to shift internally before the outer picture clarifies'}. ${fc.name} especially says: ${loreMeaning}`,
      `这些牌不以是否作答——它们描述能量。牌阵${favour ? '以正位为主——潮流正朝解决方向流动' : '显示出明显的逆位——在外部清晰之前，需要一些内在的转化'}。${fc.nameCN}尤其说明：${fd.meaningCN}`
    );
  }

  if (q.match(/meaning|tell me more|explain|more about|什么意思|解释|说说|详细|这张牌/)) {
    return t(
      `${fc.name}${focusEntry.reversed ? ' (Reversed)' : ''} — ${loreSym ? loreSym + ' ' : ''}${loreMeaning}`,
      `${fc.nameCN}${focusEntry.reversed ? '（逆位）' : ''}——${fd.meaningCN}`
    );
  }

  // Default: weave all cards — persona-coloured closing
  const cardLines = allCards.map(c => t(`${c.nameEN} (${c.pos.en}): ${c.m}`, `${c.nameCN}（${c.pos.cn}）：${c.mCN}`)).join('\n');
  const defaults = {
    mirror:      { en: `${cardLines}\n\nThe thread is ${fkw}. Where in your life right now do you already feel this — but haven't acted on it?`, cn: `${cardLines}\n\n贯穿这些牌的线索是${fkwCN}。你现在生活中的哪个地方，已经感受到这一点却还没有行动？` },
    astrologer:  { en: `The stars have arranged themselves thus:\n${cardLines}\n\nThe celestial thread is ${fkw}. The cosmos asks — are you prepared to receive what is already moving toward you?`, cn: `星象如此排列：\n${cardLines}\n\n天意的脉络是${fkwCN}。宇宙在问——你准备好接纳已经向你涌来的东西了吗？` },
    healer:      { en: `${cardLines}\n\nWhat I notice across all of these is ${fkw}. That's not a small thing. What does it feel like to hear that named directly?`, cn: `${cardLines}\n\n我注意到贯穿这一切的是${fkwCN}。这不是小事。听到这个被直接说出来，你感觉怎样？` },
    philosopher: { en: `${cardLines}\n\nThe archetype running through this spread is ${fkw} — likely the very thing you have most resisted integrating. The shadow always costs more when left in the dark.`, cn: `${cardLines}\n\n贯穿这次牌阵的原型是${fkwCN}——很可能正是你最抗拒整合的那部分。阴影若留在黑暗中，代价总是更高。` },
  };
  const d = defaults[persona] || defaults.healer;
  return lang === 'zh' ? d.cn : d.en;
}

async function typeText(el, text) {
  el.textContent = '';
  for (const ch of text) {
    el.textContent += ch;
    await new Promise(r => setTimeout(r, 10));
  }
}

// ─── History ──────────────────────────────────────────────────────────────────
function saveReading() {
  const question = document.getElementById('q-input').value.trim();
  const spread = SPREADS[currentSpread];
  // Save chatHistory excluding the system message (re-built on restore) but keep the conversation
  const savedChat = chatHistory.filter(m => m.role !== 'system');
  const entry = {
    id: Date.now(), date: new Date().toLocaleString(),
    spread: t(spread.name, spread.nameCN),
    question: question || t('No question specified','未指定问题'),
    cards: drawnEntries.map(e => ({
      name: e.card.name, nameCN: e.card.nameCN,
      posEn: e.position.en, posCN: e.position.cn,
      reversed: e.reversed, id: e.card.id,
      kw: e.reversed ? e.card.reversed.kw : e.card.upright.kw
    })),
    chatHistory: savedChat
  };
  const history = JSON.parse(localStorage.getItem('tarot-history') || '[]');
  history.unshift(entry);
  localStorage.setItem('tarot-history', JSON.stringify(history.slice(0, 50)));
  notify(t('Reading saved!','占卜已保存！'));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('history-list');
  const history = JSON.parse(localStorage.getItem('tarot-history') || '[]');
  if (!history.length) {
    list.innerHTML = `<div class="hist-empty">${t(
      'No readings saved yet. Complete a reading and save it to see it here.',
      '尚无保存的占卜记录。完成占卜并保存，即可在此查看。')}</div>`;
    return;
  }
  list.innerHTML = history.map(e => `
    <div class="hi" onclick="loadHistoryEntry(${e.id})">
      <div class="hi-row1">
        <span class="hi-date">${e.date}</span>
        <span class="hi-spread">${e.spread}</span>
      </div>
      <div class="hi-q">"${e.question}"</div>
      <div class="hi-cards">${e.cards.map(c => `${c.name}${c.reversed ? ' (' + t('Rev','逆') + ')' : ''}`).join(' · ')}</div>
    </div>`).join('');
}

function loadHistoryEntry(id) {
  const history = JSON.parse(localStorage.getItem('tarot-history') || '[]');
  const entry = history.find(e => e.id === id);
  if (!entry) return;
  showPanel('reading');
  document.getElementById('q-input').value =
    (entry.question === 'No question specified' || entry.question === '未指定问题') ? '' : entry.question;

  const spread = Object.values(SPREADS).find(s => s.name === entry.spread || s.nameCN === entry.spread);
  drawnEntries = entry.cards.map((c, i) => {
    const card = DECK.find(d => d.id === c.id);
    return { card, position: spread ? spread.positions[i] : { en: c.posEn, cn: c.posCN }, reversed: c.reversed };
  }).filter(e => e.card);

  readingsRevealed = [];
  document.getElementById('fan-stage-wrap').style.display = 'none';
  document.getElementById('selected-slots').innerHTML = '';
  document.getElementById('selected-row').style.display = 'none';
  document.getElementById('reveal-btn').style.display = 'none';
  document.getElementById('chat-section').style.display = 'none';
  document.getElementById('readings-output').innerHTML = '';

  drawnEntries.forEach((_, i) => { readingsRevealed.push(i); appendReading(i); });
  setTimeout(() => {
    const systemContext = buildSummaryPrompt(entry.question, spread || SPREADS.single);
    openChatSection(systemContext);
    // Restore saved conversation (excluding system message already set by openChatSection)
    if (entry.chatHistory && entry.chatHistory.length > 0) {
      // openChatSection already added the persona intro; replace chat messages with saved ones
      document.getElementById('chat-messages').innerHTML = '';
      chatHistory = [{ role: 'system', content: systemContext }];
      entry.chatHistory.forEach(m => {
        const role = m.role === 'assistant' ? 'oracle' : m.role;
        addChatMsg(role, m.content);
        chatHistory.push(m);
      });
    }
  }, 400);
}

function clearHistory() {
  if (!confirm(t('Clear all reading history?','清除所有占卜记录？'))) return;
  localStorage.removeItem('tarot-history');
  renderHistory();
  notify(t('History cleared.','历史已清除。'));
}

// ─── Settings ─────────────────────────────────────────────────────────────────
// ─── Deck style ───────────────────────────────────────────────────────────────
const DECK_STYLE_DESC = {
  rws:      { en: 'Rider-Waite-Smith (1909): richly illustrated scenes, the most widely used tarot deck worldwide.', cn: '韦特牌（1909年）：每张小牌均有完整人物场景，全球最广泛使用的塔罗牌。' },
  marseille:{ en: 'Tarot de Marseille: French classical woodcut style, 1760 Conver restoration. Minor arcana use abstract pip arrangements.', cn: '马赛塔罗：法国古典木刻画风，1760年版本。小牌为符号排列，无人物场景。' },
  xiyouji:  { en: 'Journey to the West Tarot (2025): Chinese gongbi painting style. 78 cards reimagined through the classic novel\'s characters and scenes. AI readings incorporate the JttW handbook.', cn: '西游记塔罗（2025）：传统中国工笔重彩风格，以《西游记》人物与情节重新演绎78张牌。选用此牌面时，AI解读将结合西游记场景与韦特牌义双重视角。' },
  cartoon:  { en: 'Cartoon Hand-drawn Tarot (2024): fresh, vibrant illustration style with expressive characters and lively colors.', cn: '卡通手绘风塔罗（2024）：清新明亮的手绘卡通风格，人物表情生动，色彩活泼，适合日常占卜。' },
  hj:       { en: 'Black & Gold Hand-drawn Tarot (2024): mysterious black-gold aesthetic, fine-line illustrations with golden details on deep backgrounds.', cn: '黑金手绘风塔罗（2024）：神秘黑金美学，细腻线描与金色细节相映生辉，充满仪式感与古典氛围。' },
  cat:      { en: 'Meow Tarot (2024): a full 78-card deck starring chubby cats — bold outlines, flat vivid colors, adorably deadpan faces. The Waite system reimagined as cats; light-hearted and healing.', cn: '喵喵塔罗（2024）：肥嘟嘟的白猫演绎全套78张——粗描线条、明快平涂、表情呆萌，把韦特体系画成一群憨态可掬的猫咪，轻松治愈，适合日常抽牌。' }
};

function setDeckStyle(style) {
  window.__deckStyle = style;
  localStorage.setItem('tarot-deck-style', style);
  // Update toggle button states
  document.querySelectorAll('.deck-style-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.style === style);
  });
  // Update description text
  const descEl = document.getElementById('deck-style-desc');
  if (descEl) { const d = DECK_STYLE_DESC[style] || DECK_STYLE_DESC.rws; descEl.textContent = lang === 'zh' ? d.cn : d.en; }
  // Refresh card back images everywhere
  const backUrl = (typeof cardBackImg === 'function') ? cardBackImg() : null;
  document.querySelectorAll('.fc-back-img, .cf-back-img').forEach(img => {
    if (backUrl) { img.src = backUrl; img.style.display = 'block'; }
    else         { img.style.display = 'none'; }
  });
  document.querySelectorAll('.fc-back, .cf-back').forEach(el => {
    el.style.backgroundImage = backUrl ? 'none' : '';
  });
  // Refresh all visible card face images
  drawnEntries.forEach((e, i) => {
    const front = document.getElementById('cf-front-' + i);
    if (front) {
      const img = front.querySelector('img');
      if (img) img.src = cardImg(e.card.id);
    }
    const rcbImg = document.querySelector('#rcb-' + i + ' .rcb-img');
    if (rcbImg) rcbImg.src = cardImg(e.card.id);
  });
  // Refresh daily card image
  const dailyImg = document.getElementById('daily-img');
  if (dailyImg && dailyImg.dataset.cardId) dailyImg.src = cardImg(+dailyImg.dataset.cardId);
}

function initDeckStyleUI() {
  const style = window.__deckStyle;
  document.querySelectorAll('.deck-style-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.style === style);
  });
  const descEl = document.getElementById('deck-style-desc');
  if (descEl) { const d = DECK_STYLE_DESC[style] || DECK_STYLE_DESC.rws; descEl.textContent = lang === 'zh' ? d.cn : d.en; }
}

function openSettings()  { document.getElementById('settings-modal').classList.add('open'); initDeckStyleUI(); }
function closeSettings() { document.getElementById('settings-modal').classList.remove('open'); }

function openSupport()  { document.getElementById('support-modal').classList.add('open'); }
function closeSupport() { document.getElementById('support-modal').classList.remove('open'); }

let _tipDismissed = false;
function showTipBanner() {
  if (_tipDismissed) return;
  const b = document.getElementById('tip-banner');
  if (b) b.classList.add('visible');
}
function dismissTipBanner() {
  _tipDismissed = true;
  const b = document.getElementById('tip-banner');
  if (b) b.classList.remove('visible');
}
function toggleApiKeyVisibility() {
  const inp = document.getElementById('api-key-input');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function onPersonaChange() {
  const p = PERSONAS[document.getElementById('persona-select').value];
  if (!p) return;
  const info = document.getElementById('persona-info');
  if (info) info.innerHTML = `<span class="model-desc-text">${p.desc}</span>`;
}

function onEngineChange() {
  const v = document.getElementById('ai-engine-select').value;
  const isBuiltin = v === 'builtin';
  const isCustom  = v === 'custom';
  document.getElementById('api-key-section').style.display = isBuiltin ? 'none' : 'block';
  document.getElementById('model-section').style.display  = (isBuiltin || isCustom) ? 'none' : 'block';
  const urlSec = document.getElementById('api-url-section');
  // 中转站/自定义接口地址只在「自定义」引擎下出现；其余引擎用各家官方地址。
  if (urlSec) urlSec.style.display = isCustom ? 'block' : 'none';
  const cmSec = document.getElementById('custom-model-section');
  if (cmSec) cmSec.style.display = isBuiltin ? 'none' : 'block';
  if (!isBuiltin && !isCustom) populateModelSelect(v);
}

function populateModelSelect(engine) {
  const sel  = document.getElementById('model-select');
  const models = PROVIDER_MODELS[engine] || [];
  sel.innerHTML = models.map(m => {
    const tl = TAG_LABELS[m.tag] || TAG_LABELS['paid'];
    return `<option value="${m.id}">[${tl.label}] ${m.id}</option>`;
  }).join('');
  // Try to restore previously saved model for this engine
  if (aiSettings.model && models.find(m => m.id === aiSettings.model)) {
    sel.value = aiSettings.model;
  }
  updateModelInfo(engine);
}

function onModelChange() {
  const engine = document.getElementById('ai-engine-select').value;
  updateModelInfo(engine);
}

function updateModelInfo(engine) {
  const sel    = document.getElementById('model-select');
  const info   = document.getElementById('model-info');
  const models = PROVIDER_MODELS[engine] || [];
  const m      = models.find(x => x.id === sel.value);
  if (!m || !info) return;
  const tl = TAG_LABELS[m.tag] || TAG_LABELS['paid'];
  info.innerHTML = `<span class="model-tag ${tl.cls}">${tl.label}</span><span class="model-desc-text">${m.desc}</span>`;
}

function saveSettings() {
  aiSettings.engine  = document.getElementById('ai-engine-select').value;
  aiSettings.apiKey  = document.getElementById('api-key-input').value.trim();
  aiSettings.model   = document.getElementById('model-select').value || '';
  aiSettings.persona = document.getElementById('persona-select').value || 'healer';
  const urlInp = document.getElementById('api-url-input');
  aiSettings.apiUrl = urlInp ? normalizeApiUrl(urlInp.value) : '';
  const cmInp = document.getElementById('custom-model-input');
  aiSettings.customModel = cmInp ? cmInp.value.trim() : '';
  localStorage.setItem('tarot-ai-settings', JSON.stringify(aiSettings));
  closeSettings();
  notify(t('Settings saved.','设置已保存。'));
}

function loadSettings() {
  const saved = localStorage.getItem('tarot-ai-settings');
  if (saved) {
    try { aiSettings = { engine: 'gemini', apiKey: '', model: 'gemini-2.0-flash-exp', persona: 'healer', apiUrl: '', customModel: '', ...JSON.parse(saved) }; } catch {}
  }
  // Always sync UI to aiSettings (including defaults on first load)
  document.getElementById('ai-engine-select').value = aiSettings.engine;
  document.getElementById('api-key-input').value    = aiSettings.apiKey;
  const urlInp = document.getElementById('api-url-input');
  if (urlInp) urlInp.value = aiSettings.apiUrl || '';
  const cmInp = document.getElementById('custom-model-input');
  if (cmInp) cmInp.value = aiSettings.customModel || '';
  const pSel = document.getElementById('persona-select');
  if (pSel) { pSel.value = aiSettings.persona || 'healer'; onPersonaChange(); }
  onEngineChange();
  if (aiSettings.model) {
    const sel = document.getElementById('model-select');
    if ([...sel.options].some(o => o.value === aiSettings.model)) {
      sel.value = aiSettings.model;
      onModelChange();
    }
  }
}

// ─── Settings Export / Import ─────────────────────────────────────────────────
function exportSettings() {
  const data = {
    aiSettings,
    deckStyle: window.__deckStyle,
    lang
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  navigator.clipboard.writeText(encoded).then(() => {
    notify(t('Settings copied to clipboard!', '设置已复制到剪贴板！'));
  }).catch(() => {
    // fallback: show in prompt
    prompt(t('Copy this text to back up your settings:', '复制以下文本以备份设置：'), encoded);
  });
}

async function importSettings() {
  let text;
  try {
    text = await navigator.clipboard.readText();
  } catch {
    text = prompt(t('Paste your exported settings text:', '粘贴之前导出的设置文本：'), '');
  }
  if (!text) return;
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(text.trim()))));
    if (data.aiSettings) {
      aiSettings = { engine: 'gemini', apiKey: '', model: 'gemini-2.0-flash-exp', persona: 'healer', apiUrl: '', customModel: '', ...data.aiSettings };
      localStorage.setItem('tarot-ai-settings', JSON.stringify(aiSettings));
    }
    if (data.deckStyle) {
      setDeckStyle(data.deckStyle);
    }
    if (data.lang) {
      setLang(data.lang);
    }
    loadSettings();
    notify(t('Settings restored!', '设置已恢复！'));
  } catch {
    notify(t('Import failed — invalid data.', '导入失败，数据无效。'));
  }
}

// ─── Gallery ─────────────────────────────────────────────────────────────────
function renderGallery() {
  const container = document.getElementById('gallery-content');
  if (!container || !window._galleryRendered) {
    if (!container) return;
    window._galleryRendered = true;
    container.innerHTML = '';
    const decks = (typeof GALLERY_DECKS !== 'undefined') ? GALLERY_DECKS : [];
    decks.forEach(deck => {
      const section = document.createElement('div');
      section.className = 'gallery-deck-section';
      section.dataset.key = deck.key;

      // Sample cards: show major arcana 0-7 (8 cards)
      const sampleIds = [0, 1, 2, 3, 4, 5, 6, 7];
      const cardGridHtml = sampleIds.map(id => {
        const imgSrc = deck.imgFn(id);
        const cardName = DECK[id] ? DECK[id].nameCN : '';
        return `<div class="gallery-card-thumb">
          <img src="${imgSrc}" alt="${cardName}" loading="lazy" onerror="this.style.display='none'">
          <div class="gallery-card-name">${cardName}</div>
        </div>`;
      }).join('');

      const backHtml = deck.back
        ? `<img class="gallery-back-img" src="${deck.back}" alt="card back">`
        : `<div class="gallery-back-css"></div>`;

      section.innerHTML = `
        <div class="gallery-deck-header" onclick="toggleGallerySection(this)">
          <div class="gallery-deck-info">
            <div class="gallery-deck-name">${deck.name}</div>
            <div class="gallery-deck-year">${deck.year}</div>
          </div>
          <div class="gallery-deck-back-wrap">${backHtml}</div>
          <button class="gallery-use-btn" onclick="event.stopPropagation();setDeckStyle('${deck.key}');closeSettings();notify('${deck.key === 'xiyouji' ? '已切换至西游记塔罗' : deck.key === 'cartoon' ? '已切换至卡通手绘风' : deck.key === 'hj' ? '已切换至黑金手绘风' : deck.key === 'cat' ? '已切换至喵喵塔罗' : deck.key === 'marseille' ? '已切换至马赛塔罗' : '已切换至韦特牌'}')">使用此牌面</button>
          <div class="gallery-expand-icon">▾</div>
        </div>
        <div class="gallery-deck-desc">${deck.desc}</div>
        <div class="gallery-cards-grid" style="display:none">${cardGridHtml}</div>
        <button class="gallery-load-more" style="display:none" onclick="loadMoreGallery(this,'${deck.key}',8)">显示更多牌面 ▾</button>
      `;
      container.appendChild(section);
    });
  }
}

function toggleGallerySection(headerEl) {
  const section = headerEl.closest('.gallery-deck-section');
  const grid = section.querySelector('.gallery-cards-grid');
  const icon = section.querySelector('.gallery-expand-icon');
  const loadMore = section.querySelector('.gallery-load-more');
  const isOpen = grid.style.display !== 'none';
  grid.style.display = isOpen ? 'none' : 'grid';
  if (loadMore) loadMore.style.display = isOpen ? 'none' : 'block';
  if (icon) icon.textContent = isOpen ? '▾' : '▴';
}

function loadMoreGallery(btn, deckKey, startId) {
  const deck = (typeof GALLERY_DECKS !== 'undefined') ? GALLERY_DECKS.find(d => d.key === deckKey) : null;
  if (!deck) return;
  const grid = btn.previousElementSibling;
  const end = Math.min(startId + 14, 22);
  for (let id = startId; id < end; id++) {
    const imgSrc = deck.imgFn(id);
    const cardName = DECK[id] ? DECK[id].nameCN : '';
    const thumb = document.createElement('div');
    thumb.className = 'gallery-card-thumb';
    thumb.innerHTML = `<img src="${imgSrc}" alt="${cardName}" loading="lazy" onerror="this.style.display='none'">
      <div class="gallery-card-name">${cardName}</div>`;
    grid.appendChild(thumb);
  }
  if (end >= 22) btn.style.display = 'none';
  else btn.onclick = () => loadMoreGallery(btn, deckKey, end);
}

// ─── Panels & Notify ─────────────────────────────────────────────────────────
function showPanel(p) {
  document.querySelectorAll('.panel').forEach(el => el.classList.remove('active'));
  document.getElementById('panel-' + p).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-' + p).classList.add('active');
  if (p === 'history') renderHistory();
  if (p === 'gallery') renderGallery();
}

function notify(msg) {
  const n = document.getElementById('notif');
  n.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 2600);
}

document.getElementById('settings-modal').addEventListener('click', function(e) {
  if (e.target === this) closeSettings();
});
