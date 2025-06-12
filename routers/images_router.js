import { Op } from "sequelize";

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

imagesRouter.get(
    "/", 
    async (req, res, next) => {
        const cursor = req.query.cursorId;
        
        const images = (cursor) 
        ? [await Image.findByPk(cursor)] 
        : await Image.findAll({
            limit: 1,
            order: [["createdAt", "DESC"]],
        });

        if (images.length === 0 || !images[0]) {
            return res.json({
                image: null,
                prev: null,
                next: null
            });
        }

        const image = images[0];

        const prevWhere = { id: { [Op.gt]: image.id } }
        const prevs = await Image.findAll({
            limit: 1,
            where: prevWhere,
            order: [["createdAt", "ASC"]],
        });
        const prevId = (prevs.length === 0) ? null : prevs[0].id;

        const nextWhere = { id: { [Op.lt]: image.id } }
        const nexts = await Image.findAll({
            limit: 1,
            where: nextWhere,
            order: [["createdAt", "DESC"]],
        });
        const nextId = (nexts.length === 0) ? null : nexts[0].id;

        return res.json({
            image,
            prev: prevId,
            next: nextId
        });
});