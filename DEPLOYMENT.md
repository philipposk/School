# Deployment Guide for school.6x7.gr

## Option 1: GitHub Actions (Automatic Deployment)

The repository includes a GitHub Actions workflow that will automatically deploy to your server when you push to the `main` branch.

### Setup:

1. Go to your GitHub repository: https://github.com/philipposk/School
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:
   - `FTP_SERVER`: Your FTP server address (e.g., `ftp.school.6x7.gr` or IP address)
   - `FTP_USERNAME`: Your FTP username
   - `FTP_PASSWORD`: Your FTP password

4. Push to main branch - deployment will happen automatically!

## Option 2: Manual FTP Deployment

### Using FTP Client (FileZilla, Cyberduck, etc.)

1. Connect to your FTP server:
   - Host: `ftp.school.6x7.gr` (or your server IP)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (or 22 for SFTP)

2. Navigate to your web root directory (usually `/public_html/` or `/www/` or `/htdocs/`)

3. Upload all files EXCEPT:
   - `.git/` folder
   - `.github/` folder
   - `README.md` and other `.md` files (optional)
   - `School/` folder (if it's not needed)

4. Ensure `index.html` is in the root directory

## Option 3: SSH/SCP Deployment

If you have SSH access:

```bash
# From your local machine
cd "/Users/phktistakis/Devoloper Projects/School"

# Create a deployment package (excluding unnecessary files)
rsync -avz --exclude '.git' --exclude '.github' --exclude '*.md' \
  --exclude 'School/' ./ user@school.6x7.gr:/path/to/web/root/
```

Or using SCP:

```bash
# Copy files to server
scp -r index.html css/ js/ course* legal/ user@school.6x7.gr:/path/to/web/root/
```

## Option 4: Using Build Script

Run the production build script first:

```bash
./build-production.sh
```

This creates a `dist/` folder with optimized files. Then upload the contents of `dist/` to your server.

## Post-Deployment Checklist

- [ ] Verify `index.html` loads correctly
- [ ] Test all course modules
- [ ] Check that CSS and JS files load
- [ ] Verify quizzes work
- [ ] Test on mobile devices
- [ ] Check HTTPS/SSL certificate
- [ ] Verify domain DNS settings
- [ ] Test API functionality (if using AI features, users need to add their own API keys)

## Troubleshooting

### Files not loading?
- Check file permissions (should be 644 for files, 755 for directories)
- Verify paths in `index.html` are correct (should be relative paths)
- Check server error logs

### CORS issues?
- Ensure your server allows CORS if making external API calls
- Check browser console for specific errors

### API keys not working?
- Users need to add their own API keys via the settings panel
- The default keys have been removed for security

## Server Requirements

- Web server (Apache, Nginx, etc.)
- PHP not required (static site)
- HTTPS/SSL recommended
- Modern browser support (Chrome, Firefox, Safari, Edge)

