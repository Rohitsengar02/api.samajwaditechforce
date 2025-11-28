const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const FormData = require("form-data");
const cloudinary = require("cloudinary").v2;
const fs = require('fs');
const pdf = require('pdf-parse');

// ✅ Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Safe extractor for Gemini responses
 */
const extractText = (result) => {
    if (!result) return "";

    try {
        // ✅ New SDK style
        if (typeof result.response?.text === "function") {
            return result.response.text();
        }

        // ✅ Candidate parts style
        if (result.response?.candidates?.length) {
            return result.response.candidates
                .flatMap((c) => c.content?.parts || [])
                .map((p) => p.text || "")
                .join("\n")
                .trim();
        }
    } catch (err) {
        console.error("⚠️ Failed to extract text:", err);
    }

    return "";
};

/**
 * Generate Article
 */
exports.generateArticle = async (req, res) => {
    try {
        const { topic, length, words } = req.body;

        if (!topic) return res.json({ success: false, error: "Missing topic" });

        const prompt = `
Write a detailed ${length} article about "${topic}" in around ${words}.
- A big heading (<h1>) with the article title.
- Include an introduction paragraph.
- Use bold headings and subheadings (<h1>, <h2>, <h3>) for sections.
- Include lists (<ul><li>) for steps, tips, and examples.
- Include tips or examples in italic or bold where appropriate.
- Use clear, simple language.
- End with a conclusion.
- Do NOT include outer <html>, <body>, or metadata tags.
- Output clean HTML suitable for ReactMarkdown or ReactQuill with correct heading, list, and paragraph formatting.
      `;

        // ✅ Gemini generate
        const result = await model.generateContent(prompt);

        console.log("🔎 Gemini raw result:", JSON.stringify(result, null, 2));

        const text = extractText(result);

        if (!text) {
            return res
                .status(502)
                .json({ success: false, error: "⚠️ No article received from API." });
        }

        res.json({ success: true, article: text });
    } catch (err) {
        console.error("❌ Article generation error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Generate Blog Titles
 */
exports.generateBlogTitle = async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) return res.json({ success: false, error: "Missing topic" });

        const prompt = `Suggest 5  Blog titles for: "${topic}" With headings in bold and Bigger`;

        // ✅ Gemini generate
        const result = await model.generateContent(prompt);

        console.log("🔎 Gemini raw result:", JSON.stringify(result, null, 2));

        const text = extractText(result);

        if (!text) {
            return res
                .status(502)
                .json({ success: false, error: "⚠️ No titles received from API." });
        }

        res.json({ success: true, titles: text });
    } catch (err) {
        console.error("❌ Blog title generation error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.generateImage = async (req, res) => {
    try {
        const { topic, publish } = req.body;

        if (!topic) {
            return res.json({ success: false, error: "Missing topic" });
        }

        // Build prompt for ClipDrop
        const prompt = `Create an image of "${topic}"`;

        const form = new FormData();
        form.append("prompt", prompt);

        const { data } = await axios.post(
            "https://clipdrop-api.co/text-to-image/v1",
            form,
            {
                headers: {
                    "x-api-key": process.env.CLIPDROP_API_KEY,
                    ...form.getHeaders(),
                },
                responseType: "arraybuffer",
            }
        );

        const base64Image = `data:image/png;base64,${Buffer.from(
            data,
            "binary"
        ).toString("base64")}`;

        // Upload to Cloudinary
        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        console.log("Success! Sending response...");
        res.json({
            success: true,
            image: secure_url,
        });

    } catch (err) {
        console.error("Unexpected error:", err.stack || err);
        res.status(500).json({ success: false, error: "Unexpected server error" });
    }
};


exports.removeImageBackground = async (req, res) => {
    try {
        console.log("=== REMOVE BACKGROUND ===");
        console.log("req.file:", req.file);

        // ✅ File check
        if (!req.file) {
            console.error("No file uploaded");
            return res.status(400).json({ success: false, error: "No file received" });
        }

        // ✅ Upload to Cloudinary using upload_stream
        console.log("Uploading file to Cloudinary...");

        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        transformation: [{ effect: "background_removal" }],
                        format: 'png'
                    },
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary upload_stream error:", error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
                stream.end(fileBuffer); // send file buffer to Cloudinary
            });
        };

        const result = await streamUpload(req.file.buffer);
        const secure_url = result.secure_url;
        console.log("Cloudinary result:", secure_url);

        console.log("Success! Sending response...");
        res.json({
            success: true,
            image: secure_url,
        });

    } catch (err) {
        console.error("Unexpected error:", err.stack || err);
        res.status(500).json({ success: false, error: "Unexpected server error" });
    }
};


exports.removeImageObject = async (req, res) => {
    try {
        console.log("=== REMOVE OBJECT FROM IMAGE ===");
        console.log("req.body.object:", req.body.object);
        console.log("req.file:", req.file);

        const objectToRemove = req.body.object;
        const imageFile = req.file;

        if (!imageFile) {
            console.error("No file uploaded");
            return res.status(400).json({ success: false, error: "No file received" });
        }
        if (!objectToRemove) {
            console.error("No object specified");
            return res.status(400).json({ success: false, error: "Missing object to remove" });
        }

        // ✅ Upload image to Cloudinary using upload_stream
        const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {},
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary upload_stream error:", error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
                stream.end(buffer);
            });
        };

        const uploadResult = await streamUpload(imageFile.buffer);

        // ✅ Generate URL with object removal transformation
        const imageUrl = cloudinary.url(uploadResult.public_id, {
            transformation: [
                { effect: `gen_remove:${objectToRemove}` },
            ],
            resource_type: "image",
        });
        console.log("Cloudinary transformed image URL:", imageUrl);

        res.json({
            success: true,
            image: imageUrl,
        });

    } catch (err) {
        console.error("❌ removeImageObject error:", err.stack || err);
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.reviewResume = async (req, res) => {
    try {
        console.log("=== REVIEW RESUME ===");
        console.log("req.file:", req.file);

        const resumeFile = req.file;

        if (!resumeFile) {
            return res.status(400).json({ success: false, error: "Missing resume file" });
        }
        if (resumeFile.size > 5 * 1024 * 1024) {
            return res.status(400).json({ success: false, error: "File size too large" });
        }

        // ✅ Parse PDF from buffer
        const pdfData = await pdf(resumeFile.buffer);
        const prompt = `Review the following resume and provide constructive feedback on strengths, weaknesses, and areas of improvement:\n\n${pdfData.text}`;

        // ✅ Call your AI model (replace model.generateContent with actual method)
        const result = await model.generateContent(prompt);
        console.log("Raw AI result:", result);

        const text = extractText(result); // your helper function
        if (!text) {
            return res.status(502).json({ success: false, error: "No response from AI" });
        }

        res.json({ success: true, content: text });

    } catch (err) {
        console.error("❌ reviewResume error:", err.stack || err);
        res.status(500).json({ success: false, error: err.message });
    }
};