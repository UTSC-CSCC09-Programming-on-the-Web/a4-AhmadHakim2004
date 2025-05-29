(function () {
  "use strict";

   window.addEventListener("load", function () {

    const popupBtn = document.getElementById("popupBtn");
    const popup = document.getElementById("popup");
    popupBtn.addEventListener("click", function (e) {
        if (popupBtn.textContent === '+') {
            popupBtn.textContent = 'X';
            popupBtn.classList.remove('popup-open');
            popupBtn.classList.add('popup-close');
            popup.classList.remove('hidden');
        }
        else if (popupBtn.textContent === 'X') {
            popupBtn.textContent = '+';
            popupBtn.classList.remove('popup-close');
            popupBtn.classList.add('popup-open');
            popup.classList.add('hidden');
        }
    });
   });
})();