/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Neon Colors matching existing design
                'neon-cyan': '#00f3ff',
                'neon-magenta': '#ff00ff',
                'neon-purple': '#9d00ff',
                'neon-pink': '#ff0080',
                'neon-blue': '#0080ff',
                'neon-green': '#00ff88',
                // Dark Theme
                'bg-darkest': '#0a0a0f',
                'bg-dark': '#121218',
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'Segoe UI', 'sans-serif'],
                orbitron: ['Orbitron', 'sans-serif'],
                rajdhani: ['Rajdhani', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'neon-cyan': '0 0 20px rgba(0, 243, 255, 0.5)',
                'neon-magenta': '0 0 20px rgba(255, 0, 255, 0.5)',
                'neon-green': '0 0 20px rgba(0, 255, 136, 0.5)',
            },
            animation: {
                'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'slide-in-up': 'slide-in-up 0.5s ease-out',
            },
            keyframes: {
                'pulse-neon': {
                    '0%, 100%': {
                        boxShadow: '0 0 5px var(--neon-cyan), 0 0 10px var(--neon-cyan), 0 0 15px var(--neon-cyan)',
                    },
                    '50%': {
                        boxShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan), 0 0 30px var(--neon-cyan)',
                    },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'slide-in-up': {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
