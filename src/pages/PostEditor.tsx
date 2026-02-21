import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService, type BlogPost, type BlogCategory } from '../services/api';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';

const PostEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [isLoading, setIsLoading] = useState(!!id);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, setValue, watch, reset } = useForm<Partial<BlogPost>>({
        defaultValues: { status: 'draft', tags: [] }
    });

    const title = watch('title');

    useEffect(() => {
        // Generate slug from title if not set manually
        if (title && !id) {
            setValue('slug', title.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]/g, ''));
        }
    }, [title, id, setValue]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // TEMPORARY: Seed the remote DB categories
                try {
                    await fetch('https://mini-hub.fly.dev/api/blog/seed', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                    });
                } catch (seedErr) {
                    console.error("Seed error:", seedErr);
                }

                const catRes = await apiService.getCategories();
                if (catRes.success) setCategories(catRes.categories);

                if (id) {
                    const res = await apiService.getPosts({ status: 'all' });
                    const target = res.posts.find(p => p.id === parseInt(id));
                    if (target) {
                        reset(target);
                    }
                }
            } catch (e) {
                console.error("Fetch failed", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, reset]);

    const onSubmit = async (data: Partial<BlogPost>) => {
        setIsSaving(true);
        try {
            const payload = { ...data };
            if (payload.category_id) {
                payload.category_id = parseInt(payload.category_id as any, 10);
            }

            if (id) {
                await apiService.updatePost(parseInt(id), payload);
            } else {
                await apiService.createPost(payload);
            }
            navigate('/');
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading editor...</div>;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Minimalist Header */}
            <header className="bg-white/90 backdrop-blur-sm border-b border-slate-100 px-4 sm:px-6 h-16 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2 group">
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-semibold hidden sm:block">Back to Dashboard</span>
                    </Link>
                    <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                    <span className="text-sm font-bold text-slate-400 hidden sm:block">
                        {id ? 'Editing Post' : 'Drafting New Post'}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-400 hidden sm:block">
                        {watch('status') === 'published' ? 'Live' : 'Draft'}
                    </span>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                        ) : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Publish'}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
                {/* Main Editor Area (Notion style) */}
                <div className="flex-1 px-6 sm:px-12 lg:px-24 py-12 lg:border-r border-slate-100">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {/* Title Input */}
                        <input
                            {...register('title', { required: true })}
                            className="w-full text-4xl sm:text-5xl font-black text-slate-900 tracking-tight placeholder-slate-200 border-none focus:ring-0 p-0 bg-transparent resize-none overflow-hidden"
                            placeholder="Post Title"
                        />

                        {/* Content Area */}
                        <div className="prose prose-slate prose-lg max-w-none">
                            <textarea
                                {...register('content', { required: true })}
                                className="w-full min-h-[60vh] text-lg text-slate-700 font-medium leading-relaxed placeholder-slate-300 border-none focus:ring-0 p-0 bg-transparent resize-y"
                                placeholder="Start writing down your ideas..."
                            />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar for Metadata */}
                <div className="w-full lg:w-80 xl:w-96 bg-slate-50 border-t lg:border-t-0 border-slate-100 p-6 sm:p-8 space-y-8">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Post Settings</h3>

                        <div className="space-y-6">
                            {/* Status */}
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Visibility</label>
                                <div className="relative">
                                    <select {...register('status')} className="appearance-none w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm">
                                        <option value="draft">Draft (Hidden)</option>
                                        <option value="published">Published (Public)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-indigo-600 transition-colors">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Featured */}
                            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <input {...register('is_featured')} type="checkbox" id="is_featured" className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                                <label htmlFor="is_featured" className="text-sm font-bold text-slate-700 cursor-pointer select-none">Feature this post</label>
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">URL Slug</label>
                                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm">
                                    <span className="pl-4 pr-1 text-slate-400 text-sm font-medium select-none">/blog/</span>
                                    <input {...register('slug', { required: true })} className="w-full py-3 pr-4 bg-transparent border-none focus:ring-0 text-slate-700 font-medium text-sm placeholder-slate-300" placeholder="post-url-slug" />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                <div className="relative">
                                    <select {...register('category_id')} className="appearance-none w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm">
                                        <option value="">Select category...</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-indigo-600 transition-colors">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Cover Image */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Cover Image URL</label>
                                <input {...register('cover_image')} className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="https://example.com/image.jpg" />
                            </div>

                            {/* Read Time */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Read Time</label>
                                <input {...register('read_time')} className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="e.g. '5 min read'" />
                            </div>

                            {/* Author Defaults */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Author Name Override</label>
                                <input {...register('author_name')} className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="John Doe" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Author Avatar URL</label>
                                <input {...register('author_avatar')} className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="https://example.com/avatar.jpg" />
                            </div>

                            {/* Description/Excerpt */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between items-end">
                                    <span>Excerpt <span className="text-slate-400 font-normal">(SEO Data)</span></span>
                                </label>
                                <textarea {...register('description')} rows={4} className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm resize-none" placeholder="A brief summary of the article for search engines and preview cards..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PostEditor;
