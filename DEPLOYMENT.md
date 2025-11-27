# 🚀 Vercel Deployment Guide - ADX AI

## ✅ Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): `npm install -g vercel`
3. **Git Repository**: Push your code to GitHub/GitLab/Bitbucket
4. **Bria API Token**: Your API key from Bria AI

---

## 📋 Deployment Steps

### **Method 1: Deploy via Vercel Dashboard (Recommended)**

#### **Step 1: Push to Git**
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### **Step 2: Import Project to Vercel**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your Git repository
4. Vercel will auto-detect the configuration

#### **Step 3: Configure Environment Variables**
In the Vercel dashboard, add:
- **Key**: `BRIA_API_TOKEN`
- **Value**: Your Bria API token
- **Environment**: Production, Preview, Development (select all)

#### **Step 4: Deploy**
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

---

### **Method 2: Deploy via Vercel CLI**

#### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

#### **Step 2: Login to Vercel**
```bash
vercel login
```

#### **Step 3: Deploy**
```bash
cd e:\py\ai\bria_ai
vercel
```

#### **Step 4: Set Environment Variable**
```bash
vercel env add BRIA_API_TOKEN
```
Then paste your API token when prompted.

#### **Step 5: Deploy to Production**
```bash
vercel --prod
```

---

## 🔧 Configuration Files Created

### **1. `requirements.txt`**
Lists all Python dependencies for Vercel to install.

### **2. `vercel.json`**
Configures Vercel deployment:
- Python runtime
- Routing rules
- Static file serving

### **3. `api/index.py`**
Serverless entry point for Vercel (wraps your Flask app).

### **4. `.vercelignore`**
Excludes unnecessary files from deployment.

---

## 🌐 Project Structure for Vercel

```
bria_ai/
├── api/
│   └── index.py          # Vercel entry point
├── static/
│   └── script.js         # Client-side JS
├── templates/
│   └── index.html        # Main UI
├── prompt.py             # Prompt enhancement
├── image_gen.py          # Image generation
├── removebg.py           # Background removal
├── requirements.txt      # Python dependencies
├── vercel.json           # Vercel configuration
└── .vercelignore         # Deployment exclusions
```

---

## ⚙️ Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `BRIA_API_TOKEN` | Your Bria API key | ✅ Yes |
| `FLASK_ENV` | `production` | ✅ Yes (auto-set) |

---

## 🔍 Troubleshooting

### **Build Fails**
- Check `requirements.txt` has all dependencies
- Verify Python version compatibility (Vercel uses Python 3.9+)

### **API Errors**
- Ensure `BRIA_API_TOKEN` is set in Vercel environment variables
- Check API token is valid

### **Static Files Not Loading**
- Verify `vercel.json` routing is correct
- Check file paths in `api/index.py`

### **Function Timeout**
- Vercel serverless functions have a 10-second timeout on free tier
- Upgrade to Pro for 60-second timeout if needed

---

## 📊 Performance Tips

1. **Cold Starts**: First request may be slow (~2-3s). Subsequent requests are fast.
2. **Caching**: Consider adding Redis/Upstash for caching API responses
3. **CDN**: Vercel automatically serves static files via CDN
4. **Regions**: Deploy to multiple regions for better global performance

---

## 🔒 Security Checklist

- ✅ API token stored as environment variable (not in code)
- ✅ `.env` file in `.gitignore`
- ✅ Input validation on all endpoints
- ✅ Error handling prevents sensitive data leaks
- ✅ HTTPS enforced by Vercel

---

## 🎯 Post-Deployment

### **Custom Domain** (Optional)
1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### **Monitoring**
- View logs: Vercel Dashboard → Deployments → [Your Deployment] → Logs
- Analytics: Vercel Dashboard → Analytics

### **Updates**
Push to Git → Vercel auto-deploys:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

---

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Bria AI Docs**: [bria.ai/docs](https://bria.ai/docs)
- **Issues**: Check Vercel deployment logs for errors

---

## ✅ Deployment Checklist

- [ ] Code pushed to Git repository
- [ ] `requirements.txt` exists
- [ ] `vercel.json` configured
- [ ] `api/index.py` created
- [ ] `.vercelignore` set up
- [ ] Bria API token ready
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] Application tested on Vercel URL

---

**🎉 Your ADX AI application is now ready for Vercel deployment!**
