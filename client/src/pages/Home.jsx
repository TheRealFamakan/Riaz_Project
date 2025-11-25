import React, { useState, useEffect } from 'react';
import { Search, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hairdresserAPI } from '../services/api';
import HairdresserCard from '../components/HairdresserCard';

const Home = () => {
    const navigate = useNavigate();
    const [topHairdressers, setTopHairdressers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopHairdressers();
    }, []);

    const fetchTopHairdressers = async () => {
        try {
            const data = await hairdresserAPI.search({});
            // Get top 6 hairdressers by rating
            const sorted = (data.hairdressers || [])
                .sort((a, b) => b.averageRating - a.averageRating)
                .slice(0, 6);
            setTopHairdressers(sorted);
        } catch (error) {
            console.error('Error fetching hairdressers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category) => {
        navigate(`/search?service=${category.toLowerCase()}`);
    };

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl overflow-hidden relative">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Left side - Text content */}
                    <div className="p-8 md:p-12 text-white relative z-10">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            Votre coiffeur à domicile, <br />
                            <span className="text-primary-200">en un clic.</span>
                        </h1>
                        <p className="text-primary-100 mb-8 text-lg">
                            Trouvez les meilleurs coiffeurs près de chez vous et réservez instantanément.
                        </p>

                        <button
                            onClick={() => navigate('/search')}
                            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-all shadow-lg inline-flex items-center gap-2 hover:scale-105 transform"
                        >
                            <Search size={24} />
                            Rechercher un coiffeur
                        </button>
                    </div>

                    {/* Right side - Illustration */}
                    <div className="relative h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center p-8">
                        <img
                            src="/hero-illustration.png"
                            alt="Coiffeur à domicile"
                            className="w-full max-w-md h-auto object-contain animate-float drop-shadow-2xl"
                        />
                        {/* Decorative elements */}
                        <div className="absolute top-10 right-10 w-20 h-20 bg-primary-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <div className="absolute bottom-10 left-10 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                </div>

                {/* Decorative Circle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            </section>

            {/* Categories */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Catégories populaires</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { name: 'Coupe', icon: '✂️' },
                        { name: 'Brushing', icon: '💨' },
                        { name: 'Coloration', icon: '🎨' },
                        { name: 'Barbe', icon: '🧔' }
                    ].map((cat) => (
                        <div
                            key={cat.name}
                            onClick={() => handleCategoryClick(cat.name)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer text-center"
                        >
                            <div className="w-12 h-12 bg-primary-50 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                                {cat.icon}
                            </div>
                            <h3 className="font-medium text-gray-800">{cat.name}</h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Top Rated Hairdressers */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Coiffeurs à la une</h2>
                    <button
                        onClick={() => navigate('/search')}
                        className="text-primary-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        Voir tout
                        <ArrowRight size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : topHairdressers.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {topHairdressers.map((hairdresser) => (
                            <HairdresserCard key={hairdresser.id} hairdresser={hairdresser} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                        <p className="text-gray-500 mb-4">Aucun coiffeur disponible pour le moment</p>
                        <button
                            onClick={() => navigate('/register')}
                            className="text-primary-600 hover:underline font-medium"
                        >
                            Devenir coiffeur partenaire
                        </button>
                    </div>
                )}
            </section>

            {/* How it works */}
            <section className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-3xl p-8 md:p-12">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Comment ça marche ?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                            1
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Recherchez</h3>
                        <p className="text-gray-600">Trouvez le coiffeur parfait près de chez vous</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                            2
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Réservez</h3>
                        <p className="text-gray-600">Choisissez votre créneau et confirmez en un clic</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                            3
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Profitez</h3>
                        <p className="text-gray-600">Votre coiffeur vient chez vous à l'heure prévue</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
