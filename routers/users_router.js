import { User } from "../models/users.js";
import { Router } from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import path from "path";

export const usersRouter = Router();
const upload = multer({ dest: "uploads/" });

usersRouter.post("/signup", upload.single("picture"), async (req, res) => {
  const user = User.build({
    username: req.body.username,
    picture: req.file,
  });
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const password = bcrypt.hashSync(req.body.password, salt);
  user.password = password;
  try {
    await user.save();
  } catch (err) {
    console.log(err);
    return res.status(422).json({ error: "User creation failed." });
  }
  return res.json({
    username: user.username,
  });
});

usersRouter.post("/signin", async (req, res) => {
  const user = await User.findOne({
    where: {
      username: req.body.username,
    },
  });
  if (user === null) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }
  // password incorrect
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }

  return res.json(user);
});

usersRouter.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not signed in." });
  }

  const user = await User.findByPk(req.session.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.json({ username: user.username });
});

usersRouter.get("/signout", function (req, res, next) {
  return res.redirect("/");
});

usersRouter.get("/:id/profile/picture", async (req, res) => {
  let userId = req.params.id;
  const user = await User.findByPk(userId);
  if (user === null) {
    return res.status(404).json({ errors: "User not found." });
  }

  if (user.picture === null) {
    return res.status(404).json({ errors: "User profile picture not found." });
  }
  res.setHeader("Content-Type", user.picture.mimetype);
  res.sendFile(user.picture.path, { root: path.resolve() });
});