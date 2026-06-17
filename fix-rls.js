const { Client } = require('pg');
const connectionString = "postgresql://postgres:G%40urav76552007@db.qfdpmshqwqglyiuqiwoq.supabase.co:5432/postgres";
const run = async () => {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected. Applying RLS...");
    
    await client.query(`
      ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
      ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Menu categories are viewable by everyone" ON menu_categories;
      CREATE POLICY "Menu categories are viewable by everyone" ON menu_categories FOR SELECT USING (true);
      
      DROP POLICY IF EXISTS "Menu items are viewable by everyone" ON menu_items;
      CREATE POLICY "Menu items are viewable by everyone" ON menu_items FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Tables are viewable by everyone" ON tables;
      CREATE POLICY "Tables are viewable by everyone" ON tables FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Sessions are viewable by everyone" ON table_sessions;
      CREATE POLICY "Sessions are viewable by everyone" ON table_sessions FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Sessions can be created by everyone" ON table_sessions;
      CREATE POLICY "Sessions can be created by everyone" ON table_sessions FOR INSERT WITH CHECK (true);

      DROP POLICY IF EXISTS "Sessions can be updated by everyone" ON table_sessions;
      CREATE POLICY "Sessions can be updated by everyone" ON table_sessions FOR UPDATE USING (true);

      DROP POLICY IF EXISTS "Orders are viewable by everyone" ON orders;
      CREATE POLICY "Orders are viewable by everyone" ON orders FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Orders can be created by everyone" ON orders;
      CREATE POLICY "Orders can be created by everyone" ON orders FOR INSERT WITH CHECK (true);

      DROP POLICY IF EXISTS "Orders can be updated by everyone" ON orders;
      CREATE POLICY "Orders can be updated by everyone" ON orders FOR UPDATE USING (true);

      DROP POLICY IF EXISTS "Order items are viewable by everyone" ON order_items;
      CREATE POLICY "Order items are viewable by everyone" ON order_items FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Order items can be created by everyone" ON order_items;
      CREATE POLICY "Order items can be created by everyone" ON order_items FOR INSERT WITH CHECK (true);
    `);
    
    console.log("RLS applied.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
};
run();
