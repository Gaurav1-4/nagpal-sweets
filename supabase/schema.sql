-- ============================================
-- Nagpal Sweets & Namkeen — Database Schema
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES (physical restaurant tables)
-- ============================================
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SESSIONS (one per customer visit)
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES tables(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'ordering', 'cooking', 'ready', 'served', 'awaiting_payment', 'closed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_table_id ON sessions(table_id);
CREATE INDEX idx_sessions_status ON sessions(status);

-- ============================================
-- MENU CATEGORIES
-- ============================================
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- ============================================
-- MENU ITEMS
-- ============================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES menu_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price_full INT,
  price_half INT,
  has_half_option BOOLEAN DEFAULT false,
  is_veg BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  is_mrp BOOLEAN DEFAULT false,
  seasonal_note TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_menu_items_category ON menu_items(category_id);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'placed'
    CHECK (status IN ('placed', 'confirmed', 'cooking', 'ready', 'served', 'cancelled')),
  total_amount INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INT NOT NULL DEFAULT 1,
  size TEXT NOT NULL DEFAULT 'full'
    CHECK (size IN ('full', 'half')),
  price_at_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read access for menu (customers need to see the menu)
CREATE POLICY "Menu categories are viewable by everyone"
  ON menu_categories FOR SELECT
  USING (true);

CREATE POLICY "Menu items are viewable by everyone"
  ON menu_items FOR SELECT
  USING (true);

-- Public read access for tables (token validation)
CREATE POLICY "Tables are viewable by everyone"
  ON tables FOR SELECT
  USING (true);

-- Public read/write for sessions (customers create sessions via token)
CREATE POLICY "Sessions are viewable by everyone"
  ON sessions FOR SELECT
  USING (true);

CREATE POLICY "Sessions can be created by everyone"
  ON sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sessions can be updated by everyone"
  ON sessions FOR UPDATE
  USING (true);

-- Public read/write for orders (customers place orders)
CREATE POLICY "Orders are viewable by everyone"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Orders can be created by everyone"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Orders can be updated by everyone"
  ON orders FOR UPDATE
  USING (true);

-- Public read/write for order items
CREATE POLICY "Order items are viewable by everyone"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Order items can be created by everyone"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ============================================
-- REALTIME (enable for dashboard)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
