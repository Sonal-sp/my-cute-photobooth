# 🎀 ✨ My Cute Photobooth ✨ 📸

Welcome to **My Cute Photobooth**, a fully responsive, browser-based digital photobooth built entirely with React! 

This project brings the magic of a Japanese *Purikura* sticker booth straight to your laptop or phone. Snap a single picture or take a classic 4-pic photostrip, decorate it with draggable stickers, apply aesthetic filters, and save your memories in a persistent digital scrapbook. 

## 🌟 Live Demo
*(Replace this line with your Vercel link once you deploy!)* -> [Click here to take a picture!](https://your-vercel-link.vercel.app)

---

## 🧸 Features

* **📸 Real-Time Camera Access:** Securely connects to the user's device camera using the native WebRTC API.
* **🎞️ 4-Pic Strips & Single Snaps:** Includes a built-in timer system to take classic 4-picture photo strips and stitch them together automatically.
* **🎀 Draggable Stickers:** A custom UI allowing users to add, drag, scale, and rotate cute PNG stickers directly over the live video feed.
* **🧮 Complex Canvas Math:** When a photo is snapped, the app calculates the exact coordinates, scale, and rotation of the DOM stickers and perfectly burns them onto the final Canvas output.
* **🎨 8 Custom Filters:** A dedicated filter row utilizing CSS and Canvas Context filters (including Vintage, Soft Blur, Pop Contrast, and Cool Ice).
* **📚 The Digital Scrapbook:** Saves captured photos and personal journal notes to the browser's `localStorage` so memories persist between visits.
* **📱 Fully Responsive:** Features a split-screen desktop layout that elegantly transforms into a mobile-friendly app with a fixed bottom navigation bar on smaller screens.

---

## 🛠️ Built With (The Tech Stack)

* **React (Vite):** Fast, modern state management for handling complex UI toggles, countdown timers, and sticker editing arrays.
* **HTML5 Canvas API:** Used for raw pixel manipulation, mirroring video frames, stitching multiple images together, and rendering final composition downloads.
* **WebRTC API:** Specifically `navigator.mediaDevices.getUserMedia` for safe, browser-native camera streaming.
* **CSS3:** Custom animations, frosted glass UI (backdrop-filter), CSS Grid/Flexbox layouts, and media queries for mobile responsiveness.
* **LocalStorage:** For persistent, lightweight data storage of the Scrapbook array.

---

## 🚀 How to Run Locally

Want to clone this project and add your own cute stickers? 

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Sonal-sp/my-cute-photobooth.git](https://github.com/Sonal-sp/my-cute-photobooth.git)

**2.Navigate into the directory:**
Bash
cd my-cute-photobooth

**3.Install dependencies:**
Bash
npm install

**4.Start the magical development server:**
Bash
npm run dev

**5.Open http://localhost:5173 in your browser, allow camera access, and start snapping! 🌸**