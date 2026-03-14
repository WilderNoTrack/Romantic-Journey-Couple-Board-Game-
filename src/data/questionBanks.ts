import { QUESTION_BANKS } from './questions';
import { SM_QUESTION_BANKS } from './questions';
import { LONGDISTANCE_QUESTION_BANKS } from './questions';

export interface QuestionLevel {
  truth: string[];
  dare: string[];
  punishment: string[];
}

export interface QuestionBank {
  id: string;
  name: string;
  isCustom: boolean;
  levels: Record<number, QuestionLevel>;
}

export const DEFAULT_QUESTION_BANKS: Record<string, QuestionBank> = {
  normal: {
    id: 'normal',
    name: '普通模式',
    isCustom: false,
    levels: {
      1: QUESTION_BANKS[1],
      2: QUESTION_BANKS[2],
      3: QUESTION_BANKS[3],
    },
  },
  sm: {
    id: 'sm',
    name: 'SM模式',
    isCustom: false,
    levels: {
      1: SM_QUESTION_BANKS[1],
      2: SM_QUESTION_BANKS[2],
      3: SM_QUESTION_BANKS[3],
    },
  },
  longdistance: {
    id: 'longdistance',
    name: '异地恋',
    isCustom: false,
    levels: {
      1: LONGDISTANCE_QUESTION_BANKS[1],
      2: LONGDISTANCE_QUESTION_BANKS[2],
      3: LONGDISTANCE_QUESTION_BANKS[3],
    },
  },
};

export function getDefaultBank(id: string): QuestionBank | undefined {
  return DEFAULT_QUESTION_BANKS[id];
}

export function createEmptyCustomBank(name: string): QuestionBank {
  return {
    id: `custom_${Date.now()}`,
    name,
    isCustom: true,
    levels: {
      1: { truth: [], dare: [], punishment: [] },
      2: { truth: [], dare: [], punishment: [] },
      3: { truth: [], dare: [], punishment: [] },
    },
  };
}
