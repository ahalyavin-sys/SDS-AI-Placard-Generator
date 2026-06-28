export type Language = 'english' | 'russian' | 'arabic' | 'hebrew';

export const LANGUAGES: Language[] = ['english', 'russian', 'arabic', 'hebrew'];
export const RTL = new Set<Language>(['arabic', 'hebrew']);

export interface PpeItem { icon: string; text: string; }
export interface FirstAid { eyes: string; skin: string; ingestion: string; inhalation: string; }
export interface LangData {
  productName: string;
  description: string;
  hazards: string[];
  ppe: PpeItem[];
  firstAid: FirstAid;
  supplierName: string;
}
export interface PlacardData {
  unNumber: string;
  pictograms: string[];
  english: LangData;
  russian: LangData;
  arabic: LangData;
  hebrew: LangData;
}

export const GHS_IMAGES: Record<string, string> = {
  GHS01: '/images/Explosive.jpg',
  GHS02: '/images/Flammable.jpg',
  GHS03: '/images/Oxidizer.jpg',
  GHS04: '/images/Gas.jpg',
  GHS05: '/images/Corrosive.jpg',
  GHS06: '/images/Toxic.jpg',
  GHS07: '/images/Irritant.jpg',
  GHS08: '/images/Health.jpg',
  GHS09: '/images/Environment.jpg',
};

export const GHS_LABELS: Record<string, string> = {
  GHS01: 'Explosive', GHS02: 'Flammable', GHS03: 'Oxidizer',
  GHS04: 'Gas under pressure', GHS05: 'Corrosive', GHS06: 'Acute toxicity',
  GHS07: 'Irritant', GHS08: 'Health hazard', GHS09: 'Environment',
};

export interface UiStrings {
  tab: string; signal: string; un: string; hazards: string; ppe: string; firstAid: string;
  eyes: string; skin: string; ingestion: string; inhalation: string;
  poisonTitle: string; poisonWhen: string; poisonText: string;
  madaWhen: string; madaText: string; supplier: string; advice: string; emergency: string;
}

export const UI: Record<Language, UiStrings> = {
  english: { tab: 'English', signal: 'DANGER', un: 'UN', hazards: 'Severe hazards', ppe: 'Mandatory personal protective equipment (PPE)', firstAid: 'First aid - in emergency', eyes: 'Eyes', skin: 'Skin', ingestion: 'Ingestion', inhalation: 'Inhalation', poisonTitle: 'National Poison Information Center (Rambam)', poisonWhen: 'Who to call? 04-7771900', poisonText: 'For suspected poisoning or chemical exposure. Professional advice 24/7.', madaWhen: 'When to call 101 (MADA)?', madaText: 'For immediate emergency: breathing difficulty, loss of consciousness, collapse, or severe injury.', supplier: 'Supplier', advice: 'In any exposure case, seek medical advice.', emergency: 'Emergency: 101' },
  russian: { tab: 'Русский', signal: 'ОПАСНО', un: 'UN', hazards: 'Серьезные опасности', ppe: 'Обязательные средства индивидуальной защиты (СИЗ)', firstAid: 'Первая помощь - при аварии', eyes: 'Глаза', skin: 'Кожа', ingestion: 'Проглатывание', inhalation: 'Вдыхание', poisonTitle: 'Национальный информационный центр по отравлениям (Рамбам)', poisonWhen: 'Куда звонить? 04-7771900', poisonText: 'При подозрении на отравление или воздействие химикатов. Профессиональная консультация 24/7.', madaWhen: 'Когда звонить 101 (МАДА)?', madaText: 'При немедленной опасности: затрудненное дыхание, потеря сознания, коллапс или тяжелая травма.', supplier: 'Поставщик', advice: 'При любом воздействии обратитесь за медицинской помощью.', emergency: 'Экстренно: 101' },
  arabic: { tab: 'العربية', signal: 'خطر', un: 'UN', hazards: 'مخاطر شديدة', ppe: 'معدات الوقاية الشخصية الإلزامية', firstAid: 'الإسعافات الأولية - في حالة الطوارئ', eyes: 'العينان', skin: 'الجلد', ingestion: 'الابتلاع', inhalation: 'الاستنشاق', poisonTitle: 'المركز الوطني لمعلومات السموم (رمبام)', poisonWhen: 'بمن تتصل؟ 04-7771900', poisonText: 'عند الاشتباه بالتسمم أو التعرض للمواد الكيميائية. استشارة مهنية على مدار الساعة.', madaWhen: 'متى تتصل بـ 101 (نجمة داود الحمراء)؟', madaText: 'في حالة طوارئ فورية: صعوبة تنفس، فقدان الوعي، انهيار، أو إصابة شديدة.', supplier: 'المورد', advice: 'في أي حالة تعرض، اطلب استشارة طبية.', emergency: 'طوارئ: 101' },
  hebrew: { tab: 'עברית', signal: 'סכנה', un: 'UN', hazards: 'סיכונים חמורים', ppe: 'ציוד מגן אישי חובה', firstAid: 'עזרה ראשונה - במקרה חירום', eyes: 'עיניים', skin: 'עור', ingestion: 'בליעה', inhalation: 'שאיפה', poisonTitle: 'המרכז הארצי למידע בהרעלות (רמב"ם)', poisonWhen: 'למי להתקשר? 04-7771900', poisonText: 'במקרה של חשד להרעלה או חשיפה לחומרים כימיים. ייעוץ מקצועי 24/7.', madaWhen: 'מתי להתקשר ל-101 (מד"א)?', madaText: 'במקרה חירום מיידי: קשיי נשימה, אובדן הכרה, התמוטטות או פגיעה חמורה.', supplier: 'ספק', advice: 'בכל מקרה של חשיפה יש לפנות לייעוץ רפואי.', emergency: 'חירום: 101' },
};

