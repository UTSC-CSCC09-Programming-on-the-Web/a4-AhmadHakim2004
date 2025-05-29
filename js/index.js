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

    document
      .getElementById("popup")
      .addEventListener("submit", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        // read form elements
        const title = document.getElementById("imageTitle").value;
        const author = document.getElementById("imageAuthor").value;
        const url = document.getElementById("imageUrl").value;
        // clean form
        document.getElementById("popup").reset();

        apiService.addImage(title, author, url);
      });
   });
})();