/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Compass, ShoppingBag, Heart, User, 
  ChevronRight, ChevronLeft, Plus, Minus, 
  Star, MapPin, Calendar, Users, Shield, 
  Search, ShoppingCart, Trash2, Check, 
  CreditCard, Truck, ArrowRight, X, Bell,
  Signal, Wifi, Battery, Tag, AlertCircle
} from 'lucide-react';
import { Trip, Product, CartItem, Member, Location, Guide, Variant, Review, Voucher, Order, OrderItem, OrderStatus } from './types';
import { LOCATIONS, GUIDES } from './constants';

// --- Components ---

const StatusBar = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    }, 10000); // Update every 10s is enough for minutes
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-7 px-6 flex items-center justify-between bg-inherit shrink-0 z-[100] text-gray-900">
      <div className="text-[12px] font-bold tracking-tight">{time}</div>
      <div className="flex items-center gap-1.5">
        <Signal size={14} strokeWidth={2.5} />
        <Wifi size={14} strokeWidth={2.5} />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold">88%</span>
          <Battery size={14} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

const MobileViewport = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 p-4">
      <div className="mobile-viewport rounded-[40px] border-[8px] border-gray-900 overflow-hidden relative flex flex-col scale-[0.9] origin-center">
        <StatusBar />
        {children}
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }: { 
  isOpen: boolean, 
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel: () => void 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">{message}</p>
            <div className="flex gap-3">
              <button 
                onClick={onCancel}
                className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Huỷ
              </button>
              <button 
                onClick={onConfirm}
                className="flex-1 py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const BottomNav = ({ active, onChange }: { active: string, onChange: (val: string) => void }) => {
  const items = [
    { id: 'home', icon: Home, label: 'Trang chủ' },
    { id: 'explore', icon: Compass, label: 'Khám phá' },
    { id: 'shop', icon: ShoppingBag, label: 'Cửa hàng' },
    { id: 'fav', icon: Heart, label: 'Yêu thích' },
    { id: 'profile', icon: User, label: 'Cá nhân' },
  ];

  return (
    <div className="bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            active === item.id ? 'text-brand-primary' : 'text-gray-400'
          }`}
        >
          <item.icon size={20} strokeWidth={active === item.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- Screens ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState('main'); // main, planning, cart, checkout, success, productDetail
  const [planningStep, setPlanningStep] = useState(1);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [planningSearchQuery, setPlanningSearchQuery] = useState('');
  const [showPlanningSuccess, setShowPlanningSuccess] = useState(false);
  
  // Voucher State
  const [vouchers] = useState<Voucher[]>([
    {
      code: 'EARTH10',
      type: 'percentage',
      value: 10,
      maxDiscount: 500000,
      minOrder: 1000000,
      scope: 'all',
      usageLimit: 100,
      userLimit: 1,
      startTime: '2026-01-01T00:00:00Z',
      endTime: '2026-12-31T23:59:59Z',
      status: 'active',
      description: 'Giảm 10% cho toàn bộ đơn hàng (Tối đa 500k)'
    },
    {
      code: 'SAVE200',
      type: 'fixed',
      value: 200000,
      minOrder: 2000000,
      scope: 'all',
      usageLimit: 50,
      userLimit: 1,
      status: 'active',
      description: 'Giảm ngay 200k cho đơn hàng từ 2 triệu'
    },
    {
      code: 'GEAR15',
      type: 'percentage',
      value: 15,
      maxDiscount: 400000,
      minOrder: 800000,
      scope: 'category',
      scopeValue: 'Gear',
      usageLimit: 200,
      userLimit: 2,
      status: 'active',
      description: 'Giảm 15% cho các sản phẩm Gear (Tối đa 400k)'
    },
    {
      code: 'BALO300',
      type: 'fixed',
      value: 300000,
      minOrder: 0,
      scope: 'products',
      scopeValue: ['Balo Trekking Osprey', 'Balo Trekking 50L'],
      usageLimit: 80,
      userLimit: 1,
      status: 'active',
      description: 'Giảm 300k cho Balo Osprey hoặc Balo 50L'
    },
    {
      code: 'FLASH20',
      type: 'percentage',
      value: 20,
      maxDiscount: 700000,
      minOrder: 3000000,
      scope: 'all',
      usageLimit: 30,
      userLimit: 1,
      startTime: '2026-06-01T00:00:00Z',
      endTime: '2026-06-10T23:59:59Z',
      status: 'active',
      description: 'Flash Sale: Giảm 20% cho đơn từ 3 triệu'
    }
  ]);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherInput, setVoucherInput] = useState('');
  const [isVoucherExpanded, setIsVoucherExpanded] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  // Order Tracking State
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ET-123456',
      createdAt: '2026-02-28T10:00:00Z',
      orderDate: '28/02/2026',
      orderTime: '10:00',
      estimatedDeliveryDate: '05/03/2026',
      items: [
        {
          product_id: '1',
          name: 'Balo Trekking Osprey',
          image: 'https://picsum.photos/seed/osprey/400/400',
          quantity: 1,
          unitPrice: 4500000,
          mode: 'buy'
        }
      ],
      subtotal: 4500000,
      discount: 0,
      shippingFee: 30000,
      total: 4530000,
      status: 'Đang giao',
      paymentMethod: 'momo',
      address: {
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        detail: '123 Đường ABC',
        ward: 'Phường X',
        district: 'Quận Y',
        city: 'TP. Hồ Chí Minh'
      }
    },
    {
      id: 'ET-789012',
      createdAt: '2026-02-25T15:30:00Z',
      orderDate: '25/02/2026',
      orderTime: '15:30',
      estimatedDeliveryDate: '01/03/2026',
      deliveredDate: '01/03/2026',
      items: [
        {
          product_id: '2',
          name: 'Gậy Leo Núi Carbon',
          image: 'https://picsum.photos/seed/poles/400/400',
          quantity: 2,
          unitPrice: 850000,
          mode: 'buy'
        }
      ],
      subtotal: 1700000,
      discount: 200000,
      shippingFee: 15000,
      total: 1515000,
      status: 'Hoàn thành',
      paymentMethod: 'bank',
      address: {
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        detail: '123 Đường ABC',
        ward: 'Phường X',
        district: 'Quận Y',
        city: 'TP. Hồ Chí Minh'
      }
    }
  ]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const cancelReasonRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showCancelConfirm && cancelReason === 'Lý do khác' && cancelReasonRef.current) {
      cancelReasonRef.current.focus();
    }
  }, [showCancelConfirm, cancelReason]);
  
  // Product Detail State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDetailMode, setProductDetailMode] = useState<'buy' | 'rent'>('buy');
  const [productDetailQuantity, setProductDetailQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Add to Cart Modal State
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [productToAddToCart, setProductToAddToCart] = useState<Product | null>(null);
  const [flyAnimation, setFlyAnimation] = useState<{ x: number, y: number, image: string } | null>(null);
  const [cartIconBounce, setCartIconBounce] = useState(false);

  // Cart Refinement State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);
  const [cartItemError, setCartItemError] = useState<{ [key: number]: string }>({});
  const [isEditCartModalOpen, setIsEditCartModalOpen] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [editAttributes, setEditAttributes] = useState<Record<string, string>>({});
  const [editVariant, setEditVariant] = useState<Variant | null>(null);
  const [editMode, setEditMode] = useState<'buy' | 'rent'>('buy');
  const [editQuantity, setEditQuantity] = useState(1);
  const [editError, setEditError] = useState<string | null>(null);

  const findMatchingVariant = (product: Product, attributes: Record<string, string>) => {
    if (!product.variants) return null;
    const productAttrNames = JSON.parse(product.attributes || '[]');
    if (Object.keys(attributes).length !== productAttrNames.length) return null;

    return product.variants.find(v => {
      const vAttrs = JSON.parse(v.attributes);
      return Object.entries(attributes).every(([key, value]) => vAttrs[key] === value);
    });
  };

  const getAvailableOptions = (product: Product, attributeName: string, otherSelected: Record<string, string>) => {
    if (!product.variants) return [];
    const options = new Set<string>();
    product.variants.forEach(v => {
      const vAttrs = JSON.parse(v.attributes);
      const matchesOther = Object.entries(otherSelected).every(([key, value]) => {
        if (key === attributeName) return true;
        return vAttrs[key] === value;
      });
      if (matchesOther) {
        options.add(vAttrs[attributeName]);
      }
    });
    return Array.from(options);
  };

  const TopBar = () => {
    return (
      <div className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-50 shrink-0">
        <h1 className="text-xl font-bold text-brand-primary tracking-tight">EarthTrek</h1>
        <div className="flex items-center gap-4">
          <button className="relative text-gray-400">
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <motion.button 
            onClick={() => setCurrentScreen('cart')}
            animate={cartIconBounce ? { scale: [1, 1.2, 1] } : {}}
            className="relative p-2 bg-gray-100 rounded-full text-gray-600"
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                {cart.length}
              </span>
            )}
          </motion.button>
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary overflow-hidden border border-gray-100">
            <img src="https://i.pravatar.cc/150?u=trekker" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    );
  };
  
  // Planning State
  const [tempTrip, setTempTrip] = useState<Partial<Trip>>({
    members: [],
    number_of_days: 1,
    departure_date: new Date().toISOString().split('T')[0]
  });

  // Fetch Data
  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts);
    fetch('/api/trip').then(res => res.json()).then(setActiveTrip);
    fetch('/api/cart').then(res => res.json()).then(setCart);
  }, []);

  const refreshCart = () => fetch('/api/cart').then(res => res.json()).then(setCart);

  const addToCart = async (productId: string, mode: 'buy' | 'rent', variantId?: string, quantity: number = 1, startPos?: { x: number, y: number }, image?: string) => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, mode, variant_id: variantId, quantity })
    });
    
    if (startPos && image) {
      setFlyAnimation({ x: startPos.x, y: startPos.y, image });
      setTimeout(() => {
        setFlyAnimation(null);
        setCartIconBounce(true);
        setTimeout(() => setCartIconBounce(false), 500);
      }, 800);
    }
    
    refreshCart();
  };

  const updateCartItem = async (cartId: number, updates: any) => {
    await fetch(`/api/cart/${cartId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    refreshCart();
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return [...products].sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const aKeywords = (a.keywords || '').toLowerCase();
      const bKeywords = (b.keywords || '').toLowerCase();
      const aCategory = (a.category || '').toLowerCase();
      const bCategory = (b.category || '').toLowerCase();

      // Exact Match
      if (aName === query && bName !== query) return -1;
      if (bName === query && aName !== query) return 1;

      // Starts with
      if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
      if (bName.startsWith(query) && !aName.startsWith(query)) return 1;

      // Keyword match
      const aKeyMatch = aKeywords.includes(query);
      const bKeyMatch = bKeywords.includes(query);
      if (aKeyMatch && !bKeyMatch) return -1;
      if (bKeyMatch && !aKeyMatch) return 1;

      // Category match
      const aCatMatch = aCategory.includes(query);
      const bCatMatch = bCategory.includes(query);
      if (aCatMatch && !bCatMatch) return -1;
      if (bCatMatch && !aCatMatch) return 1;

      return 0;
    }).filter(p => 
      (p.name || '').toLowerCase().includes(query) || 
      (p.keywords || '').toLowerCase().includes(query) || 
      (p.category || '').toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const searchSuggestions = useMemo(() => {
    if (searchQuery.length < 1) return [];
    const query = searchQuery.toLowerCase();
    const suggestions = new Set<string>();

    products.forEach(p => {
      if (p.name && p.name.toLowerCase().includes(query)) suggestions.add(p.name);
      if (p.category && p.category.toLowerCase().includes(query)) suggestions.add(p.category);
      if (p.keywords) {
        p.keywords.split(',').forEach(k => {
          const trimmed = k.trim();
          if (trimmed.toLowerCase().includes(query)) suggestions.add(trimmed);
        });
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }, [products, searchQuery]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      if (!item.selected) return sum;
      const price = item.mode === 'buy' ? item.buy_price : item.rent_price_per_day * (activeTrip?.number_of_days || 1);
      return sum + price * item.quantity;
    }, 0);
  }, [cart, activeTrip]);

  const getVoucherStatus = (v: Voucher) => {
    const now = new Date('2026-03-01T08:30:16-08:00').getTime();
    if (v.startTime && now < new Date(v.startTime).getTime()) return 'scheduled';
    if (v.endTime && now > new Date(v.endTime).getTime()) return 'expired';
    return v.status;
  };

  const validateVoucher = (v: Voucher, items: CartItem[]): { valid: boolean; reason?: string; discount: number } => {
    const status = getVoucherStatus(v);
    if (status === 'scheduled') return { valid: false, reason: 'Voucher chưa đến thời gian áp dụng', discount: 0 };
    if (status === 'expired') return { valid: false, reason: 'Voucher đã hết hạn', discount: 0 };
    if (v.status !== 'active') return { valid: false, reason: 'Voucher không khả dụng', discount: 0 };

    // Usage limits (mocked as valid for now since we don't have usage tracking)
    // if (v.usageLimit <= 0) return { valid: false, reason: 'Voucher đã hết lượt sử dụng', discount: 0 };

    const selectedItems = items.filter(i => i.selected);
    const subtotal = selectedItems.reduce((sum, item) => {
      const price = item.mode === 'buy' ? item.buy_price : item.rent_price_per_day * (activeTrip?.number_of_days || 1);
      return sum + price * item.quantity;
    }, 0);

    if (subtotal < v.minOrder) return { valid: false, reason: `Chưa đạt giá trị tối thiểu ${v.minOrder.toLocaleString()}đ`, discount: 0 };

    let eligibleSubtotal = 0;
    if (v.scope === 'all') {
      eligibleSubtotal = subtotal;
    } else if (v.scope === 'category') {
      eligibleSubtotal = selectedItems
        .filter(i => {
          const product = products.find(p => p.id === i.product_id);
          return product?.category === v.scopeValue;
        })
        .reduce((sum, item) => {
          const price = item.mode === 'buy' ? item.buy_price : item.rent_price_per_day * (activeTrip?.number_of_days || 1);
          return sum + price * item.quantity;
        }, 0);
    } else if (v.scope === 'products') {
      eligibleSubtotal = selectedItems
        .filter(i => (v.scopeValue as string[]).includes(i.name))
        .reduce((sum, item) => {
          const price = item.mode === 'buy' ? item.buy_price : item.rent_price_per_day * (activeTrip?.number_of_days || 1);
          return sum + price * item.quantity;
        }, 0);
    }

    if (eligibleSubtotal === 0) return { valid: false, reason: 'Không có sản phẩm phù hợp', discount: 0 };

    let discount = 0;
    if (v.type === 'percentage') {
      discount = (eligibleSubtotal * v.value) / 100;
      if (v.maxDiscount) discount = Math.min(discount, v.maxDiscount);
    } else {
      discount = v.value;
    }

    return { valid: true, discount };
  };

  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    const result = validateVoucher(appliedVoucher, cart);
    return result.valid ? result.discount : 0;
  }, [appliedVoucher, cart, activeTrip, products]);

  // Dynamic Revalidation
  useEffect(() => {
    if (appliedVoucher) {
      const result = validateVoucher(appliedVoucher, cart);
      if (!result.valid) {
        setAppliedVoucher(null);
        setVoucherError('Voucher không còn hợp lệ');
        setTimeout(() => setVoucherError(null), 3000);
      }
    }
  }, [cart, activeTrip]);

  // --- Render Helpers ---

  const renderHomeScreen = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6">
          <header className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Chào mừng, Trekker!</h2>
            <p className="text-sm text-gray-500">Sẵn sàng cho cuộc hành trình mới?</p>
          </header>

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-brand-dark to-brand-light rounded-3xl p-6 text-white mb-8 relative overflow-hidden shadow-lg shadow-brand-primary/20">
            <div className="relative z-10">
              <h2 className="text-xl font-semibold mb-2">Lập kế hoạch chuyến đi</h2>
              <p className="text-sm text-white/80 mb-4 max-w-[200px]">Chuẩn bị mọi thứ tốt nhất cho hành trình của bạn.</p>
              <button 
                onClick={() => {
                  setCurrentScreen('planning');
                  setPlanningStep(1);
                }}
                className="bg-white text-brand-primary px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2"
              >
                Bắt đầu ngay <ArrowRight size={16} />
              </button>
            </div>
            <Compass className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12" />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button 
              onClick={() => {
                setCurrentScreen('planning');
                setPlanningStep(4);
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">Thuê hướng dẫn</span>
            </button>
            <button 
              onClick={() => setActiveTab('shop')}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <ShoppingBag size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">Mua/Thuê thiết bị</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('orderTracking')}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                <Truck size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">Theo dõi đơn hàng</span>
            </button>
          </div>

          {/* Current Trip */}
          {activeTrip && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Chuyến đi hiện tại</h3>
                <button className="text-brand-primary text-xs font-semibold">Chi tiết</button>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-4">
                <img 
                  src={LOCATIONS.find(l => l.id === activeTrip.location_id)?.image} 
                  className="w-20 h-20 rounded-xl object-cover" 
                  alt=""
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{LOCATIONS.find(l => l.id === activeTrip.location_id)?.name}</h4>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <Calendar size={12} /> {activeTrip.departure_date}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <Users size={12} /> {activeTrip.members.length} thành viên
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Explore */}
          <section className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Khám phá</h3>
              <button className="text-brand-primary text-xs font-semibold">Tất cả</button>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {LOCATIONS.map(loc => (
                <div key={loc.id} className="min-w-[200px] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <img src={loc.image} className="w-full h-28 object-cover" alt="" referrerPolicy="no-referrer" />
                  <div className="p-3">
                    <h4 className="font-bold text-sm truncate">{loc.name}</h4>
                    <p className="text-[10px] text-gray-500">{loc.province}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-medium">
                        {loc.difficulty}
                      </span>
                      <div className="flex items-center gap-0.5 text-[10px] font-bold">
                        <Star size={10} className="fill-yellow-400 text-yellow-400" /> {loc.rating}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const renderPlanningFlow = () => {
    const steps = [
      { id: 1, title: 'Địa điểm' },
      { id: 2, title: 'Thời gian' },
      { id: 3, title: 'Thành viên' },
      { id: 4, title: 'Dẫn đường' },
      { id: 5, title: 'Xác nhận' }
    ];

    const isStepValid = () => {
      switch (planningStep) {
        case 1: return !!tempTrip.location_id;
        case 2: return !!tempTrip.departure_date && !!tempTrip.number_of_days;
        case 3: return (tempTrip.members || []).every(m => !!m.fullName.trim());
        case 4: return true; // Optional
        case 5: return true;
        default: return false;
      }
    };

    const handleNext = async () => {
      if (!isStepValid()) return;
      if (planningStep < 5) {
        setPlanningStep(planningStep + 1);
      } else {
        await fetch('/api/trip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tempTrip)
        });
        const updatedTrip = await fetch('/api/trip').then(res => res.json());
        setActiveTrip(updatedTrip);
        
        // Show success feedback
        setShowPlanningSuccess(true);
        setTimeout(() => {
          setShowPlanningSuccess(false);
          setCurrentScreen('main');
          setActiveTab('shop');
          setPlanningStep(1); // Reset for next time
          setPlanningSearchQuery('');
        }, 2000);
      }
    };

    const renderStepContent = () => {
      switch (planningStep) {
        case 1:
          const filteredLocations = LOCATIONS.filter(loc => 
            loc.name.toLowerCase().includes(planningSearchQuery.toLowerCase())
          );

          return (
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <h2 className="text-xl font-bold mb-4">Bạn muốn đi đâu?</h2>
              
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  placeholder="Tìm kiếm địa điểm trekking…" 
                  value={planningSearchQuery}
                  onChange={(e) => setPlanningSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:outline-none shadow-sm"
                />
              </div>

              <div className="space-y-4">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setTempTrip({ ...tempTrip, location_id: loc.id });
                      }}
                      className={`w-full text-left bg-white rounded-2xl overflow-hidden border-2 transition-all ${
                        tempTrip.location_id === loc.id ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-gray-100'
                      }`}
                    >
                      <img src={loc.image} className="w-full h-32 object-cover" alt="" referrerPolicy="no-referrer" />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-lg">{loc.name}</h3>
                          <div className="flex items-center gap-1 text-sm font-bold">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" /> {loc.rating}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{loc.province} • {loc.distance}km</p>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{loc.description}</p>
                        <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                          {loc.difficulty}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <Search size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">Không tìm thấy địa điểm phù hợp</p>
                  </div>
                )}
              </div>
            </div>
          );
        case 2:
          return (
            <div className="flex-1 p-6">
              <h2 className="text-xl font-bold mb-6">Thời gian dự kiến</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ngày khởi hành</label>
                  <input 
                    type="date" 
                    value={tempTrip.departure_date}
                    onChange={(e) => setTempTrip({ ...tempTrip, departure_date: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Số ngày đi</label>
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                    <button 
                      onClick={() => setTempTrip({ ...tempTrip, number_of_days: Math.max(1, (tempTrip.number_of_days || 1) - 1) })}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-lg font-bold">{tempTrip.number_of_days} ngày</span>
                    <button 
                      onClick={() => setTempTrip({ ...tempTrip, number_of_days: (tempTrip.number_of_days || 1) + 1 })}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        case 3:
          return (
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <h2 className="text-xl font-bold mb-4">Thành viên tham gia</h2>
              <div className="space-y-4 mb-6">
                {tempTrip.members?.map((m, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative">
                    <button 
                      onClick={() => {
                        const newMembers = [...(tempTrip.members || [])];
                        newMembers.splice(idx, 1);
                        setTempTrip({ ...tempTrip, members: newMembers });
                      }}
                      className="absolute top-4 right-4 text-gray-400"
                    >
                      <Trash2 size={16} />
                    </button>
                    <h4 className="font-bold text-sm mb-2 text-brand-primary">Thành viên {idx + 1}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Họ và tên *</label>
                        <input 
                          placeholder="Nhập họ và tên" 
                          value={m.fullName}
                          onChange={(e) => {
                            const newMembers = [...(tempTrip.members || [])];
                            newMembers[idx].fullName = e.target.value;
                            setTempTrip({ ...tempTrip, members: newMembers });
                          }}
                          className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-primary focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tuổi</label>
                          <input placeholder="Nhập tuổi" className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kinh nghiệm</label>
                          <select 
                            value={m.experience}
                            onChange={(e) => {
                              const newMembers = [...(tempTrip.members || [])];
                              newMembers[idx].experience = e.target.value as any;
                              setTempTrip({ ...tempTrip, members: newMembers });
                            }}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none"
                          >
                            <option value="Beginner">Mới bắt đầu</option>
                            <option value="Experienced">Kinh nghiệm</option>
                            <option value="Professional">Chuyên nghiệp</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setTempTrip({ 
                  ...tempTrip, 
                  members: [...(tempTrip.members || []), { fullName: '', experience: 'Beginner' }] 
                })}
                className="w-full border-2 border-dashed border-gray-200 text-gray-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mb-6"
              >
                <Plus size={18} /> Thêm thành viên
              </button>
            </div>
          );
        case 4:
          const guides = GUIDES[tempTrip.location_id!] || [];
          return (
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <h2 className="text-xl font-bold mb-4">Chọn người dẫn đường</h2>
              <div className="space-y-4 mb-6">
                {guides.map(g => (
                  <div 
                    key={g.id} 
                    className={`bg-white rounded-2xl p-4 border-2 transition-all ${
                      tempTrip.guide_id === g.id ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex gap-4 mb-4">
                      <img src={g.avatar} className="w-16 h-16 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{g.name}</h4>
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-500">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" /> {g.rating} • {g.experience} năm KN
                        </div>
                        <p className="text-brand-primary font-bold mt-1">
                          {g.dailyRate.toLocaleString()}đ <span className="text-xs font-normal text-gray-400">/ ngày</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <div className="text-xs text-gray-500">
                        Tổng: <span className="font-bold text-gray-900">{(g.dailyRate * (tempTrip.number_of_days || 1)).toLocaleString()}đ</span>
                      </div>
                      {tempTrip.guide_id === g.id ? (
                        <button 
                          onClick={() => setTempTrip({ ...tempTrip, guide_id: undefined })}
                          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold"
                        >
                          Hủy chọn
                        </button>
                      ) : (
                        <button 
                          onClick={() => setTempTrip({ ...tempTrip, guide_id: g.id })}
                          className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold"
                        >
                          Chọn
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        case 5:
          const location = LOCATIONS.find(l => l.id === tempTrip.location_id);
          const guide = (GUIDES[tempTrip.location_id!] || []).find(g => g.id === tempTrip.guide_id);
          return (
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <h2 className="text-xl font-bold mb-6">Kiểm tra lại kế hoạch</h2>
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Địa điểm & Thời gian</h4>
                  <div className="flex gap-4">
                    <img src={location?.image} className="w-20 h-20 rounded-xl object-cover" alt="" referrerPolicy="no-referrer" />
                    <div>
                      <h3 className="font-bold">{location?.name}</h3>
                      <p className="text-sm text-gray-500">{tempTrip.departure_date} • {tempTrip.number_of_days} ngày</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Thành viên ({tempTrip.members?.length || 0})</h4>
                  <div className="space-y-2">
                    {tempTrip.members?.length ? tempTrip.members.map((m, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="font-medium">{m.fullName}</span>
                        <span className="text-gray-500">{m.experience === 'Beginner' ? 'Mới' : m.experience}</span>
                      </div>
                    )) : (
                      <p className="text-xs text-gray-500 italic">Chuyến đi cá nhân</p>
                    )}
                  </div>
                </div>

                {guide && (
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dẫn đường</h4>
                    <div className="flex items-center gap-3">
                      <img src={guide.avatar} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" alt="" />
                      <div>
                        <p className="font-bold text-sm">{guide.name}</p>
                        <p className="text-xs text-gray-500">{(guide.dailyRate * (tempTrip.number_of_days || 1)).toLocaleString()}đ</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
      }
    };

    return (
      <div className="flex-1 flex flex-col bg-brand-bg relative overflow-hidden">
        <div className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 z-20">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => planningStep === 1 ? setCurrentScreen('main') : setPlanningStep(planningStep - 1)}>
              <ChevronLeft size={24} />
            </button>
            <h1 className="font-bold text-lg">Lập kế hoạch</h1>
            <div className="w-6" />
          </div>
          <div className="flex justify-between px-2">
            {steps.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  planningStep === s.id ? 'bg-brand-primary text-white scale-110' : 
                  planningStep > s.id ? 'bg-brand-primary/20 text-brand-primary' : 'bg-gray-100 text-gray-400'
                }`}>
                  {planningStep > s.id ? <Check size={14} /> : s.id}
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${
                  planningStep === s.id ? 'text-brand-primary' : 'text-gray-400'
                }`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={planningStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky Action Bar */}
        <div className="bg-white p-6 border-t border-gray-100 shadow-2xl flex gap-4 z-20">
          <button 
            onClick={() => planningStep === 1 ? setCurrentScreen('main') : setPlanningStep(planningStep - 1)}
            className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold"
          >
            Quay lại
          </button>
          <button 
            disabled={!isStepValid()}
            onClick={handleNext}
            className="flex-[2] bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 disabled:opacity-50 transition-all"
          >
            {planningStep === 5 ? 'Xác nhận' : 'Tiếp tục'}
          </button>
        </div>

        {/* Success Feedback Overlay */}
        <AnimatePresence>
          {showPlanningSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-20 h-20 bg-brand-primary text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand-primary/30"
              >
                <Check size={40} strokeWidth={3} />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kế hoạch đã được lưu</h2>
              <p className="text-gray-500">Chúc bạn có một hành trình tuyệt vời!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderShopScreen = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar />
      <div className="p-6 bg-white border-b border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Cửa hàng</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            placeholder="Tìm kiếm dụng cụ..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/20"
          />
          
          {/* Search Suggestions */}
          {showSuggestions && searchQuery.length >= 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-[60] overflow-hidden">
              {searchSuggestions.length > 0 ? (
                searchSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(s);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-none flex items-center gap-3"
                  >
                    <Search size={14} className="text-gray-400" />
                    <span>{s}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-400 italic">Không có gợi ý phù hợp</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6" onClick={() => setShowSuggestions(false)}>
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              onClick={() => {
                setSelectedProduct(p);
                setProductDetailMode('buy');
                setProductDetailQuantity(1);
                setSelectedVariant(null);
                setSelectedAttributes({});
                setValidationError(null);
                setCurrentScreen('productDetail');
              }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col active:scale-[0.98] transition-all"
            >
              <div className="relative aspect-square">
                <img src={p.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle favorite logic
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-400"
                >
                  <Heart size={14} />
                </button>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h4 className="font-bold text-xs mb-1 line-clamp-1">{p.name}</h4>
                <div className="space-y-1 mb-3">
                  <p className="text-[10px] text-gray-500">Mua: <span className="font-bold text-gray-900">{p.buy_price.toLocaleString()}đ</span></p>
                  <p className="text-[10px] text-gray-500">Thuê: <span className="font-bold text-gray-900">{p.rent_price_per_day.toLocaleString()}đ</span>/ngày</p>
                </div>
                <div className="mt-auto flex flex-col gap-2">
                  <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium self-start">
                    {p.category}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setProductToAddToCart(p);
                      setProductDetailMode('buy');
                      setProductDetailQuantity(1);
                      setSelectedVariant(null);
                      setSelectedAttributes({});
                      setValidationError(null);
                      setIsAddToCartModalOpen(true);
                    }}
                    className="w-full bg-brand-primary text-white py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm shadow-brand-primary/20"
                  >
                    <Plus size={12} /> Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add to Cart Modal */}
      <AnimatePresence>
        {isAddToCartModalOpen && productToAddToCart && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddToCartModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[101] p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              
              <div className="flex gap-4 mb-8">
                <img src={productToAddToCart.image} className="w-24 h-24 rounded-2xl object-cover shadow-md" alt="" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{productToAddToCart.name}</h3>
                  <p className="text-brand-primary font-bold text-xl">
                    {(productDetailMode === 'buy' 
                      ? (selectedVariant?.buy_price || (productToAddToCart.buy_price + (selectedVariant?.price_modifier || 0)))
                      : (selectedVariant?.rent_price_per_day || (productToAddToCart.rent_price_per_day + (selectedVariant?.price_modifier || 0) / 10))
                    ).toLocaleString()}đ
                    <span className="text-xs text-gray-400 font-medium ml-1">
                      {productDetailMode === 'rent' ? '/ ngày' : 'giá bán'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Kho: {productDetailMode === 'buy' 
                      ? (selectedVariant ? selectedVariant.stock_buy : productToAddToCart.stock_buy)
                      : (selectedVariant ? selectedVariant.stock_rent : productToAddToCart.stock_rent)}
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Mode Selection */}
                <div>
                  <h4 className="text-sm font-bold mb-3">Hình thức</h4>
                  <div className="flex gap-3">
                    {['buy', 'rent'].map((m) => (
                      <button 
                        key={m}
                        onClick={() => {
                          setProductDetailMode(m as 'buy' | 'rent');
                          setValidationError(null);
                        }}
                        className={`flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                          productDetailMode === m ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-100 text-gray-400'
                        }`}
                      >
                        {m === 'buy' ? 'Mua' : 'Thuê'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi-Attribute Variants */}
                {productToAddToCart.attributes && (
                  <div className="space-y-6">
                    {JSON.parse(productToAddToCart.attributes).map((attrName: string) => {
                      const options = getAvailableOptions(productToAddToCart, attrName, selectedAttributes);
                      return (
                        <div key={attrName}>
                          <h4 className="text-sm font-bold mb-3">{attrName}</h4>
                          <div className="flex flex-wrap gap-2">
                            {options.map(opt => {
                              const isSelected = selectedAttributes[attrName] === opt;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    const newAttrs = { ...selectedAttributes, [attrName]: opt };
                                    setSelectedAttributes(newAttrs);
                                    const matching = findMatchingVariant(productToAddToCart, newAttrs);
                                    setSelectedVariant(matching);
                                    setValidationError(null);
                                  }}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                    isSelected
                                      ? 'border-brand-primary bg-brand-primary/5 text-brand-primary ring-2 ring-brand-primary/10'
                                      : 'border-gray-100 text-gray-600 hover:border-gray-200'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">Số lượng</h4>
                  <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                    <button 
                      onClick={() => setProductDetailQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number"
                      value={productDetailQuantity}
                      onChange={(e) => setProductDetailQuantity(parseInt(e.target.value) || 1)}
                      className="w-12 text-center font-bold bg-transparent border-none focus:ring-0"
                    />
                    <button 
                      onClick={() => setProductDetailQuantity(q => q + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {validationError && (
                  <p className="text-red-500 text-xs font-bold text-center">{validationError}</p>
                )}

                <button 
                  disabled={(productDetailMode === 'buy' 
                    ? (selectedVariant ? selectedVariant.stock_buy : productToAddToCart.stock_buy)
                    : (selectedVariant ? selectedVariant.stock_rent : productToAddToCart.stock_rent)) <= 0}
                  onClick={(e) => {
                    const currentStock = productDetailMode === 'buy' 
                      ? (selectedVariant ? selectedVariant.stock_buy : productToAddToCart.stock_buy)
                      : (selectedVariant ? selectedVariant.stock_rent : productToAddToCart.stock_rent);

                    if (productDetailQuantity > currentStock) {
                      setValidationError('Số lượng vượt quá hàng có sẵn');
                      return;
                    }
                    if (productToAddToCart.attributes) {
                      const productAttrNames = JSON.parse(productToAddToCart.attributes);
                      if (Object.keys(selectedAttributes).length < productAttrNames.length) {
                        setValidationError('Vui lòng chọn đầy đủ các thuộc tính');
                        return;
                      }
                    }
                    if (productToAddToCart.variants?.length && !selectedVariant) {
                      setValidationError('Phiên bản này hiện không khả dụng');
                      return;
                    }

                    const rect = e.currentTarget.getBoundingClientRect();
                    addToCart(
                      productToAddToCart.id, 
                      productDetailMode, 
                      selectedVariant?.id, 
                      productDetailQuantity, 
                      { x: rect.left + rect.width / 2, y: rect.top },
                      productToAddToCart.image
                    );
                    setIsAddToCartModalOpen(false);
                  }}
                  className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {(productDetailMode === 'buy' 
                    ? (selectedVariant ? selectedVariant.stock_buy : productToAddToCart.stock_buy)
                    : (selectedVariant ? selectedVariant.stock_rent : productToAddToCart.stock_rent)) <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  const renderCartScreen = () => {
    const selectedItemsCount = cart.filter(i => i.selected).length;

    const handleQuantityChange = (item: CartItem, newQuantity: number) => {
      const stock = item.mode === 'buy' ? item.stock_buy : item.stock_rent;
      
      if (newQuantity <= 0) {
        setConfirmDialog({
          isOpen: true,
          title: 'Xoá sản phẩm?',
          message: 'Bạn có chắc muốn xoá sản phẩm này khỏi giỏ hàng?',
          onConfirm: () => {
            updateCartItem(item.cart_id, { quantity: 0 });
            setConfirmDialog(null);
          },
          onCancel: () => setConfirmDialog(null)
        });
        return;
      }

      if (newQuantity > stock) {
        setCartItemError({ ...cartItemError, [item.cart_id]: 'Số lượng vượt quá số lượng tồn kho' });
        updateCartItem(item.cart_id, { quantity: stock });
        setTimeout(() => {
          setCartItemError(prev => {
            const next = { ...prev };
            delete next[item.cart_id];
            return next;
          });
        }, 3000);
        return;
      }

      setCartItemError(prev => {
        const next = { ...prev };
        delete next[item.cart_id];
        return next;
      });
      updateCartItem(item.cart_id, { quantity: newQuantity });
    };

    const handleManualInput = (item: CartItem, value: string) => {
      if (value === '') return;
      
      const num = parseInt(value);
      if (isNaN(num)) return;
      
      handleQuantityChange(item, num);
    };

    const handleBlur = (item: CartItem, value: string) => {
      if (value === '' || isNaN(parseInt(value))) {
        refreshCart(); // Restore previous valid quantity
      }
    };

    const openEditModal = (item: CartItem) => {
      const product = products.find(p => p.id === item.product_id);
      if (!product) return;

      setEditingCartItem(item);
      setEditMode(item.mode);
      setEditQuantity(item.quantity);
      
      // Find variant and attributes
      if (item.variant_id && product.variants) {
        const variant = product.variants.find(v => v.id === item.variant_id);
        if (variant) {
          setEditVariant(variant);
          setEditAttributes(JSON.parse(variant.attributes));
        }
      } else {
        setEditVariant(null);
        setEditAttributes({});
      }
      
      setEditError(null);
      setIsEditCartModalOpen(true);
    };

    return (
      <div className="flex flex-col h-full bg-brand-bg overflow-hidden">
        {/* Fixed Top App Bar */}
        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 z-20">
          <button onClick={() => setCurrentScreen('main')} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg">Giỏ hàng</h1>
          <div className="w-10" />
        </div>

        {/* Scrollable Product List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 min-h-0">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={64} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-medium">Giỏ hàng trống</p>
              <button 
                onClick={() => { setCurrentScreen('main'); setActiveTab('shop'); }}
                className="mt-4 text-brand-primary font-bold text-sm underline"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
              cart.map(item => (
                <div 
                  key={item.cart_id} 
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-3 transition-all duration-300 overflow-hidden"
                >
                  {/* Checkbox - Fixed Width */}
                  <div className="flex items-center shrink-0 w-6">
                    <button 
                      onClick={() => updateCartItem(item.cart_id, { selected: item.selected ? 0 : 1 })}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                        item.selected ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-gray-200'
                      }`}
                    >
                      {!!item.selected && <Check size={16} />}
                    </button>
                  </div>

                  {/* Image - Fixed Size */}
                  <img src={item.image} className="w-[72px] h-[72px] rounded-xl object-cover shrink-0" alt="" referrerPolicy="no-referrer" />

                  {/* Content Column - Flex 1 */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1 pr-1">
                        <h4 className="font-bold text-sm truncate leading-tight">{item.name}</h4>
                        {item.variant_name && (
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">Phiên bản: {item.variant_name}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: 'Xoá sản phẩm?',
                            message: 'Bạn có chắc muốn xoá sản phẩm này khỏi giỏ hàng?',
                            onConfirm: () => {
                              updateCartItem(item.cart_id, { quantity: 0 });
                              setConfirmDialog(null);
                            },
                            onCancel: () => setConfirmDialog(null)
                          });
                        }} 
                        className="text-gray-300 p-1 hover:text-red-400 transition-colors shrink-0 -mt-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        item.mode === 'buy' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-light/10 text-brand-light'
                      }`}>
                        {item.mode === 'buy' ? 'Mua' : 'Thuê'}
                      </span>
                      <button 
                        onClick={() => openEditModal(item)}
                        className="text-[10px] text-brand-primary font-bold underline"
                      >
                        Thay đổi
                      </button>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex justify-between items-center mt-2 gap-2">
                      <p className="font-bold text-brand-primary text-sm truncate">
                        {(item.mode === 'buy' ? item.buy_price : item.rent_price_per_day * (activeTrip?.number_of_days || 1)).toLocaleString()}đ
                      </p>
                      
                      <div className="flex flex-col items-end shrink-0">
                        {cartItemError[item.cart_id] && (
                          <span className="text-[8px] text-red-500 font-bold mb-0.5">{cartItemError[item.cart_id]}</span>
                        )}
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1 w-[88px] justify-between">
                          <button 
                            onClick={() => handleQuantityChange(item, item.quantity - 1)} 
                            className="text-gray-400 hover:text-gray-600 shrink-0"
                          >
                            <Minus size={14} />
                          </button>
                          <input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleManualInput(item, e.target.value)}
                            onBlur={(e) => handleBlur(item, e.target.value)}
                            className="text-xs font-bold w-7 text-center bg-transparent border-none focus:ring-0 p-0"
                          />
                          <button 
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="text-gray-400 hover:text-gray-600 shrink-0"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            ))
          )}
        </div>

        {/* Fixed Bottom Checkout Section */}
        {cart.length > 0 && (
          <div className="bg-white p-6 pb-8 border-t border-gray-100 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] shrink-0 z-20">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Tổng thanh toán</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-brand-primary tracking-tight">{cartTotal.toLocaleString()}đ</span>
                  <span className="text-xs text-gray-400 font-medium">({selectedItemsCount} món)</span>
                </div>
              </div>
              {activeTrip && cart.some(i => i.mode === 'rent' && i.selected) && (
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Thời gian thuê</p>
                  <p className="text-sm font-bold text-gray-900">{activeTrip.number_of_days} ngày</p>
                </div>
              )}
            </div>
            <button 
              disabled={selectedItemsCount === 0}
              onClick={() => setCurrentScreen('checkout')}
              className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-400 transition-all active:scale-[0.98]"
            >
              Thanh toán
            </button>
          </div>
        )}
      </div>
    );
  };

  const [checkoutStep, setCheckoutStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Address State
  const [addresses, setAddresses] = useState([
    { 
      id: '1', 
      name: 'Nguyễn Văn A', 
      phone: '0901234567', 
      detail: '123 Đường ABC', 
      ward: 'Phường X', 
      district: 'Quận Y', 
      city: 'TP. Hồ Chí Minh',
      note: 'Giao giờ hành chính',
      isDefault: true 
    }
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState('1');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    detail: '',
    ward: '',
    district: '',
    city: '',
    note: ''
  });

  const renderCheckoutScreen = () => {
    const shippingFees = { economy: 15000, standard: 30000, express: 50000 };
    const fee = shippingFees[shippingMethod as keyof typeof shippingFees] || 0;
    const selectedItems = cart.filter(i => i.selected);
    const total = cartTotal + fee - voucherDiscount;

    const handleApplyVoucher = (code: string) => {
      const v = vouchers.find(v => v.code.toUpperCase() === code.toUpperCase());
      if (!v) {
        setVoucherError('Mã giảm giá không tồn tại');
        setVoucherSuccess(null);
        return;
      }
      const result = validateVoucher(v, cart);
      if (!result.valid) {
        setVoucherError(result.reason || 'Voucher không hợp lệ');
        setVoucherSuccess(null);
        return;
      }
      setAppliedVoucher(v);
      setVoucherSuccess(`Đã áp dụng mã ${v.code}`);
      setVoucherError(null);
      setVoucherInput('');
    };

    const handleSaveAddress = () => {
      if (!newAddress.name || !newAddress.phone || !newAddress.detail) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }
      const id = Math.random().toString(36).substr(2, 9);
      const addedAddress = { ...newAddress, id, isDefault: false };
      setAddresses([...addresses, addedAddress]);
      setSelectedAddressId(id);
      setIsAddingAddress(false);
      setNewAddress({ name: '', phone: '', detail: '', ward: '', district: '', city: '', note: '' });
    };

    const isReadyToPay = selectedAddressId && shippingMethod && paymentMethod && selectedItems.length > 0;

    return (
      <div className="flex flex-col h-full bg-brand-bg overflow-hidden">
        {/* Fixed Top App Bar */}
        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 z-20">
          <button onClick={() => setCurrentScreen('cart')} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg">Thanh toán</h1>
          <div className="w-10" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 min-h-0">
          {/* Address Section */}
          <section>
            <h3 className="font-bold text-lg mb-4">Địa chỉ giao hàng</h3>
            <div className="space-y-4">
              {addresses.map(addr => (
                <button 
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`w-full text-left bg-white rounded-2xl p-4 border-2 transition-all ${
                    selectedAddressId === addr.id ? 'border-brand-primary ring-2 ring-brand-primary/10' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-sm">{addr.name}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-brand-primary text-white px-2 py-0.5 rounded-full font-bold">Mặc định</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{addr.phone}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {addr.detail}, {addr.ward}, {addr.district}, {addr.city}
                  </p>
                  {addr.note && <p className="text-[10px] text-gray-400 mt-2 italic">Ghi chú: {addr.note}</p>}
                </button>
              ))}

              {!isAddingAddress ? (
                <button 
                  onClick={() => setIsAddingAddress(true)}
                  className="w-full border-2 border-dashed border-gray-200 text-gray-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Plus size={18} /> Thêm địa chỉ mới
                </button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white rounded-2xl p-6 border-2 border-gray-100 space-y-4"
                >
                  <h4 className="font-bold text-sm text-gray-900">Thông tin địa chỉ mới</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      placeholder="Họ và tên *" 
                      className="col-span-2 w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20"
                      value={newAddress.name}
                      onChange={e => setNewAddress({...newAddress, name: e.target.value})}
                    />
                    <input 
                      placeholder="Số điện thoại *" 
                      className="col-span-2 w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20"
                      value={newAddress.phone}
                      onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                    />
                    <input 
                      placeholder="Địa chỉ chi tiết *" 
                      className="col-span-2 w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20"
                      value={newAddress.detail}
                      onChange={e => setNewAddress({...newAddress, detail: e.target.value})}
                    />
                    <input 
                      placeholder="Phường/Xã" 
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20"
                      value={newAddress.ward}
                      onChange={e => setNewAddress({...newAddress, ward: e.target.value})}
                    />
                    <input 
                      placeholder="Quận/Huyện" 
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20"
                      value={newAddress.district}
                      onChange={e => setNewAddress({...newAddress, district: e.target.value})}
                    />
                    <input 
                      placeholder="Tỉnh/Thành phố" 
                      className="col-span-2 w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20"
                      value={newAddress.city}
                      onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                    />
                    <textarea 
                      placeholder="Ghi chú (không bắt buộc)" 
                      className="col-span-2 w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 h-20 resize-none"
                      value={newAddress.note}
                      onChange={e => setNewAddress({...newAddress, note: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setIsAddingAddress(false)}
                      className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Huỷ
                    </button>
                    <button 
                      onClick={handleSaveAddress}
                      className="flex-1 py-3 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-dark transition-colors"
                    >
                      Lưu địa chỉ
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* Shipping Section */}
          <section>
            <h3 className="font-bold text-lg mb-4">Phương thức vận chuyển</h3>
            <div className="space-y-3">
              {[
                { id: 'economy', name: 'Tiết kiệm', fee: 15000, time: '5-7 ngày' },
                { id: 'standard', name: 'Tiêu chuẩn', fee: 30000, time: '3-5 ngày' },
                { id: 'express', name: 'Nhanh', fee: 50000, time: '1-2 ngày' }
              ].map(m => (
                <button 
                  key={m.id}
                  onClick={() => setShippingMethod(m.id)}
                  className={`w-full flex items-center justify-between p-4 bg-white rounded-2xl border-2 transition-all ${
                    shippingMethod === m.id ? 'border-brand-primary ring-2 ring-brand-primary/10' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      shippingMethod === m.id ? 'border-brand-primary' : 'border-gray-300'
                    }`}>
                      {shippingMethod === m.id && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">{m.name}</p>
                      <p className="text-[10px] text-gray-500">{m.time}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm">{m.fee.toLocaleString()}đ</span>
                </button>
              ))}
            </div>
          </section>

          {/* Order Summary Section */}
          <section>
            <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {selectedItems.map((item, idx) => {
                const unitPrice = item.mode === 'buy' ? item.buy_price : item.rent_price_per_day * (activeTrip?.number_of_days || 1);
                const subtotal = unitPrice * item.quantity;
                return (
                  <div key={item.cart_id} className={`p-4 flex gap-4 ${idx !== selectedItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <img src={item.image} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {item.variant_name ? `${item.variant_name} – ` : ''}{item.mode === 'buy' ? 'Mua' : 'Thuê'}
                      </p>
                      <div className="flex justify-between items-end mt-1">
                        <p className="text-xs text-gray-500">
                          {item.quantity} × {unitPrice.toLocaleString()}đ
                        </p>
                        <p className="font-bold text-brand-primary text-sm">{subtotal.toLocaleString()}đ</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Voucher Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Mã giảm giá</h3>
              {appliedVoucher && (
                <button 
                  onClick={() => {
                    setAppliedVoucher(null);
                    setVoucherSuccess(null);
                  }}
                  className="text-red-500 text-xs font-bold"
                >
                  Huỷ áp dụng
                </button>
              )}
            </div>
            
            {!isVoucherExpanded && !appliedVoucher ? (
              <button 
                onClick={() => setIsVoucherExpanded(true)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-brand-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 text-gray-500">
                  <Tag size={20} />
                  <span className="text-sm font-medium">Nhập hoặc chọn mã giảm giá</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            ) : (
              <div className="space-y-4">
                {/* Manual Input */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input 
                      placeholder="Nhập mã voucher..." 
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                      value={voucherInput}
                      onChange={e => setVoucherInput(e.target.value.toUpperCase())}
                    />
                  </div>
                  <button 
                    onClick={() => handleApplyVoucher(voucherInput)}
                    className="bg-brand-primary text-white px-6 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>

                {voucherError && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-50 p-3 rounded-xl">
                    <AlertCircle size={14} />
                    {voucherError}
                  </div>
                )}
                {voucherSuccess && (
                  <div className="flex items-center gap-2 text-brand-primary text-xs font-medium bg-brand-primary/5 p-3 rounded-xl">
                    <Check size={14} />
                    {voucherSuccess}
                  </div>
                )}

                {/* Suggested Vouchers */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Voucher dành cho bạn</h4>
                  {vouchers.map(v => {
                    const result = validateVoucher(v, cart);
                    const isApplied = appliedVoucher?.code === v.code;
                    const status = getVoucherStatus(v);
                    
                    return (
                      <div 
                        key={v.code}
                        className={`bg-white rounded-2xl border-2 p-4 transition-all ${
                          isApplied ? 'border-brand-primary ring-2 ring-brand-primary/10' : 'border-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand-primary">{v.code}</span>
                              {status !== 'active' && (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">
                                  {status === 'scheduled' ? 'Sắp diễn ra' : 'Hết hạn'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold mt-1">{v.description}</p>
                          </div>
                          {!isApplied && (
                            <button 
                              disabled={!result.valid}
                              onClick={() => handleApplyVoucher(v.code)}
                              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                                result.valid 
                                  ? 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white' 
                                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                              }`}
                            >
                              Áp dụng
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-gray-50">
                          <p className="text-[10px] text-gray-400">
                            Min: <span className="text-gray-600 font-bold">{v.minOrder.toLocaleString()}đ</span>
                          </p>
                          {v.endTime && (
                            <p className="text-[10px] text-gray-400">
                              HSD: <span className="text-gray-600 font-bold">{new Date(v.endTime).toLocaleDateString('vi-VN')}</span>
                            </p>
                          )}
                          {!result.valid && result.reason && (
                            <p className="text-[10px] text-red-400 font-medium w-full mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {result.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={() => setIsVoucherExpanded(false)}
                  className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600"
                >
                  Thu gọn
                </button>
              </div>
            )}
          </section>

          {/* Payment Method Section */}
          <section>
            <h3 className="font-bold text-lg mb-4">Phương thức thanh toán</h3>
            <div className="space-y-3">
              {[
                { id: 'momo', name: 'Ví MoMo', icon: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' },
                { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' }
              ].map(m => (
                <button 
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`w-full flex items-center justify-between p-4 bg-white rounded-2xl border-2 transition-all ${
                    paymentMethod === m.id ? 'border-brand-primary ring-2 ring-brand-primary/10' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={m.icon} className="w-8 h-8 object-contain" alt="" referrerPolicy="no-referrer" />
                    <p className="font-bold text-sm">{m.name}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === m.id ? 'border-brand-primary' : 'border-gray-300'
                  }`}>
                    {paymentMethod === m.id && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Fixed Bottom Action Section */}
        <div className="bg-white p-6 pb-8 border-t border-gray-100 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] shrink-0 z-20">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tạm tính</span>
              <span>{cartTotal.toLocaleString()}đ</span>
            </div>
            {voucherDiscount > 0 && (
              <div className="flex justify-between text-sm text-brand-primary font-medium">
                <span>Giảm giá ({appliedVoucher?.code})</span>
                <span>-{voucherDiscount.toLocaleString()}đ</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Phí vận chuyển</span>
              <span>{fee.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <span className="font-bold">Tổng cộng</span>
              <span className="text-2xl font-bold text-brand-primary tracking-tight">{total.toLocaleString()}đ</span>
            </div>
          </div>
          <button 
            disabled={!isReadyToPay}
            onClick={async () => {
              const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: selectedItems, total })
              });
              const data = await res.json();
              if (data.success) {
                const selectedAddr = addresses.find(a => a.id === selectedAddressId) || addresses[0];
                const now = new Date();
                const deliveryDate = new Date();
                deliveryDate.setDate(now.getDate() + 5);

                const newOrder: Order = {
                  id: data.orderId,
                  createdAt: now.toISOString(),
                  orderDate: now.toLocaleDateString('vi-VN'),
                  orderTime: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  estimatedDeliveryDate: deliveryDate.toLocaleDateString('vi-VN'),
                  items: selectedItems.map(item => ({
                    product_id: item.product_id,
                    name: item.name,
                    image: item.image,
                    quantity: item.quantity,
                    unitPrice: item.mode === 'buy' ? item.buy_price : item.rent_price_per_day * (activeTrip?.number_of_days || 1),
                    mode: item.mode,
                    variant_name: item.variant_name,
                    rentalDays: item.mode === 'rent' ? (activeTrip?.number_of_days || 1) : undefined
                  })),
                  subtotal: cartTotal,
                  discount: voucherDiscount,
                  shippingFee: fee,
                  total: total,
                  status: 'Chờ xác nhận',
                  paymentMethod: paymentMethod,
                  address: {
                    name: selectedAddr.name,
                    phone: selectedAddr.phone,
                    detail: selectedAddr.detail,
                    ward: selectedAddr.ward,
                    district: selectedAddr.district,
                    city: selectedAddr.city
                  }
                };
                setOrders([newOrder, ...orders]);
                setLastOrderId(data.orderId);
                setCurrentScreen('success');
                refreshCart();
                setAppliedVoucher(null);
                setVoucherSuccess(null);
              }
            }}
            className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-400"
          >
            Thanh toán
          </button>
        </div>
      </div>
    );
  };

  const renderOrderTrackingScreen = () => {
    return (
      <div className="flex flex-col h-full bg-brand-bg overflow-hidden">
        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 z-20">
          <button onClick={() => setCurrentScreen('main')} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg">Đơn hàng của tôi</h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ShoppingBag size={48} strokeWidth={1.5} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Bạn chưa có đơn hàng nào</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">#{order.id}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Ngày đặt: {order.orderDate}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    order.status === 'Chờ xác nhận' ? 'bg-orange-50 text-orange-600' :
                    order.status === 'Chuẩn bị giao' ? 'bg-blue-50 text-blue-600' :
                    order.status === 'Đang giao' ? 'bg-indigo-50 text-indigo-600' :
                    order.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 py-3 border-y border-gray-50">
                  <div className="flex -space-x-4 overflow-hidden">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <img 
                        key={idx} 
                        src={item.image} 
                        className="w-10 h-10 rounded-lg border-2 border-white object-cover" 
                        alt="" 
                        referrerPolicy="no-referrer"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-gray-400 mb-1">
                      {order.status === 'Hoàn thành' ? `Đã giao ngày: ${order.deliveredDate}` : `Ngày giao dự kiến: ${order.estimatedDeliveryDate}`}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        {order.items.length} sản phẩm
                      </p>
                      <p className="font-bold text-sm text-brand-primary">
                        {order.total.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setCurrentScreen('orderDetail');
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Xem chi tiết
                  </button>
                  <button 
                    disabled={!(order.status === 'Chờ xác nhận' || order.status === 'Chuẩn bị giao')}
                    onClick={() => {
                      setOrderToCancel(order);
                      setShowCancelConfirm(true);
                    }}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                      (order.status === 'Chờ xác nhận' || order.status === 'Chuẩn bị giao')
                        ? 'border-red-100 text-red-500 hover:bg-red-50'
                        : 'border-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Hủy đơn hàng
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderCancelConfirmDialog = () => {
    const isConfirmDisabled = !cancelReason || (cancelReason === 'Lý do khác' && !customCancelReason.trim());

    return (
      <AnimatePresence>
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center p-6 sm:items-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCancelConfirm(false);
                setCancelReason('');
                setCustomCancelReason('');
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh]"
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6 sm:hidden" />
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Hủy đơn hàng?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">Vui lòng chọn lý do hủy đơn hàng của bạn.</p>
              
              <div className="space-y-3 mb-8">
                {[
                  'Muốn thay đổi địa chỉ nhận hàng',
                  'Muốn thay đổi sản phẩm/số lượng',
                  'Tìm thấy nơi khác giá rẻ hơn',
                  'Không còn nhu cầu mua nữa',
                  'Lý do khác'
                ].map(reason => (
                  <div key={reason} className="space-y-3">
                    <button 
                      onClick={() => {
                        setCancelReason(reason);
                        if (reason !== 'Lý do khác') setCustomCancelReason('');
                      }}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all text-sm font-medium ${
                        cancelReason === reason ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-50 text-gray-600'
                      }`}
                    >
                      {reason}
                    </button>
                    {reason === 'Lý do khác' && cancelReason === 'Lý do khác' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <textarea
                          ref={cancelReasonRef}
                          value={customCancelReason}
                          onChange={(e) => setCustomCancelReason(e.target.value.slice(0, 200))}
                          placeholder="Vui lòng nhập lý do hủy đơn hàng"
                          className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-brand-primary outline-none text-sm min-h-[100px] resize-none"
                          maxLength={200}
                        />
                        <div className="flex justify-end mt-1">
                          <span className="text-[10px] text-gray-400">{customCancelReason.length}/200</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancelReason('');
                    setCustomCancelReason('');
                  }}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Đóng
                </button>
                <button 
                  disabled={isConfirmDisabled}
                  onClick={() => {
                    if (orderToCancel) {
                      setOrders(orders.map(o => o.id === orderToCancel.id ? { ...o, status: 'Đã hủy' } : o));
                      setShowCancelConfirm(false);
                      setCancelReason('');
                      setCustomCancelReason('');
                      setOrderToCancel(null);
                      alert('Hủy đơn hàng thành công');
                    }
                  }}
                  className="flex-1 py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-colors disabled:bg-gray-200 disabled:shadow-none"
                >
                  Xác nhận hủy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const renderOrderDetailScreen = () => {
    if (!selectedOrder) return null;
    return (
      <div className="flex flex-col h-full bg-brand-bg overflow-hidden">
        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 z-20">
          <button onClick={() => setCurrentScreen('orderTracking')} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg">Chi tiết đơn hàng</h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-6 rounded-3xl flex items-center justify-between ${
            selectedOrder.status === 'Chờ xác nhận' ? 'bg-orange-50 text-orange-600' :
            selectedOrder.status === 'Chuẩn bị giao' ? 'bg-blue-50 text-blue-600' :
            selectedOrder.status === 'Đang giao' ? 'bg-indigo-50 text-indigo-600' :
            selectedOrder.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-600' :
            'bg-gray-100 text-gray-500'
          }`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Trạng thái</p>
              <h2 className="text-xl font-bold">{selectedOrder.status}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center">
              {selectedOrder.status === 'Hoàn thành' ? <Check size={24} /> : <Truck size={24} />}
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Mã đơn hàng</span>
              <span className="font-bold text-sm">#{selectedOrder.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Ngày đặt hàng</span>
              <span className="font-bold text-sm">{selectedOrder.orderDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Giờ đặt hàng</span>
              <span className="font-bold text-sm">{selectedOrder.orderTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Ngày giao dự kiến</span>
              <span className="font-bold text-sm">{selectedOrder.estimatedDeliveryDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Phương thức thanh toán</span>
              <span className="font-bold text-sm uppercase">{selectedOrder.paymentMethod}</span>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-brand-primary" /> Địa chỉ nhận hàng
            </h3>
            <p className="font-bold text-sm">{selectedOrder.address.name}</p>
            <p className="text-xs text-gray-500 mt-1">{selectedOrder.address.phone}</p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedOrder.address.detail}, {selectedOrder.address.ward}, {selectedOrder.address.district}, {selectedOrder.address.city}
            </p>
          </div>

          {/* Items */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="font-bold text-sm">Sản phẩm</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="p-4 flex gap-4">
                  <img src={item.image} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {item.variant_name ? `${item.variant_name} – ` : ''}{item.mode === 'buy' ? 'Mua' : `Thuê (${item.rentalDays} ngày)`}
                    </p>
                    <div className="flex justify-between items-end mt-1">
                      <p className="text-xs text-gray-500">
                        {item.quantity} × {item.unitPrice.toLocaleString()}đ
                      </p>
                      <p className="font-bold text-brand-primary text-sm">{(item.unitPrice * item.quantity).toLocaleString()}đ</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tạm tính</span>
              <span>{selectedOrder.subtotal.toLocaleString()}đ</span>
            </div>
            {selectedOrder.discount > 0 && (
              <div className="flex justify-between text-sm text-brand-primary font-medium">
                <span>Giảm giá</span>
                <span>-{selectedOrder.discount.toLocaleString()}đ</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Phí vận chuyển</span>
              <span>{selectedOrder.shippingFee.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-50">
              <span className="font-bold">Tổng cộng</span>
              <span className="text-xl font-bold text-brand-primary">{selectedOrder.total.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Cancel Button in Detail */}
          <button 
            disabled={!(selectedOrder.status === 'Chờ xác nhận' || selectedOrder.status === 'Chuẩn bị giao')}
            onClick={() => {
              setOrderToCancel(selectedOrder);
              setShowCancelConfirm(true);
            }}
            className={`w-full py-4 rounded-2xl border-2 font-bold transition-colors ${
              (selectedOrder.status === 'Chờ xác nhận' || selectedOrder.status === 'Chuẩn bị giao')
                ? 'border-red-100 text-red-500 hover:bg-red-50'
                : 'border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            Hủy đơn hàng
          </button>
        </div>
      </div>
    );
  };

  const renderSuccessScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-24 h-24 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-8"
      >
        <Check size={48} strokeWidth={3} />
      </motion.div>
      <h1 className="text-3xl font-bold mb-2 tracking-tight">Thanh toán thành công!</h1>
      <p className="text-gray-500 mb-8">Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
      
      <div className="w-full bg-gray-50 rounded-3xl p-6 mb-8 text-left">
        <div className="flex justify-between mb-4">
          <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Mã đơn hàng</span>
          <span className="font-bold text-sm">#{lastOrderId || 'ET-882910'}</span>
        </div>
        <div className="space-y-3">
          {appliedVoucher && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Giảm giá ({appliedVoucher.code})</span>
              <span className="text-brand-primary font-bold">-{voucherDiscount.toLocaleString()}đ</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Trạng thái</span>
            <span className="text-brand-primary font-bold">Đã thanh toán</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Dự kiến giao</span>
            <span className="font-bold">Trong 3-5 ngày tới</span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => {
          setCurrentScreen('main');
          setActiveTab('shop');
        }}
        className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20"
      >
        Quay lại cửa hàng
      </button>
    </div>
  );

  const renderProductDetailScreen = () => {
    if (!selectedProduct) return null;

    const currentStock = productDetailMode === 'buy' 
      ? (selectedVariant ? selectedVariant.stock_buy : selectedProduct.stock_buy)
      : (selectedVariant ? selectedVariant.stock_rent : selectedProduct.stock_rent);

    const unitPrice = productDetailMode === 'buy' 
      ? (selectedVariant?.buy_price || (selectedProduct.buy_price + (selectedVariant?.price_modifier || 0)))
      : (selectedVariant?.rent_price_per_day || (selectedProduct.rent_price_per_day + (selectedVariant?.price_modifier || 0) / 10));
    
    const totalPrice = unitPrice * productDetailQuantity * (productDetailMode === 'rent' ? (activeTrip?.number_of_days || 1) : 1);

    const specs = selectedProduct.specifications ? JSON.parse(selectedProduct.specifications) : {};

    const handleAddToCart = (e: React.MouseEvent) => {
      if (!productDetailMode) {
        setValidationError('Vui lòng chọn chế độ Mua hoặc Thuê');
        return;
      }
      if (selectedProduct.attributes) {
        const productAttrNames = JSON.parse(selectedProduct.attributes);
        if (Object.keys(selectedAttributes).length < productAttrNames.length) {
          setValidationError('Vui lòng chọn đầy đủ các thuộc tính');
          return;
        }
      }
      if (selectedProduct.variants?.length && !selectedVariant) {
        setValidationError('Phiên bản này hiện không khả dụng');
        return;
      }
      if (currentStock <= 0) {
        setValidationError('Sản phẩm hiện đang hết hàng');
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      addToCart(
        selectedProduct.id, 
        productDetailMode, 
        selectedVariant?.id, 
        productDetailQuantity,
        { x: rect.left + rect.width / 2, y: rect.top },
        selectedProduct.image
      );
      setCurrentScreen('cart');
    };

    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="relative h-80 shrink-0">
          <img src={selectedProduct.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
          <div className="absolute top-8 left-6 right-6 flex justify-between items-center">
            <button onClick={() => setCurrentScreen('main')} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
              <ChevronLeft size={24} />
            </button>
            <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
              <Heart size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 -mt-8 bg-white rounded-t-[40px] shadow-2xl relative z-10">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                  {selectedProduct.category}
                </span>
                <h1 className="text-2xl font-bold tracking-tight">{selectedProduct.name}</h1>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-brand-primary tracking-tight">{unitPrice.toLocaleString()}đ</p>
                <p className="text-[10px] text-gray-400 font-medium">{productDetailMode === 'rent' ? '/ ngày' : 'giá bán'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold">4.8</span>
              <span className="text-xs text-gray-400">(120 đánh giá)</span>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Hình thức</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setProductDetailMode('buy');
                  setValidationError(null);
                }}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                  productDetailMode === 'buy' ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-100 text-gray-400'
                }`}
              >
                Mua
              </button>
              <button 
                onClick={() => {
                  setProductDetailMode('rent');
                  setValidationError(null);
                }}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                  productDetailMode === 'rent' ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-100 text-gray-400'
                }`}
              >
                Thuê
              </button>
            </div>
          </div>

          {/* Multi-Attribute Variants */}
          {selectedProduct.attributes && (
            <div className="space-y-6 mb-8">
              {JSON.parse(selectedProduct.attributes).map((attrName: string) => {
                const options = getAvailableOptions(selectedProduct, attrName, selectedAttributes);
                return (
                  <div key={attrName}>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">{attrName}</h3>
                    <div className="flex flex-wrap gap-2">
                      {options.map(opt => {
                        const isSelected = selectedAttributes[attrName] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              const newAttrs = { ...selectedAttributes, [attrName]: opt };
                              setSelectedAttributes(newAttrs);
                              const matching = findMatchingVariant(selectedProduct, newAttrs);
                              setSelectedVariant(matching);
                              setValidationError(null);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                              isSelected
                                ? 'border-brand-primary bg-brand-primary/5 text-brand-primary ring-2 ring-brand-primary/10'
                                : 'border-gray-100 text-gray-600 hover:border-gray-200'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Số lượng</h3>
              <p className="text-[10px] text-gray-400">Còn lại: {currentStock} sản phẩm</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
              <button 
                disabled={productDetailQuantity <= 1 || currentStock <= 0}
                onClick={() => setProductDetailQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 disabled:opacity-30"
              >
                <Minus size={18} />
              </button>
              <input 
                type="number"
                value={productDetailQuantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    if (val > currentStock) {
                      setValidationError('Số lượng vượt quá số lượng tồn kho');
                      setProductDetailQuantity(currentStock);
                    } else {
                      setProductDetailQuantity(Math.max(1, val));
                      setValidationError(null);
                    }
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                    setProductDetailQuantity(1);
                  }
                }}
                className="w-12 text-center font-bold bg-transparent border-none focus:ring-0"
              />
              <button 
                disabled={productDetailQuantity >= currentStock || currentStock <= 0}
                onClick={() => {
                  if (productDetailQuantity < currentStock) {
                    setProductDetailQuantity(q => q + 1);
                    setValidationError(null);
                  } else {
                    setValidationError('Số lượng vượt quá số lượng tồn kho');
                  }
                }}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 disabled:opacity-30"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Mô tả sản phẩm</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
          </div>

          {/* Specifications */}
          {Object.keys(specs).length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Thông số kỹ thuật</h3>
              <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                {Object.entries(specs).map(([key, value], i) => (
                  <div key={key} className={`flex justify-between p-4 text-sm ${i !== Object.keys(specs).length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <span className="text-gray-500">{key}</span>
                    <span className="font-bold text-gray-900">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Hướng dẫn sử dụng</h3>
            <div className="bg-gray-50 p-4 rounded-2xl">
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{selectedProduct.instructions}</p>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Đánh giá từ người dùng</h3>
            {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
              <div className="space-y-6">
                {selectedProduct.reviews.map(r => (
                  <div key={r.id} className="border-b border-gray-100 pb-6 last:border-none">
                    <div className="flex gap-3 mb-3">
                      <img src={r.image} className="w-10 h-10 rounded-full" alt="" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-sm">{r.user_name}</p>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{r.comment}</p>
                    <div className="flex gap-4 mb-4 overflow-x-auto no-scrollbar">
                      <img src={`https://picsum.photos/seed/${r.id}/300/300`} className="w-24 h-24 rounded-xl object-cover shadow-sm" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                        <p className="text-[8px] text-gray-400 uppercase font-bold mb-1">Độ bền</p>
                        <p className="text-xs font-bold text-brand-primary">{r.durability}/5</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                        <p className="text-[8px] text-gray-400 uppercase font-bold mb-1">Độ mới</p>
                        <p className="text-xs font-bold text-brand-primary">{r.newness}/5</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                        <p className="text-[8px] text-gray-400 uppercase font-bold mb-1">Chất liệu</p>
                        <p className="text-xs font-bold text-brand-primary">{r.material}/5</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-4">Sản phẩm chưa có review</p>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-white border-t border-gray-100 shadow-2xl z-20">
          {validationError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl mb-4 text-center"
            >
              {validationError}
            </motion.div>
          )}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 font-medium">Tổng thanh toán</p>
              <p className="text-2xl font-bold text-brand-primary tracking-tight">{totalPrice.toLocaleString()}đ</p>
            </div>
            {productDetailMode === 'rent' && (
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-medium">Thời gian thuê</p>
                <p className="text-sm font-bold text-gray-900">{activeTrip?.number_of_days || 1} ngày</p>
              </div>
            )}
          </div>
          <button 
            disabled={currentStock <= 0}
            onClick={handleAddToCart}
            className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
            {currentStock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
          </button>
        </div>
      </div>
    );
  };

  const renderAddToCartModal = () => {
    if (!productToAddToCart) return null;

    const currentStock = productDetailMode === 'buy' 
      ? (selectedVariant ? selectedVariant.stock_buy : productToAddToCart.stock_buy)
      : (selectedVariant ? selectedVariant.stock_rent : productToAddToCart.stock_rent);

    const unitPrice = productDetailMode === 'buy' 
      ? (selectedVariant?.buy_price || (productToAddToCart.buy_price + (selectedVariant?.price_modifier || 0)))
      : (selectedVariant?.rent_price_per_day || (productToAddToCart.rent_price_per_day + (selectedVariant?.price_modifier || 0) / 10));
    
    const totalPrice = unitPrice * productDetailQuantity * (productDetailMode === 'rent' ? (activeTrip?.number_of_days || 1) : 1);

    return (
      <AnimatePresence>
        {isAddToCartModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddToCartModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[101] p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              
              <div className="flex gap-4 mb-8">
                <img src={productToAddToCart.image} className="w-24 h-24 rounded-2xl object-cover shadow-md" alt="" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{productToAddToCart.name}</h3>
                  <p className="text-brand-primary font-bold text-xl">
                    {totalPrice.toLocaleString()}đ
                    <span className="text-xs text-gray-400 font-medium ml-1">
                      {productDetailMode === 'rent' ? '/ ngày' : 'giá bán'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Kho: {currentStock}</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Mode Selection */}
                <div>
                  <h4 className="text-sm font-bold mb-3">Hình thức</h4>
                  <div className="flex gap-3">
                    {['buy', 'rent'].map((m) => (
                      <button 
                        key={m}
                        onClick={() => {
                          setProductDetailMode(m as 'buy' | 'rent');
                          setValidationError(null);
                        }}
                        className={`flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                          productDetailMode === m ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-100 text-gray-400'
                        }`}
                      >
                        {m === 'buy' ? 'Mua' : 'Thuê'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi-Attribute Variants */}
                {productToAddToCart.attributes && (
                  <div className="space-y-6">
                    {JSON.parse(productToAddToCart.attributes).map((attrName: string) => {
                      const options = getAvailableOptions(productToAddToCart, attrName, selectedAttributes);
                      return (
                        <div key={attrName}>
                          <h4 className="text-sm font-bold mb-3">{attrName}</h4>
                          <div className="flex flex-wrap gap-2">
                            {options.map(opt => {
                              const isSelected = selectedAttributes[attrName] === opt;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    const newAttrs = { ...selectedAttributes, [attrName]: opt };
                                    setSelectedAttributes(newAttrs);
                                    const matching = findMatchingVariant(productToAddToCart, newAttrs);
                                    setSelectedVariant(matching);
                                    setValidationError(null);
                                  }}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                    isSelected
                                      ? 'border-brand-primary bg-brand-primary/5 text-brand-primary ring-2 ring-brand-primary/10'
                                      : 'border-gray-100 text-gray-600 hover:border-gray-200'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">Số lượng</h4>
                  <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                    <button 
                      disabled={productDetailQuantity <= 1 || currentStock <= 0}
                      onClick={() => setProductDetailQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 disabled:opacity-30"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number"
                      value={productDetailQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          if (val > currentStock) {
                            setValidationError('Số lượng vượt quá số lượng tồn kho');
                            setProductDetailQuantity(currentStock);
                          } else {
                            setProductDetailQuantity(Math.max(1, val));
                            setValidationError(null);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                          setProductDetailQuantity(1);
                        }
                      }}
                      className="w-12 text-center font-bold bg-transparent border-none focus:ring-0"
                    />
                    <button 
                      disabled={productDetailQuantity >= currentStock || currentStock <= 0}
                      onClick={() => {
                        if (productDetailQuantity < currentStock) {
                          setProductDetailQuantity(q => q + 1);
                          setValidationError(null);
                        } else {
                          setValidationError('Số lượng vượt quá số lượng tồn kho');
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 disabled:opacity-30"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {validationError && (
                  <p className="text-red-500 text-xs font-bold text-center">{validationError}</p>
                )}

                <button 
                  disabled={currentStock <= 0}
                  onClick={(e) => {
                    if (productDetailQuantity > currentStock) {
                      setValidationError('Số lượng vượt quá số lượng tồn kho');
                      return;
                    }
                    if (productToAddToCart.attributes) {
                      const productAttrNames = JSON.parse(productToAddToCart.attributes);
                      if (Object.keys(selectedAttributes).length < productAttrNames.length) {
                        setValidationError('Vui lòng chọn đầy đủ các thuộc tính');
                        return;
                      }
                    }
                    if (productToAddToCart.variants?.length && !selectedVariant) {
                      setValidationError('Phiên bản này hiện không khả dụng');
                      return;
                    }

                    const rect = e.currentTarget.getBoundingClientRect();
                    addToCart(
                      productToAddToCart.id, 
                      productDetailMode, 
                      selectedVariant?.id, 
                      productDetailQuantity, 
                      { x: rect.left + rect.width / 2, y: rect.top },
                      productToAddToCart.image
                    );
                    setIsAddToCartModalOpen(false);
                  }}
                  className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {currentStock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  const renderEditCartModal = () => {
    if (!editingCartItem) return null;
    const product = products.find(p => p.id === editingCartItem.product_id);
    if (!product) return null;

    const currentStock = editMode === 'buy' 
      ? (editVariant ? editVariant.stock_buy : product.stock_buy)
      : (editVariant ? editVariant.stock_rent : product.stock_rent);

    const unitPrice = editMode === 'buy' 
      ? (editVariant?.buy_price || (product.buy_price + (editVariant?.price_modifier || 0)))
      : (editVariant?.rent_price_per_day || (product.rent_price_per_day + (editVariant?.price_modifier || 0) / 10));
    
    const totalPrice = unitPrice * editQuantity * (editMode === 'rent' ? (activeTrip?.number_of_days || 1) : 1);

    const handleConfirmEdit = () => {
      if (product.attributes) {
        const productAttrNames = JSON.parse(product.attributes);
        if (Object.keys(editAttributes).length < productAttrNames.length) {
          setEditError('Vui lòng chọn đầy đủ các thuộc tính');
          return;
        }
      }
      if (product.variants?.length && !editVariant) {
        setEditError('Phiên bản này hiện không khả dụng');
        return;
      }
      if (editQuantity > currentStock) {
        setEditError('Số lượng vượt quá số lượng tồn kho');
        return;
      }

      updateCartItem(editingCartItem.cart_id, {
        mode: editMode,
        variant_id: editVariant?.id || null,
        quantity: editQuantity
      });
      setIsEditCartModalOpen(false);
    };

    return (
      <AnimatePresence>
        {isEditCartModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditCartModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[101] p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              
              <div className="flex gap-4 mb-8">
                <img src={product.image} className="w-24 h-24 rounded-2xl object-cover shadow-md" alt="" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-brand-primary font-bold text-xl">
                    {totalPrice.toLocaleString()}đ
                    <span className="text-xs text-gray-400 font-medium ml-1">
                      {editMode === 'rent' ? '/ ngày' : 'giá bán'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Kho: {currentStock}</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Mode Selection */}
                <div>
                  <h4 className="text-sm font-bold mb-3">Hình thức</h4>
                  <div className="flex gap-3">
                    {['buy', 'rent'].map((m) => (
                      <button 
                        key={m}
                        onClick={() => {
                          setEditMode(m as 'buy' | 'rent');
                          setEditError(null);
                        }}
                        className={`flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                          editMode === m ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-100 text-gray-400'
                        }`}
                      >
                        {m === 'buy' ? 'Mua' : 'Thuê'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi-Attribute Variants */}
                {product.attributes && (
                  <div className="space-y-6">
                    {JSON.parse(product.attributes).map((attrName: string) => {
                      const options = getAvailableOptions(product, attrName, editAttributes);
                      return (
                        <div key={attrName}>
                          <h4 className="text-sm font-bold mb-3">{attrName}</h4>
                          <div className="flex flex-wrap gap-2">
                            {options.map(opt => {
                              const isSelected = editAttributes[attrName] === opt;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    const newAttrs = { ...editAttributes, [attrName]: opt };
                                    setEditAttributes(newAttrs);
                                    const variant = findMatchingVariant(product, newAttrs);
                                    setEditVariant(variant);
                                    setEditError(null);
                                  }}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                    isSelected 
                                      ? 'border-brand-primary bg-brand-primary/5 text-brand-primary ring-2 ring-brand-primary/10' 
                                      : 'border-gray-100 text-gray-600 hover:border-gray-200'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quantity Selection */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">Số lượng</h4>
                  <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                    <button 
                      onClick={() => setEditQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number"
                      value={editQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          if (val > currentStock) {
                            setEditError('Số lượng vượt quá số lượng tồn kho');
                            setEditQuantity(currentStock);
                          } else {
                            setEditQuantity(Math.max(1, val));
                            setEditError(null);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                          setEditQuantity(editingCartItem.quantity);
                        }
                      }}
                      className="w-12 text-center font-bold bg-transparent border-none focus:ring-0"
                    />
                    <button 
                      onClick={() => {
                        if (editQuantity < currentStock) {
                          setEditQuantity(q => q + 1);
                          setEditError(null);
                        } else {
                          setEditError('Số lượng vượt quá số lượng tồn kho');
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {editError && (
                  <p className="text-red-500 text-xs font-bold text-center">{editError}</p>
                )}

                <button 
                  disabled={currentStock <= 0}
                  onClick={handleConfirmEdit}
                  className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {currentStock <= 0 ? 'Hết hàng' : 'Xác nhận thay đổi'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  const renderContent = () => {
    if (currentScreen === 'planning') return renderPlanningFlow();
    if (currentScreen === 'cart') return renderCartScreen();
    if (currentScreen === 'checkout') return renderCheckoutScreen();
    if (currentScreen === 'success') return renderSuccessScreen();
    if (currentScreen === 'productDetail') return renderProductDetailScreen();
    if (currentScreen === 'orderTracking') return renderOrderTrackingScreen();
    if (currentScreen === 'orderDetail') return renderOrderDetailScreen();

    switch (activeTab) {
      case 'home': return renderHomeScreen();
      case 'shop': return renderShopScreen();
      default: return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="italic">Tính năng đang phát triển</p>
          </div>
        </div>
      );
    }
  };

  return (
    <MobileViewport>
      <AnimatePresence>
        {flyAnimation && (
          <motion.img 
            initial={{ x: flyAnimation.x, y: flyAnimation.y, scale: 1, opacity: 1 }}
            animate={{ 
              x: window.innerWidth - 60, 
              y: 40, 
              scale: 0.2, 
              opacity: 0 
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            src={flyAnimation.image}
            className="fixed w-24 h-24 rounded-2xl object-cover z-[200] pointer-events-none shadow-xl"
            referrerPolicy="no-referrer"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen + activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      
      {currentScreen === 'main' && (
        <BottomNav active={activeTab} onChange={setActiveTab} />
      )}
      
      {renderAddToCartModal()}
      {renderEditCartModal()}
      {renderCancelConfirmDialog()}
      <ConfirmDialog 
        isOpen={confirmDialog?.isOpen || false}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        onConfirm={confirmDialog?.onConfirm || (() => {})}
        onCancel={confirmDialog?.onCancel || (() => {})}
      />
    </MobileViewport>
  );
}
