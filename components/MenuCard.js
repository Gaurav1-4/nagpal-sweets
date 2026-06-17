'use client';

import { memo } from 'react';

function getImageUrl(name) {
  const n = name.trim();
  
  // 17 AI generated images mapped here
  if (n === 'Veg. Chowmein') return '/food/veg_chowmein_1781716968635.png';
  if (n === 'Paneer Chowmein') return '/food/paneer_chowmein_1781716980302.png';
  if (n === 'Plain Dosa (Sada Dosa)') return '/food/plain_dosa_1781716994134.png';
  if (n === 'Paneer Dosa') return '/food/paneer_dosa_1781717005477.png';
  if (n === 'Masala Dosa') return '/food/masala_dosa_1781717049560.png';
  if (n === 'Mix Veg. Uthapam') return '/food/mix_veg_uthapam_1781717060886.png';
  if (n === 'Chhole Bhature') return '/food/chhole_bhature_1781717019425.png';
  if (n === 'Samosa Plate') return '/food/samosa_plate_1781717073743.png';
  if (n === 'Rasgulla Plate (2 Pcs.)') return '/food/rasgulla_1781717085990.png';
  if (n === 'Strawberry Shake') return '/food/strawberry_shake_1781717098110.png';
  
  if (n === 'Masala Dosa (Without Onion)') return '/food/masala_dosa_without_onion_1781717345474.png';
  if (n === 'Spl. Masala Dosa') return '/food/spl_masala_dosa_1781717358524.png';
  if (n === 'Butter Masala Dosa') return '/food/butter_masala_dosa_1781717371098.png';
  if (n === 'Butter Paneer Dosa') return '/food/butter_paneer_dosa_1781717385388.png';
  if (n === 'Onion Masala Dosa') return '/food/onion_masala_dosa_1781717399224.png';
  // Specific Wikimedia/Flickr images for the rest
  if (n === 'Onion Paneer Uthapam') return '/food/onion_paneer_uthapam_2_1781721620534.png';
  if (n === 'Rava Masala Dosa') return '/food/rava_masala_dosa_2_1781721632369.png';
  if (n === 'Rava Paneer Dosa') return '/food/rava_paneer_dosa_2_1781721660691.png';
  if (n === 'Rava Spl. Dosa') return '/food/rava_spl_dosa_2_1781721671702.png';
  if (n === 'Samber Chawal') return '/food/samber_chawal_1781721684594.png';
  if (n === 'Extra Samber (Katori)') return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Pumpkin_sambar.JPG/960px-Pumpkin_sambar.JPG';
  if (n === 'Samber Vada') return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Medu_Vada.JPG/960px-Medu_Vada.JPG';
  if (n === 'Samber Idli') return 'https://upload.wikimedia.org/wikipedia/commons/1/11/Idli_Sambar.JPG';
  if (n === 'Aloo Paneer Tikki') return '/food/aloo_paneer_tikki_1781721497283.png';
  if (n === 'Chawal Chhole') return '/food/chawal_chhole_1781721510010.png';
  if (n === 'Chhole Plate') return '/food/chhole_plate_1781721539046.png';
  if (n === 'Extra Chhole') return '/food/chhole_plate_1781721539046.png';
  if (n === 'Chawal Dahi') return '/food/chawal_dahi_1781721523092.png';
  if (n === 'Butter Paneer Chowmein') return '/food/butter_paneer_chowmein_1781721553882.png';
  if (n === 'Kulfi Faluda') return 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Matka_kulfi.jpg';
  if (n === 'Ras Malai') return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Ras_Malai_2.JPG/960px-Ras_Malai_2.JPG';
  if (n === 'Gulab Jamun (2 Pcs.)') return 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Gulab-jamun-wallpaper-1.jpg';
  if (n === 'Rabri' || n === 'Rabri Glass') return '/food/rabri_glass_1781722002745.png';
  if (n === 'Cold Drink') return '/food/cold_drink_1781721944572.png';
  if (n === 'Lassi (Sweet)') return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Salt_lassi.jpg/960px-Salt_lassi.jpg';
  if (n === 'Milk Shake' || n === 'Strawberry Shake with Ice Cream') return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Strawberry_milk_shake_%28cropped%29.jpg/960px-Strawberry_milk_shake_%28cropped%29.jpg';
  if (n === 'Cold Coffee') return '/food/cold_coffee_1781721579798.png';
  if (n === 'Cold Coffee with Ice Cream') return '/food/cold_coffee_ice_cream_1781721608491.png';
  if (n === 'Badam Shake') return '/food/badam_shake_1781721593604.png';
  if (n === 'Mineral Water') return '/food/mineral_water_1781721993249.png';

  // Fallback map for the rest using high quality Unsplash food photography
  const lowerName = n.toLowerCase();
  
  if (lowerName.includes('dosa') || lowerName.includes('uthapam') || lowerName.includes('idli') || lowerName.includes('vada')) {
    return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('chowmein')) {
    return 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('chhole') || lowerName.includes('chawal')) {
    return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('samosa') || lowerName.includes('tikki')) {
    return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('rasgulla') || lowerName.includes('jamun') || lowerName.includes('malai') || lowerName.includes('rabri') || lowerName.includes('kulfi')) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('shake') || lowerName.includes('coffee') || lowerName.includes('lassi')) {
    return 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('drink') || lowerName.includes('water')) {
    return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop';
  }
  
  // Default fallback
  return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?q=80&w=300&auto=format&fit=crop';
}

function MenuCard({ item, onAdd, onRemove, quantity, selectedSize, onSizeChange }) {
  const price = selectedSize === 'half' && item.has_half_option
    ? item.half_price
    : item.price;

  const isMrp = item.is_mrp;
  const imageUrl = getImageUrl(item.name);

  return (
    <div className="menu-card">
      <div className="card-info">
        <div className="veg-badge">
          <div className="veg-badge-inner" />
        </div>
        
        <h3 className="card-name">{item.name}</h3>
        
        {isMrp ? (
          <span className="mrp-badge">MRP</span>
        ) : (
          <div className="card-price">
            ₹{price}
          </div>
        )}
        
        {/* Placeholder description to make it look like Zomato/Swiggy */}
        <p className="card-desc">
          {item.description || "A delicious traditional recipe prepared with premium ingredients and authentic spices."}
        </p>

        {item.has_half_option && !isMrp && (
          <div className="size-toggle">
            <button
              className={`size-option ${selectedSize === 'full' ? 'active' : ''}`}
              onClick={() => onSizeChange(item.id, 'full')}
              aria-label="Full size"
            >
              Full
            </button>
            <button
              className={`size-option ${selectedSize === 'half' ? 'active' : ''}`}
              onClick={() => onSizeChange(item.id, 'half')}
              aria-label="Half size"
            >
              Half
            </button>
          </div>
        )}
      </div>

      {!isMrp && (
        <div className="card-actions">
          <div 
            className="item-image-placeholder" 
            style={{ backgroundImage: `url('${imageUrl}')` }}
          ></div>
          {quantity === 0 ? (
            <button
              className="add-btn"
              onClick={() => onAdd(item.id, item.name, price, selectedSize)}
              aria-label={`Add ${item.name} to cart`}
            >
              ADD
            </button>
          ) : (
            <div className="qty-controls">
              <button
                className="qty-btn"
                onClick={() => onRemove(`${item.id}-${selectedSize}`)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => onAdd(item.id, item.name, price, selectedSize)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(MenuCard);
