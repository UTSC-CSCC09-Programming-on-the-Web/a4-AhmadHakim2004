// eslint-disable-next-line no-unused-vars
let apiService = (function () {
  "use strict";

  let module = {};

  function addTokenToHeaders(headers) {
    const token = sessionStorage.getItem("token");
    if (token) {
      headers["authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  function handleResponse(res) {
    return res.json().then((data) => {
      if (!res.ok) {
        throw {
          message: data.error || "Unknown error",
          status: res.status,
        };
      }
      return data;
    });
  }

  module.getGallery = function (cursor = null, direction = null) {
    const directionQuery = direction ? `&direction=${direction}` : "";
    const query = cursor
      ? `/api/galleries/?cursorId=${cursor}${directionQuery}`
      : "/api/galleries";

    return fetch(query, {
      method: "GET",
      headers: addTokenToHeaders({}),
    }).then(handleResponse);
  };

  // add an image to the gallery
  module.addImage = function (galleryId, imageData) {
    return fetch(`/api/galleries/${galleryId}/images`, {
      method: "POST",
      body: imageData,
      headers: addTokenToHeaders({}),
    }).then(handleResponse);
  };

  // delete an image from the gallery given its imageId
  module.deleteImage = function (imageId) {
    return fetch(`/api/images/${imageId}`, {
      method: "DELETE",
      headers: addTokenToHeaders({}),
    }).then(handleResponse);
  };

  // add a comment to an image
  module.addComment = function (imageId, content) {
    return fetch(`/api/images/${imageId}/comments`, {
      method: "POST",
      headers: addTokenToHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ content }),
    }).then(handleResponse);
  };

  // delete a comment to an image
  module.deleteComment = function (commentId) {
    return fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: addTokenToHeaders({}),
    }).then(handleResponse);
  };

  module.getImage = function (galleryId, cursor = null, direction = null) {
    const directionQuery = direction ? `&direction=${direction}` : "";
    const query = cursor
      ? `/api/galleries/${galleryId}/images/?cursorId=${cursor}${directionQuery}`
      : `/api/galleries/${galleryId}/images`;

    return fetch(query, { method: "GET" }).then(handleResponse);
  };

  module.getComments = function (imageId, page = 0, limit = 10) {
    return fetch(
      `/api/images/${imageId}/comments?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: addTokenToHeaders({}),
      }
    ).then(handleResponse);
  };

  module.getImageCount = function (galleryId) {
    return fetch(`/api/galleries/${galleryId}/count`, {
      method: "GET",
    }).then(handleResponse);
  };

  module.signin = function (username, password) {
    return fetch("/api/users/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(handleResponse);
  };

  module.signup = function (username, password) {
    return fetch("/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(handleResponse);
  };

  module.signout = function () {
    return fetch("/api/users/signout", {
      method: "POST",
      headers: addTokenToHeaders({ "Content-Type": "application/json" }),
    }).then(handleResponse);
  };

  module.me = function () {
    return fetch("/api/users/me", {
      method: "GET",
      headers: addTokenToHeaders({ "Content-Type": "application/json" }),
    }).then(handleResponse);
  };

  return module;
})();
