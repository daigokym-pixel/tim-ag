import { currentMember } from '@/lib/session';
import { isApproved } from '@/lib/roles';
import code from '@/lib/appBundle';

export const dynamic = 'force-dynamic';

// 研修の中身はログインして承認された人だけに渡す
export async function GET() {
  const me = await currentMember();
  if (!isApproved(me)) return new Response('// unauthorized', { status: 401, headers: { 'Content-Type': 'application/javascript' } });
  return new Response(code, { headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'private, no-store' } });
}
