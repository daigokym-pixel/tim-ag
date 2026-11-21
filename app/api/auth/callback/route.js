import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { createSession } from '@/lib/session';

export async function GET(req) {
  const url = new URL(req.url);
  const fail = (why) => NextResponse.redirect(`${url.origin}/login?error=${why}`);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const jar = await cookies();
  const saved = jar.get('ag_state')?.value;
  jar.delete('ag_state');
  if (!code || !state || !saved || state !== saved) return fail('state');
  try {
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: `${url.origin}/api/auth/callback`, client_id: (process.env.LINE_CHANNEL_ID || '').trim(), client_secret: (process.env.LINE_CHANNEL_SECRET || '').trim() }),
    });
    if (!tokenRes.ok) { console.error('LINE token error', tokenRes.status, (await tokenRes.text()).slice(0, 200)); return fail('token'); }
    const { access_token } = await tokenRes.json();
    const profRes = await fetch('https://api.line.me/v2/profile', { headers: { Authorization: `Bearer ${access_token}` } });
    if (!profRes.ok) return fail('profile');
    const prof = await profRes.json();
    if (!prof.userId) return fail('profile');
    const sb = db();
    let { data: member } = await sb.from('ag_members').select('*').eq('line_user_id', prof.userId).maybeSingle();
    if (member) {
      await sb.from('ag_members').update({ name: prof.displayName || member.name, picture: prof.pictureUrl || null, last_seen_at: new Date().toISOString() }).eq('id', member.id);
    } else {
      // 最初にログインした人（＝だいごさん）は自動で承認済みのオーナーになる
      const { count } = await sb.from('ag_members').select('id', { count: 'exact', head: true });
      const first = (count || 0) === 0;
      const { data, error } = await sb.from('ag_members').insert({ line_user_id: prof.userId, name: prof.displayName || '', picture: prof.pictureUrl || null, status: first ? 'approved' : 'pending', role: first ? 'owner' : 'member' }).select('*').single();
      if (error) throw error;
      member = data;
    }
    await createSession(member.id);
    return NextResponse.redirect(`${url.origin}/`);
  } catch (e) {
    console.error(e);
    return fail('server');
  }
}
