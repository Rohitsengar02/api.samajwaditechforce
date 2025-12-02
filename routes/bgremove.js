const express = require("express");
const { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, reviewResume } = require("../controllers/bgremove.js");
const upload = require("../config/multer.js");
const aiRouter = express.Router();

// ✅ No auth here, already applied in server.js
aiRouter.post("/generate-article", generateArticle);
aiRouter.post("/generate-blog-title", generateBlogTitle);
aiRouter.post("/generate-image", generateImage);
aiRouter.post("/remove-background", upload.single("image"), removeImageBackground);
aiRouter.post("/remove-object", upload.single("image"), removeImageObject);
aiRouter.post("/resume-review", upload.single("resume"), reviewResume);
module.exports = aiRouter;