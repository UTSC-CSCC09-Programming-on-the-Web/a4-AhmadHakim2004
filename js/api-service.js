let apiService = (function () {
  let module = {};

  const saveToLocalStorage = function (database) {
    localStorage.setItem("database", JSON.stringify(database));
    localStorage.setItem("imageId", imageId.toString());
    localStorage.setItem("commentId", commentId.toString());
  };

  const loadFromLocalStorage = function () {
    return JSON.parse(localStorage.getItem("database")) || [];
  };

  let imageId = parseInt(localStorage.getItem("imageId")) || 0;
  let commentId = parseInt(localStorage.getItem("commentId")) || 0;
  let database = loadFromLocalStorage();

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

  let Image = function (title, author, url) {
    this.imageId = imageId++;
    this.title = title;
    this.author = author;
    this.url = url;
    this.date = new Date();
    this.comments = [];
  };

  let Comment = function (imageId, author, content) {
    this.commentId = commentId++;
    this.imageId = imageId;
    this.author = author;
    this.content = content;
    this.date = new Date();
  };

  // add an image to the gallery
  module.addImage = function (title, author, url) {
    let image = new Image(title, author, url);
    database.unshift(image);
    saveToLocalStorage(database);
  };

  // delete an image from the gallery given its imageId
  module.deleteImage = function (imageId) {
    let index = database.findIndex(function (image) {
      return image.imageId === imageId;
    });
    if (index === -1) return null;
    database.splice(index, 1);
    saveToLocalStorage(database);
  };

  // add a comment to an image
  module.addComment = function (imageId, author, content) {
    let image = database.find(function (image) {
      return image.imageId === imageId;
    });
    if (image) {
      let comment = Comment(imageId, author, content);
      image.comments.unshift(comment);
      saveToLocalStorage(database);
    }
  };

  // delete a comment to an image
  module.deleteComment = function (commentId) {
    for (let image of database) {
      let index = image.comments.findIndex(function (comment) {
        return comment.commentId === commentId;
      });

      if (index !== -1) {
        image.comments.splice(index, 1);
        saveToLocalStorage(database);
        return;
      }
    }
  };

  module.getImageIndex = function(current = 0, direction = 0) {
    if (direction < -1 || direction > 1) return null;
    if (database.length === 0) return null;
    return (current + direction + database.length) % database.length;
  }

  module.getImage = function(imageIndex) {
    if (imageIndex === null) return null;
    return database[imageIndex];
  } 

  module.getImageCount = function() {
    return database.length;
  }

  return module;
})();
