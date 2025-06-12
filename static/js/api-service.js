let apiService = (function () {
  "use strict";

  let module = {};

  // add an image to the gallery
  module.addImage = function (imageData) {
    return fetch("/api/images", {
      method: "POST",
      body: imageData,
    }).then((res) => res.json());
  };

  // delete an image from the gallery given its imageId
  module.deleteImage = function (imageId) {
    return fetch(`/api/images/${imageId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  // add a comment to an image
  module.addComment = function (imageId, author, content) {
    return fetch(`/api/images/${imageId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, content }),
    }).then((res) => res.json());
  };

  // delete a comment to an image
  module.deleteComment = function (commentId) {
    return fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  module.getImage = function (cursor = null, direction = null) {
    const directionQuery = direction ? `&direction=${direction}` : "";
    const query = cursor
      ? `/api/images/?cursorId=${cursor}${directionQuery}`
      : "/api/images";

    return fetch(query, { method: "GET" }).then((res) => res.json());
  };

  module.getComments = function (imageId, page = 0, limit = 10) {
    return fetch(
      `/api/images/${imageId}/comments?page=${page}&limit=${limit}`,
      {
        method: "GET",
      }
    ).then((res) => res.json());
  };

  module.getImageCount = function () {
    return fetch(`/api/images/count`, {
      method: "GET",
    }).then((res) => res.json());
  };

  return module;
})();
