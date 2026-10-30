'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Heart,
  GitCompare,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  Plus,
  Minus,
  Eye,
  Check,
  Cpu,
  Smartphone,
  Laptop,
  Headphones,
  Gamepad2,
  Watch,
  Cable,
  Tablet,
  Sun,
  Moon,
  Flame,
  Sparkles,
  Percent,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';

import { products } from '@/data/products';
import { categories } from '@/data/categories';
import { brands } from '@/data/brands';
import { formatPrice, formatDiscount } from '@/lib/utils';
import { Product } from '@/types';

const STORAGE_PRODUCTS_KEY = 'techhunter_store_products';
const STORAGE_CATEGORIES_KEY = 'techhunter_custom_categories';

// Helper to extract the highest priority valid image from a product
const getProductImage = (p?: Product | null): string | null => {
  if (!p) return null;
  if (p.featuredImage && typeof p.featuredImage === 'string' && p.featuredImage.trim()) {
    return p.featuredImage.trim();
  }
  if (p.image && typeof p.image === 'string' && p.image.trim()) {
    return p.image.trim();
  }
  if (
    p.images &&
    Array.isArray(p.images) &&
    p.images.length > 0 &&
    p.images[0] &&
    typeof p.images[0] === 'string' &&
    p.images[0].trim()
  ) {
    return p.images[0].trim();
  }
  return null;
};

// Map category icons to Lucide components
const categoryIconMap: Record<string, React.ElementType> = {
  Smartphones: Smartphone,
  Laptops: Laptop,
  Audio: Headphones,
  Gaming: Gamepad2,
  Wearables: Watch,
  Accessories: Cable,
  'PC Components': Cpu,
  Tablets: Tablet,
};

