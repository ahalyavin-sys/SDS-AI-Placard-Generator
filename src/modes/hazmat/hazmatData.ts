// Map HazMat pictogram keys to the shared image assets in /public/images.
export const HM_IMAGES: Record<string, string> = {
  explosive: '/images/Explosive.jpg',
  flammable: '/images/Flammable.jpg',
  'non-flammable': '/images/Gas.jpg',
  oxidizing: '/images/Oxidizer.jpg',
  compressed_gas: '/images/Gas.jpg',
  corrosive: '/images/Corrosive.jpg',
  toxic: '/images/Toxic.jpg',
  exclamation_mark: '/images/Irritant.jpg',
  health_hazard: '/images/Health.jpg',
  environment: '/images/Environment.jpg',
  miscellaneous: '/images/Miscellaneous.jpg',
};

export interface ClassDesc { en: string; ru: string; he: string; ar: string; }

export const CLASS_DESCRIPTIONS: Record<string, ClassDesc> = {
  '1': { en: 'Explosive substance', ru: 'Взрывчатое вещество', he: 'חומר נפץ', ar: 'مادة متفجرة' },
  '2': { en: 'Dangerous Gas', ru: 'Опасный газ', he: 'גז מסוכן', ar: 'غاز خطير' },
  '3': { en: 'Flammable liquid', ru: 'Легковоспламеняющаяся жидкость', he: 'נוזל דליק', ar: 'سائل قابل للاشتعال' },
  '4': { en: 'Flammable solid', ru: 'Легковоспламеняющееся твердое вещество', he: 'מוצק דליק', ar: 'مادة صلبة قابلة للاشتعال' },
  '5': { en: 'Oxidizing substance', ru: 'Окисляющее вещество', he: 'חומר מחמצן', ar: 'مادة مؤكسدة' },
  '6': { en: 'Toxic substance', ru: 'Токсичное вещество', he: 'חומר רעיל', ar: 'مادة سامة' },
  '7': { en: 'Radioactive material', ru: 'Радиоактивный материал', he: 'חומר רדיואקטיבי', ar: 'مادة مشعة' },
  '8': { en: 'Corrosive substance', ru: 'Коррозионное вещество', he: 'חומר משתך', ar: 'مادة مسببة للتآكل' },
  '9': { en: 'Environmentally hazardous substance', ru: 'Вещество, опасное для окружающей среды', he: 'חומר מסוכן לסביבה', ar: 'مادة خطرة بيئيا' },
};

/** Resolve the pictogram image sources from a pictogram string and/or UN class. */
export function resolvePictograms(picStr: string, classStr: string): { src: string; alt: string }[] {
  const out: { src: string; alt: string }[] = [];
  const added = new Set<string>();
  const add = (key: string, alt: string) => {
    if (!added.has(key) && HM_IMAGES[key]) { added.add(key); out.push({ src: HM_IMAGES[key], alt }); }
  };

  if (picStr && picStr.trim()) {
    picStr.toLowerCase().split(/[,;+&]/).map((p) => p.trim()).forEach((p) => {
      if (p.includes('explos')) add('explosive', 'Explosive');
      else if (p.includes('non-flam') || p.includes('non flam')) add('non-flammable', 'Non-Flammable Gas');
      else if (p.includes('flam') || p.includes('combust') || p.includes('wet')) add('flammable', 'Flammable');
      else if (p.includes('oxid') || p.includes('rondflam')) add('oxidizing', 'Oxidizing');
      else if (p.includes('gas') || p.includes('bottle') || p.includes('cylinder')) add('compressed_gas', 'Compressed Gas');
      else if (p.includes('corros') || p.includes('acid')) add('corrosive', 'Corrosive');
      else if (p.includes('tox') || p.includes('skull') || p.includes('poison')) add('toxic', 'Toxic');
      else if (p.includes('harm') || p.includes('irrit') || p.includes('exclam')) add('exclamation_mark', 'Exclamation Mark');
      else if (p.includes('health') || p.includes('silhouet')) add('health_hazard', 'Health Hazard');
      else if (p.includes('misc') || p.includes('miscellaneous')) add('miscellaneous', 'Miscellaneous');
      else if (p.includes('env') || p.includes('pollu') || p.includes('hazard')) add('environment', 'Environment');
    });
    if (out.length) return out;
  }

  if (!classStr) return out;
  const matches = classStr.toString().match(/\b[1-9](?:\.\d)?\b/g) || [];
  [...new Set(matches)].forEach((cls) => {
    if (cls.startsWith('1')) add('explosive', `Class ${cls}`);
    else if (cls === '2.1') add('flammable', `Class ${cls}`);
    else if (cls === '2.2') add('non-flammable', `Class ${cls}`);
    else if (cls === '2.3') add('toxic', `Class ${cls}`);
    else if (cls.startsWith('2')) add('compressed_gas', `Class ${cls}`);
    else if (cls.startsWith('3') || cls.startsWith('4')) add('flammable', `Class ${cls}`);
    else if (cls.startsWith('5')) add('oxidizing', `Class ${cls}`);
    else if (cls.startsWith('6')) add('toxic', `Class ${cls}`);
    else if (cls.startsWith('8')) add('corrosive', `Class ${cls}`);
    else if (cls.startsWith('9')) add('miscellaneous', `Class ${cls}`);
  });
  return out;
}

export interface UnRecord { class?: string; eac?: string; desc?: string; pictograms?: string; }
