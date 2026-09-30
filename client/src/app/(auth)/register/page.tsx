"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

type RegisterInput = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

export default function RegisterPage() {
  const signUp = useAuthStore((state) => state.signUp);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>();

  async function onSubmit(values: RegisterInput) {
    setError(null);
    try {
      await signUp(values);
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
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
              <h1 className="text-3xl font-bold tracking-tight">Sign up</h1>
              <p className="text-sm text-neutral-400">
                Already have an account?
                <Link
                  href="/login"
                  className="ml-1.5 font-semibold text-black underline underline-offset-4 hover:text-[#C19A6B] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
              className="flex h-12 w-full items-center justify-center gap-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-all active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.834-.075-1.636-.213-2.408H12v4.553h6.588c-.284 1.53-.1.354-.7 3.3l4.136 3.207C22.68 18.23 23.745 15.532 23.745 12.27Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.957-1.075 7.942-2.915l-4.136-3.207c-1.13.757-2.576 1.206-3.806 1.206-3.05 0-5.63-2.06-6.556-4.83l-4.27 3.303C3.21 21.03 7.21 24 12 24Z" />
                <path fill="#FBBC05" d="M5.444 14.254a6.65 6.65 0 0 1-.345-2.254 6.65 6.65 0 0 1 .345-2.254l-4.27-3.303C.61 7.64 0 9.76 0 12s.61 4.36 1.174 6.3l4.27-3.303Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.1 15.24 0 12 0 7.21 0 3.21 2.97 1.174 5.697l4.27 3.303c.926-2.77 3.506-4.83 6.556-4.83Z" />
              </svg>
              Sign up with Google
            </a>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-100" />
              </div>
              <span className="relative bg-white px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">
                or email
              </span>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Name</label>
                <input
                  type="text"
                  placeholder="John"
                  className="h-12 w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 text-sm focus:outline-none focus:border-black/20 transition-all"
                  {...register("name", {
                    required: "the name field is required",
                    minLength: { value: 2, message: "the name field must contain at least 2 characters" },
                    maxLength: { value: 12, message: "the name must contain a maximum of 12 characters" },
                  })}
                />
                {errors.name ? <p className="ml-1 text-xs text-red-500">{errors.name.message}</p> : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Surname</label>
                <input
                  type="text"
                  placeholder="Smith"
                  className="h-12 w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 text-sm focus:outline-none focus:border-black/20 transition-all"
                  {...register("surname", {
                    required: "the surname field is required",
                    minLength: { value: 5, message: "the surname field must contain at least 5 characters" },
                    maxLength: { value: 15, message: "the surname must contain a maximum of 15 characters" },
                  })}
                />
                {errors.surname ? <p className="ml-1 text-xs text-red-500">{errors.surname.message}</p> : null}
              </div>

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

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Password</label>
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

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 h-12 w-full bg-black text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-lg shadow-black/5 disabled:opacity-60"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
