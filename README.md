# Siva Manpaanai Unavagam (சிவா மண்பானை உணவகம்)

A modern, highly polished, and fully-responsive single-page web application built for an authentic clay-pot cooking restaurant located in Dindigul, Tamil Nadu. It features smooth UI animations, active food ordering, a floating cart, Google Pay integrated deep linking, dynamic festive discounts, and a built-in AI Customer Assistant.

---

## 🛠️ Technology Stack & Programming Languages

This project is built using a modern, high-performance stack focusing on developer velocity, type-safety, and smooth native-like user experience.

### 1. Programming Languages
*   **TypeScript (TSX / TS)**: The core programming language used to build the complete application logic, state management, and React component structures. It provides complete compile-time safety and self-documenting code.
*   **JavaScript (ES6+)**: Used underneath by the modern build system, Node.js packages, and configurations (`vite.config.ts`, `package.json`).
*   **HTML5**: Provides the initial semantic document structure and standard DOM configuration to mount the React Single Page Application (SPA).
*   **CSS3**: Custom Tailwind configurations and smooth, eye-safe, responsive viewport animations.

### 2. Frameworks & CSS Libraries
*   **React 19**: A state-of-the-art frontend framework for composing declarative, component-driven, and highly reactive user interfaces.
*   **Tailwind CSS (v4)**: Modern, utility-first CSS framework used exclusively for UI styling, custom gradients, typography pairings, and responsive desktop-to-mobile layouts.
*   **Motion (formerly Framer Motion)**: Advanced hardware-accelerated physics-based animation library used for route transitions, active tab sliding animations, cart progress fills, and rating star transitions.

### 3. Integrations & Developer Tools
*   **Vite**: Next-generation lightning-fast local development server and optimized static production builder.
*   **Google GenAI SDK (`@google/genai`)**: Server-side client proxy to implement the intelligent **Siva AI Assistant** chatbot powered by Gemini models.
*   **Lucide React**: High-quality vector iconography used consistently across the entire visual layout.
*   **UPI Deep Linking (GPay / PhonePe / Paytm)**: Mobile-optimized `upi://` protocol integration to dynamically pre-fill exact bill amount and route users seamlessly to GPay.

---

## ✨ Features Implemented
*   **Signature Food Menu**: Categorized under morning and evening clay-pot delicacies with high-resolution visual previews.
*   **Active Booking & Checkout**: Smooth cart mechanism keeping track of selected items, quantities, and subtotal.
*   **Chithirai Festive Specials**: Celebratory promo code coupons (`SIVA10`, `COMBO50`, `FREEDEL`) with a dynamic free delivery progress bar.
*   **Order Placement & Tracking**: Simulates kitchen preparation, courier assignment, and final delivery steps with native timelines.
*   **Post-Delivery Rating**: Interactive, non-intrusive 5-star review collector shown only after successful food delivery simulation.
*   **Interactive AI Chatbot**: Built-in customer support agent to guide visitors on menus, address, and special offers.

---

## 🚀 Running the Project Locally

To run this project on your system:

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
