import { Router } from "express";
import { Comment } from "../models/comments.js";

export const commentsRouter = Router();

commentsRouter.delete("/:id", async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res
        .status(404)
        .json({ error: `comment with id=${req.params.id} not found.` });
    }
    await comment.destroy();
    return res.json(comment);
  } catch (e) {
    return res.status(400).json({ error: "Cannot delete comment" });
  }
});
