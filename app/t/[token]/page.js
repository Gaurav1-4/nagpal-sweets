'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/components/CartContext';
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from '@/lib/constants';
import MenuCard from '@/components/MenuCard';
import CategoryNav from '@/components/CategoryNav';
import CartBar from '@/components/CartBar';
import './menu.css';

function MenuContent({ token }) {
  const { addItem, removeItem, items, totalItems, totalAmount } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [sizeSelections, setSizeSelections] = useState({});
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);

  const heroVideos = [
    { src: '/videos/Butter_melting_on_dosa_202606180040.mp4', label: 'Rava Masala Dosa >' },
    { src: '/videos/Hands_tearing_Bhatura_dipping_Ch…_202606180041.mp4', label: 'Chhole Bhature >' },
    { src: '/videos/Chef_tosses_wok_noodles_fire_202606180041.mp4', label: 'Paneer Chowmein >' }
  ];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const sectionRefs = useRef({});
  const isScrollingProgrammatically = useRef(false);

  // 1. Validate token & get/create session
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch(`/api/tables/${token}`);
        if (!res.ok) {
          setError('Invalid or expired QR code. Please scan again.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        const sid = data.session ? data.session.id : data.sessionId;
        setSessionId(sid);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`session_${token}`, sid);
        }
      } catch {
        setError('Could not connect to the restaurant. Please check your connection.');
        setLoading(false);
      }
    }
    initSession();
  }, [token]);

  // 2. Fetch menu
  useEffect(() => {
    if (!sessionId) return;
    async function fetchMenu() {
      try {
        const { data: cats, error: catError } = await supabase
          .from('menu_categories')
          .select(`
            id,
            name,
            icon,
            menu_items (
              id,
              name,
              description,
              price,
              half_price,
              has_half_option,
              is_veg,
              is_available,
              is_mrp
            )
          `);

        if (catError) throw catError;

        const processed = cats.map((cat) => ({
          ...cat,
          menu_items: cat.menu_items
            .filter((item) => item.is_available)
            .sort((a, b) => a.name.localeCompare(b.name)),
        })).sort((a, b) => a.name.localeCompare(b.name));

        setCategories(processed);
        if (processed.length > 0) {
          setActiveCategory(processed[0].id);
        }

        const sizes = {};
        processed.forEach((cat) => {
          cat.menu_items.forEach((item) => {
            sizes[item.id] = 'full';
          });
        });
        setSizeSelections(sizes);
      } catch {
        setError('Could not load the menu. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [sessionId]);

  // 3. Intersection Observer for active category
  useEffect(() => {
    if (categories.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      if (isScrollingProgrammatically.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.dataset.categoryId);
        }
      });
    }, observerOptions);

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const handleCategoryClick = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    setMenuSheetOpen(false); // Close sheet if jumping from menu button
    const section = sectionRefs.current[categoryId];
    if (section) {
      isScrollingProgrammatically.current = true;
      const yOffset = -60; // account for sticky nav height
      const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });

      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 800);
    }
  }, []);

  const handleSizeChange = useCallback((itemId, size) => {
    setSizeSelections((prev) => ({ ...prev, [itemId]: size }));
  }, []);

  const handleAdd = useCallback((itemId, name, price, size) => {
    addItem(itemId, name, price, size);
  }, [addItem]);

  const handleRemove = useCallback((key) => {
    removeItem(key);
  }, [removeItem]);

  const getQuantity = useCallback((itemId, size) => {
    const key = `${itemId}-${size}`;
    const found = items.find((i) => i.key === key);
    return found ? found.quantity : 0;
  }, [items]);

  if (loading) {
    return (
      <div className="menu-loading">
        <div className="loading-spinner" />
        <span className="loading-text">Loading menu…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-error">
        <div className="error-icon">😕</div>
        <h2>Oops!</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {/* 1. Hero Section */}
      <div className="hero-section" style={{ position: 'relative' }}>
        <video 
          key={heroVideos[currentVideoIndex].src}
          src={heroVideos[currentVideoIndex].src}
          className="hero-video"
          autoPlay
          muted
          playsInline
          onEnded={() => setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
        />
        <div className="hero-overlay" style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)' }} />
        
        {/* Top Icons Bar over Hero */}
        <div className="top-icons-bar" style={{ zIndex: 2, position: 'relative' }}>
          <a href="#" className="icon-btn">←</a>
          <div className="top-icon-group">
            <button className="icon-btn">🔍</button>
            <button className="icon-btn">👥</button>
            <button className="icon-btn">⋮</button>
          </div>
        </div>

        <div className="hero-bottom-overlay" style={{ zIndex: 2, position: 'relative' }}>
          <div className="hero-dots" style={{ zIndex: 3, position: 'relative' }}>
            {heroVideos.map((_, idx) => (
               <span 
                 key={idx} 
                 className={`hero-dot ${idx === currentVideoIndex ? 'active' : ''}`} 
                 onClick={() => setCurrentVideoIndex(idx)}
                 style={{ cursor: 'pointer' }}
               ></span>
            ))}
          </div>
          <div className="hero-dish-name" style={{ zIndex: 3, position: 'relative' }}>
            {heroVideos[currentVideoIndex].label}
          </div>
        </div>
      </div>

      {/* 2. Restaurant Info Card (Bottom Sheet Style) */}
      <div className="restaurant-info-card">
        <div className="card-drag-handle"></div>
        
        <div className="restaurant-title-row">
          <h1 className="restaurant-title">
            {RESTAURANT_NAME} <span className="info-icon">ⓘ</span>
          </h1>
          <div className="rating-pill">
            <div className="rating-badge">★ 4.5</div>
            <div className="rating-count">By 1K+</div>
          </div>
        </div>

        <div className="restaurant-meta">
          <div className="meta-row">
            <span>📍</span>
            <span>4.3 km · Main Market Locality</span>
          </div>
          <div className="meta-row">
            <span>🕒</span>
            <span>10-15 mins · Serve at table ∨</span>
          </div>
        </div>

        <div className="offer-banner">
          <div className="offer-text">
            <span className="offer-icon">%</span>
            <span>Flat ₹50 OFF above ₹299</span>
          </div>
          <div className="offer-more">5 offers ∨</div>
        </div>
      </div>

      {/* 3. Horizontal Filter Pills (Sticky) */}
      <div className="category-filters">
        <div className="category-nav-inner">
          <button className="filter-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filters ∨
          </button>
          <button className="filter-pill active">
            <span className="veg-badge-inner" style={{display:'inline-block', width:'8px', height:'8px', background:'#4caf50', borderRadius:'50%', border:'1px solid #4caf50', marginRight:'4px'}}></span>
            Pure Veg
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              {cat.icon && <span style={{marginRight: '4px'}}>{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Menu Sections */}
      <main className="menu-sections">
        {categories.map((cat, index) => (
          <section
            key={cat.id}
            className="menu-section"
            data-category-id={cat.id}
            ref={(el) => (sectionRefs.current[cat.id] = el)}
          >
            <div className="section-header">
              <h2 className="section-title">
                {index === 0 ? "Most ordered together" : cat.name}
              </h2>
            </div>

            <div className="section-items">
              {cat.menu_items.map((item) => {
                const size = sizeSelections[item.id] || 'full';
                return (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    quantity={getQuantity(item.id, size)}
                    selectedSize={size}
                    onSizeChange={handleSizeChange}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* 5. Floating Menu Button (Bottom Right) */}
      <button className="floating-menu-btn" onClick={() => setMenuSheetOpen(true)}>
        <span className="menu-btn-icon">🍴</span> Menu
      </button>

      {/* 6. Menu Bottom Sheet (Categories List) */}
      <div className={`menu-bottom-sheet ${menuSheetOpen ? 'open' : ''}`} onClick={() => setMenuSheetOpen(false)}>
        <div className="sheet-content" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-header">
            <span>Menu</span>
            <button className="close-sheet-btn" onClick={() => setMenuSheetOpen(false)}>✕</button>
          </div>
          <div className="sheet-categories">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                className={`sheet-category-item ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <span>{cat.name}</span>
                <span className="sheet-category-count">{cat.menu_items.length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Cart Bar */}
      <CartBar
        totalItems={totalItems}
        totalAmount={totalAmount}
        token={token}
      />
    </div>
  );
}

export default function MenuPage({ params }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  return (
    <MenuContent token={token} />
  );
}
