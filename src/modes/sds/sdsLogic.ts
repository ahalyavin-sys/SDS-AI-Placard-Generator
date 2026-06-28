import { runAi, type Provider } from '../../lib/ai';
import {
  GHS_IMAGES, LANGUAGES, PPE_ICONS, SAMPLE_DATA,
  type Language, type PlacardData,
} from './data';

export function normalizeLines(value: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const parts = String(value || '').split('\n').map((l) => l.trim()).filter(Boolean);
  return parts.length ? parts : fallback;
}

export function normalizeUnNumber(value: unknown): string {
  const raw = String(value ?? '').trim();
  if (!raw) return 'N/A';
  const digits = raw.replace(/^un[\s\-:.]/i, '').match(/\d+/);
  return digits ? digits[0] : raw.toUpperCase() === 'N/A' ? 'N/A' : raw;
}

export function normalizePpeIcon(icon?: string, text = ''): string {
  const v = `${icon || ''} ${text || ''}`.toLowerCase();
  if (/\b(ear protection|hearing|noise)\b/.test(v)) return 'M003';
  if (/\b(footwear|safety boots?|boots?|shoes?)\b/.test(v)) return 'M008';
  if (/\b(gloves?|hand protection)\b/.test(v)) return 'M009';
  if (/\b(face shield|face protection)\b/.test(v)) return 'M013';
  if (/\b(helmet|hard hat|head protection)\b/.test(v)) return 'M014';
  if (/\b(high-vis|hi-vis|high visibility|reflective)\b/.test(v)) return 'M015';
  if (/\b(lab coat|laboratory coat)\b/.test(v)) return 'M059';
  if (/\b(apron)\b/.test(v)) return 'M026';
  if (/\b(respirator|respiratory|vapou?rs?)\b/.test(v)) return 'M017';
  if (/\b(dust mask|mask)\b/.test(v)) return 'M016';
  if (/\b(goggles?|glasses?|eye protection|eyes?)\b/.test(v)) return 'M004';
  if (/\b(protective clothing|chemical suit|coveralls?|clothing)\b/.test(v)) return 'M010';
  if (icon && PPE_ICONS[icon]) return icon;
  return 'M004';
}

function languageSchema() {
  return {
    type: 'OBJECT',
    properties: {
      productName: { type: 'STRING' },
      description: { type: 'STRING' },
      hazards: { type: 'ARRAY', items: { type: 'STRING' } },
      ppe: { type: 'ARRAY', items: { type: 'OBJECT', properties: { icon: { type: 'STRING', enum: Object.keys(PPE_ICONS) }, text: { type: 'STRING' } }, required: ['icon', 'text'] } },
      firstAid: { type: 'OBJECT', properties: { eyes: { type: 'STRING' }, skin: { type: 'STRING' }, ingestion: { type: 'STRING' }, inhalation: { type: 'STRING' } }, required: ['eyes', 'skin', 'ingestion', 'inhalation'] },
      supplierName: { type: 'STRING' },
    },
    required: ['productName', 'description', 'hazards', 'ppe', 'firstAid', 'supplierName'],
  };
}

function extractionSchema() {
  return {
    type: 'OBJECT',
    properties: {
      unNumber: { type: 'STRING' },
      pictograms: { type: 'ARRAY', items: { type: 'STRING', enum: Object.keys(GHS_IMAGES) } },
      english: languageSchema(), russian: languageSchema(), arabic: languageSchema(), hebrew: languageSchema(),
    },
    required: ['unNumber', 'pictograms', 'english', 'russian', 'arabic', 'hebrew'],
  };
}

function buildPrompt(): string {
  return [
    'You are a hazardous materials safety expert creating a workplace safety placard from an SDS.',
    'Extract only SDS-supported facts. Translate the result into English, Russian, Arabic, and Hebrew.',
    'Use short direct worker-facing wording.',
    `Choose up to six GHS pictograms from ${Object.keys(GHS_IMAGES).join(', ')}.`,
    'For hazards provide 3 to 5 severe warnings. For PPE provide exactly 4 mandatory items.',
    `For every PPE item choose the best ISO 7010 mandatory sign code from: ${Object.keys(PPE_ICONS).join(', ')}.`,
    'If SDS says respirator/respiratory/vapour choose M017. If mask/dust mask choose M016. If apron choose M026. If lab coat choose M059. If gloves choose M009.',
    'For first aid include eyes, skin, ingestion, and inhalation. If supplier is missing, write N/A.',
    "For unNumber give digits only, no 'UN' prefix (e.g. 1268 not UN1268). If no UN number write N/A.",
    'Return valid JSON matching the schema.',
  ].join(' ');
}

export function validateExtractedData(raw: any): PlacardData {
  const next = structuredClone(SAMPLE_DATA);
  next.unNumber = normalizeUnNumber(raw.unNumber);
  next.pictograms = Array.isArray(raw.pictograms) ? raw.pictograms.filter((c: string) => GHS_IMAGES[c]).slice(0, 6) : [];
  const englishPpe = Array.isArray(raw.english?.ppe) ? raw.english.ppe : [];
  const canonPpeIcons = englishPpe.slice(0, 4).map((item: any, i: number) =>
    normalizePpeIcon(item.icon || SAMPLE_DATA.english.ppe[i]?.icon, item.text || item));
  LANGUAGES.forEach((lang: Language) => {
    const src = raw[lang] || {};
    next[lang] = {
      productName: String(src.productName || next[lang].productName),
      description: String(src.description || next[lang].description),
      hazards: normalizeLines(src.hazards, next[lang].hazards).slice(0, 5),
      ppe: Array.isArray(src.ppe) && src.ppe.length
        ? src.ppe.slice(0, 4).map((item: any, i: number) => ({
            icon: canonPpeIcons[i] || normalizePpeIcon(item.icon, item.text || item),
            text: String(item.text || item || next[lang].ppe[i]?.text || 'Protective equipment'),
          }))
        : next[lang].ppe,
      firstAid: {
        eyes: String(src.firstAid?.eyes || next[lang].firstAid.eyes),
        skin: String(src.firstAid?.skin || next[lang].firstAid.skin),
        ingestion: String(src.firstAid?.ingestion || next[lang].firstAid.ingestion),
        inhalation: String(src.firstAid?.inhalation || next[lang].firstAid.inhalation),
      },
      supplierName: String(src.supplierName || next[lang].supplierName),
    };
  });
  return next;
}

export async function extractSds(opts: {
  provider: Provider;
  model: string;
  apiKey: string;
  mimeType: string;
  base64: string;
  filename?: string;
}): Promise<PlacardData> {
  const raw = await runAi({
    provider: opts.provider,
    model: opts.model,
    apiKey: opts.apiKey,
    prompt: buildPrompt(),
    schema: extractionSchema(),
    file: { mimeType: opts.mimeType, base64: opts.base64, filename: opts.filename },
  });
  return validateExtractedData(raw);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.readAsDataURL(file);
  });
}
