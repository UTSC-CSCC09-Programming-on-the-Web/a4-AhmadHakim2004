import express from "express";
import bodyParser from "body-parser";
import { sequelize } from "./datasource.js";
import { imagesRouter } from "./routers/images_router.js";
import { commentsRouter } from "./routers/comments_router.js";

export const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("static"));

// I recommend putting this just below app.use(express.static("static")), so that it can run before your other code.
try {
  await sequelize.authenticate();
  // Automatically detect all of your defined models and create (or modify) the tables for you.
  // This is not recommended for production-use, but that is a topic for a later time!
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.use("/api/comments", commentsRouter);
app.use("/api/images", imagesRouter);

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
