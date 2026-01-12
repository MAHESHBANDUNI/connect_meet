import 'dotenv/config';
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect(async (err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
  
  try {
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%drizzle%'");
    console.log('Drizzle tables:', res.rows.map(r => r.table_name));
  } catch (e) {
    console.log('Error querying tables:', e.message);
  }
  
  release();
});