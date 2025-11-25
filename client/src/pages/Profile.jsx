import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit, Calendar, Star, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, appointmentAPI, adminAPI } from '../services/api';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Charger le profil UNIQUEMENT au montage
    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Charger les rendez-vous UNIQUEMENT quand le profil est chargé/modifié
    useEffect(() => {
        if (profile) {
            fetchAppointments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    const fetchProfile = async () => {
        try {
            const data = await userAPI.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            if (profile?.role === 'hairdresser' && profile.hairdresserProfile?.id) {
                const data = await adminAPI.getAllAppointments({ hairdresserId: profile.hairdresserProfile.id });
                setAppointments(data);
            } else {
                const data = await appointmentAPI.getMyAppointments();
                setAppointments(data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center p-8">Profil non trouvé</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>

                {/* Profile Info */}
                <div className="px-6 pb-6">
                    <div className="flex items-end justify-between -mt-16 mb-4">
                        <div className="flex items-end gap-4">
                            {/* Avatar */}
                            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-primary-600 text-4xl font-bold">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    profile.name.charAt(0).toUpperCase()
                                )}
                            </div>

                            {/* Name & Role */}
                            <div className="mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${profile.role === 'hairdresser'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {profile.role === 'hairdresser' ? 'Coiffeur' : 'Client'}
                                </span>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <Link
                            to="/profile/edit"
                            className="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                            <Edit size={18} />
                            Modifier le profil
                        </Link>
                    </div>

                    {/* Contact Info */}
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Mail size={20} className="text-primary-600" />
                            <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Phone size={20} className="text-primary-600" />
                            <span>{profile.phone}</span>
                        </div>
                        {profile.address && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <MapPin size={20} className="text-primary-600" />
                                <span>{profile.address}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-gray-600">
                            <Calendar size={20} className="text-primary-600" />
                            <span>Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Card (for hairdressers) */}
            {profile.role === 'hairdresser' && profile.hairdresserProfile && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-primary-50 rounded-xl">
                            <div className="text-3xl font-bold text-primary-600">{profile.hairdresserProfile.totalReviews || 0}</div>
                            <div className="text-sm text-gray-600 mt-1">Avis</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                            <div className="text-3xl font-bold text-green-600">{appointments.length}</div>
                            <div className="text-sm text-gray-600 mt-1">Rendez-vous</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-xl">
                            <div className="flex items-center justify-center gap-1 text-3xl font-bold text-yellow-600">
                                <Star size={28} fill="currentColor" />
                                {profile.hairdresserProfile.averageRating ? profile.hairdresserProfile.averageRating.toFixed(1) : '0.0'}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Note moyenne</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {profile.role === 'hairdresser' ? 'Rendez-vous récents' : 'Mes rendez-vous'}
                    </h2>
                    {appointments.length > 0 && (
                        <Link
                            to="/appointments"
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                            Voir tout
                        </Link>
                    )}
                </div>

                {appointments.length > 0 ? (
                    <div className="space-y-3">
                        {appointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="p-4 border border-gray-200 rounded-xl hover:border-primary-200 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900">
                                                {profile.role === 'hairdresser'
                                                    ? appointment.client?.name
                                                    : appointment.hairdresserProfile?.user?.name}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {appointment.status === 'confirmed' ? 'Confirmé' :
                                                    appointment.status === 'pending' ? 'En attente' :
                                                        appointment.status === 'completed' ? 'Terminé' :
                                                            'Annulé'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {appointment.service?.name}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {appointment.appointmentTime.substring(0, 5)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-primary-600">
                                            {parseFloat(appointment.totalPrice).toFixed(2)} MAD
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Aucun rendez-vous pour le moment
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
