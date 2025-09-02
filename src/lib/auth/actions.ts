"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { guest } from "@/lib/db/schema/guest";
import { eq } from "drizzle-orm";

const GUEST_COOKIE = "guest_session";
const GUEST_TTL_DAYS = 7;

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().min(1).max(255).optional();

function guestExpiryDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + GUEST_TTL_DAYS);
  return d;
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    expires,
  };
}

export async function createGuestSession() {
  const store = await cookies();
  const existing = store.get(GUEST_COOKIE)?.value;

  if (existing) {
    const row = await db.select().from(guest).where(eq(guest.sessionToken, existing)).limit(1);
    if (row.length) return { sessionToken: existing };
  }

  const sessionToken = crypto.randomUUID();
  const expiresAt = guestExpiryDate();

  await db.insert(guest).values({
    sessionToken,
    expiresAt,
  });

  store.set(GUEST_COOKIE, sessionToken, cookieOptions(expiresAt));
  return { sessionToken };
}

export async function guestSession() {
  const store = await cookies();
  const token = store.get(GUEST_COOKIE)?.value;
  if (!token) return null;

  const rows = await db.select().from(guest).where(eq(guest.sessionToken, token)).limit(1);
  if (!rows.length) {
    store.delete(GUEST_COOKIE);
    return null;
  }
  return rows[0];
}

export async function signUp(input: { email: string; password: string; name?: string }) {
  const parsed = z.object({ email: emailSchema, password: passwordSchema, name: nameSchema }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" as const };
  }
  const res = await fetch("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
    credentials: "include",
  });
  if (!res.ok) {
    return { ok: false, error: "Sign up failed" as const };
  }
  return { ok: true as const };
}

export async function signIn(input: { email: string; password: string }) {
  const parsed = z.object({ email: emailSchema, password: passwordSchema }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" as const };
  }
  const res = await fetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
    credentials: "include",
  });
  if (!res.ok) {
    return { ok: false, error: "Sign in failed" as const };
  }
  return { ok: true as const };
}

export async function signOut() {
  const res = await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    return { ok: false, error: "Sign out failed" as const };
  }
  return { ok: true as const };
}

export async function mergeGuestCartWithUserCart() {
  const store = await cookies();
  const token = store.get(GUEST_COOKIE)?.value;
  if (!token) return { ok: true as const };

  await db.delete(guest).where(eq(guest.sessionToken, token));
  store.delete(GUEST_COOKIE);
  return { ok: true as const };
}
