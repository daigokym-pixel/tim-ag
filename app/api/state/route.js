import { NextResponse } from 'next/server';
import { currentMember } from '@/lib/session';
import { isApproved, isStaff } from '@/lib/roles';
import { db } from '@/lib/db';

// 担当者だけが変えられる項目（メンバーが自分で関門を開けられないようにする）
const STAFF_ONLY = ['gate', 'rank', 'score', 'admin'];

export async function GET() {
  const me = await currentMember();
  if (!isApproved(me)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data } = await db().from('ag_state').select('data').eq('member_id', me.id).maybeSingle();
  return NextResponse.json(data?.data || {});
}

export async function PUT(req) {
  const me = await currentMember();
  if (!isApproved(me)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const text = await req.text();
  if (text.length > 900000) return NextResponse.json({ error: 'too large' }, { status: 413 });
  let next; try { next = JSON.parse(text); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  if (!next || typeof next !== 'object' || Array.isArray(next)) return NextResponse.json({ error: 'bad json' }, { status: 400 });
  const sb = db();
  if (!isStaff(me)) {
    const { data: cur } = await sb.from('ag_state').select('data').eq('member_id', me.id).maybeSingle();
    const old = cur?.data || {};
    STAFF_ONLY.forEach((k) => { if (k in old) next[k] = old[k]; else delete next[k]; });
  }
  const { error } = await sb.from('ag_state').upsert({ member_id: me.id, data: next, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: 'db' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
