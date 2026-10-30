'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Megaphone,
  Settings,
  Search,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  TrendingUp,
  AlertTriangle,
  Truck,
  Eye,
  Sun,
  Moon,
  Filter,
  ArrowLeft,
  DollarSign,
  Save,
  CheckCircle2,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  LogOut,
  KeyRound,
  Mail,
  UserPlus,
  BadgeAlert,
  Sliders,
} from 'lucide-react';

import { products as initialProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { brands } from '@/data/brands';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

// ─── AUTH & RBAC TYPES ────────────────────────────────────────────────────────
export type AdminRole = 'SUPER_ADMIN' | 'MARKETING_MANAGER' | 'MODERATOR';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  status: 'Active' | 'Inactive';
  lastActive: string;
  phone: string;
  avatarInitials: string;
}

// Initial Staff Registry with predefined demo accounts
const INITIAL_STAFF_ACCOUNTS: StaffUser[] = [
  {
    id: 'staff-01',
    name: 'Shahriar Kabir',
    email: 'admin@techhunterbd.com',
    password: 'admin123',
    role: 'SUPER_ADMIN',
    status: 'Active',
    lastActive: 'Just now (Active)',
    phone: '+880 1711-001122',
    avatarInitials: 'SK',
  },
  {
    id: 'staff-02',
    name: 'Samira Jahan',
    email: 'marketing@techhunterbd.com',
    password: 'market123',
    role: 'MARKETING_MANAGER',
    status: 'Active',
    lastActive: '12 mins ago',
    phone: '+880 1812-334455',
    avatarInitials: 'SJ',
  },
  {
    id: 'staff-03',
    name: 'Rakibul Islam',
    email: 'mod@techhunterbd.com',
    password: 'mod123',
    role: 'MODERATOR',
    status: 'Active',
    lastActive: '25 mins ago',
    phone: '+880 1913-778899',
    avatarInitials: 'RI',
  },
  {
    id: 'staff-04',
    name: 'Tanmoy Debnath',
    email: 'tanmoy.ops@techhunterbd.com',
    password: 'mod123',
    role: 'MODERATOR',
    status: 'Inactive',
    lastActive: '3 days ago',
    phone: '+880 1620-112233',
    avatarInitials: 'TD',
  },
];

// Navigation tabs
export type AdminTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'customers'
  | 'banners'
  | 'staff'
  | 'settings';

interface TabDefinition {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: AdminRole[];
  badge?: string;
}

