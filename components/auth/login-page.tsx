"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/lib/auth-actions";

export function LoginPage({ redirect }: { redirect?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, { error: undefined });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#103c36] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(74,190,157,0.32),transparent_45%),linear-gradient(145deg,#103c36_10%,#0b2926_80%)]" />
        <div className="absolute inset-0 opacity-75">
          <svg
            className="h-full w-full"
            viewBox="0 0 900 1100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-labelledby="station-art-title"
            preserveAspectRatio="xMidYMid slice"
          >
            <title id="station-art-title">Illustration of connected fuel station equipment</title>
            <path d="M0 780C180 690 322 825 468 746C619 664 729 686 900 595V1100H0V780Z" fill="#174B43" />
            <path d="M0 870C174 815 318 904 468 836C615 770 766 782 900 722V1100H0V870Z" fill="#1C5E51" />
            <path d="M0 990H900" stroke="#79C7AE" strokeOpacity=".36" strokeWidth="2" />
            <path d="M58 1015H842" stroke="#79C7AE" strokeOpacity=".2" strokeWidth="1" strokeDasharray="8 14" />
            <g opacity=".8" stroke="#8BD7BD" strokeWidth="3">
              <path d="M76 354V844M183 274V823M296 408V818M705 282V751M815 370V720" />
              <path d="M76 354H183V274H296V408H432M705 282H815V370H900" />
              <path d="M76 430H183M183 492H296M296 526H402M705 388H815M744 282V200H846" />
              <circle cx="76" cy="430" r="8" fill="#8BD7BD" />
              <circle cx="296" cy="526" r="8" fill="#8BD7BD" />
              <circle cx="815" cy="388" r="8" fill="#8BD7BD" />
            </g>
            <g>
              <rect x="371" y="500" width="188" height="300" rx="26" fill="#DDECE6" />
              <rect x="387" y="518" width="156" height="145" rx="16" fill="#153B36" />
              <rect x="405" y="538" width="120" height="90" rx="8" fill="#102B28" stroke="#5CC7A2" strokeWidth="2" />
              <path d="M423 599L447 572L465 587L502 552" stroke="#6FE0B2" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="422" cy="711" r="23" fill="#D18A36" />
              <circle cx="486" cy="711" r="23" fill="#3D9C7D" />
              <rect x="402" y="755" width="126" height="10" rx="5" fill="#B4C9C0" />
              <path d="M559 550H587C607 550 623 566 623 586V679C623 698 638 713 657 713C676 713 691 698 691 679V601" stroke="#E5F2EC" strokeWidth="12" strokeLinecap="round" />
              <path d="M670 601H712V665H670V601Z" fill="#D18A36" />
              <path d="M558 529H585V567H558V529Z" fill="#D9E8E1" />
            </g>
            <g fill="#C4E7D9" fillOpacity=".78">
              <circle cx="670" cy="150" r="3" />
              <circle cx="728" cy="208" r="4" />
              <circle cx="606" cy="242" r="2" />
              <circle cx="840" cy="110" r="3" />
              <circle cx="304" cy="190" r="3" />
            </g>
            <circle cx="742" cy="450" r="96" stroke="#8BD7BD" strokeOpacity=".14" strokeWidth="2" />
            <circle cx="742" cy="450" r="128" stroke="#8BD7BD" strokeOpacity=".08" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
            <span className="size-3 rounded-full bg-[#7de0b7] shadow-[0_0_18px_rgba(125,224,183,0.8)]" />
          </div>
          <div>
            <p className="font-semibold tracking-wide">STATION CONTROL</p>
            <p className="text-xs text-white/60">Connected operations platform</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl pb-3">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#8fe1bf]">
            Secure operations
          </p>
          <h2 className="text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">
            Clarity across every part of your station.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/70">
            Monitor tanks, dispensers, and nozzles from one dependable control
            room.
          </p>
          <div className="mt-10 flex items-center gap-2 text-xs text-white/55">
            <span className="size-2 rounded-full bg-[#7de0b7]" />
            Built for teams in the field
          </div>
        </div>
      </section>

      <section className="flex min-h-svh items-center justify-center bg-[#fbfdfc] px-6 py-12 sm:px-10 lg:px-12 xl:px-20">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#e8f6f1]">
              <span className="size-3 rounded-full bg-[#16806c]" />
            </div>
            <div>
              <p className="font-semibold tracking-wide text-[#17352f]">STATION CONTROL</p>
              <p className="text-xs text-slate-500">Connected operations platform</p>
            </div>
          </div>
          <form action={formAction} className="space-y-5">
            {redirect ? (
              <input type="hidden" name="redirect" value={redirect} />
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-medium text-slate-600">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                autoFocus
                autoComplete="username"
                placeholder="Enter your username"
                className="h-10 border-[#dce9e5] bg-white focus-visible:ring-2 focus-visible:ring-[#16806c]/25"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-slate-600">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-10 border-[#dce9e5] bg-white pr-10 focus-visible:ring-2 focus-visible:ring-[#16806c]/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {state.error ? (
              <p className="text-xs font-medium text-rose-600" role="alert">
                {state.error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={pending}
              className="h-10 w-full bg-[#16806c] text-white hover:bg-[#0f5e55] disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-xs text-slate-400">
            Contact your administrator for account access.
          </p>
        </div>
      </section>
    </main>
  );
}
