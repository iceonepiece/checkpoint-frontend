"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FileBrowser from "@/components/FileBrowser";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in.
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  return (
    <section className="h-full flex flex-col">
      <FileBrowser />
    </section>
  );
}