import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { User, CheckCircle, XCircle, Shield, Scissors, UserCircle } from 'lucide-react';

const AdminUsers = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, page: 1, totalPages: 1 });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const data = await adminAPI.getAllUsers({});
            setUsers(data.users || []);
            setStats({
                total: data.total || 0,
                page: data.page || 1,
                totalPages: data.totalPages || 1
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (userId) => {
        try {
            await adminAPI.toggleUserStatus(userId);
            fetchUsers();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Erreur lors de la modification du statut');
        }
    };

    const changeRole = async (userId, newRole) => {
        if (!window.confirm(`Changer le rôle de cet utilisateur en ${newRole} ?`)) return;
        try {
            await adminAPI.changeUserRole(userId, newRole);
            fetchUsers();
        } catch (error) {
            console.error('Error changing role:', error);
            alert('Erreur lors du changement de rôle');
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Supprimer cet utilisateur ?')) return;
        try {
            await adminAPI.deleteUser(userId);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <Shield size={16} className="text-amber-600" />;
            case 'hairdresser':
                return <Scissors size={16} className="text-purple-600" />;
            default:
                return <UserCircle size={16} className="text-blue-600" />;
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-amber-100 text-amber-800',
            hairdresser: 'bg-purple-100 text-purple-800',
            client: 'bg-blue-100 text-blue-800'
        };
        return colors[role] || colors.client;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
                    <p className="text-gray-600 mt-1">{stats.total} utilisateurs au total</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Utilisateur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rôle
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                <span className="text-primary-600 font-semibold">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                                <div className="text-sm text-gray-500">ID: {u.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{u.email}</div>
                                        <div className="text-sm text-gray-500">{u.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(u.role)}
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(u.role)}`}>
                                                {u.role === 'admin' ? 'Admin' : u.role === 'hairdresser' ? 'Coiffeur' : 'Client'}
                                            </span>
                                        </div>
                                        {/* Role Change Dropdown */}
                                        {u.role !== 'admin' && (
                                            <select
                                                onChange={(e) => changeRole(u.id, e.target.value)}
                                                value={u.role}
                                                className="mt-2 text-xs border border-gray-300 rounded px-2 py-1"
                                            >
                                                <option value="client">Client</option>
                                                <option value="hairdresser">Coiffeur</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {u.verified ? (
                                            <span className="inline-flex items-center gap-1 text-green-600">
                                                <CheckCircle size={16} /> Actif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-red-600">
                                                <XCircle size={16} /> Inactif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            {u.role !== 'admin' && (
                                                <>
                                                    <button
                                                        onClick={() => toggleStatus(u.id)}
                                                        className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                                                    >
                                                        {u.verified ? 'Désactiver' : 'Activer'}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(u.id)}
                                                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </>
                                            )}
                                            {u.role === 'admin' && (
                                                <span className="text-sm text-gray-400">Protégé</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {users.length === 0 && (
                    <div className="text-center py-12">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur</h3>
                        <p className="mt-1 text-sm text-gray-500">Aucun utilisateur trouvé dans la base de données.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
