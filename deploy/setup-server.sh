#!/bin/bash
# =====================================================
# Zerox-Store — EC2 Server Setup (Ubuntu 24.04)
# =====================================================
# Designed for IP-based deployment (no domain yet).
# When domain is purchased, add Certbot and switch to subdomain routing.
# =====================================================
set -euo pipefail

echo "============================================="
echo " Zerox-Store Server Setup (IP-based)"
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
# 5. Install utilities
# -------------------------------------------
apt install -y rsync unzip awscli

# -------------------------------------------
# 6. Create directories
# -------------------------------------------
echo ">>> Creating directories..."
mkdir -p /var/www/customer-portal
mkdir -p /var/www/admin-portal
mkdir -p /home/ubuntu/zerox-store
mkdir -p /home/ubuntu/backups

chown -R www-data:www-data /var/www/customer-portal /var/www/admin-portal
chown -R ubuntu:ubuntu /home/ubuntu/zerox-store /home/ubuntu/backups

# -------------------------------------------
# 7. Configure Nginx
# -------------------------------------------
echo ">>> Configuring Nginx..."

# Remove default site
rm -f /etc/nginx/sites-enabled/default

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

# Copy site config (single consolidated config for IP-based)
cp /home/ubuntu/deploy/nginx/zerox.conf /etc/nginx/sites-available/zerox.conf
ln -sf /etc/nginx/sites-available/zerox.conf /etc/nginx/sites-enabled/

# Create placeholder index for each portal
for dir in customer-portal admin-portal; do
    echo "<h1>$dir — deploy pending</h1>" > /var/www/$dir/index.html
done

nginx -t && systemctl reload nginx

# -------------------------------------------
# 8. Firewall (UFW)
# -------------------------------------------
echo ">>> Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 8080/tcp
ufw allow 8081/tcp
ufw --force enable

# -------------------------------------------
# 9. Database backup cron
# -------------------------------------------
echo ">>> Setting up daily backup cron..."
if [ -f /home/ubuntu/deploy/backup-db.sh ]; then
    cp /home/ubuntu/deploy/backup-db.sh /home/ubuntu/backup-db.sh
    chmod +x /home/ubuntu/backup-db.sh
    chown ubuntu:ubuntu /home/ubuntu/backup-db.sh
    (crontab -u ubuntu -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/backups/backup.log 2>&1") | crontab -u ubuntu -
fi

# -------------------------------------------
# Done
# -------------------------------------------
echo ""
echo "============================================="
echo " Setup Complete!"
echo "============================================="
echo ""
echo " Access:"
echo "   Customer Portal: http://$(curl -s ifconfig.me)"
echo "   Admin Portal:    http://$(curl -s ifconfig.me):8080"
echo "   API Health:      http://$(curl -s ifconfig.me)/api/health"
echo ""
echo " Next: Push to main branch to trigger GitHub Actions deployment"
echo " First deploy: run seeds with:"
echo "   cd ~/zerox-store && docker compose --profile seed run --rm seed"
echo ""
