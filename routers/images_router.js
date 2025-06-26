import { Router } from "express";
import path from "path";
import { validateInput } from "../utils/validate-input.js";
import { Image } from "../models/images.js";
import { Comment } from "../models/comments.js";
import { User } from "../models/users.js";
import { isAuthenticated } from "../middleware/auth.js";
import { extractTokenFromReq } from "../utils/token-helpers.js";

export const imagesRouter = Router();

imagesRouter.delete("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const image = await Image.findByPk(req.params.id);
    if (!image) {
      return res
        .status(404)
        .json({ error: `image with id=${req.params.id} not found.` });
    }
    const user = await image.getUser();
    const token = await extractTokenFromReq(req);
    if (token.UserId !== user.id) {
      return res.status(403).json({ error: "Forbidden." });
    }
    await Comment.destroy({ where: { ImageId: image.id } });
    await image.destroy();
    return res.json(image);
  } catch (e) {
    return res.status(400).json({ error: "Cannot delete image" });
  }
});

imagesRouter.post("/:id/comments", isAuthenticated, async (req, res, next) => {
  const schema = [
    { name: "content", required: true, type: "string", location: "body" },
  ];

  if (!validateInput(req, res, schema)) return;

  try {
    let image = await Image.findOne({ where: { id: req.params.id } });

    if (!image) {
      return res.status(404).json({ error: "Image not found." });
    }

    const token = await extractTokenFromReq(req);

    const comment = await Comment.create({
      content: req.body.content,
      ImageId: req.params.id,
      UserId: token.UserId,
    });
    return res.json(comment);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: "Cannot create comment" });
  }
});

imagesRouter.get("/:id/comments", isAuthenticated, async (req, res, next) => {
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
      include: [
        {
          model: User,
          attributes: ["id", "username"],
        },
      ],
    });
    const totalCount = await Comment.count({ where });
    return res.json({ comments, totalCount });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: "Cannot get comments" });
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
