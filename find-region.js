const { Client } = require('pg');

const regions = [
  'us-east-1', 'us-west-1', 'eu-central-1', 
  'ap-southeast-1', 'ap-northeast-1', 'ap-south-1', 
  'sa-east-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 
  'ca-central-1', 'ap-southeast-2'
];

async function tryRegion(region) {
  const connectionString = `postgresql://postgres.qfdpmshqwqglyiuqiwoq:G%40urav76552007@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 3000 });
  try {
    await client.connect();
    console.log(`Success in region: ${region}`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes('tenant/user') || err.message.includes('password') || err.message.includes('timeout') || err.message.includes('no tenant')) {
      // Expected failure for wrong region
    } else {
      console.log(`Error in ${region}:`, err.message);
    }
    return false;
  }
}

async function runAll() {
  for (const r of regions) {
    console.log("Trying", r);
    if (await tryRegion(r)) {
      console.log("FOUND REGION:", r);
      process.exit(0);
    }
  }
  console.log("No region matched.");
}

runAll();
