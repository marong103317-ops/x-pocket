#!/bin/bash
# Package the extension as a .zip for distribution
set -e

echo "==> Building..."
pnpm build

echo "==> Packaging..."
cd dist
zip -r ../x-pocket.zip .
cd ..

echo "==> Done: x-pocket.zip ($(du -h x-pocket.zip | cut -f1))"
