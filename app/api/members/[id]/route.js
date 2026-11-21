import { NextResponse } from 'next/server';
import { currentMember } from '@/lib/session';
import { isOwner, isStaff } from '@/lib/roles';
import { db } from '@/lib/db';

// 担当者：メンバーの研修データ（関門・MTG日時・ランク・採点）を更新、承認
// オーナー：停止と権限の変更も
export async function PUT(req, { params }) {
  const me = await currentMember();
  if (!isStaff(me)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'bad json' }, { status: 400 });
  const sb = db();
  if (body.data && typeof body.data === 'object') {
    // 担当者が変えるのは関門・MTG日時・ランク・採点だけ。ほかはメンバー本人の最新の回答を残す
    const { data: cur } = await sb.from('ag_state').select('data').eq('member_id', id).maybeSingle();
    const merged = { ...(cur?.data || {}) };
    ['gate', 'gdate', 'rank', 'score'].forEach((k) => { if (k in body.data) merged[k] = body.data[k]; });
    const { error } = await sb.from('ag_state').upsert({ member_id: id, data: merged, updated_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: 'db' }, { status: 500 });
  }
  const patch = {};
  if (body.status === 'approved') patch.status = 'approved';
  if (isOwner(me) && ['approved', 'blocked', 'pending'].includes(body.status)) patch.status = body.status;
  if (isOwner(me) && ['member', 'staff', 'owner'].includes(body.role)) patch.role = body.role;
  if (Object.keys(patch).length) {
    const { error } = await sb.from('ag_members').update(patch).eq('id', id);
    if (error) return NextResponse.json({ error: 'db' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
