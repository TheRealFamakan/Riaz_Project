import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { appointmentAPI } from '../services/api';

const Payment = () => {
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState(null);
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Get booking details from sessionStorage
        const details = sessionStorage.getItem('bookingDetails');
        if (!details) {
            navigate('/');
            return;
        }
        setBookingDetails(JSON.parse(details));
    }, [navigate]);

    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');

        // Simple validation
        if (!cardNumber || !cardName || !expiry || !cvv) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        setProcessing(true);

        try {
            // Get pending booking data
            const pendingBooking = JSON.parse(sessionStorage.getItem('pendingBooking'));

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create appointment with online payment
            await appointmentAPI.create({
                ...pendingBooking,
                paymentStatus: 'completed',
                transactionId: `TXN${Date.now()}`
            });

            // Clear session storage
            sessionStorage.removeItem('pendingBooking');
            sessionStorage.removeItem('bookingDetails');

            // Redirect to success page
            navigate('/payment-success');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du paiement');
            setProcessing(false);
        }
    };

    if (!bookingDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Paiement sécurisé</h1>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif de la commande</h2>
                <div className="space-y-2">
                    <p><span className="text-gray-600">Coiffeur:</span> <span className="font-semibold">{bookingDetails.hairdresserName}</span></p>
                    <p><span className="text-gray-600">Service:</span> <span className="font-semibold">{bookingDetails.serviceName}</span></p>
                    <p><span className="text-gray-600">Date:</span> <span className="font-semibold">{new Date(bookingDetails.date).toLocaleDateString('fr-FR')}</span></p>
                    <p><span className="text-gray-600">Heure:</span> <span className="font-semibold">{bookingDetails.time.substring(0, 5)}</span></p>
                    <div className="border-t pt-2 mt-2">
                        <p className="text-lg"><span className="text-gray-600">Total:</span> <span className="font-bold text-primary-600">{parseFloat(bookingDetails.servicePrice).toFixed(2)} MAD</span></p>
                    </div>
                </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayment} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Lock size={20} className="text-green-600" />
                    <span className="text-sm text-gray-600">Paiement 100% sécurisé</span>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de carte
                    </label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                            placeholder="1234 5678 9012 3456"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom sur la carte
                    </label>
                    <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="JOHN DOE"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none uppercase"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date d'expiration
                        </label>
                        <input
                            type="text"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').substring(0, 4))}
                            placeholder="MM/AA"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                        </label>
                        <input
                            type="text"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                            placeholder="123"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all ${processing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700'
                        }`}
                >
                    {processing ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Traitement en cours...
                        </span>
                    ) : (
                        `Payer ${bookingDetails ? parseFloat(bookingDetails.servicePrice).toFixed(2) : '0.00'} MAD`
                    )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                    🔒 Vos informations sont cryptées et sécurisées
                </p>
            </form>
        </div>
    );
};

console.log('Payment module loaded');

export default Payment;
