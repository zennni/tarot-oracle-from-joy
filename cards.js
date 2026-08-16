// cards.js — 78-card Rider-Waite deck data
// Images: public-domain Rider-Waite scans via sacred-texts.com / wikimedia

// 韦特牌图片已本地化到 牌面-韦特/（900px WebP，源自维基共享公有领域扫描），
// 避免依赖 upload.wikimedia.org（国内常打不开）并大幅压缩带宽。
const RW_BASE = '牌面-韦特/';
const RW_IMG = {};
for (let i = 0; i < 78; i++) RW_IMG[i] = RW_BASE + String(i).padStart(2, '0') + '.webp';

// Tarot de Marseille — 已本地化到 牌面-马赛/（WebP，公有领域 Conver 1760 修复版，源自 wischik.com）
const MARSEILLE_BASE = '牌面-马赛/';
function cardImgMarseille(id) {
  const n2 = n => String(n).padStart(2, '0');
  if (id < 22) return MARSEILLE_BASE + 'major' + n2(id) + '.webp';
  if (id < 36) return MARSEILLE_BASE + 'clubs'  + n2(id - 21) + '.webp'; // Wands → Clubs
  if (id < 50) return MARSEILLE_BASE + 'cups'   + n2(id - 35) + '.webp';
  if (id < 64) return MARSEILLE_BASE + 'swords' + n2(id - 49) + '.webp';
  return MARSEILLE_BASE + 'coins' + n2(id - 63) + '.webp';              // Pentacles → Coins
}

// ─── 西游记 deck image mapping ───────────────────────────────────────────────
const XYJ_BASE = '牌面-西游记/';
const XYJ_MAJOR = [
  '大阿尔卡那/00_愚者.jpg','大阿尔卡那/01_魔术师.jpg','大阿尔卡那/02_女祭司.jpg',
  '大阿尔卡那/03_皇后.jpg','大阿尔卡那/04_皇帝.jpg','大阿尔卡那/05_教皇.jpg',
  '大阿尔卡那/06_恋人.jpg','大阿尔卡那/07_战车.jpg','大阿尔卡那/08_力量.jpg',
  '大阿尔卡那/09_隐士.jpg','大阿尔卡那/10_命运之轮.jpg','大阿尔卡那/11_正义.jpg',
  '大阿尔卡那/12_倒吊人.jpg','大阿尔卡那/13_死神.jpg','大阿尔卡那/14_节制.jpg',
  '大阿尔卡那/15_恶魔.jpg','大阿尔卡那/16_塔.jpg','大阿尔卡那/17_星星.jpg',
  '大阿尔卡那/18_月亮.jpg','大阿尔卡那/19_太阳.jpg','大阿尔卡那/20_审判.jpg',
  '大阿尔卡那/21_世界.jpg'
];
const XYJ_WANDS = [
  '小阿尔卡那/棍/棍Ace_权杖首牌.jpg','小阿尔卡那/棍/棍二_权杖二.jpg','小阿尔卡那/棍/棍三_权杖三.jpg',
  '小阿尔卡那/棍/棍四_权杖四.jpg','小阿尔卡那/棍/棍五_权杖五.jpg','小阿尔卡那/棍/棍六_权杖六.jpg',
  '小阿尔卡那/棍/棍七_权杖七.jpg','小阿尔卡那/棍/棍八_权杖八.jpg','小阿尔卡那/棍/棍九_权杖九.jpg',
  '小阿尔卡那/棍/棍十_权杖十.jpg','小阿尔卡那/棍/棍童子_权杖侍从.jpg','小阿尔卡那/棍/棍天将_权杖骑士.jpg',
  '小阿尔卡那/棍/棍仙姑_权杖王后.jpg','小阿尔卡那/棍/棍神王_权杖国王.jpg'
];
const XYJ_CUPS = [
  '小阿尔卡那/瓶/瓶Ace_圣杯首牌.jpg','小阿尔卡那/瓶/瓶二_圣杯二.jpg','小阿尔卡那/瓶/瓶三_圣杯三.jpg',
  '小阿尔卡那/瓶/瓶四_圣杯四.jpg','小阿尔卡那/瓶/瓶五_圣杯五.jpg','小阿尔卡那/瓶/瓶六_圣杯六.jpg',
  '小阿尔卡那/瓶/瓶七_圣杯七.jpg','小阿尔卡那/瓶/瓶八_圣杯八.jpg','小阿尔卡那/瓶/瓶九_圣杯九.jpg',
  '小阿尔卡那/瓶/瓶十_圣杯十.jpg','小阿尔卡那/瓶/瓶童子_圣杯侍从.jpg','小阿尔卡那/瓶/瓶天将_圣杯骑士.jpg',
  '小阿尔卡那/瓶/瓶仙姑_圣杯王后.jpg','小阿尔卡那/瓶/瓶神王_圣杯国王.jpg'
];
const XYJ_SWORDS = [
  '小阿尔卡那/剑/剑Ace_宝剑首牌.jpg','小阿尔卡那/剑/剑二_宝剑二.jpg','小阿尔卡那/剑/剑三_宝剑三.jpg',
  '小阿尔卡那/剑/剑四_宝剑四.jpg','小阿尔卡那/剑/剑五_宝剑五.jpg','小阿尔卡那/剑/剑六_宝剑六.jpg',
  '小阿尔卡那/剑/剑七_宝剑七.jpg','小阿尔卡那/剑/剑八_宝剑八.jpg','小阿尔卡那/剑/剑九_宝剑九.jpg',
  '小阿尔卡那/剑/剑十_宝剑十.jpg','小阿尔卡那/剑/剑童子_宝剑侍从.jpg','小阿尔卡那/剑/剑天将_宝剑骑士.jpg',
  '小阿尔卡那/剑/剑仙姑_宝剑王后.jpg','小阿尔卡那/剑/剑神王_宝剑国王.jpg'
];
const XYJ_PENTS = [
  '小阿尔卡那/丹/丹Ace_星币首牌.jpg','小阿尔卡那/丹/丹二_星币二.jpg','小阿尔卡那/丹/丹三_星币三.jpg',
  '小阿尔卡那/丹/丹四_星币四.jpg','小阿尔卡那/丹/丹五_星币五.jpg','小阿尔卡那/丹/丹六_星币六.jpg',
  '小阿尔卡那/丹/丹七_星币七.jpg','小阿尔卡那/丹/丹八_星币八.jpg','小阿尔卡那/丹/丹九_星币九.jpg',
  '小阿尔卡那/丹/丹十_星币十.jpg','小阿尔卡那/丹/丹童子_星币侍从.jpg','小阿尔卡那/丹/丹天将_星币骑士.jpg',
  '小阿尔卡那/丹/丹仙姑_星币王后.jpg','小阿尔卡那/丹/丹神王_星币国王.jpg'
];
function cardImgXYJ(id) {
  if (id < 22) return XYJ_BASE + XYJ_MAJOR[id];
  if (id < 36) return XYJ_BASE + XYJ_WANDS[id - 22];
  if (id < 50) return XYJ_BASE + XYJ_CUPS[id - 36];
  if (id < 64) return XYJ_BASE + XYJ_SWORDS[id - 50];
  return XYJ_BASE + XYJ_PENTS[id - 64];
}

// ─── 卡通手绘风 deck ──────────────────────────────────────────────────────────
const CT_BASE = '牌面-卡通手绘风/';
const CT_MAJOR_NAMES = [
  'The_Fool','The_Magician','The_High_Priestess','The_Empress','The_Emperor','The_Hierophant',
  'The_Lovers','The_Chariot','Strength','The_Hermit','Wheel_of_Fortune','Justice',
  'The_Hangedman','Death','Temperance','The_Devil','The_Tower','The_Star',
  'The_Moon','The_Sun','Judgement','The_World'
];
const CT_NUMS = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
function cardImgCT(id) {
  if (id < 22) return CT_BASE + 'MAJOR ARCANA/MW_' + CT_MAJOR_NAMES[id] + '.jpg';
  let suit, idx;
  if (id < 36)      { suit = 'Wands';     idx = id - 22; }
  else if (id < 50) { suit = 'Cups';      idx = id - 36; }
  else if (id < 64) { suit = 'Swords';    idx = id - 50; }
  else              { suit = 'Pentacles'; idx = id - 64; }
  // Note: actual filename uses "Sword" (not Swords) for Ace of Swords
  const suitFile = (suit === 'Swords' && idx === 0) ? 'Sword' : suit;
  return CT_BASE + 'MINOR ARCANA/MW_' + CT_NUMS[idx] + '_of_' + suitFile + '.jpg';
}

// ─── 黑金手绘风 deck ──────────────────────────────────────────────────────────
const HJ_BASE = '牌面-黑金手绘风/';
const HJ_SUITS = ['权杖组','圣杯组','宝剑组','星币组'];
function cardImgHJ(id) {
  const n4 = n => String(n).padStart(4, '0');
  if (id < 22) return HJ_BASE + '大阿尔卡纳/狐狸素材铺' + n4(id + 1) + '.jpg';
  let suitIdx, idx;
  if (id < 36)      { suitIdx = 0; idx = id - 22; }
  else if (id < 50) { suitIdx = 1; idx = id - 36; }
  else if (id < 64) { suitIdx = 2; idx = id - 50; }
  else              { suitIdx = 3; idx = id - 64; }
  return HJ_BASE + '小阿尔卡纳/' + HJ_SUITS[suitIdx] + '/狐狸素材铺' + n4(idx + 1) + '.jpg';
}

// ─── 喵喵塔罗 deck ─────────────────────────────────────────────────────────
// 文件命名为「NN_中文名.png」(NN = 两位牌 id)，中文名取自 DECK[id].nameCN，故据其拼路径。
const CAT_BASE = '牌面-喵喵塔罗/';
function cardImgCat(id) {
  const nm = (typeof DECK !== 'undefined' && DECK[id]) ? DECK[id].nameCN : '';
  return CAT_BASE + String(id).padStart(2, '0') + '_' + nm + '.webp';
}

// ─── Card back image by deck ──────────────────────────────────────────────────
function cardBackImg() {
  const style = (typeof window !== 'undefined' && window.__deckStyle) || 'rws';
  if (style === 'xiyouji') return '牌面-西游记/牌背.jpg';
  if (style === 'cartoon')  return '牌面-卡通手绘风/牌背.jpg';
  if (style === 'hj')       return '牌面-黑金手绘风/牌背面.jpg';
  if (style === 'cat')      return '牌面-喵喵塔罗/牌背.webp';
  return null; // use CSS gradient for rws / marseille
}

