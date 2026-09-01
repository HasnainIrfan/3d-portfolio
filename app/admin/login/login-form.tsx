"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { type FC } from "react";
import { signIn, type LoginState } from "./actions";

const SubmitButton: FC = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span>{pending ? "Signing in…" : "Sign in"}</span>
    </button>
  );
};

export const LoginForm: FC = () => {
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={searchParams.get("next") ?? ""} />

      <div>
        <label htmlFor="admin-email" className="field-label">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field-input field-input-focus"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="field-label">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field-input field-input-focus"
          placeholder="••••••••••••"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
};
