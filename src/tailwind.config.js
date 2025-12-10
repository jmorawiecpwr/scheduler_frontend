// tailwind.config.js
module.exports = {
    theme: {
        extend: {
            keyframes: {
                'gradient-x': {
                    '0%, 100%': { 'background-position': 'left center' },
                    '50%': { 'background-position': 'right center' },
                },
            },
            animation: {
                'gradient-x': 'gradient-x 10s ease infinite',
            },
        },
    },
    plugins: [],
};