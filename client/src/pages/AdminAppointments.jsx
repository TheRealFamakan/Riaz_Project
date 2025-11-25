import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { Calendar, Clock, User, Scissors, DollarSign } from 'lucide-react';

const AdminAppointments = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, page: 1, totalPages: 1 });
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchAppointments();
    }, [user, navigate, filter]);

    const fetchAppointments = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const data = await adminAPI.getAllAppointments(params);
            setAppointments(data.appointments || []);
            setStats({
                total: data.total || 0,
                page: data.page || 1,
                totalPages: data.totalPages || 1
            });
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await adminAPI.updateAppointmentStatus(id, { status: newStatus });
            fetchAppointments();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const deleteAppointment = async (id) => {
        if (!window.confirm('Supprimer ce rendez-vous ?')) return;
        try {
            await adminAPI.deleteAppointment(id);
            fetchAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return badges[status] || badges.pending;
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'En attente',
            confirmed: 'Confirmé',
            completed: 'Terminé',
            cancelled: 'Annulé'
        };
        return labels[status] || status;
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
                    <h1 className="text-3xl font-bold text-gray-900">Gestion des rendez-vous</h1>
                    <p className="text-gray-600 mt-1">{stats.total} rendez-vous au total</p>
                </div>

                {/* Filter */}
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                </select>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Coiffeur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date & Heure
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Prix
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Paiement
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.map((a) => (
                                <tr key={a.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User size={20} className="text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {a.client?.name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {a.client?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                <Scissors size={20} className="text-purple-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {a.hairdresserProfile?.user?.name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {a.hairdresserProfile?.user?.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {a.service?.name || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {a.service?.duration} min
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm text-gray-900">
                                            <Calendar size={16} className="text-gray-400" />
                                            {new Date(a.appointmentDate).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <Clock size={16} className="text-gray-400" />
                                            {a.appointmentTime}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                                            <DollarSign size={16} className="text-gray-400" />
                                            {a.totalPrice} MAD
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${a.paymentMethod === 'online'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {a.paymentMethod === 'online' ? '💳 En ligne' : '💵 Espèces'}
                                            </span>
                                            {a.paymentMethod === 'online' && (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${a.paymentStatus === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {a.paymentStatus === 'completed' ? 'Payé' : 'En attente'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(a.status)}`}>
                                            {getStatusLabel(a.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex flex-col gap-2">
                                            <select
                                                value={a.status}
                                                onChange={(e) => updateStatus(a.id, e.target.value)}
                                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                            >
                                                <option value="pending">En attente</option>
                                                <option value="confirmed">Confirmé</option>
                                                <option value="completed">Terminé</option>
                                                <option value="cancelled">Annulé</option>
                                            </select>
                                            <button
                                                onClick={() => deleteAppointment(a.id)}
                                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {appointments.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter !== 'all'
                                ? `Aucun rendez-vous avec le statut "${getStatusLabel(filter)}"`
                                : 'Aucun rendez-vous trouvé dans la base de données.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAppointments;
