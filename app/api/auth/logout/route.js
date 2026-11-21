import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export async function POST(req) {
  await clearSession();
  return NextResponse.redirect(`${new URL(req.url).origin}/login`, 303);
}
