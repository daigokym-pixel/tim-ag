# Tim代理店研修（tim-ag）

Tim代理店メンバーの研修サイトです。LINEでログインし、研修の進み具合は Supabase（tim-sales のプロジェクト。`ag_` で始まるテーブル）に保存します。

## Vercel に入れる環境変数

| 名前 | 中身 |
| --- | --- |
| `SUPABASE_URL` | tim-sales の Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | tim-sales の service_role キー（ブラウザには出ません） |
| `LINE_CHANNEL_ID` | LINEログインのチャネルID |
| `LINE_CHANNEL_SECRET` | LINEログインのチャネルシークレット |
| `SESSION_SECRET` | 32文字以上のランダムな文字列 |

## LINE Developers の設定

LINEログインのチャネルの「コールバックURL」に、次を入れます。

```
https://（Vercelのドメイン）/api/auth/callback
```

## はじめて使うとき

1. Supabase の SQL Editor で `supabase/schema.sql` を実行（済みならスキップ）
2. 最初にLINEでログインした人が、自動で承認済みのオーナーになります
3. 2人目以降は「承認待ち」になり、担当者画面で承認します
4. 担当者にしたい人は、Supabase の `ag_members` の `role` を `staff` にします

## 画面の中身の作り方

画面（研修マップ・トレーニングなど）は、プロトタイプから `build_prod.py` で `lib/appBundle.js` と `public/app.css` に書き出しています。
