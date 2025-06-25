import { Token } from "../models/tokens.js";

export async function extractTokenFromReq(req) {
    const authHeader = req.headers["Authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.slice(7);    
    return await Token.findOne({ where: { token } });
}