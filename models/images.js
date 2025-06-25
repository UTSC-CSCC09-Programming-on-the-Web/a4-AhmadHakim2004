import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { Gallery } from "./galleries.js";

export const Image = sequelize.define("Image", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  picture: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

Image.belongsTo(Gallery);
Gallery.hasMany(Image);
