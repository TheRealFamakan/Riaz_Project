import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Euro } from 'lucide-react';

const HairdresserCard = ({ hairdresser }) => {
    const { id, user, bio, city, neighborhood, averageRating, totalReviews, services } = hairdresser;

    // Get min price from services
    const minPrice = services && services.length > 0
        ? Math.min(...services.map(s => parseFloat(s.price)))
        : null;

    return (
        <Link
            to={`/hairdresser/${id}`}
            className="block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
        >
            <div className="p-4 flex gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 flex-shrink-0">
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full rounded-xl object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 text-2xl font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 truncate">{user?.name}</h3>
                        {user?.verified && (
                            <span className="flex-shrink-0 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                Vérifié
                            </span>
                        )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={16} fill="currentColor" />
                            <span className="font-semibold text-gray-900">
                                {averageRating > 0 ? averageRating.toFixed(1) : 'Nouveau'}
                            </span>
                        </div>
                        {totalReviews > 0 && (
                            <span className="text-sm text-gray-500">({totalReviews} avis)</span>
                        )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                        <MapPin size={14} />
                        <span>{city}{neighborhood && `, ${neighborhood}`}</span>
                    </div>

                    {/* Services */}
                    {services && services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {services.slice(0, 3).map((service, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-md font-medium"
                                >
                                    {service.name}
                                </span>
                            ))}
                            {services.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                                    +{services.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Price */}
                    {minPrice && (
                        <div className="flex items-center gap-1 text-primary-600 font-semibold text-sm">
                            <Euro size={14} />
                            <span>À partir de {minPrice} MAD</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default HairdresserCard;
