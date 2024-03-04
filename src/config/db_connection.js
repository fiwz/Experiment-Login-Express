import * as dotenv from "dotenv";
dotenv.config();

import mongoose from 'mongoose';
const { DB_HOST, DB_PORT, DB_NAME } = process.env
const mongoConfigString = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`
const MongoConfigOpt = { autoCreate:true }
mongoose.connect(mongoConfigString, MongoConfigOpt)

export { mongoose }