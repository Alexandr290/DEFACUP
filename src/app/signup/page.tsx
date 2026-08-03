"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useI18n } from "@/lib/i18n/context";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured()) {
      setMessage(t("auth.noSupabaseSignup"));
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
      setMessage(t("auth.accountCreated"));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.signUpFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-5xl tracking-wide">
        {t("auth.signupTitle")}
      </h1>
      <p className="mt-2 text-mist">{t("auth.signupSub")}</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label>{t("auth.displayName")}</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Coach"
          />
        </div>
        <div>
          <Label>{t("auth.email")}</Label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label>{t("auth.password")}</Label>
          <Input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        {message && <p className="text-sm text-accent">{message}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.creating") : t("auth.signUp")}
        </Button>
      </form>
      <p className="mt-4 text-sm text-mist">
        {t("auth.alreadyHave")}{" "}
        <Link href="/login" className="text-accent hover:underline">
          {t("auth.signInLink")}
        </Link>
      </p>
    </div>
  );
}
