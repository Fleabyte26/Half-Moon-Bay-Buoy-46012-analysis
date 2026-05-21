
# WaveCast.ai

Advanced Marine ML Expedition Planner and Big Table Ingestion Engine.

## How to Push to GitHub
Run these commands in your IDE terminal to push your code. **Note: Do not include your PAT directly in the code or commit history.**

1. **Configure Git**:
   ```bash
   git init
   git config --global user.email "krishornung@gmail.com"
   git config --global user.name "Fleabyte26"
   ```

2. **Add Remote & Push**:
   ```bash
   # Replace <YOUR_PAT> with your actual token
   git remote add origin https://Fleabyte26:<YOUR_PAT>@github.com/Fleabyte26/Half-Moon-Bay-Buoy-46012-analysis.git
   git add .
   git commit -m "Build: Finalize WaveCast.ai architecture"
   git branch -M main
   git push -u origin main --force
   ```

## GCP & Kubernetes
This project includes a `Dockerfile` and `k8s/` manifests for deployment to GKE.
- **Domain**: wavecast.ai
- **TLS**: Managed by Google Cloud via `ingress.yaml` annotations.
