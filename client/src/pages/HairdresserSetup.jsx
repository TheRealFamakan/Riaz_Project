import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save } from 'lucide-react';
import { hairdresserAPI } from '../services/api';

const HairdresserSetup = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [profile, setProfile] = useState({
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
        if (!user || user.role !== 'hairdresser') {
            navigate('/');
        }
    }, [user, navigate]);

    const handleProfileChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
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

        // Validation
        if (!profile.city || !profile.bio) {
            setError('Veuillez remplir au moins la ville et la bio');
            return;
        }

        const validServices = services.filter(s => s.name && s.price);
        if (validServices.length === 0) {
            setError('Veuillez ajouter au moins un service');
            return;
        }

        setLoading(true);
        try {
            await hairdresserAPI.createProfile({
                ...profile,
                experience: parseInt(profile.experience) || 0,
                services: validServices.map(s => ({
                    ...s,
                    price: parseFloat(s.price),
                    duration: parseInt(s.duration) || 30
                }))
            });

            setSuccess('Profil créé avec succès !');
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création du profil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration du profil coiffeur</h1>
                <p className="text-gray-600 mb-6">Complétez votre profil pour apparaître dans les recherches</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informations générales */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Informations générales</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bio / Présentation *
                            </label>
                            <textarea
                                value={profile.bio}
                                onChange={(e) => handleProfileChange('bio', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                                placeholder="Présentez-vous et votre expertise..."
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Années d'expérience
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={profile.experience}
                                    onChange={(e) => handleProfileChange('experience', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                    placeholder="5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Zone de service
                                </label>
                                <select
                                    value={profile.serviceArea}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ville *
                                </label>
                                <input
                                    type="text"
                                    value={profile.city}
                                    onChange={(e) => handleProfileChange('city', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                    placeholder="Rabat"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quartier
                                </label>
                                <input
                                    type="text"
                                    value={profile.neighborhood}
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
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <Plus size={18} />
                                Ajouter un service
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du service *</label>
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
                                            <option value="autre">Autre</option>
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
                                        placeholder="Description du service..."
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

                    {/* Submit */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? 'Création...' : 'Créer mon profil'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HairdresserSetup;
