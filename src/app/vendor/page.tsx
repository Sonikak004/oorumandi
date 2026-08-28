'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';

const CATEGORIES = [
  { id: 'vegetables', name: 'Vegetables', href: '/vendor/shop?cat=vegetables', img: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg' },
  { id: 'fruits', name: 'Fruits', href: '/vendor/shop?cat=fruits', img: '/images/apple.png' },
  { id: 'milk', name: 'Dairy', href: '/vendor/shop?cat=milk', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScB5KDudl4z78wYRRMz7J8ufHWBk0cqrAm-N9oz4PEBA&s=10' },
  { id: 'chicken', name: 'Chicken', href: '/vendor/shop?cat=chicken', img: '/images/chicken_category.png' },
  { id: 'eggs', name: 'Eggs', href: '/vendor/shop?cat=eggs', img: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Chicken_egg_2009-06-04.jpg' },
];

export default function VendorDashboard() {
  return (
    <div className="bg-white flex-1 overflow-y-auto font-sans pb-10">
      <div className="px-5 pt-8">
        
        {/* Search bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl flex items-center px-4 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-[#ef4f5f]/20 focus-within:border-[#ef4f5f] transition-all">
            <Search className="text-gray-400 mr-3 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search products or categories..." 
              className="flex-1 bg-transparent border-none text-[#1a2f4c] text-sm font-medium outline-none placeholder:font-normal placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Categories Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-[#1a2f4c] text-lg">Categories</h3>
          <Link href="/vendor/shop">
            <span className="text-[#ef4f5f] text-[11px] font-bold cursor-pointer bg-red-50 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors">View All</span>
          </Link>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6">
          {CATEGORIES.map(cat => (
             <Link key={cat.id} href={cat.href} className="flex flex-col bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(239,79,95,0.08)] hover:border-[#ef4f5f]/30 transition-all group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 relative">
                <div className="absolute inset-0 bg-gray-50 rounded-full scale-90 group-hover:bg-[#fff5f5] transition-colors z-0"></div>
                <img src={cat.img} alt={cat.name} className="w-full h-full object-contain relative z-10 drop-shadow-sm group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 mix-blend-darken" />
              </div>
              <span className="text-[15px] font-extrabold text-[#1a2f4c] text-center tracking-tight mb-2 mt-auto">{cat.name}</span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
