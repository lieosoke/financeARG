import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import { Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import logo from '../../assets/images/logo.png';
import pkg from '../../../package.json';

const SignUp = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch company settings for dynamic branding
    const { data: companySettingsData } = useCompanySettings();
    const companyName = companySettingsData?.data?.name || 'ARG App';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Password dan Konfirmasi Password tidak cocok.');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password minimal 8 karakter.');
            setLoading(false);
            return;
        }

        const result = await register(formData.email, formData.password, formData.name);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Registrasi gagal. Silakan coba lagi.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex bg-dark-primary">
            {/* Left Side - Hero Section with Animated Background (Similar to Login) */}
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
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8 shadow-glow-emerald animate-glow-pulse overflow-hidden">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>

                        <h1 className="text-5xl font-bold mb-4 font-display">
                            Bergabung Bersama Kami
                        </h1>
                        <p className="text-xl mb-2 text-primary-300 font-medium">Buat Akun Baru</p>
                        <p className="text-lg text-gray-400">
                            Mulai kelola perjalanan ibadah dengan lebih mudah dan terpercaya.
                        </p>
                    </div>
                </div>

                {/* Bottom Gradient Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-primary to-transparent"></div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8">
                <div className="w-full max-w-md">
                    {/* Logo for mobile */}
                    <div className="lg:hidden mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-glow-emerald-sm overflow-hidden">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-2xl font-bold text-white font-display">{companyName}</h2>
                        <p className="text-sm text-gray-500 mt-1">Registrasi Akun</p>
                    </div>

                    {/* Sign Up Card */}
                    <div className="bg-dark-secondary/80 backdrop-blur-xl rounded-3xl border border-surface-border p-8 shadow-glass">
                        {/* Gradient Border Effect */}
                        <div className="absolute inset-0 rounded-3xl gradient-border pointer-events-none"></div>

                        <div className="mb-8 relative">
                            <h2 className="text-3xl font-bold text-white mb-2 font-display">Daftar Akun</h2>
                            <p className="text-gray-400">Lengkapi data diri Anda untuk mendaftar</p>
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
                                label="Nama Lengkap"
                                type="text"
                                name="name"
                                placeholder="Nama Lengkap Anda"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                icon={<User className="w-5 h-5" />}
                            />

                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="email@contoh.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                icon={<Mail className="w-5 h-5" />}
                            />

                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="Minimal 8 karakter"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                icon={<Lock className="w-5 h-5" />}
                            />

                            <Input
                                label="Konfirmasi Password"
                                type="password"
                                name="confirmPassword"
                                placeholder="Ulangi password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                icon={<CheckCircle className="w-5 h-5" />}
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={loading}
                                size="lg"
                                className="mt-6 group"
                            >
                                <span>Daftar</span>
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>

                        <div className="mt-8 text-center relative">
                            <p className="text-sm text-gray-500">
                                Sudah punya akun?{' '}
                                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                                    Masuk disini
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-gray-600">
                        <p>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
                        <p className="text-xs mt-1 text-gray-500">v{pkg.version}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
