import { redirect } from 'next/navigation';
import { currentMember } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function Pending() {
  const me = await currentMember();
  if (!me) redirect('/login');
  if (me.status === 'approved') redirect('/');
  const blocked = me.status === 'blocked';
  return (
    <main className="authwrap">
      <div className="authcard">
        <h1>{blocked ? 'ご利用いただけません' : '承認をお待ちください'}</h1>
        <p>{blocked ? 'このアカウントは現在ご利用いただけません。担当者にご連絡ください。' : `${me.name || 'あなた'} さんの登録を受け付けました。担当者が承認すると、研修サイトが使えるようになります。`}</p>
        <form action="/api/auth/logout" method="post"><button className="btn ghost">ログアウト</button></form>
      </div>
    </main>
  );
}
