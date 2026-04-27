#!/bin/bash
# ============================================================
# 🚀 Phase 4 — Tetris K8s Deploy Script
# Cluster : Omni prod-cluster
# Domain  : tetris.bababakchodiwale.in (via Cloudflare Tunnel)
# Image   : shivankpateriya/tetris-devsecops:latest
# ============================================================

set -e  # Exit on any error

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " STEP 1 — Verify kubectl is connected"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl cluster-info
kubectl get nodes -o wide

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " STEP 2 — Verify NGINX ingress is running"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " STEP 3 — Apply all K8s manifests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl apply -f namespace.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " STEP 4 — Wait for pods to be ready"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl rollout status deployment/tetris -n tetris --timeout=120s

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " STEP 5 — Verify everything is running"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Pods:"
kubectl get pods -n tetris -o wide

echo ""
echo "🌐 Service:"
kubectl get svc -n tetris

echo ""
echo "🔀 Ingress:"
kubectl get ingress -n tetris
kubectl describe ingress tetris-ingress -n tetris

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " STEP 6 — Check pod logs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl logs -l app=tetris -n tetris --tail=20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " ✅ Phase 4 manifests applied!"
echo ""
echo " 👉 FINAL STEP (manual — in Cloudflare Dashboard):"
echo "    Tunnel : BabaBakChodiWale_Prox"
echo "    Route  : tetris.bababakchodiwale.in"
echo "    Service: http://192.168.29.76"
echo ""
echo " 🎮 Then visit: http://tetris.bababakchodiwale.in"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