export interface PpeIcon { label: string; src: string; fallback: string; }

function codeBadgeDataUri(code: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 188 188"><circle cx="94" cy="94" r="88" fill="#0b70b7"/><text x="94" y="84" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="34" font-weight="700">${code}</text><text x="94" y="116" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="14" font-weight="700">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const PPE_ICONS: Record<string, PpeIcon> = {
  M003: { label: 'M003 - Wear ear protection', src: '/images/iso7010/ISO_7010_M003.svg.png', fallback: '/images/ppe/hearing-protection.png' },
  M004: { label: 'M004 - Wear eye protection', src: '/images/iso7010/ISO_7010_M004.svg.png', fallback: '/images/ppe/safety-glasses.png' },
  M008: { label: 'M008 - Wear safety footwear', src: '/images/iso7010/ISO_7010_M008.svg.png', fallback: '/images/ppe/safety-boots.png' },
  M009: { label: 'M009 - Wear protective gloves', src: '/images/iso7010/ISO_7010_M009.svg.png', fallback: '/images/ppe/protective-gloves.png' },
  M010: { label: 'M010 - Wear protective clothing', src: '/images/iso7010/ISO_7010_M010.svg.png', fallback: codeBadgeDataUri('M010', 'Protective clothing') },
  M013: { label: 'M013 - Wear a face shield', src: '/images/iso7010/ISO_7010_M013.svg.png', fallback: '/images/ppe/face-shield.png' },
  M014: { label: 'M014 - Wear head protection', src: '/images/iso7010/ISO_7010_M014.svg.png', fallback: '/images/ppe/hard-hat.png' },
  M015: { label: 'M015 - Wear high-visibility clothing', src: '/images/iso7010/ISO_7010_M015.svg.png', fallback: codeBadgeDataUri('M015', 'Hi-vis clothing') },
  M016: { label: 'M016 - Wear a mask', src: '/images/iso7010/ISO_7010_M016.svg.png', fallback: '/images/ppe/dust-mask.png' },
  M017: { label: 'M017 - Wear respiratory protection', src: '/images/iso7010/ISO_7010_M017.svg.png', fallback: '/images/ppe/respirator.png' },
  M026: { label: 'M026 - Use protective apron', src: '/images/iso7010/ISO_7010_M026.svg.png', fallback: codeBadgeDataUri('M026', 'Protective apron') },
  M059: { label: 'M059 - Wear laboratory coat', src: '/images/iso7010/ISO_7010_M059.svg.png', fallback: codeBadgeDataUri('M059', 'Laboratory coat') },
};

