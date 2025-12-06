#!/bin/bash
# Production Build Script for School 2

echo "🔨 Building School 2 for Production..."

# Create dist directory
mkdir -p dist

# Copy all files
cp -r course dist/
cp -r css dist/
cp -r js dist/
cp index.html dist/
cp README.md dist/
cp FEATURES.md dist/

# Minify JavaScript (if terser is available)
if command -v terser &> /dev/null; then
    echo "📦 Minifying JavaScript..."
    for file in dist/js/*.js; do
        if [ -f "$file" ]; then
            terser "$file" -o "$file" --compress --mangle
        fi
    done
else
    echo "⚠️  Terser not found. Install with: npm install -g terser"
    echo "   Skipping JavaScript minification..."
fi

# Minify CSS (if csso is available)
if command -v csso &> /dev/null; then
    echo "📦 Minifying CSS..."
    for file in dist/css/*.css; do
        if [ -f "$file" ]; then
            csso "$file" --output "$file"
        fi
    done
else
    echo "⚠️  CSSO not found. Install with: npm install -g csso-cli"
    echo "   Skipping CSS minification..."
fi

# Remove console.log statements (basic)
echo "🧹 Cleaning console statements..."
find dist/js -name "*.js" -type f -exec sed -i '' 's/console\.log([^)]*);//g' {} \;

# Create production index.html (remove debug mode)
echo "📝 Creating production index.html..."
sed 's/window.DEBUG_MODE = true/window.DEBUG_MODE = false/g' dist/index.html > dist/index.html.tmp
mv dist/index.html.tmp dist/index.html

echo "✅ Production build complete!"
echo "📁 Output: dist/"
echo ""
echo "To deploy:"
echo "  1. Upload dist/ folder to your hosting"
echo "  2. Configure HTTPS/SSL"
echo "  3. Set up domain and DNS"
echo ""
echo "⚠️  Remember to:"
echo "  - Add Privacy Policy"
echo "  - Add Terms of Service"
echo "  - Implement GDPR cookies banner"
echo "  - Set up monitoring"

