import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import { Lock, Mail, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompanySettings } from '../../hooks/useCompanySettings';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch company settings for dynamic branding
    const { data: companySettingsData } = useCompanySettings();
    const companyName = companySettingsData?.data?.name || 'Finance App';

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Clear error when user types
        if (error) setError(null);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Login gagal. Periksa email dan password.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex bg-dark-primary">
            {/* Left Side - Hero Section with Animated Background */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Animated Gradient Mesh Background */}
                <div className="absolute inset-0 bg-gradient-mesh-login"></div>

                {/* Floating Orbs */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-40 right-20 w-80 h-80 bg-primary-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
                <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-primary-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '-1.5s' }}></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.3) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
                    <div className="max-w-md text-center">
                        {/* Logo with Glow */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl mb-8 shadow-glow-emerald animate-glow-pulse">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-5xl font-bold mb-4 font-display">
                            {companyName}
                        </h1>
                        <p className="text-xl mb-2 text-primary-300 font-medium">Dashboard Keuangan & Manajemen</p>
                        <p className="text-lg text-gray-400">
                            Spesialis Haji & Umroh Terpercaya
                        </p>

                        {/* Stats */}
                        <div className="mt-16 flex items-center justify-center gap-12">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white font-display">500+</div>
                                <div className="text-sm text-gray-400 mt-1">Jamaah Terlayani</div>
                            </div>
                            <div className="w-px h-12 bg-surface-border"></div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white font-display">15+</div>
                                <div className="text-sm text-gray-400 mt-1">Tahun Pengalaman</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Gradient Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-primary to-transparent"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8">
                <div className="w-full max-w-md">
                    {/* Logo for mobile */}
                    <div className="lg:hidden mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl mb-4 shadow-glow-emerald-sm">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white font-display">{companyName}</h2>
                        <p className="text-sm text-gray-500 mt-1">Dashboard Keuangan</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-dark-secondary/80 backdrop-blur-xl rounded-3xl border border-surface-border p-8 shadow-glass">
                        {/* Gradient Border Effect */}
                        <div className="absolute inset-0 rounded-3xl gradient-border pointer-events-none"></div>

                        <div className="mb-8 relative">
                            <h2 className="text-3xl font-bold text-white mb-2 font-display">Selamat Datang</h2>
                            <p className="text-gray-400">Silakan login untuk melanjutkan</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5 relative">
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="admin@argtour.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                icon={<Mail className="w-5 h-5" />}
                            />

                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                icon={<Lock className="w-5 h-5" />}
                            />

                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-surface-border bg-dark-tertiary text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                                    />
                                    <span className="ml-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Ingat saya</span>
                                </label>
                                <a
                                    href="https://wa.me/6281272758255?text=Halo%20Admin%2C%20saya%20ingin%20reset%20password%20akun%20saya%20di%20Dashboard%20ARG%20Tour%20%26%20Travel"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
                                >
                                    Lupa password?
                                </a>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={loading}
                                size="lg"
                                className="mt-6 group"
                            >
                                <span>Masuk</span>
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>



                        <div className="mt-8 text-center relative">
                            <p className="text-sm text-gray-500">
                                Belum punya akun?{' '}
                                <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                                    Daftar sekarang
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-gray-600">
                        <p>&copy; 2025 {companyName}. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
