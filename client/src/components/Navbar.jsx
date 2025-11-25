import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Calendar, User, Scissors, LogOut, Shield } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label, active }) => (
    <Link
        to={to}
        className={clsx(
            "flex flex-col items-center justify-center w-full h-full space-y-1",
            active ? "text-primary-600" : "text-gray-500 hover:text-primary-400"
        )}
    >
        <Icon size={24} />
        <span className="text-xs font-medium">{label}</span>
    </Link>
);

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden h-16 pb-safe">
                <div className="flex items-center justify-around h-full">
                    <NavItem to="/" icon={Home} label="Accueil" active={path === '/'} />
                    <NavItem to="/search" icon={Search} label="Recherche" active={path === '/search'} />
                    <div className="relative -top-5">
                        <Link to="/book" className="flex items-center justify-center w-14 h-14 bg-primary-600 rounded-full shadow-lg text-white">
                            <Scissors size={24} />
                        </Link>
                    </div>
                    <NavItem to="/appointments" icon={Calendar} label="RDV" active={path === '/appointments'} />
                    {user?.role === 'admin' ? (
                        <NavItem to="/admin" icon={Shield} label="Admin" active={path.startsWith('/admin')} />
                    ) : (
                        <NavItem to="/profile" icon={User} label="Profil" active={path === '/profile' || path === '/profile/edit'} />
                    )}
                </div>
            </nav>

            {/* Desktop Top Navigation */}
            <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 px-8 items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                        <Scissors size={20} />
                    </div>
                    <span className="text-xl font-bold text-primary-900">MyHairCut</span>
                </div>

                <nav className="flex items-center gap-8">
                    <Link to="/" className={clsx("font-medium", path === '/' ? "text-primary-600" : "text-gray-600 hover:text-primary-600")}>Accueil</Link>
                    <Link to="/search" className={clsx("font-medium", path === '/search' ? "text-primary-600" : "text-gray-600 hover:text-primary-600")}>Rechercher</Link>
                    <Link to="/appointments" className={clsx("font-medium", path === '/appointments' ? "text-primary-600" : "text-gray-600 hover:text-primary-600")}>Mes RDV</Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin" className={clsx("font-medium flex items-center gap-2", path.startsWith('/admin') ? "text-amber-600" : "text-amber-500 hover:text-amber-600")}>
                            <Shield size={18} />
                            Admin
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{user?.name}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                            >
                                <LogOut size={18} />
                                <span className="font-medium">Déconnexion</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-primary-600 font-medium hover:underline">Connexion</Link>
                            <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                                Inscription
                            </Link>
                        </>
                    )}
                </div>
            </header>
        </>
    );
};

export default Navbar;
