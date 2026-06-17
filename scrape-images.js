const puppeteer = require('puppeteer');

const items = [
  { name: 'Onion Paneer Uthapam', query: 'indian dosa uttapam' },
  { name: 'Rava Masala Dosa', query: 'masala dosa' },
  { name: 'Rava Spl. Dosa', query: 'dosa food' },
  { name: 'Rava Paneer Dosa', query: 'paneer dosa' },
  { name: 'Rava Butter Paneer Dosa', query: 'butter dosa' },
  { name: 'V.I.P. Dosa', query: 'south indian thali dosa' },
  { name: 'Samber Chawal', query: 'sambar rice' },
  { name: 'Samber Vada', query: 'medu vada' },
  { name: 'Samber Idli', query: 'idli sambar' },
  { name: 'Extra Samber (Katori)', query: 'sambar bowl' },
  { name: 'Veg. Butter Chowmein', query: 'hakka noodles' },
  { name: 'Butter Paneer Chowmein', query: 'paneer noodles' },
  { name: 'Aloo Paneer Tikki', query: 'aloo tikki' },
  { name: 'Chawal Chhole', query: 'chole chawal' },
  { name: 'Chawal Dahi', query: 'curd rice' },
  { name: 'Extra Chhole', query: 'chana masala' },
  { name: 'Chhole Plate', query: 'chole bhature' },
  { name: 'Kulfi Faluda', query: 'kulfi' },
  { name: 'Rabri Glass', query: 'rabri sweet' },
  { name: 'Ras Malai', query: 'rasmalai' },
  { name: 'Gulab Jamun (2 Pcs.)', query: 'gulab jamun' },
  { name: 'Cold Drink', query: 'cola glass ice' },
  { name: 'Lassi (Sweet)', query: 'lassi' },
  { name: 'Milk Shake', query: 'vanilla milkshake' },
  { name: 'Cold Coffee', query: 'cold coffee glass' },
  { name: 'Cold Coffee with Ice Cream', query: 'cold coffee ice cream' },
  { name: 'Strawberry Shake with Ice Cream', query: 'strawberry milkshake' },
  { name: 'Badam Shake', query: 'badam milk' },
  { name: 'Mineral Water', query: 'water bottle' }
];

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const results = {};
  
  for (const item of items) {
    console.log(`Searching for: ${item.name} (${item.query})`);
    try {
      await page.goto(`https://unsplash.com/s/photos/${encodeURIComponent(item.query)}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      // Unsplash images usually have srcset or src containing "images.unsplash.com/photo"
      const imgUrl = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const photo = imgs.find(img => img.src && img.src.includes('images.unsplash.com/photo') && !img.src.includes('profile'));
        if (photo) {
           // get a high quality version
           const url = new URL(photo.src);
           url.searchParams.set('w', '600');
           url.searchParams.set('q', '80');
           return url.toString();
        }
        return null;
      });
      
      if (imgUrl) {
        results[item.name] = imgUrl;
        console.log(`Found: ${imgUrl}`);
      } else {
        console.log(`No image found for ${item.name}`);
      }
    } catch (e) {
      console.log(`Error on ${item.name}`);
    }
  }
  
  await browser.close();
  
  const fs = require('fs');
  fs.writeFileSync('unsplash-results.json', JSON.stringify(results, null, 2));
  console.log("Done writing unsplash-results.json");
}

run();
