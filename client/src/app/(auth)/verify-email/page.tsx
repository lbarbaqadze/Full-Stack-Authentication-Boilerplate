"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

type VerifyInput = {
  email: string;
  code: string;
};

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyInput>({
    defaultValues: { email: searchParams.get("email") ?? "" },
  });

  async function onSubmit(values: VerifyInput) {
    setError(null);
    try {
      await verifyEmail(values);
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
              <h1 className="text-3xl font-bold tracking-tight">Verify email</h1>
              <p className="text-sm text-neutral-400">
                Enter the 6-digit code from your inbox.
                <Link
                  href="/login"
                  className="ml-1.5 font-semibold text-black underline underline-offset-4 hover:text-[#C19A6B] transition-colors"
                >
                  Back to login
                </Link>
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Address</label>
                <input
                  type="email"
                  className="h-12 w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 text-sm focus:outline-none focus:border-black/20 transition-all"
                  {...register("email", { required: "the email field is required" })}
                />
                {errors.email ? <p className="ml-1 text-xs text-red-500">{errors.email.message}</p> : null}
              </div>

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

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 h-12 w-full bg-black text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-lg shadow-black/5 disabled:opacity-60"
              >
                {isSubmitting ? "Verifying..." : "Verify"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
