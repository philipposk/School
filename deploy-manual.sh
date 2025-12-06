#!/bin/bash
# Manual deployment script for school.6x7.gr
# Run this script to prepare files for manual upload

echo "🚀 Preparing files for deployment to school.6x7.gr..."
echo ""

# Create deployment directory
DEPLOY_DIR="deploy-to-server"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy necessary files
echo "📦 Copying files..."
cp -r index.html "$DEPLOY_DIR/"
cp -r css "$DEPLOY_DIR/"
cp -r js "$DEPLOY_DIR/"
cp -r course "$DEPLOY_DIR/"
cp -r course-finance "$DEPLOY_DIR/"
cp -r course-ios "$DEPLOY_DIR/"
cp -r course-webdev "$DEPLOY_DIR/"
cp -r course-signlanguage "$DEPLOY_DIR/" 2>/dev/null || true
cp -r course-minds "$DEPLOY_DIR/" 2>/dev/null || true
cp -r course-vibecoding "$DEPLOY_DIR/" 2>/dev/null || true
cp -r legal "$DEPLOY_DIR/"
cp start.sh "$DEPLOY_DIR/" 2>/dev/null || true

# Exclude unnecessary files
echo "🧹 Cleaning up..."
find "$DEPLOY_DIR" -name ".git*" -type f -delete 2>/dev/null || true
find "$DEPLOY_DIR" -name "*.md" -type f -delete 2>/dev/null || true

echo ""
echo "✅ Files ready in: $DEPLOY_DIR/"
echo ""
echo "📤 Next steps:"
echo "1. Log in to Papaki File Manager"
echo "2. Navigate to public_html/ or www/ folder"
echo "3. Upload all files from $DEPLOY_DIR/ folder"
echo "4. Make sure index.html is in the root web directory"
echo ""
echo "Or use FTP client with your credentials to upload $DEPLOY_DIR/ contents"