// Orders State Definition
interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  district: string;
  addressType: 'Inside Dhaka' | 'Outside Dhaka';
  itemsSummary: string;
  totalAmount: number;
  paymentMethod: 'bKash' | 'COD' | 'Nagad' | 'Card';
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  courier: 'Pathao' | 'Steadfast' | 'RedX' | 'Self';
  trackingNumber: string;
  date: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export default function AdminDashboardPage() {
  // ─── AUTHENTICATION STATE ──────────────────────────────────────────────────
  const [staffAccounts, setStaffAccounts] = useState<StaffUser[]>(INITIAL_STAFF_ACCOUNTS);
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(INITIAL_STAFF_ACCOUNTS[0]); // Default to Super Admin
  
  // Login Gate state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Theme mode
  const [isDark, setIsDark] = useState(true);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tab definitions with strict RBAC permission mapping
  const ALL_TABS: TabDefinition[] = useMemo(
    () => [
      {
        id: 'overview',
        label: 'Overview & Metrics',
        icon: LayoutDashboard,
        allowedRoles: ['SUPER_ADMIN', 'MARKETING_MANAGER'],
      },
      {
        id: 'products',
        label: 'Products (CRUD)',
        icon: Package,
        allowedRoles: ['SUPER_ADMIN', 'MODERATOR'],
      },
      {
        id: 'orders',
        label: 'Orders & Courier',
        icon: ShoppingCart,
        allowedRoles: ['SUPER_ADMIN', 'MODERATOR'],
      },
      {
        id: 'customers',
        label: 'Customer Base',
        icon: Users,
        allowedRoles: ['SUPER_ADMIN', 'MARKETING_MANAGER'],
      },
      {
        id: 'banners',
        label: 'Banners & Flash Sale',
        icon: Megaphone,
        allowedRoles: ['SUPER_ADMIN', 'MARKETING_MANAGER'],
      },
      {
        id: 'staff',
        label: 'Staff Management',
        icon: ShieldCheck,
        allowedRoles: ['SUPER_ADMIN'],
      },
      {
        id: 'settings',
        label: 'Store Settings',
        icon: Settings,
        allowedRoles: ['SUPER_ADMIN'],
      },
    ],
    []
  );

  // Dynamically filter tabs based on current role
  const accessibleTabs = useMemo(() => {
    if (!currentUser) return [];
    return ALL_TABS.filter((tab) => tab.allowedRoles.includes(currentUser.role));
  }, [currentUser, ALL_TABS]);

  // Ensure activeTab is always one of the permitted tabs for the current role
  useEffect(() => {
    if (currentUser && accessibleTabs.length > 0) {
      const isAllowed = accessibleTabs.some((t) => t.id === activeTab);
      if (!isAllowed) {
        setActiveTab(accessibleTabs[0].id);
      }
    }
  }, [currentUser, accessibleTabs, activeTab]);

  // ─── LOGIN & LOGOUT HANDLERS ───────────────────────────────────────────────
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const user = staffAccounts.find(
      (u) =>
        u.email.toLowerCase().trim() === loginEmail.toLowerCase().trim() &&
        u.password === loginPassword.trim()
    );

    if (!user) {
      setLoginError('Invalid email or password. Please verify credentials or use demo quick-fill.');
      return;
    }

    if (user.status === 'Inactive') {
      setLoginError('This staff account has been revoked / deactivated. Contact Super Admin.');
      return;
    }

    setCurrentUser(user);
    showToast(`Welcome back, ${user.name} (${user.role.replace('_', ' ')})`);
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    const target = staffAccounts.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass
    );
    if (target) {
      if (target.status === 'Inactive') {
        setLoginError('This staff account has been deactivated.');
        return;
      }
      setLoginError(null);
      setCurrentUser(target);
      showToast(`Logged in as ${target.name} [${target.role.replace('_', ' ')}]`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError(null);
    showToast('Logged out of Admin Command Center.');
  };

  // ─── STAFF MANAGEMENT STATE (SUPER ADMIN ONLY) ─────────────────────────────
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<AdminRole>('MODERATOR');
  const [newStaffPassword, setNewStaffPassword] = useState('pass123');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      showToast('Please provide Name and Email');
      return;
    }

    if (staffAccounts.some((s) => s.email.toLowerCase() === newStaffEmail.toLowerCase().trim())) {
      showToast('An account with this email already exists!');
      return;
    }

    const initials = newStaffName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const createdStaff: StaffUser = {
      id: `staff-${Date.now().toString().slice(-4)}`,
      name: newStaffName.trim(),
      email: newStaffEmail.toLowerCase().trim(),
      password: newStaffPassword.trim() || 'tech123',
      role: newStaffRole,
      status: 'Active',
      lastActive: 'Never logged in',
      phone: newStaffPhone.trim() || '+880 1700-000000',
      avatarInitials: initials || 'ST',
    };

    setStaffAccounts((prev) => [...prev, createdStaff]);
    setIsAddStaffModalOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPhone('');
    setNewStaffRole('MODERATOR');
    setNewStaffPassword('pass123');
    showToast(`Staff account created for ${createdStaff.name}`);
  };

  const handleToggleStaffStatus = (staffId: string) => {
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
          showToast(`${s.name} is now ${nextStatus}`);
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const handleChangeStaffRole = (staffId: string, nextRole: AdminRole) => {
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          showToast(`Updated role for ${s.name} to ${nextRole.replace('_', ' ')}`);
          return { ...s, role: nextRole };
        }
        return s;
      })
    );
  };

  const handleDeleteStaff = (staffId: string) => {
    if (staffId === currentUser?.id) {
      showToast('Cannot delete your own active session account!');
      return;
    }
    const target = staffAccounts.find((s) => s.id === staffId);
    setStaffAccounts((prev) => prev.filter((s) => s.id !== staffId));
    showToast(`Removed staff account: ${target?.name}`);
  };

  // ─── 1. PRODUCTS STATE & CRUD ──────────────────────────────────────────────
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Product Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Add/Edit Form State
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('Samsung');
  const [formCategory, setFormCategory] = useState('Smartphones');
  const [formPrice, setFormPrice] = useState<number>(10000);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(12000);
  const [formStock, setFormStock] = useState<number>(20);
  const [formWarranty, setFormWarranty] = useState('1 Year Official Bangladesh Warranty');
  const [formShortDesc, setFormShortDesc] = useState('');

  const openAddModal = () => {
    if (currentUser?.role === 'MODERATOR') {
      showToast('Permission Denied: Moderators cannot add new products.');
      return;
    }
    setFormName('');
    setFormBrand('Samsung');
    setFormCategory('Smartphones');
    setFormPrice(15000);
    setFormOriginalPrice(17000);
    setFormStock(25);
    setFormWarranty('1 Year Official Bangladesh Warranty');
    setFormShortDesc('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormBrand(product.brand);
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormOriginalPrice(product.originalPrice);
    setFormStock(product.stockCount);
    setFormWarranty(product.warranty);
    setFormShortDesc(product.shortDescription);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter a product title');
      return;
    }

    if (editingProduct) {
      // Moderator restriction: Stock only
      const isMod = currentUser?.role === 'MODERATOR';

      setProductList((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                // If moderator, preserve original price/name/category, only update stock
                name: isMod ? p.name : formName,
                brand: isMod ? p.brand : formBrand,
                category: isMod ? p.category : formCategory,
                price: isMod ? p.price : Number(formPrice),
                originalPrice: isMod ? p.originalPrice : Number(formOriginalPrice),
                stockCount: Number(formStock),
                inStock: Number(formStock) > 0,
                warranty: isMod ? p.warranty : formWarranty,
                shortDescription: isMod ? p.shortDescription : formShortDesc,
              }
            : p
        )
      );
      showToast(
        isMod
          ? `Stock updated for "${editingProduct.name}" (${formStock} units)`
          : `Updated "${formName}" successfully!`
      );
      setEditingProduct(null);
    } else {
      // Create new (Super Admin only)
      if (currentUser?.role === 'MODERATOR') {
        showToast('Permission Denied: Only Super Admin can deploy new gadgets.');
        return;
      }
      const newId = `prod-${Date.now().toString().slice(-4)}`;
      const newProduct: Product = {
        id: newId,
        slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: formName,
        brand: formBrand,
        category: formCategory,
        subcategory: 'Flagship',
        images: ['/products/placeholder.jpg'],
        price: Number(formPrice),
        originalPrice: Number(formOriginalPrice),
        discount: Math.round(((formOriginalPrice - formPrice) / formOriginalPrice) * 100),
        inStock: Number(formStock) > 0,
        stockCount: Number(formStock),
        isNew: true,
        isFeatured: false,
        isFlashSale: false,
        flashSaleEndsAt: null,
        rating: 5.0,
        reviewCount: 1,
        shortDescription: formShortDesc || `${formBrand} ${formName} with official warranty.`,
        description: `${formName} authentic device imported directly for Bangladesh market.`,
        specs: {
          Brand: formBrand,
          Category: formCategory,
          Warranty: formWarranty,
          Status: 'Brand New In Box',
        },
        variants: [],
        tags: [formBrand.toLowerCase(), formCategory.toLowerCase()],
        warranty: formWarranty,
        sku: `TH-${formBrand.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
      };
      setProductList([newProduct, ...productList]);
      showToast(`Added "${formName}" to catalog!`);
      setIsAddModalOpen(false);
    }
  };

  const confirmDeleteProduct = () => {
    if (currentUser?.role === 'MODERATOR') {
      showToast('Permission Denied: Moderators cannot delete products.');
      setDeletingProductId(null);
      return;
    }
    if (!deletingProductId) return;
    const target = productList.find((p) => p.id === deletingProductId);
    setProductList((prev) => prev.filter((p) => p.id !== deletingProductId));
    showToast(`Removed product "${target?.name || deletingProductId}"`);
    setDeletingProductId(null);
  };

  // Filtered Products Table
  const filteredProducts = useMemo(() => {
    return productList.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [productList, productSearch, productCategoryFilter]);

  // ─── 2. ORDERS STATE & MANAGEMENT ──────────────────────────────────────────
  const [orders, setOrders] = useState<AdminOrder[]>([
    {
      id: 'ord-101',
      orderNumber: 'TH-2026-9481',
      customerName: 'Tanvir Hossain',
      phone: '+880 1712-892341',
      district: 'Dhaka',
      addressType: 'Inside Dhaka',
      itemsSummary: 'Samsung Galaxy S25 Ultra (256GB)',
      totalAmount: 154999,
      paymentMethod: 'bKash',
      status: 'Processing',
      courier: 'Pathao',
      trackingNumber: 'PTH-DK-89231',
      date: '2026-10-30 19:42',
    },
    {
      id: 'ord-102',
      orderNumber: 'TH-2026-9482',
      customerName: 'Nafisa Anjum',
      phone: '+880 1845-667123',
      district: 'Chittagong',
      addressType: 'Outside Dhaka',
      itemsSummary: 'Sony WH-1000XM5 + Anker 737 Power Bank',
      totalAmount: 38998,
      paymentMethod: 'COD',
      status: 'Shipped',
      courier: 'Steadfast',
      trackingNumber: 'STF-CTG-44910',
      date: '2026-10-30 17:15',
    },
    {
      id: 'ord-103',
      orderNumber: 'TH-2026-9483',
      customerName: 'Shakil Ahmed',
      phone: '+880 1911-304958',
      district: 'Dhaka',
      addressType: 'Inside Dhaka',
      itemsSummary: 'Sony PS5 Slim Digital Edition',
      totalAmount: 52999,
      paymentMethod: 'bKash',
      status: 'Pending',
      courier: 'Pathao',
      trackingNumber: 'PENDING',
      date: '2026-10-30 21:05',
    },
    {
      id: 'ord-104',
      orderNumber: 'TH-2026-9484',
      customerName: 'Mahmudul Hasan',
      phone: '+880 1622-445566',
      district: 'Sylhet',
      addressType: 'Outside Dhaka',
      itemsSummary: 'Keychron K8 Pro Mechanical Keyboard',
      totalAmount: 12499,
      paymentMethod: 'Card',
      status: 'Delivered',
      courier: 'RedX',
      trackingNumber: 'RDX-SYL-1294',
      date: '2026-10-29 11:30',
    },
    {
      id: 'ord-105',
      orderNumber: 'TH-2026-9485',
      customerName: 'Imtiaz Rahman',
      phone: '+880 1733-998877',
      district: 'Rajshahi',
      addressType: 'Outside Dhaka',
      itemsSummary: 'AMD Ryzen 9 7950X + Corsair 32GB DDR5',
      totalAmount: 77998,
      paymentMethod: 'Nagad',
      status: 'Processing',
      courier: 'Steadfast',
      trackingNumber: 'STF-RAJ-5512',
      date: '2026-10-30 14:10',
    },
  ]);

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);

  const updateOrderStatus = (orderId: string, newStatus: AdminOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Order status updated to ${newStatus}`);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchQuery =
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.phone.includes(orderSearch);
      const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // ─── 3. STORE SETTINGS & BANNER CONTROLS ──────────────────────────────────
  const [announcementText, setAnnouncementText] = useState(
    'FLASH SALE LIVE: Up to 40% OFF on Flagships! Express 24h Delivery inside Dhaka'
  );
  const [voucherCode, setVoucherCode] = useState('HUNTER2026');
  const [voucherAmount, setVoucherAmount] = useState(1000);
  const [dhakaDeliveryFee, setDhakaDeliveryFee] = useState(70);
  const [outsideDhakaFee, setOutsideDhakaFee] = useState(130);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(5000);
  const [flashSaleActive, setFlashSaleActive] = useState(true);
  const [flashSaleHoursRemaining, setFlashSaleHoursRemaining] = useState(14);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === 'MARKETING_MANAGER' && activeTab === 'settings') {
      showToast('Permission Denied: Marketing Managers cannot alter delivery settings.');
      return;
    }
    showToast('Configuration applied and synced to TechHunterBD store cache!');
  };

  // ─── 4. CUSTOMER MOCK DATA ───────────────────────────────────────────────
  const [customers] = useState<Customer[]>([
    {
      id: 'cust-1',
      name: 'Tanvir Hossain',
      phone: '+880 1712-892341',
      email: 'tanvir.dev@gmail.com',
      city: 'Dhaka',
      ordersCount: 4,
      totalSpent: 312500,
      lastOrderDate: '2026-10-30',
    },
    {
      id: 'cust-2',
      name: 'Nafisa Anjum',
      phone: '+880 1845-667123',
      email: 'nafisa.anjum@yahoo.com',
      city: 'Chittagong',
      ordersCount: 2,
      totalSpent: 54997,
      lastOrderDate: '2026-10-30',
    },
    {
      id: 'cust-3',
      name: 'Shakil Ahmed',
      phone: '+880 1911-304958',
      email: 'shakil.gamer@outlook.com',
      city: 'Dhaka',
      ordersCount: 5,
      totalSpent: 219490,
      lastOrderDate: '2026-10-30',
    },
    {
      id: 'cust-4',
      name: 'Mahmudul Hasan',
      phone: '+880 1622-445566',
      email: 'm.hasan@techbd.org',
      city: 'Sylhet',
      ordersCount: 1,
      totalSpent: 12499,
      lastOrderDate: '2026-10-29',
    },
  ]);

  // Aggregate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const processingOrdersCount = orders.filter((o) => o.status === 'Processing').length;
  const lowStockProducts = productList.filter((p) => p.stockCount <= 10);

  // Status Chip Color Helper
  const getStatusBadge = (status: AdminOrder['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'Processing':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'Shipped':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  // Role Badge Styling Helper
  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          label: 'SUPER ADMIN',
          classes: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20',
          icon: ShieldAlert,
        };
      case 'MARKETING_MANAGER':
        return {
          label: 'MARKETING',
          classes: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20',
          icon: Megaphone,
        };
      case 'MODERATOR':
        return {
          label: 'MODERATOR',
          classes: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20',
          icon: ShieldCheck,
        };
    }
  };

  // ─── VIEW: LOGIN GATE (WHEN NOT LOGGED IN) ─────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Futuristic Background Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md z-10 space-y-6">
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center p-0.5 shadow-xl shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="text-left">
                <span className="font-extrabold text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
                  TechHunterBD
                </span>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  Security Gateway
                </span>
              </div>
            </Link>
            <h2 className="text-xl font-black text-white">Staff Command Portal</h2>
            <p className="text-xs text-slate-400">
              Role-Based Authentication & Cryptographic Access Control
            </p>
          </div>

          {/* Login Card */}
          <div className="p-7 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <BadgeAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  Staff Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. admin@techhunterbd.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  Access Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Authenticate & Enter Dashboard
              </button>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2.5 text-center">
                Instant Demo Access (Click to Test Role)
              </span>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@techhunterbd.com', 'admin123')}
                  className="w-full p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-purple-200 block">Super Admin</span>
                      <span className="text-[10px] font-mono text-slate-400">admin@techhunterbd.com</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                    Full Access
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('marketing@techhunterbd.com', 'market123')}
                  className="w-full p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-200 block">Marketing Manager</span>
                      <span className="text-[10px] font-mono text-slate-400">marketing@techhunterbd.com</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    Banners & Users
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('mod@techhunterbd.com', 'mod123')}
                  className="w-full p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-cyan-200 block">Moderator</span>
                      <span className="text-[10px] font-mono text-slate-400">mod@techhunterbd.com</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    Orders & Stock
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Back to store */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN ADMIN DASHBOARD VIEW (AUTHENTICATED) ──────────────────────────────
  const currentRoleBadge = getRoleBadge(currentUser.role);
  const CurrentRoleIcon = currentRoleBadge.icon;

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      } transition-colors duration-200 flex font-sans`}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500 text-white shadow-2xl backdrop-blur-md animate-bounce text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── SIDEBAR NAVIGATION WITH RBAC ──────────────────────────────────── */}
      <aside
        className={`w-64 border-r flex flex-col justify-between p-4 flex-shrink-0 ${
          isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-base bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  TechHunter
                </span>
                <span className="ml-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  PORTAL
                </span>
              </div>
            </Link>
          </div>

          {/* Active User Card & Role Switcher */}
          <div className="mb-5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-black text-black">
                {currentUser.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-xs text-white block truncate">{currentUser.name}</span>
                <span className="text-[10px] font-mono text-slate-400 block truncate">{currentUser.email}</span>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md border ${currentRoleBadge.classes}`}
              >
                <CurrentRoleIcon className="w-3 h-3" />
                {currentRoleBadge.label}
              </span>

              {/* Quick switch demo role */}
              <div className="relative group">
                <button
                  type="button"
                  title="Switch Active Account"
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                >
                  Switch Role
                </button>
                <div className="absolute left-0 bottom-full mb-1 w-48 hidden group-hover:block bg-slate-950 border border-slate-800 rounded-xl p-1.5 shadow-2xl z-50">
                  <span className="text-[9px] font-mono uppercase text-slate-500 px-2 py-1 block">
                    Fast Role Switching
                  </span>
                  {staffAccounts
                    .filter((s) => s.status === 'Active')
                    .map((staff) => (
                      <button
                        key={staff.id}
                        onClick={() => {
                          setCurrentUser(staff);
                          showToast(`Switched to ${staff.name} [${staff.role}]`);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-between ${
                          staff.id === currentUser.id
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <span className="truncate">{staff.name}</span>
                        <span className="text-[9px] font-mono opacity-70">
                          {staff.role === 'SUPER_ADMIN' ? 'Admin' : staff.role === 'MARKETING_MANAGER' ? 'Mktg' : 'Mod'}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Role-Filtered Navigation Tabs */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold px-3 py-1 block">
              Authorized Modules
            </span>

            {accessibleTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </div>

                  {tab.id === 'products' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {productList.length}
                    </span>
                  )}
                  {tab.id === 'orders' && pendingOrdersCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                      {pendingOrdersCount} new
                    </span>
                  )}
                  {tab.id === 'staff' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                      {staffAccounts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer Controls & Logout */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> View Live Store
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-400" />}
              {isDark ? 'Light Theme' : 'Dark Theme'}
            </span>
            <span className="text-[10px] font-mono text-slate-500">{isDark ? 'Dark' : 'Light'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors border border-rose-500/20 mt-1"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </span>
            <span className="text-[10px] font-mono text-rose-400/70">Exit</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight capitalize text-white">
                {activeTab === 'overview' && 'Executive Metrics & Sales Overview'}
                {activeTab === 'products' && 'Product Inventory Catalog & Stock'}
                {activeTab === 'orders' && 'Order Processing & Courier Dispatch'}
                {activeTab === 'customers' && 'Registered Bangladeshi Customers'}
                {activeTab === 'banners' && 'Promotion Banners & Flash Sale Engine'}
                {activeTab === 'staff' && 'Staff Directory & RBAC Security Access'}
                {activeTab === 'settings' && 'Store Configuration & Delivery Rules'}
              </h1>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${currentRoleBadge.classes}`}
              >
                {currentRoleBadge.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              TechHunterBD Operations Command Center • Dhaka Server Hub • Logged in as {currentUser.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              RBAC Guard: Enforced
            </span>
          </div>
        </div>

        {/* ─── TAB 1: OVERVIEW & METRICS ────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Sales: Hidden if user is Moderator; Visible for Super Admin and Marketing Manager */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Sales</span>
                  {currentUser.role === 'MODERATOR' ? (
                    <span className="text-lg font-mono font-bold text-slate-500 tracking-tight mt-1 block">
                      ••••••• [Restricted]
                    </span>
                  ) : (
                    <span className="text-2xl font-black text-cyan-400 tracking-tight mt-1 block">
                      {formatPrice(totalRevenue)}
                    </span>
                  )}
                  <span className="text-[10px] text-emerald-400 font-mono font-bold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +18.4% this week
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
                  <span className="text-2xl font-black text-white tracking-tight mt-1 block">
                    {orders.length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {orders.filter((o) => o.status === 'Delivered').length} successfully delivered
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Courier</span>
                  <span className="text-2xl font-black text-amber-400 tracking-tight mt-1 block">
                    {pendingOrdersCount + processingOrdersCount}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                    {pendingOrdersCount} awaiting confirmation
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Truck className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Low Stock Alerts</span>
                  <span className="text-2xl font-black text-rose-400 tracking-tight mt-1 block">
                    {lowStockProducts.length}
                  </span>
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    &le; 10 units remaining
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders List (2 Cols) */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-cyan-400" />
                    Recent Customer Orders
                  </h3>
                  {currentUser.role !== 'MARKETING_MANAGER' && (
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-cyan-400 hover:underline font-bold"
                    >
                      View All Orders &rarr;
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-800/80 mt-2">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          {order.customerName} • {order.district} ({order.paymentMethod})
                        </p>
                      </div>
                      <div className="text-right">
                        {currentUser.role === 'MODERATOR' ? (
                          <span className="font-mono text-slate-500 text-[11px] block">[Confidential]</span>
                        ) : (
                          <span className="font-mono font-bold text-cyan-400 block">{formatPrice(order.totalAmount)}</span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">{order.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Watchlist (1 Col) */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Critical Stock Watchlist
                  </h3>
                  {currentUser.role !== 'MARKETING_MANAGER' && (
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs text-rose-400 hover:underline font-bold"
                    >
                      Restock &rarr;
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-800/80 mt-2">
                  {lowStockProducts.slice(0, 4).map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                      <div className="max-w-[170px]">
                        <span className="font-bold text-white line-clamp-1">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.brand} • {p.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-rose-400 block">{p.stockCount} left</span>
                        {currentUser.role !== 'MARKETING_MANAGER' && (
                          <button
                            onClick={() => openEditModal(p)}
                            className="text-[10px] text-cyan-400 hover:underline font-bold"
                          >
                            Update
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: PRODUCT MANAGEMENT (CRUD & STOCK) ────────────────────── */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Role Advisory Banner for Moderator */}
            {currentUser.role === 'MODERATOR' && (
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>
                    <strong>Moderator Permissions Active:</strong> You can view inventory and adjust Stock Level numbers. Pricing and deletion are locked to Super Admin.
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 font-bold">
                  STOCK EDIT ONLY
                </span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name, brand, SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-400"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Product Button (Only Super Admin can deploy new gadgets) */}
              {currentUser.role === 'SUPER_ADMIN' ? (
                <button
                  onClick={openAddModal}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-lg hover:scale-105 transition-all flex items-center gap-2 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add New Gadget
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
                  <Lock className="w-3.5 h-3.5" /> Add Gadget Locked
                </div>
              )}
            </div>

            {/* Products Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-slate-400">
                      <th className="p-3.5">SKU & Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Selling Price</th>
                      <th className="p-3.5">MSRP</th>
                      <th className="p-3.5">Stock Level</th>
                      <th className="p-3.5">Warranty</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-cyan-400 text-xs flex-shrink-0">
                              {product.brand[0]}
                            </div>
                            <div>
                              <span className="font-bold text-white block line-clamp-1">{product.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">SKU: {product.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-300">{product.category}</td>
                        <td className="p-3.5 font-mono font-bold text-cyan-400">{formatPrice(product.price)}</td>
                        <td className="p-3.5 font-mono text-slate-500 line-through">{formatPrice(product.originalPrice)}</td>
                        <td className="p-3.5">
                          <span
                            className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-full ${
                              product.stockCount <= 5
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : product.stockCount <= 15
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {product.stockCount} units
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px] max-w-[150px] truncate">{product.warranty}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                              title={currentUser.role === 'MODERATOR' ? 'Update Stock Level' : 'Edit Product'}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {currentUser.role === 'SUPER_ADMIN' && (
                              <button
                                onClick={() => setDeletingProductId(product.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: ORDER MANAGEMENT ──────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by order ID, customer, phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-400"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400">
                Displaying <strong>{filteredOrders.length}</strong> customer orders
              </span>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-slate-400">
                      <th className="p-3.5">Order ID & Date</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Destination</th>
                      <th className="p-3.5">Purchased Gadget</th>
                      <th className="p-3.5">Total & Method</th>
                      <th className="p-3.5">Courier & Tracking</th>
                      <th className="p-3.5">Order Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-white block">{order.orderNumber}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{order.date}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{order.customerName}</span>
                          <span className="text-[10px] font-mono text-cyan-400">{order.phone}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-200 block">{order.district}</span>
                          <span className="text-[10px] text-slate-400">{order.addressType}</span>
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-[200px] truncate">{order.itemsSummary}</td>
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-cyan-400 block">{formatPrice(order.totalAmount)}</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">{order.paymentMethod}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-white block">{order.courier}</span>
                          <span className="text-[10px] font-mono text-slate-400">{order.trackingNumber}</span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as AdminOrder['status'])}
                            className={`text-[11px] font-bold px-2 py-1 rounded-lg outline-none cursor-pointer ${getStatusBadge(order.status)}`}
                          >
                            <option value="Pending" className="bg-slate-900 text-amber-400">Pending</option>
                            <option value="Processing" className="bg-slate-900 text-blue-400">Processing</option>
                            <option value="Shipped" className="bg-slate-900 text-purple-400">Shipped</option>
                            <option value="Delivered" className="bg-slate-900 text-emerald-400">Delivered</option>
                            <option value="Cancelled" className="bg-slate-900 text-rose-400">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                            title="View order summary"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: CUSTOMERS ─────────────────────────────────────────────── */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="font-bold text-sm text-white mb-1">Customer Relationship Registry</h3>
              <p className="text-xs text-slate-400">Profile directory of verified Bangladeshi tech buyers</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-slate-400">
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">Phone Number</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Division / City</th>
                    <th className="p-3.5">Completed Orders</th>
                    <th className="p-3.5">Lifetime Value (BDT)</th>
                    <th className="p-3.5 text-right">Last Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-850/50">
                      <td className="p-3.5 font-bold text-white">{c.name}</td>
                      <td className="p-3.5 font-mono text-cyan-400">{c.phone}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{c.email}</td>
                      <td className="p-3.5 text-slate-300">{c.city}</td>
                      <td className="p-3.5 font-mono font-bold text-white">{c.ordersCount} orders</td>
                      <td className="p-3.5 font-mono font-black text-cyan-400">{formatPrice(c.totalSpent)}</td>
                      <td className="p-3.5 text-right font-mono text-slate-500">{c.lastOrderDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB 5: BANNERS & FLASH SALE ───────────────────────────────────── */}
        {activeTab === 'banners' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Megaphone className="w-4 h-4 text-cyan-400" />
                Top Announcement Ticker Controls
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Announcement Running Text
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Active Voucher Code
                  </label>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-cyan-400 outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Voucher Discount Amount (BDT ৳)
                  </label>
                  <input
                    type="number"
                    value={voucherAmount}
                    onChange={(e) => setVoucherAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Flash Sale Controls */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <TrendingUp className="w-4 h-4 text-rose-400" />
                Live Midnight Flash Sale Engine
              </h3>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white block">Flash Sale Active Status</span>
                  <span className="text-[11px] text-slate-400">Controls urgency clock and stock meters on homepage</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFlashSaleActive(!flashSaleActive)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    flashSaleActive
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {flashSaleActive ? 'ACTIVE LIVE' : 'DISABLED'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Countdown Duration (Hours Remaining)
                </label>
                <input
                  type="number"
                  value={flashSaleHoursRemaining}
                  onChange={(e) => setFlashSaleHoursRemaining(Number(e.target.value))}
                  className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-rose-400 outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Banner & Flash Settings
            </button>
          </form>
        )}

        {/* ─── TAB 6: STAFF MANAGEMENT (SUPER ADMIN ONLY) ───────────────────── */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Staff Accounts & Cryptographic RBAC Directory
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage operations team permissions, active logins, and security clearance roles.
                </p>
              </div>

              <button
                onClick={() => setIsAddStaffModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add New Staff
              </button>
            </div>

            {/* Staff Directory Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-slate-400">
                    <th className="p-3.5">Staff Member</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Phone Number</th>
                    <th className="p-3.5">Last Active</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {staffAccounts.map((staff) => {
                    const badge = getRoleBadge(staff.role);
                    const isSelf = staff.id === currentUser.id;

                    return (
                      <tr key={staff.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                              {staff.avatarInitials}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">{staff.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{staff.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <select
                            disabled={isSelf}
                            value={staff.role}
                            onChange={(e) => handleChangeStaffRole(staff.id, e.target.value as AdminRole)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-md border outline-none cursor-pointer ${badge.classes} ${
                              isSelf ? 'opacity-80 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="SUPER_ADMIN" className="bg-slate-900 text-purple-300">Super Admin</option>
                            <option value="MARKETING_MANAGER" className="bg-slate-900 text-amber-300">Marketing Manager</option>
                            <option value="MODERATOR" className="bg-slate-900 text-cyan-300">Moderator</option>
                          </select>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              staff.status === 'Active'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                staff.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                            {staff.status}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono text-cyan-400">{staff.phone}</td>
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">{staff.lastActive}</td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={isSelf}
                              onClick={() => handleToggleStaffStatus(staff.id)}
                              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                staff.status === 'Active'
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              } ${isSelf ? 'opacity-40 cursor-not-allowed' : ''}`}
                              title={staff.status === 'Active' ? 'Revoke Access' : 'Reactivate Access'}
                            >
                              {staff.status === 'Active' ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteStaff(staff.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                                title="Remove staff account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB 7: SETTINGS ──────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Truck className="w-4 h-4 text-cyan-400" />
                Bangladesh Shipping & Delivery Rates (Super Admin Guarded)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Inside Dhaka Delivery (BDT ৳)
                  </label>
                  <input
                    type="number"
                    value={dhakaDeliveryFee}
                    onChange={(e) => setDhakaDeliveryFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default: ৳70 (24h Express)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Outside Dhaka Delivery (BDT ৳)
                  </label>
                  <input
                    type="number"
                    value={outsideDhakaFee}
                    onChange={(e) => setOutsideDhakaFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default: ৳130 (48-72h Courier)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Free Delivery Threshold (BDT ৳)
                  </label>
                  <input
                    type="number"
                    value={freeDeliveryThreshold}
                    onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Orders above this get free shipping</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
            >
              <Save className="w-4 h-4" />
              Apply Delivery Rules
            </button>
          </form>
        )}
      </main>

      {/* ─── MODAL: ADD NEW STAFF ACCOUNT ────────────────────────────────────── */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-purple-500/40 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setIsAddStaffModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-1">Provision New Staff Access</h3>
            <p className="text-xs text-slate-400 mb-6">
              Create operator profile with cryptographic credentials and specific role boundary.
            </p>

            <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asif Mahmud"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Staff Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. asif@techhunterbd.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Assign Role</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as AdminRole)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-purple-300 font-bold outline-none focus:border-purple-400"
                  >
                    <option value="MODERATOR">Moderator</option>
                    <option value="MARKETING_MANAGER">Marketing Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+880 1711-..."
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Temporary Initial Password</label>
                <input
                  type="text"
                  required
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-cyan-400 font-mono outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg hover:scale-105 transition-all"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT PRODUCT ──────────────────────────────────────── */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProduct(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-1">
              {editingProduct
                ? currentUser.role === 'MODERATOR'
                  ? 'Update Product Stock Level'
                  : 'Edit Gadget Specifications'
                : 'Deploy New Gadget to Catalog'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {editingProduct
                ? `SKU: ${editingProduct.sku} ${
                    currentUser.role === 'MODERATOR'
                      ? '• (Moderator: Stock count only)'
                      : '• Bangladesh retail pricing & specs'
                  }`
                : 'Add authentic tech product with Bangladeshi pricing'}
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  disabled={currentUser.role === 'MODERATOR'}
                  placeholder="e.g. Samsung Galaxy S25 Ultra (512GB)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-cyan-400 ${
                    currentUser.role === 'MODERATOR' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Brand</label>
                  <select
                    disabled={currentUser.role === 'MODERATOR'}
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-cyan-400 ${
                      currentUser.role === 'MODERATOR' ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    disabled={currentUser.role === 'MODERATOR'}
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-cyan-400 ${
                      currentUser.role === 'MODERATOR' ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Selling Price (৳) {currentUser.role === 'MODERATOR' && '(Locked)'}
                  </label>
                  <input
                    type="number"
                    required
                    disabled={currentUser.role === 'MODERATOR'}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-cyan-400 font-mono font-bold outline-none focus:border-cyan-400 ${
                      currentUser.role === 'MODERATOR' ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Regular MSRP (৳) {currentUser.role === 'MODERATOR' && '(Locked)'}
                  </label>
                  <input
                    type="number"
                    required
                    disabled={currentUser.role === 'MODERATOR'}
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-400 font-mono outline-none focus:border-cyan-400 ${
                      currentUser.role === 'MODERATOR' ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-emerald-400">
                    Stock Count ★
                  </label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-slate-900 border-2 border-emerald-500/50 rounded-xl px-3 py-2.5 text-white font-mono font-bold outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Warranty Term</label>
                <input
                  type="text"
                  disabled={currentUser.role === 'MODERATOR'}
                  value={formWarranty}
                  onChange={(e) => setFormWarranty(e.target.value)}
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-cyan-400 ${
                    currentUser.role === 'MODERATOR' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Short Feature Highlights</label>
                <textarea
                  rows={2}
                  disabled={currentUser.role === 'MODERATOR'}
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="Key highlight specs"
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-cyan-400 ${
                    currentUser.role === 'MODERATOR' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black shadow-lg hover:scale-105 transition-all"
                >
                  {editingProduct
                    ? currentUser.role === 'MODERATOR'
                      ? 'Confirm Stock Update'
                      : 'Save Changes'
                    : 'Confirm & Deploy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: DELETE CONFIRMATION ──────────────────────────────────────── */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-950 border border-rose-500/50 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Confirm Removal</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently remove this gadget from TechHunterBD catalog?
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ORDER DETAILS ────────────────────────────────────────────── */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl text-xs space-y-4">
            <button
              onClick={() => setViewingOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-cyan-400 text-sm">{viewingOrder.orderNumber}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(viewingOrder.status)}`}>
                {viewingOrder.status}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-white">{viewingOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-cyan-400">{viewingOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Zone:</span>
                <span className="text-slate-200">{viewingOrder.district} ({viewingOrder.addressType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="font-bold text-amber-400">{viewingOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-slate-400 block font-bold">Items Purchased:</span>
              <p className="font-semibold text-white">{viewingOrder.itemsSummary}</p>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-mono">
                <span className="text-slate-400">Grand Total:</span>
                <span className="font-black text-cyan-400 text-sm">{formatPrice(viewingOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 text-[10px] block">Assigned Logistics:</span>
                <span className="font-bold text-white">{viewingOrder.courier} Courier</span>
              </div>
              <span className="font-mono text-xs text-cyan-400 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {viewingOrder.trackingNumber}
              </span>
            </div>

            <button
              onClick={() => setViewingOrder(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:text-white hover:bg-slate-700"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
