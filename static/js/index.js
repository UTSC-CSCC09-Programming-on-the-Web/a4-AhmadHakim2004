/* global meact, apiService */

(function () {
  "use strict";

  const [user, getUser, setUser] = meact.useState(null);
  const [gallery, getGallery, setGallery] = meact.useState(null);
  const [imageCount, getImageCount, setImageCount] = meact.useState(null);
  const [onUserGallery, getOnUserGallery, setOnUserGallery] =
    meact.useState(null);
  const [image, getImage, setImage] = meact.useState(null);
  const [commentsPage, getCommentsPage, setCommentsPage] = meact.useState(null);
  const [comments, getComments, setComments] = meact.useState(null);
  const [signingIn, getSigningIn, setSigningIn] = meact.useState(false);
  const [imgPopupOpen, getImgPopupOpen, setImgPopupOpen] =
    meact.useState(false);
  const [loadingState, getLoadingState, setLoadingState] = meact.useState(null);
  const [error, getError, setError] = meact.useState(null);

  function submit() {
    if (document.querySelector("#signForm").checkValidity()) {
      const username = document.querySelector(
        "#signForm [name=username]"
      ).value;
      const password = document.querySelector(
        "#signForm [name=password]"
      ).value;
      const action = document.querySelector("#signForm [name=action]").value;

      document.querySelector("#signForm").reset();

      setLoadingState(true);
      apiService[action](username, password)
        .then(function (res) {
          if (res.error) {
            setError(res);
            return;
          }
          sessionStorage.setItem("token", res.access_token);

          apiService
            .me()
            .then(setUser)
            .catch((err) => {
              if (err.status === 401) {
                setUser(null);
              } else {
                setError(err);
              }
            });
          setSigningIn(false);
        })
        .catch((er) => {
          setError(er);
        })
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
    const showDeleteBtn =
      comment.User.id === getUser()?.id || getGallery()?.id === getUser()?.id;
    const invisible = showDeleteBtn ? "" : "invisible";
    elmt.innerHTML = `
          <div class="col-auto">
            <div class="comment-header">${comment.User.username} (${date})</div>
            <div class="comment-content">${comment.content}</div>
          </div>
          <div class="col-1 delete-icon btn-comment-action ${invisible}"></div>
      `;
    // add this element to the document
    document.querySelector("#comments").prepend(elmt);

    if (!showDeleteBtn) return;

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
      .me()
      .then(setUser)
      .catch((err) => {
        if (err.status === 401) {
          setUser(null);
        } else {
          setError(err);
        }
      })
      .finally(() => setLoadingState(false));

    meact.useEffect(
      function () {
        if (getUser()) {
          document.querySelector("#signinButton").classList.add("hidden");
          document.querySelector("#signoutButton").classList.remove("hidden");
          document
            .querySelector("#signedInContainer")
            .classList.remove("hidden");
        } else {
          document.querySelector("#signinButton").classList.remove("hidden");
          document.querySelector("#signoutButton").classList.add("hidden");
          document.querySelector("#signedInContainer").classList.add("hidden");
        }

        setLoadingState(true);
        apiService
          .getGallery()
          .then(setGallery)
          .catch(setError)
          .finally(() => setLoadingState(false));
      },
      [user]
    );

    meact.useEffect(
      function () {
        const gallery = getGallery();
        if (gallery) {
          document
            .querySelector("#galleriesAvailable")
            .classList.remove("hidden");
          document.querySelector("#noGalleries").classList.add("hidden");
          document.querySelector(
            "#galleryAuthor"
          ).textContent = `By ${gallery.username}`;

          setLoadingState(true);
          apiService
            .getImageCount(gallery.id)
            .then((data) => setImageCount(data.total))
            .catch(setError)
            .finally(() => setLoadingState(false));
        } else {
          document.querySelector("#galleriesAvailable").classList.add("hidden");
          document.querySelector("#noGalleries").classList.remove("hidden");
        }
      },
      [gallery]
    );

    meact.useEffect(
      function () {
        if (getImageCount() !== null && getImageCount() > 0) {
          document.querySelector("#noImages").classList.add("hidden");
          document
            .querySelector("#imgAvailableContainer")
            .classList.remove("hidden");
          document.querySelector("#commentsElems").classList.remove("hidden");
          document.querySelector(
            "#imgTotal"
          ).textContent = `Total Images: ${getImageCount()}`;

          const gallery = getGallery();
          setOnUserGallery(getUser() && gallery && getUser().id == gallery.id);

          setLoadingState(true);
          apiService
            .getImage(gallery.id)
            .then(setImage)
            .catch(setError)
            .finally(() => setLoadingState(false));
        } else {
          document.querySelector("#noImages").classList.remove("hidden");
          document
            .querySelector("#imgAvailableContainer")
            .classList.add("hidden");
          document.querySelector("#commentsElems").classList.add("hidden");
        }
      },
      [imageCount]
    );

    meact.useEffect(
      function () {
        const imgDeleteBtn = document.querySelector("#deleteImgBtn");
        getOnUserGallery()
          ? imgDeleteBtn.classList.remove("hidden")
          : imgDeleteBtn.classList.add("hidden");
      },
      [onUserGallery]
    );

    meact.useEffect(
      function () {
        const image = getImage();
        if (image) {
          document.querySelector("#imgTitle").textContent = image.title;
          document.querySelector("#imgContainer").innerHTML = `
            <img 
              id='${image.id}' 
              class='img' 
              src='/api/images/${image.id}/picture/' 
            />`;
          if (getUser()) setCommentsPage(1);
        }
      },
      [image]
    );

    meact.useEffect(
      function () {
        const img = getImage();
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

              setComments(data.comments);
            })
            .catch(setError)
            .finally(() => setLoadingState(false));
        }
      },
      [commentsPage]
    );

    meact.useEffect(
      function () {
        document.querySelector("#comments").innerHTML = "";
        if (getComments()) {
          getComments().reverse().forEach(renderComment);
        }
      },
      [comments]
    );

    meact.useEffect(
      function () {
        if (getSigningIn()) {
          document
            .querySelector("#notSigningInContainer")
            .classList.add("hidden");
          document
            .querySelector("#signFormContainer")
            .classList.remove("hidden");
        } else {
          document
            .querySelector("#notSigningInContainer")
            .classList.remove("hidden");
          document.querySelector("#signFormContainer").classList.add("hidden");
        }
      },
      [signingIn]
    );

    meact.useEffect(
      function () {
        const popupBtn = document.querySelector("#popupBtn");
        const popup = document.querySelector("#addImgPopup");
        if (getImgPopupOpen()) {
          popupBtn.textContent = "X";
          popupBtn.classList.remove("popup-open");
          popupBtn.classList.add("popup-close");
          popup.classList.remove("hidden");
        } else {
          popupBtn.textContent = "+";
          popupBtn.classList.remove("popup-close");
          popupBtn.classList.add("popup-open");
          popup.classList.add("hidden");
        }
      },
      [imgPopupOpen]
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
        const err = getError();
        if (err) {
          message.textContent = "Something went wrong: " + err.message;
          banner.classList.remove("hidden");
          if (err.status === 401) {
            setUser(null);
          }
        } else {
          banner.classList.add("hidden");
          message.textContent = "";
        }
      },
      [error]
    );

    document.querySelector("#popupBtn").addEventListener("click", function () {
      setImgPopupOpen(!getImgPopupOpen());
    });

    document
      .querySelector("#addImgPopup")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        setLoadingState(true);
        apiService
          .addImage(getUser().id, formData)
          .then(() => apiService.getGallery())
          .then(setGallery)
          .catch(setError)
          .finally(() => setLoadingState(false));
        // clean form
        document.querySelector("#addImgPopup").reset();
      });

    document
      .querySelector("#prevGalleryBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        if (!getGallery()) return;
        setLoadingState(true);
        apiService
          .getGallery(getGallery().id, "prev")
          .then((gallery) => {
            if (gallery) setGallery(gallery);
          })
          .catch(setError)
          .finally(() => setLoadingState(false));
      });

    document
      .querySelector("#nextGalleryBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        if (!getGallery()) return;
        setLoadingState(true);
        apiService
          .getGallery(getGallery().id, "next")
          .then((gallery) => {
            if (gallery) setGallery(gallery);
          })
          .catch(setError)
          .finally(() => setLoadingState(false));
      });

    document
      .querySelector("#prevImgBtn")
      .addEventListener("click", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        if (!getImage()) return;
        setLoadingState(true);
        apiService
          .getImage(getGallery().id, getImage().id, "prev")
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
        if (!getImage()) return;
        setLoadingState(true);
        apiService
          .getImage(getGallery().id, getImage().id, "next")
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
        const imgId = getImage().id;
        setLoadingState(true);
        apiService
          .deleteImage(imgId)
          .then(() => apiService.getImageCount(getGallery().id))
          .then((data) => setImageCount(data.total))
          .catch(setError)
          .finally(() => setLoadingState(false));
      });

    document
      .querySelector("#commentForm")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        // read form elements
        const content = document.querySelector("#commentContent").value;
        const imgId = getImage().id;

        // clean form
        document.querySelector("#commentForm").reset();

        setLoadingState(true);
        apiService
          .addComment(Number(imgId), content)
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

    document
      .querySelector("#closeErrorBtn")
      .addEventListener("click", function () {
        setError(null);
      });

    document
      .querySelector("#signinButton")
      .addEventListener("click", function () {
        setSigningIn(true);
      });

    document
      .querySelector("#signoutButton")
      .addEventListener("click", function () {
        setLoadingState(true);
        apiService
          .signout()
          .then(setUser(null))
          .catch(setError)
          .finally(setLoadingState(false));
      });

    document.querySelector("#signin").addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector("form [name=action]").value = "signin";
      submit();
    });

    document.querySelector("#signup").addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector("form [name=action]").value = "signup";
      submit();
    });

    document.querySelector("#backBtn").addEventListener("click", function () {
      setSigningIn(false);
    });
  });
})();
