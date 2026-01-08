
import { TRANSLATIONS } from './constants';
import { Language } from './types';

export const t = (key: string, lang: Language): string => {
  return TRANSLATIONS[key]?.[lang] || key;
};
