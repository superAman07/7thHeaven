'use client';

import { Pencil, Plus, Trash2, X, Image as ImageIcon, Loader2, Layers, Tags } from 'lucide-react';
import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';

interface Collection {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  createdAt: string;
  _count?: { categories: number };
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (name && !currentId) {
       // Auto-generate slug from name only when creating new
       setSlug(name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
    }
  }, [name, currentId]);

  const fetchCollections = async () => {
    try {
      const res = await axios.get('/api/v1/collections');
      if (res.data.success) {
        setCollections(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch collections');
    } finally {
      setIsLoading(false);
    }
  };

  const openPanel = (collection?: Collection) => {
    if (collection) {
      setCurrentId(collection.id);
      setName(collection.name);
      setSlug(collection.slug);
      setImage(collection.image || '');
      setDescription(collection.description || '');
    } else {
      setCurrentId(null);
      setName('');
      setSlug('');
      setImage('');
      setDescription('');
    }
    setIsPanelOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/api/v1/admin/upload', formData);
      if (res.data.success) setImage(res.data.data.url);
    } catch {
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Since we didn't make a specific PUT endpoint yet, we might need to handle updates differently 
      // OR for now just support CREATE (POST). Ideally update your API to support PUT too.
      // Assuming you will add PUT to your API later, here is the logic:
      
      const payload = { name, slug, image, description };
      
      if (currentId) { 
         await axios.put(`/api/v1/collections/${currentId}`, payload);
      } else {
         await axios.post('/api/v1/collections', payload);
      }
      
      fetchCollections();
      setIsPanelOpen(false);
    } catch (error) {
      alert('Failed to save collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Are you sure? This will NOT delete the categories inside it, but will unlink them.")) return;
      
      try {
          await axios.delete(`/api/v1/collections/${id}`);
          fetchCollections();
      } catch(error) {
          alert("Failed to delete.");
      }
  };

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Layers className="w-6 h-6 text-gray-400" /> Collection Groups
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Manage top-level groups (e.g. Perfumes, Belts)</p>
            </div>
            <button
                onClick={() => openPanel()}
                className="flex! items-center! justify-center! bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
            >
                <Plus className="w-4 h-4 mr-2" /> New Collection
            </button>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(col => (
                <div key={col.id} className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 relative">
                             {/* Display Image if available */}
                             {col.image ? (
                               <img src={col.image} alt={col.name} className="w-full h-full object-cover"/>
                             ) : (
                               <Layers className="w-8 h-8 text-gray-300"/>
                             )}
                        </div>
                        
                        {/* 🛠️ CHANGED: Removed 'opacity-0' so buttons are ALWAYS visible */}
                        <div className="flex gap-2">
                             <button 
                                onClick={() => openPanel(col)} 
                                className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors cursor-pointer"
                                title="Edit Collection"
                             >
                                <Pencil className="w-4 h-4"/>
                             </button>
                             <button 
                                onClick={() => handleDelete(col.id)} 
                                className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors cursor-pointer"
                                title="Delete Collection"
                             >
                                <Trash2 className="w-4 h-4"/>
                             </button>
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{col.name}</h3>
                    <p className="text-xs font-mono text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded-md mb-3">/{col.slug}</p>
                    
                    <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                        <Tags className="w-3 h-3" /> {col._count?.categories || 0} Categories inside
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Slide Panel */}
       <div className={`fixed inset-0 z-50 ${isPanelOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${isPanelOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsPanelOpen(false)} />
          <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-500 ease-out p-8 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <h2 className="text-2xl font-black mb-8">{currentId ? 'Edit Collection' : 'New Collection'}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                  
                 {/* Image Upload */}
                 <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Cover Image</label>
                    <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative">
                             {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400"/> : image ? <img src={image} className="w-full h-full object-cover"/> : <ImageIcon className="w-6 h-6 text-gray-300"/>}
                        </div>
                        <input type="file" onChange={handleImageUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors"/>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Collection Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-gray-50 border-transparent focus:border-gray-300 focus:bg-white rounded-xl font-bold text-gray-900 transition-all outline-none" placeholder="e.g. Perfumes" required />
                 </div>

                 <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">URL Slug</label>
                    <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full p-4 bg-gray-50 border-transparent focus:border-gray-300 focus:bg-white rounded-xl font-medium text-gray-500 transition-all outline-none font-mono text-sm" placeholder="e.g. perfumes" required />
                 </div>

                 <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-gray-900/20 disabled:opacity-50 mt-8 cursor-pointer">
                    {isSubmitting ? 'Saving...' : 'Save Collection'}
                 </button>
              </form>
          </div>
       </div>
    </div>
  );
}