const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    category : {
        type : String,
        required: true
    },
    imgUrl: {
        type : String,
        required: true
    },
    createdBy: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    }
},{timestamps:true})

const CategoryModel = mongoose.model("Category", categorySchema)

module.exports = {CategoryModel}