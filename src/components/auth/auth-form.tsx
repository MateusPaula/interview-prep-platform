"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/browser-client";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

type AuthMode = "sign-in" | "sign-up";

interface AuthFormProps {
  mode: AuthMode;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!email.trim()) {
      errors.email = t("emailRequired");
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = t("emailInvalid");
    }
    if (!password) {
      errors.password = t("passwordRequired");
    } else if (mode === "sign-up" && password.length < MIN_PASSWORD_LENGTH) {
      errors.password = t("passwordTooShort");
    }
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setNotice(null);
    const errors = validate();
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      return;
    }
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const credentials = { email: email.trim(), password };
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) {
          setFormError(t("invalidCredentials"));
          return;
        }
        router.replace("/");
        router.refresh();
        return;
      }
      const { data, error } = await supabase.auth.signUp(credentials);
      if (error) {
        setFormError(t("signUpFailed"));
        return;
      }
      if (!data.session) {
        setNotice(t("confirmEmailNotice"));
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setFormError(t("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = mode === "sign-in" ? t("signInTitle") : t("signUpTitle");
  const subtitle = mode === "sign-in" ? t("signInSubtitle") : t("signUpSubtitle");
  const submitLabel = mode === "sign-in" ? t("signIn") : t("signUp");
  const submittingLabel = mode === "sign-in" ? t("signingIn") : t("signingUp");

  return (
    <div className="w-full max-w-sm animate-fade-up">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-1.5 text-sm text-ink-secondary">{subtitle}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="auth-email" className="text-sm font-medium text-ink">
            {t("email")}
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("emailPlaceholder")}
            aria-invalid={fieldErrors.email ? true : undefined}
            className={`rounded-lg border bg-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted transition-colors duration-150 focus:border-accent ${
              fieldErrors.email ? "border-danger/60" : "border-line-strong"
            }`}
          />
          {fieldErrors.email ? (
            <p className="text-xs text-hard">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="auth-password"
            className="text-sm font-medium text-ink"
          >
            {t("password")}
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("passwordPlaceholder")}
            aria-invalid={fieldErrors.password ? true : undefined}
            className={`rounded-lg border bg-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted transition-colors duration-150 focus:border-accent ${
              fieldErrors.password ? "border-danger/60" : "border-line-strong"
            }`}
          />
          {fieldErrors.password ? (
            <p className="text-xs text-hard">{fieldErrors.password}</p>
          ) : null}
        </div>

        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-hard/30 bg-hard/10 px-3 py-2 text-sm text-hard"
          >
            {formError}
          </p>
        ) : null}

        {notice ? (
          <p
            role="status"
            className="rounded-lg border border-easy/30 bg-easy/10 px-3 py-2 text-sm text-easy"
          >
            {notice}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        {mode === "sign-in" ? t("noAccount") : t("haveAccount")}{" "}
        <Link
          href={mode === "sign-in" ? "/sign-up" : "/login"}
          className="font-medium text-accent-ink hover:text-accent-strong"
        >
          {mode === "sign-in" ? t("signUp") : t("signIn")}
        </Link>
      </p>
    </div>
  );
}
