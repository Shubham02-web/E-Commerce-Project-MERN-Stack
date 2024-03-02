import  express  from "express";
const app=express.Router();
import { newUser } from "../controllers/user.js";
app.post("/new",newUser)

export default app;