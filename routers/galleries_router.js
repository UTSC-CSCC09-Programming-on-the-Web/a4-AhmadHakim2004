import { Op } from "sequelize";

import { Router } from "express";
import multer from "multer";
import { validateInput } from "../utils/validate-input.js";
import { Image } from "../models/images.js";
import { isAuthenticated } from "../middleware/auth.js";
import { extractTokenFromReq } from "../utils/token-helpers.js";
import { User } from "../models/users.js";

const upload = multer({ dest: "uploads/" });
export const galleriesRouter = Router();

galleriesRouter.get("/", async (req, res, next) => {
  const cursor = req.query.cursorId;
  const direction = req.query.direction;

  if (direction && direction !== "prev" && direction !== "next") {
    return res
      .status(422)
      .json({ error: `direction must be prev, next or ommitted` });
  }

  const cursorNum = parseInt(cursor);

  if ((cursor && !cursorNum) || cursorNum < 0) {
    return res
      .status(422)
      .json({ error: `cursorId must be a valid id (integer > 0)` });
  }

  try {
    if (!cursor) {
      const token = await extractTokenFromReq(req);
      const where = token ? { id: token.UserId } : {};

      const gallery = await User.findOne({
        limit: 1,
        where,
        order: [["createdAt", "DESC"]],
      });

      return res.json(gallery);
    }

    const where =
      direction === "prev"
        ? { id: { [Op.gt]: cursor } }
        : { id: { [Op.lt]: cursor } };
    const order =
      direction === "prev" ? [["createdAt", "ASC"]] : [["createdAt", "DESC"]];

    const gallery = await User.findOne({
      limit: 1,
      where,
      order,
    });

    return res.json(gallery);
  } catch (e) {
    return res.status(400).json({ error: "Cannot get gallery" });
  }
});

galleriesRouter.post(
  "/:id/images",
  isAuthenticated,
  upload.single("picture"),
  async function (req, res, next) {
    const schema = [
      { name: "title", required: true, type: "string", location: "body" },
      { name: "picture", required: true, type: "file", location: "file" },
    ];

    if (!validateInput(req, res, schema)) return;

    let user = await User.findOne({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({ error: "Gallery not found." });
    }

    const token = await extractTokenFromReq(req);
    if (token.UserId !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const image = await Image.create({
        title: req.body.title,
        picture: req.file,
        UserId: req.params.id,
      });
      return res.json(image);
    } catch (e) {
      return res.status(400).json({ error: "Cannot post image" });
    }
  }
);

galleriesRouter.get("/:id/images", async (req, res, next) => {
  const cursor = req.query.cursorId;
  const direction = req.query.direction;

  let user = await User.findOne({ where: { id: req.params.id } });

  if (!user) {
    return res.status(404).json({ error: "Gallery not found." });
  }

  if (direction && direction !== "prev" && direction !== "next") {
    return res
      .status(422)
      .json({ error: `direction must be prev, next or ommitted` });
  }

  const cursorNum = parseInt(cursor);

  if ((cursor && !cursorNum) || cursorNum < 0) {
    return res
      .status(422)
      .json({ error: `cursorId must be a valid id (integer > 0)` });
  }

  try {
    if (!cursor) {
      const image = await Image.findOne({
        limit: 1,
        order: [["createdAt", "DESC"]],
        where: { UserId: req.params.id },
        include: {
          model: User,
          attributes: ["username"],
        },
      });

      return res.json(image);
    }

    const where =
      direction === "prev"
        ? { id: { [Op.gt]: cursor }, UserId: req.params.id }
        : { id: { [Op.lt]: cursor }, UserId: req.params.id };
    const order =
      direction === "prev" ? [["createdAt", "ASC"]] : [["createdAt", "DESC"]];

    const image = await Image.findOne({
      limit: 1,
      where,
      order,
      include: {
        model: User,
        attributes: ["username"],
      },
    });

    return res.json(image);
  } catch (e) {
    return res.status(400).json({ error: "Cannot get image" });
  }
});

galleriesRouter.get("/:id/count", async (req, res, next) => {
  let user = await User.findOne({ where: { id: req.params.id } });

  if (!user) {
    return res.status(404).json({ error: "Gallery not found." });
  }

  try {
    const count = await Image.count({ where: { UserId: req.params.id } });
    return res.json({ total: count });
  } catch (e) {
    return res.status(400).json({ error: "Canot get total count of images" });
  }
});
