// api oops inheritence function overriding and all
import express from 'express';


// import route from routes/user.js
import userRoute from "./routes/user.js"
import { connectDB } from './utils/features.js';
const PORT=10000;
connectDB();
const app=express();

app.use(express.json());

app.get("/",function(req,res){
    res.send("API Working with /api/v1");
})
//  rajenda

// Using Route
app.use("/api/v1/user",userRoute);


app.listen(PORT,()=>{
    console.log(`Express is working on http://localhost:${PORT}`)
})