// ─── Gallery card samples (major arcana IDs 0-5 per deck) ────────────────────
const GALLERY_DECKS = [
  {
    key: 'rws', name: '韦特牌 Rider-Waite-Smith', year: '1909',
    back: null, // CSS gradient
    desc: '由亚瑟·爱德华·韦特与帕梅拉·科尔曼·史密斯合作创作，每张小牌均有完整人物场景叙事，是全球最广泛使用的塔罗牌版本。',
    imgFn: id => RW_IMG[id] || ''
  },
  {
    key: 'marseille', name: '法国马赛塔罗 Tarot de Marseille', year: '1760',
    back: null,
    desc: '法国古典木刻画风，源自1760年孔维尔修复版。小牌以符号排列呈现，无具象人物场景，色彩鲜明，线条古朴有力。',
    imgFn: id => cardImgMarseille(id)
  },
  {
    key: 'xiyouji', name: '西游记塔罗', year: '2025',
    back: '牌面-西游记/牌背.jpg',
    desc: '以《西游记》人物与情节重新演绎78张塔罗，传统中国工笔重彩风格。每张牌将西游场景与韦特牌义深度融合，专为中文用户打造。',
    imgFn: id => cardImgXYJ(id)
  },
  {
    key: 'cartoon', name: '卡通手绘风塔罗', year: '2024',
    back: '牌面-卡通手绘风/牌背.jpg',
    desc: '清新可爱的卡通手绘风格，色彩明亮，线条流畅，人物表情生动活泼，适合轻松日常占卜。',
    imgFn: id => cardImgCT(id)
  },
  {
    key: 'hj', name: '黑金手绘风塔罗', year: '2024',
    back: '牌面-黑金手绘风/牌背面.jpg',
    desc: '神秘的黑金手绘美学，以细腻线条勾勒古典意象，金色细节在深色背景上熠熠生辉，充满仪式感与神秘氛围。',
    imgFn: id => cardImgHJ(id)
  },
  {
    key: 'cat', name: '喵喵塔罗 Meow Tarot', year: '2024',
    back: '牌面-喵喵塔罗/牌背.webp',
    desc: '肥嘟嘟的白猫演绎全套78张塔罗——粗描线条、明快平涂、表情呆萌，把韦特体系画成一群憨态可掬的猫咪，轻松治愈，适合日常抽牌。',
    imgFn: id => cardImgCat(id)
  }
];

function cardImg(id) {
  const style = (typeof window !== 'undefined' && window.__deckStyle) || 'rws';
  if (style === 'marseille') return cardImgMarseille(id);
  if (style === 'xiyouji')   return cardImgXYJ(id);
  if (style === 'cartoon')   return cardImgCT(id);
  if (style === 'hj')        return cardImgHJ(id);
  if (style === 'cat')       return cardImgCat(id);
  return RW_IMG[id] || '';
}

// ─── Full 78-card deck ───────────────────────────────────────────────────────

