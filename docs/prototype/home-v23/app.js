/* ZakyDev v6: the words are the hero; one gold element never leaves the screen and keeps changing job.
   underline of "systems" -> project frame -> build line -> underline of the email. */
(function () {
  const { gsap } = window;
  const F = (s) => `<i class="flag" title="Not confirmed yet">${s}</i>`;
  const T = {
    en: {
      nWork: 'Work', nProcess: 'Process', nAbout: 'About', nContact: 'Contact', scroll: 'Scroll', copy: 'Copy email', copied: 'Copied',
      kAbout: "Who's behind it", hAbout: 'One engineer, the whole stack.',
      facts: [['WHERE', 'Bahrain. I work in Arabic and English.'], ['DAY', F('Hospital systems by day, products after hours.')], ['TRACK', 'Volunteer marshal at Bahrain International Circuit since 2019.'], ['PLAY', F('Competitive team games taught me to read the map before I move.')]],
      meta: [['Oct 2025 – now', 'Freelance', 'Built and deployed'], ['Apr – Aug 2026', F('Own product'), 'Built and deployed'], ['May – Aug 2026', F('Own product'), 'Built and deployed']],
      cmeta: ['Bahrain · UTC+3', 'Arabic · English', F('Replies within two working days')],
      caps: ['One typed API sits between the interface and the data.', 'If one model provider fails, the next one answers.', 'The server decides; every player gets the same state.'],
      role: 'Full-Stack Software Engineer · Bahrain',
      lines: [['I', 'build', { t: 'systems', key: 1 }], ['that', 'stay', { t: 'clear', gold: 1 }], ['under', 'pressure.']],
      sub: 'From empty repo to production: interface, API, database, deploy.',
      cta1: 'See the work', cta2: 'Start a project',
      kWork: 'Work · built from zero', kProc: 'From zero to production',
      stages: [
        ['Idea', 'Start from the job someone needs done, and scope it to what ships first.', ['Brief', 'User flow', 'Data sketch']],
        ['Schema', 'Model the data and the rules it must never break.', ['PostgreSQL', 'MySQL', 'Prisma', 'Kysely']],
        ['API', 'Typed endpoints with validation, roles and documentation.', ['NestJS', 'Zod', 'OpenAPI', 'JWT + RBAC']],
        ['Interface', 'Fast, bilingual screens that work on a phone first.', ['Next.js', 'React', 'Tailwind CSS', 'next-intl · RTL']],
        ['Tests', 'Unit and end-to-end tests guard every change.', ['Vitest', 'Jest', 'Playwright']],
        ['Pipeline', 'Every merge is built and checked automatically.', ['GitHub Actions', 'Docker build checks']],
        ['Deploy', 'Containers to a Linux server, or straight to the edge.', ['Docker', 'Linux', 'Vercel']],
        ['Watch', F('Health checks, logs and backups keep it honest.'), ['Health checks', 'Logs', 'Backups']],
      ],
      sys: [
        ['GCC supplier directory · bilingual · freelance', 'A supplier marketplace I designed, built and deployed end to end.'],
        ['AI career assistant · bilingual', 'ATS scoring, a résumé builder and job matching, with a fallback across LLM providers.'],
        ['Real-time multiplayer Arabic word game', 'The server owns the game state, so every player sees the same round.'],
      ],
      kContact: 'Contact', hContact: 'What needs building?', lContact: "Tell me what you're working on and what's getting in the way.",
      legendA: 'Dashed', legendB: "= waiting for Youssef's confirmation", langBtn: 'ع', langLabel: 'Switch to Arabic',
    },
    ar: {
      nWork: 'الأعمال', nProcess: 'المنهج', nAbout: 'نبذة', nContact: 'تواصل', scroll: 'مرّر', copy: 'انسخ البريد', copied: 'تم النسخ',
      kAbout: 'من يقف خلفها', hAbout: 'مهندس واحد، وكل الطبقات.',
      facts: [['المكان', 'البحرين. أعمل بالعربية والإنجليزية.'], ['النهار', F('أنظمة مستشفى نهارًا، ومنتجات بعد الدوام.')], ['الحلبة', 'متطوع ضمن فريق المارشال في حلبة البحرين الدولية منذ 2019.'], ['اللعب', F('الألعاب التنافسية الجماعية علّمتني أن أقرأ الخريطة قبل أن أتحرك.')]],
      meta: [['أكتوبر 2025 – الآن', 'عمل حر', 'بناء ونشر'], ['أبريل – أغسطس 2026', F('منتج خاص'), 'بناء ونشر'], ['مايو – أغسطس 2026', F('منتج خاص'), 'بناء ونشر']],
      cmeta: ['البحرين · UTC+3', 'العربية · الإنجليزية', F('أردّ خلال يومي عمل')],
      caps: ['واجهة API واحدة محددة الأنواع بين الواجهة والبيانات.', 'إذا تعطّل مزوّد نماذج، يجيب التالي.', 'الخادم يقرّر، وكل لاعب يحصل على الحالة نفسها.'],
      role: 'مهندس برمجيات Full-Stack · البحرين',
      lines: [['أبني', { t: 'أنظمة', key: 1 }], ['تبقى', { t: 'واضحة', gold: 1 }], ['تحت', 'الضغط.']],
      sub: 'من مستودع فارغ إلى الإنتاج: الواجهة، واجهة API، قاعدة البيانات، والنشر.',
      cta1: 'شاهد الأعمال', cta2: 'ابدأ مشروعًا',
      kWork: 'الأعمال · بُنيت من الصفر', kProc: 'من الصفر إلى الإنتاج',
      stages: [
        ['الفكرة', 'أبدأ من المهمة التي يحتاج المستخدم إنجازها، وأحدد ما يُنشر أولًا.', ['Brief', 'User flow', 'Data sketch']],
        ['المخطط', 'أصمّم البيانات والقواعد التي لا يجوز كسرها أبدًا.', ['PostgreSQL', 'MySQL', 'Prisma', 'Kysely']],
        ['API', 'نقاط وصول محددة الأنواع، مع التحقق والصلاحيات والتوثيق.', ['NestJS', 'Zod', 'OpenAPI', 'JWT + RBAC']],
        ['الواجهة', 'شاشات سريعة بلغتين، تعمل على الهاتف أولًا.', ['Next.js', 'React', 'Tailwind CSS', 'next-intl · RTL']],
        ['الاختبارات', 'اختبارات الوحدات والاختبارات الشاملة تحمي كل تغيير.', ['Vitest', 'Jest', 'Playwright']],
        ['خط البناء', 'كل دمج يُبنى ويُفحص تلقائيًا.', ['GitHub Actions', 'Docker build checks']],
        ['النشر', 'حاويات إلى خادم Linux، أو مباشرة إلى الحافة.', ['Docker', 'Linux', 'Vercel']],
        ['المراقبة', F('فحوص السلامة والسجلات والنسخ الاحتياطية تُبقيه مستقرًا.'), ['Health checks', 'Logs', 'Backups']],
      ],
      sys: [
        ['دليل موردين خليجي · بلغتين · عمل حر', 'منصة للموردين صممتها وبنيتها ونشرتها من البداية إلى النهاية.'],
        ['مساعد مهني بالذكاء الاصطناعي · بلغتين', 'تقييم ATS، منشئ سيرة ذاتية، ومطابقة وظائف، مع تبديل تلقائي بين مزوّدي النماذج.'],
        ['لعبة كلمات عربية جماعية لحظية', 'الخادم يملك حالة اللعبة، فيرى كل اللاعبين الجولة نفسها.'],
      ],
      kContact: 'تواصل', hContact: 'ما الذي تريد بناءه؟', lContact: 'أخبرني عن مشروعك وما الذي يعطّل العمل.',
      legendA: 'الخط المتقطع', legendB: '= بانتظار تأكيد يوسف', langBtn: 'EN', langLabel: 'Switch to English',
    },
  };
  /* v10 copy: shorter and plainer, in both languages */
  Object.assign(T.en, {
    sub: 'I design, build and launch web apps, start to finish.', cta1: 'See my work', cta2: 'Start a project',
    kWork: 'My work', kProc: 'How I build', visit: 'Visit live site', say: 'Say hello',
    stages: [
      ['Idea', 'I understand the problem first.', ['Brief', 'User flow']],
      ['Data', 'I plan what the system must remember.', ['PostgreSQL', 'MySQL', 'Prisma']],
      ['Logic', 'I write the rules that keep it correct.', ['NestJS', 'Zod', 'JWT + RBAC']],
      ['Interface', 'I design screens that are easy to use.', ['Next.js', 'React', 'Tailwind CSS']],
      ['Tests', 'I check that everything works.', ['Vitest', 'Jest', 'Playwright']],
      ['Automation', 'Every update is checked automatically.', ['GitHub Actions', 'Docker']],
      ['Launch', 'I put it online for real users.', ['Docker', 'Linux', 'Vercel']],
      ['Care', F('I keep it fast and safe after launch.'), ['Logs', 'Backups']],
    ],
    sys: [['Supplier directory for the Gulf', 'Find and compare trusted suppliers, in Arabic and English.'], ['AI career assistant', 'Builds your résumé and matches you with jobs.'], ['Multiplayer Arabic word game', 'Play live with friends. Everyone sees the same round.']],
    caps: ['One clear path from screen to data.', 'If one AI service fails, another answers.', 'The server keeps every player in sync.'],
    meta: [['Oct 2025 – now', 'Freelance', 'Designed, built, launched'], ['Apr – Aug 2026', F('My own product'), 'Designed, built, launched'], ['May – Aug 2026', F('My own product'), 'Designed, built, launched']],
    hAbout: 'One engineer, start to finish.',
    facts: [['BASED IN', 'Bahrain. Arabic and English.'], ['DAY JOB', F('Hospital software.')], ['TRACK MARSHAL', 'Bahrain International Circuit since 2019. F1 and WEC race weekends.'], ['OFF DUTY', F('League of Legends and Valorant.')]],
    riot: "ZakyDev isn't endorsed by Riot Games.",
    hContact: 'What needs building?', lContact: 'Tell me about it in a few lines.',
    cmeta: ['Bahrain · UTC+3', 'Arabic · English', F('Reply within two working days')],
  });
  Object.assign(T.en, { tagRole: 'Full-stack engineer', tagPlace: 'Bahrain', tagOpen: 'Open to projects', pitchA: 'I design, build and launch', rot: ['marketplaces', 'AI assistants', 'real-time games', 'hospital systems'], steps3: ['Design', 'Build', 'Launch'] });
  Object.assign(T.ar, { tagRole: 'مهندس برمجيات', tagPlace: 'البحرين', tagOpen: 'متاح لمشاريع جديدة', pitchA: 'أصمّم وأبني وأطلق', rot: ['منصات تجارية', 'مساعدين بالذكاء الاصطناعي', 'ألعابًا جماعية', 'أنظمة مستشفيات'], steps3: ['تصميم', 'بناء', 'إطلاق'] });
  Object.assign(T.ar, {
    nWork: 'أعمالي', nProcess: 'طريقتي', nAbout: 'عنّي', scroll: 'مرّر للأسفل',
    role: 'مهندس برمجيات · البحرين',
    sub: 'أصمّم تطبيقات الويب وأبنيها وأطلقها، من البداية إلى النهاية.', cta1: 'شاهد أعمالي', cta2: 'ابدأ مشروعك',
    kWork: 'أعمالي', kProc: 'كيف أبني', visit: 'زر الموقع', say: 'راسلني',
    stages: [
      ['الفكرة', 'أفهم المشكلة أولًا.', ['Brief', 'User flow']],
      ['البيانات', 'أحدّد ما يجب أن يحفظه النظام.', ['PostgreSQL', 'MySQL', 'Prisma']],
      ['القواعد', 'أكتب القواعد التي تُبقيه صحيحًا.', ['NestJS', 'Zod', 'JWT + RBAC']],
      ['الواجهة', 'أصمّم شاشات سهلة الاستخدام.', ['Next.js', 'React', 'Tailwind CSS']],
      ['الاختبار', 'أتأكد أن كل شيء يعمل.', ['Vitest', 'Jest', 'Playwright']],
      ['الأتمتة', 'كل تحديث يُفحص تلقائيًا.', ['GitHub Actions', 'Docker']],
      ['الإطلاق', 'أنشره ليستخدمه الناس.', ['Docker', 'Linux', 'Vercel']],
      ['المتابعة', F('أُبقيه سريعًا وآمنًا بعد الإطلاق.'), ['Logs', 'Backups']],
    ],
    sys: [['دليل موردين للخليج', 'ابحث عن موردين موثوقين وقارن بينهم، بالعربية والإنجليزية.'], ['مساعد وظيفي بالذكاء الاصطناعي', 'يبني سيرتك الذاتية ويرشّح لك الوظائف المناسبة.'], ['لعبة كلمات عربية جماعية', 'العب مباشرة مع أصدقائك، والجميع يرى الجولة نفسها.']],
    caps: ['مسار واحد واضح من الشاشة إلى البيانات.', 'إذا تعطّلت خدمة ذكاء اصطناعي، تجيب أخرى.', 'الخادم يُبقي كل اللاعبين على الحالة نفسها.'],
    meta: [['أكتوبر 2025 – الآن', 'عمل حر', 'تصميم وبناء وإطلاق'], ['أبريل – أغسطس 2026', F('مشروعي الخاص'), 'تصميم وبناء وإطلاق'], ['مايو – أغسطس 2026', F('مشروعي الخاص'), 'تصميم وبناء وإطلاق']],
    kAbout: 'من أنا', hAbout: 'مهندس واحد، من البداية إلى النهاية.',
    facts: [['المكان', 'البحرين. العربية والإنجليزية.'], ['العمل', F('برمجيات المستشفيات.')], ['مارشال الحلبة', 'حلبة البحرين الدولية منذ 2019، في سباقات F1 و WEC.'], ['بعد الدوام', F('League of Legends و Valorant.')]],
    riot: 'ZakyDev غير معتمد من Riot Games.',
    hContact: 'ما الذي تريد بناءه؟', lContact: 'اكتب لي عنه في سطور قليلة.',
    cmeta: ['البحرين · UTC+3', 'العربية · الإنجليزية', F('أردّ خلال يومي عمل')],
  });
  /* v16: five plain steps, each with what the client gets */
  Object.assign(T.en, { kProc: 'How I work', getLabel: 'You get', stages: [
    ['Understand', 'We talk first. I learn the problem and who it is for.', 'A clear plan', []],
    ['Design', 'I draw every screen before I write code.', 'Screens you can click through', []],
    ['Build', 'Interface, logic and data, built together.', 'A working version, early', ['Next.js', 'NestJS', 'PostgreSQL']],
    ['Test', 'I try to break it before your users can.', 'Fewer surprises', ['Vitest', 'Playwright']],
    ['Launch', 'It goes live, and I stay to keep it healthy.', 'A live product, looked after', ['Docker', 'GitHub Actions', 'Vercel']],
  ] });
  Object.assign(T.ar, { kProc: 'كيف أعمل', getLabel: 'تحصل على', stages: [
    ['أفهم', 'نتحدث أولًا. أفهم المشكلة ومن سيستخدم الحل.', 'خطة واضحة', []],
    ['أصمّم', 'أرسم كل شاشة قبل أن أكتب الكود.', 'شاشات يمكنك تجربتها', []],
    ['أبني', 'الواجهة والقواعد والبيانات، تُبنى معًا.', 'نسخة تعمل، مبكرًا', ['Next.js', 'NestJS', 'PostgreSQL']],
    ['أختبر', 'أحاول كسره قبل أن يفعل مستخدموك.', 'مفاجآت أقل', ['Vitest', 'Playwright']],
    ['أطلق', 'يصبح متاحًا للناس، وأبقى لأحافظ عليه.', 'منتج يعمل، مع متابعة', ['Docker', 'GitHub Actions', 'Vercel']],
  ] });
  Object.assign(T.en, { loop: ['Idea', 'Design', 'Code', 'Data', 'Test', 'Deploy', 'Monitor'], hAbout: 'One engineer, from A to Z.' });
  Object.assign(T.ar, { loop: ['الفكرة', 'التصميم', 'الكود', 'البيانات', 'الاختبار', 'النشر', 'المراقبة'], hAbout: 'مهندس واحد، من الألف إلى الياء.' });
  /* v23: the title is typed between the logo's two brackets and alternates between two true titles */
  Object.assign(T.en, { roles: ['Software engineer', 'Full-stack developer'] });
  Object.assign(T.ar, { roles: ['مهندس برمجيات', 'مطوّر Full-Stack'] });
  /* v20 hero copy */
  Object.assign(T.en, { lines: [['I', 'build', { t: 'software', key: 1 }], ['that', { t: 'holds', gold: 1 }, { t: 'up', gold: 1 }], ['under', 'pressure.']], tagRole: 'Software engineer', tagOpen: 'Available for new projects', rot: ['marketplaces', 'AI assistants', 'multiplayer games', 'hospital systems'] });
  Object.assign(T.ar, { lines: [['أبني', { t: 'برمجيات', key: 1 }], [{ t: 'تصمد', gold: 1 }, 'تحت'], ['الضغط.']] });
  /* v18 about rows */
  Object.assign(T.en, { facts: [['BASED IN', 'Bahrain. I work in Arabic and English.'], ['DAY JOB', F('I build software for a hospital.')], ['TRACK MARSHAL', 'Bahrain International Circuit since 2019. F1 and WEC weekends: flags, safety, quick calls.'], ['AFTER WORK', F('League of Legends, Valorant and TFT. Read the map, make the call, adapt.')]] });
  Object.assign(T.ar, { facts: [['المكان', 'البحرين. أعمل بالعربية والإنجليزية.'], ['العمل', F('أبني برمجيات لمستشفى.')], ['مارشال الحلبة', 'حلبة البحرين الدولية منذ 2019. سباقات F1 و WEC: أعلام، سلامة، وقرارات سريعة.'], ['بعد الدوام', F('League of Legends و Valorant و TFT. أقرأ الخريطة، أقرّر، وأتكيّف.')]] });
  const SYSTEMS = [
    { id: 'Nuammer', url: 'nuammer.com', img: 'img/nuammer.jpg', stack: ['Next.js', 'NestJS', 'Prisma', 'MySQL', 'Docker', 'GitHub Actions'] },
    { id: 'Wazifi', url: 'wazifi.vercel.app', img: 'img/wazifi.jpg', stack: ['Next.js', 'Supabase', 'PostgreSQL · RLS', 'Vercel AI SDK'] },
    { id: 'Talmeeha', url: 'talmeeha.vercel.app', img: 'img/talmeeha.jpg', stack: ['Next.js', 'Supabase Realtime', 'Server-owned state'] },
  ];
  /* scroll map, in screen heights */
  const WORK0 = 1.0, WORK_STEP = 0.6, PROC0 = 3.2, NS = 5, PROC_STEP = 0.26, END = 6.2;
  /* a small looping diagram of how each system works */
  const SIGS = [
    `<svg viewBox="0 0 260 64"><path class="sg-l" d="M32 32H228"/><circle class="sg-n" cx="32" cy="32" r="9"/><circle class="sg-n" cx="130" cy="32" r="9"/><circle class="sg-n" cx="228" cy="32" r="9"/><circle class="sg-g sg-run" cx="32" cy="32" r="5"/><text class="sg-t" x="32" y="60" text-anchor="middle">NEXT.JS</text><text class="sg-t" x="130" y="60" text-anchor="middle">NESTJS</text><text class="sg-t" x="228" y="60" text-anchor="middle">MYSQL</text></svg>`,
    `<svg viewBox="0 0 260 64"><path class="sg-l" d="M32 32C80 32 90 14 152 14M32 32C80 32 90 50 152 50"/><circle class="sg-n" cx="32" cy="32" r="9"/><circle class="sg-n" cx="152" cy="14" r="9"/><path class="sg-x" d="M146 8l12 12M158 8l-12 12"/><circle class="sg-n sg-ok" cx="152" cy="50" r="9"/><circle class="sg-g sg-try" cx="32" cy="32" r="5"/><text class="sg-t" x="32" y="60" text-anchor="middle">ASK</text><text class="sg-t" x="170" y="18">PROVIDER A</text><text class="sg-t" x="170" y="54">PROVIDER B</text></svg>`,
    `<svg viewBox="0 0 260 64"><path class="sg-l" d="M130 32L40 12M130 32L40 52M130 32L220 12M130 32L220 52"/><circle class="sg-pulse" cx="130" cy="32" r="8"/><circle class="sg-g" cx="130" cy="32" r="8"/><circle class="sg-n sg-p" cx="40" cy="12" r="7"/><circle class="sg-n sg-p" cx="40" cy="52" r="7"/><circle class="sg-n sg-p" cx="220" cy="12" r="7"/><circle class="sg-n sg-p" cx="220" cy="52" r="7"/><text class="sg-t" x="130" y="62" text-anchor="middle">SERVER</text></svg>`,
  ];
  const P = (d) => `<path class="dr" pathLength="1" d="${d}"/>`;
  const GLYPHS = [
    `<circle class="dr" pathLength="1" cx="100" cy="100" r="64"/><circle class="dr" pathLength="1" cx="100" cy="100" r="13"/>`,
    P('M30 40H170V160H30Z') + P('M30 80H170M30 120H170') + P('M85 80V160M130 80V160'),
    P('M80 40C60 40 70 90 50 100C70 110 60 160 80 160') + P('M120 40C140 40 130 90 150 100C130 110 140 160 120 160'),
    P('M25 45H175V160H25Z') + P('M25 75H175') + P('M40 92H85V145H40Z') + P('M100 97H160M100 118H160M100 139H140'),
    P('M42 106L84 148L162 58'),
    P('M100 100C70 50 20 60 20 100C20 140 70 150 100 100C130 50 180 60 180 100C180 140 130 150 100 100'),
    P('M100 165V45') + P('M55 90L100 45L145 90') + P('M50 178H150'),
    P('M15 100H65L82 50L108 150L128 78L140 100H185'),
  ];
  /* tech logos (Simple Icons, CC0), tinted with the page colours */
  const SLUG = { 'Next.js': 'nextdotjs', React: 'react', TypeScript: 'typescript', NestJS: 'nestjs', PostgreSQL: 'postgresql', 'PostgreSQL · RLS': 'postgresql', Docker: 'docker', 'Docker build checks': 'docker', Prisma: 'prisma', Redis: 'redis', 'GitHub Actions': 'githubactions', 'Tailwind CSS': 'tailwindcss', 'Vercel AI SDK': 'vercel', Vercel: 'vercel', MySQL: 'mysql', Supabase: 'supabase', 'Supabase Realtime': 'supabase', Vitest: 'vitest', Playwright: 'playwright', Jest: 'jest', Zod: 'zod', OpenAPI: 'openapiinitiative', Linux: 'linux', 'JWT + RBAC': 'jsonwebtokens' };
  const ic = (name) => (SLUG[name] ? `<span class="ic" style="--u:url(icons/${SLUG[name]}.svg)"></span>` : '');
  const chip = (name) => `<li>${ic(name)}${name}</li>`;
  const I = {
    cal: '<svg viewBox="0 0 20 20"><rect x="3" y="4.5" width="14" height="12" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/></svg>',
    tag: '<svg viewBox="0 0 20 20"><path d="M3 10V4h6l8 8-6 6z"/><circle cx="7" cy="7.5" r="1"/></svg>',
    box: '<svg viewBox="0 0 20 20"><path d="M10 2.5l7 4v7l-7 4-7-4v-7z"/><path d="M3 6.5l7 4 7-4M10 10.5v7"/></svg>',
    pin: '<svg viewBox="0 0 20 20"><path d="M10 18s6-5.3 6-10a6 6 0 0 0-12 0c0 4.7 6 10 6 10z"/><circle cx="10" cy="8" r="2.2"/></svg>',
    med: '<svg viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" rx="3"/><path d="M10 6.5v7M6.5 10h7"/></svg>',
    flag: '<svg viewBox="0 0 20 20"><path d="M5 18V3M5 4h10l-2.5 3.5L15 11H5"/></svg>',
    pad: '<svg viewBox="0 0 20 20"><path d="M6 6h8a4 4 0 0 1 4 4v1.5a2.5 2.5 0 0 1-4.6 1.4L12.5 12h-5l-.9.9A2.5 2.5 0 0 1 2 11.5V10a4 4 0 0 1 4-4z"/><path d="M6.5 8.5V11M5.25 9.75h2.5M13.5 9.75h.01"/></svg>',
    globe: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7"/><path d="M3 10h14M10 3c2.5 2.5 2.5 11.5 0 14M10 3c-2.5 2.5-2.5 11.5 0 14"/></svg>',
    clock: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7"/><path d="M10 6v4.3l2.7 1.7"/></svg>',
  };
  const FACT_ICONS = [
    `<svg class="fx" viewBox="0 0 200 90"><path class="fx-l" stroke-dasharray="2 5" d="M8 78Q100 52 192 78M8 62Q100 36 192 62"/><ellipse class="fx-rip" cx="146" cy="66" rx="7" ry="2.6"/><ellipse class="fx-rip d2" cx="146" cy="66" rx="7" ry="2.6"/><g class="fx-pin"><path class="fx-g" d="M146 65s11-10 11-20a11 11 0 0 0-22 0c0 10 11 20 11 20z"/><circle class="fx-h" cx="146" cy="45" r="4"/></g><path class="fx-i" style="fill:none;stroke:var(--ink);stroke-width:2.4;stroke-linecap:round" d="M56 14V80"/><circle class="fx-g" cx="56" cy="12" r="2.6"/><g class="fx-rise"><g class="fx-wave"><path fill="#CE1126" d="M58 20H112V52H58Z"/><path fill="#fff" d="M58 20H72L80 23.2L72 26.4 L80 29.6L72 32.8 L80 36.0L72 39.2 L80 42.4L72 45.6 L80 48.8L72 52.0H58Z"/></g></g><text class="fx-t" x="192" y="14" text-anchor="end">26.07°N  50.56°E</text></svg>`,
    `<svg class="fx" viewBox="0 0 200 90"><path class="fx-l" d="M8 48H58L68 22L82 72L92 36L98 48H136"/><path class="fx-s fx-ecg" pathLength="1" d="M8 48H58L68 22L82 72L92 36L98 48H136"/><path class="fx-s fx-code" pathLength="1" d="M160 34l-11 14 11 14M176 34l11 14-11 14"/><text class="fx-t" x="8" y="14">HEALTHCARE → CODE</text></svg>`,
    `<svg class="fx" viewBox="0 0 200 90"><rect class="fx-l" x="12" y="7" width="76" height="18" rx="9"/><circle class="fx-lt l1" cx="22" cy="16" r="4.6"/><circle class="fx-lt l2" cx="36" cy="16" r="4.6"/><circle class="fx-lt l3" cx="50" cy="16" r="4.6"/><circle class="fx-lt l4" cx="64" cy="16" r="4.6"/><circle class="fx-lt l5" cx="78" cy="16" r="4.6"/><path class="fx-l" d="M0 76H200"/><path class="fx-kerb" d="M0 82H200"/><g class="fx-car2"><path class="fx-spd" d="M-2 62h-14M-4 68h-18"/><path class="fx-i" d="M4 74h36l-3-8h-9l-5-6h-9l-3 6H4z"/><path class="fx-g" d="M0 62h6v6H0z"/><circle class="fx-h2" cx="12" cy="74" r="4"/><circle class="fx-h2" cx="33" cy="74" r="4"/></g><path class="fx-s" style="stroke-width:2.2" d="M170 76V26"/><path class="fx-g" d="M170 27C179 22 186 32 197 27V46C186 51 179 41 170 46Z"><animate attributeName="d" dur="0.9s" repeatCount="indefinite" values="M170 27C179 22 186 32 197 27V46C186 51 179 41 170 46Z;M170 27C179 32 186 22 197 28V47C186 41 179 51 170 46Z;M170 27C179 22 186 32 197 27V46C186 51 179 41 170 46Z"/></path><text class="fx-t" x="192" y="14" text-anchor="end">BIC · SINCE 2019</text></svg>`,
    `<svg class="fx" viewBox="0 0 200 90"><rect class="fx-l" x="8" y="10" width="62" height="62" rx="6"/><path class="fx-l" style="stroke-width:1" d="M14 66L64 16M14 66V20Q14 16 18 16H64M14 66H60Q64 66 64 62V16"/><circle class="fx-g" cx="14" cy="66" r="3"/><circle class="fx-h2" style="stroke:var(--gold)" cx="64" cy="16" r="3"/><circle class="fx-rip2 fx-png" cx="42" cy="38" r="5"/><circle class="fx-g" r="2.6"><animateMotion dur="3s" repeatCount="indefinite" path="M14 66L42 38"/></circle><circle class="fx-l" cx="92" cy="54" r="6"/><circle class="fx-l" cx="112" cy="30" r="6"/><circle class="fx-g fx-t1" cx="92" cy="54" r="2.6"/><circle class="fx-g fx-t2" cx="112" cy="30" r="2.6"/><g class="fx-aim2"><circle class="fx-s" style="stroke-width:1.5" cx="92" cy="54" r="10"/><path class="fx-s" style="stroke-width:1.5" d="M92 39v7M92 62v7M77 54h7M100 54h7"/></g><polygon class="fx-hex" style="animation-delay:0.00s" points="167.1,47.1 160.0,51.2 152.9,47.1 152.9,38.9 160.0,34.8 167.1,38.9"/><polygon class="fx-hex" style="animation-delay:0.32s" points="183.5,47.1 176.4,51.2 169.3,47.1 169.3,38.9 176.4,34.8 183.5,38.9"/><polygon class="fx-hex" style="animation-delay:0.64s" points="175.3,61.3 168.2,65.4 161.1,61.3 161.1,53.1 168.2,49.0 175.3,53.1"/><polygon class="fx-hex" style="animation-delay:0.96s" points="158.9,61.3 151.8,65.4 144.7,61.3 144.7,53.1 151.8,49.0 158.9,53.1"/><polygon class="fx-hex" style="animation-delay:1.28s" points="150.7,47.1 143.6,51.2 136.5,47.1 136.5,38.9 143.6,34.8 150.7,38.9"/><polygon class="fx-hex" style="animation-delay:1.60s" points="158.9,32.9 151.8,37.0 144.7,32.9 144.7,24.7 151.8,20.6 158.9,24.7"/><polygon class="fx-hex" style="animation-delay:1.92s" points="175.3,32.9 168.2,37.0 161.1,32.9 161.1,24.7 168.2,20.6 175.3,24.7"/><text class="fx-t" x="39" y="85" text-anchor="middle">LOL</text><text class="fx-t" x="102" y="85" text-anchor="middle">VALORANT</text><text class="fx-t" x="160" y="85" text-anchor="middle">TFT</text></svg>`,
  ];

  /* logo options for the rebrand */
  const LOGOS = [
    ['Tag', '<g class="tg-a"><path pathLength="1" class="ms" d="M12 15H50L36.2 28"/></g><g class="tg-b"><path pathLength="1" class="mg" d="M27.8 36L14 49H52"/></g><circle class="tg-s" cx="32" cy="32" r="3"/>'],
  ];





  const BGS = ['Liquid gold', 'Gates', 'Warp', 'Silk'];
  const ORBIT = [['Next.js', 'React', 'TypeScript', 'NestJS', 'PostgreSQL', 'Docker'], ['Prisma', 'Redis', 'Playwright', 'GitHub Actions', 'Tailwind CSS', 'Vercel AI SDK', 'MySQL', 'Supabase']];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch { return null; } return null; };
  const state = {
    lang: params.get('lang') || store('zk-lang') || 'en', theme: params.get('theme') || store('zk-theme') || 'dark',
    still: params.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches, project: -1, stage: -1,
    bg: 0, logo: 0,
  };
  if (!T[state.lang]) state.lang = 'en';
  if (state.theme !== 'light') state.theme = 'dark';
  const L = T[state.lang], ar = state.lang === 'ar', EASE = 'power3.out';
  root.lang = state.lang; root.dir = ar ? 'rtl' : 'ltr'; root.dataset.theme = state.theme;

  /* ---------- content ---------- */
  $$('[data-t]').forEach((el) => { const v = L[el.dataset.t]; if (typeof v === 'string') el.innerHTML = v; });
  $('#lang').textContent = L.langBtn; $('#lang').setAttribute('aria-label', L.langLabel);
  $('#ch').innerHTML = $('#ch').textContent.trim().split(/\s+/).map((w) => `<span class="wm"><span>${w}</span></span>`).join(' ');
  const h1 = $('#h1');
  h1.setAttribute('aria-label', L.lines.map((l) => l.map((w) => w.t || w).join(' ')).join(' '));
  h1.innerHTML = L.lines.map((line) => `<span class="ln" aria-hidden="true">${line.map((w) => {
    const text = w.t || w, cls = `w${w.key ? ' key' : ''}${w.gold ? ' gold' : ''}`;
    const inner = ar ? `<span class="ink">${text}</span>` : `<span class="ink">${[...text].map((c) => `<span class="ch">${c}</span>`).join('')}</span>`;
    return `<span class="${cls}">${inner}${w.key ? `<span class="img" style="background-image:url(${SYSTEMS[0].img})">${text}</span>` : ''}</span>`;
  }).join(' ')}</span>`).join('');
  /* menu: an icon per section and a gold marker that slides to wherever you are */
  const NAV_ICONS = [
    '<svg viewBox="0 0 20 20"><rect class="n1" x="3" y="3" width="6" height="6" rx="1.5"/><rect class="n2" x="11" y="3" width="6" height="6" rx="1.5"/><rect class="n3" x="11" y="11" width="6" height="6" rx="1.5"/><rect class="n4" x="3" y="11" width="6" height="6" rx="1.5"/></svg>',
    '<svg viewBox="0 0 20 20"><circle class="n1" cx="4.5" cy="5" r="2"/><path class="nd" pathLength="1" d="M6.5 5h6a2.5 2.5 0 0 1 0 5h-5a2.5 2.5 0 0 0 0 5h6"/><circle class="n4" cx="15.5" cy="15" r="2"/></svg>',
    '<svg viewBox="0 0 20 20"><circle class="n1" cx="10" cy="7" r="3.2"/><path class="nd" pathLength="1" d="M3.5 17c.8-3.4 3.4-5 6.5-5s5.700 1.600 6.500 5"/></svg>',
    '<svg viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="10" rx="2"/><path class="nf" d="M3.5 6.500l6.500 5 6.500-5"/></svg>',
  ];

  const navLinks = $$('.links a');
  navLinks.forEach((el, n) => { el.innerHTML = `${NAV_ICONS[n]}<span>${el.textContent}</span>`; });
  $('.links').insertAdjacentHTML('beforeend', '<i class="ind" aria-hidden="true"></i>');
  let navOn = -2;
  const moveInd = (i = navOn) => { const ind = $('.ind'), el = navLinks[i]; if (!el) { ind.style.opacity = 0; return; } ind.style.opacity = 1; ind.style.width = `${el.offsetWidth}px`; ind.style.transform = `translateX(${el.offsetLeft}px)`; };
  /* hovering a menu item previews the marker there; leaving sends it home */
  navLinks.forEach((el, n) => el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') moveInd(n); }));
  $('.links').addEventListener('pointerleave', () => moveInd());
  const NAV_R = [[0.9, 2.85], [2.85, 4.6], [4.6, 5.8], [5.8, 6.2]];
  /* hero details: who, where, availability; then what I do, as a three-step loop */
  const CODE = '<svg viewBox="0 0 20 20"><path d="M7 6l-4 4 4 4M13 6l4 4-4 4M11.5 4l-3 12"/></svg>';
  const PEN = '<svg viewBox="0 0 20 20"><path d="M4 16l1-4 9-9 3 3-9 9zM12.5 4.5l3 3"/></svg>';
  const ROCKET = '<svg viewBox="0 0 20 20"><path d="M10 2.5c3 2 4.5 5 4.5 8.500l-2 2h-5l-2-2c0-3.500 1.500-6.500 4.500-8.500zM8 15.500v2M12 15.500v2M10 15.500v2.500"/><circle cx="10" cy="8.500" r="1.500"/></svg>';
  $('#tags').innerHTML = `<li class="role"><span class="rw"><span class="sizer">&lt; ${L.roles.reduce((x, y) => (y.length > x.length ? y : x))} /&gt;</span><span class="vis"><span class="br a">&lt;</span><span id="rolet" dir="${root.dir}"></span><span class="br b">/&gt;</span></span></span></li><li>${I.pin}<span>${L.tagPlace}</span></li><li class="open"><i class="pdot"></i><span>${L.tagOpen}</span></li>`;
  $('#pitch').innerHTML = `${L.pitchA} <span class="rot"><span id="rot">${L.rot[0]}</span></span>`;
  $('#steps3').innerHTML = [PEN, CODE, ROCKET].map((svg, i) => `<li><span class="s3">${svg}</span><span>${L.steps3[i]}</span></li>`).join('');
  $('#facts').innerHTML = L.facts.map((f, i) => `<li><span class="fi">${FACT_ICONS[i]}</span><span class="ft"><b>${f[0]}</b><span>${f[1]}</span></span></li>`).join('') + `<li class="riot">${L.riot}</li>`;
  $('#cmeta').innerHTML = [I.pin, I.globe, I.clock].map((svg, i) => `<li>${svg}<span>${L.cmeta[i]}</span></li>`).join('');
  /* the ring is a project life cycle, A to Z: a gold dot visits seven stations, each with the tools used there */
  const LI = (d) => `<svg viewBox="0 0 20 20">${d}</svg>`;
  const LOOP_ICONS = [
    LI('<path d="M10 2.800a5 5 0 0 0-3 9v2.200h6v-2.200a5 5 0 0 0-3-9zM8 17h4M10 9v5"/>'),
    LI('<path d="M4 16l1-4 9-9 3 3-9 9zM12.500 4.500l3 3"/>'),
    LI('<path d="M7 6l-4 4 4 4M13 6l4 4-4 4M11.500 4l-3 12"/>'),
    LI('<ellipse cx="10" cy="5" rx="6" ry="2.300"/><path d="M4 5v10c0 1.300 2.700 2.300 6 2.300s6-1 6-2.300V5M4 10c0 1.300 2.700 2.300 6 2.300s6-1 6-2.300"/>'),
    LI('<circle cx="10" cy="10" r="7"/><path d="M6.800 10.200l2.200 2.200 4.200-4.600"/>'),
    LI('<path d="M10 2.500c3 2 4.500 5 4.500 8.500l-2 2h-5l-2-2c0-3.500 1.500-6.500 4.500-8.500zM8 15.500v2M12 15.500v2"/><circle cx="10" cy="8.500" r="1.500"/>'),
    LI('<path d="M2 10h4l2-5 3.500 10 2-5H18"/>'),
  ];
  const LOOP_TOOLS = ['Brief · user flow', 'Wireframes', 'Next.js · NestJS', 'PostgreSQL · Prisma', 'Vitest · Playwright', 'Docker · GitHub Actions', 'Logs · health checks'];
  $('#o1').innerHTML = L.loop.map((name, i) => {
    const ang = -Math.PI / 2 + (i / 7) * Math.PI * 2, c = Math.cos(ang), side = i === 0 ? 't' : c > 0 ? 'r' : 'l';
    return `<b class="stn ${side}" style="translate:${(c * 50).toFixed(2)}cqw ${(Math.sin(ang) * 50).toFixed(2)}cqw"><i class="sn">${LOOP_ICONS[i]}</i><span class="sl">${name}</span></b>`;
  }).join('') + '<i class="runner" id="runner"><u></u></i>';
  $('#o2').innerHTML = '';
  $('.ringwrap').insertAdjacentHTML('beforeend', '<div class="loopc"><div class="lw"><span id="loopw"></span></div><small id="loopt" dir="ltr"></small></div>');
  const stations = $$('.stn'), runner = $('#runner'), arc = $('#o2'), loopw = $('#loopw'), loopt = $('#loopt'); let loopOn = -1;
  const key = $('.key', h1), keyImg = $('.img', key), keyInk = $('.ink', key), others = $$('.w:not(.key)', h1);
  $('#shots').innerHTML = SYSTEMS.map((s) => `<img src="${s.img}" alt="">`).join('');
  $('#wdots').innerHTML = SYSTEMS.map((s, i) => `<button type="button" data-go="${WORK0 + i * WORK_STEP + 0.3}" aria-label="${s.id}"><i></i></button>`).join('');
  $('#ticks').innerHTML = L.stages.map((s, i) => `<li data-go="${PROC0 + (i + 0.5) * PROC_STEP}"><i class="nd"><b>${i + 1}</b><svg viewBox="0 0 20 20"><path d="M5.5 10.4l3 3 6-6.6"/></svg></i><span>${s[0]}</span></li>`).join('');

  function flip(el, dir, apply) {
    if (state.still || !gsap) return apply();
    gsap.killTweensOf(el);
    gsap.to(el, { rotationX: -80 * dir, yPercent: -35 * dir, autoAlpha: 0, duration: 0.18, ease: 'power2.in', onComplete: () => {
      apply(); gsap.fromTo(el, { rotationX: 80 * dir, yPercent: 35 * dir, autoAlpha: 0 }, { rotationX: 0, yPercent: 0, autoAlpha: 1, duration: 0.5, ease: EASE });
    } });
  }
  const settle = (sel) => { if (!state.still && gsap) gsap.fromTo(sel, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.035, duration: 0.4, ease: EASE, delay: 0.15, overwrite: true }); };
  function setProject(k) {
    if (k === state.project) return;
    const first = state.project < 0, dir = k > state.project ? 1 : -1; state.project = k; const s = SYSTEMS[k];
    $$('#shots img').forEach((im, n) => { im.classList.toggle('was', im.classList.contains('on') && n !== k); im.classList.toggle('on', n === k); });
    $$('#wdots button').forEach((b, n) => b.setAttribute('aria-selected', n === k));
    const apply = () => {
      $('#wname').textContent = s.id; $('#wnum').textContent = `0${k + 1}`; $('#wtag').textContent = L.sys[k][0]; $('#wdesc').textContent = L.sys[k][1];
      $('#wsig').innerHTML = SIGS[k]; $('#wcap').textContent = L.caps[k];
      $('#wmeta').innerHTML = [I.cal, I.tag, I.box].map((svg, i) => `<li>${svg}<span>${L.meta[k][i]}</span></li>`).join('');
      $('#wchips').innerHTML = s.stack.map(chip).join(''); $('#wurl').textContent = s.url; $('#curl').textContent = s.url; $('#wlink').href = `https://${s.url}`;
    };
    if (first) return apply();
    flip($('#wname'), dir, () => { apply(); settle('#wtag, #wdesc, #wmeta li, .sig, #wchips li, #wlink'); });
  }
  function setStage(i) {
    if (i === state.stage) return;
    const first = state.stage < 0, dir = i > state.stage ? 1 : -1; state.stage = i; const st = L.stages[i];
    $$('#ticks li').forEach((li, n) => { li.classList.toggle('done', n < i); li.classList.toggle('on', n === i); });
    const apply = () => { $('#pword').textContent = st[0]; $('#pnum').textContent = `0${i + 1}`; $('#pdesc').innerHTML = st[1]; $('#pget').innerHTML = `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7"/><path d="M6.8 10.2l2.2 2.2 4.2-4.6"/></svg><span><small>${L.getLabel}</small>${st[2]}</span>`; $('#pchips').innerHTML = st[3].map(chip).join(''); };
    if (first) return apply();
    flip($('#pword'), dir, () => { apply(); settle('#pdesc, #pget, #pchips li'); });
  }
  setProject(0); setStage(0);
  let rotI = 0; if (!state.still) setInterval(() => { rotI = (rotI + 1) % L.rot.length; flip($('#rot'), 1, () => { $('#rot').textContent = L.rot[rotI]; }); }, 2400);

  /* ---------- background: slow warped noise with fine gold contour lines ---------- */
  const bg = (() => {
    const cv = $('#bg'), gl = cv.getContext('webgl', { antialias: false });
    if (!gl) return null;
    const fs = `precision highp float;uniform float uTime,uScroll,uPress,uMode,uSide,uCalm;uniform vec2 uRes;uniform vec3 uA,uB,uC,uLine;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+7.1;a*=.5;}return v;}
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
void main(){vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y);vec3 col=uA;float g=0.;float t=uTime;
/* the side where the words sit stays quiet */
float calm=uCalm*mix(1.,.22,smoothstep(-.35,.55,(uv.x-.5)*2.*uSide));
if(uMode<.5){vec2 q=p*1.25+vec2(0.,-uScroll*2.6);float w1=fbm(q+vec2(t*.05,-t*.03));float w2=fbm(q*1.7+w1*2.2-t*.04);float h=fbm(q+vec2(w1,w2)*1.7);
 col=mix(uA,uC,smoothstep(.32,.82,h));float ridge=pow(abs(sin(h*10.+w2*5.)),10.);g=ridge*smoothstep(.38,.8,h)*(.85+uPress);col=mix(col,uLine,smoothstep(.6,.95,h)*.35);}
else if(uMode<1.5){p.x+=uSide*.4;col=mix(uA,uB,length(p));for(int i=0;i<8;i++){float fi=float(i);float zf=fract(fi/8.+uScroll*5.+t*.018);float s=mix(.03,2.7,zf*zf*zf);
  float a=(fi-3.5)*.045*sin(t*.2+fi);vec2 r=vec2(p.x*cos(a)-p.y*sin(a),p.x*sin(a)+p.y*cos(a));float d=abs(box(r,vec2(s*1.6,s),s*.12));
  float fade=sin(zf*3.14159);g+=(smoothstep(.004+.004*zf,0.,d)+.0022/(d+.0022)*.22)*fade*(.75+uPress);}
 col=mix(col,uC,.22*smoothstep(.9,.0,length(p)));g=min(g,1.);}
else if(uMode<2.5){p.x+=uSide*.4;col=mix(uA,uB,length(p)*.8);float r=length(p);float an=atan(p.y,p.x);
 for(int k=0;k<3;k++){float fk=float(k);float N=70.+fk*45.;float cell=an*N/6.2832;float id=floor(cell);float rnd=hash(vec2(id,fk*7.3));
  float zz=fract(rnd+t*.025*(.4+rnd)+uScroll*(3.+fk)*(.5+rnd));float rr=zz*zz*1.5;float len=.012+.05*zz+uPress*.32*zz;
  float w=abs(fract(cell)-.5);float streak=smoothstep(len,0.,abs(r-rr-len*.5))*smoothstep(.5,.0,w*(2.4+fk))*zz*step(.35,rnd);g+=streak*(.9+uPress);}
 col=mix(col,uC,.3*smoothstep(.5,.0,r));g=min(g,1.);}
else{float v=p.y*1.1+.26*sin(p.x*1.7+t*.18+uScroll*8.)+.12*sin(p.x*4.1-t*.13+uScroll*3.);float f=fbm(p*1.8+vec2(t*.04,uScroll*2.));
 float bands=sin(v*13.+f*4.);float fold=pow(.5+.5*bands,7.);float env=smoothstep(1.05,.1,abs(v));
 col=mix(uA,uC,(.45+.45*sin(v*3.2+f*2.))*env);g=fold*.62*env*(.9+uPress*.6);}
g*=calm;col=mix(uA,col,.14+.86*calm);
col=mix(col,uLine,clamp(g,0.,1.));col*=1.-.3*dot(uv-.5,uv-.5)*2.;col+=(hash(gl_FragCoord.xy+fract(t)*91.)-.5)*.028;gl_FragColor=vec4(col,1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uTime', 'uScroll', 'uPress', 'uMode', 'uSide', 'uCalm', 'uRes', 'uA', 'uB', 'uC', 'uLine'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    const hex = (h) => [(h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255];
    const PAL = { dark: [0x0f0e0c, 0x17130c, 0x3a2b0c, 0xd4af37], light: [0xfaf9f6, 0xf3eee1, 0xe9d9a6, 0x8a6d1f] };
    const paint = () => { const p = PAL[state.theme]; ['uA', 'uB', 'uC', 'uLine'].forEach((n, i) => gl.uniform3fv(U[n], hex(p[i]))); };
    const resize = () => { const d = Math.min(devicePixelRatio || 1, 1.5) * 0.6; cv.width = innerWidth * d; cv.height = innerHeight * d; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, cv.width, cv.height); };
    paint(); resize();
    return { paint, resize, draw(time, scroll, press, side, calm) { gl.uniform1f(U.uMode, state.bg); gl.uniform1f(U.uSide, side); gl.uniform1f(U.uCalm, calm); gl.uniform1f(U.uTime, time); gl.uniform1f(U.uScroll, scroll); gl.uniform1f(U.uPress, press); gl.drawArrays(gl.TRIANGLES, 0, 3); } };
  })();

  /* ---------- geometry of the waypoints ---------- */
  const thing = $('#thing'), shots = $('#shots'), layers = [$('#L0'), $('#L1'), $('#L2'), $('#L3'), $('#L4')];
  const G = { vw: 0, vh: 0, key: null, w1: null, w2: null, w3: null, w4: null };
  /* positions are measured inside the stage, so a visible scrollbar (left side in Arabic) cannot shift anything */
  const stageEl = $('#top');
  const rect = (el) => { const r = el.getBoundingClientRect(), o = stageEl.getBoundingClientRect(); return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height }; };
  const underline = (r) => ({ x: r.x, y: r.y + r.h * (ar ? 0.84 : 0.92), w: r.w, h: Math.max(4, r.h * 0.045) });
  function measure() {
    G.vw = stageEl.clientWidth || innerWidth; G.vh = stageEl.clientHeight || innerHeight;
    h1.style.transform = 'none';
    const k = rect(key), hr = rect(h1);
    G.key = k; h1.style.transformOrigin = `${k.x + k.w / 2 - hr.x}px ${k.y + k.h / 2 - hr.y}px`;
    G.w1 = rect($('#w1')); G.w2 = rect($('#w2'));
    G.w4 = { x: -2, y: -2, w: G.vw + 4, h: G.vh + 4 }; G.w3 = rect($('#w3'));
    if (bg) bg.resize();
    moveInd();
  }

  /* ---------- the frame loop: everything is a function of scroll ---------- */
  const intro = { type: state.still ? 1 : 0, bar: state.still ? 1 : 0 };
  let S = 0, lastY = scrollY, vel = 0, flow = 0, prev = 0, bgSide = 0, mx = 0, my = 0, hov = 0, ctaHover = false, surge = 0, mailOn = false, coreOn = false;
  const w2El = $('#w2'), nd0 = $('#ticks .nd'), pscene = $('#pscene .scn'), shotImgs = $$('#shots img'), chrome = $('#chrome'), wbars = $$('#wdots button');
  const GL = 'abcdefghijklmnopqrstuvwxyz@.';
  function typeMail() {
    const el = $('#mail'), final = 'youssef@zakydev.com'; let f = 0; clearInterval(typeMail.id);
    typeMail.id = setInterval(() => {
      f += 1; el.textContent = [...final].map((ch, i) => (i < f / 2 ? ch : i < f / 2 + 3 ? GL[(Math.random() * GL.length) | 0] : '')).join('');
      if (f / 2 >= final.length) { clearInterval(typeMail.id); el.textContent = final; }
    }, 34);
  }
  const setLayer = (el, a, shift) => {
    el.style.visibility = a > 0.01 ? 'visible' : 'hidden'; el.style.opacity = a; el.style.pointerEvents = a > 0.6 ? 'auto' : 'none';
    const mv = $('.mv', el); if (mv) mv.style.transform = `translate3d(0,${shift}px,0)`;
  };
  function frame(now) {
    const t = now / 1000, dt = Math.min(0.05, t - prev); prev = t;
    const target = scrollY / G.vh; S += (target - S) * (state.still ? 1 : 0.14);
    vel += ((scrollY - lastY) - vel) * 0.2; lastY = scrollY;
    flow += dt * (1 + Math.min(5, Math.abs(vel) * 0.06));

    /* hero: the headline swells around its key word until you are inside it */
    const z = ease((S - 0.1) / 0.8), sc = state.still ? 1 : 1 + z * z * 15, pull = state.still ? 0 : ease(z * 1.5);
    const kc = { x: G.key.x + G.key.w / 2, y: G.key.y + G.key.h / 2 };
    const skew = state.still ? 0 : clamp(vel * 0.03, -3, 3) * (1 - z);
    h1.style.transform = `translate3d(${(G.vw / 2 - kc.x) * pull}px,${(G.vh / 2 - kc.y) * pull}px,0) scale(${sc}) skewY(${skew}deg)`;
    const gone = ease(z / 0.38);
    others.forEach((w) => { w.style.opacity = (1 - gone) * intro.type; });
    const toImg = ease((z - 0.28) / 0.3);
    keyInk.style.opacity = 1 - toImg; keyImg.style.opacity = toImg;
    const heroA = state.still ? 1 - ease((S - 0.4) / 0.3) : 1 - ease((z - 0.84) / 0.16), side = 1 - ease((S - 0.02) / 0.2);
    layers[0].style.visibility = heroA > 0.01 ? 'visible' : 'hidden'; h1.style.opacity = heroA;
    $$('.hk,.hfoot,.cue', layers[0]).forEach((el) => { el.style.opacity = side * intro.bar; el.style.transform = `translate3d(0,${(side - 1) * 24}px,0)`; });

    /* later beats fade in and out as whole layers; their text slides a little */
    const aW = ease((S - 0.85) / 0.2) * (1 - ease((S - 2.72) / 0.18));
    const aP = ease((S - 3.05) / 0.2) * (1 - ease((S - 4.45) / 0.2));
    const aA = ease((S - 4.8) / 0.22) * (1 - ease((S - 5.68) / 0.2));
    const aC = ease((S - 5.95) / 0.25);
    setLayer(layers[1], aW, (S < 1.6 ? 1 - aW : aW - 1) * 46);
    setLayer(layers[2], aP, (S < 3.6 ? 1 - aP : aP - 1) * 46);
    setLayer(layers[3], aC, (1 - aC) * 46);
    setLayer(layers[4], aA, (S < 5.3 ? 1 - aA : aA - 1) * 46);
    if (aA > 0.01) {
      const tt = state.still ? 5.99 : t / 2.3, k7 = Math.floor(tt) % 7, prog = (k7 - 1 + ease(clamp((tt % 1) / 0.5))) / 7;
      runner.style.rotate = `${prog * 360}deg`; arc.style.setProperty('--a', Math.max(0, prog).toFixed(4));
      if (k7 !== loopOn) { loopOn = k7; stations.forEach((el, n) => { el.classList.toggle('on', n === k7); el.classList.toggle('done', n < k7); }); flip(loopw, 1, () => { loopw.textContent = L.loop[k7]; loopt.textContent = LOOP_TOOLS[k7]; }); }
    }
    setProject(clamp(Math.floor((S - WORK0) / WORK_STEP), 0, 2));
    setStage(clamp(Math.floor((S - PROC0) / PROC_STEP), 0, NS - 1));
    if (aP > 0.01) { const PP = clamp((S - PROC0) / (PROC_STEP * NS)); for (let i = 0; i < NS; i++) pscene.style.setProperty(`--p${i}`, state.still ? 1 : ease(clamp((PP * NS - i) / 0.62)).toFixed(3)); }

    const navI = S >= 5.8 ? 3 : S >= 4.6 ? 2 : S >= 2.85 ? 1 : S >= 0.9 ? 0 : -1;
    if (navI !== navOn) { navOn = navI; navLinks.forEach((el, n) => el.classList.toggle('on', n === navI)); requestAnimationFrame(() => moveInd()); }
    if (navI >= 0) $('.ind').style.setProperty('--sp', clamp((S - NAV_R[navI][0]) / (NAV_R[navI][1] - NAV_R[navI][0])).toFixed(3));
    /* the one thing */
    const a01 = ease((S - 0.5) / 0.5), a12 = ease((S - 2.8) / 0.4), a23 = ease((S - 4.5) / 0.45), a34 = ease((S - 5.7) / 0.45);
    const live = underline(S < 1.05 ? rect(key) : G.key);
    const w0 = { x: ar ? live.x + live.w * (1 - intro.bar) : live.x, y: live.y, w: live.w * intro.bar, h: live.h };
    if (aP > 0.01) { G.w2 = rect(w2El); const n0 = rect(nd0); G.w2.y = n0.y + n0.h / 2 - 1.5; } /* the rail can move when the text above it changes height */
    const grow = clamp((S - PROC0) / (PROC_STEP * (NS - 1))), lw = G.w2.w * grow;
    const w2 = { x: ar ? G.w2.x + G.w2.w - lw : G.w2.x, y: G.w2.y, w: lw, h: 3 };
    const [A, B, k] = a34 > 0 ? [G.w3, G.w4, a34] : a23 > 0 ? [w2, G.w3, a23] : a12 > 0 ? [G.w1, w2, a12] : [w0, G.w1, a01];
    const ringness = a23 * (1 - ease(a34 / 0.7));
    const framed = clamp(a01 * 1.4 - 0.2) * (1 - a12);
    const tiltK = framed * (state.still ? 0 : 1); hov += ((ctaHover ? 1 : 0) - hov) * 0.15;
    thing.style.transform = `translate3d(${mix(A.x, B.x, k)}px,${mix(A.y, B.y, k) + Math.sin(t * 0.9) * 6 * tiltK}px,0) perspective(1100px) rotateY(${(G.vw <= 860 ? Math.sin(t * 0.7) * 2.5 : mx * 9) * tiltK}deg) rotateX(${-my * 7 * tiltK}deg) scale(${1 + hov * 0.07 * a34})`;
    thing.style.background = `rgba(212,175,55,${Math.max(ease(a34 / 0.35), mix(A.h, B.h, k) < 12 ? 1 : 0)})`;
    root.classList.toggle('flood', a34 > 0.55);
    const seg = clamp((S - WORK0) / WORK_STEP - state.project), im = shotImgs[state.project];
    wbars.forEach((b, n) => b.style.setProperty('--f', n < state.project ? 1 : n === state.project ? seg : 0));
    if (im && !state.still) im.style.objectPosition = `50% ${(seg * 100).toFixed(1)}%`;
    if (aA > 0.6 && !coreOn) { coreOn = true; replay($('.core')); }
    if (aA < 0.05) coreOn = false;
    if (aC > 0.55 && !mailOn) { mailOn = true; if (!state.still) { typeMail(); if (gsap) { gsap.fromTo('#ch .wm > span', { yPercent: 118 }, { yPercent: 0, duration: 0.95, stagger: 0.08, ease: EASE }); gsap.fromTo('.cend > :not(h2)', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07, delay: 0.25, ease: EASE }); } } }
    if (aC < 0.1) mailOn = false;
    surge *= 0.965;
    const tw = Math.max(0, mix(A.w, B.w, k)), th = Math.max(4, mix(A.h, B.h, k));
    thing.style.width = `${tw}px`; thing.style.height = `${th}px`; thing.style.visibility = tw < 3 ? 'hidden' : 'visible';
    thing.style.borderRadius = `${mix(2, 14, framed) + ringness * ringness * Math.min(tw, th) / 2}px`;
    shots.style.opacity = clamp((th - 6) / 26) * (1 - ease(a12 / 0.6)); chrome.style.opacity = shots.style.opacity;

    $('#bar').style.transform = `scaleX(${clamp(target / END)})`;
    const phone = G.vw <= 860, textSide = (ar ? -1 : 1) * (aA > 0.5 ? 1 : -1);
    bgSide += ((phone ? 0 : textSide) - bgSide) * 0.12;
    if (bg) bg.draw(state.still ? 0 : flow, clamp(S / END), Math.min(1, Math.abs(vel) * 0.012 + surge * 0.18), bgSide, phone ? 0.5 : 1);
    requestAnimationFrame(frame);
  }

  /* ---------- on load: the headline builds itself, then the gold line is drawn under the key word ---------- */
  const replay = (el) => { el.classList.remove('play'); void el.getBoundingClientRect(); el.classList.add('play'); };
  /* landing: the two brackets lock into the Z in the middle of the screen, then the mark flies to its place in the menu */
  /* loading: the two brackets search for each other while real assets load, a counter runs to 100, then they lock and the mark flies to the menu */
  function landing(done) {
    const intro = $('#intro'), navLogo = $('.brand .logo');
    const finish = () => { root.classList.remove('landing'); if (intro) intro.remove(); };
    let seen = false; try { seen = !!sessionStorage.getItem('zk-intro'); } catch { seen = false; }
    if (!intro || state.still || !gsap || ((seen || params.has('shot')) && !params.has('intro'))) { finish(); replay(navLogo); return done(); }
    try { sessionStorage.setItem('zk-intro', '1'); } catch { /* private mode */ }
    const mark = $('svg', intro), num = $('#ldn'), bar = $('#ldb');
    mark.classList.add('seek');
    const jobs = [document.fonts ? document.fonts.ready : Promise.resolve(), ...SYSTEMS.map((s) => new Promise((r) => { const im = new Image(); im.onload = im.onerror = r; im.src = s.img; }))];
    let loaded = 0, shown = 0; jobs.forEach((j) => j.then(() => { loaded += 1; }));
    const t0 = performance.now();
    const tick = (now) => {
      const cap = Math.min(1, (now - t0) / 900), giveUp = now - t0 > 5000;
      const target = giveUp ? 1 : Math.min(loaded / jobs.length, cap);
      shown += (target - shown) * 0.16; if (target === 1 && shown > 0.992) shown = 1;
      num.textContent = String(Math.round(shown * 100)).padStart(2, '0'); bar.style.transform = `scaleX(${shown})`;
      if (shown < 1) return requestAnimationFrame(tick);
      mark.classList.remove('seek'); mark.classList.add('lock');
      setTimeout(() => {
        const from = mark.getBoundingClientRect(), to = navLogo.getBoundingClientRect();
        gsap.to('.ld', { autoAlpha: 0, y: 10, duration: 0.3 });
        gsap.to(mark, { x: to.left + to.width / 2 - (from.left + from.width / 2), y: to.top + to.height / 2 - (from.top + from.height / 2), scale: to.width / from.width, duration: 0.75, ease: 'power3.inOut', onComplete: finish });
        gsap.to(intro, { backgroundColor: 'rgba(15,14,12,0)', duration: 0.5 });
        setTimeout(done, 250);
      }, 420);
    };
    requestAnimationFrame(tick);
  }
  function typeRole() {
    const el = $('#rolet'), list = L.roles; let i = 0;
    $('.role').classList.add('in');
    if (state.still) { el.textContent = list[0]; return; }
    const type = (txt, n) => { el.textContent = txt.slice(0, n); if (n < txt.length) setTimeout(() => type(txt, n + 1), 48 + Math.random() * 40); else setTimeout(() => del(txt, txt.length), 3000); };
    const del = (txt, n) => { el.textContent = txt.slice(0, n); if (n > 0) setTimeout(() => del(txt, n - 1), 26); else { i = (i + 1) % list.length; setTimeout(() => type(list[i], 1), 380); } };
    setTimeout(() => type(list[0], 1), 650);
  }
  function play() {
    if (state.still || !gsap) { intro.type = 1; intro.bar = 1; return; }
    const parts = ar ? $$('.w', h1) : $$('.ch', h1);
    gsap.set(parts, { transformPerspective: 700 });
    gsap.from(parts, { yPercent: 115, rotationX: ar ? 0 : -85, opacity: 0, duration: 0.95, ease: EASE, stagger: ar ? 0.1 : 0.028, delay: 0.15 });
    gsap.to(intro, { type: 1, duration: 0.01 });
    if (!ar) { const v = { w: 220, s: 100 }; gsap.to(v, { w: 560, s: 0, duration: 1.7, ease: 'power2.out', delay: 0.15, onUpdate: () => { h1.style.fontVariationSettings = `"wght" ${v.w | 0}, "SOFT" ${v.s | 0}`; } }); }
    gsap.to(intro, { bar: 1, duration: 0.9, ease: 'power3.inOut', delay: 1.05 });
  }

  /* ---------- controls ---------- */
  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]'); if (!go) return;
    e.preventDefault(); scrollTo({ top: +go.dataset.go * innerHeight, behavior: state.still ? 'auto' : 'smooth' });
  });
  const cur = $('#cur');
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || state.still) return;
    mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5;
    cur.classList.add('live'); cur.classList.toggle('big', !!e.target.closest('a,button,[data-go]'));
    if (gsap) gsap.to(cur, { x: e.clientX, y: e.clientY, duration: 0.35, ease: EASE });
    if (ar || S > 0.12) return;
    $$('.ch', h1).forEach((c) => {
      const r = c.getBoundingClientRect(), k = clamp(1 - Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) / 220);
      c.style.fontVariationSettings = k > 0.02 ? `"wght" ${(560 + 340 * k) | 0}, "SOFT" ${(100 * k) | 0}` : '';
    });
  });
  $('#theme').addEventListener('click', (e) => {
    const apply = () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; root.dataset.theme = state.theme; store('zk-theme', state.theme); if (bg) bg.paint(); };
    if (!document.startViewTransition || state.still) return apply();
    root.style.setProperty('--vx', `${e.clientX}px`); root.style.setProperty('--vy', `${e.clientY}px`); document.startViewTransition(apply);
  });
  $('#lang').addEventListener('click', () => { store('zk-lang', ar ? 'en' : 'ar'); const u = new URL(location.href); u.searchParams.delete('lang'); location.href = u.toString(); });
  $('#copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText('youssef@zakydev.com'); $('#copy').textContent = L.copied; } catch { location.href = 'mailto:youssef@zakydev.com'; } });
  /* prototype options: try a background and a logo live */
  const setLogo = () => { $$('.logo').forEach((el) => { el.innerHTML = LOGOS[state.logo][1]; }); $$('#ologo button').forEach((b, n) => b.setAttribute('aria-pressed', n === state.logo)); };
  const setBg = () => $$('#obg button').forEach((b, n) => b.setAttribute('aria-pressed', n === state.bg));
  $('#obg').innerHTML = BGS.map((n, i) => `<button type="button" data-bg="${i}">${i + 1} ${n}</button>`).join('');
  $('#ologo').innerHTML = LOGOS.map((l, i) => `<button type="button" data-logo="${i}"><svg viewBox="0 0 64 64" aria-hidden="true">${l[1]}</svg>${l[0]}</button>`).join('');
  $('#opts').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.bg) { state.bg = +b.dataset.bg; store('zk9-bg', String(state.bg)); setBg(); }
    if (b.dataset.logo) { state.logo = +b.dataset.logo; store('zk12-logo', String(state.logo)); setLogo(); }
  });
  setLogo(); setBg(); if (innerWidth > 860 && !params.has('shot')) $('#opts').open = true;
  addEventListener('resize', measure);

  measure(); requestAnimationFrame(frame);
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(() => { measure(); landing(() => { play(); typeRole(); }); });
})();
