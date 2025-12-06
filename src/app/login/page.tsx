"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Fake Login
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/");
  }, 1000);};

  return (
    // Refactored: bg-background
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Refactored: bg-card, border-default */}
      <Card className="w-full max-w-md p-8 space-y-8 bg-card border-default">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Checkpoint</h1>
          <p className="text-sm text-gray-400">
            Git-Integrated Asset Management for Creatives
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-11 bg-[#238636] hover:bg-[#2ea043] text-white border-none font-semibold"
          >
            {loading ? (
              "Connecting..."
            ) : (
              <>
                <GithubIcon className="mr-2 h-5 w-5" /> Sign in with GitHub
              </>
            )}
          </Button>
          
          <p className="text-center text-xs text-gray-500">
            By signing in, you will be redirected to the repository browser.
          </p>
        </div>
      </Card>
    </div>
  );
}