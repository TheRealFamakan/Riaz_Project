import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save, ArrowLeft, AlertCircle, Plus, Trash2, Scissors } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, hairdresserAPI } from '../services/api';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user: authUser, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('personal'); // personal or professional

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });

    // Hairdresser profile data
    const [hairdresserProfile, setHairdresserProfile] = useState({
        bio: '',
        experience: '',
        city: '',
        neighborhood: '',
        serviceArea: '5km'
    });

    const [services, setServices] = useState([
        { name: '', description: '', price: '', duration: '', category: 'coupe' }
    ]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await userAPI.getProfile();
            setFormData({
                name: data.name || '',
                phone: data.phone || '',
                address: data.address || ''
            });

            // If hairdresser, try to fetch professional profile
            if (authUser?.role === 'hairdresser') {
                try {
                    const profileData = await hairdresserAPI.getById(data.hairdresserProfile?.id);
                    if (profileData) {
                        setHairdresserProfile({
                            bio: profileData.bio || '',
                            experience: profileData.experience || '',
                            city: profileData.city || '',
                            neighborhood: profileData.neighborhood || '',
                            serviceArea: profileData.serviceArea || '5km'
                        });
                        if (profileData.services && profileData.services.length > 0) {
                            setServices(profileData.services.map(s => ({
                                name: s.name,
                                description: s.description || '',
                                price: s.price,
                                duration: s.duration || '',
                                category: s.category || 'coupe'
                            })));
                        }
                    }
                } catch (err) {
                    // Profile doesn't exist yet, that's ok
                    console.log('No hairdresser profile yet');
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileChange = (field, value) => {
        setHairdresserProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...services];
        newServices[index][field] = value;
        setServices(newServices);
    };

    const addService = () => {
        setServices([...services, { name: '', description: '', price: '', duration: '', category: 'coupe' }]);
    };

    const removeService = (index) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Update personal info
            const updatedProfile = await userAPI.updateProfile(formData);
            updateUser(updatedProfile);

            // If hairdresser and on professional tab, update professional profile
            if (authUser?.role === 'hairdresser' && activeTab === 'professional') {
                if (!hairdresserProfile.city || !hairdresserProfile.bio) {
                    setError('Veuillez remplir au moins la ville et la bio');
                    setLoading(false);
                    return;
                }

                const validServices = services.filter(s => s.name && s.price);
                if (validServices.length === 0) {
                    setError('Veuillez ajouter au moins un service');
                    setLoading(false);
                    return;
                }

                await hairdresserAPI.createProfile({
                    ...hairdresserProfile,
                    experience: parseInt(hairdresserProfile.experience) || 0,
                    services: validServices.map(s => ({
                        ...s,
                        price: parseFloat(s.price),
                        duration: parseInt(s.duration) || 30
                    }))
                });
            }

            setSuccess('Profil mis à jour avec succès !');
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Modifier le profil</h1>
                </div>

                {/* Tabs for hairdressers */}
                {authUser?.role === 'hairdresser' && (
                    <div className="flex gap-2 mb-6 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={() => setActiveTab('personal')}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'personal'
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Informations personnelles
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('professional')}
                            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'professional'
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Scissors size={18} />
                            Profil professionnel
                        </button>
                    </div>
                )}

                {/* Messages */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
                        <AlertCircle size={18} />
                        <span>{success}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info Tab */}
                    {activeTab === 'personal' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom complet
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="name"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                        placeholder="Votre nom"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Téléphone
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                        placeholder="+212 6..."
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Adresse
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="address"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                        placeholder="Ville, quartier"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Professional Info Tab (Hairdressers only) */}
                    {activeTab === 'professional' && authUser?.role === 'hairdresser' && (
                        <div className="space-y-6">
                            {/* General Info */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-gray-900">Informations générales</h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bio / Présentation *
                                    </label>
                                    <textarea
                                        value={hairdresserProfile.bio}
                                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                                        placeholder="Présentez-vous et votre expertise..."
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Années d'expérience</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={hairdresserProfile.experience}
                                            onChange={(e) => handleProfileChange('experience', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                            placeholder="5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Zone de service</label>
                                        <select
                                            value={hairdresserProfile.serviceArea}
                                            onChange={(e) => handleProfileChange('serviceArea', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                        >
                                            <option value="5km">5 km</option>
                                            <option value="10km">10 km</option>
                                            <option value="15km">15 km</option>
                                            <option value="20km">20 km</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                                        <input
                                            type="text"
                                            value={hairdresserProfile.city}
                                            onChange={(e) => handleProfileChange('city', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                            placeholder="Rabat"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                                        <input
                                            type="text"
                                            value={hairdresserProfile.neighborhood}
                                            onChange={(e) => handleProfileChange('neighborhood', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                            placeholder="Agdal"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Services */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Services & Tarifs</h2>
                                    <button
                                        type="button"
                                        onClick={addService}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                                    >
                                        <Plus size={18} />
                                        Ajouter
                                    </button>
                                </div>

                                {services.map((service, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-900">Service {index + 1}</h3>
                                            {services.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeService(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                                                <input
                                                    type="text"
                                                    value={service.name}
                                                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                                    placeholder="Coupe Homme"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                                <select
                                                    value={service.category}
                                                    onChange={(e) => handleServiceChange(index, 'category', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                                >
                                                    <option value="coupe">Coupe</option>
                                                    <option value="coloration">Coloration</option>
                                                    <option value="brushing">Brushing</option>
                                                    <option value="barbe">Barbe</option>
                                                    <option value="soin">Soin</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <input
                                                type="text"
                                                value={service.description}
                                                onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                                placeholder="Description..."
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD) *</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={service.price}
                                                    onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                                    placeholder="150"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={service.duration}
                                                    onChange={(e) => handleServiceChange(index, 'duration', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                                    placeholder="30"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                'Enregistrement...'
                            ) : (
                                <>
                                    <Save size={20} />
                                    Enregistrer
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
