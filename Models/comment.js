const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
    userName : {
        type : String,
        required: true
    },
    comment: {
        type : String,
        required: true
    },
    createdBy: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    },
    blogId :{
        type : String,
        required: true
    }
},{timestamps:true})

const CommentModel = mongoose.model("Comment", commentSchema)

module.exports = {CommentModel}