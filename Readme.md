# Feedback App Form
A simple feedback collection app with star ratings, analytics, and sort — built with HTML, CSS, JS, and Node.js.
## Folder Structure
feedback-app/
├── index.html    ← UI (form, analytics, feedback list)
├── style.css     ← All styles
├── app.js        ← Frontend logic
└── server.js     ← Node.js backend (Express)
## Run Locally
### 1. Install dependencies
npm init -y
npm install express cors
### 2. Start the server
node server.js
Server runs at: `http://localhost:port`
### 3. Open the app
Open `index.html` in your browser directly (double-click or use Live Server in VS Code).
## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/submit-feedback` | Save a new feedback |
| GET | `/feedbacks` | Get all feedback + analytics |
## Deploy to IBM Cloud (Cloud Foundry)
### Step 1 — Install IBM Cloud CLI
Download from: https://cloud.ibm.com/docs/cli
ibmcloud --version
### Step 2 — Log in to IBM Cloud
ibmcloud login
If you use SSO (single sign-on):
ibmcloud login --sso
Then target an org and space:
ibmcloud target --cf
### Step 3 — Add a `manifest.yml` file
Create a file called `manifest.yml` in your project root:
applications:
  - name: feedback-app
    memory: 128M
    instances: 1
    buildpack: nodejs_buildpack
    command: node server.js
### Step 4 — Add a `Procfile`
Create a file called `Procfile`:
web: node server.js
### Step 5 — Update `package.json`
Make sure it has a start script:
{
  "scripts": {
    "start": "node server.js"
  }
}
### Step 6 — Push the app
ibmcloud cf push feedback-app
IBM Cloud will:
- Detect Node.js automatically
- Install your npm packages
- Start the server
### Step 7 — Get your live URL
After deployment, IBM Cloud gives you a URL like:
https://feedback-app.mybluemix.net
Update the `BASE` variable in `app.js`:
const BASE = 'https://feedback-app.mybluemix.net';
## Notes
- Feedback is stored **in memory** (array). It resets when the server restarts.
- For persistent storage on IBM Cloud, connect **IBM Cloudant** (NoSQL database) or **IBM Db2**.
- To keep `index.html` working on IBM Cloud, either serve it via Express or host it on **IBM Cloud Object Storage**.
### Serve index.html via Express (recommended for IBM Cloud)
Add this to `server.js`:
const path = require('path');
app.use(express.static(path.join(__dirname)));
Then your app opens at `https://your-app.mybluemix.net/index.html`.
## IBM Tool Integration — Option C Summary
This app is deployed using **IBM Cloud Foundry**, a Platform-as-a-Service (PaaS).  
No server setup needed — IBM manages the runtime, scaling, and availability.  
Future additions: **IBM Cloudant** for database, **IBM Watson Assistant** for chatbot-based feedback collection.
