(function () {
  "use strict";

  const [image, getImage, setImage] = meact.useState(null);
  const [imageCount, getImageCount, setImageCount] = meact.useState(null);
  const [commentsPage, getCommentsPage, setCommentsPage] = meact.useState(null);
  const [signingIn, getSigningIn, setSigningIn] = meact.useState(null);
  const [signedIn, getSignedIn, setSignedIn] = meact.useState(null);
  const [loadingState, getLoadingState, setLoadingState] = meact.useState(null);
  const [error, getError, setError] = meact.useState(null);

  function submit() {
    if (document.querySelector("form").checkValidity()) {
      const username = document.querySelector("form [name=username]").value;
      const password = document.querySelector("form [name=password]").value;
      const action = document.querySelector("form [name=action]").value;
      setLoadingState(true);
      apiService[action](username, password)
        .then(function (res) {
          if (res.error) {
            setSignedIn(false);
            setError(res.error);
            return;
          }
          setSignedIn(true);
        })
        .catch(setError)
        .finally(() => setLoadingState(false));
    }
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
      setLoadingState(true);
      apiService
        .deleteComment(comment.id)
        .then(() => setCommentsPage(getCommentsPage()))
        .catch(setError)
        .finally(() => setLoadingState(false));
    });
  }

  window.addEventListener("load", function () {
    setLoadingState(true);
    apiService
      .getImage()
      .then((image) => {
        if (image) setImage(image);
      })
      .catch(setError)
      .finally(() => setLoadingState(false));

    setLoadingState(true);
    apiService
      .getImageCount()
      .then((count) => setImageCount(count.total))
      .catch(setError)
      .finally(() => setLoadingState(false));

    meact.useEffect(
      function () {
        const image = getImage();
        if (image) {
          document.querySelector("#imgTitle").textContent = image.title;
          document.querySelector("#imgAuthor").textContent = `By ${image.author}`;
          document.querySelector("#imgContainer").innerHTML = `
            <img 
              id='${image.id}' 
              class='img' 
              src='/api/images/${image.id}/picture/' 
            />`;
          setCommentsPage(1);
        }
      },
      [image]
    );

    meact.useEffect(
      function () {
        if (getImageCount() !== null) {
          if (getImageCount() > 0) {
            document.querySelector("#noImages").classList.add("hidden");
            document.querySelector("#imgAvailableContainer").classList.remove("hidden");
            document.querySelector("#imgTotal").textContent = `Total Images: ${getImageCount()}`;
          } else {
            document.querySelector("#imgAvailableContainer").classList.add("hidden");
            document.querySelector("#noImages").classList.remove("hidden");
          } 
        }
      },
      [imageCount]
    );

    meact.useEffect(
      function () {
        const img = document.querySelector("#imgContainer img");
        if (img) {
          const imgId = img.id;
          setLoadingState(true);
          apiService
            .getComments(Number(imgId), getCommentsPage())
            .then((data) => {
              if (data.comments.length === 0 && getCommentsPage() > 1) {
                setCommentsPage(getCommentsPage() - 1);
                return;
              }
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
            .catch(setError)
            .finally(() => setLoadingState(false));
        }
      },
      [commentsPage]
    );

    meact.useEffect(
      function () {
        if (getSignedIn()) {
          document.querySelector("#signinButton").classList.add("hidden");
          document.querySelector("#signoutButton").classList.remove("hidden");
        } else {
          document.querySelector("#signinButton").classList.remove("hidden");
          document.querySelector("#signoutButton").classList.add("hidden");
        }
      },
      [signedIn]
    );

    meact.useEffect(
      function () {
        if (getSigningIn()) {
          document.querySelector("#noImages").classList.add("hidden");
          document.querySelector("#imgAvailableContainer").classList.add("hidden");
          document.querySelector("#signFormContainer").classList.remove("hidden");
        } else {
          document.querySelector("#noImages").classList.remove("hidden");
          document.querySelector("#imgAvailableContainer").classList.remove("hidden");
          document.querySelector("#signFormContainer").classList.add("hidden");
        }
      },
      [signingIn]
    );

    meact.useEffect(
      function () {
        if (getLoadingState()) {
          document.body.style.overflow = "hidden";
          document.querySelector(".loader-container").style.display = "flex";
        } else {
          document.body.style.overflow = "auto";
          document.querySelector(".loader-container").style.display = "none";
        }
      },
      [loadingState]
    );

    meact.useEffect(
      function () {
        const banner = document.getElementById("errorBanner");
        const message = document.getElementById("errorMessage");
        if (getError()) {
          message.textContent = "Something went wrong: " + getError().message;
          banner.classList.remove("hidden");
        } else {
          banner.classList.add("hidden");
          message.textContent = "";
        }
      },
      [error]
    );

    const popupBtn = document.querySelector("#popupBtn");
    const popup = document.querySelector("#addImgPopup");
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

    popup.addEventListener("submit", function (e) {
      const formData = new FormData(e.target);
      setLoadingState(true);
      apiService
        .addImage(formData)
        .then(() => apiService.getImage())
        .then((image) => {
          if (image) setImage(image);
        })
        .then(() => apiService.getImageCount())
        .then((count) => setImageCount(count.total))
        .catch(setError)
        .finally(() => setLoadingState(false));
      // clean form
      document.querySelector("#addImgPopup").reset();
    });

    document
      .querySelector("#prevImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        setLoadingState(true);
        apiService
          .getImage(getImage().id, "prev")
          .then((image) => {
            if (image) setImage(image);
          })
          .catch(setError)
          .finally(() => setLoadingState(false));
      });

    document
      .querySelector("#nextImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        setLoadingState(true);
        apiService
          .getImage(getImage().id, "next")
          .then((image) => {
            if (image) setImage(image);
          })
          .catch(setError)
          .finally(() => setLoadingState(false));
      });

    document
      .querySelector("#deleteImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        const imgId = document.querySelector("#imgContainer img").id;
        setLoadingState(true);
        apiService
          .deleteImage(imgId)
          .then(() => apiService.getImage())
          .then((image) => {
            if (image) setImage(image);
          })
          .then(() => apiService.getImageCount())
          .then((count) => setImageCount(count.total))
          .catch(setError)
          .finally(() => setLoadingState(false));
      });

    document
      .querySelector("#commentForm")
      .addEventListener("submit", function (e) {
        // read form elements
        const author = document.querySelector("#commentAuthor").value;
        const content = document.querySelector("#commentContent").value;
        const imgId = document.querySelector("#imgContainer img").id;

        // clean form
        document.querySelector("#commentForm").reset();

        setLoadingState(true);
        apiService
          .addComment(Number(imgId), author, content)
          .then(() => setCommentsPage(1))
          .catch(setError)
          .finally(() => setLoadingState(false));
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

    document.querySelector("#closeErrorBtn").addEventListener("click", function (e) {
      setError(null);
    });

    document.querySelector("#signinButton").addEventListener("click", function (e) {
      setSigningIn(true);
    });

    document.querySelector("#signoutButton").addEventListener("click", function (e) {
      apiService
        .signout()
        .then(() => {
          setSignedIn(false);
          setSigningIn(false);
          setImage(null);
          setImageCount(null);
          setCommentsPage(null);
        })
        .catch(setError);
    });    
    
    document.querySelector("#signin").addEventListener("click", function (e) {
      document.querySelector("form [name=action]").value = "signin";
      submit();
    });

    document.querySelector("#signup").addEventListener("click", function (e) {
      document.querySelector("form [name=action]").value = "signup";
      submit();
    });

    document.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
    });
  });
})();
