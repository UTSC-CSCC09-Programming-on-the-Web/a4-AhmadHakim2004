// datasource.js
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "web_gallery.sqlite",
});
