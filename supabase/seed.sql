-- ============================================
-- Nagpal Sweets & Namkeen — Seed Data
-- ============================================

-- ============================================
-- TABLE (1 demo table with secure token)
-- ============================================
INSERT INTO tables (name, token) VALUES
  ('Table 1', 'nsk-a3f8c2d1-9b4e-4f7a-b6c8-e2d5a1f09374');

-- ============================================
-- MENU CATEGORIES
-- ============================================
INSERT INTO menu_categories (id, name, icon, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'South Indian', '🫕', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Chinese', '🍜', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Chat & Indian Snacks', '🥘', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Sweet Dish', '🍮', 4),
  ('c1000000-0000-0000-0000-000000000005', 'Hot & Cold', '🥤', 5);

-- ============================================
-- SOUTH INDIAN (21 items)
-- ============================================
INSERT INTO menu_items (category_id, name, price_full, price_half, has_half_option, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Masala Dosa', 130, NULL, false, 1),
  ('c1000000-0000-0000-0000-000000000001', 'Butter Masala Dosa', 150, NULL, false, 2),
  ('c1000000-0000-0000-0000-000000000001', 'Masala Dosa (Without Onion)', 130, NULL, false, 3),
  ('c1000000-0000-0000-0000-000000000001', 'Spl. Masala Dosa', 160, NULL, false, 4),
  ('c1000000-0000-0000-0000-000000000001', 'Plain Dosa (Sada Dosa)', 100, NULL, false, 5),
  ('c1000000-0000-0000-0000-000000000001', 'Paneer Dosa', 180, NULL, false, 6),
  ('c1000000-0000-0000-0000-000000000001', 'Butter Paneer Dosa', 200, NULL, false, 7),
  ('c1000000-0000-0000-0000-000000000001', 'Onion Masala Dosa', 180, NULL, false, 8),
  ('c1000000-0000-0000-0000-000000000001', 'Onion Paneer Dosa', 220, NULL, false, 9),
  ('c1000000-0000-0000-0000-000000000001', 'Onion Tomato Uthapam', 160, NULL, false, 10),
  ('c1000000-0000-0000-0000-000000000001', 'Mix Veg. Uthapam', 180, NULL, false, 11),
  ('c1000000-0000-0000-0000-000000000001', 'Onion Paneer Uthapam', 200, NULL, false, 12),
  ('c1000000-0000-0000-0000-000000000001', 'Rava Masala Dosa', 180, NULL, false, 13),
  ('c1000000-0000-0000-0000-000000000001', 'Rava Spl. Dosa', 200, NULL, false, 14),
  ('c1000000-0000-0000-0000-000000000001', 'Rava Paneer Dosa', 220, NULL, false, 15),
  ('c1000000-0000-0000-0000-000000000001', 'Rava Butter Paneer Dosa', 240, NULL, false, 16),
  ('c1000000-0000-0000-0000-000000000001', 'V.I.P. Dosa', 230, NULL, false, 17),
  ('c1000000-0000-0000-0000-000000000001', 'Samber Chawal', 100, NULL, false, 18),
  ('c1000000-0000-0000-0000-000000000001', 'Samber Vada', 100, 60, true, 19),
  ('c1000000-0000-0000-0000-000000000001', 'Samber Idli', 100, 60, true, 20),
  ('c1000000-0000-0000-0000-000000000001', 'Extra Samber (Katori)', 30, NULL, false, 21);

-- ============================================
-- CHINESE (4 items)
-- ============================================
INSERT INTO menu_items (category_id, name, price_full, price_half, has_half_option, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000002', 'Veg. Chowmein', 130, 80, true, 1),
  ('c1000000-0000-0000-0000-000000000002', 'Veg. Butter Chowmein', 150, 100, true, 2),
  ('c1000000-0000-0000-0000-000000000002', 'Paneer Chowmein', 180, 110, true, 3),
  ('c1000000-0000-0000-0000-000000000002', 'Butter Paneer Chowmein', 200, 120, true, 4);

-- ============================================
-- CHAT & INDIAN SNACKS (7 items)
-- ============================================
INSERT INTO menu_items (category_id, name, price_full, price_half, has_half_option, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000003', 'Chhole Bhature', 100, 60, true, 1),
  ('c1000000-0000-0000-0000-000000000003', 'Aloo Paneer Tikki', 100, 60, true, 2),
  ('c1000000-0000-0000-0000-000000000003', 'Samosa Plate', 80, 50, true, 3),
  ('c1000000-0000-0000-0000-000000000003', 'Chawal Chhole', 100, 60, true, 4),
  ('c1000000-0000-0000-0000-000000000003', 'Chawal Dahi', 100, 60, true, 5),
  ('c1000000-0000-0000-0000-000000000003', 'Extra Chhole', 30, NULL, false, 6),
  ('c1000000-0000-0000-0000-000000000003', 'Chhole Plate', 60, NULL, false, 7);

-- ============================================
-- SWEET DISH (5 items)
-- ============================================
INSERT INTO menu_items (category_id, name, price_full, price_half, has_half_option, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000004', 'Kulfi Faluda', 80, NULL, false, 1),
  ('c1000000-0000-0000-0000-000000000004', 'Rabri Glass', 80, NULL, false, 2),
  ('c1000000-0000-0000-0000-000000000004', 'Rasgulla Plate (2 Pcs.)', 50, NULL, false, 3),
  ('c1000000-0000-0000-0000-000000000004', 'Ras Malai', 80, NULL, false, 4),
  ('c1000000-0000-0000-0000-000000000004', 'Gulab Jamun (2 Pcs.)', 50, NULL, false, 5);

-- ============================================
-- HOT & COLD (9 items)
-- ============================================
INSERT INTO menu_items (category_id, name, price_full, price_half, has_half_option, is_mrp, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000005', 'Cold Drink', NULL, NULL, false, true, 1),
  ('c1000000-0000-0000-0000-000000000005', 'Lassi (Sweet)', 60, NULL, false, false, 2),
  ('c1000000-0000-0000-0000-000000000005', 'Milk Shake', 80, NULL, false, false, 3),
  ('c1000000-0000-0000-0000-000000000005', 'Cold Coffee', 80, NULL, false, false, 4),
  ('c1000000-0000-0000-0000-000000000005', 'Cold Coffee with Ice Cream', 60, NULL, false, false, 5),
  ('c1000000-0000-0000-0000-000000000005', 'Strawberry Shake', 80, NULL, false, false, 6),
  ('c1000000-0000-0000-0000-000000000005', 'Strawberry Shake with Ice Cream', 100, NULL, false, false, 7),
  ('c1000000-0000-0000-0000-000000000005', 'Badam Shake', 90, NULL, false, false, 8),
  ('c1000000-0000-0000-0000-000000000005', 'Mineral Water', NULL, NULL, false, true, 9);
