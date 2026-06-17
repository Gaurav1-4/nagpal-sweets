require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const descriptions = {
  // SOUTH INDIAN
  'Masala Dosa': 'Classic crispy rice crepe filled with our mildly spiced potato and onion mash. Served hot with fresh coconut chutney and tangy sambar.',
  'Butter Masala Dosa': 'Our classic masala dosa roasted in rich yellow butter for extra crispiness and flavor. A local favorite.',
  'Masala Dosa (Without Onion)': 'Crispy rice crepe with a pure, homestyle potato filling prepared completely without onions.',
  'Spl. Masala Dosa': 'A heavy, loaded dosa stuffed with extra potato masala, grated paneer, and roasted cashews.',
  'Plain Dosa (Sada Dosa)': 'A simple, massive, perfectly crisp golden crepe. Best enjoyed dipped in hot sambar and cool coconut chutney.',
  'Paneer Dosa': 'Crispy golden dosa generously stuffed with spiced, scrambled paneer (cottage cheese).',
  'Butter Paneer Dosa': 'Our rich paneer dosa roasted crisp in melting butter. Very filling and packed with flavor.',
  'Onion Masala Dosa': 'Crispy dosa filled with a spicy mix of roasted potatoes and sweet, crunchy caramelized pink onions.',
  'Onion Paneer Dosa': 'A rich dosa stuffed with fresh crumbled paneer and finely chopped onions.',
  'Onion Tomato Uthapam': 'A thick, soft, savory South Indian pancake topped with chopped onions and juicy red tomatoes baked right into the batter.',
  'Mix Veg. Uthapam': 'Thick and fluffy savory pancake loaded with carrots, capsicum, tomatoes, and onions.',
  'Onion Paneer Uthapam': 'A soft savory pancake generously topped with fresh crumbled paneer and chopped onions.',
  'Rava Masala Dosa': 'Crispy, lacy semolina crepe with a beautiful golden texture, folded over our classic potato masala.',
  'Rava Spl. Dosa': 'Our special crispy semolina dosa filled with extra potato masala, paneer, and cashews.',
  'Rava Paneer Dosa': 'Lacy, crispy semolina dosa generously stuffed with fresh spiced paneer.',
  'Rava Butter Paneer Dosa': 'Crispy semolina dosa stuffed with paneer and roasted in rich butter.',
  'V.I.P. Dosa': 'The ultimate feast! A giant crispy dosa fully loaded with mixed vegetables, paneer, dry fruits, and butter.',
  'Samber Chawal': 'A comforting bowl of hot steamed rice served with our tangy, vegetable-rich sambar.',
  'Samber Vada': 'Crispy, deep-fried lentil donuts soaked in hot, flavorful sambar. A classic comfort snack.',
  'Samber Idli': 'Soft, fluffy steamed rice cakes dipped in hot, tangy lentil sambar.',
  'Extra Samber (Katori)': 'A small bowl of our signature hot, tangy vegetable sambar.',

  // CHINESE
  'Veg. Chowmein': 'Street-style Hakka noodles tossed in a wok with fresh shredded cabbage, carrots, and capsicum in dark soy sauce.',
  'Veg. Butter Chowmein': 'Our classic street-style noodles tossed with a generous dollop of butter for a rich, glossy finish.',
  'Paneer Chowmein': 'Spicy stir-fried noodles tossed with fresh veggies and golden-fried cubes of paneer.',
  'Butter Paneer Chowmein': 'Our rich paneer noodles tossed in butter for an extra indulgent, street-style flavor.',

  // CHAT & INDIAN SNACKS
  'Chhole Bhature': 'Two large, fluffy, deep-fried bhaturas served with spicy, thick Punjabi chhole (chickpea curry) and pickles.',
  'Aloo Paneer Tikki': 'Crispy, golden-fried potato patties stuffed with spiced paneer, served hot with tangy chutneys.',
  'Samosa Plate': 'Two large, crispy, golden-fried triangular pastries stuffed with a spicy potato and pea filling. Drizzled with sweet and spicy chutneys.',
  'Chawal Chhole': 'A comforting plate of hot steamed rice served with our spicy Punjabi chhole.',
  'Chawal Dahi': 'A cooling, simple meal of steamed white rice served with fresh, thick yogurt.',
  'Extra Chhole': 'A small bowl of our spicy, thick Punjabi chickpea curry.',
  'Chhole Plate': 'A full plate of our signature spicy Punjabi chhole, served hot with fresh onions and green chili.',

  // SWEET DISH
  'Kulfi Faluda': 'Traditional rich, creamy kulfi ice cream served with sweet faluda noodles and rose syrup.',
  'Rabri Glass': 'A glass of rich, thickened sweetened milk packed with layers of malai (cream) and dry fruits.',
  'Rasgulla Plate (2 Pcs.)': 'Two soft, spongy, snow-white cheese balls soaked in a light, sweet sugar syrup.',
  'Ras Malai': 'Soft, melt-in-your-mouth paneer discs soaked in thick, sweetened milk flavored with cardamom and saffron.',
  'Gulab Jamun (2 Pcs.)': 'Two incredibly soft, deep-fried milk dough balls soaked in a warm, fragrant sugar syrup.',

  // HOT & COLD
  'Cold Drink': 'Chilled, refreshing carbonated beverage.',
  'Lassi (Sweet)': 'A tall glass of thick, sweet, chilled yogurt drink blended to perfection. A Punjabi classic.',
  'Milk Shake': 'A simple, classic, sweet and thick milk shake blended with ice.',
  'Cold Coffee': 'Thick, chilled blended coffee. Sweet, creamy, and completely refreshing.',
  'Cold Coffee with Ice Cream': 'Our thick cold coffee topped with a generous, creamy scoop of vanilla ice cream.',
  'Strawberry Shake': 'A sweet, thick, creamy shake blended with rich strawberry syrup.',
  'Strawberry Shake with Ice Cream': 'Our classic strawberry shake topped with a thick scoop of ice cream.',
  'Badam Shake': 'A rich, creamy chilled milk beverage loaded with crushed almonds (badam) and a hint of saffron.',
  'Mineral Water': 'Chilled, sealed bottle of purified drinking water.'
};

async function updateDescriptions() {
  console.log("Fetching all menu items...");
  const { data: items, error: fetchErr } = await supabase.from('menu_items').select('id, name');
  
  if (fetchErr) {
    console.error("Error fetching items:", fetchErr);
    return;
  }

  console.log(`Found ${items.length} items. Updating descriptions...`);

  for (const item of items) {
    const desc = descriptions[item.name];
    if (desc) {
      const { error: updateErr } = await supabase
        .from('menu_items')
        .update({ description: desc })
        .eq('id', item.id);
        
      if (updateErr) {
        console.error(`Failed to update ${item.name}:`, updateErr);
      } else {
        console.log(`Updated ${item.name}`);
      }
    } else {
      console.warn(`No description found for: ${item.name}`);
    }
  }

  console.log("All descriptions updated successfully!");
}

updateDescriptions();
