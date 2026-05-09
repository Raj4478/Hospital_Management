//const withMT = require("@material-tailwind/react/utils/withMT");

 //@type {import('tailwindcss').Config} 
 export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.jsx"
  ],
  theme: {
    extend: {
      colors:{
        var1:"#141414",
        var2:"#222222",
        var3:"#FFF5F5DF"
      },
      fontFamily:{
        'news':"Newsreader",
        'merri':"Merriweather",
        'new':"New Amsterdam",
        'dance':"Dancing Script",
        'kalam':"kalam"

      }
      ,
      backgroundImage:{
        "pic1":"url(/src/assets/img1.jpg)",
        "pic2":"url(/src/assets/img3.jpg)",
        "pic3":"url(/src/assets/wall3.jpg)"
      },
      opacity: {
                 '10': '0.1',
               '20': '0.2',
                '95': '0.95',
                }
    },
  },
  plugins: [],
}