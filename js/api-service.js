let apiService = (function () {
  let module = {};

  /*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) imageId 
        - (String) title
        - (String) author
        - (String) url
        - (Date) date

    comment objects must have the following attributes
        - (String) commentId
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date
  */

  // add an image to the gallery
  module.addImage = function (title, author, url) {};

  // delete an image from the gallery given its imageId
  module.deleteImage = function (imageId) {};

  // add a comment to an image
  module.addComment = function (imageId, author, content) {};

  // delete a comment to an image
  module.deleteComment = function (commentId) {};

  return module;
})();
