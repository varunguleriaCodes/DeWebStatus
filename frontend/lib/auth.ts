import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  userId: string | null;
  setAuth: (token: string, userId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  let token: string | null = null;
  let userId: string | null = null;

  if (typeof window !== 'undefined') {
    token = Cookies.get('token') || null;
    userId = Cookies.get('userId') || null;
  }

  return {
    token,
    userId,
    setAuth: (token: string, userId: string) => {
      const expires = 1 / 3;
      Cookies.set('token', token, { expires });
      Cookies.set('userId', userId, { expires });
      set({ token, userId });
    },
    clearAuth: () => {
      Cookies.remove('token');
      Cookies.remove('userId');
      set({ token: null, userId: null });
    },
  };
});

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