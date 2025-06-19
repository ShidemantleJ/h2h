#!/bin/bash

# Update system
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 18
nvm use 18

# Install PM2
npm install -g pm2

# Install Git
sudo yum install -y git

# Install Nginx and copy config
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo cp h2h/deployment/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx

# Install and set up certbot
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d h2hcube.com -d www.h2hcube.com -d api.h2hcube.com
sudo certbot renew --dry-run
sudo systemctl start certbot-renew.timer

# Clone your repository
git clone https://github.com/ShidemantleJ/h2h.git
cd h2h

# Setup backend
cd ~/h2h/h2hbackend
npm install
pm2 start index.js --name h2hbackend

# Setup frontend
cd ~/h2h/h2hweb
npm install
npm run build
pm2 serve dist 3000 --name h2hweb

# Start PM2 on system boot
pm2 startup
pm2 save