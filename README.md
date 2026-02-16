# Deploying Bkeeprs Backend to Render (Free)

Follow these steps to get your backend live and connected to your website.

## 1. Prepare GitHub Repository
1. Create a new **Private** repository on GitHub named `bkeeprs-backend`.
2. Upload the files from the `backend/` folder (`package.json`, `server.js`) to this repo.

## 2. Deploy to Render
1. Go to [Render](https://render.com/) and create a free account.
2. Click **"New +"** -> **"Web Service"**.
3. Connect your GitHub account and select the `bkeeprs-backend` repository.
4. **Configuration:**
   - **Name:** `bkeeprs-backend` (or any name you like)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

## 3. Add Environment Variables
In the Render dashboard for your service, go to **"Environment"** and click **"Add Environment Variable"**:
- `GMAIL_USER`: Your Gmail address (e.g., `contact.bkeeprslabs@gmail.com`)
- `GMAIL_APP_PASS`: The 16-character **App Password** you generated in Google Settings.
- `RECEIVER_EMAIL`: (Optional) Where you want to receive the alerts.
- `PORT`: 10000 (Render usually handles this, but good to have).

## 4. Final Step: Connect Frontend
1. Once deployed, Render will give you a URL (e.g., `https://bkeeprs-backend.onrender.com`).
2. Open `index.html` and search for:
   `const BACKEND_URL = 'https://YOUR-BACKEND-NAME.onrender.com/contact';`
3. Replace it with your actual Render URL and keep the `/contact` at the end.
4. Test your form!
