import { extractTokenFromReq } from "../utils/token-helpers.js";

export const isAuthenticated = async function (req, res, next) {
  const token = await extractTokenFromReq(req);
  if (!token || token.expiresAt < Date.now()) {
    return res.status(401).json({ error: "Not Authenticated", status: 401 });
  }
  next();
};
