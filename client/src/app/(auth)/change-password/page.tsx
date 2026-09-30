"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import LoadingOverlay from "@/components/LoadingOverlay";

type ChangeInput = {
  code: string;
  password: string;
};

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

export default function ChangePasswordPage() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const requestPasswordChange = useAuthStore((state) => state.requestPasswordChange);
  const confirmPasswordChange = useAuthStore((state) => state.confirmPasswordChange);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangeInput>();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    }
  }, [status, router]);

  async function onRequestCode() {
    setError(null);
    setMessage(null);
    setSending(true);
    try {
      const response = await requestPasswordChange();
      setMessage(response);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
    } finally {
      setSending(false);
    }
  }

  async function onConfirm(values: ChangeInput) {
    setError(null);
    try {
      await confirmPasswordChange(values);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
    }
  }

  if (status !== "authenticated" || !user) {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 text-black">
      <div className="w-full max-w-110 relative">
        <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Change password</h1>
              <p className="text-sm text-neutral-400">
                A code will be sent to {user.email}. After it changes, sign in again.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onConfirm)}>
              {step === "confirm" ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Code</label>
                    <input
                      type="text"
                      className="h-12 w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 text-sm focus:outline-none focus:border-black/20 transition-all"
                      {...register("code", {
                        required: "the code field is required",
                        pattern: { value: /^\d{6}$/, message: "the code must be 6 digits" },
                      })}
                    />
                    {errors.code ? <p className="ml-1 text-xs text-red-500">{errors.code.message}</p> : null}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">New password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="h-12 w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 pr-12 text-sm focus:outline-none focus:border-black/20 transition-all"
                        {...register("password", {
                          required: "the password field is required",
                          minLength: { value: 8, message: "the password must contain at least 8 characters" },
                          maxLength: { value: 20, message: "the password must contain a maximum of 20 characters" },
                          pattern: {
                            value: passwordPattern,
                            message: "password must contain uppercase, lowercase, number and special character",
                          },
                        })}
                      />
                      <button
                        onClick={() => setShowPassword((prev) => !prev)}
                        type="button"
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-black"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                    {errors.password ? <p className="ml-1 text-xs text-red-500">{errors.password.message}</p> : null}
                  </div>
                </>
              ) : null}

              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              {message ? <p className="text-sm text-neutral-500">{message}</p> : null}

              {step === "request" ? (
                <button
                  type="button"
                  disabled={sending}
                  onClick={onRequestCode}
                  className="mt-4 h-12 w-full bg-black text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-lg shadow-black/5 disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send code"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 h-12 w-full bg-black text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-lg shadow-black/5 disabled:opacity-60"
                >
                  {isSubmitting ? "Updating..." : "Change password"}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
