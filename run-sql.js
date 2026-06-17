const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const run = async () => {
  const connectionString = "postgresql://postgres.qfdpmshqwqglyiuqiwoq:G%40urav76552007@aws-0-us-west-1.pooler.supabase.com:6543/postgres";
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");
    
    const schemaSql = fs.readFileSync(path.join(__dirname, 'supabase', 'schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'supabase', 'seed.sql'), 'utf8');
    
    console.log("Executing schema...");
    await client.query(schemaSql);
    console.log("Schema applied.");
    
    console.log("Executing seed...");
    await client.query(seedSql);
    console.log("Seed applied.");
    
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
};

run();
