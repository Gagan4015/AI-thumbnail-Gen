import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

import sharp from "sharp";

const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",
  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",
  Minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",
  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",
  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
};

const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
  sunset:
    "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
};
export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;
    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    // Build AI prompt
    let prompt = `create
Background image for YouTube thumbnail about "${title}"
Style: ${stylePrompts[style as keyof typeof stylePrompts]}
`;
    if (user_prompt) prompt += `Extra: ${user_prompt}\n`;
    if (color_scheme) {
      prompt += `Colors: ${
        colorSchemeDescriptions[
          color_scheme as keyof typeof colorSchemeDescriptions
        ]
      }\n`;
    }

    // Aspect ratio width/height
    let width = 1024;
    let height = 576; // default 16:9
    if (aspect_ratio === "1 : 1") width = height = 1024;
    if (aspect_ratio === "9 : 16") {
      width = 576;
      height = 1024;
    }

    //  Cloudflare AI for background
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, width, height }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error("AI Error: " + err);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer || buffer.length < 1000) {
      throw new Error("Invalid image generated");
    }

    //  Dynamic font size calculation
    const maxFontSize = Math.floor(width / 12);
    const fontSize = Math.max(30, Math.min(maxFontSize, 70)); // clamp between 30–70
    const strokeWidth = Math.floor(fontSize / 12);

    //  Word wrapping for portrait mode
    let svgText = "";
    if (aspect_ratio === "9 : 16") {
      const words = title.split(" ");
      const mid = Math.ceil(words.length / 2);
      const line1 = words.slice(0, mid).join(" ");
      const line2 = words.slice(mid).join(" ");

      svgText = `
        <text x="50%" y="15%" font-size="65" font-weight="900" fill="white"
          stroke="black" stroke-width="5" text-anchor="middle"
          font-family="sans-serif">
          <tspan x="50%" dy="1em">${line1}</tspan>
          <tspan x="50%" dy="1.2em">${line2}</tspan>
        </text>
      `;
    } else {
      svgText = `
        <text x="50%" y="85%" font-size="${fontSize}" font-weight="900" fill="white"
          stroke="black" stroke-width="${strokeWidth}" text-anchor="middle"
          font-family="sans-serif">
          ${title}
        </text>
      `;
    }

    //  Resize and add title text
    const finalBuffer = await sharp(buffer)
      .resize(width, height)
      .composite([
        {
          input: Buffer.from(
            `<svg width="${width}" height="${height}">${svgText}</svg>`,
          ),
          top: 0,
          left: 0,
        },
      ])
      .toBuffer();

    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${finalBuffer.toString("base64")}`,
      {
        resource_type: "image",
      },
    );

    thumbnail.image_url = uploadResult.url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    return res.json({
      message: "Thumbnail generated successfully",
      thumbnail,
    });
  } catch (error: any) {
    console.log("ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Controller for Delete Thumbnail

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    await Thumbnail.findByIdAndDelete({ _id: id, userId });
    res.json({ message: "Thumbnail deleted successfully" });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
