/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dark theme backgrounds
                dark: {
                    'primary': '#0f1419',
                    'secondary': '#1a1f27',
                    'tertiary': '#252b35',
                    'elevated': '#2d3540',
                },
                // Emerald Green brand color
                primary: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                // Accent colors for variety
                accent: {
                    blue: '#3b82f6',
                    purple: '#8b5cf6',
                    amber: '#f59e0b',
                    rose: '#f43f5e',
                    cyan: '#06b6d4',
                },
                // Surface colors
                surface: {
                    'glass': 'rgba(255, 255, 255, 0.05)',
                    'glass-hover': 'rgba(255, 255, 255, 0.08)',
                    'glass-active': 'rgba(255, 255, 255, 0.12)',
                    'border': 'rgba(255, 255, 255, 0.1)',
                    'border-hover': 'rgba(255, 255, 255, 0.15)',
                },
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
                display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
                'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -5px rgba(0, 0, 0, 0.2)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.1)',
                'glow-emerald-sm': '0 0 10px rgba(16, 185, 129, 0.2)',
                'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
                'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
                'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'fade-up': 'fadeUp 0.4s ease-out',
                'slide-up': 'slideUp 0.2s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
                    '50%': { boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(16, 185, 129, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)',
                'gradient-mesh-login': 'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.3) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.2) 0px, transparent 50%)',
                'shimmer': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
            },
            backdropBlur: {
                'xs': '2px',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
        },
    },
    plugins: [],
}
