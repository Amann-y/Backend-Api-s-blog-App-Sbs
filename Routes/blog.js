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
  view,
  saveBlog,
  getSavedBlog,
  searchBlogs
} = require("../Controllers/blog");
const { upload } = require("../Utils/multer");

const router = express.Router();

router.post("/create-blog", checkUserAuth, upload.single('imgUrl'),createBlog);
router.get("/blogs", getAllBlog);
router.get("/user-blog", checkUserAuth, getUserSpecificBlog);
router.delete("/user-blog/:id", checkUserAuth, deleteUserSpecificBlog);
router.post("/user-blog/like/:id", checkUserAuth, likeABlog);
router.put("/user-blog/:id", checkUserAuth, upload.single('imgUrl'),updateUserSpecificBlog);
router.get("/blogs/:category", getBlogByCategory, likeABlog);
router.get("/blog-likes/:postId", checkUserAuth,getAllLikes)
router.put("/blog/views/:blogId",checkUserAuth,view)
router.post("/blog-save/:id", checkUserAuth, saveBlog)
router.get("/saved-blogs",checkUserAuth,getSavedBlog)
router.get("/search-blogs", searchBlogs)

module.exports = router;
