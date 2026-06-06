import React, { useState } from 'react';
import { 
  Tags, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye,
  Check,
  X
} from 'lucide-react';
import { useListingsStore } from '../store/listingsStore';

interface CategoryItem {
  id: string;
  name: string;
  count: number;
  color: string;
}

export const Categories = () => {
  const { listings } = useListingsStore();
  
  // Base Categories
  const initialCategories: CategoryItem[] = [
    { id: '1', name: 'XRF Machines', count: listings.filter(l => l.category === 'XRF Machines').length, color: '#D4AF37' },
    { id: '2', name: 'Laser Marking', count: listings.filter(l => l.category === 'Laser Marking').length, color: '#1A1A1A' },
    { id: '3', name: 'Micro Balances', count: listings.filter(l => l.category === 'Micro Balances').length, color: '#4B5563' },
    { id: '4', name: 'Fire Assay Equipment', count: listings.filter(l => l.category === 'Fire Assay Equipment').length, color: '#9CA3AF' }
  ];

  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#D4AF37');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: CategoryItem = {
      id: Date.now().toString(),
      name: newCatName,
      count: 0,
      color: newCatColor
    };

    setCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatColor('#D4AF37');
  };

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = (id: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name: editingName } : c));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? All associated listings may need to be recategorized.')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 text-left">Marketplace Categories</h2>
          <p className="text-xs text-gray-400 text-left">Configure jewellery hallmarking machinery classifications displayed inside the mobile app filters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category List Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300 relative overflow-hidden group"
            >
              {/* Top border colored bar */}
              <div 
                className="absolute top-0 inset-x-0 h-1.5"
                style={{ backgroundColor: cat.color }}
              />

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-gray-50 text-gray-500">
                    <Tags size={20} />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === cat.id ? (
                      <>
                        <button 
                          onClick={() => handleSaveEdit(cat.id)}
                          className="p-1 hover:bg-green-50 text-green-600 rounded"
                          title="Save Changes"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="p-1 hover:bg-red-50 text-red-600 rounded"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleStartEdit(cat)}
                          className="p-1 hover:bg-gray-100 text-gray-500 rounded"
                          title="Rename Category"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded"
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === cat.id ? (
                  <input 
                    type="text" 
                    value={editingName} 
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <h4 className="font-bold text-gray-800 text-lg text-left">{cat.name}</h4>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-4 text-xs">
                <span className="text-gray-400">Total Listings</span>
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  <Eye size={12} /> {cat.count} listings
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Category Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Plus className="text-gold" size={18} />
            Create Category
          </h3>
          <form onSubmit={handleAddCategory} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Category Name</label>
              <input 
                type="text" 
                placeholder="e.g. Seeders, Balers" 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Theme Color</label>
              <div className="flex gap-2.5 items-center mt-1">
                <input 
                  type="color" 
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-10 h-10 border border-gray-200 rounded cursor-pointer p-0"
                />
                <span className="text-xs text-gray-400 font-mono uppercase">{newCatColor}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-dark hover:bg-black text-white font-bold rounded-xl text-sm transition-colors"
            >
              Add Category
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
