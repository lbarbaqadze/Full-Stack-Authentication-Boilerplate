import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, getErrorMessage, setSessionExpiredHandler } from "@/lib/api";

export type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
};

type Status = "idle" | "loading" | "authenticated" | "anonymous";

type SignUpInput = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

type AuthState = {
  user: User | null;
  status: Status;
  signUp: (input: SignUpInput) => Promise<string>;
  verifyEmail: (input: { email: string; code: string }) => Promise<string>;
  signIn: (input: { email: string; password: string }) => Promise<string>;
  checkSession: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  resetPassword: (input: { email: string; code: string; password: string }) => Promise<string>;
  requestPasswordChange: () => Promise<string>;
  confirmPasswordChange: (input: { code: string; password: string }) => Promise<string>;
  logout: () => Promise<void>;
};

function toUser(data: { id?: number; userId?: number; name: string; surname: string; email: string }): User {
  return {
    id: Number(data.id ?? data.userId),
    name: data.name,
    surname: data.surname,
    email: data.email,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: "idle",

      signUp: async (input) => {
        try {
          const { data } = await api.post("/api/auth/sign-up", input);
          return data.message as string;
        } catch (error) {
          throw new Error(getErrorMessage(error));
        }
      },

      verifyEmail: async (input) => {
        try {
          const { data } = await api.post("/api/auth/verify-email", input);
          return data.message as string;
        } catch (error) {
          throw new Error(getErrorMessage(error));
        }
      },

      signIn: async (input) => {
        set({ status: "loading" });
        try {
          const { data } = await api.post("/api/auth/sign-in", input);
          set({ user: toUser(data.data), status: "authenticated" });
          return data.message as string;
        } catch (error) {
          set({ user: null, status: "anonymous" });
          throw new Error(getErrorMessage(error));
        }
      },

      checkSession: async () => {
        try {
          const { data } = await api.get("/api/auth/secret-data");
          set({ user: toUser(data.data.user), status: "authenticated" });
        } catch {
          set({ user: null, status: "anonymous" });
        }
      },

      requestPasswordReset: async (email) => {
        try {
          const { data } = await api.post("/api/auth/forgot-password", { email });
          return data.message as string;
        } catch (error) {
          throw new Error(getErrorMessage(error));
        }
      },

      resetPassword: async (input) => {
        try {
          const { data } = await api.post("/api/auth/forgot-password", input);
          set({ user: null, status: "anonymous" });
          return data.message as string;
        } catch (error) {
          throw new Error(getErrorMessage(error));
        }
      },

      requestPasswordChange: async () => {
        try {
          const { data } = await api.post("/api/auth/change-password", {});
          return data.message as string;
        } catch (error) {
          throw new Error(getErrorMessage(error));
        }
      },

      confirmPasswordChange: async (input) => {
        try {
          const { data } = await api.post("/api/auth/change-password", input);
          set({ user: null, status: "anonymous" });
          return data.message as string;
        } catch (error) {
          throw new Error(getErrorMessage(error));
        }
      },

      logout: async () => {
        set({ user: null, status: "anonymous" });
        try {
          await api.post("/api/auth/logout");
        } catch {
          return;
        }
      },
    }),
    {
      name: "auth",
      partialize: (state) => ({ user: state.user }),
      merge: (persistedState, currentState) => {
        const saved = persistedState as { user?: User | null } | undefined;
        return {
          ...currentState,
          ...saved,
          status: saved?.user ? "authenticated" : "anonymous",
        };
      },
    }
  )
);

setSessionExpiredHandler(() => {
  useAuthStore.setState({ user: null, status: "anonymous" });
});