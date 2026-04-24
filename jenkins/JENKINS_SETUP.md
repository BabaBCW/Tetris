# Jenkins Setup Guide — Tetris DevSecOps Pipeline

## Option A — Run Jenkins via Docker (Recommended)

### Prerequisites
- Docker Desktop running
- Ports 8081 and 50000 free

### Step 1 — Start Jenkins

```bash
cd jenkins/
docker-compose up -d
```

Jenkins will be available at: http://localhost:8081

### Step 2 — Get the initial admin password

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Copy the password, paste it into the browser at http://localhost:8081

### Step 3 — Install suggested plugins
Click "Install suggested plugins" and wait for installation to complete.

### Step 4 — Create admin user
Fill in your username, password, and email.

---

## Option B — Run Jenkins on Windows (Native)

### Step 1 — Download Jenkins
Go to https://www.jenkins.io/download/ and download the Windows installer (.msi)

### Step 2 — Install
Run the .msi, choose port 8080 (or 8081), install as Windows Service.

### Step 3 — Install Node.js on Jenkins agent
Jenkins needs Node.js to run `npm install` and `npm test`.
Go to: Manage Jenkins → Tools → NodeJS → Add NodeJS → pick version 18.

---

## Configure Jenkins for the Tetris Pipeline

### Step 5 — Add Docker Hub credentials

1. Go to: **Manage Jenkins → Credentials → Global → Add Credentials**
2. Kind: **Username with password**
3. Username: `shivankpateriya` (your Docker Hub username)
4. Password: your Docker Hub password or access token
5. ID: `dockerhub-credentials`  ← must match Jenkinsfile exactly
6. Click Save

### Step 6 — Install required plugins

Go to: **Manage Jenkins → Plugins → Available plugins**

Install these:
- Git plugin (usually pre-installed)
- Pipeline (usually pre-installed)
- NodeJS Plugin
- Docker Pipeline
- Workspace Cleanup Plugin
- Timestamper

### Step 7 — Configure NodeJS tool

Go to: **Manage Jenkins → Tools → NodeJS installations → Add NodeJS**
- Name: `NodeJS-18`
- Version: 18.x

### Step 8 — Create the Pipeline job

1. Click **New Item**
2. Name: `tetris-devsecops`
3. Type: **Pipeline**
4. Click OK

### Step 9 — Configure the Pipeline

In the job config:

**Build Triggers:**
- Check: **GitHub hook trigger for GITScm polling**

**Pipeline section:**
- Definition: **Pipeline script from SCM**
- SCM: **Git**
- Repository URL: `https://github.com/<your-username>/tetris-devsecops`
- Branch: `*/main`
- Script Path: `Jenkinsfile`

Click **Save**.

### Step 10 — Run the pipeline

Click **Build Now** to trigger your first build.

Watch the stages in **Blue Ocean** (install the Blue Ocean plugin for a better UI).

---

## GitHub Webhook Setup (auto-trigger on push)

1. Go to your GitHub repo → Settings → Webhooks → Add webhook
2. Payload URL: `http://<your-jenkins-ip>:8081/github-webhook/`
3. Content type: `application/json`
4. Events: **Just the push event**
5. Click Add webhook

> Note: Jenkins must be publicly accessible for GitHub webhooks.
> For local testing, use **ngrok**: `ngrok http 8081`
> Then use the ngrok URL as the webhook payload URL.

---

## Expected Pipeline Output

```
Started by user admin
[Pipeline] Start of Pipeline
[Pipeline] stage (Checkout)
Checking out source code
[Pipeline] stage (Install Dependencies)
npm ci
[Pipeline] stage (Run Tests)
npm test  ✓  14 tests passed
[Pipeline] stage (Docker Build)
Building Docker image: shivankpateriya/tetris-devsecops:42
[Pipeline] stage (Trivy Scan)
Scanning for vulnerabilities...
LOW: 3, MEDIUM: 1, HIGH: 0, CRITICAL: 0  ✓
[Pipeline] stage (Push to Docker Hub)
Pushing shivankpateriya/tetris-devsecops:42
Pushing shivankpateriya/tetris-devsecops:latest
[Pipeline] stage (Cleanup)
Removing local images
[Pipeline] End of Pipeline
BUILD SUCCESS
```
