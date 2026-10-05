import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { getDb } from '../lib/db';
(async () => {
 const result = await getDb().execute(sql`select
 (select count(*) from management_categories) as menu_categories,
 (select count(*) from management_items where is_active) as active_menu_items,
 (select count(*) from chatbot_knowledge_entries where is_active) as active_chatbot_entries,
 (select count(*) from customer_reviews where status = 'approved') as approved_reviews,
 (select count(*) from information_schema.columns where table_name = 'reservations' and column_name in ('delivery_city','delivery_fee')) as delivery_columns`);
 console.log(JSON.stringify(result.rows));
 for(const key of ['NEXT_PUBLIC_RECAPTCHA_SITE_KEY','RECAPTCHA_SECRET_KEY','RECAPTCHA_ALLOWED_HOSTNAMES','SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','SMTP_FROM','SMTP2_HOST','SMTP2_PORT','SMTP2_USER','SMTP2_PASS','SMTP2_FROM','OPENAI_API_KEY','ABLY_API_KEY']) console.log(key+': '+(process.env[key]?'configured':'missing'));
})().catch(() => { console.error('Read-only database checks failed.'); process.exitCode=1; });
