"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthSession() {
  useEffect(() => {
    const checkSession = () => {
      void useAuthStore.getState().checkSession();
    };

    if (useAuthStore.persist.hasHydrated()) {
      checkSession();
      return;
    }

    return useAuthStore.persist.onFinishHydration(checkSession);
  }, []);

  return null;
}
