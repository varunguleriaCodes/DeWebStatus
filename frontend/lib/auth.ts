import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userId: string | null;
  setAuth: (token: string, userId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  userId: typeof window !== 'undefined' ? localStorage.getItem('userId') : null,
  setAuth: (token: string, userId: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    set({ token, userId });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    set({ token: null, userId: null });
  },
}));

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  if (!token) return {};
  
  return {
    Authorization: `Bearer ${token}`,
  };
}; 