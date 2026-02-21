import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService, type User as ApiUser } from '../services/api';
import { UserCog, ShieldAlert, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Employee extends ApiUser {
    role: string;
    permissions: {
        blog_write?: boolean;
        blog_publish?: boolean;
        [key: string]: any;
    };
    created_at: string;
}

const UsersPage: React.FC = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Check if current user is admin
    const isAdmin = user?.role === 'admin' || user?.email === 'developer@arrotech.com'; // Adjust logic based on your backend response

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const res = await apiService.getEmployees();
            if (res.success) {
                setEmployees(res.data);
            } else {
                toast.error('Failed to load employees');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('An error occurred while loading users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePermission = async (employeeId: number, currentPermissions: any, permissionKey: string) => {
        try {
            const updatedPermissions = { ...currentPermissions, [permissionKey]: !currentPermissions[permissionKey] };
            setEmployees(prev => prev.map(emp =>
                emp.id === employeeId ? { ...emp, permissions: updatedPermissions } : emp
            ));

            const res = await apiService.updateEmployeePermissions(employeeId, updatedPermissions);

            if (res.success) {
                toast.success('Permissions updated successfully');
            } else {
                // Revert on failure
                setEmployees(prev => prev.map(emp =>
                    emp.id === employeeId ? { ...emp, permissions: currentPermissions } : emp
                ));
                toast.error('Failed to update permissions');
            }
        } catch (error) {
            // Revert on failure
            setEmployees(prev => prev.map(emp =>
                emp.id === employeeId ? { ...emp, permissions: currentPermissions } : emp
            ));
            toast.error('An error occurred updating permissions');
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                <ShieldAlert className="w-16 h-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-500 text-center max-w-md">
                    You do not have the required administrative privileges to view or manage user permissions.
                </p>
            </div>
        );
    }

    const filteredEmployees = employees.filter(emp =>
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8 mt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h2>
                        <p className="text-slate-500 mt-1 font-medium">Manage blog access permissions for employees</p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="relative max-w-md w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 block w-full border-slate-200 rounded-xl py-3 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm font-medium transition-all"
                            />
                        </div>
                    </div>

                    {/* User List */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600"></div>
                            <span className="mt-4 text-slate-500 font-medium">Loading users...</span>
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex flex-col items-center justify-center mb-4">
                                <UserCog className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No users found</h3>
                            <p className="text-slate-500 mt-2 font-medium">Try adjusting your search terms.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-bold bg-white">
                                        <th className="py-5 px-8">Employee</th>
                                        <th className="py-5 px-6">System Role</th>
                                        <th className="py-5 px-6">Blog Author (Write)</th>
                                        <th className="py-5 px-8 text-right">Blog Editor (Publish)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredEmployees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold uppercase shadow-inner border border-indigo-100">
                                                        {employee.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">{employee.name}</div>
                                                        <div className="text-xs font-medium text-slate-500 mt-0.5">{employee.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className="px-3 py-1 inline-flex text-[11px] font-bold uppercase tracking-wide rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                                    {employee.role}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <button
                                                    onClick={() => handleTogglePermission(employee.id, employee.permissions || {}, 'blog_write')}
                                                    className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${employee.permissions?.blog_write
                                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                                                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {employee.permissions?.blog_write ? <ToggleRight className="w-5 h-5 text-indigo-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-500" />}
                                                    {employee.permissions?.blog_write ? 'Enabled' : 'Disabled'}
                                                </button>
                                            </td>
                                            <td className="py-5 px-8 text-right flex justify-end">
                                                <button
                                                    onClick={() => handleTogglePermission(employee.id, employee.permissions || {}, 'blog_publish')}
                                                    className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${employee.permissions?.blog_publish
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                                                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {employee.permissions?.blog_publish ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-500" />}
                                                    {employee.permissions?.blog_publish ? 'Enabled' : 'Disabled'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UsersPage;
