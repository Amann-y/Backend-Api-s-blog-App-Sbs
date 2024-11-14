const express = require("express");
const { createCategory, getAllCategories,getCategoryOfSpecificUser,deleteSpecificCategoryOfUser,updateSpecificCategoryOfUser } = require("../Controllers/category");
const { checkUserAuth } = require("../Middlewares/auth");

const router = express.Router();

router.post("/create-category", checkUserAuth, createCategory);
router.get("/all-categories", checkUserAuth, getAllCategories);
router.get("/user-categories", checkUserAuth, getCategoryOfSpecificUser);
router.delete("/user-category/:id",checkUserAuth,deleteSpecificCategoryOfUser)
router.patch("/user-category/:id", checkUserAuth,updateSpecificCategoryOfUser )

module.exports = router;
