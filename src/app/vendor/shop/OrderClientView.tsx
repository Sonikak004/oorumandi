'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { placeOrder } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, ArrowLeft, Trash2, ChevronDown } from 'lucide-react';

type Product = { id: string; name: string; variant: string; price: number; originalPrice: number; img: string };
type CartState = Record<string, { category: string; product: Product; branches: Record<string, number> }>;

const ALL_CATEGORIES = [
  { id: 'vegetables', name: 'Vegetables', img: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg' },
  { id: 'fruits', name: 'Fruits', img: '/images/apple.png' },
  { id: 'milk', name: 'Dairy', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScB5KDudl4z78wYRRMz7J8ufHWBk0cqrAm-N9oz4PEBA&s=10' },
  { id: 'chicken', name: 'Chicken', img: '/images/chicken_category.png' },
  { id: 'eggs', name: 'Eggs', img: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Chicken_egg_2009-06-04.jpg' },
];

const PRODUCTS_DB: Record<string, Product[]> = {
  milk: [
    { id: 'm1', name: 'Nandini Pasteurised Toned Milk', variant: '500ml', price: 22, originalPrice: 24, img: '/images/blue_milk_500ml_new.png' },
    { id: 'm2', name: 'Nandini Pasteurised Toned Milk', variant: '1L', price: 42, originalPrice: 44, img: '/images/blue_milk_1ltr_new.png' },
    { id: 'm3', name: 'Nandini Shubham Milk', variant: '500ml', price: 26, originalPrice: 28, img: '/images/orange_milk_500ml_new.png' },
    { id: 'm4', name: 'Nandini Shubham Milk', variant: '1L', price: 50, originalPrice: 52, img: '/images/orange_milk_1ltr_new.png' },
    { id: 'm5', name: 'Nandini Curd', variant: '500g', price: 24, originalPrice: 26, img: '/images/nandini_curd_500ml.webp' },
    { id: 'm6', name: 'Nandini Curd', variant: '250g', price: 12, originalPrice: 14, img: '/images/nandini_curd_250ml.jpg' },
  ],
  chicken: [
    { id: 'c1', name: 'Chicken Curry Cut with skin', variant: '1 Kg Pack', price: 260, originalPrice: 280, img: '/images/chicken_curry_cut_with_skin_1kg.jpg' },
    { id: 'c2', name: 'Chicken Curry Cut skinless', variant: '1 Kg Pack', price: 280, originalPrice: 300, img: '/images/chicken_curry_cut_1kg.png' },
    { id: 'c3', name: 'Chicken Biryani Cut with skin', variant: '1 Kg Pack', price: 260, originalPrice: 280, img: '/images/chicken_with_skin_1kg.png' },
    { id: 'c4', name: 'Chicken Biryani Cut skinless', variant: '1 Kg Pack', price: 280, originalPrice: 300, img: '/images/chicken_biryani_cut_1kg.png' },
    { id: 'c5', name: 'Chicken Keema', variant: '1 Kg Pack', price: 320, originalPrice: 350, img: '/images/chicken_keema_1kg.png' },
  ],
  vegetables: [
    { id: 'v1', name: 'Onion', variant: '1 Kg Pack', price: 40, originalPrice: 45, img: '/images/onion.png' },
    { id: 'v2', name: 'Tomato', variant: '1 Kg Pack', price: 30, originalPrice: 35, img: '/images/tomato.png' },
    { id: 'v3', name: 'Potato', variant: '1 Kg Pack', price: 35, originalPrice: 40, img: '/images/potato.png' },
    { id: 'v4', name: 'Yellow Capsicum', variant: '1 Kg Pack', price: 80, originalPrice: 90, img: '/images/yellow_capsicum.png' },
    { id: 'v5', name: 'Red Capsicum', variant: '1 Kg Pack', price: 80, originalPrice: 90, img: '/images/red_capsicum.png' },
    { id: 'v10', name: 'Green Capsicum', variant: '1 Kg Pack', price: 70, originalPrice: 80, img: '/images/green_capsicum.png' },
    { id: 'v11', name: 'Beans', variant: '1 Kg Pack', price: 60, originalPrice: 70, img: '/images/beans.png' },
    { id: 'v12', name: 'Beetroot', variant: '1 Kg Pack', price: 45, originalPrice: 50, img: '/images/beetroot.png' },
    { id: 'v13', name: 'Bottle Gourd', variant: '1 Piece', price: 30, originalPrice: 35, img: '/images/bottle_gourd.png' },
    { id: 'v14', name: 'Carrot', variant: '1 Kg Pack', price: 55, originalPrice: 65, img: '/images/carrot.png' },
    { id: 'v15', name: 'Radish', variant: '1 Kg Pack', price: 40, originalPrice: 45, img: '/images/radish.png' },
  ],
  fruits: [
    { id: 'f1', name: 'Coconut', variant: '1 Piece', price: 30, originalPrice: 35, img: '/images/coconut.png' },
    { id: 'f2', name: 'Watermelon', variant: '2-3 kg (1 Piece)', price: 100, originalPrice: 120, img: '/images/watermelon.png' },
    { id: 'f3', name: 'Banana', variant: '1 Kg Pack', price: 60, originalPrice: 70, img: '/images/banana.png' },
    { id: 'f4', name: 'Apple', variant: '1 Kg Pack', price: 150, originalPrice: 180, img: '/images/apple.png' },
  ],
  eggs: [
    { id: 'e1', name: 'White Farm Eggs', variant: 'Tray of 30', price: 180, originalPrice: 200, img: '/images/egg_tray.png' },
  ]
};

export default function OrderClientView({ branches, initialCategory }: { branches: any[], initialCategory: string }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isSearching, setIsSearching] = useState(!!initialSearch);
  const [cart, setCart] = useState<CartState>({});
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('Morning (6AM - 9AM)');
  
  const products = useMemo(() => PRODUCTS_DB[activeCategory] || [], [activeCategory]);
  
  // Load initial cart on client mount to avoid hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem('oorumandi_cart');
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch (e) {}
    }
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeliveryDate(tomorrow.toISOString().split('T')[0]);
    
    setIsLoaded(true);
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('oorumandi_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantities, setModalQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [expandedCartCategories, setExpandedCartCategories] = useState<Record<string, boolean>>({});

  const toggleCartCategory = (cat: string) => {
    setExpandedCartCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const openBranchModal = (product: Product) => {
    setSelectedProduct(product);
    setModalQuantities(cart[product.id]?.branches || {});
  };

  const handleModalQuantityChange = (branchId: string, value: string) => {
    const qty = parseInt(value, 10);
    setModalQuantities(prev => ({
      ...prev,
      [branchId]: isNaN(qty) ? 0 : Math.max(0, qty)
    }));
  };

  const confirmModalQuantities = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const filteredBranches: Record<string, number> = {};
    Object.entries(modalQuantities).forEach(([branchId, qty]) => {
      if (qty > 0) filteredBranches[branchId] = qty;
    });
    
    if (Object.keys(filteredBranches).length > 0) {
      setCart(prev => ({
        ...prev,
        [selectedProduct.id]: { category: activeCategory, product: selectedProduct, branches: filteredBranches }
      }));
    } else {
      setCart(prev => {
        const newCart = { ...prev };
        delete newCart[selectedProduct.id];
        return newCart;
      });
    }
    setSelectedProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const itemsToOrder: any[] = [];
      Object.values(cart).forEach(item => {
        Object.entries(item.branches).forEach(([branchId, quantity]) => {
          if (quantity > 0) {
            itemsToOrder.push({
              productName: item.product.name,
              variant: item.product.variant,
              branchId,
              quantity
            });
          }
        });
      });
      
      if (itemsToOrder.length > 0) {
        await placeOrder(itemsToOrder, deliveryDate, deliveryTime);
      }
      
      setCart({});
      setCartOpen(false);
      localStorage.removeItem('oorumandi_cart');
      router.push('/vendor/orders');
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    }
    setLoading(false);
  };

  const totalAllocated = Object.values(cart).reduce((acc, item) => acc + Object.values(item.branches).reduce((a,b)=>a+b, 0), 0);
  const categoriesInCart = Array.from(new Set(Object.values(cart).map(i => i.category)));

  return (
    <div className="bg-[#fcfcfc] flex-1 flex flex-col min-h-0 font-sans">
      {/* Top Header section */}
      <div className="px-4 py-4 flex-none bg-white border-b border-gray-100 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] z-10">
        <div className="flex items-center gap-2">
          <Link href="/vendor" className="text-xl font-bold text-gray-800 hover:text-[#ef4f5f] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-extrabold capitalize text-gray-900">Explore</h1>
        </div>
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setIsSearching(!isSearching)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer shadow-sm transition-colors ${isSearching ? 'bg-[#ef4f5f] border-[#ef4f5f] text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            <Search className="w-4 h-4" />
          </div>
          <div className="relative cursor-pointer group" onClick={() => setCartOpen(true)}>
            <div className="w-10 h-10 bg-[#ef4f5f] rounded-full flex items-center justify-center text-white shadow-md group-hover:bg-red-600 transition-colors">
              <ShoppingCart className="w-4 h-4" />
            </div>
            {totalAllocated > 0 && (
              <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {totalAllocated}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Two pane layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-20 sm:w-24 bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
          {ALL_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center py-4 relative border-b border-gray-50 transition-colors ${isActive ? 'bg-[#fcfcfc]' : 'hover:bg-gray-50'}`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ef4f5f]"></div>}
                <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center mb-2 ${isActive ? 'bg-[#fdf2f2] shadow-inner' : 'bg-gray-50'}`}>
                  <img src={cat.img} alt={cat.name} className={`w-full h-full object-cover mix-blend-darken ${isActive ? '' : 'opacity-70'}`} />
                </div>
                <span className={`text-[10px] sm:text-xs text-center leading-tight ${isActive ? 'font-bold text-[#ef4f5f]' : 'font-medium text-gray-400'}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex-1 overflow-y-auto bg-[#fcfcfc] p-3 sm:p-5 relative">
          <h2 className="font-extrabold text-[#1a2f4c] text-xl mb-4 capitalize">{activeCategory}</h2>
          
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pb-8">
            {products.map(product => {
              const cartItem = cart[product.id];
              const totalQty = cartItem ? Object.values(cartItem.branches).reduce((a, b) => a + b, 0) : 0;
              
              return (
                <div key={product.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col relative shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all">
                  
                  {/* Image & Add Button Area */}
                  <div className="w-full h-24 sm:h-28 bg-transparent mb-6 mt-2 relative flex items-center justify-center">
                     <img src={product.img} alt={product.name} className="w-20 h-20 sm:w-24 sm:h-24 object-contain mix-blend-darken drop-shadow-sm" />
                     
                     {/* Floating ADD Button */}
                     <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-24 sm:w-28 shadow-md bg-white rounded-lg border border-red-500 overflow-hidden flex z-20">
                       {totalQty === 0 ? (
                         <button type="button" onClick={() => openBranchModal(product)} className="w-full py-1.5 text-[#ef4f5f] font-extrabold text-xs sm:text-sm relative bg-[#fff5f5] hover:bg-red-50 transition-colors uppercase tracking-wide">
                           Add <span className="absolute right-2 top-1.5 text-[10px]">+</span>
                         </button>
                       ) : (
                         <div className="w-full flex items-center justify-between bg-[#fff5f5]">
                            <button type="button" onClick={() => openBranchModal(product)} className="w-8 py-1.5 text-[#ef4f5f] font-bold text-lg hover:bg-red-100 transition-colors">−</button>
                            <span className="flex-1 text-center font-bold text-[#ef4f5f] text-sm">{totalQty}</span>
                            <button type="button" onClick={() => openBranchModal(product)} className="w-8 py-1.5 text-[#ef4f5f] font-bold text-lg hover:bg-red-100 transition-colors">+</button>
                         </div>
                       )}
                     </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 flex flex-col mt-3 pt-2 items-center text-center">
                    <h3 className="text-xs sm:text-sm font-bold text-[#1a2f4c] leading-tight mb-2 line-clamp-2">{product.name}</h3>
                    <span className="bg-gray-50 text-gray-500 px-2.5 py-0.5 rounded text-[10px] font-bold border border-gray-100">{product.variant}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Branch Modal */}
          {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#1a2f4c]/40 backdrop-blur-sm sm:p-4">
              <div className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-[slideUp_0.3s_ease-out]">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div>
                    <h3 className="font-extrabold text-[#1a2f4c] text-lg leading-tight mb-1">{selectedProduct.name}</h3>
                    <span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-100">{selectedProduct.variant}</span>
                  </div>
                  <button type="button" onClick={() => setSelectedProduct(null)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 font-bold hover:bg-gray-100 transition-colors">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#fcfcfc]">
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Allocate quantity</p>
                  {branches.map(branch => (
                    <div key={branch.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:border-gray-200 transition-colors">
                      <span className="font-bold text-[#1a2f4c] text-sm">{branch.name}</span>
                      <div className="flex items-center border border-[#ef4f5f] rounded-xl h-10 w-28 overflow-hidden bg-[#fff5f5]">
                        <button type="button" onClick={() => handleModalQuantityChange(branch.id, String((modalQuantities[branch.id] || 0) - 1))} className="w-10 h-full text-[#ef4f5f] font-bold text-xl hover:bg-red-100 transition-colors">−</button>
                        <span className="flex-1 text-center font-bold text-sm text-[#ef4f5f] bg-white h-full flex items-center justify-center border-x border-[#ef4f5f]/20">{modalQuantities[branch.id] || 0}</span>
                        <button type="button" onClick={() => handleModalQuantityChange(branch.id, String((modalQuantities[branch.id] || 0) + 1))} className="w-10 h-full text-[#ef4f5f] font-bold text-xl hover:bg-red-100 transition-colors">+</button>
                      </div>
                    </div>
                  ))}
                  {branches.length === 0 && (
                    <div className="text-gray-500 text-sm py-4 text-center bg-white rounded-xl border border-gray-100">No branches found.</div>
                  )}
                </div>
                
                <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0">
                  <button type="button" onClick={confirmModalQuantities} className="w-full bg-[#ef4f5f] hover:bg-red-600 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-red-200 transition-all text-lg tracking-wide">
                    Confirm Allocation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FULL SCREEN CART MODAL */}
          {isCartOpen && (
            <div className="fixed inset-0 z-[100] flex flex-col bg-[#fdf9f5] animate-[slideUp_0.2s_ease-out]">
              {/* Cart Header */}
              <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-3">
                  <button onClick={() => setCartOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-800 hover:bg-gray-50 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-extrabold text-[#1a2f4c]">{totalAllocated} items in cart</h1>
                </div>
                {totalAllocated > 0 && (
                  <button onClick={() => setCart({})} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto pb-32">
                {Object.keys(cart).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                       <ShoppingCart className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1a2f4c] mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 text-sm">Looks like you haven't added any stock yet.</p>
                    <button onClick={() => setCartOpen(false)} className="mt-6 font-bold text-[#ef4f5f] bg-red-50 px-6 py-2.5 rounded-full hover:bg-red-100 transition-colors">Start adding items</button>
                  </div>
                ) : (
                  <div className="p-3 sm:p-5 max-w-3xl mx-auto w-full">
                    {categoriesInCart.map(cat => {
                      const itemsInCat = Object.values(cart).filter(item => item.category === cat);
                      return (
                        <div key={cat} className="mb-4 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                          <div 
                            className="px-5 py-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleCartCategory(cat)}
                          >
                             <h3 className="font-extrabold text-[#1a2f4c] text-base capitalize">{cat} ({itemsInCat.length})</h3>
                             <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedCartCategories[cat] ? 'rotate-180' : ''}`} />
                          </div>
                          
                          <div className={`divide-y divide-gray-100 ${expandedCartCategories[cat] ? 'hidden' : 'block'}`}>
                            {itemsInCat.map(item => {
                              const itemTotal = Object.values(item.branches).reduce((a,b)=>a+b,0);
                              return (
                                <div key={item.product.id} className="p-5">
                                  <div className="flex gap-4 mb-4">
                                    <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center p-1.5 flex-none shadow-sm">
                                      <img src={item.product.img} className="w-full h-full object-contain mix-blend-darken" />
                                    </div>
                                    <div className="flex-1 pt-1">
                                      <h4 className="font-bold text-sm text-[#1a2f4c] leading-tight mb-2">{item.product.name}</h4>
                                      <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">{item.product.variant}</span>
                                    </div>
                                    <div className="flex-none pt-1">
                                      <span className="font-black text-xl text-[#1a2f4c]">{itemTotal}</span>
                                      <span className="text-[10px] block text-center font-bold text-gray-400 mt-0.5">TOTAL</span>
                                    </div>
                                  </div>
                                  
                                  {/* Branch Breakdown */}
                                  <div className="bg-[#fcfcfc] rounded-xl p-3 border border-gray-50 sm:ml-20">
                                    {Object.entries(item.branches).map(([bId, qty]) => {
                                      if (qty === 0) return null;
                                      const bName = branches.find(b => b.id === bId)?.name;
                                      return (
                                        <div key={bId} className="flex justify-between items-center text-gray-600 text-xs py-1.5 border-b border-gray-50 last:border-0">
                                          <span className="font-semibold text-gray-500">{bName}</span>
                                          <span className="font-black text-[#ef4f5f]">Qty {qty}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    })}

                    {/* Delivery Date & Time Options */}
                    <div className="mt-4 mb-6 bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex flex-col sm:flex-row gap-5 shadow-sm">
                      <div className="flex-1">
                        <label className="block text-[11px] font-extrabold text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <span>📅</span> Delivery Date
                        </label>
                        <input 
                          type="date" 
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="w-full border border-blue-200/50 bg-white rounded-xl px-4 py-3 text-sm font-bold text-[#1a2f4c] shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                          required 
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[11px] font-extrabold text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <span>⏱️</span> Time Slot
                        </label>
                        <select 
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className="w-full border border-blue-200/50 bg-white rounded-xl px-4 py-3 text-sm font-bold text-[#1a2f4c] shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                          required
                        >
                          <option>Morning (6AM - 9AM)</option>
                          <option>Day (9AM - 2PM)</option>
                          <option>Evening (4PM - 8PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Bar */}
              {totalAllocated > 0 && (
                <div className="bg-white border-t border-gray-200 sticky bottom-0 z-10 p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                  <div className="max-w-3xl mx-auto w-full">
                    


                    <button 
                      type="button" 
                      onClick={handleSubmit}
                      disabled={loading || totalAllocated === 0}
                      className={`w-full font-extrabold py-4 rounded-2xl shadow-lg transition-all text-lg tracking-wide ${loading || totalAllocated === 0 ? 'bg-gray-200 text-gray-400 shadow-none' : 'bg-[#ef4f5f] hover:bg-red-600 hover:-translate-y-0.5 text-white shadow-red-200'}`}
                    >
                      {loading ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
