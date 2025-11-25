import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar } from 'lucide-react';
import { hairdresserAPI, appointmentAPI } from '../services/api';

const BookAppointment = () => {
    const { hairdresserId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [hairdresser, setHairdresser] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState('');

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchHairdresser();
    }, [hairdresserId, user]);

    // Fetch hairdresser details
    const fetchHairdresser = async () => {
        try {
            const data = await hairdresserAPI.getById(hairdresserId);
            setHairdresser(data);
        } catch (err) {
            console.error('Error fetching hairdresser:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch available slots when a date is chosen
    useEffect(() => {
        if (selectedDate && hairdresserId) {
            fetchAvailableSlots();
        }
    }, [selectedDate]);

    const fetchAvailableSlots = async () => {
        try {
            const data = await appointmentAPI.getAvailableSlots(hairdresserId, selectedDate);
            setAvailableSlots(data.availableSlots || []);
        } catch (err) {
            console.error('Error fetching slots:', err);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedService || !selectedDate || !selectedTime) {
            setError('Veuillez remplir tous les champs');
            return;
        }
        setBooking(true);
        try {
            const appointmentData = {
                hairdresserProfileId: parseInt(hairdresserId),
                serviceId: selectedService.id,
                appointmentDate: selectedDate,
                appointmentTime: selectedTime,
                notes,
                paymentMethod,
            };

            // If online payment, redirect to payment page
            if (paymentMethod === 'online') {
                // Store booking data in sessionStorage
                sessionStorage.setItem('pendingBooking', JSON.stringify(appointmentData));
                sessionStorage.setItem('bookingDetails', JSON.stringify({
                    hairdresserName: hairdresser.user?.name,
                    serviceName: selectedService.name,
                    servicePrice: selectedService.price,
                    date: selectedDate,
                    time: selectedTime
                }));
                navigate('/payment');
            } else {
                // Cash payment - create appointment directly
                await appointmentAPI.create(appointmentData);
                navigate('/appointments', { state: { message: 'Rendez‑vous réservé avec succès!' } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la réservation');
        } finally {
            setBooking(false);
        }
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!hairdresser) {
        return <div className="max-w-4xl mx-auto p-6">Coiffeur non trouvé</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(`/hairdresser/${hairdresserId}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft size={20} /> Retour
            </button>

            <h1 className="text-2xl font-bold text-gray-900">Réserver avec {hairdresser.user?.name}</h1>

            <form onSubmit={handleBooking} className="space-y-6">
                {/* Service Selection */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Choisissez un service</h2>
                    <div className="space-y-3">
                        {hairdresser.services?.map(service => (
                            <div
                                key={service.id}
                                onClick={() => setSelectedService(service)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedService?.id === service.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                        {service.description && (
                                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                        )}
                                        {service.duration && (
                                            <p className="text-sm text-gray-500 mt-1">{service.duration} min</p>
                                        )}
                                    </div>
                                    <div className="text-primary-600 font-bold text-lg">
                                        {parseFloat(service.price).toFixed(2)} MAD
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Date Selection */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Choisissez une date</h2>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="date"
                            min={getMinDate()}
                            value={selectedDate}
                            onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                    </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Choisissez un créneau</h2>
                        {availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                {availableSlots.map(slot => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setSelectedTime(slot)}
                                        className={`p-3 rounded-lg border-2 transition-all ${selectedTime === slot ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-primary-300'}`}
                                    >
                                        {slot.substring(0, 5)}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Aucun créneau disponible pour cette date</p>
                        )}
                    </div>
                )}

                {/* Notes */}
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Notes (optionnel)</h3>
                    <textarea
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        rows="3"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Détails supplémentaires..."
                    ></textarea>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">5. Méthode de paiement</h2>
                    <div className="space-y-3">
                        <div
                            onClick={() => setPaymentMethod('cash')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-primary-600' : 'border-gray-300'}`}>
                                    {paymentMethod === 'cash' && <div className="w-3 h-3 rounded-full bg-primary-600" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">💵 Paiement en espèces</h3>
                                    <p className="text-sm text-gray-600">Payez directement le coiffeur après la prestation</p>
                                </div>
                            </div>
                        </div>
                        <div
                            onClick={() => setPaymentMethod('online')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-primary-600' : 'border-gray-300'}`}>
                                    {paymentMethod === 'online' && <div className="w-3 h-3 rounded-full bg-primary-600" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">💳 Paiement en ligne</h3>
                                    <p className="text-sm text-gray-600">Payez maintenant par carte bancaire</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary & Submit */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h2>
                    <div className="space-y-2 mb-4">
                        <p><span className="text-gray-600">Service:</span> <span className="font-semibold">{selectedService?.name || '—'}</span></p>
                        <p><span className="text-gray-600">Date:</span> <span className="font-semibold">{selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR') : '—'}</span></p>
                        <p><span className="text-gray-600">Heure:</span> <span className="font-semibold">{selectedTime ? selectedTime.substring(0, 5) : '—'}</span></p>
                        <p><span className="text-gray-600">Prix:</span> <span className="font-semibold text-primary-600">{selectedService ? parseFloat(selectedService.price).toFixed(2) : '—'} MAD</span></p>
                        <p><span className="text-gray-600">Paiement:</span> <span className="font-semibold">{paymentMethod === 'cash' ? '💵 En espèces' : '💳 En ligne'}</span></p>
                    </div>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="mt-8">
                        <button
                            onClick={handleBooking}
                            disabled={!selectedDate || !selectedTime || !selectedService}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${(!selectedDate || !selectedTime || !selectedService) ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'}`}
                        >
                            {booking ? 'Traitement...' : (paymentMethod === 'online' ? 'Procéder au paiement' : 'Confirmer la réservation')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BookAppointment;
