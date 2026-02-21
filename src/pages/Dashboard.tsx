import React, { useEffect, useState } from 'react';
import { apiService, type BlogPost } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, Plus, Edit, Trash2 } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await apiService.getPosts({ status: 'all' }); // Admin view sees all posts
            if (res.success) {
                setPosts(res.posts);
            }
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await apiService.deletePost(id);
            fetchPosts();
        } catch (error) {
            console.error('Failed to delete post', error);
        }
    };

    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.length - publishedCount;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Top Navigation */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm tracking-tighter">A</span>
                        </div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Arrotech Admin</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium text-slate-500 hidden sm:inline-block">Logged in as <span className="text-slate-900">{user?.email}</span></span>
                        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                        {(user?.role === 'admin' || user?.email === 'developer@arrotech.com') && (
                            <Link to="/users" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Users
                            </Link>
                        )}
                        <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 rounded-lg hover:bg-slate-100" title="Logout">
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-semibold hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8 mt-4">

                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h2>
                        <p className="text-slate-500 mt-1 font-medium">Manage your content and track performance.</p>
                    </div>
                    <Link to="/editor" className="group flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95">
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        Write a Post
                    </Link>
                </div>

                {/* Stats Banner */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-slate-500 text-sm font-semibold mb-1">Total Posts</div>
                            <div className="text-4xl font-black text-slate-900 tracking-tight">{posts.length}</div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full blur-2xl"></div>
                            <div className="text-slate-500 text-sm font-semibold mb-1 relative z-10">Published</div>
                            <div className="text-4xl font-black text-emerald-600 tracking-tight relative z-10">{publishedCount}</div>
                        </div>
                        <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full blur-2xl"></div>
                            <div className="text-slate-500 text-sm font-semibold mb-1 relative z-10">Drafts</div>
                            <div className="text-4xl font-black text-amber-500 tracking-tight relative z-10">{draftCount}</div>
                        </div>
                    </div>
                )}

                {/* Posts Table */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Recent Content</h3>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600"></div>
                            <p className="mt-4 text-slate-500 font-medium">Loading content...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-bold bg-white">
                                        <th className="py-5 px-8">Content</th>
                                        <th className="py-5 px-6">Status</th>
                                        <th className="py-5 px-6">Category</th>
                                        <th className="py-5 px-6">Date</th>
                                        <th className="py-5 px-8 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {posts.map(post => (
                                        <tr key={post.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="py-5 px-8">
                                                <div className="font-bold text-slate-900 text-sm mb-1">{post.title}</div>
                                                <div className="text-xs text-slate-400 truncate max-w-[250px] font-medium">{post.slug}</div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${post.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${post.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                    {post.status || 'draft'}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-sm font-semibold text-slate-600">
                                                {post.category ? (
                                                    <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs">{post.category}</span>
                                                ) : <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="py-5 px-6 text-sm font-medium text-slate-500">
                                                {post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                            </td>
                                            <td className="py-5 px-8 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link to={`/editor/${post.id}`} className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors" title="Edit">
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => post.id && handleDelete(post.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {posts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center text-slate-500 font-medium">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Edit className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p className="text-lg font-semibold text-slate-900 mb-1">No posts yet</p>
                                                <p>Create your first blog post to get started.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
