const deleteBtns = document.querySelectorAll('.c-btn--popup');
const popup = document.querySelector('.c-popup');
const overlay = document.querySelector('.c-overlay');
const closeBtn = document.querySelector('.c-popup__close');

deleteBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        popup.classList.add('isActive');
        overlay.classList.add('isActive');
    })
})

closeBtn.addEventListener('click', (e) => {
    popup.classList.remove('isActive');
    overlay.classList.remove('isActive');
});
