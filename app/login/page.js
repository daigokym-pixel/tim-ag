import { redirect } from 'next/navigation';
import { currentMember } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function Login({ searchParams }) {
  const me = await currentMember().catch(() => null);
  if (me) redirect('/');
  const { error, detail } = await searchParams;
  return (
    <main className="authwrap">
      <div className="authcard">
        <div className="brand">Tim <span>代理店研修</span><small>START YOUR BUSINESS LIFE</small></div>
        <p className="mut">Tim代理店メンバーの研修サイトです。</p>
        <a className="btn line" href="/api/auth/line">LINEでログイン</a>
        {error && <p className="err">ログインできませんでした。もう一度お試しください。</p>}
        {detail && <p className="note" style={{ wordBreak: 'break-all' }}>原因：{detail}</p>}
        <p className="note">はじめての方は、ログイン後に担当者の承認をお待ちください。承認されると研修が始められます。</p>
      </div>
    </main>
  );
}
