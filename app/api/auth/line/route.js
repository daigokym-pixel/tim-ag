import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req) {
  const origin = new URL(req.url).origin;
  const state = crypto.randomUUID();
  const jar = await cookies();
  jar.set('ag_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 });
  const u = new URL('https://access.line.me/oauth2/v2.1/authorize');
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', (process.env.LINE_CHANNEL_ID || '').trim());
  u.searchParams.set('redirect_uri', `${origin}/api/auth/callback`);
  u.searchParams.set('state', state);
  u.searchParams.set('scope', 'profile openid');
  return NextResponse.redirect(u);
}
