import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const pid = '97dacb6f-4145-402a-941b-9fd4c4ff73ff';
const path = `${pid}/ledger_balance_${Date.now()}.pdf`;
const buf = fs.readFileSync('/tmp/docs/472_rajah_unknown.pdf');
const { error } = await s.storage.from('project-documents').upload(path, buf, { contentType: 'application/pdf' });
if (error) { console.error(error); process.exit(1); }
console.log(path);
