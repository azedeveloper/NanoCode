if (localStorage.getItem('hasSeen') === null) {
    document.querySelector('.box').style.display = 'block';
} 

function StartButton() {
    document.querySelector('.box').style.display = 'none';
    localStorage.setItem('hasSeen', 'true');
}
