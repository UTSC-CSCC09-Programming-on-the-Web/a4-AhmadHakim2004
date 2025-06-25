import { Router } from "express";
import { Comment } from "../models/comments.js";
import { extractTokenFromReq } from "../utils/token-helpers.js";

export const commentsRouter = Router();

commentsRouter.delete("/:id", async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res
        .status(404)
        .json({ error: `comment with id=${req.params.id} not found.` });
    }

    const token = extractTokenFromReq(req);
    const image = await comment.getImage();
    const gallery = await image.getGallery();

    if (!(token.UserId === comment.UserId || token.UserId == gallery.UserId)) {
      return res.status(403).json({ error: "Forbidden." });
    }

    await comment.destroy();
    return res.json(comment);
  } catch (e) {
    return res.status(400).json({ error: "Cannot delete comment" });
  }
});
