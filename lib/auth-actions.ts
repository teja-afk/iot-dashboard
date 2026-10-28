"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { verifyAuthUser } from "@/lib/data";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import type { AuthUser } from "@/types";

const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

function makeSessionToken(user: AuthUser): string {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
      exp: Date.now() + SESSION_MAX_AGE * 1000,
    }),
  ).toString("base64url");
  const signature = randomBytes(32).toString("base64url");
  return `${payload}.${signature}`;
}

function parseSessionToken(token: string): AuthUser | null {
  try {
    const [payload] = token.split(".");
    if (!payload) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data?.id || !data?.username) return null;
    if (data.exp && Date.now() > data.exp) return null;
    return {
      id: String(data.id),
      username: String(data.username),
      role: (data.role as AuthUser["role"]) ?? "operator",
      active: true,
    };
  } catch {
    return null;
  }
}

export async function authenticateUser(
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string; user?: AuthUser }> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const user = await verifyAuthUser(username, password);
  if (!user) {
    return { error: "Invalid username or password." };
  }

  const token = makeSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  const redirectTarget = String(formData.get("redirect") ?? "/");
  redirect(redirectTarget);
}

export async function getCurrentSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return parseSessionToken(token);
}

export async function signOutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentSession();
  if (!user) redirect("/login");
  return user;
}

export async function loginAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  return authenticateUser(_prev, formData);
}

export async function logoutAction(): Promise<void> {
  await signOutUser();
  redirect("/login");
}