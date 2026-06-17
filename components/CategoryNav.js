'use client';

import { useRef, useEffect, memo } from 'react';

function CategoryNav({ categories, activeCategory, onCategoryClick }) {
  const navRef = useRef(null);
  const tabRefs = useRef({});

  // Auto-scroll the active tab into view within the nav
  useEffect(() => {
    const activeTab = tabRefs.current[activeCategory];
    if (activeTab && navRef.current) {
      const nav = navRef.current;
      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;
      const navWidth = nav.offsetWidth;
      const scrollLeft = tabLeft - navWidth / 2 + tabWidth / 2;

      nav.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [activeCategory]);

  return (
    <nav className="category-nav" aria-label="Menu categories">
      <div className="category-nav-inner" ref={navRef}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            ref={(el) => (tabRefs.current[cat.id] = el)}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategoryClick(cat.id)}
            aria-pressed={activeCategory === cat.id}
          >
            {cat.icon && <span className="category-tab-icon">{cat.icon}</span>}
            <span className="category-tab-name">{cat.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default memo(CategoryNav);
