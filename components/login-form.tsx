"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function LoginForm() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [notice, setNotice] = useState("");
  const [showCredentialErrors, setShowCredentialErrors] = useState(false);
  const isMobileValid = /^\d{10}$/.test(mobile);
  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowCredentialErrors(true);
    if (!isMobileValid || !isPasswordValid) return;
    setPassword("");
    setNotice("");
    setStep("otp");
  }

  function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Authentication is not connected yet. The OTP was not verified and no session was created.");
  }

  function goBack() {
    setStep("credentials");
    setOtp("");
    setNotice("");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex size-11 items-center justify-center rounded-xl bg-[#e8f6f1] text-[#16806c]">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </div>
      {step === "credentials" ? (
        <form onSubmit={requestOtp} noValidate>
          <FieldGroup className="gap-5">
            <div className="mb-1 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#16806c]">
                Secure station access
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">
                Welcome back
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Sign in with your registered 10-digit mobile number and password.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              Preview only: credentials are not submitted or verified until the authentication service is connected.
            </div>

            <Field>
              <FieldLabel htmlFor="mobile">Mobile number</FieldLabel>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={mobile}
                onChange={(event) =>
                  setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
                }
                aria-invalid={showCredentialErrors && !isMobileValid}
                aria-describedby={
                  showCredentialErrors && !isMobileValid
                    ? "mobile-hint mobile-error"
                    : "mobile-hint"
                }
                required
              />
              <FieldDescription id="mobile-hint">
                Enter exactly 10 digits, without a country code.
              </FieldDescription>
              {showCredentialErrors && !isMobileValid && (
                <p id="mobile-error" className="text-xs text-destructive">
                  Enter a valid 10-digit mobile number.
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={showCredentialErrors && !isPasswordValid}
                aria-describedby={
                  showCredentialErrors && !isPasswordValid
                    ? "password-hint password-error"
                    : "password-hint"
                }
                required
              />
              <FieldDescription id="password-hint">
                Use 8 or more characters with uppercase, lowercase, a number, and a symbol.
              </FieldDescription>
              {showCredentialErrors && !isPasswordValid && (
                <p id="password-error" className="text-xs text-destructive">
                  Password must meet all five requirements above.
                </p>
              )}
            </Field>

            <Field>
              <Button
                type="submit"
                className="h-11 w-full bg-[#176b5d] text-sm text-white hover:bg-[#12594e]"
              >
                Continue <ArrowRight aria-hidden="true" />
              </Button>
            </Field>
            <FieldDescription className="text-center">
              Two-step verification helps keep your station account secure.
            </FieldDescription>
          </FieldGroup>
        </form>
      ) : (
        <form onSubmit={verifyOtp}>
          <FieldGroup className="gap-5">
            <button
              type="button"
              onClick={goBack}
              className="mb-1 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to sign in
            </button>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#16806c]">
                Step 2 of 2
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">
                Verify your number
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Enter the 6-digit code for <span className="font-medium text-foreground">{mobile}</span>.
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              Preview only: SMS delivery and verification are not connected yet. No code was sent.
            </div>

            <Field>
              <FieldLabel htmlFor="otp">6-digit verification code</FieldLabel>
              <Input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="h-12 text-center font-mono text-lg tracking-[0.45em]"
                required
              />
            </Field>

            {notice && (
              <p role="alert" className="text-sm text-destructive">
                {notice}
              </p>
            )}

            <Field>
              <Button
                type="submit"
                disabled={otp.length !== 6}
                className="h-11 w-full bg-[#176b5d] text-sm text-white hover:bg-[#12594e]"
              >
                Verify and sign in <CheckCircle2 aria-hidden="true" />
              </Button>
            </Field>
            <FieldDescription className="text-center">
              Need a new code? <button type="button" className="font-medium text-[#176b5d] underline-offset-4 hover:underline" onClick={() => setNotice("OTP delivery is not connected yet. No code was sent.")}>Resend code</button>
            </FieldDescription>
          </FieldGroup>
        </form>
      )}
    </div>
  );
}