export const SAMPLE_DATA: PlacardData = {
  unNumber: '1789',
  pictograms: ['GHS05', 'GHS07'],
  english: { productName: 'Hydrochloric Acid 32%', description: 'Corrosive inorganic acid solution.', hazards: ['Causes severe skin burns and eye damage.', 'May cause respiratory irritation.', 'Corrosive to metals.'], ppe: [{ icon: 'M004', text: 'Chemical goggles' }, { icon: 'M009', text: 'Acid resistant gloves' }, { icon: 'M013', text: 'Face shield' }, { icon: 'M010', text: 'Protective clothing' }], firstAid: { eyes: 'Rinse cautiously with water for several minutes. Remove contact lenses if present and easy to do. Continue rinsing and get urgent medical help.', skin: 'Remove contaminated clothing immediately. Rinse skin with water or shower for at least 15 minutes.', ingestion: 'Rinse mouth. Do not induce vomiting. Call poison center or doctor immediately.', inhalation: 'Move person to fresh air and keep comfortable for breathing. Get medical attention.' }, supplierName: 'Enter supplier name' },
  russian: { productName: 'Соляная кислота 32%', description: 'Коррозионный раствор неорганической кислоты.', hazards: ['Вызывает тяжелые ожоги кожи и повреждение глаз.', 'Может вызывать раздражение дыхательных путей.', 'Коррозионно для металлов.'], ppe: [{ icon: 'M004', text: 'Химические очки' }, { icon: 'M009', text: 'Кислотостойкие перчатки' }, { icon: 'M013', text: 'Защитный щиток' }, { icon: 'M010', text: 'Защитная одежда' }], firstAid: { eyes: 'Осторожно промывать водой несколько минут. Снять контактные линзы, если это легко сделать. Продолжать промывание и срочно обратиться за медицинской помощью.', skin: 'Немедленно снять загрязненную одежду. Промывать кожу водой или под душем не менее 15 минут.', ingestion: 'Прополоскать рот. Не вызывать рвоту. Немедленно позвонить в токсикологический центр или врачу.', inhalation: 'Вывести пострадавшего на свежий воздух и обеспечить удобное положение для дыхания. Обратиться к врачу.' }, supplierName: 'Укажите поставщика' },
  arabic: { productName: 'حمض الهيدروكلوريك 32%', description: 'محلول حمض غير عضوي آكل.', hazards: ['يسبب حروقا جلدية شديدة وتلفا خطيرا للعين.', 'قد يسبب تهيجا في الجهاز التنفسي.', 'آكل للمعادن.'], ppe: [{ icon: 'M004', text: 'نظارات كيميائية' }, { icon: 'M009', text: 'قفازات مقاومة للأحماض' }, { icon: 'M013', text: 'واقي وجه' }, { icon: 'M010', text: 'ملابس واقية' }], firstAid: { eyes: 'اشطف بحذر بالماء لعدة دقائق. أزل العدسات اللاصقة إن وجدت وكان ذلك سهلا. استمر بالشطف واطلب مساعدة طبية عاجلة.', skin: 'انزع الملابس الملوثة فورا. اغسل الجلد بالماء أو تحت الدش لمدة 15 دقيقة على الأقل.', ingestion: 'اشطف الفم. لا تسبب القيء. اتصل بمركز السموم أو الطبيب فورا.', inhalation: 'انقل الشخص إلى الهواء النقي واجعله في وضع مريح للتنفس. اطلب العناية الطبية.' }, supplierName: 'أدخل اسم المورد' },
  hebrew: { productName: 'חומצה הידרוכלורית 32%', description: 'תמיסת חומצה אנאורגנית קורוזיבית.', hazards: ['גורם לכוויות עור חמורות ולנזק חמור לעיניים.', 'עלול לגרום לגירוי בדרכי הנשימה.', 'קורוזיבי למתכות.'], ppe: [{ icon: 'M004', text: 'משקפי מגן כימיים' }, { icon: 'M009', text: 'כפפות עמידות לחומצה' }, { icon: 'M013', text: 'מגן פנים' }, { icon: 'M010', text: 'ביגוד מגן' }], firstAid: { eyes: 'לשטוף בזהירות במים במשך מספר דקות. להסיר עדשות מגע אם קיימות וקל להסירן. להמשיך בשטיפה ולקבל טיפול רפואי דחוף.', skin: 'להסיר מיד בגדים מזוהמים. לשטוף את העור במים או במקלחת לפחות 15 דקות.', ingestion: 'לשטוף את הפה. אין לגרום להקאה. להתקשר מיד למרכז הרעלות או לרופא.', inhalation: 'להעביר לאוויר צח ולשמור במנוחה בתנוחה נוחה לנשימה. לפנות לטיפול רפואי.' }, supplierName: 'הזן שם ספק' },
};
