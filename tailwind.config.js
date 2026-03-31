/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surface Hierarchy
        surface: {
          DEFAULT: '#F9F9F9',
          low: '#F3F3F3',
          container: '#FFFFFF',
          high: '#E8E8E8',
          highest: '#E2E2E2',
        },
        // Primary - WhatsApp Green
        primary: {
          DEFAULT: '#006D2F',
          container: '#25D366',
        },
        // Secondary
        secondary: {
          container: '#E2E2E2',
        },
        // Text
        'on-surface': '#1B1B1B',
        'on-background': '#1B1B1B',
        'on-primary': '#FFFFFF',
        'on-primary-container': '#1B1B1B',
        'on-secondary': '#1B1B1B',
        // Ghost border
        outline: {
          variant: 'rgba(187, 203, 185, 0.15)',
        },
      },
      fontSize: {
        // Display
        'display-lg': ['3.5rem', { lineHeight: '1.2', letterSpacing: 'normal' }],
        'display-md': ['2.875rem', { lineHeight: '1.2' }],
        // Headline
        'headline-lg': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        'headline-md': ['1.75rem', { lineHeight: '1.3' }],
        // Title
        'title-lg': ['1.5rem', { lineHeight: '1.4' }],
        'title-md': ['1rem', { lineHeight: '1.5' }],
        // Body
        'body-lg': ['1rem', { lineHeight: '1.6' }],
        'body-md': ['0.875rem', { lineHeight: '1.6' }],
        // Label
        'label-md': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.4' }],
      },
      spacing: {
        // Custom spacing scale
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.5rem',    // 24px
        '6': '2rem',      // 32px
        '8': '3rem',      // 48px
        '10': '4rem',     // 64px
      },
      borderRadius: {
        // Capitol Lean: 0px everywhere
        DEFAULT: '0px',
        'none': '0px',
        'sm': '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
        '2xl': '0px',
        '3xl': '0px',
        'full': '9999px', // Allow full for avatars if explicitly needed, but PRD says 0px even for avatars
      },
      boxShadow: {
        // Ambient glow only
        'glow': '0px 20px 40px rgba(27, 27, 27, 0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
        'plus-jakarta': ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
