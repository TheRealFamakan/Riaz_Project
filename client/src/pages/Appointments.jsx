import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Calendar, Clock, User, Scissors, X, Check } from 'lucide-react';
import { appointmentAPI } from '../services/api';

const Appointments = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

    useEffect(() => {
        fetchAppointments();
        if (successMessage) {
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    }, []);

    const fetchAppointments = async () => {
        try {
            const data = await appointmentAPI.getMyAppointments();
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
            return;
        }
        try {
            await appointmentAPI.updateStatus(id, 'cancelled', 'Annulé par le client');
            
            // MISE À JOUR LOCALE : On change le statut dans la liste actuelle immédiatement
            setAppointments(prevAppointments => 
                prevAppointments.map(appt => 
                    appt.id === id ? { ...appt, status: 'cancelled' } : appt
                )
            );
            
            setSuccessMessage('Rendez-vous annulé avec succès');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error cancelling appointment:', error);
        }
    };

    const handleConfirmAppointment = async (id) => {
        console.log('Confirming appointment id:', id);
        console.log('Current user role:', user.role);
        try {
            const response = await appointmentAPI.updateStatus(id, 'confirmed');
            console.log('Confirm response:', response);
            
            // MISE À JOUR LOCALE
            setAppointments(prevAppointments => 
                prevAppointments.map(appt => 
                    appt.id === id ? { ...appt, status: 'confirmed' } : appt
                )
            );

            setSuccessMessage('Rendez‑vous confirmé');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchAppointments();
        } catch (error) {
            console.error('Error confirming appointment:', error);
            alert(error.response?.data?.message || 'Erreur lors de la confirmation');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        const labels = {
            pending: 'En attente',
            confirmed: 'Confirmé',
            completed: 'Terminé',
            cancelled: 'Annulé'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return ['pending', 'confirmed'].includes(apt.status);
        if (filter === 'past') return ['completed', 'cancelled'].includes(apt.status);
        return apt.status === filter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Mes rendez-vous</h1>
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
                    {successMessage}
                </div>
            )}
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'upcoming' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        À venir
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'past' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Passés
                    </button>
                </div>
            </div>
            {/* Appointments List */}
            {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                    {filteredAppointments.map(appointment => (
                        <div key={appointment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">
                                                {user.role === 'hairdresser' ? appointment.client?.name : appointment.hairdresserProfile?.user?.name}
                                            </h3>
                                            {getStatusBadge(appointment.status)}
                                        </div>
                                    </div>
                                    {/* Details */}
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Scissors size={18} className="text-primary-600" />
                                            <span>{appointment.service?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar size={18} className="text-primary-600" />
                                            <span>{new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock size={18} className="text-primary-600" />
                                            <span>{appointment.appointmentTime.substring(0, 5)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-primary-600 font-semibold">
                                            <span>{parseFloat(appointment.totalPrice).toFixed(2)} MAD</span>
                                        </div>
                                    </div>
                                    {appointment.notes && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600"><span className="font-medium">Notes:</span> {appointment.notes}</p>
                                        </div>
                                    )}
                                </div>
                                {/* Actions */}
                                {appointment.status === 'pending' && (
                                    <div className="flex md:flex-col gap-2">
                                        <button
                                            onClick={() => handleConfirmAppointment(appointment.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                        >
                                            <Check size={18} />
                                            Confirmer
                                        </button>
                                        <button
                                            onClick={() => handleCancelAppointment(appointment.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <X size={18} />
                                            Annuler
                                        </button>
                                    </div>
                                )}
                                {appointment.status === 'confirmed' && user.role !== 'hairdresser' && (
                                    <button
                                        onClick={() => handleCancelAppointment(appointment.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <X size={18} />
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <p className="text-gray-500">Aucun rendez-vous trouvé</p>
                </div>
            )}
        </div>
    );
};

export default Appointments;
