module.exports = {
  theme: {
    zIndex: {
      '-10': '-10', // Add this line to define a negative z-index value
      '0': '0',
      '10': '10',
      '20': '20',
      '30': '30',
      '40': '40',
      '50': '50',
    },
    // other theme settings
  },
  // other configuration settings
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
        "dracula"
    ],
  },
};

