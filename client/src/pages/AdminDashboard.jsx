import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, DollarSign, TrendingUp, User, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchStats();
    }, [user, navigate]);

    const fetchStats = async () => {
        try {
            const data = await adminAPI.getStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-gray-600 mt-1">Vue d'ensemble de l'application MyHairCut</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Utilisateurs</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalUsers || 0}</p>
                            <p className="text-sm text-green-600 mt-2">+{stats?.recentUsers || 0} ce mois</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Total Hairdressers */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Coiffeurs</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalHairdressers || 0}</p>
                            <p className="text-sm text-gray-500 mt-2">{stats?.totalClients || 0} clients</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <User className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Total Appointments */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Rendez-vous</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalAppointments || 0}</p>
                            <p className="text-sm text-green-600 mt-2">+{stats?.recentAppointments || 0} ce mois</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Calendar className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Revenus totaux</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalRevenue || 0} MAD</p>
                            <p className="text-sm text-gray-500 mt-2">RDV complétés</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="text-amber-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointments by Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Rendez-vous par statut</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats?.appointmentsByStatus?.map((item) => (
                        <div key={item.status} className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-600 capitalize">
                                {item.status === 'pending' ? 'En attente' :
                                    item.status === 'confirmed' ? 'Confirmé' :
                                        item.status === 'completed' ? 'Terminé' :
                                            'Annulé'}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{item.count}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-primary-200 transition-colors text-left"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <Users className="text-primary-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Gérer les utilisateurs</h3>
                            <p className="text-sm text-gray-600">Voir et gérer tous les utilisateurs</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/admin/appointments')}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-primary-200 transition-colors text-left"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Calendar className="text-green-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Gérer les rendez-vous</h3>
                            <p className="text-sm text-gray-600">Voir tous les rendez-vous</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
