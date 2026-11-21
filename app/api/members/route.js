import { NextResponse } from 'next/server';
import { currentMember } from '@/lib/session';
import { isStaff } from '@/lib/roles';
import { db } from '@/lib/db';

// 担当者画面：メンバー全員と、それぞれの研修データ
export async function GET() {
  const me = await currentMember();
  if (!isStaff(me)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const sb = db();
  const { data: ms } = await sb.from('ag_members').select('id,name,picture,status,role,created_at,last_seen_at').neq('status', 'blocked').order('created_at');
  const { data: st } = await sb.from('ag_state').select('member_id,data');
  const map = Object.fromEntries((st || []).map((x) => [x.member_id, x.data]));
  return NextResponse.json({ members: (ms || []).map((m) => ({ ...m, data: map[m.id] || {} })) });
}
