# GitHub Pages Setup for school.6x7.gr

## Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/philipposk/School
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **Save**

Your site will be available at: `https://philipposk.github.io/School/`

## Step 2: Configure Custom Domain (school.6x7.gr)

1. Still in **Settings** → **Pages**
2. Under **Custom domain**, enter: `school.6x7.gr`
3. Check **Enforce HTTPS** (after DNS propagates)
4. Click **Save**

## Step 3: Update DNS in Papaki

Go to your Papaki DNS management for `6x7.gr` and add these records:

### Option A: Using A Records (Recommended)
Add 4 A records for `school` subdomain:
- **Type**: A
- **Host**: `school`
- **Value**: `185.199.108.153`
- **Value**: `185.199.109.153`
- **Value**: `185.199.110.153`
- **Value**: `185.199.111.153`

### Option B: Using CNAME (Simpler)
Add 1 CNAME record:
- **Type**: CNAME
- **Host**: `school`
- **Value**: `philipposk.github.io`

Wait 5-30 minutes for DNS to propagate, then your site will be live at `https://school.6x7.gr`!

## Troubleshooting

- If site doesn't load: Wait for DNS propagation (can take up to 24 hours)
- Check DNS: Use https://dnschecker.org to verify DNS propagation
- GitHub Pages status: Check Actions tab to see if deployment succeeded

