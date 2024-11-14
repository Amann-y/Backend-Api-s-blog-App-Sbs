const express = require("express");
const { checkUserAuth } = require("../Middlewares/auth");
const {
  createBlog,
  getAllBlog,
  getUserSpecificBlog,
  deleteUserSpecificBlog,
  updateUserSpecificBlog,
  getBlogByCategory,
  likeABlog,
  getAllLikes,
  view
} = require("../Controllers/blog");

const router = express.Router();

router.post("/create-blog", checkUserAuth, createBlog);
router.get("/blogs", getAllBlog);
router.get("/user-blog", checkUserAuth, getUserSpecificBlog);
router.delete("/user-blog/:id", checkUserAuth, deleteUserSpecificBlog);
router.post("/user-blog/like/:id", checkUserAuth, likeABlog);
router.put("/user-blog/:id", checkUserAuth, updateUserSpecificBlog);
router.get("/blogs/:category", getBlogByCategory, likeABlog);
router.get("/blog-likes/:postId", checkUserAuth,getAllLikes)
router.put("/blog/views/:blogId",checkUserAuth,view)

module.exports = router;
