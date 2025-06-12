import { Router } from "express";
import multer from "multer";
import { validateInput } from "../utils/validate-input.js";
import { Image } from "../models/images.js";

const upload = multer({ dest: "uploads/" });
export const imagesRouter = Router();

imagesRouter.post(
    "/", 
    upload.single("picture"),
    async function (req, res, next) {
        const schema = [
            { name: "title", required: true, type: "string", location: "body"},
            { name: "author", required: true, type: "string", location: "body"},
            { name: "picture", required: true, type: "file", location: "file"}
        ];

        if (!validateInput(req, res, schema)) return;

        try {
            const image = await Image.create({
                title: req.body.title,
                author: req.body.author,
                picture: req.file
            });
            return res.json(image);
        }
        catch (e) {
            return res.status(400).json({ error: "Cannot create image" });
        }
    }
);