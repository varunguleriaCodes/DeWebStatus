"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // ← Correct hook for app directory

export function Appbar() {
  const router = useRouter(); // ← Use hook inside the component

  return (
    <div className="flex justify-between items-center p-4">
      <div>dWeb Status</div>
      <Button
        size="lg"
        className="gap-2 text-base"
        onClick={() => router.push("/login")}
      >
        Sign in
      </Button>
    </div>
  );
}
