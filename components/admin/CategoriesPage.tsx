'use client';

import { Pencil, Plus, Trash2, X } from 'lucide-react';
import React, { useState, useEffect, FormEvent } from 'react';

// Define the type for a category
interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the form
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  // Fetch categories from the API
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/admin/categories');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.error.message || 'Failed to fetch categories.');
      }
    } catch (err) {
      setError('An error occurred while fetching categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Effect to prevent body scroll when the panel is open
  useEffect(() => {
    if (isPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isPanelOpen]);

  const openPanelForNew = () => {
    setCurrentCategory(null);
    setName('');
    setSlug('');
    setIsPanelOpen(true);
  };

  const openPanelForEdit = (category: Category) => {
    setCurrentCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setCurrentCategory(null);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const isEditing = !!currentCategory;
    const url = isEditing ? `/api/v1/admin/categories/${currentCategory.id}` : '/api/v1/admin/categories';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      });

      const data = await response.json();
      if (data.success) {
        fetchCategories(); // Re-fetch to show the new/updated data
        closePanel();
      } else {
        alert(`Error: ${data.error.message || 'An unknown error occurred.'}`);
      }
    } catch (err) {
      alert('An error occurred while saving the category.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all products within it.')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/admin/categories/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        fetchCategories(); // Re-fetch to update the list
      } else {
        alert(`Error: ${data.error.message || 'Failed to delete category.'}`);
      }
    } catch (err) {
      alert('An error occurred while deleting the category.');
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Product Categories</h1>
          <button
            onClick={openPanelForNew}
            className="flex items-center justify-center bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2 transition-colors cursor-pointer"
            aria-haspopup="dialog"
            aria-expanded={isPanelOpen}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Slug</th>
                <th scope="col" className="px-6 py-3">Date Created</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-4 text-gray-500">Loading categories...</td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="text-center py-4 text-red-600">{error}</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4 text-gray-500">No categories found.</td></tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{category.name}</td>
                    <td className="px-6 py-4">{category.slug}</td>
                    <td className="px-6 py-4">{new Date(category.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openPanelForEdit(category)} aria-label={`Edit ${category.name}`} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-blue-600 cursor-pointer">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(category.id)} aria-label={`Delete ${category.name}`} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-red-600 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${isPanelOpen ? 'opacity-100 bg-black/60' : 'opacity-0 pointer-events-none'}`}
        onClick={closePanel}
        role="presentation"
      ></div>

      {/* Slide-in Panel */}
      <div
        id="add-category-panel"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 id="panel-title" className="text-lg font-semibold text-gray-800">{currentCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <button 
              onClick={closePanel}
              className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form className="flex-1 overflow-y-auto" onSubmit={handleFormSubmit}>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  id="category-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="category-slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Slug
                </label>
                <input
                  type="text"
                  id="category-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end p-4 border-t bg-gray-50 space-x-2 absolute bottom-0 w-full">
              <button 
                type="button" 
                onClick={closePanel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-lg shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CategoriesPage;
