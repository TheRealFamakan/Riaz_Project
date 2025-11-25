import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Phone, Mail, Euro, Clock, Calendar } from 'lucide-react';
import { hairdresserAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HairdresserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [hairdresser, setHairdresser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchHairdresser();
        fetchReviews();
    }, [id]);

    const fetchHairdresser = async () => {
        try {
            const data = await hairdresserAPI.getById(id);
            setHairdresser(data);
        } catch (error) {
            console.error('Error fetching hairdresser:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const data = await reviewAPI.getHairdresserReviews(id);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await reviewAPI.create({
                hairdresserProfileId: parseInt(id),
                rating,
                comment
            });
            setShowReviewForm(false);
            setComment('');
            setRating(5);
            fetchReviews();
            fetchHairdresser(); // Refresh to update rating
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors de la création de l\'avis');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!hairdresser) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <p className="text-gray-500">Coiffeur non trouvé</p>
                <button
                    onClick={() => navigate('/search')}
                    className="mt-4 text-primary-600 hover:underline"
                >
                    Retour à la recherche
                </button>
            </div>
        );
    }

    const { user: hairdresserUser, bio, city, neighborhood, experience, averageRating, totalReviews, services } = hairdresser;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/search')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft size={20} />
                Retour à la recherche
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>

                <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-16 mb-4">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-primary-600 text-4xl font-bold">
                            {hairdresserUser?.avatar ? (
                                <img src={hairdresserUser.avatar} alt={hairdresserUser.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                hairdresserUser?.name?.charAt(0).toUpperCase()
                            )}
                        </div>

                        <div className="mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">{hairdresserUser?.name}</h1>
                            {hairdresserUser?.verified && (
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium mt-1">
                                    Vérifié
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Rating & Experience */}
                    <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                            <Star size={20} className="text-yellow-500" fill="currentColor" />
                            <span className="font-semibold text-lg">
                                {averageRating > 0 ? averageRating.toFixed(1) : 'Nouveau'}
                            </span>
                            {totalReviews > 0 && (
                                <span className="text-gray-500">({totalReviews} avis)</span>
                            )}
                        </div>
                        {experience && (
                            <div className="text-gray-600">
                                {experience} {experience > 1 ? 'ans' : 'an'} d'expérience
                            </div>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={18} className="text-primary-600" />
                            <span>{city}{neighborhood && `, ${neighborhood}`}</span>
                        </div>
                        {hairdresserUser?.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone size={18} className="text-primary-600" />
                                <span>{hairdresserUser.phone}</span>
                            </div>
                        )}
                        {hairdresserUser?.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail size={18} className="text-primary-600" />
                                <span>{hairdresserUser.email}</span>
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    {bio && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                            <h3 className="font-semibold text-gray-900 mb-2">À propos</h3>
                            <p className="text-gray-600">{bio}</p>
                        </div>
                    )}

                    {/* Booking Button */}
                    <Link
                        to={user ? `/book/${id}` : '/login'}
                        className="mt-6 w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Calendar size={24} />
                        Réserver un rendez-vous
                    </Link>
                </div>
            </div>

            {/* Services */}
            {services && services.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Services & Tarifs</h2>
                    <div className="space-y-3">
                        {services.map(service => (
                            <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                    {service.description && (
                                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                    )}
                                    {service.duration && (
                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                            <Clock size={14} />
                                            <span>{service.duration} min</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-primary-600 font-bold text-lg ml-4">
                                    <Euro size={18} />
                                    <span>{parseFloat(service.price).toFixed(2)} MAD</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Avis clients</h2>
                    {user && user.role === 'client' && (
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                        >
                            {showReviewForm ? 'Annuler' : 'Laisser un avis'}
                        </button>
                    )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                    <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            size={32}
                                            className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}
                                            fill={star <= rating ? 'currentColor' : 'none'}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Partagez votre expérience..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Publier l'avis
                        </button>
                    </form>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                            {review.client?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{review.client?.name}</p>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                                                        fill={i < review.rating ? 'currentColor' : 'none'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                {review.comment && (
                                    <p className="text-gray-600 mt-2">{review.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">Aucun avis pour le moment</p>
                )}
            </div>

            {/* Book Button */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <Link
                    to={`/book/${id}`}
                    className="block w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-center"
                >
                    Réserver un rendez-vous
                </Link>
            </div>
        </div>
    );
};

export default HairdresserDetail;
