import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface StoredUser extends User {
  password_hash: string;
}

function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
}

const USERS_KEY = "agentshield_users";
const SESSION_KEY = "agentshield_session";

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): { user: User; token: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user: User, token: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (full_name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadSession: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));
    const users = getStoredUsers();
    const hash = simpleHash(password);
    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password_hash === hash);
    if (!matched) {
      set({ isLoading: false });
      throw new Error("Invalid username credentials or password.");
    }
    const token = "mock-token-" + generateId();
    const { password_hash, ...u } = matched;
    saveSession(u, token);
    set({ user: u, isLoading: false });
  },

  registerUser: async (full_name, email, password) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));
    const users = getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      set({ isLoading: false });
      throw new Error("User already exists.");
    }
    const newUser: StoredUser = {
      id: "u-" + generateId(),
      email,
      full_name,
      role: email.toLowerCase().includes("admin") ? "admin" : "user",
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      password_hash: simpleHash(password),
    };
    users.push(newUser);
    saveStoredUsers(users);
    set({ isLoading: false });
  },

  logout: () => {
    clearSession();
    set({ user: null });
  },

  loadSession: () => {
    const session = getSession();
    if (session) {
      set({ user: session.user });
    }
  },

  setUser: (user) => {
    set({ user });
    const session = getSession();
    if (session) {
      saveSession(user, session.token);
    }
  },
}));