require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Deleting old data...");
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('menu_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log("Inserting categories...");
  const cats = [
    { id: 'c1000000-0000-0000-0000-000000000001', name: 'South Indian', icon: '🫕' },
    { id: 'c1000000-0000-0000-0000-000000000002', name: 'Chinese', icon: '🍜' },
    { id: 'c1000000-0000-0000-0000-000000000003', name: 'Chat & Snacks', icon: '🥘' },
    { id: 'c1000000-0000-0000-0000-000000000004', name: 'Sweet Dish', icon: '🍮' },
    { id: 'c1000000-0000-0000-0000-000000000005', name: 'Hot & Cold', icon: '🥤' }
  ];
  
  const { error: catErr } = await supabase.from('menu_categories').insert(cats);
  if (catErr) console.error("Cat error:", catErr);

  const items = [
    // SOUTH INDIAN
    { category_id: cats[0].id, name: 'Masala Dosa', price: 130, is_veg: true },
    { category_id: cats[0].id, name: 'Butter Masala Dosa', price: 150, is_veg: true },
    { category_id: cats[0].id, name: 'Masala Dosa (Without Onion)', price: 130, is_veg: true },
    { category_id: cats[0].id, name: 'Spl. Masala Dosa', price: 160, is_veg: true },
    { category_id: cats[0].id, name: 'Plain Dosa (Sada Dosa)', price: 100, is_veg: true },
    { category_id: cats[0].id, name: 'Paneer Dosa', price: 180, is_veg: true },
    { category_id: cats[0].id, name: 'Butter Paneer Dosa', price: 200, is_veg: true },
    { category_id: cats[0].id, name: 'Onion Masala Dosa', price: 180, is_veg: true },
    { category_id: cats[0].id, name: 'Onion Paneer Dosa', price: 220, is_veg: true },
    { category_id: cats[0].id, name: 'Onion Tomato Uthapam', price: 160, is_veg: true },
    { category_id: cats[0].id, name: 'Mix Veg. Uthapam', price: 180, is_veg: true },
    { category_id: cats[0].id, name: 'Onion Paneer Uthapam', price: 200, is_veg: true },
    { category_id: cats[0].id, name: 'Rava Masala Dosa', price: 180, is_veg: true },
    { category_id: cats[0].id, name: 'Rava Spl. Dosa', price: 200, is_veg: true },
    { category_id: cats[0].id, name: 'Rava Paneer Dosa', price: 220, is_veg: true },
    { category_id: cats[0].id, name: 'Rava Butter Paneer Dosa', price: 240, is_veg: true },
    { category_id: cats[0].id, name: 'V.I.P. Dosa', price: 230, is_veg: true },
    { category_id: cats[0].id, name: 'Samber Chawal', price: 100, is_veg: true },
    { category_id: cats[0].id, name: 'Samber Vada', price: 100, half_price: 60, has_half_option: true, is_veg: true },
    { category_id: cats[0].id, name: 'Samber Idli', price: 100, half_price: 60, has_half_option: true, is_veg: true },
    { category_id: cats[0].id, name: 'Extra Samber (Katori)', price: 30, is_veg: true },

    // CHINESE
    { category_id: cats[1].id, name: 'Veg. Chowmein', price: 130, half_price: 80, has_half_option: true, is_veg: true },
    { category_id: cats[1].id, name: 'Veg. Butter Chowmein', price: 150, half_price: 100, has_half_option: true, is_veg: true },
    { category_id: cats[1].id, name: 'Paneer Chowmein', price: 180, half_price: 110, has_half_option: true, is_veg: true },
    { category_id: cats[1].id, name: 'Butter Paneer Chowmein', price: 200, half_price: 120, has_half_option: true, is_veg: true },

    // CHAT & INDIAN SNACKS
    { category_id: cats[2].id, name: 'Chhole Bhature', price: 100, half_price: 60, has_half_option: true, is_veg: true },
    { category_id: cats[2].id, name: 'Aloo Paneer Tikki', price: 100, half_price: 60, has_half_option: true, is_veg: true },
    { category_id: cats[2].id, name: 'Samosa Plate', price: 80, half_price: 50, has_half_option: true, is_veg: true },
    { category_id: cats[2].id, name: 'Chawal Chhole', price: 100, half_price: 60, has_half_option: true, is_veg: true },
    { category_id: cats[2].id, name: 'Chawal Dahi', price: 100, half_price: 60, has_half_option: true, is_veg: true },
    { category_id: cats[2].id, name: 'Extra Chhole', price: 30, is_veg: true },
    { category_id: cats[2].id, name: 'Chhole Plate', price: 60, is_veg: true },

    // SWEET DISH
    { category_id: cats[3].id, name: 'Kulfi Faluda', price: 80, is_veg: true },
    { category_id: cats[3].id, name: 'Rabri Glass', price: 80, is_veg: true },
    { category_id: cats[3].id, name: 'Rasgulla Plate (2 Pcs.)', price: 50, is_veg: true },
    { category_id: cats[3].id, name: 'Ras Malai', price: 80, is_veg: true },
    { category_id: cats[3].id, name: 'Gulab Jamun (2 Pcs.)', price: 50, is_veg: true },

    // HOT & COLD
    { category_id: cats[4].id, name: 'Cold Drink', price: 0, is_mrp: true, is_veg: true },
    { category_id: cats[4].id, name: 'Lassi (Sweet)', price: 60, is_veg: true },
    { category_id: cats[4].id, name: 'Milk Shake', price: 80, is_veg: true },
    { category_id: cats[4].id, name: 'Cold Coffee', price: 80, is_veg: true },
    { category_id: cats[4].id, name: 'Cold Coffee with Ice Cream', price: 60, is_veg: true },
    { category_id: cats[4].id, name: 'Strawberry Shake', price: 80, is_veg: true },
    { category_id: cats[4].id, name: 'Strawberry Shake with Ice Cream', price: 100, is_veg: true },
    { category_id: cats[4].id, name: 'Badam Shake', price: 90, is_veg: true },
    { category_id: cats[4].id, name: 'Mineral Water', price: 0, is_mrp: true, is_veg: true }
  ];

  console.log("Inserting items...");
  const { error: itemErr } = await supabase.from('menu_items').insert(items);
  if (itemErr) console.error("Item error:", itemErr);

  console.log("Done seeding 46 items.");
}
run();
