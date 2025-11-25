import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Filter, X, SlidersHorizontal } from 'lucide-react';
import { hairdresserAPI } from '../services/api';
import HairdresserCard from '../components/HairdresserCard';

const Search = () => {
    const [hairdressers, setHairdressers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        city: '',
        service: '',
        minPrice: '',
        maxPrice: '',
        minRating: ''
    });
    const [sortBy, setSortBy] = useState('rating'); // rating, price, name

    useEffect(() => {
        searchHairdressers();
    }, []);

    // Real-time search when filters change
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            searchHairdressers();
        }, 500); // Debounce de 500ms

        return () => clearTimeout(delaySearch);
    }, [filters, sortBy]);

    const searchHairdressers = async () => {
        setLoading(true);
        try {
            const cleanFilters = {};
            Object.keys(filters).forEach(key => {
                if (filters[key]) cleanFilters[key] = filters[key];
            });

            const data = await hairdresserAPI.search(cleanFilters);
            let results = data.hairdressers || [];

            // Tri côté client
            results = sortResults(results);
            setHairdressers(results);
        } catch (error) {
            console.error('Error searching hairdressers:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortResults = (results) => {
        switch (sortBy) {
            case 'rating':
                return [...results].sort((a, b) => b.averageRating - a.averageRating);
            case 'price':
                return [...results].sort((a, b) => {
                    const minPriceA = a.services?.length > 0 ? Math.min(...a.services.map(s => parseFloat(s.price))) : 0;
                    const minPriceB = b.services?.length > 0 ? Math.min(...b.services.map(s => parseFloat(s.price))) : 0;
                    return minPriceA - minPriceB;
                });
            case 'name':
                return [...results].sort((a, b) => a.user?.name.localeCompare(b.user?.name));
            default:
                return results;
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ city: '', service: '', minPrice: '', maxPrice: '', minRating: '' });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            {/* Search Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Trouver un coiffeur</h1>

                {/* Main Search Bar */}
                <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Ville ou quartier..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                            value={filters.city}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3 rounded-xl border-2 transition-colors flex items-center gap-2 ${showFilters || hasActiveFilters
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <SlidersHorizontal size={20} />
                        <span className="hidden sm:inline">Filtres</span>
                        {hasActiveFilters && (
                            <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {Object.values(filters).filter(v => v !== '').length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Filtres avancés</h3>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                                >
                                    <X size={14} />
                                    Effacer tout
                                </button>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Service */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                    value={filters.service}
                                    onChange={(e) => handleFilterChange('service', e.target.value)}
                                >
                                    <option value="">Tous les services</option>
                                    <option value="coupe">Coupe</option>
                                    <option value="coloration">Coloration</option>
                                    <option value="brushing">Brushing</option>
                                    <option value="barbe">Barbe</option>
                                    <option value="soin">Soin</option>
                                </select>
                            </div>

                            {/* Prix min */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix minimum (MAD)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                />
                            </div>

                            {/* Prix max */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix maximum (MAD)</label>
                                <input
                                    type="number"
                                    placeholder="500"
                                    min="0"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                />
                            </div>

                            {/* Note minimale */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note minimale</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none"
                                    value={filters.minRating}
                                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                >
                                    <option value="">Toutes les notes</option>
                                    <option value="3">3+ étoiles</option>
                                    <option value="4">4+ étoiles</option>
                                    <option value="4.5">4.5+ étoiles</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Header with Sort */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    {loading ? 'Recherche...' : `${hairdressers.length} coiffeur(s) trouvé(s)`}
                </h2>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Trier par:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none text-sm"
                    >
                        <option value="rating">Note</option>
                        <option value="price">Prix croissant</option>
                        <option value="name">Nom (A-Z)</option>
                    </select>
                </div>
            </div>

            {/* Results */}
            <div>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : hairdressers.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {hairdressers.map(hairdresser => (
                            <HairdresserCard key={hairdresser.id} hairdresser={hairdresser} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 mb-2">Aucun coiffeur trouvé</p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-primary-600 hover:underline text-sm"
                            >
                                Effacer les filtres
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
