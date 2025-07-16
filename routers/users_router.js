import { User } from "../models/users.js";
import { Router } from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Token } from "../models/tokens.js";
import { isAuthenticated } from "../middleware/auth.js";
import { extractTokenFromReq } from "../utils/token-helpers.js";

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
  const access_token = crypto.randomBytes(32).toString("hex");

  try {
    await user.save();
  } catch (err) {
    return res.status(422).json({ error: "User creation failed." });
  }

  try {
    const token = Token.build({
      token: access_token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      UserId: user.id,
    });
    await token.save();
  } catch (err) {
    return res
      .status(422)
      .json({ error: "User created but token creation failed." });
  }

  return res.json({
    token_type: "Bearer",
    access_token,
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

  const access_token = crypto.randomBytes(32).toString("hex");
  try {
    const token = Token.build({
      token: access_token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      UserId: user.id,
    });
    await token.save();
  } catch (err) {
    return res.status(422).json({ error: "Token creation failed." });
  }

  return res.json({
    token_type: "Bearer",
    access_token,
  });
});

usersRouter.post("/signout", isAuthenticated, async function (req, res) {
  try {
    const token = await extractTokenFromReq(req);
    await token.destroy();
  } catch (err) {
    return res.status(422).json({ error: "Couldn't sign out." });
  }
  return res.json({ message: "Signed out successfully." });
});

usersRouter.get("/me", isAuthenticated, async (req, res) => {
  const token = await extractTokenFromReq(req);
  const user = await token.getUser();

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.json({ id: user.id, username: user.username });
});
