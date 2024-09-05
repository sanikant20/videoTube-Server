// require('dotenv').config(path='/.env')
// console.log(process.env)

import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";

dotenv.config({
    path: '/.env'
})

connectDB()