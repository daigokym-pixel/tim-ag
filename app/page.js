import { redirect } from 'next/navigation';
import { currentMember } from '@/lib/session';
import { isApproved, isStaff } from '@/lib/roles';
import { db } from '@/lib/db';
import shellHtml from '@/lib/shellHtml';

export const dynamic = 'force-dynamic';

// JSONを<script>に安全に埋め込む
const safe = (v) => JSON.stringify(v).split('<').join('\\u003c').split(String.fromCharCode(0x2028)).join('\\u2028').split(String.fromCharCode(0x2029)).join('\\u2029');

export default async function Home() {
  const me = await currentMember();
  if (!me) redirect('/login');
  if (!isApproved(me)) redirect('/pending');
  const { data: st } = await db().from('ag_state').select('data').eq('member_id', me.id).maybeSingle();
  await db().from('ag_members').update({ last_seen_at: new Date().toISOString() }).eq('id', me.id);
  const ME = { id: me.id, name: me.name, picture: me.picture, role: me.role, staff: isStaff(me) };
  const boot = `window.__ME=${safe(ME)};window.__STATE=${safe(st?.data || {})};`;
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: shellHtml }} />
      <script dangerouslySetInnerHTML={{ __html: boot }} />
      <script src="/app-bundle" defer />
    </>
  );
}
