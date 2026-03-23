# 🚀 AI Thumbnail Generator

An AI-powered SaaS-style web application that allows users to generate high-quality thumbnails using customizable styles, color schemes, and prompts.

---

## 🔥 Features

- 🔐 User Authentication (Signup/Login with sessions)
- 🎨 Generate thumbnails using AI
- 📝 Custom inputs:
  - Title
  - Aspect Ratio
  - Thumbnail Style (Bold, Minimalist, Tech, etc.)
  - Color Schemes (Vibrant, Purple Dream, Monochrome, etc.)
  - Additional Prompts (optional)
- 👀 Real-time thumbnail preview (YouTube-style)
- ☁️ Cloud storage with Cloudinary
- 🖼️ Image processing using Sharp (resize, overlays, optimization)
- 📥 Download generated thumbnails
- 🗑️ Delete thumbnails
- 📚 Thumbnail history for users

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- TypeScript

### Backend
- Node.js
- Express.js
- TypeScript

### Database
- MongoDB

### AI & Tools
- Cloudflare AI (for prompt-based generation)
- Sharp (image processing)
- Cloudinary (image storage & delivery)
- bcrypt (password hashing)
- express-session (authentication)

---

## ⚙️ How It Works

1. User logs in or signs up  
2. Enters thumbnail details (title, style, colors, etc.)  
3. Backend generates prompt using Cloudflare AI  
4. Image is processed using Sharp  
5. Thumbnail is stored on Cloudinary  
6. User can preview, download, or delete it  

---

## 🚀 Live Demo

👉 https://ai-thumbnail-gen-dun.vercel.app
