# Deployment Guide - Render

This guide will help you deploy the Hooli Vapi Admin Panel to Render.

## Prerequisites

1. A [Render account](https://render.com) (free tier works!)
2. Your GitHub repository connected to Render
3. Your Vapi API key

## Quick Deploy (Recommended)

### Option 1: Deploy using render.yaml (Blueprint)

1. **Go to Render Dashboard**

   - Visit https://dashboard.render.com

2. **New Blueprint**

   - Click "New" → "Blueprint"
   - Connect your GitHub repository: `https://github.com/Baker-C/Hooli`
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**

   - When prompted, enter your **Vapi API Key**:
     - `VAPI_API_KEY`: Your actual Vapi API key

4. **Deploy**

   - Click "Apply"
   - Render will deploy both services automatically
   - Backend will be at: `https://hooli-backend.onrender.com`
   - Frontend will be at: `https://hooli-frontend.onrender.com`

5. **Wait for Deployment**
   - Initial build takes 5-10 minutes
   - Once complete, your app will be live!

---

## Option 2: Manual Deployment

### Step 1: Deploy Backend

1. **Create Web Service**

   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your repository

2. **Configure Backend Service**

   ```
   Name: hooli-backend
   Region: Oregon (or your preferred region)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   Plan: Free
   ```

3. **Add Environment Variables**

   ```
   VAPI_API_KEY=your_vapi_api_key_here
   VAPI_PHONE_NUMBER_ID=6a615c7a-c73e-4158-bf64-ffc02dd57192
   VAPI_ASSISTANT_ID=
   PORT=10000
   NODE_ENV=production
   ```

4. **Create Service**
   - Click "Create Web Service"
   - Note the URL: `https://hooli-backend.onrender.com`

### Step 2: Deploy Frontend

1. **Create Static Site**

   - Go to Render Dashboard
   - Click "New" → "Static Site"
   - Connect your repository

2. **Configure Frontend Service**

   ```
   Name: hooli-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

3. **Add Environment Variable**

   ```
   REACT_APP_API_URL=https://hooli-backend.onrender.com/api
   ```

   ⚠️ Replace with your actual backend URL from Step 1

4. **Create Static Site**
   - Click "Create Static Site"
   - Your frontend will be at: `https://hooli-frontend.onrender.com`

---

## Post-Deployment Configuration

### Update CORS on Backend

If you deployed manually, you may need to update CORS settings:

1. Go to your backend service in Render
2. Add environment variable:
   ```
   FRONTEND_URL=https://hooli-frontend.onrender.com
   ```
3. Save and redeploy

### Test Your Deployment

1. **Visit your frontend URL**

   - Example: `https://hooli-frontend.onrender.com`

2. **Check backend health**

   ```bash
   curl https://hooli-backend.onrender.com/health
   ```

3. **Test call initiation**
   ```bash
   curl -X POST https://hooli-backend.onrender.com/api/call \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber": "+15105079026"}'
   ```

---

## Important Notes

### Free Tier Limitations

- **Spin Down**: Free services spin down after 15 minutes of inactivity
- **Cold Starts**: First request after spin down takes ~30-60 seconds
- **Monthly Hours**: 750 hours/month shared across all services

### Keep Services Active

To prevent spin down, you can:

1. Upgrade to paid plan ($7/month per service)
2. Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 10 minutes
3. Accept the cold start delay

### Custom Domains

To use your own domain:

1. Go to your service settings
2. Click "Custom Domain"
3. Follow the instructions to add DNS records

---

## Environment Variables Reference

### Backend (`hooli-backend`)

| Variable             | Required | Description                    | Example                               |
| -------------------- | -------- | ------------------------------ | ------------------------------------- |
| VAPI_API_KEY         | Yes      | Your Vapi API key              | `cedb2997-...`                        |
| VAPI_PHONE_NUMBER_ID | Yes      | Vapi phone number ID           | `6a615c7a-...`                        |
| VAPI_ASSISTANT_ID    | No       | Pre-configured assistant ID    | Leave empty for inline config         |
| PORT                 | Auto     | Port number (Render sets this) | `10000`                               |
| NODE_ENV             | No       | Environment                    | `production`                          |
| FRONTEND_URL         | No       | Frontend URL for CORS          | `https://hooli-frontend.onrender.com` |

### Frontend (`hooli-frontend`)

| Variable          | Required | Description     | Example                                  |
| ----------------- | -------- | --------------- | ---------------------------------------- |
| REACT_APP_API_URL | Yes      | Backend API URL | `https://hooli-backend.onrender.com/api` |

---

## Troubleshooting

### Backend won't start

- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure `VAPI_API_KEY` is correct

### Frontend shows connection error

- Verify `REACT_APP_API_URL` is set correctly
- Check backend is running
- Look for CORS errors in browser console

### CORS errors

- Add frontend URL to backend `FRONTEND_URL` env var
- Ensure both services are using HTTPS (not HTTP)
- Check browser console for specific error

### Calls fail to initiate

- Verify Vapi API key is valid
- Check Vapi account has credits
- Review backend logs for error messages

---

## Updating Your Deployment

When you push to main branch:

1. Render automatically detects changes
2. Rebuilds and redeploys services
3. Zero-downtime deployment

To manually redeploy:

1. Go to service in Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

---

## Monitoring

### View Logs

1. Go to service in Render dashboard
2. Click "Logs" tab
3. View real-time logs

### Set Up Alerts

1. Go to service settings
2. Add email for deployment notifications
3. Configure health check alerts

---

## Cost Optimization

### Free Tier Setup (Recommended for Testing)

- Backend: Free Web Service
- Frontend: Free Static Site
- **Total Cost: $0/month**

### Production Setup

- Backend: Starter ($7/month)
- Frontend: Free Static Site
- **Total Cost: $7/month**
  - No spin down
  - Always active
  - Better performance

---

## Security Best Practices

1. **Rotate API Keys**: If you suspect exposure, rotate your Vapi API key
2. **Use Environment Variables**: Never hardcode secrets
3. **Enable HTTPS**: Render provides SSL certificates automatically
4. **Monitor Usage**: Check Vapi dashboard for unexpected usage
5. **Set Up Authentication**: Consider adding auth to your backend API

---

## Next Steps

After deployment:

1. ✅ Test all functionality
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring
4. ✅ Share URLs with your team
5. ✅ Update API documentation with production URLs

---

## Support

- **Render Support**: https://render.com/docs
- **Vapi Documentation**: https://docs.vapi.ai
- **Repository Issues**: https://github.com/Baker-C/Hooli/issues

---

_Last Updated: October 4, 2025_
