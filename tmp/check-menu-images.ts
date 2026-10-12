import 'dotenv/config';
import { getDb } from '../lib/db';
import { managementItems } from '../lib/db/schema';
import { desc, isNotNull } from 'drizzle-orm';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client } from '../lib/r2';
import { getServerEnv } from '../lib/env';
async function main(){
const rows=await getDb().select({url:managementItems.imageUrl,key:managementItems.imageKey}).from(managementItems).where(isNotNull(managementItems.imageKey)).orderBy(desc(managementItems.createdAt)).limit(3);
for(const row of rows){const u=new URL(row.url);console.log('Image host:',u.hostname);try{const r=await fetch(u,{method:'HEAD',signal:AbortSignal.timeout(10000)});console.log('Public response:',r.status,r.headers.get('content-type'))}catch(e){console.log('Public request failed:',(e as {cause?:{code?:string}}).cause?.code)}
try{const o=await getR2Client().send(new HeadObjectCommand({Bucket:getServerEnv().R2_BUCKET_NAME,Key:row.key!}));console.log('Stored object exists:',o.ContentType,o.ContentLength)}catch(e){console.log('Storage check:',(e as {name?:string}).name)}}
}
main().catch(()=>{console.log('Image check failed');process.exitCode=1});
