// waite.js — Rider-Waite card symbolism knowledge base
// Sourced from Arthur Edward Waite, "The Pictorial Key to the Tarot" (1910)
// sym: visual symbolism; up: upright divinatory meaning; rev: reversed meaning

const WAITE_LORE = {
  // ── MAJOR ARCANA ─────────────────────────────────────────────────────────────
  0: {
    sym: 'A carefree youth steps toward a precipice, white rose in hand, a small dog at his heels. He carries a bag on a wand — all his worldly goods — and looks skyward. The cliff represents the abyss of experience not yet entered; the rose, purity; the dog, earthly nature following behind.',
    symCN: '一个无忧的年轻人手持白玫瑰走向悬崖边缘，脚边跟着一只小狗。他把全部家当装在杖上的袋子里，仰望天空。悬崖代表尚未踏入的经验深渊；玫瑰象征纯真；小狗是紧随身后的尘世本性。',
    up:  'The spirit embarking on a journey into experience. Divine madness, the leap into the unknown; new beginnings before consequences are counted. Folly that may be wisdom; the soul before its first incarnation.',
    upCN: '灵魂即将踏入经验之旅。神圣的疯狂，纵身跃入未知；不计后果的全新开始。看似愚蠢实则可能是大智。',
    rev: 'Negligence, absence, carelessness, recklessness. The leap taken without any awareness at all. Apathy or vanity masquerading as freedom.',
    revCN: '疏忽、缺席、粗心、鲁莽。毫无觉知的盲目一跃。冷漠或虚荣伪装成自由。',
    love: { up: 'A thrilling new connection or phase — exciting but uncertain. Willingness to be vulnerable. An unconventional relationship that defies expectations.', rev: 'Fear of commitment, emotional recklessness. Running from intimacy or jumping in without discernment.', upCN: '一段令人兴奋的新连接——刺激但不确定。愿意展露脆弱。一段不走寻常路的感情。', revCN: '害怕承诺，情感上的鲁莽。逃避亲密或不加分辨地投入。' },
    work: { up: 'A bold career leap — startup, freelancing, a totally new field. Beginner energy that can surprise established players.', rev: 'Quitting impulsively, refusing to plan, ignoring practical realities of a career move.', upCN: '大胆的职业跳跃——创业、自由职业、全新领域。初生牛犊不怕虎的能量。', revCN: '冲动辞职，拒绝规划，忽视现实的职业变动。' },
    advice: { up: 'Trust the impulse but bring one anchor. The universe rewards those who leap — but pack your parachute.', rev: 'Pause. The freedom you seek is real, but right now you are running FROM something, not TOWARD something.', upCN: '相信直觉，但带上一个锚。宇宙奖励敢于跳跃的人——但别忘了带降落伞。', revCN: '暂停。你追求的自由是真实的，但此刻你是在逃离某事，而非奔向某事。' }
  },
  1: {
    sym: 'A young magician stands before a table bearing the four suit symbols. One hand raises a wand to heaven, the other points to earth — the great Hermetic formula: "As above, so below." The lemniscate (∞) floats above his head; a serpent biting its tail girds his waist. He commands the elements and channels divine will into matter.',
    symCN: '一位年轻魔法师站在摆放着四种牌组符号的桌前。一手举杖指天，一手指地——赫密士法则："如其在上，如其在下。"无限符号(∞)悬于头顶；衔尾蛇环绕腰间。他掌控元素，将神圣意志导入物质。',
    up:  'Will, skill, self-mastery, and the power to manifest. The capacity to use all resources at hand. Confidence, initiative, and the conscious direction of force. Can indicate the querent himself as the active agent.',
    upCN: '意志、技能、自我掌控与显化力量。运用手中一切资源的能力。自信、主动、有意识地引导力量。',
    rev: 'Misuse of talent, cunning without conscience, trickery. Mental disease or willpower turned against oneself. Skill employed in deception.',
    revCN: '才能的滥用，没有良知的狡猾，欺骗。意志力反噬自身。技能被用于蒙蔽。',
    love: { up: 'Magnetic attraction, conscious chemistry. You have what it takes to create the relationship you want — communicate clearly.', rev: 'Manipulation in love, someone not showing their true self. Charm used as a weapon.', upCN: '磁性吸引，有意识的化学反应。你有能力创造你想要的关系——清晰沟通。', revCN: '感情中的操控，有人没有展现真实自我。魅力被当作武器使用。' },
    work: { up: 'You have all the tools — now use them. Launch the project, pitch the idea, take initiative. Mastery through deliberate action.', rev: 'Scattered focus, wasted talent, or someone at work playing political games.', upCN: '你已拥有所有工具——现在就用。启动项目、提出创意、主动出击。', revCN: '注意力分散，浪费才华，或职场中有人在玩弄权术。' },
    advice: { up: 'Stop waiting for permission. You already have everything you need — the only missing ingredient is your decision to act.', rev: 'Check your motives. Are you creating something real or just performing competence?', upCN: '别再等别人的许可。你已拥有所需的一切——唯一缺少的是你行动的决定。', revCN: '审视你的动机。你是在创造真实的东西，还是只是在表演能力？' }
  },
  2: {
    sym: 'She sits between two pillars — one black, one white, marked B and J — the pillars of the Temple. She holds a scroll partly concealed by her mantle (secret knowledge revealed only in part). The veil behind her is embroidered with palms and pomegranates. The lunar crescent is at her feet; she wears a cross on her breast. She is the keeper of hidden things, the unspoken law.',
    up:  'Mystery, the unrevealed future, hidden knowledge; wisdom that cannot be spoken. Silence, tenacity, the feminine principle of receptive knowing. What lies beneath the surface of events.',
    rev: 'Passion overriding wisdom; surface knowledge mistaken for depth; conceit and premature disclosure. What should remain hidden is exposed too soon.',
    love: { up: 'Trust your intuition about this person. Something is not yet revealed — wait before deciding. A deeply intuitive partner or potential lover who holds back.', rev: 'Secrets in the relationship. Someone is hiding their true feelings or intentions. Don\'t confuse mystery with depth.', upCN: '相信你对这个人的直觉。有些事尚未揭示——做决定前先等等。', revCN: '感情中有秘密。有人隐藏了真实感受或意图。别把神秘感误当深度。' },
    work: { up: 'Information is being withheld — investigate before acting. Hidden dynamics in the workplace. Trust your gut about the timing.', rev: 'You\'re overthinking this. Analysis paralysis. Or: someone is leaking information that should be private.', upCN: '有信息被隐瞒——行动前先调查。职场中有隐藏的动态。相信你对时机的直觉。', revCN: '你想太多了。分析瘫痪。或者：有人在泄露本应保密的信息。' },
    advice: { up: 'Be still. The answer will come, but not through action — through listening. What you need to know is already whispering.', rev: 'Stop guarding the secret. Whatever you\'re holding back is costing you more than sharing it would.', upCN: '安静下来。答案会来，但不是通过行动——而是通过倾听。你需要知道的已经在低语。', revCN: '别再守着秘密了。你隐瞒的东西带来的代价，比分享它大得多。' }
  },
  3: {
    sym: 'An abundant, queenly figure seated in a lush garden, crowned with twelve stars, the symbol of Venus on her shield. Corn ripens before her; a waterfall flows behind. She is the earthly paradise, universal fecundity, the generative power of nature. Everything that grows and flourishes comes under her domain.',
    up:  'Fruitfulness, abundance, creativity, and the fertility of both nature and action. Initiative, material prosperity, the nurturing of life. Pregnancy in all senses — of body, mind, and project.',
    rev: 'Creative blockage, sterility, vacillation. Light and truth may emerge, but also difficulty, doubt, and incomplete growth. What was planted is struggling to ripen.',
    love: { up: 'Deep sensuality, nurturing love, possible pregnancy or birth of something precious. A relationship entering its most fertile phase.', rev: 'Smothering love, codependency, fertility issues (literal or creative). Neglecting your own needs while nurturing others.' },
    work: { up: 'Projects flourishing, creative abundance, financial growth. A mentor or maternal figure supports you. Excellent time to launch.', rev: 'Creative block, project stalling, burnout from overgiving. Your garden needs tending before it can feed others.' },
    advice: { up: 'Nurture what you\'ve planted — it\'s growing. Create the conditions for growth rather than forcing the bloom.', rev: 'You\'re pouring from an empty cup. Rest, replenish, then create. The blockage is not in the project — it\'s in you.' }
  },
  4: {
    sym: 'A crowned emperor sits on a throne decorated with rams\' heads (Aries — the initiating force), holding a sceptre in the form of the ankh and a globe. He is the power of the world made orderly — executive force, the capacity to govern and to build structures that endure.',
    up:  'Stability, authority, protection, and worldly power. Rational order imposed on chaos. Realization through will. A figure of paternal authority or the querent\'s own capacity to lead and decide.',
    rev: 'Authority become domination; rigidity, immaturity, or the abuse of power. Compassion absent from authority. Obstruction from those in power.',
    love: { up: 'A stable, protective partner. The relationship needs structure and commitment now — define what you are. Loyalty expressed through action, not words.', rev: 'Control issues, domineering partner, or emotional unavailability masked as "being strong." Power imbalance in the relationship.' },
    work: { up: 'Take charge. Build the system, set the rules, establish the foundation. Leadership and strategic thinking rewarded.', rev: 'Micromanagement, rigid hierarchy, a boss who won\'t listen. Or: your own refusal to delegate and trust.' },
    advice: { up: 'Impose order on the chaos. You have the authority — use it with wisdom, not force.', rev: 'Loosen your grip. Control is not the same as strength. What are you so afraid of losing?' }
  },
  5: {
    sym: 'The Hierophant (Pope) sits between two pillars of a different temple — the outer church, not the inner sanctum of the High Priestess. He wears the triple crown, holds a triple cross, and makes the sign of esoteric benediction. At his feet are crossed keys. Two ministers kneel before him. He is the channel of institutional wisdom, the bridge between heaven and earthly religion.',
    up:  'Tradition, established religion, and the wisdom held in institutions. Formal teaching, initiation into a tradition, marriage. The comfort of inherited forms and ritual. A guide or counsellor.',
    rev: 'Rigid adherence to outer form over inner meaning. Weakness through over-conformity. Society\'s expectations conflicting with personal truth. Overkindness that enables rather than helps.',
    love: { up: 'Commitment, engagement, marriage. A relationship blessed by tradition or community. Seeking counsel from a trusted advisor about love.', rev: 'Social pressure to conform in relationships. Staying together "because you should." Questioning whether the conventional path is your path.' },
    work: { up: 'Follow established procedures. A mentor, teacher, or institutional path opens doors. Formal education or certification pays off.', rev: 'Bureaucracy blocking progress. Blind conformity killing innovation. Time to question "how things have always been done."' },
    advice: { up: 'There is wisdom in tradition — don\'t reinvent the wheel. Seek a teacher or guide. The answers exist; find who holds them.', rev: 'The rules no longer serve you. What felt like guidance has become a cage. Trust your own spiritual authority.' }
  },
  6: {
    sym: 'Two figures — male and female — stand unveiled before each other beneath a great angel with outstretched arms. Behind the man is the Tree of Life with twelve fruits; behind the woman, the Tree of Knowledge with the serpent. This is the Garden before and at the moment of the Fall — love and choice intertwined, the mystery of attraction.',
    up:  'Love, attraction, and union — but also the sacred test of choice. Beauty, desire, and the alignment of values. The union of opposites that creates something greater than either alone.',
    rev: 'Failure through wrong choices; love frustrated or distorted; inner division. Foolish desires pursued at the expense of wisdom. The Fall without the eventual redemption.',
    love: { up: 'Deep romantic connection, soulmate energy, a choice that defines your heart. The relationship that changes everything. Vulnerability as the gateway to love.', rev: 'Temptation, infidelity, a relationship built on desire without depth. Choosing the wrong person for the right reasons, or the right person for wrong reasons.' },
    work: { up: 'A partnership or collaboration that creates synergy. Aligning passion with work. A choice between two paths that both appeal.', rev: 'Business partnership gone wrong. Choosing the easy path over the right one. Divided loyalties at work.' },
    advice: { up: 'Choose with your whole self — heart AND mind. This is not a moment for half-measures. What you choose now echoes.', rev: 'The temptation is real but the cost is hidden. Look at what you\'re actually choosing, not what you wish you were choosing.' }
  },
  7: {
    sym: 'A prince in armour rides a chariot drawn by two sphinxes — one black, one white — without reins; he commands them by will alone. His armour bears lunar crescents; the canopy above him is starred. He is the victory of mind over conflicting forces, the mastery achieved through an act of the interior will.',
    up:  'Triumph through discipline and self-mastery. Success won by controlling opposing forces through will rather than force. Conquest on all planes — in thought, science, and endeavour.',
    rev: 'Loss of control, riot, defeat through inner conflict. The sphinxes pulling in opposite directions. Victory attempted without the necessary inner preparation.',
    love: { up: 'Pursuing love with confidence and determination. Overcoming obstacles in a relationship through sheer will. Moving the relationship forward decisively.', rev: 'Trying to force a relationship to work through willpower alone. Aggression in love, or a relationship careening out of control.' },
    work: { up: 'Victory, promotion, success through focused drive. Overcoming competition. Travel for work. A breakthrough after sustained effort.', rev: 'Burnout from overdriving. Road rage in career — aggression without direction. Losing control of a project.' },
    advice: { up: 'Hold the reins with your mind, not your hands. The opposing forces in your life can be harnessed — but only through inner alignment, not brute force.', rev: 'Stop forcing it. You\'re spending willpower on a battle that requires wisdom instead. Pull over and recalibrate.' }
  },
  8: {
    sym: 'A woman — serene, unafraid — closes the jaws of a lion with garlands of flowers. The lemniscate floats above her head as it does the Magician\'s. She does not wrestle the beast; she has already subdued it through a quality Waite names as Fortitude: "the confidence of those whose strength is God." The lion represents the passions; she, the higher nature in liberation.',
    up:  'Strength that does not force but transforms. Courage, magnanimity, patience, and the quiet power of the self that has mastered its animal nature. The lion yielding to love rather than being overpowered.',
    rev: 'Weakness, abuse of power, or strength turned to cruelty. Discord arising from unmastered impulses. Despotism that arises precisely where true strength is absent.',
    love: { up: 'Patient, compassionate love that tames the wildness in both partners. The courage to be gentle. A relationship that requires (and rewards) emotional fortitude.', rev: 'Emotional volatility, self-doubt eroding the relationship. Trying to control a partner through force rather than understanding.' },
    work: { up: 'Quiet persistence wins. Handle the difficult colleague or impossible deadline with grace, not aggression. Inner reserves you didn\'t know you had.', rev: 'Impostor syndrome, losing confidence at the critical moment. Or: using position to bully rather than lead.' },
    advice: { up: 'The lion is not your enemy — it\'s your raw power waiting to be befriended. Approach what frightens you with gentleness.', rev: 'You\'re either suppressing your power or misusing it. Neither works. Find the middle: strength held in love.' }
  },
  9: {
    sym: 'A cloaked elder stands on a mountain height, holding a lantern with a six-pointed star inside. He is not merely seeking truth — he has found it and holds it up. Waite: "where I am, you also may be." The hermit\'s solitude is not isolation but the condition of becoming a lighthouse for others.',
    up:  'Prudence, inner knowing, the wisdom earned through experience and withdrawal. A guide who illuminates. Circumspection before action. The counsel of deep reflection.',
    rev: 'Concealment, withdrawal from fear rather than wisdom. Dissimulation, excessive caution that becomes its own trap. Roguery disguised as wisdom.',
    love: { up: 'A period of solitude that deepens self-knowledge before love. An older or wiser partner. The relationship that begins in genuine understanding, not infatuation.', rev: 'Isolation mistaken for independence. Pushing people away out of fear. Loneliness romanticized as spiritual growth.' },
    work: { up: 'Deep research, solo work, mentoring. Step back from the noise to find the real answer. A period of strategic withdrawal before your next move.', rev: 'Isolating yourself from the team. Overthinking until the opportunity passes. Wisdom that never translates into action.' },
    advice: { up: 'Go inward. The answer is not in more information — it\'s in the silence where you finally hear yourself think.', rev: 'You\'ve been alone long enough. The lantern is meant to be held up for others, not hidden under your cloak.' }
  },
  10: {
    sym: 'A great wheel turns in the sky. On its rim descend the serpent of Set and ascend the jackal-headed Hermanubis; a sphinx sits atop with a sword. The letters TARO (and ROTA) are inscribed with the Tetragrammaton. The four fixed signs of the zodiac appear in the corners — the stability that surrounds inevitable change.',
    up:  'Destiny turning. Fortune, success, elevation, luck, and the felicity of a moment when cycles align in one\'s favour. Unexpected turn of events that brings opportunity.',
    rev: 'Increase and abundance — this card\'s reversal is unusual in being also fortunate in some readings. But also: the wheel turns against you; circumstances outside your control shifting unfavourably.',
    love: { up: 'A fated encounter, luck in love, a relationship entering a new cycle. What\'s meant for you is arriving. Karmic connections.', rev: 'Bad luck in love — but temporary. A cycle ending. The relationship you\'re clinging to may be at its natural turning point.' },
    work: { up: 'Lucky break, unexpected opportunity, promotion or windfall. The cycle favours you — act now while the wheel is rising.', rev: 'Downturn, setback, forces beyond your control. But remember: the wheel always turns again. This low point is not permanent.' },
    advice: { up: 'This is your moment. The universe is conspiring in your favour — don\'t hesitate, ride the momentum.', rev: 'You cannot stop the wheel. What you can do is choose how to meet the turn: with grace, or with resistance that adds suffering.' }
  },
  11: {
    sym: 'A crowned figure sits between two pillars (like the High Priestess), holding perfectly balanced scales in one hand, a raised sword in the other. She is the principle of cosmic equity — not human law but the deeper law of cause and consequence.',
    up:  'Equity, fairness, rightness. Decisions made with clear judgment. Legal matters resolved justly. The triumph of the deserving side. What is owed comes due.',
    rev: 'Law become rigid and mechanical; bigotry, bias, excessive severity. Justice delayed or distorted by institutional complication.',
    love: { up: 'Fairness and honesty in love. A relationship that must be balanced to survive. Legal matters (divorce, custody) resolving fairly. Accountability.', rev: 'Unfair treatment in love. One partner giving far more. Legal complications. Refusing to see your own part in the problem.' },
    work: { up: 'Contracts, negotiations, legal matters resolved in your favour. Ethical decisions rewarded. Accountability bringing clarity.', rev: 'Workplace injustice, legal setbacks, unfair treatment. Dishonesty catching up with someone. Red tape blocking progress.' },
    advice: { up: 'Be honest — with yourself first, then with others. The truth is the sword; fairness is the scales. Both are needed.', rev: 'Something is out of balance and you know it. Stop pretending the scales are even when they\'re not.' }
  },
  12: {
    sym: 'A man hangs by one foot from a living tree (the Tree of Life), his other leg crossed to form the figure 4. His expression is calm — even illuminated. He has chosen suspension; he is not a victim but an initiate. Waite: this is wisdom through sacrifice, the reversal of the ordinary world\'s values as the path to seeing clearly.',
    up:  'Wisdom gained through suspension and surrender. Sacrifice that yields insight. Seeing the world from an inverted angle. Circumspection, prophecy, and the intuition that comes when action ceases.',
    rev: 'Selfishness, the crowd, body politic — clinging to the self\'s advantage when the deeper call is to let go. The sacrifice refused.',
    love: { up: 'Letting go of what you think love should look like. A relationship that asks you to surrender control. Seeing your partner from a completely new angle.', rev: 'Martyrdom in love — sacrificing endlessly without growth. Refusing to let go of a dead relationship. Stalling.' },
    work: { up: 'Pause. The delay is the lesson. What looks like stagnation is actually incubation. A perspective shift that changes everything about how you work.', rev: 'Stuck in a job you should have left. Sacrificing your wellbeing for a company that won\'t reciprocate. Indecision as avoidance.' },
    advice: { up: 'Stop fighting the suspension. You\'re not stuck — you\'re seeing things from the only angle that reveals the truth. Let gravity teach you.', rev: 'The sacrifice you\'re making is not sacred — it\'s just habit. What would happen if you simply… stopped hanging there and walked away?' }
  },
  13: {
    sym: 'A skeleton in armour rides a white horse and carries a black banner bearing a white rose. Kings, priests, and maidens lie beneath or bow before him; a child offers flowers. No figure is spared. In the distance, two towers stand between a rising sun. He is not merely death but transformation — the end that makes new beginning possible.',
    up:  'Transformation and ending — the destruction that clears the ground. Mortality in all its forms. The loss of what was so that what can be may emerge. Change that cannot be avoided or bargained with.',
    rev: 'Inertia, lethargy, stagnation. Transformation blocked. The living death of refusing to let things change. Hope destroyed by the refusal to let go.',
    love: { up: 'A relationship transforming fundamentally — or ending to make room for something new. The death of an old pattern of loving. Grief that opens the heart.', rev: 'Clinging to a dead relationship. Fear of being alone blocking necessary change. The slow poison of staying when you should go.' },
    work: { up: 'Career transformation, end of a chapter. Layoff, closing, or radical pivot that is painful but ultimately liberating. Out with the old.', rev: 'Staying in a dead-end job out of fear. Resisting the industry change that\'s already happened. Professional stagnation.' },
    advice: { up: 'Let it die. What falls away was already finished — you were just the last to know. The sunrise behind the towers is real.', rev: 'You know what needs to end. Every day you delay is a day stolen from what comes next.' }
  },
  14: {
    sym: 'A winged figure — one foot on land, one in water — pours liquid between two cups, neither spilling a drop. On his robe is a triangle within a square: the union of form and spirit. A path leads toward a distant sun crown. This is the art of alchemy: the tempering of opposites into a third thing.',
    up:  'Economy, moderation, the patience that achieves synthesis. Accommodation and management. The middle way that doesn\'t sacrifice depth. Healing through the right mixing of elements.',
    rev: 'Disunion, competing interests, unfortunate combinations. What should be mixed is being kept separate, or mixed in the wrong proportions. Sometimes: the priesthood, religious institutions.',
    love: { up: 'Balance, patience, blending two lives together skillfully. Compromise that enriches rather than diminishes. Healing after conflict. A relationship finding its rhythm.', rev: 'Imbalance, extremes, someone giving too much or too little. The relationship mixture is off — recalibrate before it curdles.' },
    work: { up: 'Balanced approach paying off. Good management, budgeting, the right mix of effort and rest. A project coming together through patient integration.', rev: 'Work-life imbalance. Too many competing priorities. Trying to mix things that don\'t belong together.' },
    advice: { up: 'The middle path is not mediocrity — it\'s mastery. Pour slowly between the cups. The alchemy takes patience.', rev: 'Something in your life is out of proportion. More of one thing, less of another. You already know which.' }
  },
  15: {
    sym: 'A horned figure — part goat, part bat — sits enthroned above two chained figures who are nude but have grown tails and horns themselves. The chains are loose — they could slip free, but they do not. The torch he holds burns downward. He is not evil per se but the chains of matter and appetite that we mistake for necessity.',
    up:  'The binding power of material desire and instinct. Bondage that is partly chosen. Fatality, extraordinary effort, force — what seems predestined but is not necessarily evil. The shadow self.',
    rev: 'Evil fatality, weakness, blindness. The compulsions that are fully destructive. Pettiness mistaken for passion.',
    love: { up: 'Intense sexual attraction, obsession, codependency. A relationship that feels fated but may be a cage. The chains are loose — you can leave but you choose not to.', rev: 'Breaking free from a toxic relationship. Or: the addiction deepening. The shadow side of love fully manifested.' },
    work: { up: 'Golden handcuffs, workaholic patterns, feeling trapped by salary or status. The job that owns you. Materialism as a career driver.', rev: 'Breaking free from an oppressive work situation. Or: complete surrender to harmful patterns — addiction, corruption, self-destruction.' },
    advice: { up: 'Look at the chains. They\'re loose. You are not trapped — you are attached. Name the attachment and its power diminishes.', rev: 'The shadow has been running the show. It\'s time to face what you\'ve been feeding in the dark.' }
  },
  16: {
    sym: 'A tower struck by lightning: the crown at its top blown off, two figures falling from the burning battlements into darkness. The tower was built by human ambition and pride on a false foundation; the lightning is divine correction. It is catastrophic but necessary.',
    up:  'Catastrophic collapse of what was built on false foundations. Ruin, upheaval, disruption — often sudden and unforeseen. But the collapse clears the ground for something real.',
    rev: 'The same forces, somewhat diminished. Oppression, imprisonment, tyranny. The tower hasn\'t fallen yet but the pressure is building.',
    love: { up: 'Sudden breakup, revelation that shatters the relationship\'s foundation. Painful but truthful. A lie exposed. But also: the collapse of a wall between two people that allows real intimacy.', rev: 'The relationship is crumbling slowly. The truth is coming but you\'re delaying it. Trapped in a structure that no longer serves.' },
    work: { up: 'Company collapse, sudden firing, project destroyed. The ego-built career structure crumbling. Painful but ultimately liberating — the foundation was false.', rev: 'Sensing the collapse coming but doing nothing. A toxic workplace that hasn\'t quite imploded yet. Prepare your exit.' },
    advice: { up: 'Don\'t rebuild the tower. Let the rubble settle. What was destroyed needed destroying — the lightning is not your enemy, it\'s your liberator.', rev: 'The cracks are visible. You can either step out now or wait for the collapse. One is a choice; the other is not.' }
  },
  17: {
    sym: 'A woman kneels at the edge of water, pouring from two jugs — one into the water, one onto land. Above her, eight stars (one large, eight-pointed) illuminate the night sky. She is the naked truth after the catastrophe of the Tower: hope restored to a world emptied out.',
    up:  'Hope, renewed faith, the star that guides after darkness. Spiritual insight, serenity, and the sense of being watched over. But Waite also notes: loss, theft, privation — this star shines for those who have already known loss.',
    rev: 'Arrogance, impotence, pride that prevents receiving the gift of hope. The star still shines but one turns away from it.',
    love: { up: 'Renewed hope after heartbreak. A love that heals. Faith that the right person exists. Spiritual connection in a relationship. Vulnerability as beauty.', rev: 'Losing faith in love. Cynicism blocking connection. The hope is there but you refuse to see it — ask yourself why.' },
    work: { up: 'Inspiration, creative flow, being guided toward your true vocation. Recovery after professional setback. A sign that you\'re on the right path.', rev: 'Losing faith in your career path. Creative drought. The inspiration is blocked by your own pride or despair.' },
    advice: { up: 'Pour yourself out — into the world, into the water, into the earth. The star refills what you give. Hope is not naive; it\'s the bravest thing left after the tower falls.', rev: 'Look up. The star is still there. Your despair is a choice — and so is your hope.' }
  },
  18: {
    sym: 'Two towers stand on either side of a path that winds into the distance. A crayfish emerges from a pool (the unconscious surfacing). A dog and wolf howl at the moon. Drops fall from the lunar face. The moon sheds a dim, reflected light — enough to move by but not to see clearly. The path through the unconscious is necessary but treacherous.',
    up:  'The realm of the unconscious, instinct, and what lies hidden. Hidden enemies, danger, illusion, and self-deception. The dark night of the soul; occult forces; things that lurk beneath the surface of mind.',
    rev: 'Lesser degrees of deception; instability, silence. The moon\'s influence diminished — but the unconscious is still there, just less overwhelming.',
    love: { up: 'Confusion, illusion, or deception in a relationship. Something is not as it seems. Powerful emotions that distort perception. Trust your instincts over their words.', rev: 'The fog is lifting slightly. Truths emerging about a relationship. But be patient — full clarity hasn\'t arrived yet.' },
    work: { up: 'Deception in the workplace, unclear politics, hidden agendas. Don\'t sign anything. Trust your gut but verify everything. Creative work benefits from this dreamy energy.', rev: 'Workplace confusion beginning to clear. Still proceed with caution — not all is revealed yet.' },
    advice: { up: 'Walk the path but don\'t trust what you see. The moonlight lies. Stay close to your instincts — the dog and wolf know things your mind doesn\'t.', rev: 'The worst of the confusion is passing. But don\'t rush into the light — let your eyes adjust slowly.' }
  },
  19: {
    sym: 'A great radiant sun blazes in the sky over two children dancing in a garden, or a child on a white horse holding a red banner. Sunflowers turn toward the light. Everything is illuminated; the unconscious fears of the Moon are banished. This is the card of clear consciousness, joy, and vital success.',
    up:  'Material happiness, success, vitality, and the joy of being fully alive and seen. Fortunate marriage, contentment, the warmth of achievement. The light that follows the dark.',
    rev: 'The same gifts in lesser degree. The sun still shines but perhaps behind clouds — joy muted, success delayed or partial.',
    love: { up: 'Joy, happiness, a relationship bathed in warmth and clarity. Everything is illuminated — no secrets, no games. Children, celebration, vitality in love.', rev: 'Happiness delayed but not denied. A relationship that\'s mostly good but something dims the full joy. Temporary clouds.' },
    work: { up: 'Success, recognition, vitality. The project shines. Public acknowledgment of your work. Everything coming together in the light.', rev: 'Success with caveats. The win is real but something is slightly off. Don\'t let minor clouds obscure genuine achievement.' },
    advice: { up: 'Celebrate. You\'ve earned this light. Let the warmth in without immediately worrying about what comes next.', rev: 'The sun is still shining — you\'re just not looking at it. Shift your gaze from what\'s wrong to what\'s blazingly right.' }
  },
  20: {
    sym: 'A great angel blows a trumpet from a cloud while figures rise from their graves below, arms outstretched. Men, women, and children answer the call. This is the Last Judgment — not condemnation but summoning. The call to account, to rise and be counted, to answer the deepest question of one\'s life.',
    up:  'Awakening, renewal, a decisive call to change. Change of position, the final outcome becoming clear. The moment of judgment that is also the moment of liberation. Hearing the call you have been waiting for.',
    rev: 'Weakness, delay, the call heard but not answered. Indecision at the crucial moment. Deliberation that becomes evasion.',
    love: { up: 'A relationship reaching its reckoning. The call to commit or release. Past lovers returning for resolution. A love reborn after being given up for dead.', rev: 'Avoiding the difficult conversation that would free you both. The call to change in love that you pretend not to hear.' },
    work: { up: 'Career calling, vocation found, a decisive professional moment. Being judged fairly for your work — and rising to the occasion. The moment of reckoning that is also the moment of breakthrough.', rev: 'Missing your moment. The opportunity calls but you hesitate. Self-doubt at the threshold of professional transformation.' },
    advice: { up: 'Answer the call. Rise. The trumpet is sounding for YOU — not someday, not for someone else. This is the moment of reckoning and rebirth.', rev: 'You hear the trumpet. Stop pretending you don\'t. What are you waiting for — permission? You already have it.' }
  },
  21: {
    sym: 'A dancing figure — wreathed in laurel, holding wands — moves within an oval wreath, a symbol of the complete cycle. In the four corners: the four fixed signs, the four evangelists. She dances within the completed world. This is the successful completion of the great journey: the Fool\'s leap has become the World\'s dance.',
    up:  'Completion, integration, and assured success. The journey completed; voyage, movement, the world opening up. The synthesis that contains everything — all suits, all elements, all experience.',
    rev: 'Stagnation, fixity, refusal to move. The world completed but not yet entered. Inertia at the threshold of fulfilment.',
    love: { up: 'A relationship reaching its fullest expression. Travel together, shared achievement, the love that contains everything. Wholeness within union.', rev: 'So close to completion but holding back. Fear of the next cycle. A relationship that\'s outgrown its current form but refuses to evolve.' },
    work: { up: 'Project completed triumphantly. Career achievement, international recognition, the culmination of years of work. The world literally opens up to you.', rev: 'Almost there but not quite. The finish line is visible but you\'ve stopped running. Unfinished business blocking the next chapter.' },
    advice: { up: 'Dance. The journey is complete — not over, but complete. Let the integration happen. You contain everything you need for the next cycle.', rev: 'You\'re standing at the threshold of completion, looking backward. Turn around. The wreath is waiting for you to step through.' }
  },

  // ── WANDS (22-35: King, Queen, Knight, Page, 10 down to Ace) ────────────────
  22: { sym: 'King of Wands — a dark, ardent man on a throne with a salamander backing; he holds a living wand.', up: 'Honest, conscientious, a dark married man. Unexpected news of heritage. Friendly leadership, passion wielded with wisdom.', rev: 'Good but severe, austere yet tolerant. The fire contained rather than released.' },
  23: { sym: 'Queen of Wands — magnetic, confident, a cat at her feet and sunflowers around her; she holds a wand and a sunflower.', up: 'A dark, friendly, chaste, and loving woman. Success in business; when beside a man, she is disposed toward him.', rev: 'Economical, obliging — but also potential for jealousy, opposition, or deceit.' },
  24: { sym: 'Knight of Wands — riding urgently through a landscape of pyramids; his wand is short and his horse mid-leap.', up: 'Departure, flight, absence, emigration. Change of residence. A dark young man in motion.', rev: 'Rupture, division, interruption, discord. The departure that breaks something.' },
  25: { sym: 'Page of Wands — a young man in feathered hat holding a wand aloft, studying it like a proclamation.', up: 'A faithful dark young man, an envoy or lover; family news. He bears favourable witness.', rev: 'Evil news, announcements that wound. Indecision and the instability that accompanies it.' },
  26: { sym: 'Ten of Wands — a figure bent under the weight of ten staves, carrying them toward a distant town.', up: 'Oppression, burden, overextension. Fortune and success weighted down by their own demands. False-seeming, disguise, perfidy.', rev: 'Contrarieties, difficulties, intrigues.' },
  27: { sym: 'Nine of Wands — a wounded man leans on one staff; eight are ranged behind him like a palisade.', up: 'Strength in opposition, the capacity to meet attack boldly. Delay, suspension, expectation of further struggle.', rev: 'Obstacles, adversity, calamity.' },
  28: { sym: 'Eight of Wands — eight staves flying through clear air over open country, converging toward a point.', up: 'Swiftness, motion, things coming to a head. Great haste and hope; activity and the arrows of love.', rev: 'Jealousy, internal dispute, quarrel, stings of conscience.' },
  29: { sym: 'Seven of Wands — a young man on a height, defending his position against six staves raised from below.', up: 'Valour, the advantage of the higher ground. Competition, negotiation, trade war. Success through maintaining position.', rev: 'Perplexity, embarrassment, anxiety. Caution against indecision.' },
  30: { sym: 'Six of Wands — a laurelled horseman bearing a wreathed staff amid a procession.', up: 'Victory, great news, hope fulfilled. The expected triumph arriving.', rev: 'Apprehension of the enemy; treachery, gates opened. Indefinite delay.' },
  31: { sym: 'Five of Wands — five young men brandish wands in apparent conflict or sport.', up: 'Imitation, mimic conflict, the strife of competition that also produces growth. Struggle with an element of play.', rev: 'Litigation, disputes, trickery, contradiction.' },
  32: { sym: 'Four of Wands — four wands garlanded to form a bower; two figures celebrate beneath.', up: 'Prosperity, haven, completion of work. Rest and harmony after effort. Domestic happiness.', rev: 'Beauty, prosperity — the meaning holds, perhaps slightly diminished.' },
  33: { sym: 'Three of Wands — a tall man at a clifftop watches ships on the sea; three staves are planted behind him.', up: 'Established strength, the fruits of effort coming in. Trade, enterprise launched. Cooperation furthering commerce.', rev: 'Toil ended, the goal in sight; or adversity, mistakes, disappointment.' },
  34: { sym: 'Two of Wands — a lord on a parapet holds a globe in one hand, grips a wand in the other; the world is his.', up: 'Dominion, boldness, the world as a field for enterprise. A great man in his domain planning his next move.', rev: 'Surprise, wonder, enchantment — or toil, labour, the dominion not yet secure.' },
  35: { sym: 'Ace of Wands — a hand issues from clouds gripping a flourishing wand; it is pure creative fire.', up: 'The beginning of an enterprise, invention, birth. Creative fire and the courage to begin.', rev: 'Clouds over the start, false beginning, decadence. A sign of birth but in difficult circumstances.' },

  // ── CUPS (36-49: King, Queen, Knight, Page, 10 down to Ace) ─────────────────
  36: { sym: 'King of Cups — a thoughtful man on a stone throne amid a turbulent sea; he holds cup and sceptre and neither the water nor the fish behind him disturbs him.', up: 'Creative mind, art, science, or law. A responsible man of business and law; kind and willing to help.', rev: 'Dishonesty, double-dealing, scandal. Beware of a powerful man\'s ill-will or hypocrisy.' },
  37: { sym: 'Queen of Cups — a dreamy woman on a throne at the sea\'s edge, contemplating an ornate covered cup.', up: 'Beloved, honoured, visionary. The cup is covered because what she holds is not yet manifest. A woman of feeling and imagination, good wife and mother.', rev: 'A woman of equivocal character; the vision turned to illusion or self-deception.' },
  38: { sym: 'Knight of Cups — a graceful knight on a white horse bears a cup steadily, wearing a winged helmet; fish ornament his tunic.', up: 'Arrival, approach; a proposition, an invitation. A young man bringing an offer — of love, of art, of something he has long prepared.', rev: 'Trickery, artifice, fraud; irregularity.' },
  39: { sym: 'Page of Cups — a young man in a flowered tunic stares at a fish that has appeared in his cup, both surprised and attentive.', up: 'A reflective youth, news of birth; studious, application. A fair, gentle youth; good augury and openness to imagination.', rev: 'Obstacles, obstacles of all kinds; a young man unfortunate in love.' },
  40: { sym: 'Ten of Cups — an embracing couple look up at ten cups in the sky arranged in an arc; their children dance; a house and garden spread behind.', up: 'Contentment, repose of the heart; the home full of love. For a man, a good marriage and one beyond his expectations.', rev: 'Sorrow, serious quarrel, violent breach; the heart\'s content denied.' },
  41: { sym: 'Nine of Cups — a man sits satisfied before nine cups arranged on a shelf, arms crossed, a smile of pleasure on his face.', up: 'Contentment, physical wellbeing, satisfaction; the "wish card." What you have been hoping for.', rev: 'Truth, loyalty, liberty; or mistakes, imperfection, sickness.' },
  42: { sym: 'Eight of Cups — a figure with a staff walks away into the mountains by night, leaving eight cups arranged below. A waning moon looks on.', up: 'Abandonment, the turning from something that has been, something that no longer satisfies. Journeying away, desertion of things long held dear.', rev: 'Great joy, happiness, feasting. The abandonment reversed — turning back.' },
  43: { sym: 'Seven of Cups — a figure confronts seven cups in a cloud, each containing a vision: a face, a castle, a treasure, a wreath, a dragon, a human figure, a snake.', up: 'Illusory success, the project of castles in the air. The wide variety of possible paths becoming confusion. Imagination divorced from will.', rev: 'Will, determination, the choice made. The visions resolved into purpose.' },
  44: { sym: 'Six of Cups — a boy and girl in an old garden, cups filled with white flowers, exchanging gifts from the past.', up: 'Pleasant memories, things of the past that still nourish. A gift from the past; childhood; kindness; also places, things, people from long ago.', rev: 'The future, renewal, something coming that is independent of the past. Inheritance.' },
  45: { sym: 'Five of Cups — a black-cloaked figure broods over three spilled cups; two remain standing behind him.', up: 'Partial loss, the grief that ignores what remains. Regret, mourning, sorrow — but not total loss.', rev: 'Return, a relative not seen; restoration; hope and consolation.' },
  46: { sym: 'Four of Cups — a young man sits under a tree, arms crossed, looking dissatisfied as a hand from a cloud offers him a fourth cup; three cups stand before him.', up: 'Weariness, disgust, aversion, imaginary vexations. Something new being offered but the heart turned away from it.', rev: 'Novelty, new relations, new beginnings. The hand from the cloud accepted.' },
  47: { sym: 'Three of Cups — three women in a garden lift their cups in celebration, surrounded by fruit and flowers.', up: 'Plenty, merriment, healing, the conclusion of a matter. Abundance and happy abundance shared. Successful conclusion.', rev: 'Excess, pleasure to the point of damage, expedience.' },
  48: { sym: 'Two of Cups — a man and woman face each other, cups raised, a caduceus with a winged lion between them — the symbol of healing and balanced union.', up: 'Love, the perfect union of two people or principles. A good partnership, attraction, harmony. Passion with purpose.', rev: 'False love, divided loyalty, separation.' },
  49: { sym: 'Ace of Cups — a hand from a cloud holds a chalice from which water overflows; a dove descends bearing a wafer; below, a lotus lake.', up: 'The beginning of joy, love, beauty, and fertility. True love, abundance of feeling, spiritual gifts opening.', rev: 'False heart, mutation, instability; the cup overflowing in the wrong direction.' },

  // ── SWORDS (50-63: King, Queen, Knight, Page, 10 down to Ace) ────────────────
  50: { sym: 'King of Swords — an austere, armoured judge on a throne holds an upright sword; clouds move behind him.', up: 'Intellectual power, authority, command. A lawyer, senator, or doctor. Powerful thought exercised with authority.', rev: 'Cruelty, perversity, a tyrant. A bad man — or the caution to end a ruinous lawsuit.' },
  51: { sym: 'Queen of Swords — a severe, solitary woman sits enthroned, one hand raised, one holding an upright sword; a severed head is carved in her throne.', up: 'Acute mind, perception, sorrow rightly borne; often a widow. Quick to separate truth from falsehood.', rev: 'A bad woman with ill-will toward the querent; narrow-mindedness, bigotry.' },
  52: { sym: 'Knight of Swords — a knight charges headlong on a rushing horse through storming clouds, sword raised.', up: 'Skill, bravery, capacity, and the onslaught of force. Heroic action; a soldier or champion. Also: impetuous, destructive force.', rev: 'Imprudence, incapacity; dispute with an imbecile; for a woman, a rival who may be overcome.' },
  53: { sym: 'Page of Swords — a youth stands on a hilltop, sword raised, treading on rough ground while clouds race behind.', up: 'Vigilance, espionage, spying, examination. Authority, overseeing. An indiscreet person prying into the querent\'s secrets.', rev: 'Astonishing news, the unexpected.' },
  54: { sym: 'Ten of Swords — a prostrate figure face-down with ten swords in his back; a dark sky but a thin band of light on the horizon.', up: 'Pain, affliction, tears, sadness, desolation — but also inevitable end of something that was already finished. The darkest moment before light.', rev: 'Temporary advantage, power, and profit — but not permanent. The defeated rising.' },
  55: { sym: 'Nine of Swords — a woman sits up in bed, head in hands; nine swords hang on the wall above her.', up: 'Suffering, desolation, despair, misery, burden; the sleepless night of the mind in its worst hour.', rev: 'Imprisonment, doubt, reasonable suspicion. A good ground for suspicion.' },
  56: { sym: 'Eight of Swords — a bound and blindfolded woman stands surrounded by eight upright swords; yet they do not touch her, and the ground before her is clear.', up: 'Crisis, bad news, conflict, restriction. The situation feels impossible — but the blindfold and bonds are not as tight as they seem.', rev: 'Disquiet, difficulty, accident — or the beginning of release; departure of a relative.' },
  57: { sym: 'Seven of Swords — a man carries five swords away from a camp where two remain planted; he looks back with a sly glance.', up: 'Design, attempt, wish, hope — but also unstable effort, partial success, evasion. Cunning rather than force.', rev: 'Good counsel, possibly neglected. A country life after competence secured.' },
  58: { sym: 'Six of Swords — a ferryman poles a boat containing a woman and child toward a distant shore; six swords stand in the boat.', up: 'Journey, passage, travel by water; transition to a calmer state. The voyage will be pleasant. Moving away from difficulty.', rev: 'Unfavourable issue of a lawsuit; the difficult shore not yet reached.' },
  59: { sym: 'Five of Swords — a smiling figure collects three swords; two figures walk away, dejected. The sky behind them is disturbed.', up: 'Degradation, dishonour, defeat. An attack on the querent\'s fortune. Success at a cost that empties the victory.', rev: 'Sorrow, mourning. The defeat felt even by the apparent winner.' },
  60: { sym: 'Four of Swords — a knight lies in effigy on a tomb, as if in death or deep meditation; three swords hang above, one lies beneath.', up: 'Withdrawal, rest, convalescence. The necessary retreat before re-engagement. Exile, solitude, repose.', rev: 'Precaution, economy — success following wise administration. The rest ending.' },
  61: { sym: 'Three of Swords — three swords pierce a heart suspended in a stormy sky.', up: 'Removal, absence, delay, division, rupture; sorrow, tears. For a woman, the flight of her lover.', rev: 'Mental alienation, error, loss, distraction, disorder, confusion.' },
  62: { sym: 'Two of Swords — a blindfolded woman sits before the sea holding two crossed swords; a crescent moon rises.', up: 'Conformity, indecision held in balance. Courage, friendship; gifts for a lady. The standoff that is not yet resolved.', rev: 'Imposture, falsehood, duplicity, disloyalty. The blindfold used to choose deception.' },
  63: { sym: 'Ace of Swords — a hand issues from clouds grasping an upright sword crowned with a golden crown; a palm frond and olive branch dangle from it.', up: 'The force that conquers all; great prosperity — or great misery. The double-edged truth that cuts through everything.', rev: 'Conception, childbirth, augmentation, multiplicity — but also a marriage broken off.' },

  // ── PENTACLES (64-77: King, Queen, Knight, Page, 10 down to Ace) ─────────────
  64: { sym: 'King of Pentacles — a richly robed king on a throne adorned with bulls\' heads (Taurus) holds a sceptre and a large pentacle; grapes and vines surround him.', up: 'A dark, successful man; master of material affairs. Valour, intelligence, business aptitude, mathematical gift. A merchant or professor.', rev: 'Vice, weakness, ugliness, perversity — old corruption.' },
  65: { sym: 'Queen of Pentacles — a dark-haired queen on a throne covered in fruit and flowers holds a pentacle tenderly in her lap; a rabbit leaps nearby.', up: 'Opulence, generosity, liberty, a dark woman of great practical ability. Rich and happy prospects for those near her.', rev: 'Negligence, suspicion, suspense, mistrust, an illness.' },
  66: { sym: 'Knight of Pentacles — an armoured knight on a dark, still horse surveys a ploughed field; he bears a heavy pentacle as if it were a matter of weight and care.', up: 'Utility, serviceableness, useful discoveries. A responsible young man attentive to material reality.', rev: 'Inertia, idleness, repose of that which is evil; also a brave man out of employment.' },
  67: { sym: 'Page of Pentacles — a young man in a flowered meadow holds a golden pentacle up and contemplates it with gravity and wonder.', up: 'A dark youth with application to learning; scholarship, reflection. A young person with careful, practical gifts; reflective application.', rev: 'Prodigality, dissipation, sometimes degradation.' },
  68: { sym: 'Ten of Pentacles — an old man sits with two dogs at the gate of a prosperous estate; a couple and child stand beneath a great arch covered in the ten pentacles of the Tree of Life.', up: 'Riches, family, estate, wealth and the permanence of things well built. The inheritance of what has been carefully tended for generations.', rev: 'Chance, fate, loss; the riches built on unstable foundations.' },
  69: { sym: 'Nine of Pentacles — a richly dressed woman in a garden of plenty has a hooded falcon on her wrist; nine pentacles glow in the vines.', up: 'Prudence, safety, success, accomplishment; a woman\'s love of the finer things, alone and content.', rev: 'Roguery, deception, danger from those you trust; vain hopes.' },
  70: { sym: 'Eight of Pentacles — a craftsman works at his bench, carving star-pentacles; six are hung or displayed, two on the ground.', up: 'Work, employment, craft, skill applied. Learning a new trade; commissions; the value of apprenticeship.', rev: 'Voided ambition, vanity, dishonesty. The skills misused.' },
  71: { sym: 'Seven of Pentacles — a young man leans on his staff and regards seven pentacles growing on a vine; he is taking stock.', up: 'Money, business, barter; but ingenuity and hard work rewarded. The pause to assess the harvest before deciding what to do next.', rev: 'Anxiety about money, impatience, concern over the slow pace of growth.' },
  72: { sym: 'Six of Pentacles — a wealthy merchant weighs coins in a balance while two kneeling beggars receive his charity.', up: 'Present prosperity shared generously. Gifts, philanthropy, gratification. The balance of giving and receiving.', rev: 'Desire, covetousness, envy, jealousy, illusion. The generosity concealing debt.' },
  73: { sym: 'Five of Pentacles — two figures in snow pass outside the warm light of a stained-glass church window; they are cold, crippled, yet the church is right there.', up: 'Material trouble, destitution, loss, loneliness. Yet the door is always closer than it appears. Spiritual poverty alongside material.', rev: 'Discord, chaos, ruin — but also the light available and not yet seen.' },
  74: { sym: 'Four of Pentacles — a miser clutches a pentacle on his crown, one under each foot, one against his chest; the city is behind him.', up: 'The love of money, the fear of loss. Security through possession; but also: gift, legacy, inheritance. Assured material position.', rev: 'Suspense, delay, opposition. The holding-on that loses what it grips.' },
  75: { sym: 'Three of Pentacles — a sculptor works in a monastery arch; two robed figures holding plans consult with him.', up: 'Skill, mastery, and the work being done to standard. Distinction through quality, artistic aptitude rewarded. The craftsman recognised.', rev: 'Mediocrity, commonplace ideas, puerility. The work that lacks the transcendent quality.' },
  76: { sym: 'Two of Pentacles — a young man dances while juggling two pentacles within an infinity loop; ships ride stormy seas behind him.', up: 'Harmony in the midst of change, the ability to manage two things at once. Gaiety, recreation, news, written message.', rev: 'Enforced gaiety, simulated enjoyment; the juggling becoming untenable; troubles more real than imaginary.' },
  77: { sym: 'Ace of Pentacles — a hand from the clouds offers a single golden pentacle; below is a garden gate leading to a mountain path.', up: 'Perfect contentment, felicity, prosperity, triumph. The most favourable of all cards. The gift of material stability and potential.', rev: 'The evil side of wealth; miserly comfort; a share in the finding of treasure — but at cost.' },
};

