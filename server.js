const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./Utils/Database/connectDb");
const userRouter = require("./Routes/user")
const categoryRouter = require("./Routes/category")
const blogRouter = require("./Routes/blog")
const commentRouter = require("./Routes/comment")
const rateLimit = require("express-rate-limit")

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const limit = rateLimit({
  windowMs : 1000 * 60 * 5,
  max : 118,
  handler: (req, res) => {
    res.status(429).json({ message: "Too many requests, please try again later." });
  }
})

app.use("/api/v1/user",userRouter)
app.use("/api/v1/category",categoryRouter)
app.use("/api/v1/blog",limit, blogRouter)
app.use("/api/v1/comment",commentRouter)

app.use("*", (req,res)=>{
  res.status(404).json({message:"404 Page not found"})
})

// General Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Something went wrong!" });
});

// connect Database
connectDB(process.env.MONGODB_URL_ATLAS);

app.listen(process.env.PORT, () => {
  console.log(`Server Is Running On ${process.env.PORT}`);
});
