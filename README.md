# serviceDeskAI
Simplified service for employees to report issues or damaged items in their workspace

## Features

### Core Functionality
- **Multi-role Authentication**: Standard users, Service Desk, and Admins
- **Issue Reporting**: Upload images and describe problems
- **Real-time Chat**: Communication between users and service desk
- **Issue Management**: Track status (open, in-progress, resolved) and priority
- **Admin Dashboard**: Analytics, user management, office management

### AI-Powered Features

#### 1. **Geolocation Capture**
- Automatically captures GPS location when reporting issues
- View exact location on Google Maps
- Location-based analytics in admin dashboard
- Accuracy tracking (±meters)

#### 2. **Google Cloud Vision AI Integration**
- **Object Detection**: Identifies items in images (laptop, monitor, chair, etc.)
- **Label Detection**: Tags images (damaged, broken, electronics, etc.)
- **Text Recognition (OCR)**: Extracts text from images (error messages, labels)
- **Smart Descriptions**: Auto-generates issue descriptions from detected objects
- **High Accuracy**: Only uses high-confidence detections (>70% for labels, >50% for objects)

### How AI Enhances Reporting

1. **User uploads image** → Vision API analyzes it in real-time
2. **AI detects**: "Laptop, Monitor, Damaged, Electronics"
3. **Auto-suggests**: "Laptop, monitor, damaged"
4. **Service desk sees**: All AI insights with confidence scores
5. **Faster resolution**: Better context = quicker fixes

## Setup

### Prerequisites
- Node.js 20+
- MongoDB
- Docker

### Quick Start

```bash
# Install dependencies
npm install

# Set up environment files
# Root .env (for Docker)
# back/.env (for local dev)

# Start with Docker
npm run docker:start

# OR run locally
cd back && npm run dev
cd front && npm run dev
```

### Enable AI Features (Optional)

See [VISION_SETUP.md]

**Note**: App works without Vision API - AI analysis is simply skipped if not configured.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB
- **AI**: Google Cloud Vision API
- **Geolocation**: Browser Geolocation API

## Analytics

Admin dashboard provides:
- Total issues, users, offices
- Issues by status and priority
- Issues by office location
- Average resolution time
- **Geographic data** (issues with/without location)
- Recent issues feed

## User Roles

1. **Standard User**: Report issues, chat with service desk
2. **Service Desk**: View all issues, update status, respond to chats
3. **Admin**: Full access + user management + analytics
