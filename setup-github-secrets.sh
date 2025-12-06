#!/bin/bash
# Script to add GitHub secrets for deployment
# Requires: GitHub Personal Access Token with 'repo' and 'workflow' scopes

REPO="philipposk/School"
GITHUB_TOKEN=""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}GitHub Secrets Setup for ${REPO}${NC}"
echo ""

# Check if token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Error: GitHub token not set${NC}"
    echo ""
    echo "To use this script:"
    echo "1. Create a GitHub Personal Access Token:"
    echo "   https://github.com/settings/tokens/new"
    echo "   Required scopes: 'repo' and 'workflow'"
    echo ""
    echo "2. Run this script with:"
    echo "   GITHUB_TOKEN=your_token_here ./setup-github-secrets.sh"
    echo ""
    echo "Or manually add secrets at:"
    echo "   https://github.com/${REPO}/settings/secrets/actions"
    exit 1
fi

# Function to add secret
add_secret() {
    local secret_name=$1
    local secret_value=$2
    
    echo -e "${YELLOW}Adding secret: ${secret_name}${NC}"
    
    # Use GitHub API to add secret
    response=$(curl -s -w "\n%{http_code}" -X PUT \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/${REPO}/actions/secrets/${secret_name}" \
        -d "{\"encrypted_value\":\"$(echo -n \"${secret_value}\" | base64)\"}")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "201" ] || [ "$http_code" = "204" ]; then
        echo -e "${GREEN}✓ Secret '${secret_name}' added successfully${NC}"
    else
        echo -e "${RED}✗ Failed to add secret '${secret_name}' (HTTP ${http_code})${NC}"
        echo "Response: $(echo "$response" | head -n-1)"
    fi
}

# Prompt for FTP details
echo "Please provide your FTP server details:"
echo ""
read -p "FTP Server (e.g., ftp.school.6x7.gr or IP): " FTP_SERVER
read -p "FTP Username: " FTP_USERNAME
read -sp "FTP Password: " FTP_PASSWORD
echo ""

# Add secrets
echo ""
echo "Adding secrets to GitHub..."
add_secret "FTP_SERVER" "$FTP_SERVER"
add_secret "FTP_USERNAME" "$FTP_USERNAME"
add_secret "FTP_PASSWORD" "$FTP_PASSWORD"

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Your secrets have been added. The GitHub Actions workflow will now"
echo "automatically deploy to school.6x7.gr when you push to the main branch."

