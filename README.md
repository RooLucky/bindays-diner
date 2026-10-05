This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Security configuration before deployment

Reviews and chatbot messages require Google reCAPTCHA v2 checkbox verification. Login, loyalty registration/search, reservations, and receipt uploads use rate limits without CAPTCHA. The Concern page has email and phone links, with no submission endpoint. Authenticated management forms use session authentication and origin checks instead.

1. Create a **Challenge (v2) / checkbox** website key in [Google's console](https://www.google.com/recaptcha/admin/create). Enable domain verification and register your actual production domain. Use separate keys for local development.
2. If using Google Cloud, open the key's **Integration → Use Legacy Key** panel for its secret. This app uses `api.js` and server-side `siteverify`, not the Enterprise Assessments API. See [Google's key setup guide](https://docs.cloud.google.com/recaptcha/docs/create-key-website).
3. Set these environment variables locally in `.env.local` and separately in your deployment provider:

```dotenv
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-checkbox-site-key
RECAPTCHA_SECRET_KEY=your-private-legacy-secret
RECAPTCHA_ALLOWED_HOSTNAMES=your-domain.com,www.your-domain.com
CHATBOT_RATE_LIMIT_SALT=your-private-random-value-at-least-16-characters
```

Use exact comma-separated hostnames, without schemes, ports, paths, or wildcards. Include every hostname the site actually serves, including `www`. For local development, allow `localhost` in both Google and `RECAPTCHA_ALLOWED_HOSTNAMES`. Do not use Google's always-pass test keys in production. Never put the secret in a `NEXT_PUBLIC_` variable or commit `.env` files. The public site key must be present **before building**; rebuild after changing it.

Missing configuration, rejected/expired/reused tokens, unexpected hostnames, or Google verification outages block submissions. There is no development or production bypass. Each submission needs a fresh checkbox verification. Saved loyalty details are prefilled but no longer trigger automatic account searches.

After configuring the keys, manually verify reviews and chatbot messages, including expired CAPTCHA and retry after failure. Also verify login, loyalty, checkout, and receipt uploads without CAPTCHA. Confirm that a successful review remains a draft and that staff-only mutations reject anonymous requests. The automated tests mock Google's response; they do not replace a real key/domain test.

Loyalty cookies use `LOYALTY_ACCESS_SECRET` (at least 32 characters), falling back to the server-only database credential when unset. They do not depend on reCAPTCHA configuration. Changing the signing secret requires customers to look up their cards again.

### Additional protections and operational limits

- Durable, atomic request counters use the existing `chatbot_rate_limits` table. Public forms allow 10 requests per IP/path per 10 minutes; chatbot messages allow 20 plus their existing session limit; login also allows 5 attempts per email per 10 minutes. No new schema migration is required. Deploy behind a trusted proxy that replaces client IP headers; do not allow direct origin access with spoofed forwarding headers.
- Upload bodies are bounded, public images are limited to JPEG/PNG/WebP with matching signatures, and receipts also accept PDF. Signature checks are not malware scanning. Your hosting provider may enforce a smaller upload limit than the app.
- Health diagnostics require staff authentication; API errors do not expose provider/database error text. Security headers prevent framing, MIME sniffing, and referrer leakage.
- Loyalty refresh requires a signed, HttpOnly access cookie obtained after a successful join/search, or a staff session. Knowing a QR/member code alone no longer reveals a card through the public API. Name and birthday lookup is still not strong identity verification; use OTP/customer authentication if loyalty information requires stronger privacy guarantees.
- Reservation item prices and totals are checked against active database menu items. Uploading a receipt now leaves payment **pending**; staff must verify the transfer independently. There is currently no staff payment-approval screen or payment-provider webhook. Historical rows already marked paid were not changed. Receipt files still use the existing R2 storage configuration: provision private receipt storage before accepting sensitive financial documents if that bucket is publicly accessible.

### Validation and dependency findings (2026-10-05)

Run `pnpm test:security`, `pnpm test:loyalty`, and `pnpm build`. Review `pnpm audit --prod` before release. Next.js was updated to 16.3.6, Nodemailer to 10.0.14, and Sharp to 0.35.4; shadcn's CLI is a development dependency.

One runtime advisory remains: [http-cache-semantics GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp), through Ably → got → cacheable-request. The registry currently lists no patched version. Installed Ably does not enable got's shared HTTP cache, and got defaults `cache` to undefined, so the reported shared-cache scenario was not found in this integration. Keep tracking the upstream fix; this is not a clean dependency audit or a penetration-test certification.

## Getting Started

### Delivery orders

Direct orders require a food subtotal of at least PHP 500. Delivery is restricted to the declared city of Legazpi City and costs PHP 50 per order, so the minimum payable total is PHP 550. The server validates the city and sets the fee; client-supplied fees are ignored. Staff should verify the street/barangay address before dispatch. Existing orders retain their recorded totals (zero delivery fee for orders placed before this change).

The delivery columns are included in `drizzle/20261005014322_blue_clint_barton`. The configured database had an earlier migration-history conflict (`loyalty_members_name_birthday_idx` already exists), so the two additive columns were applied using `pnpm db:migrate:delivery`. For another database with the same history conflict, use that idempotent script before deploying this version. The older migration-history conflict still needs reconciliation before the full migration chain can run successfully.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
