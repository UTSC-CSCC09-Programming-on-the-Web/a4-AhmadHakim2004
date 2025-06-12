import { Op } from "sequelize";

import { Router } from "express";
import multer from "multer";
import path from "path";
import { validateInput } from "../utils/validate-input.js";
import { Image } from "../models/images.js";
import { Comment } from "../models/comments.js";

const upload = multer({ dest: "uploads/" });
export const imagesRouter = Router();

imagesRouter.post(
  "/",
  upload.single("picture"),
  async function (req, res, next) {
    const schema = [
      { name: "title", required: true, type: "string", location: "body" },
      { name: "author", required: true, type: "string", location: "body" },
      { name: "picture", required: true, type: "file", location: "file" },
    ];

    if (!validateInput(req, res, schema)) return;

    try {
      const image = await Image.create({
        title: req.body.title,
        author: req.body.author,
        picture: req.file,
      });
      return res.json(image);
    } catch (e) {
      return res.status(400).json({ error: "Cannot create image" });
    }
  }
);

imagesRouter.get("/", async (req, res, next) => {
  const cursor = req.query.cursorId;
  const direction = req.query.direction;

  if (direction && direction !== "prev" && direction !== "next") {
    return res
      .status(422)
      .json({ error: `direction must be prev, next or ommitted` });
  }

  const cursorNum = parseInt(cursor);

  if (cursor && !cursorNum || cursorNum < 0) {
    return res
      .status(422)
      .json({ error: `cursorId must be a valid id (integer > 0)` });
  }

  try {
    if (!cursor) {
      const image = await Image.findOne({
        limit: 1,
        order: [["createdAt", "DESC"]],
      });

      return res.json(image);
    }

    const where =
      direction === "prev"
        ? { id: { [Op.gt]: cursor } }
        : { id: { [Op.lt]: cursor } };
    const order =
      direction === "prev" ? [["createdAt", "ASC"]] : [["createdAt", "DESC"]];

    const image = await Image.findOne({
      limit: 1,
      where,
      order,
    });

    return res.json(image);
  } catch (e) {
    return res.status(400).json({ error: "Cannot add image" });
  }
});

imagesRouter.delete("/:id", async (req, res, next) => {
  try {
    const image = await Image.findByPk(req.params.id);
    if (!image) {
      return res
        .status(404)
        .json({ error: `image with id=${req.params.id} not found.` });
    }
    await image.destroy();
    return res.json(image);
  } catch (e) {
    return res.status(400).json({ error: "Cannot delete image" });
  }
});

imagesRouter.post("/:id/comments", async (req, res, next) => {
  const schema = [
    { name: "content", required: true, type: "string", location: "body" },
    { name: "author", required: true, type: "string", location: "body" },
  ];

  if (!validateInput(req, res, schema)) return;

  try {
    let image = await Image.findOne({ where: { id: req.params.id } });

    if (!image) {
      return res.status(404).json({ error: "Image not found." });
    }

    const comment = await Comment.create({
      author: req.body.author,
      content: req.body.content,
      ImageId: req.params.id,
    });
    return res.json(comment);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: "Cannot create comment" });
  }
});

imagesRouter.get("/:id/comments", async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;

  if (!page || page < 1) {
    return res.status(422).json({ error: `page must be a positive integer` });
  }

  if (!limit || limit < 1) {
    return res.status(422).json({ error: `limit must be a positive integer` });
  }

  try {
    let image = await Image.findOne({ where: { id: req.params.id } });

    if (!image) {
      return res.status(404).json({ error: "Image not found." });
    }

    const where = { ImageId: req.params.id };
    const order = [["createdAt", "DESC"]];
    const offset = (page - 1) * limit;

    const comments = await Comment.findAll({
      where,
      order,
      limit,
      offset,
    });
    return res.json({comments});
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: "Cannot get comments" });
  }
});

imagesRouter.get("/count", async (req, res, next) => {
  try {
    const count = await Image.count();
    return res.json({ total: count });
  } catch (e) {
    return res.status(400).json({ error: "Canot get total count of images" });
  }
});

imagesRouter.get("/:id/picture", async (req, res) => {
  let imageId = req.params.id;
  const image = await Image.findByPk(imageId);
  if (image === null) {
    return res.status(404).json({ errors: "Image not found." });
  }
  res.setHeader("Content-Type", image.picture.mimetype);
  res.sendFile(image.picture.path, { root: path.resolve() });
});