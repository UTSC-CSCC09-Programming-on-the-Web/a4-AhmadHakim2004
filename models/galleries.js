import { sequelize } from "../datasource.js";
import { User } from "./users.js";

export const Gallery = sequelize.define("Gallery", {});

Gallery.belongsTo(User);
User.hasOne(Gallery);
