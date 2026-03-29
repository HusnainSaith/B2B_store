#!/bin/bash
set -euo pipefail

echo "=== Setting up swap ==="
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    sudo sysctl vm.swappiness=10
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    echo "Swap created"
fi

echo "=== Installing Docker ==="
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc > /dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu

sudo tee /etc/docker/daemon.json > /dev/null << 'DOCKEREOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
DOCKEREOF
sudo systemctl restart docker

echo "=== Installing Nginx ==="
sudo DEBIAN_FRONTEND=noninteractive apt install -y nginx rsync awscli

echo "=== Creating directories ==="
sudo mkdir -p /var/www/customer-portal /var/www/admin-portal /var/www/seller-portal
mkdir -p ~/zerox-store ~/backups
sudo chown -R www-data:www-data /var/www/customer-portal /var/www/admin-portal /var/www/seller-portal

echo "=== Configuring Nginx ==="
sudo rm -f /etc/nginx/sites-enabled/default

sudo tee /etc/nginx/conf.d/gzip.conf > /dev/null << 'GZIPEOF'
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_min_length 256;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml application/xml+rss image/svg+xml;
GZIPEOF

for dir in customer-portal admin-portal seller-portal; do
    echo "<h1>$dir - deploy pending</h1>" | sudo tee /var/www/$dir/index.html > /dev/null
done

echo "=== Configuring Firewall ==="
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8081/tcp
sudo ufw --force enable

echo "=== SETUP COMPLETE ==="
free -h
docker --version
nginx -v
