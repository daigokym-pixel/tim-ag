import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from './db';

const COOKIE = 'ag_session';
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET は32文字以上で設定してください');
  return new TextEncoder().encode(s);
}

export async function createSession(memberId) {
  const token = await new SignJWT({ mid: memberId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: MAX_AGE });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

// ログイン中のメンバー（未ログインなら null）。毎回DBを見るので、承認や権限の変更がすぐ反映される。
export async function currentMember() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  let mid;
  try { ({ payload: { mid } } = await jwtVerify(token, secret())); } catch { return null; }
  if (!mid) return null;
  const { data } = await db().from('ag_members').select('*').eq('id', mid).maybeSingle();
  return data || null;
}
