#!/bin/bash
# Build multi-arch (arm64 + amd64) et push vers Docker Hub
# Usage: DOCKERHUB_USER=ton-username ./build-multiarch.sh

set -e

DOCKERHUB_USER="${DOCKERHUB_USER:?Définir DOCKERHUB_USER (ex: export DOCKERHUB_USER=monuser)}"
IMAGE_NAME="bend-racing"
TAG="${TAG:-latest}"
FULL_IMAGE="${DOCKERHUB_USER}/${IMAGE_NAME}:${TAG}"

echo "Build multi-arch: ${FULL_IMAGE}"
echo "Platforms: linux/amd64, linux/arm64"
echo ""

# Créer un builder buildx si nécessaire
docker buildx create --use --name multiarch-builder 2>/dev/null || docker buildx use multiarch-builder

# Build et push (les deux arch en une fois)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag "${FULL_IMAGE}" \
  --push \
  --file Dockerfile \
  .

echo ""
echo "✅ Image poussée vers Docker Hub: ${FULL_IMAGE}"
echo "   docker pull ${FULL_IMAGE}"
echo ""
echo "Pour K8s, mettre à jour deployment.yaml avec:"
echo "   image: ${DOCKERHUB_USER}/${IMAGE_NAME}:${TAG}"
