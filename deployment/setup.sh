#!/bin/bash

# Update system
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 18
nvm use 18

# Install Nginx
sudo yum install nginx -y

# Create Nginx configuration
cp deployment/h2h.conf /etc/nginx/conf.d/h2h.conf

# Install PM2
npm install -g pm2

# Install Git
sudo yum install git -y

# Clone your repository
git clone https://ShidemantleJ:{REPLACE_WITH_GITHUB_PAT}@github.com/ShidemantleJ/h2h.git
cd h2h

# Setup backend
cd h2hbackend
npm install
pm2 start index.js --name h2hbackend

# Setup frontend
cd ../h2hweb
npm install
npm run build
pm2 serve dist 3000 --name h2hweb

# Start PM2 on system boot
pm2 startup
pm2 save