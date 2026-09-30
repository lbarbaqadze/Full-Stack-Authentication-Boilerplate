"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

type ResetInput = {
  email: string;
  code: string;
  password: string;
};

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

export default function ForgotPasswordPage() {
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ResetInput>();

  async function onRequestCode() {
    setError(null);
    setMessage(null);
    const email = getValues("email");
    if (!email) {
      setError("the email field is required");
      return;
    }
    setSending(true);
    try {
      const response = await requestPasswordReset(email);
      setMessage(response);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
    } finally {
      setSending(false);
    }
  }

  async function onReset(values: ResetInput) {
    setError(null);
    try {
      await resetPassword(values);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 text-black">
      <div className="w-full max-w-110 relative">
        <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
              <p className="text-sm text-neutral-400">
                {step === "email" ? "We will email you a 6-digit code." : "Enter the code and a new password."}
                <Link
                  href="/login"
                  className="ml-1.5 font-semibold text-black underline underline-offset-4 hover:text-[#C19A6B] transition-colors"
                >
                  Back to login
                </Link>
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onReset)}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="hello@example.com"
                  className="h-12 w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 text-sm focus:outline-none focus:border-black/20 transition-all"
                  {...register("email", { required: "the email field is required" })}
                />
                {errors.email ? <p className="ml-1 text-xs text-red-500">{errors.email.message}</p> : null}
              </div>

              {step === "code" ? (
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

              {step === "email" ? (
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
                  {isSubmitting ? "Updating..." : "Update password"}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
