/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}" 
  ],
  theme: {
    extend: {
      colors: {
        navBluelight : "#60a5fa", 
        navBluedark : '#092d47',
        hoverColor : "#212b38",
        hoverColor2 : "#4f5966",
        boeingBleu :"#4169E1",
        sky: "#62cff4" ,
        sky2:"#2c67f2",
        sky3:"#3c8ce7",
        sky4:"#736efe"
        
      },
      keyframes: {
        slideFromTop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        slideFromTop: 'slideFromTop 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}

// '#04243687' blue hedha mezyen
        // '#063f5e87' hedha zeda
        //'#02416487'
        // '#3c627b' white
        //'#2c51a8'
        //3b65c9
        //4971d1
        //5d83de
        //5278d4
        //4e7dee