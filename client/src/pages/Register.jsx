import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Scissors, Mail, Lock, Phone, MapPin, Camera, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [role, setRole] = useState('client'); // 'client' | 'hairdresser'
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        address: ''
    });

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = {
                ...formData,
                role
            };
            const data = await authAPI.register(userData);
            login(data.user);
            navigate('/'); // Redirect to home on success
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const renderRoleSelection = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur MyHairCut</h1>
                <p className="text-gray-500">Vous êtes ?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleRoleSelect('client')}
                    className="p-6 rounded-2xl border-2 border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all flex flex-col items-center gap-4 group"
                >
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                        <User size={32} />
                    </div>
                    <span className="font-semibold text-gray-900">Client</span>
                </button>

                <button
                    onClick={() => handleRoleSelect('hairdresser')}
                    className="p-6 rounded-2xl border-2 border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all flex flex-col items-center gap-4 group"
                >
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                        <Scissors size={32} />
                    </div>
                    <span className="font-semibold text-gray-900">Coiffeur</span>
                </button>
            </div>

            <div className="text-center text-sm text-gray-500">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                    Se connecter
                </Link>
            </div>
        </div>
    );

    const renderForm = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    Inscription {role === 'client' ? 'Client' : 'Coiffeur'}
                </h1>
                <p className="text-gray-500">Remplissez vos informations</p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            name="name"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            name="email"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="tel"
                            name="phone"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                            placeholder="+212 6..."
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                {role === 'hairdresser' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville / Quartier</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="address"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                                placeholder="Casablanca, Maarif"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            name="password"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                {role === 'hairdresser' && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            <Camera size={16} />
                            Vérification d'identité requise
                        </h3>
                        <p className="text-xs text-blue-600 mb-3">
                            Pour garantir la sécurité, nous aurons besoin d'une photo de votre CIN et d'un selfie après l'inscription.
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Création en cours...' : 'Créer mon compte'}
                </button>

                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
                >
                    Retour au choix du profil
                </button>
            </form>
        </div>
    );

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            {step === 1 ? renderRoleSelection() : renderForm()}
        </div>
    );
};

export default Register;
