import axios, { type AxiosInstance } from 'axios';

// Interfaces based on the backend Pydantic models
export interface User {
    id: number;
    email: string;
    name: string;
    role?: string;
    permissions?: any;
}

export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    color?: string;
}

export interface BlogPost {
    id?: number;
    slug: string;
    title: string;
    description: string;
    content: string;
    cover_image?: string;
    author_name?: string;
    author_avatar?: string;
    category_id?: number;
    category?: string;
    tags?: string[];
    status?: string;
    is_featured?: boolean;
    read_time?: string;
    published_at?: string;
    created_at?: string;
    updated_at?: string;
}

class ApiService {
    private api: AxiosInstance;

    constructor() {
        const getBaseURL = () => {
            const envURL = import.meta.env.VITE_API_URL;
            if (envURL) return envURL;
            return 'https://mini-hub.fly.dev'; // Default to deployed backend
        };

        this.api = axios.create({
            baseURL: getBaseURL(),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('auth_token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('auth_token');
                    window.dispatchEvent(new Event('unauthorized'));
                }
                return Promise.reject(error);
            }
        );
    }

    // --- Auth ---
    async login(email: string, password: string): Promise<any> {
        const response = await this.api.post('/auth/login', { email, password });
        return response.data;
    }

    async getCurrentUser(): Promise<any> {
        const response = await this.api.get('/auth/me');
        return response.data;
    }

    // --- Blog ---
    async getCategories(): Promise<{ success: boolean; categories: BlogCategory[] }> {
        const response = await this.api.get('/api/blog/categories');
        return response.data;
    }

    async getPosts(params?: Record<string, any>): Promise<{ success: boolean; posts: BlogPost[]; total: number }> {
        const response = await this.api.get('/api/blog/posts', { params });
        return response.data;
    }

    async getPost(slug: string): Promise<{ success: boolean; post: BlogPost }> {
        const response = await this.api.get(`/api/blog/posts/${slug}`);
        return response.data;
    }

    async createPost(data: Partial<BlogPost>): Promise<{ success: boolean; post: BlogPost }> {
        const response = await this.api.post('/api/blog/posts', data);
        return response.data;
    }

    async updatePost(id: number, data: Partial<BlogPost>): Promise<{ success: boolean; post: BlogPost }> {
        const response = await this.api.put(`/api/blog/posts/${id}`, data);
        return response.data;
    }

    async deletePost(id: number): Promise<{ success: boolean }> {
        const response = await this.api.delete(`/api/blog/posts/${id}`);
        return response.data;
    }

    // --- Admin Users ---
    async getEmployees(): Promise<{ success: boolean; data: any[] }> {
        const response = await this.api.get('/admin/employees');
        return response.data;
    }

    async updateEmployeePermissions(id: number, permissions: any): Promise<{ success: boolean; data: any }> {
        const response = await this.api.put(`/admin/employees/${id}/permissions`, { permissions });
        return response.data;
    }
}

export const apiService = new ApiService();
