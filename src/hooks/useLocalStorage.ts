import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      // Silently handle errors
    }
  };

  return [storedValue, setValue];
}

export function getStoredRoom(): { roomId: string; role: 'him' | 'her' } | null {
  if (typeof window === 'undefined') return null;
  try {
    const roomId = window.localStorage.getItem('lastRoomId');
    const role = window.localStorage.getItem('lastRole') as 'him' | 'her' | null;
    if (roomId && role) {
      return { roomId, role };
    }
  } catch (error) {
    // Silently handle errors
  }
  return null;
}

export function setStoredRoom(roomId: string, role: 'him' | 'her') {
  try {
    window.localStorage.setItem('lastRoomId', roomId);
    window.localStorage.setItem('lastRole', role);
  } catch (error) {
    // Silently handle errors
  }
}

export function clearStoredRoom() {
  try {
    window.localStorage.removeItem('lastRoomId');
    window.localStorage.removeItem('lastRole');
  } catch (error) {
    // Silently handle errors
  }
}