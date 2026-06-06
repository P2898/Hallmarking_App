import { useState, useEffect } from 'react';
import { 
  Search, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Star, 
  MapPin, 
  Clock, 
  User
} from 'lucide-react';
import { useListingsStore, type Listing } from '../store/listingsStore';

export const Listings = () => {
  const { 
    listings, 
    approveListing, 
    rejectListing, 
    toggleFeatured, 
    deleteListing,
    subscribeToListings
  } = useListingsStore();

  useEffect(() => { subscribeToListings(); }, [subscribeToListings]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Listing for Drawer
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Filtered Listings
  const filteredListings = listings.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 min-h-[calc(100vh-4rem)]">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search listings by title, brand, model, or seller..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all text-sm"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase">Category</span>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="XRF Machines">XRF Machines</option>
              <option value="Laser Marking">Laser Marking</option>
              <option value="Micro Balances">Micro Balances</option>
              <option value="Fire Assay Equipment">Fire Assay Equipment</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="sold">Sold</option>
            </select>
          </div>


        </div>
      </div>

      {/* Grid of Listings */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 space-y-2">
          <p className="text-gray-500 font-semibold text-lg">No listings found</p>
          <p className="text-sm text-gray-400">Try adjusting your filter search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <div 
              key={listing.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow duration-300"
            >
              {/* Product Image & Badges */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img 
                  src={listing.imageUrls[0]} 
                  alt={listing.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                
                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm ${
                    listing.status === 'approved' ? 'bg-green-500 text-white' :
                    listing.status === 'pending' ? 'bg-amber-500 text-white' :
                    listing.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {listing.status}
                  </span>

                </div>

                {/* Featured Badge */}
                <button 
                  onClick={() => toggleFeatured(listing.id)}
                  className={`absolute top-3 right-3 p-1.5 rounded-full shadow-sm transition-colors ${
                    listing.featured ? 'bg-gold text-dark' : 'bg-white/80 text-gray-400 hover:text-gold hover:bg-white'
                  }`}
                >
                  <Star size={16} fill={listing.featured ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gold tracking-wider">{listing.category}</span>
                    <span className="text-xs text-gray-400">ID: {listing.id}</span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-base line-clamp-1">{listing.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{listing.yearOfPurchase} purchase</span>
                    <span>•</span>
                    <span>{listing.yearsUsed} yrs used</span>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2">{listing.description}</p>
                </div>

                {/* Location and Price */}
                <div className="space-y-3 pt-3 border-t border-gray-50">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {listing.city}, {listing.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} /> {listing.sellerName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800">
                      {listing.price ? `₹${listing.price.toLocaleString('en-IN')}` : 'Make Offer'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setSelectedListing(listing)}
                        className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors border border-gray-200"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      
                      {listing.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => approveListing(listing.id)}
                            className="p-1.5 bg-green-55 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
                            title="Approve Listing"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => rejectListing(listing.id)}
                            className="p-1.5 bg-red-55 hover:bg-red-100 text-red-700 rounded-lg transition-colors border border-red-200"
                            title="Reject Listing"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => {
                          if (window.confirm('Delete this listing?')) {
                            deleteListing(listing.id);
                          }
                        }}
                        className="p-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition-colors border border-gray-200"
                        title="Delete Listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listing Details Side Drawer */}
      {selectedListing && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 transition-opacity"
            onClick={() => setSelectedListing(null)}
          />

          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Machinery Ad Details</h3>
                <p className="text-xs text-gray-400">ID: {selectedListing.id}</p>
              </div>
              <button 
                onClick={() => setSelectedListing(null)}
                className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Main Image */}
              <div className="relative h-56 bg-gray-100 rounded-xl overflow-hidden">
                <img 
                  src={selectedListing.imageUrls[0]} 
                  alt={selectedListing.title} 
                  className="w-full h-full object-cover" 
                />
                <span className={`absolute top-3 left-3 text-xs font-bold uppercase px-2.5 py-1 rounded-full text-white ${
                  selectedListing.status === 'approved' ? 'bg-green-500' :
                  selectedListing.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                }`}>
                  {selectedListing.status}
                </span>
              </div>

              {/* Title & Brand */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider">{selectedListing.category}</span>
                <h4 className="text-xl font-bold text-gray-800">{selectedListing.title}</h4>
                <div className="flex items-center gap-1.5 text-lg font-bold text-gray-800">
                  {selectedListing.price ? `₹${selectedListing.price.toLocaleString('en-IN')}` : 'Make Offer'}
                </div>
              </div>

              {/* Machinery Specs */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Brand</p>
                  <p className="font-semibold text-gray-800">{selectedListing.brand}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Condition</p>
                  <p className="font-semibold text-gray-800">{selectedListing.condition}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Year of Purchase</p>
                  <p className="font-semibold text-gray-800">{selectedListing.yearOfPurchase}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Years Used</p>
                  <p className="font-semibold text-gray-800">{selectedListing.yearsUsed} Years</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Warranty</p>
                  <p className="font-semibold text-gray-800">{selectedListing.warranty}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Pricing Type</p>
                  <p className="font-semibold text-gray-800 capitalize">{selectedListing.pricingType}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</h5>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedListing.description}</p>
              </div>

              {/* Location & Date */}
              <div className="flex justify-between py-3 border-y border-gray-50 text-sm">
                <span className="flex items-center gap-1 text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  {selectedListing.city}, {selectedListing.state}
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  Listed {selectedListing.createdDate}
                </span>
              </div>

              {/* Seller Information */}
              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seller Details</h5>
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-150">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm">
                      {selectedListing.sellerName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{selectedListing.sellerName}</p>
                      <p className="text-xs text-gray-400">ID: {selectedListing.sellerId}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                {selectedListing.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        approveListing(selectedListing.id);
                        setSelectedListing({ ...selectedListing, status: 'approved' });
                      }}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => {
                        rejectListing(selectedListing.id);
                        setSelectedListing({ ...selectedListing, status: 'rejected' });
                      }}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      toggleFeatured(selectedListing.id);
                      setSelectedListing({ ...selectedListing, featured: !selectedListing.featured });
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-colors ${
                      selectedListing.featured 
                        ? 'bg-gold/10 border-gold text-gold hover:bg-gold/20' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Star size={16} fill={selectedListing.featured ? 'currentColor' : 'none'} />
                    {selectedListing.featured ? 'Featured Ad' : 'Feature Listing'}
                  </button>

                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this advertisement?')) {
                        deleteListing(selectedListing.id);
                        setSelectedListing(null);
                      }
                    }}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-200"
                    title="Delete Ad Permanently"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
