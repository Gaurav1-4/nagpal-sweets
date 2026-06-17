'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart, CartProvider } from '@/components/CartContext';
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
        // Persist sessionId so cart page can access it
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

  // 2. Fetch menu once session is valid
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

        // Sort items within each category and filter unavailable
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

        // Initialize size selections: default to 'full' for all items
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

  // 3. Intersection Observer for active category on scroll
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

  // Handlers
  const handleCategoryClick = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    const section = sectionRefs.current[categoryId];
    if (section) {
      isScrollingProgrammatically.current = true;
      const yOffset = -110; // account for sticky nav height
      const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });

      // Re-enable observer after scroll completes
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 800);
    }
  }, []);

  const handleSizeChange = useCallback((itemId, size) => {
    setSizeSelections((prev) => ({ ...prev, [itemId]: size }));
  }, []);

  const handleAdd = useCallback(
    (itemId, name, price, size) => {
      addItem(itemId, name, price, size);
    },
    [addItem]
  );

  const handleRemove = useCallback(
    (key) => {
      removeItem(key);
    },
    [removeItem]
  );

  const getQuantity = useCallback(
    (itemId, size) => {
      const key = `${itemId}-${size}`;
      const found = items.find((i) => i.key === key);
      return found ? found.quantity : 0;
    },
    [items]
  );

  // Render states
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
      {/* Restaurant Header */}
      <header className="menu-header">
        <div className="header-content">
          <div className="header-top-row">
            <h1 className="restaurant-name">{RESTAURANT_NAME}</h1>
            <div className="veg-badge-header">
              <div className="veg-dot-header">
                <span />
              </div>
              <span className="veg-badge-text">Pure Veg</span>
            </div>
          </div>
          <p className="restaurant-tagline">{RESTAURANT_TAGLINE}</p>
        </div>
      </header>

      {/* Sticky Category Nav */}
      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      {/* Menu Sections */}
      <main className="menu-sections">
        {categories.map((cat) => (
          <section
            key={cat.id}
            className="menu-section"
            data-category-id={cat.id}
            ref={(el) => (sectionRefs.current[cat.id] = el)}
          >
            <div className="section-header">
              {cat.icon && <span className="section-icon">{cat.icon}</span>}
              <h2 className="section-title">{cat.name}</h2>
              <span className="section-count">
                {cat.menu_items.length} {cat.menu_items.length === 1 ? 'item' : 'items'}
              </span>
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

      {/* Floating Cart Bar */}
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
