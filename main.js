const BikramSambat = require('@askbuddie/bikram-sambat')

function setNepaliDate() {
    const today = new BikramSambat.default();
    const dateElement = document.getElementById('date');
    // Set the formatted date as text content
    dateElement.textContent = today.format('MMMM DD, YYYY')
}

window.onload = setNepaliDate; // Run the function on window load

