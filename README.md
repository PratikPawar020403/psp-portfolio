# 🚀 Pratik S Pawar - Portfolio

A modern, high-performance portfolio website showcasing projects, skills, and professional journey. Built with cutting-edge web technologies for a smooth and engaging user experience.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Backend/DB**: [Supabase](https://supabase.com/)
- **Deployment**: [Netlify](https://www.netlify.com/)

## ✨ Features

- **Interactive UI**: Smooth animations and responsive design.
- **Project Showcase**: Detailed view of projects with filtering.
- **Certifications**: Carousel display of professional certifications.
- **Dark Mode**: Optimized dark-themed interface.
- **Performance**: High Lighthouse scores for speed and accessibility.

## 🚀 Getting Started

### Prerequisites

Make sure you have **Node.js** (v18+) installed.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add your Supabase keys:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
    ```

4.  **Run locally:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` (or the port shown) in your browser.

## 📦 Build & Deployment

To build the project for production:

```bash
npm run build
```

The output will be in the `dist` folder.

### Deploying to Netlify

This project is configured for **Netlify**.

1.  Connect your GitHub repository to Netlify.
2.  **Build Settings** (Automatic via `netlify.toml`):
    - **Command**: `npm run build`
    - **Publish directory**: `dist`
3.  Add your **Environment Variables** in Netlify Site Settings.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.
