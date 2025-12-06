# Enable GitHub Pages - Step by Step

## Method 1: Via GitHub Settings (Easiest)

1. **Go to your repository**: https://github.com/philipposk/School
2. **Click "Settings"** (top right of repository page)
3. **Click "Pages"** in the left sidebar
4. **Under "Build and deployment"**:
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `main` and `/ (root)`
   - Click **Save**

5. **Wait 1-2 minutes** - GitHub will build your site
6. Your site will be at: `https://philipposk.github.io/School/`

## Method 2: Using GitHub Actions (If Method 1 doesn't work)

If you see "There isn't a GitHub Pages site here" or Settings → Pages is disabled:

1. **Add the workflow file manually**:
   - Go to: https://github.com/philipposk/School/new/main
   - Path: `.github/workflows/github-pages.yml`
   - Copy the content from the file I created
   - Click "Commit new file"

2. **Enable Pages**:
   - Go to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save

## Important Notes:

- **Repository must be Public** OR you need GitHub Pro/Team for private repos
- After enabling, wait 1-2 minutes for first deployment
- Check the "Actions" tab to see deployment status
- The `CNAME` file is already in your repo for custom domain

## After Pages is Enabled:

1. Go to Settings → Pages
2. Under "Custom domain", enter: `school.6x7.gr`
3. Check "Enforce HTTPS"
4. Update DNS in Papaki (add CNAME: school → philipposk.github.io)

