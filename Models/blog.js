const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    nameOfCreator: {
      type: String,
      required: true,
    },

    emailOfCreator: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryTitle: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    likes:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    views:{
      type:Number,
      default:0
    }
  },
  { timestamps: true }
);

const BlogModel = mongoose.model("Blog", blogSchema);

module.exports = { BlogModel };
