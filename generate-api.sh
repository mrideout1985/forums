#!/usr/bin/env bash
# Generates from backend/src/main/resources/static/openapi.yml:
#   Java models    → backend/target/generated-sources/openapi/com/rideout/forums/model/
#   TypeScript API → frontend/app/generated/apis/ and frontend/app/generated/models/
#
# Usage:
#   npm run generate:api      (from project root)
#   bash generate-api.sh      (directly)
#
# Requires: Java 21+, Maven

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Generating API models and TypeScript client from openapi.yml..."

cd "$SCRIPT_DIR/backend"
mvn generate-sources -q

echo "Done."
echo "  Java models  → backend/target/generated-sources/openapi/com/rideout/forums/model/"
echo "  TypeScript   → frontend/app/generated/apis/ and frontend/app/generated/models/"
