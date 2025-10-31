# Google Cloud Vision API Setup

## Option 1: Quick Demo (No Setup Required)

The application will work without Vision API credentials - it simply won't analyze images. This is perfect for testing the rest of the functionality.

## Option 2: Enable Vision API (Free Tier Available)

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable billing (required, but free tier includes 1,000 requests/month)

### Step 2: Enable Vision API

1. Go to [Vision API page](https://console.cloud.google.com/apis/library/vision.googleapis.com)
2. Click "Enable"

### Step 3: Create Service Account

1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Name it (e.g., "servicedeskAI-vision")
4. Grant role: "Cloud Vision AI Service Agent"
5. Click "Create Key" → JSON
6. Download the JSON key file

### Step 4: Configure Your App

**Option A: Environment Variable (Recommended)**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/key.json"
```

Add to your `.env` file:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-service-account-key.json
```

**Option B: Use gcloud CLI**
```bash
gcloud auth application-default login
```

### Step 5: Restart Backend

```bash
cd back
npm run dev
```

You should see: `✓ Google Cloud Vision API initialized`