// cards.js orders each suit Ace→King (offset 0–13),
// but waite.js was built King→Ace (offset 0=King, 13=Ace).
// Remap: for any minor arcana card, waiteOffset = 13 - cardsOffset.
function waiteId(cardId) {
  if (cardId < 22) return cardId; // Major Arcana — no remap needed
  const base = cardId < 36 ? 22 : cardId < 50 ? 36 : cardId < 64 ? 50 : 64;
  return base + (13 - (cardId - base));
}

// Build a rich lore string for a given card to inject into AI system prompt
function getWaiteLore(cardId, reversed, topic) {
  const lore = WAITE_LORE[waiteId(cardId)];
  if (!lore) return '';
  const dir = reversed ? 'rev' : 'up';
  const zh = (typeof lang !== 'undefined' && lang === 'zh');
  const cn = dir + 'CN';
  const sym = zh ? (lore.symCN || lore.sym) : lore.sym;        // 中文界面把中文牌义喂给 AI，跨模型解读更一致
  const meaning = zh ? (lore[cn] || lore[dir]) : lore[dir];
  const sub = o => (zh ? (o[cn] || o[dir]) : o[dir]);
  let result = zh
    ? `[牌面意象：${sym}] ${reversed ? '逆位 — ' : ''}${meaning}`
    : `[Imagery: ${sym}] ${reversed ? 'Reversed — ' : ''}${meaning}`;
  // Add topic-specific reading guidance if available
  if (lore.love) {
    const t = topic || '';
    if (t === 'relationship') result += zh ? `\n  感情解读：${sub(lore.love)}` : `\n  Love reading: ${sub(lore.love)}`;
    else if (t === 'work') result += zh ? `\n  事业解读：${sub(lore.work)}` : `\n  Career reading: ${sub(lore.work)}`;
    else {
      if (lore.love) result += zh ? `\n  感情：${sub(lore.love)}` : `\n  In love: ${sub(lore.love)}`;
      if (lore.work) result += zh ? `\n  事业：${sub(lore.work)}` : `\n  In career: ${sub(lore.work)}`;
    }
    if (lore.advice) result += zh ? `\n  建议：${sub(lore.advice)}` : `\n  Advice: ${sub(lore.advice)}`;
  }
  return result;
}
