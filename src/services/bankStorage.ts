import { QuestionBank, createEmptyCustomBank } from '../data/questionBanks';

const STORAGE_KEYS = {
  CUSTOM_BANKS: 'customQuestionBanks',
  SELECTED_BANK_ID: 'selectedQuestionBankId',
};

export function getCustomBanks(): QuestionBank[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_BANKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomBanks(banks: QuestionBank[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CUSTOM_BANKS, JSON.stringify(banks));
}

export function addCustomBank(name: string): QuestionBank {
  const banks = getCustomBanks();
  const newBank = createEmptyCustomBank(name);
  banks.push(newBank);
  saveCustomBanks(banks);
  return newBank;
}

export function updateCustomBank(bank: QuestionBank): void {
  const banks = getCustomBanks();
  const index = banks.findIndex(b => b.id === bank.id);
  if (index !== -1) {
    banks[index] = bank;
    saveCustomBanks(banks);
  }
}

export function deleteCustomBank(id: string): void {
  const banks = getCustomBanks().filter(b => b.id !== id);
  saveCustomBanks(banks);
}

export function getSelectedBankId(): string {
  if (typeof window === 'undefined') return 'normal';
  return localStorage.getItem(STORAGE_KEYS.SELECTED_BANK_ID) || 'normal';
}

export function setSelectedBankId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SELECTED_BANK_ID, id);
}

export function exportCustomBank(bank: QuestionBank): string {
  return JSON.stringify(bank, null, 2);
}

export function importCustomBank(jsonString: string): QuestionBank | null {
  try {
    const bank = JSON.parse(jsonString) as QuestionBank;
    if (bank.name && bank.levels) {
      bank.id = `custom_${Date.now()}`;
      bank.isCustom = true;
      return bank;
    }
    return null;
  } catch {
    return null;
  }
}
