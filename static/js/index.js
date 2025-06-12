(function () {
  "use strict";

  const [image, getImage, setImage] = meact.useState(null);
  const [imageCount, getImageCount, setImageCount] = meact.useState(0);
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
    document.getElementById(
      "imgContainer"
    ).innerHTML = `<img id='${image.id}' class='img' src='/api/images/${image.id}/picture/' />`;
  }

  function updateImageCount() {
    document.getElementById(
      "imgTotal"
    ).textContent = `Total Images: ${getImageCount()}`;
  }

  function renderComment(comment) {
    // create a new message element
    const elmt = document.createElement("div");
    elmt.className = "row comment align-items-center";
    elmt.innerHTML = `
          <div class="col-auto">
            <div class="comment-header">${comment.author} (${new Date(
      comment.createdAt
    ).toLocaleString()})</div>
            <div class="comment-content">${comment.content}</div>
          </div>
          <div class="col-1 delete-icon btn-comment-action"></div>
      `;
    // add this element to the document
    document.getElementById("comments").prepend(elmt);

    elmt.querySelector(".delete-icon").addEventListener("click", function () {
      apiService
        .deleteComment(comment.commentId)
        .then(() => setCommentsPage(getCommentsPage()));
    });
  }

  window.addEventListener("load", function () {
    apiService.getImageCount().then((count) => setImageCount(count.total));

    apiService.getImage().then((image) => {
      if (image) setImage(image);
    });

    meact.useEffect(
      function () {
        const image = getImage();
        if (image) {
          displayImage(image);
          setCommentsPage(1);
        }
      },
      [image]
    );

    meact.useEffect(
      function () {
        if (getImageCount() > 0) updateImageCount();
        else displayNoImages();
      },
      [imageCount]
    );

    meact.useEffect(
      function () {
        const img = document.querySelector("#imgContainer img");
        if (img) {
          const imgId = img.id;
          apiService
            .getComments(Number(imgId), getCommentsPage())
            .then((data) => {
              document.getElementById("comments").innerHTML = "";
              data.comments.forEach(renderComment);
            });
        }
      },
      [commentsPage]
    );

    const popupBtn = document.getElementById("popupBtn");
    const popup = document.getElementById("popup");
    popupBtn.addEventListener("click", function (e) {
      if (popupBtn.textContent === "+") {
        popupBtn.textContent = "X";
        popupBtn.classList.remove("popup-open");
        popupBtn.classList.add("popup-close");
        popup.classList.remove("hidden");
      } else if (popupBtn.textContent === "X") {
        popupBtn.textContent = "+";
        popupBtn.classList.remove("popup-close");
        popupBtn.classList.add("popup-open");
        popup.classList.add("hidden");
      }
    });

    document.getElementById("popup").addEventListener("submit", function (e) {
      // prevent from refreshing the page on submit
      e.preventDefault();

      const formData = new FormData(e.target);
      apiService
        .addImage(formData)
        .then(() => apiService.getImage())
        .then((image) => {
          if (image) setImage(image);
        })
        .then(() => apiService.getImageCount())
        .then((count) => setImageCount(count.total));
      // clean form
      document.getElementById("popup").reset();
    });

    document
      .getElementById("prevImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        apiService.getImage(getImage().id, "prev").then((image) => {
          if (image) setImage(image);
        });
      });

    document
      .getElementById("nextImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        apiService.getImage(getImage().id, "next").then((image) => {
          if (image) setImage(image);
        });
      });

    document
      .getElementById("deleteImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        const imgId = document.querySelector("#imgContainer img").id;
        apiService
          .deleteImage(imgId)
          .then(() => apiService.getImage())
          .then((image) => {
            if (image) setImage(image);
          })
          .then(() => apiService.getImageCount())
          .then((count) => setImageCount(count.total));
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

        apiService
          .addComment(Number(imgId), author, content)
          .then(() => setCommentsPage(1));
      });

    document
      .getElementById("prevCommentsBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        const currPage = getCommentsPage();
        if (currPage > 0) {
          setCommentsPage(currPage - 1);
        }
      });

    document
      .getElementById("nextCommentsBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        const currPage = getCommentsPage();
        setCommentsPage(currPage + 1);
      });
  });
})();
