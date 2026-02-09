'use client'

import axios from 'axios';
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Pencil, Plus, Search, Trash2, X, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import { useDebounce } from 'use-debounce';

interface ProductVariant {
  id: string;
  size: string;
  price: string;
  stock: number;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  genderTags: ('Male' | 'Female' | 'Unisex')[];
  inStock: boolean;
  createdAt: string;
  category: Category;
  variants: ProductVariant[];
  discountPercentage: number | null;
  isBestSeller: boolean;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const StockBadge: React.FC<{ inStock: boolean }> = ({ inStock }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {inStock ? 'In Stock' : 'Out of Stock'}
  </span>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label?: string }> = ({ checked, onChange, label }) => (
  <div 
    onClick={() => onChange(!checked)}
    className={`
      relative inline-flex items-center h-7 w-12 rounded-full cursor-pointer transition-colors duration-200 ease-in-out border-2
      ${checked ? 'bg-green-500 border-green-500' : 'bg-gray-200 border-gray-200'}
    `}
  >
    <span 
      className={`
        inline-block w-5 h-5 transform bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out
        ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}
      `} 
    />
  </div>
);

const StockCell = ({ variants }: { variants: ProductVariant[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Calculate total stock dynamically
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
          totalStock > 0
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
        }`}
        title="Click to see breakdown"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${totalStock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
        {totalStock} Units
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gray-50/50 px-4 py-2 border-b border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock Breakdown</span>
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1">
            {variants.map((variant, idx) => (
              <div key={idx} className="flex justify-between items-center px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="text-sm text-gray-600 font-medium">{variant.size} ml</span>
                <span className={`text-sm font-bold ${variant.stock > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                  {variant.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoryId, setCategoryId] = useState('');
  const [genderTags, setGenderTags] = useState<string[]>([]);
  const [inStock, setInStock] = useState(true);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [variants, setVariants] = useState<{ id?: string; size: string; price: string; stock: string }[]>([{ size: '', price: '', stock: '0' }]);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({ category: '', status: '', gender: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 7;

  const getStockStatus = (variants: ProductVariant[]) => {
    const total = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    if (total === 0) return 'critical';
    if (total < 10) return 'low';
    return 'good';
  };

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: debouncedSearchTerm,
        category: filters.category,
        status: filters.status,
        gender: filters.gender,
      });
      const response = await axios.get(`/api/v1/admin/products?${params.toString()}`);
      setProducts(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, filters, itemsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/admin/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.data);
      if (data.data.length > 0) {
        setCategoryId(data.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isPanelOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isPanelOpen]);

  useEffect(() => {
    if (name && !currentProduct) {
       const generatedSlug = name.toLowerCase()
        .trim()
        .replace(/ /g, '-')       
        .replace(/[^\w-]+/g, ''); 
       setSlug(generatedSlug);
    }
  }, [name, currentProduct]);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setImageUrls([]);
    setCategoryId(categories[0]?.id || '');
    setGenderTags([]);
    setInStock(true);
    setDiscountPercentage('');
    setVariants([{ size: '', price: '', stock: '0'  }]);
    setIsBestSeller(false);
  };

  const openPanelForNew = () => {
    setCurrentProduct(null);
    resetForm();
    setIsPanelOpen(true);
  };

  const openPanelForEdit = (product: Product) => {
    setCurrentProduct(product);
    setName(product.name);
    setSlug(product.slug);
    setDescription(product.description || '');
    setImageUrls(product.images);
    setCategoryId(product.category.id);
    setGenderTags(product.genderTags);
    setInStock(product.inStock);
    setDiscountPercentage(product.discountPercentage ? product.discountPercentage.toString() : '');
    setVariants(product.variants.map(({ id, size, price, stock }) => ({ 
        id, 
        size, 
        price, 
        stock: stock.toString() 
    })));
    setIsPanelOpen(true);
    setIsBestSeller(product.isBestSeller || false);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setCurrentProduct(null);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEditing = !!currentProduct;
    const url = isEditing ? `/api/v1/admin/products/${currentProduct.id}` : '/api/v1/admin/products';
    const method = isEditing ? 'put' : 'post';

    const payload = {
      name,
      slug,
      description,
      images: imageUrls,
      categoryId,
      genderTags,
      inStock,
      isBestSeller,
      discountPercentage: discountPercentage ? parseFloat(discountPercentage) : 0,
      variants: variants.map(v => ({ 
          ...v, 
          price: parseFloat(v.price),
          stock: parseInt(v.stock) || 0 
      })).filter(v => v.size && !isNaN(v.price) && v.price > 0),
    };

    try {
      const response = await axios[method](url, payload);
      if (response.data.success) {
        await fetchProducts();
        closePanel();
      }
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      const message = errorData?.message || 'An unknown error occurred.';
      console.error(errorData);
      alert(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await axios.post('/api/v1/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.success) {
          uploadedUrls.push(response.data.data.url);
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('An image failed to upload. Please try again.');
      }
    }

    setImageUrls(prev => [...prev, ...uploadedUrls]);
    setIsUploading(false);
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (urlToRemove: string) => {
    setImageUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/v1/admin/products/${id}`);
        await fetchProducts();
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  const handleVariantChange = (index: number, field: 'size' | 'price' | 'stock', value: string) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => setVariants([...variants, { size: '', price: '', stock: '0' }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const handleGenderChange = (gender: string) => {
    setGenderTags(prev => prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({ category: '', status: '', gender: '' });
    setCurrentPage(1);
  };

  const formatPriceRange = (variants: ProductVariant[]): string => {
    if (variants.length === 0) return 'N/A';
    const prices = variants.map(v => parseFloat(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return minPrice === maxPrice ? `₹${minPrice.toFixed(2)}` : `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`;
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <button onClick={openPanelForNew} className="flex! items-center justify-center bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2 transition-colors cursor-pointer">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div 
                className="p-4 rounded-lg border border-red-100 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => setFilters(prev => ({ ...prev, status: 'false' }))}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-red-900">Out of Stock</p>
                        <p className="text-xs text-red-600">Click to view items</p>
                    </div>
                </div>
            </div>
            {/* You can add more summary cards here for Low Stock or Total Value */}
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-3 py-2 border text-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Search by product name..." />
              </div>
            </div>
            <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full px-3 py-2 border text-gray-600 cursor-pointer border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 border text-gray-600 cursor-pointer border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">Any Status</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
            <select name="gender" value={filters.gender} onChange={handleFilterChange} className="w-full px-3 py-2 border text-gray-600 cursor-pointer border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Product</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3">Stock</th>
                <th scope="col" className="px-6 py-3">Date Added</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-red-500">{error}</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No products found.</td>
                </tr>
              ) : (
                products.map(product => {
                const status = getStockStatus(product.variants);
                const rowClass = status === 'critical' 
                    ? 'bg-red-50 border-l-4 border-l-red-500' 
                    : status === 'low' 
                        ? 'bg-yellow-50 border-l-4 border-l-yellow-400' 
                        : 'bg-white border-b hover:bg-gray-50';

                return (
                    <tr key={product.id} className={`${rowClass} transition-colors`}>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            {status === 'critical' && <span className="text-[10px] text-red-600 font-bold uppercase">Out of Stock</span>}
                            {status === 'low' && <span className="text-[10px] text-yellow-700 font-bold uppercase">Low Stock</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{product.category.name}</td>
                      <td className="px-6 py-4">{formatPriceRange(product.variants)}</td>
                      <td className="px-6 py-4">
                        <StockCell variants={product.variants} />
                      </td>
                      <td className="px-6 py-4">{new Date(product.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => openPanelForEdit(product)} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2 py-3 border-t">
            <span className="text-sm text-gray-700">Showing <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span> to <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-medium">{meta.total}</span> results</span>
            <div className="flex items-center space-x-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={meta.page === 1} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /></button>
              <span className="text-sm font-medium">{meta.page} / {meta.totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.page === meta.totalPages} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>

      <div 
        className={`fixed inset-0 z-999 bg-black/50 transition-opacity duration-300 ease-in-out ${isPanelOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} 
        onClick={closePanel}
      ></div>
      <div className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-xl z-1000 transform transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <form className="flex flex-col h-full" onSubmit={handleFormSubmit}>
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">{currentProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <button type="button" onClick={closePanel} className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input type="text" id="product-name" value={name} onChange={e => setName(e.target.value)} required placeholder="Enter product name" className="w-full px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm transition-all" />
            </div>
            <div>
              <label htmlFor="product-slug" className="block text-sm font-medium text-gray-700 mb-1">Product Slug</label>
              <input type="text" id="product-slug" value={slug} onChange={e => setSlug(e.target.value)} required placeholder="e.g., celestial-aura-perfume" className="w-full px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm transition-all" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Enter product description" className="w-full px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm transition-all"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {imageUrls.map(url => (
                  <div key={url} className="relative group">
                    <img src={url} alt="Product image" className="h-24 w-24 object-cover rounded-lg" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(url)} 
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10"
                      title="Remove Image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  ) : (
                    <ImagePlus className="h-8 w-8 text-gray-400" />
                  )}
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                </label>
              </div>
              {isUploading && <p className="text-sm text-gray-500 mt-2">Uploading images...</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select id="category" value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm cursor-pointer transition-all">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input 
                  type="number" 
                  id="discount" 
                  value={discountPercentage} 
                  onChange={e => setDiscountPercentage(e.target.value)} 
                  min="0" 
                  max="100" 
                  placeholder="0" 
                  className="w-full px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm transition-all" 
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                    <span className="block text-sm font-bold text-gray-700">Stock Availability</span>
                    <span className="text-xs text-gray-500">{inStock ? 'Product is visible' : 'Product is hidden/unavailable'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                        {inStock ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </span>
                    <ToggleSwitch checked={inStock} onChange={setInStock} />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                    <span className="block text-sm font-bold text-gray-700">Best Seller</span>
                    <span className="text-xs text-gray-500">{isBestSeller ? 'Product is marked as Best Seller' : 'Not a Best Seller'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isBestSeller ? 'text-amber-600' : 'text-gray-400'}`}>
                        {isBestSeller ? 'YES' : 'NO'}
                    </span>
                    <ToggleSwitch checked={isBestSeller} onChange={setIsBestSeller} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender Tags</label>
              <div className="flex space-x-4">
                {['Male', 'Female', 'Unisex'].map(gender => (
                  <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={genderTags.includes(gender)} onChange={() => handleGenderChange(gender)} className="h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-800" />
                    <span className="text-sm text-gray-600">{gender}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2 border-b pb-2">Product Variants</h3>
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={variant.id || index} className="flex items-end gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                      <input 
                        type="text" 
                        value={variant.size} 
                        onChange={e => handleVariantChange(index, 'size', e.target.value)} 
                        placeholder="e.g. 50ml, Size 32, or One Size" 
                        className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm transition-all" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
                      <input 
                        type="number" 
                        value={variant.price} 
                        onChange={e => handleVariantChange(index, 'price', e.target.value)} 
                        placeholder="e.g., 2500" 
                        className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm transition-all" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Stock Qty</label>
                      <input 
                        type="number" 
                        value={variant.stock} 
                        onChange={e => handleVariantChange(index, 'stock', e.target.value)} 
                        placeholder="0" 
                        min="0"
                        className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm transition-all" 
                      />
                    </div>
                    <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-500 rounded-lg hover:bg-red-100 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={addVariant} className="text-sm font-medium text-gray-800 hover:text-gray-600 cursor-pointer">+ Add Variant</button>
              </div>
            </div>
          </div>
          <div className="flex! justify-end! p-4! border-t! bg-gray-50! space-x-2!">
            <button type="button" onClick={closePanel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button 
              type="submit"
              disabled={isUploading || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-lg shadow-sm hover:bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex! items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
