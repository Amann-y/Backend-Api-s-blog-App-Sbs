const express = require("express")
const { checkUserAuth} = require("../Middlewares/auth")
const { createComment, getAllComments,editComment,deleteComment,getCommentsFromABlog } = require("../Controllers/comment")

const router = express.Router()

router.post("/create-comment", checkUserAuth, createComment)
router.get("/all-comments", getAllComments)
router.patch("/edit-comment/:id", checkUserAuth,editComment)
router.delete("/delete-comment/:id",checkUserAuth,deleteComment)
router.get("/all-comments/:blogId",getCommentsFromABlog )

module.exports = router