/** @type {import('tailwindcss').Config} */
export default {
    purge: [],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            fontFamily: {
                headline: ['Playfair Display', 'serif'], // Classic headline font
                body: ['Merriweather', 'serif'], // Readable body text
                ui: ['Roboto', 'sans-serif'], // Sidebar & navigation
                oldpress: ['Courier New', 'monospace'], // Typewriter style
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