export default function HomePage() {
  // Theme state: dark (default) or light
  const [isDark, setIsDark] = useState(true);

  // Synchronized catalog state (localStorage fallback to static data)
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [allCategories, setAllCategories] = useState<typeof categories>(categories);

  useEffect(() => {
    const loadFromStorage = () => {
      try {
        if (typeof window === 'undefined') return;
        const storedProds = localStorage.getItem(STORAGE_PRODUCTS_KEY);
        if (storedProds) {
          const parsed = JSON.parse(storedProds);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllProducts(parsed);
          } else {
            localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
            setAllProducts(products);
          }
        } else {
          localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
          setAllProducts(products);
        }

        const storedCats = localStorage.getItem(STORAGE_CATEGORIES_KEY);
        if (storedCats) {
          const parsedCats = JSON.parse(storedCats);
          if (Array.isArray(parsedCats) && parsedCats.length > 0) {
            const dynamicList = parsedCats.map((catName: string, idx: number) => {
              const existing = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
              if (existing) {
                return existing;
              }
              return {
                id: `cat-dyn-${idx}`,
                name: catName,
                slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: `Browse latest official ${catName} in Bangladesh`,
                icon: 'Smartphone',
                image: '/categories/smartphones.jpg',
                productCount: 0,
              };
            });
            setAllCategories(dynamicList);
          }
        }
      } catch (err) {
        console.error('Failed to load storage in homepage', err);
      }
    };

    loadFromStorage();

      const handleStorageChange = () => {
        loadFromStorage();
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('storage_update', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('storage_update', handleStorageChange);
      };
    }, []);

  const dynamicCategories = useMemo(() => {
    return allCategories.map((cat) => ({
      ...cat,
      productCount: allProducts.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length || cat.productCount,
    }));
  }, [allCategories, allProducts]);

  // Announcement bar dismiss state
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Active Category & Tab Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'hot' | 'top' | 'warranty' | 'budget'>('hot');

  // Hero carousel slide
  const [currentSlide, setCurrentSlide] = useState(0);

  // Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Compare state (up to 4 items)
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Flash Sale Countdown Timer (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Live countdown clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hero carousel auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Sync theme with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light-theme');
    }
  }, [isDark]);

  // Hero Slides Data
  const heroSlides = [
    {
      title: 'Galaxy S25 Ultra',
      tagline: 'GALAXY AI TITANIUM FLAGSHIP',
      description:
        'Powered by Snapdragon 8 Elite, 200MP Quad-Tele Camera, and built-in S Pen. Official Samsung Bangladesh 1-Year Warranty.',
      price: 154999,
      originalPrice: 169999,
      badge: 'OFFICIAL BD DROP',
      badgeColor: 'bg-cyan-500 text-black',
      gradient: 'from-blue-600/40 via-cyan-500/20 to-transparent',
      specs: ['Snapdragon 8 Elite', '200MP Camera', '6.9" 120Hz LTPO', '5000mAh 45W'],
      productId: 'prod-001',
    },
    {
      title: 'MacBook Air M3',
      tagline: 'LEAN. MEAN. M3 MACHINE.',
      description:
        'Strikingly thin with up to 18 hours of battery life. Powered by Apple M3 chip with Liquid Retina display and MagSafe 3.',
      price: 174999,
      originalPrice: 174999,
      badge: 'PRO WORKFLOW',
      badgeColor: 'bg-blue-600 text-white',
      gradient: 'from-indigo-600/40 via-blue-500/20 to-transparent',
      specs: ['Apple M3 Silicon', '18h Battery', '13.6" Liquid Retina', '1.24 kg'],
      productId: 'prod-003',
    },
    {
      title: 'Sony PS5 Slim Digital',
      tagline: 'NEXT-GEN GAMING UNLEASHED',
      description:
        'Ultra-high speed 1TB SSD, 4K 120Hz ray-tracing graphics, Tempest 3D Audio, and DualSense haptic feedback.',
      price: 52999,
      originalPrice: 52999,
      badge: 'IN STOCK DHAKA',
      badgeColor: 'bg-emerald-500 text-black',
      gradient: 'from-rose-600/40 via-orange-500/20 to-transparent',
      specs: ['Custom 1TB SSD', 'Ray Tracing 4K', 'DualSense Haptics', 'Tempest 3D'],
      productId: 'prod-011',
    },
  ];

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to Cart!`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'HUNTER2026') {
      setCouponDiscount(1000);
      setCouponApplied(true);
      showToast('Promo code HUNTER2026 applied: ৳1,000 OFF!');
    } else if (code === 'DHAKAFREE') {
      setCouponDiscount(70);
      setCouponApplied(true);
      showToast('Promo code DHAKAFREE applied: Free Dhaka Delivery!');
    } else {
      showToast('Invalid voucher code. Try HUNTER2026');
    }
  };

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      showToast('Removed from Wishlist');
    } else {
      setWishlist((prev) => [...prev, productId]);
      showToast('Added to Wishlist!');
    }
  };

  // Compare operations (max 4 items)
  const toggleCompare = (product: Product) => {
    if (compareList.some((item) => item.id === product.id)) {
      setCompareList((prev) => prev.filter((item) => item.id !== product.id));
      showToast('Removed from comparison');
    } else {
      if (compareList.length >= 4) {
        showToast('You can compare up to 4 items at a time');
        return;
      }
      setCompareList((prev) => [...prev, product]);
      showToast(`Added ${product.name} to compare tray (${compareList.length + 1}/4)`);
    }
  };

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)))
    );
  }, [searchQuery, allProducts]);

  // Curated Feeds filtering
  const curatedProducts = useMemo(() => {
    let list = [...allProducts];

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Tab filter
    switch (activeTab) {
      case 'hot':
        return list.filter((p) => p.isFeatured || p.isNew || Boolean(p.badge) || !p.id.match(/^prod-0\d\d$/));
      case 'top':
        return [...list].sort((a, b) => b.rating - a.rating);
      case 'warranty':
        return list.filter((p) => p.warranty.includes('Official') || p.warranty.includes('Bangladesh'));
      case 'budget':
        return list.filter((p) => p.price <= 25000);
      default:
        return list;
    }
  }, [selectedCategory, activeTab, allProducts]);

  // Flash Sale products
  const flashSaleProducts = useMemo(() => {
    return allProducts.filter((p) => p.isFlashSale);
  }, [allProducts]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} transition-colors duration-300 flex flex-col font-sans`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-white shadow-2xl backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. TOP ANNOUNCEMENT TICKER ─────────────────────────────────────────── */}
      {showAnnouncement && (
        <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700 text-white text-xs py-2 px-4 flex items-center justify-between font-medium tracking-wide shadow-md">
          <div className="flex-1 flex items-center justify-center gap-6 overflow-hidden whitespace-nowrap">
            <span className="flex items-center gap-1.5 font-bold">
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
              FLASH SALE LIVE: Up to 40% OFF on Flagships!
            </span>
            <span className="hidden md:inline-block opacity-80">|</span>
            <span className="hidden md:flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-cyan-200" />
              Express 24h Delivery inside Dhaka | Voucher: <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold">HUNTER2026</code> (৳1,000 OFF)
            </span>
            <span className="hidden lg:inline-block opacity-80">|</span>
            <span className="hidden lg:flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-cyan-200" />
              0% EMI on All Major Bangladeshi Cards
            </span>
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors ml-3"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── 2. GLOBAL NAVIGATION & HEADER ──────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 border-b ${isDark ? 'bg-[#090D16]/85 border-slate-800/80' : 'bg-white/85 border-slate-200/80'} backdrop-blur-xl transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  TechHunter
                </span>
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                  BD
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold -mt-0.5">
                Next-Gen Gadget Hub
              </span>
            </div>
          </Link>

          {/* Instant Live Search Bar */}
          <div className="relative flex-1 max-w-xl hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search iPhone 16, S25 Ultra, RTX 4070, AirPods, PS5..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className={`w-full pl-10 pr-10 py-2.5 rounded-full text-sm font-medium transition-all outline-none ${isDark
                    ? 'bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                    : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Predictive Live Search Dropdown */}
            {isSearchFocused && searchQuery && (
              <div
                className={`absolute left-0 right-0 mt-2 rounded-2xl shadow-2xl border p-3 z-50 max-h-96 overflow-y-auto ${isDark ? 'bg-slate-900/95 border-slate-700 backdrop-blur-xl' : 'bg-white border-slate-200'
                  }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 flex justify-between items-center">
                  <span>Search Results ({searchResults.length})</span>
                  <button onClick={() => setIsSearchFocused(false)} className="hover:text-cyan-400 text-xs">Close</button>
                </div>
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-800/40">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setQuickViewProduct(item);
                          setIsSearchFocused(false);
                        }}
                        className="p-2.5 hover:bg-slate-800/40 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-black text-cyan-400 text-xs border border-slate-700 overflow-hidden flex-shrink-0">
                              {getProductImage(item) ? (
                                <img
                                  src={getProductImage(item)!}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                item.brand[0]
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                              <span className="text-[11px] text-slate-400">{item.category} • {item.warranty}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-sm font-bold text-cyan-400">{formatPrice(item.price)}</span>
                            {item.discount > 0 && (
                              <span className="block text-[10px] text-rose-400 font-bold">Save {item.discount}%</span>
                            )}
                          </div>
                        </div>
                    ))}
                      </div>
                    ) : (
                    <div className="text-center py-6 text-sm text-slate-400">
                      No gadgets found matching &quot;{searchQuery}&quot;
                    </div>
                )}
                  </div>
                )}
              </div>

          {/* Quick Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Currency Pill */}
              <div className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border ${isDark ? 'bg-slate-800/80 border-slate-700 text-cyan-400' : 'bg-slate-100 border-slate-300 text-blue-600'}`}>
                <span>৳</span>
                <span>BDT</span>
              </div>

              {/* Dark / Light Mode Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2.5 rounded-xl border transition-all ${isDark
                    ? 'bg-slate-900 border-slate-700 text-amber-300 hover:border-amber-400/50'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-blue-500'
                  }`}
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Compare Tray Icon */}
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className={`relative p-2.5 rounded-xl border transition-all ${isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-500'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:border-blue-500'
                  }`}
                title="Compare Gadgets"
              >
                <GitCompare className="w-4 h-4" />
                {compareList.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-[11px] rounded-full flex items-center justify-center shadow-lg">
                    {compareList.length}
                  </span>
                )}
              </button>

              {/* Wishlist Icon */}
              <button
                onClick={() => showToast(`You have ${wishlist.length} item(s) in your Wishlist`)}
                className={`relative p-2.5 rounded-xl border transition-all ${isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-rose-500'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:border-rose-500'
                  }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white font-black text-[11px] rounded-full flex items-center justify-center shadow-lg">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Mini-Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all group"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center border-2 border-slate-900">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-mono font-bold text-xs">
                  {cartSubtotal > 0 ? formatPrice(cartSubtotal) : 'Cart'}
                </span>
              </button>
            </div>
          </div>

          {/* Category Navigation Bar */}
          <div className={`border-t ${isDark ? 'border-slate-800/60 bg-slate-900/40' : 'border-slate-200 bg-slate-50/60'} overflow-x-auto`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 min-w-max">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${selectedCategory === 'All'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                All Gadgets
              </button>
              {dynamicCategories.map((cat) => {
                const IconComp = categoryIconMap[cat.name] || Smartphone;
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                        : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
      </header>

      {/* ─── 3. HERO CAROUSEL SECTION ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-4 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-12 shadow-2xl">
            {/* Ambient Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].gradient} opacity-40 pointer-events-none transition-all duration-1000`} />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Copy & CTAs */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${heroSlides[currentSlide].badgeColor}`}>
                    {heroSlides[currentSlide].badge}
                  </span>
                  <span className="text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase">
                    {heroSlides[currentSlide].tagline}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  {heroSlides[currentSlide].title}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                  {heroSlides[currentSlide].description}
                </p>

                {/* Spec Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {heroSlides[currentSlide].specs.map((spec, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-cyan-300 font-semibold"
                    >
                      {spec}
                    </div>
                  ))}
                </div>

                {/* Pricing & CTAs */}
                <div className="flex flex-wrap items-center gap-5 pt-4">
                  <div>
                    <span className="text-xs uppercase text-slate-400 block font-bold">Special TechHunter Price</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-black text-cyan-400 tracking-tight">
                        {formatPrice(heroSlides[currentSlide].price)}
                      </span>
                      {heroSlides[currentSlide].originalPrice > heroSlides[currentSlide].price && (
                        <span className="text-sm line-through text-slate-500 font-semibold">
                          {formatPrice(heroSlides[currentSlide].originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const targetProd = products.find((p) => p.id === heroSlides[currentSlide].productId);
                        if (targetProd) addToCart(targetProd);
                      }}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Instant Order
                    </button>
                    <button
                      onClick={() => {
                        const targetProd = products.find((p) => p.id === heroSlides[currentSlide].productId);
                        if (targetProd) setQuickViewProduct(targetProd);
                      }}
                      className="px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-bold text-sm hover:border-cyan-400 hover:text-white transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Blueprint
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Showcase Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm aspect-square rounded-3xl p-6 flex flex-col justify-between border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl backdrop-blur-md group">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-400 text-lg">
                      TH
                    </div>
                    <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                      FLAGSHIP TIER
                    </span>
                  </div>

                  <div className="my-auto text-center py-6">
                    <div className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-cyan-500/40 shadow-inner group-hover:scale-110 transition-transform">
                      <Cpu className="w-20 h-20 text-cyan-400 animate-pulse" />
                    </div>
                    <h3 className="mt-4 text-xl font-black text-white">{heroSlides[currentSlide].title}</h3>
                    <p className="text-xs text-slate-400 mt-1">Official Bangladesh Spec with IMEI Registered</p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
                    <span>100% Genuine</span>
                    <span className="text-emerald-400 font-bold">● Ready for Dispatch</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1.5 px-2">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all ${currentSlide === i ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700'
                      }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. LIVE FLASH SALE BLOCK ─────────────────────────────────────────── */}
      <section className="py-8 bg-gradient-to-b from-transparent via-rose-950/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Flash Sale Header with Live Timer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-950/80 border border-rose-500/30 mb-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Flame className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight text-white">DHAKA MIDNIGHT FLASH SALE</h2>
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    LIMITED
                  </span>
                </div>
                <p className="text-xs text-slate-400">Exclusive discounts on verified flagship devices</p>
              </div>
            </div>

            {/* Countdown Boxes */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mr-1">
                ENDS IN:
              </span>
              <div className="flex gap-1.5 font-mono">
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-rose-500/40 text-center min-w-[36px]">
                  <span className="text-base font-black text-rose-400">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[8px] text-slate-400 font-bold">HRS</span>
                </div>
                <span className="text-rose-400 font-bold self-center">:</span>
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-rose-500/40 text-center min-w-[36px]">
                  <span className="text-base font-black text-rose-400">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[8px] text-slate-400 font-bold">MIN</span>
                </div>
                <span className="text-rose-400 font-bold self-center">:</span>
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-rose-500/40 text-center min-w-[36px]">
                  <span className="text-base font-black text-rose-400">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[8px] text-slate-400 font-bold">SEC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flash Sale Product Cards Carousel / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {flashSaleProducts.slice(0, 4).map((product) => {
              const stockClaimedPercent = Math.min(85, Math.max(30, 100 - product.stockCount * 2));
              return (
                <div
                  key={product.id}
                  className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-lg ${isDark ? 'bg-slate-900/90 border-slate-800 hover:border-rose-500/50' : 'bg-white border-slate-200 hover:border-rose-400'
                    }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {product.discount > 0 ? `SAVE ${product.discount}%` : 'HOT DEAL'}
                        </span>
                        {product.badge && (
                          <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Add to Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div
                      onClick={() => setQuickViewProduct(product)}
                      className="w-full aspect-[4/3] rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
                    >
                        {(() => {
                          const imgSrc = getProductImage(product);
                          return imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-2">
                              <Cpu className="w-12 h-12 text-slate-600 group-hover:text-cyan-400 transition-colors group-hover:scale-110" />
                              <span className="text-[11px] font-mono font-bold text-slate-400 mt-2 text-center line-clamp-1">
                                {product.brand} • {product.category}
                              </span>
                            </div>
                          );
                        })()}
                        <span className="absolute bottom-2 text-[9px] font-bold text-cyan-400/80 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                          Click for Specs
                        </span>
                    </div>

                    {/* Product Name & Brand */}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{product.brand}</span>
                    <h3
                      onClick={() => setQuickViewProduct(product)}
                      className="text-sm font-bold line-clamp-1 cursor-pointer hover:text-cyan-400 transition-colors mt-0.5"
                    >
                      {product.name}
                    </h3>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-black text-rose-400">{formatPrice(product.price)}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs line-through text-slate-500">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>

                    {/* Stock Meter */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                        <span className="text-rose-400">Only {product.stockCount} Left!</span>
                        <span className="text-slate-400">{stockClaimedPercent}% Claimed</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${stockClaimedPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/60">
                    <button
                      onClick={() => addToCart(product)}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add Cart
                    </button>
                    <button
                      onClick={() => toggleCompare(product)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${compareList.some((item) => item.id === product.id)
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-400'
                        }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      Compare
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. FEATURED CATEGORY MATRIX ────────────────────────────────────────── */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <span>Featured Gadget Categories</span>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  VERIFIED ECOSYSTEM
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Browse genuine consumer tech with direct brand warranty</p>
            </div>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
            {dynamicCategories.map((cat) => {
              const IconComp = categoryIconMap[cat.name] || Smartphone;
              const isSelected = selectedCategory === cat.name;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition-all hover:scale-105 flex flex-col items-center justify-between gap-3 shadow-md ${isSelected
                      ? 'bg-gradient-to-b from-blue-900/40 to-cyan-900/30 border-cyan-400 shadow-cyan-500/20'
                      : isDark
                        ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-blue-400'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-500 text-black font-bold' : isDark ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-blue-600'
                    }`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold line-clamp-1">{cat.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{cat.productCount} Items</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 6. CURATED FEEDS & PRODUCT GRID (TABBED) ─────────────────────────── */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Feed Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight">Curated Gadget Showcase</h2>
                <span className="text-xs text-slate-400">({curatedProducts.length} items)</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Category: <strong className="text-cyan-400">{selectedCategory}</strong> • Guaranteed Genuine Products
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab('hot')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'hot' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Hot Drops
              </button>
              <button
                onClick={() => setActiveTab('top')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'top' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Top Rated
              </button>
              <button
                onClick={() => setActiveTab('warranty')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'warranty' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Official BD Warranty
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'budget' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Percent className="w-3.5 h-3.5 text-cyan-400" />
                Budget Bangers
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {curatedProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              const isCompared = compareList.some((item) => item.id === product.id);

              return (
                <div
                  key={product.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-lg group ${isDark
                      ? 'bg-slate-900/80 border-slate-800/80 hover:border-cyan-500/50'
                      : 'bg-white border-slate-200 hover:border-blue-400'
                    }`}
                >
                  <div>
                    {/* Badge header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {product.badge && (
                          <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            {product.badge}
                          </span>
                        )}
                        {product.isNew && (
                          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                            NEW
                          </span>
                        )}
                        {product.discount > 0 && (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                            -{product.discount}%
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    {/* Interactive Thumbnail */}
                    <div
                      onClick={() => setQuickViewProduct(product)}
                      className="w-full aspect-[4/3] rounded-xl bg-slate-950/70 border border-slate-800 mb-4 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group-hover:border-cyan-500/40 transition-colors"
                    >
                        {(() => {
                          const imgSrc = getProductImage(product);
                          return imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4">
                              <Cpu className="w-14 h-14 text-slate-600 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300" />
                              <span className="text-[10px] font-mono text-slate-400 mt-2 font-bold uppercase tracking-wider">
                                SKU: {product.sku}
                              </span>
                            </div>
                          );
                        })()}
                        <span className="absolute bottom-2 text-[10px] font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                          Quick Blueprint View
                        </span>
                    </div>

                    {/* Product Metadata */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                      <span className="font-bold text-cyan-400/90 uppercase tracking-wider">{product.brand}</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-xs">{product.rating}</span>
                        <span className="text-slate-500 text-[10px]">({product.reviewCount})</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => setQuickViewProduct(product)}
                      className="text-base font-bold line-clamp-1 cursor-pointer hover:text-cyan-400 transition-colors"
                    >
                      {product.name}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {product.shortDescription}
                    </p>

                    {/* Quick Specs Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {Object.entries(product.specs).slice(0, 2).map(([key, value], idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                        >
                          {key}: {value.split(',')[0]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-xl font-black text-cyan-400 tracking-tight">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs line-through text-slate-500 ml-2 font-semibold">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {product.inStock ? 'In Stock' : 'Pre-order'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => toggleCompare(product)}
                        className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${isCompared
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-cyan-400'
                          }`}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        {isCompared ? 'Compared' : 'Compare'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 7. CUSTOM PC BUILDER TEASER BANNER ───────────────────────────────── */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 sm:p-12 shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-widest mb-3">
                  <Cpu className="w-3.5 h-3.5" />
                  Virtual Rig Architect
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Build Your Dream Custom PC in Bangladesh
                </h2>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  Real-time AM5 & Intel LGA1700 socket compatibility verification, wattage calculation against 80+ Gold PSUs, and one-click quote generation with instant Dhaka home assembly.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={() => {
                      setSelectedCategory('PC Components');
                      showToast('Filtered PC Components catalog!');
                    }}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                  >
                    Explore Components
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Decorative Component Badges */}
              <div className="grid grid-cols-2 gap-3.5 w-full md:w-auto">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-center">
                  <span className="text-xs text-slate-400 font-mono block">PROCESSORS</span>
                  <span className="text-sm font-black text-cyan-400">Ryzen 9 & Intel i9</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-center">
                  <span className="text-xs text-slate-400 font-mono block">GRAPHICS CARDS</span>
                  <span className="text-sm font-black text-rose-400">RTX 4070 / 4090</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-center">
                  <span className="text-xs text-slate-400 font-mono block">FAST STORAGE</span>
                  <span className="text-sm font-black text-emerald-400">990 Pro 7450MB/s</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-center">
                  <span className="text-xs text-slate-400 font-mono block">ASSEMBLY SERVICE</span>
                  <span className="text-sm font-black text-amber-400">24h Express Cable-Mod</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. OFFICIAL BRAND PARTNERS PAVILION ───────────────────────────────── */}
      <section className="py-10 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase">Direct Importer & Partner</span>
            <h2 className="text-2xl font-black tracking-tight mt-1">Official Brand Pavilion</h2>
            <p className="text-xs text-slate-400 mt-1">All products backed by international and authorized local warranty</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {brands.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  setSearchQuery(b.name);
                  showToast(`Searching for ${b.name} products...`);
                }}
                className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 flex flex-col items-center justify-center gap-1.5 ${isDark ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-blue-500'
                  }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-xs text-cyan-400">
                  {b.name[0]}
                </div>
                <span className="text-xs font-bold">{b.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{b.productCount} models</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. BANGLADESH VALUE PROPOSITION BAR ──────────────────────────────── */}
      <section className="py-10 border-t border-b border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">100% Genuine Tech</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Strictly authenticated serial numbers with official brand warranty.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">7-Day Replacement</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Instant hardware defect swap policy for total peace of mind.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">24-48h Fast Delivery</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Same-day dispatch in Dhaka (৳70) & secure nationwide delivery (৳130).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">0% EMI & bKash Pay</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Flexible installments up to 36 months + bKash, Nagad & SSLCommerz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. STICKY BOTTOM COMPARE TRAY ───────────────────────────────────── */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-slate-950/95 border-t border-cyan-500/40 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <GitCompare className="w-4 h-4" />
                Comparison Tray ({compareList.length}/4)
              </span>
              <div className="flex items-center gap-2">
                {compareList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium"
                  >
                    <span className="max-w-[120px] truncate">{item.name}</span>
                    <button
                      onClick={() => toggleCompare(item)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCompareList([])}
                className="text-xs text-slate-400 hover:text-rose-400 font-bold px-2 py-1"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-lg hover:scale-105 transition-all flex items-center gap-1.5"
              >
                <GitCompare className="w-3.5 h-3.5" />
                Compare Side-by-Side
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 11. SIDE-BY-SIDE COMPARISON MODAL ─────────────────────────────────── */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-cyan-400" />
                  Technical Specification Comparison
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Side-by-side blueprint evaluation</p>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {compareList.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm">No items in comparison tray. Click &quot;Compare&quot; on any product card!</p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 font-mono font-bold text-slate-400 w-32">Metric</th>
                      {compareList.map((item) => (
                        <th key={item.id} className="p-3 font-bold min-w-[200px]">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-black text-white line-clamp-1">{item.name}</span>
                            <span className="text-cyan-400 font-mono font-bold text-base">{formatPrice(item.price)}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="mt-2 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr>
                      <td className="p-3 font-bold text-slate-400">Brand</td>
                      {compareList.map((item) => (
                        <td key={item.id} className="p-3 font-semibold text-slate-200">{item.brand}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-400">Category</td>
                      {compareList.map((item) => (
                        <td key={item.id} className="p-3 text-slate-300">{item.category}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-400">Warranty</td>
                      {compareList.map((item) => (
                        <td key={item.id} className="p-3 text-emerald-400">{item.warranty}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-400">Stock Status</td>
                      {compareList.map((item) => (
                        <td key={item.id} className="p-3 text-slate-300">
                          {item.inStock ? `In Stock (${item.stockCount} units)` : 'Out of Stock'}
                        </td>
                      ))}
                    </tr>
                    {/* Dynamic Specs Rows */}
                    {['Display', 'Processor', 'Battery', 'RAM', 'Storage', 'Weight'].map((key) => (
                      <tr key={key}>
                        <td className="p-3 font-bold text-slate-400">{key}</td>
                        {compareList.map((item) => (
                          <td key={item.id} className="p-3 text-slate-300">
                            {item.specs[key] || 'N/A'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 12. SLIDE-OUT MINI-CART DRAWER ────────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-black text-white">Your Tech Cart</h3>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      {cartItemCount} items
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Free Delivery Bar (threshold ৳5,000) */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  {cartSubtotal >= 5000 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> You unlocked FREE Dhaka Delivery!
                    </span>
                  ) : (
                    <div>
                      <span className="text-slate-300">
                        Add <strong className="text-cyan-400">{formatPrice(5000 - cartSubtotal)}</strong> more for FREE delivery
                      </span>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${Math.min(100, (cartSubtotal / 5000) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="mt-4 max-h-[45vh] overflow-y-auto divide-y divide-slate-800/80 pr-1">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <ShoppingCart className="w-12 h-12 mx-auto text-slate-700 mb-2" />
                      <p className="text-sm font-semibold">Your shopping cart is empty</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-3 px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="py-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-cyan-400 text-xs overflow-hidden flex-shrink-0">
                              {getProductImage(item.product) ? (
                                <img
                                  src={getProductImage(item.product)!}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                item.product.brand[0]
                              )}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white line-clamp-1">{item.product.name}</h4>
                              <span className="text-xs font-mono font-bold text-cyan-400">
                                {formatPrice(item.product.price)}
                              </span>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, -1)}
                                className="p-1 text-slate-400 hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-mono font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, 1)}
                                className="p-1 text-slate-400 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        ))
                  )}
                      </div>
              </div>

                {/* Cart Footer & Checkout */}
                {cart.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    {/* Voucher code input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Voucher (HUNTER2026)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs uppercase font-mono text-white outline-none focus:border-cyan-400"
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal</span>
                        <span>{formatPrice(cartSubtotal)}</span>
                      </div>
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-rose-400 font-bold">
                          <span>Voucher Discount</span>
                          <span>-{formatPrice(couponDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-400">
                        <span>Dhaka Delivery</span>
                        <span>{cartSubtotal >= 5000 ? 'FREE' : '৳70'}</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                        <span>Total (BDT)</span>
                        <span className="text-cyan-400">
                          {formatPrice(Math.max(0, cartSubtotal - couponDiscount + (cartSubtotal >= 5000 ? 0 : 70)))}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        showToast('Proceeding to Checkout with bKash / COD!');
                        setIsCartOpen(false);
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/20 hover:opacity-95 transition-all text-center"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}

          {/* ─── 13. QUICK VIEW BLUEPRINT MODAL ────────────────────────────────────── */}
          {quickViewProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    {quickViewProduct.brand} • {quickViewProduct.category}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {quickViewProduct.warranty}
                  </span>
                  {quickViewProduct.badge && (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {quickViewProduct.badge}
                    </span>
                  )}
                </div>

                {(() => {
                  const imgSrc = getProductImage(quickViewProduct);
                  return imgSrc ? (
                    <div className="w-full h-56 sm:h-72 rounded-2xl bg-slate-900/60 border border-slate-800 mb-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={quickViewProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null;
                })()}

                <h3 className="text-xl sm:text-2xl font-black text-white">{quickViewProduct.name}</h3>

                <div className="flex items-baseline gap-3 my-3">
                  <span className="text-2xl font-black text-cyan-400">{formatPrice(quickViewProduct.price)}</span>
                  {quickViewProduct.originalPrice > quickViewProduct.price && (
                    <span className="text-sm line-through text-slate-500">{formatPrice(quickViewProduct.originalPrice)}</span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  {quickViewProduct.description}
                </p>

                {/* Technical Blueprint Table */}
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 mb-6">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Hardware Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(quickViewProduct.specs).map(([key, val], idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-950/60 border border-slate-800 flex justify-between">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-slate-200 font-semibold text-right max-w-[140px] truncate">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-sm shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      toggleCompare(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-sm hover:border-cyan-400"
                  >
                    Add to Compare
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── 14. COMPREHENSIVE FOOTER ─────────────────────────────────────────── */}
          <footer className="mt-auto border-t border-slate-800 bg-[#060910] text-slate-400 text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Col 1: Brand Info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                      TechHunterBD
                    </span>
                    <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-cyan-500/30">
                      FLAGSHIP
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Bangladesh&apos;s leading consumer tech portal for genuine smartphones, high-end laptops, PC components, and gaming gear.
                  </p>
                  <div className="font-mono text-[11px] space-y-1 text-slate-300">
                    <p>📍 Gulshan-2, Dhaka 1212, Bangladesh</p>
                    <p>📞 Hotline: +880 1700-TECHBD (832423)</p>
                    <p>✉️ Support: support@techhunterbd.com</p>
                  </div>
                </div>

                {/* Col 2: Quick Links */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 tracking-wide">Customer Support</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Official Warranty Verification</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Track Courier Delivery (Steadfast/Pathao)</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">7-Day Return & Replacement Policy</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">0% EMI Terms & Card Partners</a></li>
                    <li><a href="#" className="hover:text-cyan-400 transition-colors">Store Pickup in Dhaka</a></li>
                  </ul>
                </div>

                {/* Col 3: Categories */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 tracking-wide">Top Gadget Drops</h4>
                  <ul className="space-y-2">
                    <li><a href="#" onClick={() => setSelectedCategory('Smartphones')} className="hover:text-cyan-400 transition-colors">Samsung Galaxy S25 Ultra</a></li>
                    <li><a href="#" onClick={() => setSelectedCategory('Smartphones')} className="hover:text-cyan-400 transition-colors">Apple iPhone 16 Pro Max</a></li>
                    <li><a href="#" onClick={() => setSelectedCategory('Laptops')} className="hover:text-cyan-400 transition-colors">Apple MacBook Air M3</a></li>
                    <li><a href="#" onClick={() => setSelectedCategory('Gaming')} className="hover:text-cyan-400 transition-colors">Sony PlayStation 5 Slim</a></li>
                    <li><a href="#" onClick={() => setSelectedCategory('PC Components')} className="hover:text-cyan-400 transition-colors">NVIDIA RTX 4070 Super GPU</a></li>
                  </ul>
                </div>

                {/* Col 4: Payments & Guarantee */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 tracking-wide">Supported Payment Gateways</h4>
                  <p className="text-xs text-slate-400 mb-3">
                    Direct merchant checkout with Instant bKash PIN, Nagad, Rocket, Credit/Debit cards & Cash on Delivery.
                  </p>
                  <div className="grid grid-cols-3 gap-2 font-mono font-bold text-[10px] text-center">
                    <span className="p-2 rounded bg-slate-900 border border-slate-800 text-rose-400">bKash</span>
                    <span className="p-2 rounded bg-slate-900 border border-slate-800 text-orange-400">Nagad</span>
                    <span className="p-2 rounded bg-slate-900 border border-slate-800 text-purple-400">Rocket</span>
                    <span className="p-2 rounded bg-slate-900 border border-slate-800 text-blue-400">Visa</span>
                    <span className="p-2 rounded bg-slate-900 border border-slate-800 text-amber-400">Mastercard</span>
                    <span className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400">COD</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                <p>© 2026 TechHunterBD Ltd. All rights reserved. Designed for Bangladesh Tech Enthusiasts.</p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  All Systems Operational | Dhaka Server CDN
                </p>
              </div>
            </div>
          </footer>
        </div>
      );
}
