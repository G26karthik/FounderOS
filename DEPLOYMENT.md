# 🚀 FounderOS — Production Deployment Guide

This guide walks you through deploying the **FounderOS** application to production:
1. **Backend (FastAPI)** hosted on **Render** (or Railway/Fly.io)
2. **Frontend (React + Vite)** hosted on **Vercel**

---

## 📦 Part 1: Deploying the Backend (FastAPI)

Since the backend is a persistent Python server with background tasks (Lyzr Agent initialization and Qdrant indexing), it is best deployed on a platform like **Render**, **Railway**, or **Fly.io** using the provided `Dockerfile`.

Here, we will use **Render** as the example (it supports Docker builds directly on their free tier).

### Step-by-Step Render Deployment:
1. **Sign in to Render**: Go to [render.com](https://render.com) and log in using your GitHub account.
2. **Create a New Web Service**: Click **New +** on the dashboard and select **Web Service**.
3. **Connect your GitHub Repository**: Search and select `G26karthik/FounderOS`.
4. **Configure Web Service Details**:
   - **Name**: `founderos-backend`
   - **Region**: Select a region closest to you (e.g., US East, Singapore).
   - **Root Directory**: `backend` *(CRITICAL: Set this so Render builds from inside the backend directory)*
   - **Language**: `Docker` *(Render will automatically locate the Dockerfile in the Root Directory)*
   - **Instance Type**: `Free` or `Starter`
5. **Add Environment Variables**: Click **Advanced** -> **Add Environment Variable** and copy over values from your `.env` file:
   - `OPENAI_API_KEY` = `your_openai_key_here`
   - `LYZR_API_KEY` = `your_lyzr_key_here`
   - `LYZR_MODEL` = `gpt-4o-mini`
   - `QDRANT_URL` = `https://your-cluster-id.cloud.qdrant.io`
   - `QDRANT_API_KEY` = `your_qdrant_key`
   - `ENKRYPT_API_KEY` = `your_enkrypt_key` *(optional)*
   - `CORS_ORIGINS` = `https://your-vercel-app-url.vercel.app` *(update this AFTER deploying the frontend)*
6. **Deploy**: Click **Create Web Service**. Render will start building the Docker image and deploy the FastAPI backend. Copy your deployed backend service URL (e.g., `https://founderos-backend.onrender.com`).

---

## ⚡ Part 2: Deploying the Frontend (React + Vite) on Vercel

Vercel is optimized for building and serving Vite + React static single-page applications.

### Step-by-Step Vercel Deployment:
1. **Sign in to Vercel**: Go to [vercel.com](https://vercel.com) and log in using your GitHub account.
2. **Import Project**: Click **Add New** -> **Project** on your dashboard and select `G26karthik/FounderOS` from the list.
3. **Configure Project**:
   - **Framework Preset**: `Vite` *(Vercel will auto-detect Vite)*
   - **Root Directory**: `frontend` *(CRITICAL: Click edit and select the `frontend` folder)*
   - **Build & Development Settings**: Keep defaults (`npm run build` and `dist`).
4. **Configure Environment Variables**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://founderos-backend.onrender.com` *(Use your deployed Render backend URL. Notice there is no trailing slash!)*
5. **Deploy**: Click **Deploy**. Vercel will build your static files and deploy them. Copy the URL of your live dashboard (e.g., `https://founderos.vercel.app`).
6. **Update Backend CORS**: Go back to your **Render dashboard**, add your live Vercel URL to the `CORS_ORIGINS` environment variable on Render, and trigger a redeploy so the backend allows requests from your Vercel frontend.

---

## 🎙️ Part 3: Connecting Omi Webhook

Once both services are deployed:
1. Copy the webhook URL: `https://founderos-backend.onrender.com/api/omi/webhook`
2. Configure this URL in your **Omi app integration settings** under Webhook Events.
3. Enable the `conversation.completed` event. 

You are now in full production mode!
