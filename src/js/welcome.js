// Check if the user has already visited the site
if (localStorage.getItem('hasSeen') === null) {
    // Show the welcome box
    document.querySelector('.box').style.display = 'block';
} 

function StartButton() {
    // Hide the welcome box
    document.querySelector('.box').style.display = 'none';
    // Set a flag in localStorage to indicate that the user has visited the site
    localStorage.setItem('hasSeen', 'true');
}
