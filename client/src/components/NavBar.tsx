"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function NavBar() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  function handleLogout() {
    void logout();
    router.push("/login");
  }

  return (
    <div className="bg-white shadow-md flex justify-around items-center p-4">
      <Link href="/" className="cursor-pointer border p-2 rounded-md">
        Home
      </Link>
      {user ? (
        <>
          <span className="text-sm font-medium">{user.name}</span>
          <Link href="/change-password" className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer">
            Change Password
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            Log Out
          </button>
        </>
      ) : status === "anonymous" ? (
        <>
          <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Log In
          </Link>
          <Link href="/register" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Register
          </Link>
        </>
      ) : null}
    </div>
  );
}
