# TagAlong — Docker + Azure Container Deployment Guide

> **Strategy:** Build Docker image → Push to Azure Container Registry → Deploy to Azure Container Apps
> **Cost:** ~₹0–200/month (covered by Azure Students $100 credits)

---

## Architecture

```mermaid
graph LR
  A[User Browser] -->|HTTPS| B[Azure Container Apps]
  B --> C[Docker Container]
  C --> D[Node.js + React Static Files]
  D --> E[MongoDB Atlas]
  D --> F[Socket.IO WebSockets]
```

---

## Phase 1: Install Prerequisites

### 1.1 Docker Desktop
1. Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Install and **restart your PC**
3. Open Docker Desktop — wait for the whale icon to turn green
4. Verify in PowerShell:
```powershell
docker --version
```

### 1.2 Azure CLI (skip if already installed)
```powershell
az --version
az login
```

---

## Phase 2: Build & Test Docker Image Locally

### 2.1 Build the image
```powershell
cd "d:\Project\TagAlong-main"
docker build -t tagalong:latest .
```

> This takes 3–5 minutes on first build (downloads Node 20, installs deps, builds React).

### 2.2 Test locally
```powershell
docker run -p 5000:5000 tagalong:latest
```

Open [http://localhost:5000](http://localhost:5000) — you should see your app!

Press `Ctrl+C` to stop the container.

---

## Phase 3: Create Azure Container Registry (ACR)

ACR stores your Docker images in the cloud.

```powershell
# Create ACR (Basic tier = ~$5/month, covered by credits)
az acr create --name tagalongregistry --resource-group tagalong-rg --sku Basic --admin-enabled true
```

> [!IMPORTANT]
> ACR names must be **globally unique** and **alphanumeric only** (no hyphens). If `tagalongregistry` is taken, try `tagalongregistry123`.

### 3.1 Get ACR credentials
```powershell
az acr credential show --name tagalongregistry --resource-group tagalong-rg
```

Save the `username` and `password` from the output.

---

## Phase 4: Push Docker Image to ACR

### 4.1 Login to ACR
```powershell
az acr login --name tagalongregistry
```

### 4.2 Tag and push the image
```powershell
docker tag tagalong:latest tagalongregistry.azurecr.io/tagalong:latest
docker push tagalongregistry.azurecr.io/tagalong:latest
```

> First push takes 2–3 minutes (uploads ~200MB).

---

## Phase 5: Deploy to Azure Container Apps

Container Apps is the cheapest option — it has a **free monthly grant** (180,000 vCPU-seconds).

### 5.1 Install the Container Apps extension
```powershell
az extension add --name containerapp --upgrade
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
```

### 5.2 Create Container Apps Environment
```powershell
az containerapp env create --name tagalong-env --resource-group tagalong-rg --location centralindia
```

### 5.3 Get your ACR credentials
```powershell
$acrPassword = az acr credential show --name tagalongregistry --query "passwords[0].value" -o tsv
```

### 5.4 Deploy the container
```powershell
az containerapp create `
  --name tagalong `
  --resource-group tagalong-rg `
  --environment tagalong-env `
  --image tagalongregistry.azurecr.io/tagalong:latest `
  --registry-server tagalongregistry.azurecr.io `
  --registry-username tagalongregistry `
  --registry-password $acrPassword `
  --target-port 5000 `
  --ingress external `
  --min-replicas 0 `
  --max-replicas 1 `
  --cpu 0.5 `
  --memory 1.0Gi `
  --env-vars `
    NODE_ENV=production `
    PORT=5000 `
    JWT_SECRET=your_super_secret_key `
    ENCRYPTION_KEY=x4WrBoMP+wsrOLONxAzjthiid7UGlHeOguRmrwwfJXj93RJcalc+kzTTizFPqRbX `
    STRIPE_SECRET_KEY=sk_test_51RUPzaHBpdBOgzxCtPqdopOxnsHa90ccfXjKT0sz3wdx8k2Qd9trBRjaMueFk4SGOQqfKc5GIgmjRmbXlYoBqeHJ00CKIMAjva
```

### 5.5 Set MONGO_URI separately (because of the & character)

Set this via **Azure Portal** to avoid PowerShell escaping issues:
1. Go to [portal.azure.com](https://portal.azure.com)
2. Search for **"tagalong"** → click your Container App
3. **Settings** → **Containers** → **Environment variables**
4. Click **Edit and deploy** → Under environment variables click **+ Add**
5. Name: `MONGO_URI`
6. Source: `Manual`  
7. Value: `mongodb+srv://vedantpatelvp04:Vrprrp26@tagalong.d8eeuhi.mongodb.net/?retryWrites=true&w=majority&appName=tagalong`
8. Click **Save** → **Create**

### 5.6 Get your app URL
```powershell
az containerapp show --name tagalong --resource-group tagalong-rg --query "properties.configuration.ingress.fqdn" -o tsv
```

Your app is live at: `https://tagalong.<random>.centralindia.azurecontainerapps.io`

---

## Phase 6: MongoDB Atlas — Allow Azure IPs

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Your cluster → **Network Access** → **Add IP Address**
3. Click **"Allow Access from Anywhere"** (sets `0.0.0.0/0`)
4. Click **Confirm**

---

## Phase 7: Verify Deployment

1. Open your app URL from Phase 5.6
2. Test: Login, Search trips, Chat (WebSocket), Profile page
3. If issues, check logs:
```powershell
az containerapp logs show --name tagalong --resource-group tagalong-rg --type console
```

---

## Redeploying After Code Changes

Whenever you make changes, run this workflow:

```powershell
cd "d:\Project\TagAlong-main"

# 1. Rebuild Docker image
docker build -t tagalong:latest .

# 2. Tag and push to ACR
docker tag tagalong:latest tagalongregistry.azurecr.io/tagalong:latest
docker push tagalongregistry.azurecr.io/tagalong:latest

# 3. Update the container app
az containerapp update --name tagalong --resource-group tagalong-rg --image tagalongregistry.azurecr.io/tagalong:latest
```

---

## Cost Breakdown (Azure Students — $100 credits)

| Resource | Monthly Cost |
|----------|-------------|
| Container Apps (0.5 vCPU, 1GB) | ~₹0–400 (free grant covers low traffic) |
| Container Registry (Basic) | ~₹400 (~$5) |
| MongoDB Atlas (M0) | Free |
| **Total** | **~₹400–800/month** (covered by $100 credits) |

> [!TIP]
> With `--min-replicas 0`, the container scales to zero when nobody is using it — you're only charged when the app is actually running. This maximizes your credit usage.

---

## Cleanup (when you're done)

To delete everything and stop charges:
```powershell
az group delete --name tagalong-rg --yes --no-wait
```
