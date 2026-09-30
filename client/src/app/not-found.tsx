import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center text-neutral-950">
      <p className="text-7xl font-semibold tracking-tight sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-medium tracking-tight sm:text-3xl">
        This page does not exist
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-neutral-600">
        The address may be mistyped, or the page may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white"
      >
        Back to home
      </Link>
    </main>
  );
}