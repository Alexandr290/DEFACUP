"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setMessage(
        "Supabase is not configured. You can use the dashboard in local mode without signing in — tournaments save to this browser."
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();
    try {
      if (mode === "magic") {
        const { error: err } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (err) throw err;
        setMessage("Check your email for the magic link.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-5xl tracking-wide">Sign in</h1>
      <p className="mt-2 text-mist">
        Sync tournaments with Supabase, or continue in local mode.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@club.com"
          />
        </div>
        {mode === "password" && (
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        {message && <p className="text-sm text-accent">{message}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Please wait…"
            : mode === "magic"
              ? "Send magic link"
              : "Sign in"}
        </Button>
      </form>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <button
          type="button"
          className="text-mist hover:text-accent"
          onClick={() => setMode(mode === "password" ? "magic" : "password")}
        >
          {mode === "password" ? "Use magic link" : "Use password"}
        </button>
        <Link href="/signup" className="text-mist hover:text-accent">
          Create account
        </Link>
        <Link href="/dashboard" className="text-mist hover:text-accent">
          Continue locally →
        </Link>
      </div>
    </div>
  );
}
