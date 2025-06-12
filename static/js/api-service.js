let apiService = (function () {
  "use strict";

  let module = {};

  function handleResponse(res) {
  return res.json().then((data) => {
    if (!res.ok) {
      const err = new Error(data.error || "Unknown error");
      throw err;
    }
    return data;
  });
}

  // add an image to the gallery
  module.addImage = function (imageData) {
    return fetch("/api/images", {
      method: "POST",
      body: imageData,
    }).then(handleResponse);
  };

  // delete an image from the gallery given its imageId
  module.deleteImage = function (imageId) {
    return fetch(`/api/images/${imageId}`, {
      method: "DELETE",
    }).then(handleResponse);
  };

  // add a comment to an image
  module.addComment = function (imageId, author, content) {
    return fetch(`/api/images/${imageId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, content }),
    }).then(handleResponse);
  };

  // delete a comment to an image
  module.deleteComment = function (commentId) {
    return fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    }).then(handleResponse);
  };

  module.getImage = function (cursor = null, direction = null) {
    const directionQuery = direction ? `&direction=${direction}` : "";
    const query = cursor
      ? `/api/images/?cursorId=${cursor}${directionQuery}`
      : "/api/images";

    return fetch(query, { method: "GET" }).then(handleResponse);
  };

  module.getComments = function (imageId, page = 0, limit = 10) {
    return fetch(
      `/api/images/${imageId}/comments?page=${page}&limit=${limit}`,
      {
        method: "GET",
      }
    ).then(handleResponse);
  };

  module.getImageCount = function () {
    return fetch(`/api/images/count`, {
      method: "GET",
    }).then(handleResponse);
  };

  return module;
})();
