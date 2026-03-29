#!/bin/bash
# =====================================================
# Zerox-Store — EC2 Server Setup (Ubuntu 24.04)
# =====================================================
# Run once on a fresh EC2 instance:
#   scp -r deploy/ ubuntu@<EC2_IP>:~/
#   ssh ubuntu@<EC2_IP>
#   sudo bash ~/deploy/setup-server.sh
#
# Prerequisites: DNS A/CNAME records must already point to this server.
# =====================================================
set -euo pipefail

DOMAIN="zaroox.com"
CERTBOT_EMAIL="admin@zaroox.com"

echo "============================================="
echo " Zerox-Store Server Setup"
echo " Domain: $DOMAIN"
echo "============================================="

# -------------------------------------------
# 1. System update
# -------------------------------------------
echo ">>> Updating system packages..."
apt update && apt upgrade -y

# -------------------------------------------
# 2. Swap space (critical for 2 GB RAM)
# -------------------------------------------
echo ">>> Setting up 2 GB swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
fi

# -------------------------------------------
# 3. Install Docker
# -------------------------------------------
echo ">>> Installing Docker..."
apt install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
usermod -aG docker ubuntu

# Docker log rotation (prevents disk filling on 30 GB EBS)
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
systemctl restart docker

# -------------------------------------------
# 4. Install Nginx
# -------------------------------------------
echo ">>> Installing Nginx..."
apt install -y nginx

# -------------------------------------------
# 5. Install Certbot
# -------------------------------------------
echo ">>> Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# -------------------------------------------
# 6. Install utilities
# -------------------------------------------
apt install -y rsync unzip awscli

# -------------------------------------------
# 7. Create directories
# -------------------------------------------
echo ">>> Creating directories..."
mkdir -p /var/www/customer-portal
mkdir -p /var/www/admin-portal
mkdir -p /var/www/seller-portal
mkdir -p /home/ubuntu/zerox-store
mkdir -p /home/ubuntu/backups

chown -R www-data:www-data /var/www/customer-portal /var/www/admin-portal /var/www/seller-portal
chown -R ubuntu:ubuntu /home/ubuntu/zerox-store /home/ubuntu/backups

# -------------------------------------------
# 8. Configure Nginx
# -------------------------------------------
echo ">>> Configuring Nginx..."

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# WebSocket upgrade map (needed for Socket.IO proxy)
cat > /etc/nginx/conf.d/websocket-upgrade.conf << 'EOF'
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
EOF

# Gzip compression for frontend assets
cat > /etc/nginx/conf.d/gzip.conf << 'EOF'
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_min_length 256;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml
    application/xml+rss
    image/svg+xml;
EOF

# Copy site configs
cp /home/ubuntu/deploy/nginx/*.conf /etc/nginx/sites-available/

# Enable all sites
ln -sf /etc/nginx/sites-available/zaroox.com.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/admin.zaroox.com.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/seller.zaroox.com.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api.zaroox.com.conf /etc/nginx/sites-enabled/

# Create placeholder index for each portal (so Nginx starts clean)
for dir in customer-portal admin-portal seller-portal; do
    echo "<h1>$dir — deploy pending</h1>" > /var/www/$dir/index.html
done

nginx -t && systemctl reload nginx

# -------------------------------------------
# 9. Firewall (UFW)
# -------------------------------------------
echo ">>> Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# -------------------------------------------
# 10. SSL Certificates
# -------------------------------------------
echo ">>> Obtaining SSL certificates..."
echo "   Make sure DNS records are already pointing to this server!"
certbot --nginx \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d admin.$DOMAIN \
    -d seller.$DOMAIN \
    -d api.$DOMAIN \
    --non-interactive --agree-tos -m $CERTBOT_EMAIL

# Auto-renewal is enabled by default via systemd timer
systemctl enable certbot.timer

# -------------------------------------------
# 11. Database backup cron
# -------------------------------------------
echo ">>> Setting up daily backup cron..."
cp /home/ubuntu/deploy/backup-db.sh /home/ubuntu/backup-db.sh
chmod +x /home/ubuntu/backup-db.sh
# Daily at 2:00 AM UTC
(crontab -u ubuntu -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/backups/backup.log 2>&1") | crontab -u ubuntu -

# -------------------------------------------
# Done
# -------------------------------------------
echo ""
echo "============================================="
echo " Setup Complete!"
echo "============================================="
echo ""
echo " Next steps:"
echo "  1. Add these GitHub repository secrets:"
echo "     - EC2_HOST     (this server's public IP)"
echo "     - EC2_SSH_KEY  (SSH private key for 'ubuntu' user)"
echo "     - PRODUCTION_ENV (full .env contents — see .env.production.example)"
echo ""
echo "  2. Push to main branch to trigger the first deployment"
echo ""
echo "  3. After first deploy, run database seeds:"
echo "     cd ~/zerox-store && docker compose --profile seed run --rm seed"
echo ""
echo "  4. Verify:"
echo "     curl https://api.zaroox.com/health"
echo "     curl https://zaroox.com"
echo "     curl https://admin.zaroox.com"
echo "     curl https://seller.zaroox.com"
echo ""
