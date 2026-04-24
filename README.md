# Tetris — DevSecOps Edition

A fully playable Tetris game built as the application layer of a complete DevSecOps pipeline demo.

## Tech Stack
- **Frontend**: React 18 + Vite
- **Serving**: nginx (Alpine)
- **Container**: Docker (multi-stage build)
- **CI/CD**: GitHub Actions
- **Security**: Trivy + SonarQube
- **Deploy**: Kubernetes
- **GitOps**: ArgoCD
- **Monitoring**: Prometheus + Grafana

## Project Structure

```
tetris-devsecops/
├── src/
│   ├── components/
│   │   ├── Board.jsx          # SVG game board renderer
│   │   └── NextPiece.jsx      # Next piece preview
│   ├── hooks/
│   │   └── useGameState.js    # All game state + controls
│   ├── utils/
│   │   └── gameLogic.js       # Pure game logic (testable)
│   ├── App.jsx                # Root component
│   ├── App.css                # Retro arcade styles
│   └── main.jsx               # React entry point
├── tests/
│   └── gameLogic.test.js      # Unit tests (Vitest)
├── k8s/                       # Kubernetes manifests
├── .github/workflows/         # CI/CD pipeline
├── Dockerfile                 # Multi-stage Docker build
├── nginx.conf                 # SPA nginx config
├── vite.config.js
└── package.json
```

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev        # http://localhost:3000

# Run tests
npm test

# Build for production
npm run build
```

## Docker

```bash
# Build image
docker build -t tetris-devsecops:latest .

# Run container
docker run -p 8080:80 tetris-devsecops:latest

# Push to Docker Hub
docker tag tetris-devsecops:latest <your-username>/tetris-devsecops:latest
docker push <your-username>/tetris-devsecops:latest
```

## Game Controls

| Key | Action |
|-----|--------|
| ← → | Move piece |
| ↑ | Rotate |
| ↓ | Soft drop |
| Space | Hard drop |
| P | Pause |
