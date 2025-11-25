import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Home } from 'lucide-react';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="text-green-600" size={40} />
                </div>

                <h1 className="text-2xl font-bold text-gray-900">Paiement réussi !</h1>

                <p className="text-gray-600">
                    Votre réservation a été confirmée avec succès. Vous recevrez bientôt un email de confirmation.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Numéro de transaction</p>
                    <p className="font-mono font-medium text-gray-900">TXN-{Math.floor(Math.random() * 1000000)}</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/appointments')}
                        className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Calendar size={20} />
                        Voir mes rendez-vous
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-white text-gray-600 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Home size={20} />
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
