(function () {
  "use strict";

  const [image, getImage, setImage] = meact.useState(null);
  const [imageCount, getImageCount, setImageCount] = meact.useState(null);
  const [commentsPage, getCommentsPage, setCommentsPage] = meact.useState(null);

  function showError(er) {
    alert("Something went wrong: " + er.message);
  }
  function showLoading() {
    document.body.style.overflow = "hidden";
    document.querySelector(".loader-container").style.display = "flex";
  }

  function hideLoading() {
    document.body.style.overflow = "auto";
    document.querySelector(".loader-container").style.display = "none";
  }

  function displayNoImages() {
    document.querySelector("#imgDisplay").classList.add("hidden");
    document.querySelector("#commentFormContainer").classList.add("hidden");
    document.querySelector("#commentsContainer").classList.add("hidden");
    document.querySelector("#noImages").classList.remove("hidden");
  }

  function displayImage(image) {
    document.querySelector("#noImages").classList.add("hidden");
    document.querySelector("#imgDisplay").classList.remove("hidden");
    document.querySelector("#commentFormContainer").classList.remove("hidden");
    document.querySelector("#commentsContainer").classList.remove("hidden");
    document.querySelector("#imgTitle").textContent = image.title;
    document.querySelector("#imgAuthor").textContent = `By ${image.author}`;
    document.querySelector(
      "#imgContainer"
    ).innerHTML = `<img id='${image.id}' class='img' src='/api/images/${image.id}/picture/' />`;
  }

  function updateImageCount() {
    document.querySelector(
      "#imgTotal"
    ).textContent = `Total Images: ${getImageCount()}`;
  }

  function renderComment(comment) {
    // create a new message element
    const elmt = document.createElement("div");
    elmt.className = "row comment align-items-center";
    const date = new Date(comment.createdAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    elmt.innerHTML = `
          <div class="col-auto">
            <div class="comment-header">${comment.author} (${date})</div>
            <div class="comment-content">${comment.content}</div>
          </div>
          <div class="col-1 delete-icon btn-comment-action"></div>
      `;
    // add this element to the document
    document.querySelector("#comments").prepend(elmt);

    elmt.querySelector(".delete-icon").addEventListener("click", function () {
      showLoading();
      apiService
        .deleteComment(comment.id)
        .then(() => setCommentsPage(getCommentsPage()))
        .catch(showError)
        .finally(() => hideLoading());
    });
  }

  window.addEventListener("load", function () {
    showLoading();
    apiService
      .getImage()
      .then((image) => {
        if (image) setImage(image);
      })
      .catch(showError)
      .finally(() => hideLoading());

    showLoading();
    apiService
      .getImageCount()
      .then((count) => setImageCount(count.total))
      .catch(showError)
      .finally(() => hideLoading());

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
        if (getImageCount() !== null) {
          getImageCount() > 0 ? updateImageCount() : displayNoImages();
        }
      },
      [imageCount]
    );

    meact.useEffect(
      function () {
        const img = document.querySelector("#imgContainer img");
        if (img) {
          const imgId = img.id;
          showLoading();
          apiService
            .getComments(Number(imgId), getCommentsPage())
            .then((data) => {
              document.querySelector("#comments").innerHTML = "";
              data.comments.reverse().forEach(renderComment);
              getCommentsPage() === 1
                ? document
                    .querySelector("#prevCommentsBtn")
                    .classList.add("hidden")
                : document
                    .querySelector("#prevCommentsBtn")
                    .classList.remove("hidden");

              getCommentsPage() * 10 >= data.totalCount
                ? document
                    .querySelector("#nextCommentsBtn")
                    .classList.add("hidden")
                : document
                    .querySelector("#nextCommentsBtn")
                    .classList.remove("hidden");
            })
            .catch(showError)
            .finally(() => hideLoading());
        }
      },
      [commentsPage]
    );

    const popupBtn = document.querySelector("#popupBtn");
    const popup = document.querySelector("#popup");
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

    document.querySelector("#popup").addEventListener("submit", function (e) {
      // prevent from refreshing the page on submit
      e.preventDefault();

      const formData = new FormData(e.target);
      showLoading();
      apiService
        .addImage(formData)
        .then(() => apiService.getImage())
        .then((image) => {
          if (image) setImage(image);
        })
        .then(() => apiService.getImageCount())
        .then((count) => setImageCount(count.total))
        .catch(showError)
        .finally(() => hideLoading());
      // clean form
      document.querySelector("#popup").reset();
    });

    document
      .querySelector("#prevImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        showLoading();
        apiService
          .getImage(getImage().id, "prev")
          .then((image) => {
            if (image) setImage(image);
          })
          .catch(showError)
          .finally(() => hideLoading());
      });

    document
      .querySelector("#nextImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        showLoading();
        apiService
          .getImage(getImage().id, "next")
          .then((image) => {
            if (image) setImage(image);
          })
          .catch(showError)
          .finally(() => hideLoading());
      });

    document
      .querySelector("#deleteImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        const imgId = document.querySelector("#imgContainer img").id;
        showLoading();
        apiService
          .deleteImage(imgId)
          .then(() => apiService.getImage())
          .then((image) => {
            if (image) setImage(image);
          })
          .then(() => apiService.getImageCount())
          .then((count) => setImageCount(count.total))
          .catch(showError)
          .finally(() => hideLoading());
      });

    document
      .querySelector("#commentForm")
      .addEventListener("submit", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        // read form elements
        const author = document.querySelector("#commentAuthor").value;
        const content = document.querySelector("#commentContent").value;
        const imgId = document.querySelector("#imgContainer img").id;

        // clean form
        document.querySelector("#commentForm").reset();

        showLoading();
        apiService
          .addComment(Number(imgId), author, content)
          .then(() => setCommentsPage(1))
          .catch(showError)
          .finally(() => hideLoading());
      });

    document
      .querySelector("#prevCommentsBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        const currPage = getCommentsPage();
        if (currPage > 0) {
          setCommentsPage(currPage - 1);
        }
      });

    document
      .querySelector("#nextCommentsBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        const currPage = getCommentsPage();
        setCommentsPage(currPage + 1);
      });
  });
})();
