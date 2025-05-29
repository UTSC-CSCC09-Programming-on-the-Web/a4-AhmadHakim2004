(function () {
  "use strict";
  
  const [imageIndex, getImageIndex, setImageIndex] = meact.useState(null);
  const [imageCount, getImageCount, setImageCount] = meact.useState(null);
  const [commentsPage, getCommentsPage, setCommentsPage] = meact.useState(null);


  function displayNoImages() {
    document.getElementById("imgDisplay").classList.add("hidden");
    document.getElementById("commentFormContainer").classList.add("hidden");
    document.getElementById("commentsContainer").classList.add("hidden");
    document.getElementById("noImages").classList.remove("hidden");
  }  
  
  function displayImage(image) {
    document.getElementById("noImages").classList.add("hidden");
    document.getElementById("imgDisplay").classList.remove("hidden");
    document.getElementById("commentFormContainer").classList.remove("hidden");
    document.getElementById("commentsContainer").classList.remove("hidden");
    document.getElementById("imgTitle").textContent = image.title;
    document.getElementById("imgAuthor").textContent = `By ${image.author}`;
    document.getElementById("imgContainer").innerHTML = `<img id='${image.imageId}' class='img' src='${image.url}' />`;
  }
  
  function updateImageCount() {
    document.getElementById("imgTotal").textContent = `Total Images: ${getImageCount()}`;
  }

    function renderComment(comment) {
      // create a new message element
      const elmt = document.createElement("div");
      elmt.className = "row comment align-items-center";
      elmt.innerHTML = `
          <div class="col-auto message-content">
            <div >${comment.author} (${comment.date})</div>
            <div>${comment.content}</div>
          </div>
          <div class="col-1 delete-icon btn-comment-action"></div>
      `;
      // add this element to the document
      document.getElementById("comments").prepend(elmt);

      elmt.querySelector(".delete-icon").addEventListener("click", function () {
        apiService.deleteComment(comment.commentId);
        setCommentsPage(getCommentsPage());
      });
    }

   window.addEventListener("load", function () {
    setImageIndex(apiService.getImageIndex());
    setImageCount(apiService.getImageCount());

    meact.useEffect(
      function () {
        const image = apiService.getImage(getImageIndex())
        if (image) {
            displayImage(image);
            setCommentsPage(0);
        }
        else {
            displayNoImages();
        }
      },
      [imageIndex],
    );

    meact.useEffect(
      function () {
        updateImageCount();
      },
      [imageCount],
    );

    meact.useEffect(
      function () {
        const imgId = document.querySelector("#imgContainer img").id;
        const comments = apiService.getComments(Number(imgId), getCommentsPage())
        document.getElementById("comments").innerHTML = "";
        comments.forEach(renderComment);
      },
      [commentsPage],
    );

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
        setImageIndex(apiService.getImageIndex())
        setImageCount(apiService.getImageCount())
      });

    document
      .getElementById("prevImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        setImageIndex(apiService.getImageIndex(getImageIndex(), -1));
      });

    document
      .getElementById("nextImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        setImageIndex(apiService.getImageIndex(getImageIndex(), 1));
      });

    
    document
      .getElementById("deleteImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        const imgId = document.querySelector("#imgContainer img").id;
        apiService.deleteImage(Number(imgId));
        setImageIndex(apiService.getImageIndex(getImageIndex()))
        setImageCount(apiService.getImageCount())
      });

    document
      .getElementById("commentForm")
      .addEventListener("submit", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        // read form elements
        const author = document.getElementById("commentAuthor").value;
        const content = document.getElementById("commentContent").value;
        const imgId = document.querySelector("#imgContainer img").id;

        // clean form
        document.getElementById("commentForm").reset();

        apiService.addComment(Number(imgId), author, content);
        setCommentsPage(getCommentsPage());
      });

          document
      .getElementById("prevCommentsBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        const currPage = getCommentsPage();
        if (currPage > 0) {
            setCommentsPage(currPage-1);
        }
      });

    document
      .getElementById("nextCommentsBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        const currPage = getCommentsPage();
        setCommentsPage(currPage+1);
    });
   });
})();