import { useMemo } from "react";

type User = {
  email: string;
  name?: string | null;
};

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("APP_USER");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null) {
  try {
    if (user) localStorage.setItem("APP_USER", JSON.stringify(user));
    else localStorage.removeItem("APP_USER");
  } catch {
    // ignore
  }
}

export function useAuth() {
  const stored = useMemo<User | null>(getStoredUser, []);
  const isAuthenticated = !!stored;

  async function signIn(provider: string, formData?: FormData) {
    if (provider === "anonymous") {
      setStoredUser({ email: "guest@local", name: "Guest" });
      return;
    }
    if (provider === "email-otp") {
      const email = (formData?.get("email") as string) || "";
      if (!email) throw new Error("Email is required");
      setStoredUser({ email, name: null });
      return;
    }
    throw new Error("Unsupported sign-in provider");
  }

  async function signOut() {
    setStoredUser(null);
  }

  return {
    isLoading: false,
    isAuthenticated,
    user: stored,
    signIn,
    signOut,
  };
}