const DECK = [
// ══ MAJOR ARCANA ══
{id:0, name:'The Fool', nameCN:'愚者', suit:'major',
 upright:{kw:'New beginnings, innocence, spontaneity, free spirit', kwCN:'新的开始·纯真·自发·自由精神',
  meaning:'The Fool marks the start of a bold new journey. Brimming with optimism and naïve courage, you stand at the edge of the unknown with faith in the universe. This is a card of unlimited potential—take the leap.',
  meaningCN:'愚者标志着大胆新旅程的开始。满怀乐观与天真的勇气，你站在未知的边缘，信任宇宙。这是一张充满无限潜能的牌——勇敢地迈出那一步吧。'},
 reversed:{kw:'Recklessness, naivety, holding back, poor decisions', kwCN:'鲁莽·幼稚·退缩·糟糕决策',
  meaning:'Reversed, the Fool warns of leaping without looking—acting recklessly or, conversely, letting fear freeze you in place. Examine whether you are being naïve about real risks or sabotaging a genuine opportunity.',
  meaningCN:'逆位愚者警示你不经思考的冲动，或相反地，让恐惧将你冻结原地。审视自己是否在真实风险面前过于天真，或在破坏一个真正的机会。'}},

{id:1, name:'The Magician', nameCN:'魔术师', suit:'major',
 upright:{kw:'Willpower, skill, manifestation, resourcefulness', kwCN:'意志力·技艺·显化·机智',
  meaning:'All four elements sit on the Magician\'s table: fire, water, air, earth. You possess every tool you need. Now is the time to channel focused intention and transform vision into reality.',
  meaningCN:'四种元素摆放在魔术师的桌上：火、水、风、土。你拥有所需的一切工具。现在是集中意图，将愿景转化为现实的时刻。'},
 reversed:{kw:'Manipulation, trickery, wasted talent, illusion', kwCN:'操纵·欺骗·浪费才能·幻觉',
  meaning:'Reversed, the Magician\'s gifts are misdirected—toward manipulation, deceit, or self-sabotage. Scattered energy prevents any real manifestation. Reconnect with authentic purpose.',
  meaningCN:'逆位魔术师的天赋被误导——走向操纵、欺骗或自我破坏。分散的能量阻止任何真实的显化。重新连接真实的目的。'}},

{id:2, name:'The High Priestess', nameCN:'女祭司', suit:'major',
 upright:{kw:'Intuition, mystery, subconscious, inner knowing', kwCN:'直觉·神秘·潜意识·内在知晓',
  meaning:'The High Priestess guards the veil between the seen and unseen. She asks you to be still, listen to the whisper beneath words, and trust what your deeper self already knows.',
  meaningCN:'女祭司守护着可见与不可见之间的面纱。她要求你静下来，倾听言语之下的低语，信任你内心深处已经知晓的一切。'},
 reversed:{kw:'Hidden agendas, repressed intuition, secrets surfacing', kwCN:'隐藏动机·压制直觉·秘密浮现',
  meaning:'Reversed, the High Priestess signals that vital information is being concealed—by others or by your own resistance to hearing the truth. What are you refusing to see?',
  meaningCN:'逆位女祭司暗示重要信息被隐藏——被他人或你自己对真相的抗拒所遮蔽。你在拒绝看到什么？'}},

{id:3, name:'The Empress', nameCN:'女皇', suit:'major',
 upright:{kw:'Fertility, abundance, nature, nurturing, creativity', kwCN:'生育力·丰盛·自然·养育·创造力',
  meaning:'The Empress is the fertile earth herself—abundance, creativity, and loving nurture. Your ideas are seeds ready to bloom. Embrace sensuality, beauty, and the generative power of the natural world.',
  meaningCN:'女皇就是肥沃的大地本身——丰盛、创造力和充满爱的滋养。你的想法是等待绽放的种子。拥抱感性、美丽和自然世界的生成力量。'},
 reversed:{kw:'Creative block, over-dependence, smothering energy', kwCN:'创意阻塞·过度依赖·令人窒息的能量',
  meaning:'Reversed, the Empress warns of stifled creativity, unhealthy dependence, or smothering care. Reconnect with your own life force and allow both yourself and others room to breathe.',
  meaningCN:'逆位女皇警告被压制的创造力、不健康的依赖，或令人窒息的过度关怀。重新连接你自己的生命力，给自己和他人留出呼吸的空间。'}},

{id:4, name:'The Emperor', nameCN:'皇帝', suit:'major',
 upright:{kw:'Authority, structure, stability, fatherhood, logic', kwCN:'权威·结构·稳定·父性·逻辑',
  meaning:'The Emperor builds empires through discipline, logic, and clear authority. Solid structures and rational planning are your greatest allies now. Establish order where chaos reigns.',
  meaningCN:'皇帝通过纪律、逻辑和清晰的权威建立帝国。坚实的结构和理性的规划是你现在最大的盟友。在混乱统治的地方建立秩序。'},
 reversed:{kw:'Domination, rigidity, excessive control, stubbornness', kwCN:'支配·刻板·过度控制·固执',
  meaning:'Reversed, the Emperor\'s strength curdles into tyranny. Excessive rigidity or a need to dominate is blocking growth. Loosen your grip and allow more flexibility.',
  meaningCN:'逆位皇帝的力量变质为专制。过度的刻板或支配欲正在阻碍成长。放松你的控制，允许更多灵活性。'}},

{id:5, name:'The Hierophant', nameCN:'教皇', suit:'major',
 upright:{kw:'Tradition, spiritual guidance, institutions, conformity', kwCN:'传统·精神指引·机构·顺从',
  meaning:'The Hierophant bridges the divine and the earthly through established wisdom and ritual. A teacher, mentor, or institution holds valuable guidance now. Honor tradition while seeking deeper meaning.',
  meaningCN:'教皇通过既定的智慧和仪式连接神圣与世俗。导师、老师或机构现在持有宝贵的指引。在寻求更深意义的同时尊重传统。'},
 reversed:{kw:'Questioning convention, personal freedom, unorthodox paths', kwCN:'质疑惯例·个人自由·非正统道路',
  meaning:'Reversed, the Hierophant invites you to question inherited beliefs and forge your own spiritual path. Liberation from dogma awaits those bold enough to think for themselves.',
  meaningCN:'逆位教皇邀请你质疑继承的信仰，开辟自己的精神道路。从教条中解脱等待着那些勇敢独立思考的人。'}},

{id:6, name:'The Lovers', nameCN:'恋人', suit:'major',
 upright:{kw:'Love, harmony, alignment of values, meaningful choice', kwCN:'爱·和谐·价值观一致·有意义的选择',
  meaning:'The Lovers speak of deep alignment—romantic, spiritual, or philosophical. A significant choice stands before you, one that must come from the heart. Choose in accordance with your highest values.',
  meaningCN:'恋人诉说深刻的契合——浪漫、精神或哲学层面。一个重要的选择摆在你面前，必须发自内心。按照你最高的价值观做出选择。'},
 reversed:{kw:'Disharmony, imbalance, misalignment, difficult choice', kwCN:'不和谐·失衡·不一致·困难选择',
  meaning:'Reversed, the Lovers reveal conflict in values, a relationship out of balance, or avoidance of a necessary decision. Examine what is truly important and realign.',
  meaningCN:'逆位恋人揭示价值观冲突、失衡的关系，或回避必要的决定。审视什么才是真正重要的并重新校准。'}},

{id:7, name:'The Chariot', nameCN:'战车', suit:'major',
 upright:{kw:'Willpower, control, victory, determination', kwCN:'意志力·控制·胜利·决心',
  meaning:'The Charioteer harnesses opposing forces under a single will and drives toward victory. Confidence, discipline, and focused determination will carry you over every obstacle.',
  meaningCN:'战车御者在单一意志下驾驭对立力量，驱向胜利。信心、纪律和专注的决心将带你跨越每一个障碍。'},
 reversed:{kw:'Lack of direction, aggression, powerlessness, defeat', kwCN:'缺乏方向·攻击性·无力感·失败',
  meaning:'Reversed, the Chariot signals loss of control—either through aggression or complete powerlessness. Reclaim the reins before the vehicle crashes.',
  meaningCN:'逆位战车暗示失控——通过攻击性或完全的无力感。在车辆坠毁之前重新夺回缰绳。'}},

{id:8, name:'Strength', nameCN:'力量', suit:'major',
 upright:{kw:'Inner strength, compassion, patience, taming the beast', kwCN:'内在力量·慈悲·耐心·驯服兽性',
  meaning:'Strength tames the lion not with force but with gentle courage and love. Your inner reserves of patience and compassion are mightier than any external power. Trust this quiet strength.',
  meaningCN:'力量不是用武力，而是用温柔的勇气和爱来驯服狮子。你内在的耐心和慈悲储备比任何外部力量都更强大。信任这种宁静的力量。'},
 reversed:{kw:'Self-doubt, weakness, raw emotion, insecurity', kwCN:'自我怀疑·软弱·原始情绪·不安全感',
  meaning:'Reversed, Strength shows inner doubt or letting raw instinct override compassionate wisdom. Reconnect with your core resilience before acting.',
  meaningCN:'逆位力量显示内在怀疑或让原始本能凌驾于慈悲智慧之上。在行动之前重新连接你核心的韧性。'}},

{id:9, name:'The Hermit', nameCN:'隐者', suit:'major',
 upright:{kw:'Introspection, solitude, inner guidance, soul-searching', kwCN:'内省·独处·内在指引·灵魂探索',
  meaning:'The Hermit climbs alone to find the light within. Withdraw from external noise to consult the wisdom of your own depths. The answers you seek live inside you.',
  meaningCN:'隐者独自攀登以寻找内在的光明。从外部噪音中退隐，向自己内心深处的智慧咨询。你寻求的答案就在你内心。'},
 reversed:{kw:'Isolation, loneliness, withdrawing from the world', kwCN:'孤立·孤独·从世界退缩',
  meaning:'Reversed, the Hermit\'s solitude becomes isolating darkness. Refusing guidance or human connection is a trap. Reach out.',
  meaningCN:'逆位隐者的独处变成孤立的黑暗。拒绝指引或人类连接是一个陷阱。伸出手来。'}},

{id:10, name:'Wheel of Fortune', nameCN:'命运之轮', suit:'major',
 upright:{kw:'Cycles, fate, turning point, luck, destiny', kwCN:'循环·命运·转折点·好运·天命',
  meaning:'The Wheel turns, and fortune shifts. What has been stagnant begins to move; a turning point is at hand. Embrace the cyclical nature of all things and ride the changing tide.',
  meaningCN:'命运之轮转动，好运转变。一直停滞的事物开始移动；转折点就在眼前。拥抱万物循环的本质，乘上变化的浪潮。'},
 reversed:{kw:'Bad luck, resistance, breaking cycles, delays', kwCN:'厄运·抗拒·打破循环·延误',
  meaning:'Reversed, the Wheel grinds against you—bad timing, resistance to necessary change, or negative patterns repeating. Identify the cycle and consciously break it.',
  meaningCN:'逆位命运之轮与你作对——时机不好、抗拒必要的变化，或负面模式重复。识别这个循环并有意识地打破它。'}},

{id:11, name:'Justice', nameCN:'正义', suit:'major',
 upright:{kw:'Fairness, truth, cause and effect, accountability', kwCN:'公平·真相·因果·责任',
  meaning:'Justice holds the scales with clear, impartial eyes. Truth will be revealed; actions have consequences. Approach decisions with integrity and accept an honest reckoning.',
  meaningCN:'正义以清醒、公正的眼睛持着天平。真相将被揭示；行为有其后果。以诚信处理决策，接受诚实的清算。'},
 reversed:{kw:'Injustice, dishonesty, bias, avoiding accountability', kwCN:'不公正·不诚实·偏见·逃避责任',
  meaning:'Reversed, Justice points to unfairness, corruption, or dodging responsibility. Someone—possibly you—is refusing to face the truth. Integrity is non-negotiable.',
  meaningCN:'逆位正义指向不公平、腐败或逃避责任。有人——可能是你——在拒绝面对真相。诚信是不可商量的。'}},

{id:12, name:'The Hanged Man', nameCN:'倒吊人', suit:'major',
 upright:{kw:'Suspension, surrender, new perspective, sacrifice', kwCN:'暂停·臣服·新视角·牺牲',
  meaning:'The Hanged Man suspends himself voluntarily to gain a radically different view. Pause, let go, and surrender to the wisdom that comes only through stillness and sacrifice.',
  meaningCN:'倒吊人自愿将自己悬挂，以获得根本不同的视角。暂停、放下，臣服于只有通过静止和牺牲才能获得的智慧。'},
 reversed:{kw:'Stalling, resistance, delays, indecision', kwCN:'拖延·抗拒·延误·优柔寡断',
  meaning:'Reversed, the Hanged Man is stuck in unnecessary delay. You are stalling to avoid a difficult surrender. Make the sacrifice you have been postponing.',
  meaningCN:'逆位倒吊人陷入不必要的拖延中。你在拖延以避免艰难的臣服。做出你一直在推迟的牺牲。'}},

{id:13, name:'Death', nameCN:'死神', suit:'major',
 upright:{kw:'Endings, transformation, transition, release', kwCN:'结束·转化·过渡·释放',
  meaning:'Death is not the end but the great transformer. Something that has run its course must be fully released so that new life can emerge. Trust this profound clearing.',
  meaningCN:'死神不是终结，而是伟大的转化者。已经走完旅程的事物必须被完全释放，新的生命才能出现。信任这次深刻的清除。'},
 reversed:{kw:'Resistance to change, stagnation, clinging to the past', kwCN:'抗拒改变·停滞·执着于过去',
  meaning:'Reversed, Death shows an inability to let go—clinging to what is already over. Resisting this inevitable transformation only deepens suffering.',
  meaningCN:'逆位死神显示无法放手——执着于已经结束的事物。抗拒这种不可避免的转化只会加深痛苦。'}},

{id:14, name:'Temperance', nameCN:'节制', suit:'major',
 upright:{kw:'Balance, moderation, patience, divine alchemy', kwCN:'平衡·节制·耐心·神圣炼金术',
  meaning:'Temperance pours wisdom between two cups, blending opposites into harmony. Moderation, patience, and long-term vision are your guiding stars. Trust the slow alchemy of time.',
  meaningCN:'节制在两个杯子之间倾注智慧，将对立面融合成和谐。节制、耐心和长远视野是你的指路明星。信任时间缓慢的炼金术。'},
 reversed:{kw:'Imbalance, excess, extremes, self-healing needed', kwCN:'失衡·过度·极端·需要自我疗愈',
  meaning:'Reversed, Temperance signals dangerous imbalances—excess, extremes, or a loss of inner equilibrium. Recalibrate before the scales tip too far.',
  meaningCN:'逆位节制暗示危险的失衡——过度、极端或失去内在平衡。在天平倾斜太远之前重新校准。'}},

{id:15, name:'The Devil', nameCN:'恶魔', suit:'major',
 upright:{kw:'Shadow self, bondage, addiction, materialism', kwCN:'阴影自我·束缚·上瘾·物质主义',
  meaning:'The Devil chains two figures who could free themselves at any moment—the shackles are mostly self-made. Confront your shadows, addictions, and unhealthy attachments. Awareness is liberation.',
  meaningCN:'恶魔用锁链束缚两个随时可以解脱的人物——枷锁大多是自我施加的。正视你的阴影、上瘾和不健康的依附。意识就是解放。'},
 reversed:{kw:'Breaking free, releasing bonds, reclaiming power', kwCN:'挣脱束缚·释放羁绊·夺回力量',
  meaning:'Reversed, the Devil\'s chains are loosening. You are waking up to unhealthy patterns and beginning to break free. Reclaim your authentic power.',
  meaningCN:'逆位恶魔的锁链正在松动。你正在意识到不健康的模式并开始挣脱。夺回你真实的力量。'}},

{id:16, name:'The Tower', nameCN:'塔', suit:'major',
 upright:{kw:'Sudden upheaval, chaos, revelation, breaking illusions', kwCN:'突然动荡·混乱·启示·打破幻觉',
  meaning:'The Tower shatters false constructs in a lightning bolt of truth. Though the destruction is shocking, it clears away what was built on unstable ground. From rubble, something real can rise.',
  meaningCN:'塔在真相的闪电中粉碎虚假的构建。虽然破坏令人震惊，但它清除了建立在不稳定基础上的一切。从废墟中，真实的东西可以升起。'},
 reversed:{kw:'Avoiding disaster, resisting change, delayed upheaval', kwCN:'避免灾难·抗拒变化·延迟动荡',
  meaning:'Reversed, the Tower\'s blow is delayed or being avoided through denial. The collapse is coming regardless—better to dismantle the unstable structure consciously.',
  meaningCN:'逆位塔的打击被延迟或通过否认而被回避。无论如何，崩塌都会到来——最好有意识地拆除不稳定的结构。'}},

{id:17, name:'The Star', nameCN:'星星', suit:'major',
 upright:{kw:'Hope, renewal, serenity, faith, healing', kwCN:'希望·更新·宁静·信念·疗愈',
  meaning:'After the storm comes the Star—pouring healing waters over a parched earth. Hope is restored; the universe is benevolent. Allow yourself to be renewed and to believe again.',
  meaningCN:'风雨过后是星星——将治愈之水倾注在干渴的大地上。希望得以恢复；宇宙是仁慈的。允许自己被更新，再次相信。'},
 reversed:{kw:'Hopelessness, disconnection, discouragement, faithlessness', kwCN:'无望·脱节·气馁·失去信念',
  meaning:'Reversed, the Star\'s light dims—despair, disillusionment, or a disconnection from your inner guiding light. Gently seek what rekindles your spirit.',
  meaningCN:'逆位星星的光芒减弱——绝望、幻灭或与内在指引之光的断连。轻柔地寻找能重新点燃你精神的事物。'}},

{id:18, name:'The Moon', nameCN:'月亮', suit:'major',
 upright:{kw:'Illusion, fear, the unconscious, confusion, dreams', kwCN:'幻觉·恐惧·潜意识·困惑·梦境',
  meaning:'The Moon illuminates a shadowed path where nothing is as it seems. Anxiety and illusion run high; old fears rise to the surface. Navigate by intuition, not logic, and watch for deception.',
  meaningCN:'月亮照亮一条阴影密布的道路，事物并非表面所见。焦虑和幻觉高涨；旧的恐惧浮出水面。用直觉而非逻辑导航，并警惕欺骗。'},
 reversed:{kw:'Confusion lifting, inner fears releasing, clarity emerging', kwCN:'困惑消散·内在恐惧释放·清明浮现',
  meaning:'Reversed, the Moon\'s mists are beginning to clear. Hidden truths emerge; repressed fears lose their grip. Welcome the gradual return of clarity.',
  meaningCN:'逆位月亮的迷雾开始消散。隐藏的真相浮现；被压制的恐惧失去控制。欢迎清明的逐渐回归。'}},

{id:19, name:'The Sun', nameCN:'太阳', suit:'major',
 upright:{kw:'Joy, vitality, success, clarity, optimism', kwCN:'喜悦·活力·成功·清明·乐观',
  meaning:'The Sun blazes with pure joy, clarity, and success. Everything is illuminated and celebrated. This is a card of happiness, achievement, and radiant life force—bask in it fully.',
  meaningCN:'太阳以纯粹的喜悦、清明和成功炽烈燃烧。一切都被照亮和庆祝。这是一张幸福、成就和光辉生命力的牌——尽情沐浴其中。'},
 reversed:{kw:'Temporary setback, inner child wounds, overconfidence', kwCN:'暂时挫折·内在小孩创伤·过度自信',
  meaning:'Reversed, the Sun is briefly clouded—joy is there but obscured by self-doubt or overconfidence. The light will return; tend to your inner child.',
  meaningCN:'逆位太阳短暂被云遮蔽——喜悦存在但被自我怀疑或过度自信所遮挡。光明将会回归；关照你的内在小孩。'}},

{id:20, name:'Judgement', nameCN:'审判', suit:'major',
 upright:{kw:'Awakening, reckoning, absolution, higher calling', kwCN:'觉醒·清算·宽恕·更高召唤',
  meaning:'The angel\'s trumpet calls souls to rise. A profound spiritual awakening and honest self-reckoning are at hand. Forgive yourself and others, hear your true calling, and rise.',
  meaningCN:'天使的号角召唤灵魂升起。深刻的精神觉醒和诚实的自我清算即将到来。原谅自己和他人，聆听你真实的召唤，然后升起。'},
 reversed:{kw:'Self-doubt, ignoring the call, harshness, unresolved karma', kwCN:'自我怀疑·忽视召唤·严苛·未解决的业力',
  meaning:'Reversed, Judgement shows self-judgment run amok or a refusal to answer a soul-level call. Release the inner critic and listen with open ears.',
  meaningCN:'逆位审判显示自我评判失控，或拒绝回应灵魂层面的召唤。释放内在批评家，以开放的耳朵倾听。'}},

{id:21, name:'The World', nameCN:'世界', suit:'major',
 upright:{kw:'Completion, wholeness, achievement, integration, travel', kwCN:'完成·完整·成就·整合·旅行',
  meaning:'The World is the Fool\'s journey triumphantly complete. You have integrated every lesson and arrived at a place of wholeness. Celebrate this completion—and know that the next great adventure awaits.',
  meaningCN:'世界是愚者旅程的胜利完成。你已经整合了每一个课程，抵达完整的地方。庆祝这次完成——并知道下一次伟大冒险正在等待。'},
 reversed:{kw:'Incompletion, shortcuts, loose ends, delayed success', kwCN:'未完成·走捷径·未了结·延迟成功',
  meaning:'Reversed, the World signals something left incomplete. You may be cutting corners or avoiding the final integrative step. See it through to the end.',
  meaningCN:'逆位世界暗示有些事情未完成。你可能在走捷径或回避最后的整合步骤。坚持到最后。'}},

// ══ WANDS ══
{id:22, name:'Ace of Wands', nameCN:'权杖A', suit:'wands',
 upright:{kw:'New creative spark, inspiration, potential, bold beginnings', kwCN:'新创意火花·灵感·潜力·大胆开始',
  meaning:'A bolt of creative lightning ignites new beginnings. Seize this surge of inspiration and channel it into bold action before the flame dims.',
  meaningCN:'一道创意闪电点燃新的开始。抓住这股灵感的涌现，在火焰熄灭之前将其引导为大胆行动。'},
 reversed:{kw:'Delays, creative blocks, wasted energy, false starts', kwCN:'拖延·创意阻塞·浪费能量·虚假开始',
  meaning:'The creative spark is struggling to ignite. Remove obstacles—internal or external—and reconnect with your core passion.',
  meaningCN:'创意火花在挣扎中难以点燃。移除障碍——内部或外部的——并重新连接你的核心热情。'}},
{id:23, name:'Two of Wands', nameCN:'权杖二', suit:'wands',
 upright:{kw:'Future planning, bold vision, stepping into the unknown', kwCN:'未来规划·大胆愿景·踏入未知',
  meaning:'You hold the world in your hands, scanning the horizon. The first step has been taken; now plan the journey boldly and commit to expansion.',
  meaningCN:'你手持世界，扫视地平线。第一步已经迈出；现在大胆规划旅程并致力于扩展。'},
 reversed:{kw:'Fear of the unknown, playing it safe, lack of planning', kwCN:'恐惧未知·安于现状·缺乏规划',
  meaning:'Fear or poor planning is keeping your vision small. Dare to expand your thinking beyond familiar territory.',
  meaningCN:'恐惧或糟糕的规划让你的愿景保持渺小。敢于将思维扩展到熟悉领域之外。'}},
{id:24, name:'Three of Wands', nameCN:'权杖三', suit:'wands',
 upright:{kw:'Expansion, foresight, overseas ventures, progress', kwCN:'扩展·远见·海外冒险·进展',
  meaning:'Ships sail outward carrying your vision. Momentum is building; look beyond borders and trust in expanding horizons.',
  meaningCN:'船只载着你的愿景向外航行。势头正在积累；放眼边界之外，信任扩展的视野。'},
 reversed:{kw:'Delays, obstacles, failed plans, setbacks', kwCN:'拖延·障碍·计划失败·挫折',
  meaning:'Progress is blocked or returning to port. Reassess your strategy and try a different course.',
  meaningCN:'进展受阻或返回港口。重新评估你的策略，尝试不同的路线。'}},
{id:25, name:'Four of Wands', nameCN:'权杖四', suit:'wands',
 upright:{kw:'Celebration, community, milestone, homecoming', kwCN:'庆祝·社区·里程碑·归家',
  meaning:'Garlands and celebration mark a joyful milestone. Community, belonging, and the warmth of shared achievement surround you.',
  meaningCN:'花环和庆典标志着快乐的里程碑。社区、归属感和共享成就的温暖环绕着你。'},
 reversed:{kw:'Instability, conflict at home, lack of support', kwCN:'不稳定·家庭冲突·缺乏支持',
  meaning:'Harmony in home or community is disrupted. Address underlying tensions before they undermine the celebration.',
  meaningCN:'家庭或社区中的和谐受到破坏。在潜在的紧张破坏庆典之前解决它们。'}},
{id:26, name:'Five of Wands', nameCN:'权杖五', suit:'wands',
 upright:{kw:'Conflict, competition, chaos, clashing energies', kwCN:'冲突·竞争·混乱·碰撞的能量',
  meaning:'Competing wands clash in productive chaos. Channel this friction constructively—competition sharpens skills and reveals hidden strengths.',
  meaningCN:'竞争的权杖在富有成效的混乱中碰撞。建设性地引导这种摩擦——竞争磨砺技能并揭示隐藏的力量。'},
 reversed:{kw:'Inner conflict, avoiding confrontation, suppressed rivalry', kwCN:'内在冲突·回避对抗·压制的竞争',
  meaning:'Conflict is internalized or being avoided. Face the tension directly rather than letting it fester.',
  meaningCN:'冲突被内化或被回避。直接面对紧张局势，而不是让它恶化。'}},
{id:27, name:'Six of Wands', nameCN:'权杖六', suit:'wands',
 upright:{kw:'Victory, public recognition, leadership, triumph', kwCN:'胜利·公众认可·领导力·凯旋',
  meaning:'The crowd cheers your triumph. Your efforts have yielded real recognition. Accept success gracefully and inspire those who follow.',
  meaningCN:'人群为你的胜利欢呼。你的努力带来了真正的认可。优雅地接受成功，激励那些追随你的人。'},
 reversed:{kw:'Ego, fall from grace, delayed recognition', kwCN:'自我·从高处跌落·延迟认可',
  meaning:'Success has bred arrogance, or recognition is delayed by setbacks. Stay grounded in genuine purpose.',
  meaningCN:'成功滋生了傲慢，或认可因挫折而延迟。保持对真实目的的脚踏实地。'}},
{id:28, name:'Seven of Wands', nameCN:'权杖七', suit:'wands',
 upright:{kw:'Perseverance, defense, holding your ground', kwCN:'坚持·防守·守住阵地',
  meaning:'You stand on higher ground against many challengers. Defend your position with conviction—you have earned the right to be here.',
  meaningCN:'你在更高的阵地上面对众多挑战者。坚定地捍卫你的立场——你已经赢得了站在这里的权利。'},
 reversed:{kw:'Overwhelm, giving up, loss of confidence', kwCN:'不堪重负·放弃·失去信心',
  meaning:'Exhaustion is making defense feel impossible. Prioritize and ask for support rather than fighting every battle alone.',
  meaningCN:'疲惫使防守感觉不可能。优先排序并寻求支持，而不是独自应对每一场战斗。'}},
{id:29, name:'Eight of Wands', nameCN:'权杖八', suit:'wands',
 upright:{kw:'Speed, momentum, swift action, rapid change', kwCN:'速度·势头·迅速行动·快速变化',
  meaning:'Eight wands fly through clear sky—swift movement, rapid news, and accelerating momentum. Act decisively while the wind is behind you.',
  meaningCN:'八根权杖飞越晴朗的天空——快速移动、迅速的消息和加速的势头。在顺风时果断行动。'},
 reversed:{kw:'Delays, poor timing, frustration, stagnation', kwCN:'延误·时机不对·沮丧·停滞',
  meaning:'Momentum has stalled; timing is off. Slow down and wait for a clearer opening rather than forcing progress.',
  meaningCN:'势头已经停滞；时机不对。放慢脚步，等待更清晰的机会，而不是强行推进。'}},
{id:30, name:'Nine of Wands', nameCN:'权杖九', suit:'wands',
 upright:{kw:'Resilience, persistence, almost there, guarded strength', kwCN:'韧性·坚持·几近终点·有所防守的力量',
  meaning:'Wounded but unbroken, you are on the last stretch. Gather your remaining strength—the finish line is closer than it looks.',
  meaningCN:'受伤但未被击败，你在最后的路段上。聚集你剩余的力量——终点线比看起来更近。'},
 reversed:{kw:'Burnout, paranoia, stubbornness, refusing help', kwCN:'倦怠·偏执·固执·拒绝帮助',
  meaning:'Exhaustion has crossed into burnout or stubbornness. Lay down some burdens and accept help.',
  meaningCN:'疲惫已经超越为倦怠或固执。放下一些负担，接受帮助。'}},
{id:31, name:'Ten of Wands', nameCN:'权杖十', suit:'wands',
 upright:{kw:'Burden, overcommitment, responsibility, carrying too much', kwCN:'负担·过度承诺·责任·承载太多',
  meaning:'The figure hunches under a crushing load of wands. Delegate, simplify, and release what is not truly yours to carry.',
  meaningCN:'人物在沉重的权杖负担下弯腰。委托、简化，释放那些真正不该由你承载的事物。'},
 reversed:{kw:'Dumping burdens, forced release, burnout imminent', kwCN:'卸下负担·被迫释放·倦怠迫在眉睫',
  meaning:'The load is becoming unbearable—drop it deliberately or it will drop you. Radical simplification is necessary.',
  meaningCN:'负担变得难以承受——有意识地放下它，否则它会压垮你。彻底的简化是必要的。'}},
{id:32, name:'Page of Wands', nameCN:'权杖侍从', suit:'wands',
 upright:{kw:'Enthusiasm, exploration, new ideas, free spirit', kwCN:'热情·探索·新想法·自由精神',
  meaning:'The Page of Wands is a daring explorer with fire in their eyes. Follow fresh inspiration with openness and youthful courage.',
  meaningCN:'权杖侍从是眼中燃着火焰的大胆探险者。以开放和青春的勇气追随新鲜的灵感。'},
 reversed:{kw:'Scattered energy, lack of focus, hasty decisions', kwCN:'能量分散·缺乏专注·仓促决策',
  meaning:'Exciting ideas are going nowhere without focus. Ground your energy before launching into the next shiny thing.',
  meaningCN:'没有专注的话，令人兴奋的想法将无处可去。在跳入下一件闪亮的事物之前，让你的能量扎根。'}},
{id:33, name:'Knight of Wands', nameCN:'权杖骑士', suit:'wands',
 upright:{kw:'Action, adventure, impulsiveness, passion, fearlessness', kwCN:'行动·冒险·冲动·激情·无畏',
  meaning:'The Knight of Wands charges forward with fearless passion. Let this fiery energy propel you—just ensure there is a strategy beneath the enthusiasm.',
  meaningCN:'权杖骑士以无畏的激情冲锋向前。让这股炽热的能量推动你——只需确保热情之下有策略支撑。'},
 reversed:{kw:'Recklessness, anger, impulsive behavior, frustration', kwCN:'鲁莽·愤怒·冲动行为·沮丧',
  meaning:'Unchecked fire is causing collateral damage. Slow down enough to aim before releasing the arrow.',
  meaningCN:'未受控制的火焰正在造成附带伤害。在放箭之前放慢脚步瞄准。'}},
{id:34, name:'Queen of Wands', nameCN:'权杖女王', suit:'wands',
 upright:{kw:'Confidence, charisma, independence, vibrancy', kwCN:'自信·魅力·独立·活力',
  meaning:'The Queen of Wands radiates bold confidence, creative fire, and warm leadership. Own the room—your authentic passion is magnetic.',
  meaningCN:'权杖女王散发出大胆的自信、创造性的火焰和温暖的领导力。掌控全场——你真实的激情具有磁性。'},
 reversed:{kw:'Self-doubt, jealousy, demanding behavior, dimmed fire', kwCN:'自我怀疑·嫉妒·苛求行为·熄灭的火焰',
  meaning:'The Queen\'s fire is dampened by insecurity or jealousy. Reconnect with your core creative power.',
  meaningCN:'女王的火焰被不安全感或嫉妒所压制。重新连接你的核心创造力量。'}},
{id:35, name:'King of Wands', nameCN:'权杖国王', suit:'wands',
 upright:{kw:'Visionary leadership, entrepreneurship, boldness, honour', kwCN:'有远见的领导力·创业精神·大胆·荣誉',
  meaning:'The King of Wands leads through vision, courage, and natural authority. Inspire others by embodying bold, principled leadership.',
  meaningCN:'权杖国王通过愿景、勇气和天然权威来领导。通过体现大胆、有原则的领导力来激励他人。'},
 reversed:{kw:'Arrogance, ruthlessness, high expectations, tyranny', kwCN:'傲慢·无情·高期望·专制',
  meaning:'The King\'s fire has become domineering. Check your ego and lead with genuine care, not ego-driven control.',
  meaningCN:'国王的火焰已变得专横。检查你的自我，以真诚的关怀而非自我驱动的控制来领导。'}},

// ══ CUPS ══
{id:36, name:'Ace of Cups', nameCN:'圣杯A', suit:'cups',
 upright:{kw:'New love, emotional beginnings, compassion, intuition', kwCN:'新的爱·情感开始·慈悲·直觉',
  meaning:'A chalice overflowing with divine love is offered. Open your heart unconditionally to new emotional beginnings, creative inspiration, and spiritual connection.',
  meaningCN:'一个溢满神圣之爱的圣杯被奉上。无条件地打开你的心，迎接新的情感开始、创意灵感和精神连接。'},
 reversed:{kw:'Emotional blocks, emptiness, repressed feelings', kwCN:'情感阻塞·空虚·压抑的感受',
  meaning:'Love is blocked by old wounds or emotional repression. Gentle inner work will reopen the flow.',
  meaningCN:'爱被旧伤或情感压抑所阻塞。温柔的内在工作将重新开启流动。'}},
{id:37, name:'Two of Cups', nameCN:'圣杯二', suit:'cups',
 upright:{kw:'Partnership, mutual attraction, soul connection, harmony', kwCN:'伙伴关系·相互吸引·灵魂连接·和谐',
  meaning:'Two cups raised in union—a beautiful mirror of mutual love and shared purpose. This bond, romantic or platonic, is built on genuine respect.',
  meaningCN:'两个杯子在结合中举起——相互之爱和共同目的的美丽镜像。这种纽带，无论浪漫还是柏拉图式，都建立在真诚的尊重之上。'},
 reversed:{kw:'Imbalance, break-up, disconnection, disharmony', kwCN:'失衡·分离·脱节·不和谐',
  meaning:'The harmony of a key relationship is fractured. Honest communication is needed to restore balance.',
  meaningCN:'关键关系的和谐破裂。需要诚实的沟通来恢复平衡。'}},
{id:38, name:'Three of Cups', nameCN:'圣杯三', suit:'cups',
 upright:{kw:'Celebration, friendship, community, joy, reunion', kwCN:'庆祝·友谊·社区·喜悦·重聚',
  meaning:'Three figures dance in joyful celebration. Community, shared abundance, and the simple pleasure of good company are highlighted.',
  meaningCN:'三个人物在欢乐的庆典中舞蹈。社区、共享的丰盛和好伙伴的简单快乐得到强调。'},
 reversed:{kw:'Overindulgence, gossip, exclusion, superficial connections', kwCN:'过度放纵·闲话·排斥·肤浅联系',
  meaning:'Celebration has tipped into excess or cliques have become exclusive. Seek deeper, more authentic connection.',
  meaningCN:'庆祝已经滑向过度，或小团体变得排外。寻求更深、更真实的连接。'}},
{id:39, name:'Four of Cups', nameCN:'圣杯四', suit:'cups',
 upright:{kw:'Contemplation, apathy, missed opportunities, ennui', kwCN:'沉思·冷漠·错失机会·倦怠',
  meaning:'A new cup is offered while the figure sits in withdrawn contemplation. Step out of apathy—there are gifts you have not yet noticed.',
  meaningCN:'一个新的杯子被奉上，而人物坐在退隐的沉思中。走出冷漠——有你尚未注意到的礼物。'},
 reversed:{kw:'Emerging from withdrawal, new motivation, clarity', kwCN:'从退缩中浮现·新动力·清明',
  meaning:'You are emerging from a period of inner withdrawal with renewed clarity and motivation.',
  meaningCN:'你正从内在退缩的时期浮现，带着新的清明和动力。'}},
{id:40, name:'Five of Cups', nameCN:'圣杯五', suit:'cups',
 upright:{kw:'Grief, loss, regret, pessimism, focusing on what\'s gone', kwCN:'悲伤·失去·遗憾·悲观·专注于已失',
  meaning:'Three spilled cups draw all the attention while two full ones stand behind. Grieve what was lost, but turn to see what remains.',
  meaningCN:'三个溢出的杯子吸引了所有注意力，而两个满的杯子站在身后。为失去的而悲伤，但转身看看留下的。'},
 reversed:{kw:'Acceptance, moving forward, healing, finding peace', kwCN:'接受·向前移动·疗愈·找到平静',
  meaning:'You are turning from past losses toward healing. Forgiveness of self and others opens the way forward.',
  meaningCN:'你正从过去的失去转向疗愈。对自己和他人的宽恕打开了前进的道路。'}},
{id:41, name:'Six of Cups', nameCN:'圣杯六', suit:'cups',
 upright:{kw:'Nostalgia, childhood, innocence, past connections', kwCN:'怀旧·童年·纯真·过去的连接',
  meaning:'Sweet nostalgia for simpler, more innocent times. Revisit the past for healing, but do not live there. Let childhood joy nourish the present.',
  meaningCN:'对更简单、更纯真时光的甜蜜怀念。重温过去以获得疗愈，但不要活在那里。让童年的喜悦滋养当下。'},
 reversed:{kw:'Stuck in the past, unrealistic idealism, releasing old patterns', kwCN:'困于过去·不切实际的理想主义·释放旧模式',
  meaning:'Over-romanticizing the past is blocking present growth. Release what was, and embrace who you are now.',
  meaningCN:'过度美化过去正在阻碍当下的成长。放下曾经，拥抱你现在的样子。'}},
{id:42, name:'Seven of Cups', nameCN:'圣杯七', suit:'cups',
 upright:{kw:'Fantasy, choices, illusion, wishful thinking', kwCN:'幻想·选择·幻觉·一厢情愿',
  meaning:'Many tempting visions float in the clouds—but only one is real. Use discernment to separate true opportunity from seductive fantasy.',
  meaningCN:'许多诱人的幻象漂浮在云端——但只有一个是真实的。用辨别力将真正的机会与诱人的幻想分开。'},
 reversed:{kw:'Clarity, choosing a path, cutting through illusion', kwCN:'清明·选择道路·切穿幻觉',
  meaning:'The clouds are parting. Clarity replaces confusion; you can now commit to a real path.',
  meaningCN:'云雾正在散开。清明取代困惑；你现在可以致力于真实的道路了。'}},
{id:43, name:'Eight of Cups', nameCN:'圣杯八', suit:'cups',
 upright:{kw:'Walking away, disillusionment, deeper meaning, transition', kwCN:'离开·幻灭·更深的意义·过渡',
  meaning:'The figure turns from a carefully built stack of cups to seek something more meaningful. Walking away takes courage—trust that the quest for depth is worth it.',
  meaningCN:'人物从精心建造的一叠杯子转身，寻求更有意义的事物。离开需要勇气——相信对深度的追求是值得的。'},
 reversed:{kw:'Avoidance, dragging out the inevitable, fear of change', kwCN:'回避·拖延不可避免·恐惧改变',
  meaning:'You are reluctant to leave what no longer serves you. Trust your deeper knowing and walk toward what calls you.',
  meaningCN:'你不愿离开那些不再服务于你的事物。信任你更深的内知，走向召唤你的事物。'}},
{id:44, name:'Nine of Cups', nameCN:'圣杯九', suit:'cups',
 upright:{kw:'Contentment, wishes fulfilled, satisfaction, gratitude', kwCN:'满足·愿望实现·满意·感恩',
  meaning:'The wish card. Emotional and material satisfaction are yours. Nine cups arranged in triumph—your heart\'s desire has arrived. Receive it with gratitude.',
  meaningCN:'愿望牌。情感和物质上的满足是你的。九个胜利排列的杯子——你内心的渴望已经到来。以感恩之心接受它。'},
 reversed:{kw:'Dissatisfaction, materialism, greed, hollow pleasures', kwCN:'不满·物质主义·贪婪·空洞的快乐',
  meaning:'External pleasures are not filling the inner void. True contentment requires inner alignment, not more acquisition.',
  meaningCN:'外部的快乐无法填补内心的空虚。真正的满足需要内在的校准，而不是更多的获取。'}},
{id:45, name:'Ten of Cups', nameCN:'圣杯十', suit:'cups',
 upright:{kw:'Harmony, lasting joy, family bliss, emotional fulfilment', kwCN:'和谐·持久喜悦·家庭幸福·情感满足',
  meaning:'A family rejoices under a rainbow of cups—the ultimate emotional fulfilment, belonging, and lasting joy. You have arrived at a place of deep heart-wholeness.',
  meaningCN:'一个家庭在彩虹般的杯子下欢欣雀跃——终极的情感满足、归属感和持久的喜悦。你已到达内心深度完整的地方。'},
 reversed:{kw:'Fractured relationships, misaligned values, domestic tension', kwCN:'关系破裂·价值观不一致·家庭紧张',
  meaning:'Family or relationship harmony is strained. Realign shared values through open, compassionate dialogue.',
  meaningCN:'家庭或关系和谐受到压力。通过开放、慈悲的对话重新调整共同价值观。'}},
{id:46, name:'Page of Cups', nameCN:'圣杯侍从', suit:'cups',
 upright:{kw:'Creative sensitivity, intuitive messages, dreamy openness', kwCN:'创意敏感性·直觉信息·梦幻般的开放',
  meaning:'A fish leaps from the cup—the unexpected messenger of the unconscious. Stay open to surprising intuitive nudges and creative impulses.',
  meaningCN:'一条鱼从杯子中跃出——来自潜意识的意外使者。对令人惊讶的直觉提示和创意冲动保持开放。'},
 reversed:{kw:'Emotional immaturity, escapism, creative blocks', kwCN:'情感不成熟·逃避现实·创意阻塞',
  meaning:'Fantasy is being used to escape emotional responsibility. Ground your sensitivity in practical action.',
  meaningCN:'幻想被用来逃避情感责任。将你的敏感性扎根于实际行动中。'}},
{id:47, name:'Knight of Cups', nameCN:'圣杯骑士', suit:'cups',
 upright:{kw:'Romance, idealism, charm, following the heart', kwCN:'浪漫·理想主义·魅力·跟随内心',
  meaning:'The Knight of Cups arrives as a romantic idealist riding on dreams. Follow your heart with graceful purpose—art, love, and creative pursuit call.',
  meaningCN:'圣杯骑士作为一个骑着梦想的浪漫理想主义者到来。以优雅的目的跟随你的心——艺术、爱和创意追求在召唤。'},
 reversed:{kw:'Moodiness, jealousy, unrealistic fantasy, emotional volatility', kwCN:'情绪化·嫉妒·不切实际的幻想·情感波动',
  meaning:'Emotions are swinging wildly or jealousy is distorting perception. Seek grounding before making heart-led decisions.',
  meaningCN:'情绪剧烈波动，或嫉妒正在扭曲感知。在做出由内心驱动的决定之前寻求扎根。'}},
{id:48, name:'Queen of Cups', nameCN:'圣杯女王', suit:'cups',
 upright:{kw:'Empathy, emotional intelligence, nurturing, intuition', kwCN:'同理心·情商·养育·直觉',
  meaning:'The Queen of Cups reads the emotional undercurrents of every room. Lead with deep empathy and intuitive wisdom while maintaining healthy self-boundaries.',
  meaningCN:'圣杯女王读取每个房间的情感暗流。以深刻的同理心和直觉智慧引领，同时保持健康的自我界限。'},
 reversed:{kw:'Emotional insecurity, co-dependency, martyrdom', kwCN:'情感不安全感·共依存·殉道主义',
  meaning:'Emotional martyrdom or co-dependency is draining you. Establish clear boundaries to preserve your wellbeing.',
  meaningCN:'情感殉道主义或共依存正在耗尽你。建立清晰的界限以保护你的健康。'}},
{id:49, name:'King of Cups', nameCN:'圣杯国王', suit:'cups',
 upright:{kw:'Emotional mastery, compassion, diplomacy, wisdom', kwCN:'情感精通·慈悲·外交·智慧',
  meaning:'The King of Cups masters his emotional realm without suppressing it. Respond with wise compassion and calm authority.',
  meaningCN:'圣杯国王在不压制的情况下掌控自己的情感领域。以明智的慈悲和平静的权威回应。'},
 reversed:{kw:'Emotional manipulation, moodiness, instability', kwCN:'情感操纵·情绪化·不稳定',
  meaning:'Emotional manipulation or unresolved wounds are causing harm. Deep healing work is needed.',
  meaningCN:'情感操纵或未解决的创伤正在造成伤害。需要深入的疗愈工作。'}},

// ══ SWORDS ══
{id:50, name:'Ace of Swords', nameCN:'宝剑A', suit:'swords',
 upright:{kw:'Mental clarity, breakthrough, truth, new perspective', kwCN:'思维清明·突破·真相·新视角',
  meaning:'A sword of pure truth cuts through confusion. Clarity arrives like lightning—speak, think, and act with razor precision.',
  meaningCN:'一把纯粹真相的剑切穿困惑。清明如闪电般到来——以极致的精确说话、思考和行动。'},
 reversed:{kw:'Confusion, clouded thinking, poor communication', kwCN:'困惑·思维模糊·沟通不畅',
  meaning:'Mental fog or miscommunication is muddying the waters. Take time to think clearly before acting.',
  meaningCN:'思维迷雾或误沟通使事情变得混乱。在行动之前花时间清晰思考。'}},
{id:51, name:'Two of Swords', nameCN:'宝剑二', suit:'swords',
 upright:{kw:'Stalemate, difficult decision, blocked emotions, avoidance', kwCN:'僵局·困难决定·阻塞的情感·回避',
  meaning:'Crossed swords and a blindfold—you are avoiding a painful but necessary choice. Remove the blindfold and face what must be decided.',
  meaningCN:'交叉的剑和眼罩——你在回避一个痛苦但必要的选择。摘下眼罩，面对必须决定的事情。'},
 reversed:{kw:'Indecision breaking, truth revealed, information overload', kwCN:'优柔寡断打破·真相揭露·信息过载',
  meaning:'A long-held impasse is finally resolving. New information brings clarity—use it wisely.',
  meaningCN:'长期以来的僵局终于在解决。新信息带来清明——明智地使用它。'}},
{id:52, name:'Three of Swords', nameCN:'宝剑三', suit:'swords',
 upright:{kw:'Heartbreak, grief, sorrow, betrayal, emotional pain', kwCN:'心碎·悲伤·痛苦·背叛·情感痛苦',
  meaning:'Three swords pierce a heart in open air. Do not suppress this grief—let it move through you. Pain fully felt is the beginning of healing.',
  meaningCN:'三把剑在空气中刺穿心脏。不要压制这份悲伤——让它穿越你。充分感受的痛苦是疗愈的开始。'},
 reversed:{kw:'Healing, forgiveness, recovery, releasing pain', kwCN:'疗愈·宽恕·恢复·释放痛苦',
  meaning:'The swords are being removed. Forgiveness and healing are actively underway.',
  meaningCN:'剑正在被移除。宽恕和疗愈正在积极进行中。'}},
{id:53, name:'Four of Swords', nameCN:'宝剑四', suit:'swords',
 upright:{kw:'Rest, recuperation, meditation, preparation', kwCN:'休息·恢复·冥想·准备',
  meaning:'The knight rests in a chapel after battle. Strategic rest is not laziness—it is essential preparation for the next chapter.',
  meaningCN:'骑士在战斗后在礼拜堂中休息。战略性的休息不是懒惰——它是下一章节的必要准备。'},
 reversed:{kw:'Restlessness, burnout, returning to action too soon', kwCN:'焦躁·倦怠·过早回归行动',
  meaning:'Burnout is setting in from neglecting rest. Or you may be ready to re-engage—trust your body\'s wisdom.',
  meaningCN:'由于忽视休息而产生倦怠。或者你可能准备好重新投入——信任身体的智慧。'}},
{id:54, name:'Five of Swords', nameCN:'宝剑五', suit:'swords',
 upright:{kw:'Conflict, defeat, hollow victory, betrayal', kwCN:'冲突·失败·空洞的胜利·背叛',
  meaning:'The battlefield is littered with defeat—or a victory won through dishonest means. Choose battles wisely; some are not worth the cost.',
  meaningCN:'战场上满是失败——或通过不诚实手段赢得的胜利。明智地选择战斗；有些并不值得付出代价。'},
 reversed:{kw:'Reconciliation, moving past conflict, releasing resentment', kwCN:'和解·超越冲突·释放怨恨',
  meaning:'An opportunity to reconcile and release old grievances. Choose peace over pride.',
  meaningCN:'和解和释放旧怨的机会。选择和平而非自尊。'}},
{id:55, name:'Six of Swords', nameCN:'宝剑六', suit:'swords',
 upright:{kw:'Transition, moving on, calmer waters ahead', kwCN:'过渡·向前移动·平静的水域在前',
  meaning:'The boat moves from rough waters to still ones. This bittersweet departure is necessary. Leave the turbulence behind and trust the crossing.',
  meaningCN:'船从汹涌的水域驶向平静的水域。这种苦乐参半的离别是必要的。把动荡留在身后，信任这次穿越。'},
 reversed:{kw:'Resistance to transition, emotional baggage, returning to trouble', kwCN:'抗拒过渡·情感包袱·返回麻烦',
  meaning:'You are resisting a necessary transition or carrying emotional baggage from the past. Let the boat move forward.',
  meaningCN:'你在抗拒必要的过渡，或携带着过去的情感包袱。让船向前行驶。'}},
{id:56, name:'Seven of Swords', nameCN:'宝剑七', suit:'swords',
 upright:{kw:'Deception, strategy, getting away with it, stealth', kwCN:'欺骗·策略·侥幸逃脱·隐秘',
  meaning:'A figure sneaks away with five swords—deception is in play, or a strategic retreat is needed. Examine whether cunning is being used wisely or manipulatively.',
  meaningCN:'一个人物带着五把剑悄悄离开——欺骗在发挥作用，或者需要战略撤退。审视机智是在被明智地还是操纵性地使用。'},
 reversed:{kw:'Coming clean, getting caught, conscience stirring', kwCN:'坦白·被发现·良心觉醒',
  meaning:'Hidden deceptions are surfacing. Honesty now will avert greater consequences later.',
  meaningCN:'隐藏的欺骗正在浮出水面。现在的诚实将避免以后更大的后果。'}},
{id:57, name:'Eight of Swords', nameCN:'宝剑八', suit:'swords',
 upright:{kw:'Self-imprisonment, victim mentality, restriction, paralysis', kwCN:'自我囚禁·受害者心态·限制·瘫痪',
  meaning:'The figure stands blindfolded and loosely bound—the exit is right there. Most of these restraints are mental. Shift your perspective and reclaim freedom.',
  meaningCN:'人物蒙着眼睛，松散地被绑——出口就在那里。大多数这些束缚都是精神上的。转变你的视角，夺回自由。'},
 reversed:{kw:'Breaking free, self-awareness dawning, releasing restrictions', kwCN:'挣脱束缚·自我意识觉醒·释放限制',
  meaning:'You are beginning to see through the mental prison. Liberation is actively underway.',
  meaningCN:'你开始看穿思维的监狱。解放正在积极进行中。'}},
{id:58, name:'Nine of Swords', nameCN:'宝剑九', suit:'swords',
 upright:{kw:'Anxiety, nightmares, fear, worst-case thinking', kwCN:'焦虑·噩梦·恐惧·最坏情况思维',
  meaning:'The figure wakes in anguish—nine swords of fear on the wall. Most of this suffering lives only in the mind. Seek support; fears are rarely as dire as they seem at 3 a.m.',
  meaningCN:'人物在痛苦中醒来——墙上挂着九把恐惧之剑。大多数痛苦只存在于心中。寻求支持；恐惧很少像凌晨3点看起来那么严峻。'},
 reversed:{kw:'Hope returning, reaching out, releasing shame', kwCN:'希望回归·寻求帮助·释放羞耻',
  meaning:'The long night is ending. Reaching out for support breaks the cycle of isolation and shame.',
  meaningCN:'漫长的黑夜即将结束。寻求支持打破孤立和羞耻的循环。'}},
{id:59, name:'Ten of Swords', nameCN:'宝剑十', suit:'swords',
 upright:{kw:'Painful ending, rock bottom, defeat, betrayal', kwCN:'痛苦的结局·触底·失败·背叛',
  meaning:'Ten swords in the back—a brutal, definitive ending. Yet dawn rises over the horizon. The worst has passed; from this absolute low, only renewal is possible.',
  meaningCN:'背部插着十把剑——一个残酷而决定性的结局。然而黎明正在地平线上升起。最坏的已经过去；从这个绝对低点，只有更新是可能的。'},
 reversed:{kw:'Recovery beginning, resisting inevitable end, regeneration', kwCN:'恢复开始·抗拒不可避免的结局·再生',
  meaning:'The darkest moment has passed. Recovery begins—allow the regeneration process to unfold.',
  meaningCN:'最黑暗的时刻已经过去。恢复开始——允许再生过程展开。'}},
{id:60, name:'Page of Swords', nameCN:'宝剑侍从', suit:'swords',
 upright:{kw:'Curiosity, new ideas, vigilance, quick thinking', kwCN:'好奇心·新想法·警惕·快速思考',
  meaning:'The Page of Swords is alert, sharp, and eager to learn. Stay curious and mentally agile; gather information before acting.',
  meaningCN:'宝剑侍从警觉、敏锐、渴望学习。保持好奇和思维敏捷；在行动之前收集信息。'},
 reversed:{kw:'Gossip, haste, scattered thinking, all talk', kwCN:'闲话·急躁·思维分散·只说不做',
  meaning:'Sharp thinking is being wasted on gossip or impulsive chatter. Channel mental energy into meaningful action.',
  meaningCN:'敏锐的思维被浪费在闲话或冲动的喋喋不休上。将精神能量引导到有意义的行动中。'}},
{id:61, name:'Knight of Swords', nameCN:'宝剑骑士', suit:'swords',
 upright:{kw:'Ambition, speed, decisive action, fearless intellect', kwCN:'雄心·速度·果断行动·无畏智识',
  meaning:'The Knight of Swords charges forward with brilliant strategy and relentless speed. Harness this fierce intellect—just ensure wisdom guides the charge.',
  meaningCN:'宝剑骑士以出色的策略和无情的速度冲锋向前。驾驭这种激烈的智识——只需确保智慧引导冲锋。'},
 reversed:{kw:'Recklessness, aggression, burnout, collateral damage', kwCN:'鲁莽·攻击性·倦怠·附带损害',
  meaning:'Speed without direction is causing damage. Slow down, reconsider consequences, and redirect your energy.',
  meaningCN:'没有方向的速度正在造成损害。放慢脚步，重新考虑后果，并重新引导你的能量。'}},
{id:62, name:'Queen of Swords', nameCN:'宝剑女王', suit:'swords',
 upright:{kw:'Clarity, independence, direct communication, sharp boundaries', kwCN:'清明·独立·直接沟通·清晰界限',
  meaning:'The Queen of Swords sees through pretense with clear, compassionate eyes. Speak truth with grace, hold firm boundaries, and trust your independent judgment.',
  meaningCN:'宝剑女王以清醒、慈悲的眼睛看穿伪装。以优雅说真相，坚守界限，信任你独立的判断。'},
 reversed:{kw:'Coldness, bitterness, cruelty, unresolved pain', kwCN:'冷酷·苦涩·残忍·未解决的痛苦',
  meaning:'Past pain has hardened into bitterness or cruelty. Heal the wound beneath the sharpness.',
  meaningCN:'过去的痛苦已经硬化为苦涩或残忍。疗愈敏锐之下的创伤。'}},
{id:63, name:'King of Swords', nameCN:'宝剑国王', suit:'swords',
 upright:{kw:'Intellectual power, authority, truth, clear judgment', kwCN:'智识力量·权威·真相·清晰判断',
  meaning:'The King of Swords rules with impeccable reason and uncompromising truth. Think clearly, speak honestly, and uphold ethical principles without exception.',
  meaningCN:'宝剑国王以无懈可击的理性和不妥协的真相统治。清晰思考，诚实说话，毫无例外地坚守道德原则。'},
 reversed:{kw:'Manipulation, abuse of intellect, cold tyranny', kwCN:'操纵·智识滥用·冷酷专制',
  meaning:'Intellectual power is being misused for manipulation or control. Return to honest, principled communication.',
  meaningCN:'智识力量被误用于操纵或控制。回归诚实、有原则的沟通。'}},

// ══ PENTACLES ══
{id:64, name:'Ace of Pentacles', nameCN:'星币A', suit:'pentacles',
 upright:{kw:'New financial opportunity, abundance, manifestation', kwCN:'新的财务机会·丰盛·显化',
  meaning:'A golden coin offered from a celestial hand—a seed of material prosperity. Plant it wisely and tend it with patience.',
  meaningCN:'从天上的手奉上一枚金币——物质繁荣的种子。明智地种植它，耐心地照料它。'},
 reversed:{kw:'Missed opportunity, financial insecurity, poor planning', kwCN:'错失机会·财务不安全感·糟糕规划',
  meaning:'A material opportunity has slipped by or is being mismanaged. Revisit your practical foundations.',
  meaningCN:'物质机会已经溜走或被误管理。重新审视你的实际基础。'}},
{id:65, name:'Two of Pentacles', nameCN:'星币二', suit:'pentacles',
 upright:{kw:'Balance, adaptability, juggling priorities', kwCN:'平衡·适应性·平衡优先事项',
  meaning:'The figure dances with two coins in an infinity loop. Life is a juggling act—stay flexible, prioritize wisely, and find the rhythm.',
  meaningCN:'人物在无限循环中舞动着两枚硬币。生活是一种杂耍——保持灵活，明智地排列优先顺序，找到节奏。'},
 reversed:{kw:'Disorganization, overwhelm, financial imbalance', kwCN:'混乱·不堪重负·财务失衡',
  meaning:'Too many balls in the air are dropping. Simplify, delegate, and bring practical order to the chaos.',
  meaningCN:'空中的球太多正在掉落。简化、委托，并将实际秩序带入混乱。'}},
{id:66, name:'Three of Pentacles', nameCN:'星币三', suit:'pentacles',
 upright:{kw:'Teamwork, mastery, collaboration, quality craftsmanship', kwCN:'团队合作·精通·协作·精湛工艺',
  meaning:'Architect, monk, and craftsman collaborate—each skill valued. Excellent results emerge from genuine teamwork and respect for expertise.',
  meaningCN:'建筑师、僧侣和工匠合作——每种技能都受到重视。出色的结果来自真正的团队合作和对专业知识的尊重。'},
 reversed:{kw:'Lack of teamwork, poor planning, conflict within groups', kwCN:'缺乏团队合作·糟糕规划·群体内部冲突',
  meaning:'Collaboration is breaking down due to ego or poor communication. Re-establish shared purpose and mutual respect.',
  meaningCN:'合作因自我或糟糕沟通而瓦解。重新建立共同目的和相互尊重。'}},
{id:67, name:'Four of Pentacles', nameCN:'星币四', suit:'pentacles',
 upright:{kw:'Security, stability, conservatism, holding tight', kwCN:'安全·稳定·保守·紧握',
  meaning:'The figure clings tightly to four coins. Security is important—but hoarding creates stagnation. Practice healthy stewardship rather than fearful clinging.',
  meaningCN:'人物紧紧抓住四枚硬币。安全感很重要——但囤积会造成停滞。练习健康的管理而非恐惧的紧握。'},
 reversed:{kw:'Over-spending, greed, loss of security, releasing control', kwCN:'过度消费·贪婪·失去安全感·释放控制',
  meaning:'Either reckless spending or extreme hoarding is destabilizing finances. Find the wise middle path.',
  meaningCN:'无论是鲁莽消费还是极端囤积都在破坏财务稳定。找到明智的中间道路。'}},
{id:68, name:'Five of Pentacles', nameCN:'星币五', suit:'pentacles',
 upright:{kw:'Financial loss, hardship, poverty, isolation', kwCN:'财务损失·困难·贫乏·孤立',
  meaning:'Two figures pass a lit church window in the cold—help is closer than they realize. Reach out; do not let pride or shame block you from receiving support.',
  meaningCN:'两个人物在寒冷中经过一扇亮着灯的教堂窗户——帮助比他们意识到的更近。伸出手；不要让骄傲或羞耻阻止你接受支持。'},
 reversed:{kw:'Recovery, improved finances, spiritual poverty fading', kwCN:'恢复·财务改善·精神贫乏消退',
  meaning:'The worst of the hardship is passing. Recovery and renewed hope are taking hold.',
  meaningCN:'最艰难的时期正在过去。恢复和新的希望正在生根。'}},
{id:69, name:'Six of Pentacles', nameCN:'星币六', suit:'pentacles',
 upright:{kw:'Generosity, charity, giving and receiving, fair exchange', kwCN:'慷慨·慈善·给予与接受·公平交换',
  meaning:'A merchant weighs out coins for those in need. Generosity flows in both directions. Whether giving or receiving, do so with grace and without attachment.',
  meaningCN:'一位商人为有需要的人称出硬币。慷慨双向流动。无论是给予还是接受，都以优雅而无执着地进行。'},
 reversed:{kw:'Debt, strings attached, one-sided giving, selfishness', kwCN:'债务·附带条件·单向给予·自私',
  meaning:'Giving comes with strings, or taking is becoming exploitative. Re-examine the balance of exchange.',
  meaningCN:'给予附带条件，或索取变得具有剥削性。重新审视交换的平衡。'}},
{id:70, name:'Seven of Pentacles', nameCN:'星币七', suit:'pentacles',
 upright:{kw:'Long-term vision, patience, harvest, sustained effort', kwCN:'长远视野·耐心·收获·持续努力',
  meaning:'The farmer pauses to assess a growing crop. Patient, sustained effort yields real harvest. Trust the slow rhythm of organic growth.',
  meaningCN:'农民暂停评估正在生长的庄稼。耐心、持续的努力带来真实的收获。信任有机增长的缓慢节奏。'},
 reversed:{kw:'Impatience, wasted effort, poor returns, lack of growth', kwCN:'不耐烦·浪费努力·回报不佳·缺乏成长',
  meaning:'Impatience or misdirected effort is preventing a real harvest. Reassess your methods.',
  meaningCN:'不耐烦或方向错误的努力阻止了真正的收获。重新评估你的方法。'}},
{id:71, name:'Eight of Pentacles', nameCN:'星币八', suit:'pentacles',
 upright:{kw:'Diligence, skill-building, mastery, dedicated practice', kwCN:'勤奋·技能培养·精通·专注练习',
  meaning:'The craftsman carves coin after coin with total focus. Excellence emerges from devoted, repetitive practice. Commit to mastery.',
  meaningCN:'工匠全神贯注地一枚接一枚地雕刻硬币。卓越来自专注、重复的练习。致力于精通。'},
 reversed:{kw:'Perfectionism, misdirected effort, lack of focus, shortcuts', kwCN:'完美主义·方向错误的努力·缺乏专注·走捷径',
  meaning:'Perfectionism or misplaced effort is blocking real mastery. Progress over perfection.',
  meaningCN:'完美主义或放错地方的努力阻碍了真正的精通。进步胜过完美。'}},
{id:72, name:'Nine of Pentacles', nameCN:'星币九', suit:'pentacles',
 upright:{kw:'Abundance, self-sufficiency, luxury, achievement', kwCN:'丰盛·自给自足·奢华·成就',
  meaning:'A figure of refined elegance stands in a lush garden—the fruit of patient, independent effort. You have built real self-sufficiency. Enjoy it fully.',
  meaningCN:'一个精致优雅的人物站在郁郁葱葱的花园中——耐心、独立努力的成果。你已经建立了真正的自给自足。充分享受它。'},
 reversed:{kw:'Financial setbacks, over-reliance, loss of independence', kwCN:'财务挫折·过度依赖·失去独立性',
  meaning:'Financial setbacks or unhealthy dependency are undermining your hard-won independence. Reclaim your self-sufficiency.',
  meaningCN:'财务挫折或不健康的依赖正在破坏你来之不易的独立性。夺回你的自给自足。'}},
{id:73, name:'Ten of Pentacles', nameCN:'星币十', suit:'pentacles',
 upright:{kw:'Legacy, generational wealth, family stability, long-term success', kwCN:'遗产·跨代财富·家庭稳定·长期成功',
  meaning:'Three generations gather beneath an archway of coins—the pinnacle of material achievement and lasting legacy. You are building something that endures.',
  meaningCN:'三代人聚集在硬币拱门之下——物质成就和持久遗产的顶峰。你正在建立一些持久的东西。'},
 reversed:{kw:'Financial failure, unstable foundations, family conflict', kwCN:'财务失败·不稳定的基础·家庭冲突',
  meaning:'Family or financial foundations are cracking. Address structural issues before they escalate.',
  meaningCN:'家庭或财务基础正在破裂。在它们升级之前解决结构性问题。'}},
{id:74, name:'Page of Pentacles', nameCN:'星币侍从', suit:'pentacles',
 upright:{kw:'Ambition, diligence, new financial opportunity, learning', kwCN:'雄心·勤奋·新财务机会·学习',
  meaning:'The Page of Pentacles studies a golden coin with careful attention—a diligent student of practical skills. Start small, stay consistent, and build.',
  meaningCN:'星币侍从仔细地研究一枚金币——一个勤奋的实际技能学生。从小处开始，保持一致，并建立起来。'},
 reversed:{kw:'Procrastination, lack of progress, unrealistic goals', kwCN:'拖延·缺乏进展·不切实际的目标',
  meaning:'Procrastination or poor follow-through is blocking material progress. Take one concrete step today.',
  meaningCN:'拖延或跟进不力正在阻碍物质进展。今天迈出一个具体的步骤。'}},
{id:75, name:'Knight of Pentacles', nameCN:'星币骑士', suit:'pentacles',
 upright:{kw:'Hard work, responsibility, routine, methodical progress', kwCN:'努力工作·责任感·常规·有条不紊的进展',
  meaning:'The Knight of Pentacles moves steadily—no drama, no shortcuts. Methodical, reliable effort compounds into extraordinary results.',
  meaningCN:'星币骑士稳步前进——没有戏剧，没有捷径。有条不紊、可靠的努力积累成非凡的结果。'},
 reversed:{kw:'Stagnation, rigidity, boredom, stuck in routine', kwCN:'停滞·刻板·无聊·困于常规',
  meaning:'Rigid routine has become stagnating. Introduce measured change while maintaining core discipline.',
  meaningCN:'刻板的常规已经变成停滞。在保持核心纪律的同时引入适度的变化。'}},
{id:76, name:'Queen of Pentacles', nameCN:'星币女王', suit:'pentacles',
 upright:{kw:'Practicality, abundance, nurturing, down-to-earth wisdom', kwCN:'实际·丰盛·养育·脚踏实地的智慧',
  meaning:'The Queen of Pentacles creates a warm, abundant environment through practical wisdom and grounded care. Nurture yourself and your material world with equal love.',
  meaningCN:'星币女王通过实际智慧和脚踏实地的关怀创造温暖、丰盛的环境。以同等的爱养育你自己和你的物质世界。'},
 reversed:{kw:'Neglect of self-care, financial imbalance, smothering', kwCN:'忽视自我照顾·财务失衡·令人窒息',
  meaning:'Neglecting your own needs while over-nurturing others is creating imbalance. Tend to yourself first.',
  meaningCN:'在过度养育他人的同时忽视自己的需求正在造成失衡。首先照顾好自己。'}},
{id:77, name:'King of Pentacles', nameCN:'星币国王', suit:'pentacles',
 upright:{kw:'Wealth, security, mastery of the material, reliable leadership', kwCN:'财富·安全·物质精通·可靠领导力',
  meaning:'The King of Pentacles sits amid vines and coins—wealth built through patience, discipline, and deep practical mastery. Lead with reliable, abundant generosity.',
  meaningCN:'星币国王坐在藤蔓和硬币之间——通过耐心、纪律和深厚实际精通建立的财富。以可靠、丰盛的慷慨领导。'},
 reversed:{kw:'Greed, materialism, stubbornness, corruption', kwCN:'贪婪·物质主义·固执·腐败',
  meaning:'Obsession with security or material gain is crowding out deeper values. Reconnect with purpose beyond wealth.',
  meaningCN:'对安全感或物质收益的痴迷正在排挤更深层的价值观。重新连接财富之外的目的。'}}
];
