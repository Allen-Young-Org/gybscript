provider "tls" {}

provider "aws" {
  region = "us-west-2"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "gyb-staging-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table_association" "main_a" {
  subnet_id      = aws_subnet.main_a.id
  route_table_id = aws_route_table.main.id
}

resource "aws_route_table_association" "main_b" {
  subnet_id      = aws_subnet.main_b.id
  route_table_id = aws_route_table.main.id
}

resource "aws_subnet" "main_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block             = "10.0.1.0/24"
  availability_zone      = "us-west-2a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "main_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block             = "10.0.2.0/24"
  availability_zone      = "us-west-2b"
  map_public_ip_on_launch = true
}

resource "aws_security_group" "main" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

ingress {
    from_port   = 5002
    to_port     = 5002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Python Flask application"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "PostgreSQL access from anywhere "
  }

  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Phoenix application access"
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    description = "Allow Cloudflare IPs"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS traffic"
  }
}

resource "aws_instance" "app" {
  ami           = "ami-0399b625a665fddb0"
  instance_type = "t4g.micro"
  subnet_id     = aws_subnet.main_a.id
  vpc_security_group_ids = [aws_security_group.main.id]
  key_name = "gyb-staging-key"
  associate_public_ip_address = true

  root_block_device {
    volume_size = 20
  }
  
  user_data = <<-EOF
    #!/bin/bash

    # Update system and install required packages
    dnf update -y
    dnf install -y nginx openssl python3 python3-pip python3-devel gcc

    # Create web directories and set permissions
    mkdir -p /var/www/html
    mkdir -p /var/www/python_app
    chown -R ec2-user:nginx /var/www/html
    chown -R ec2-user:ec2-user /var/www/python_app
    chmod -R 755 /var/www/html
    chmod -R 755 /var/www/python_app

    # Set up Python virtual environment
    cd /var/www/python_app
    python3 -m venv venv
    source venv/bin/activate
    pip install Flask==3.0.3 Flask-Cors PyJWT==2.8.0

    # Configure SELinux for Nginx (if enabled)
    setsebool -P httpd_can_network_connect 1
    chcon -Rt httpd_sys_content_t /var/www/html

    # Create Nginx configuration
    cat > /etc/nginx/conf.d/gyb.conf <<'NGINX'
    server {
        listen 80;
        listen [::]:80;
        server_name gotyourback.io;
        
        root /var/www/html;
        index index.html;
        
        include /etc/nginx/mime.types;
        
        location / {
            try_files \$uri \$uri/ /index.html;
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
            add_header 'Access-Control-Allow-Headers' 'X-Requested-With,Content-Type,Authorization';
        }

        location /py {
            proxy_pass http://127.0.0.1:5002;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico)\$ {
            expires max;
            log_not_found off;
            access_log off;
        }

        error_log  /var/log/nginx/gyb_error.log;
        access_log /var/log/nginx/gyb_access.log;
    }
    NGINX

    chown root:root /etc/nginx/conf.d/gyb.conf
    chmod 644 /etc/nginx/conf.d/gyb.conf

    rm -f /etc/nginx/conf.d/default.conf

    nginx -t && systemctl enable nginx && systemctl restart nginx

    mkdir -p /etc/nginx/ssl/
    chmod 700 /etc/nginx/ssl/

    openssl req -new -newkey rsa:2048 -nodes \
    -keyout /etc/nginx/ssl/gyb.key \
    -out /etc/nginx/ssl/gyb.csr \
    -subj "/C=US/ST=Arizona/L=Phoenix/O=GYB/OU=IT/CN=gotyourback.io/emailAddress=admin@gotyourback.io"

    openssl x509 -req -days 365 \
    -in /etc/nginx/ssl/gyb.csr \
    -signkey /etc/nginx/ssl/gyb.key \
    -out /etc/nginx/ssl/gyb.crt

    chmod 600 /etc/nginx/ssl/*
    EOF

    provisioner "local-exec" {
  command = <<-EOT
    chmod 700 gyb-staging-key.pem && \
    sleep 60 && \
    CI=false npm run build && \
    tar -czf browser.tar.gz -C dist . && \
    scp -o StrictHostKeyChecking=no -i gyb-staging-key.pem browser.tar.gz ec2-user@${self.public_ip}:/home/ec2-user/ && \
    ssh -o StrictHostKeyChecking=no -i gyb-staging-key.pem ec2-user@${self.public_ip} 'sudo bash -s' <<'ENDSSH'
  #!/bin/bash
  
  sudo tar -xzf /home/ec2-user/browser.tar.gz -C /var/www/html
  sudo chown -R ec2-user:nginx /var/www/html
  sudo chmod -R 755 /var/www/html
  rm /home/ec2-user/browser.tar.gz
  
  sudo mkdir -p /etc/nginx/ssl
  sudo openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 \
    -subj "/C=US/ST=Arizona/L=Phoenix/O=GYB/OU=IT/CN=${self.public_ip}" \
    -keyout /etc/nginx/ssl/gyb.key \
    -out /etc/nginx/ssl/gyb.crt
  
  sudo chmod 600 /etc/nginx/ssl/*
  
  cat > /tmp/gyb-ssl.conf << 'EOF'
  server {
      listen 443 ssl http2;
      listen [::]:443 ssl http2;
      #server_name www.gotyourback.io;
      server_name ${self.public_ip};
  
      ssl_certificate /etc/nginx/ssl/gyb.crt;
      ssl_certificate_key /etc/nginx/ssl/gyb.key;
      ssl_protocols TLSv1.2 TLSv1.3;
      ssl_ciphers HIGH:!aNULL:!MD5;
  
      root /var/www/html;
      index index.html;
  
      location / {
          try_files $uri $uri/ /index.html;
          add_header "Access-Control-Allow-Origin" "*";
          add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, PUT, DELETE";
          add_header "Access-Control-Allow-Headers" "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
      }
  
      location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
          expires max;
          log_not_found off;
          access_log off;
      }
  }
  
  server {
      listen 80;
      listen [::]:80;
      server_name www.gotyourback.io;
      #server_name ${self.public_ip}
      return 301 https://$server_name$request_uri;
  }
  EOF
  
  sudo mv /tmp/gyb-ssl.conf /etc/nginx/conf.d/gyb-ssl.conf
  sudo nginx -t && sudo systemctl restart nginx
  ENDSSH
      EOT
    }
   
  tags = {
    Name = "GYB"
  }
}

resource "null_resource" "force_exec" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = <<-EOT
      sleep 60 && \
      CI=false npm run build && \
      tar -czf browser.tar.gz -C dist . && \
      scp -o StrictHostKeyChecking=no -i gyb-staging-key.pem browser.tar.gz ec2-user@${aws_instance.app.public_ip}:/home/ec2-user/ && \
      ssh -o StrictHostKeyChecking=no -i gyb-staging-key.pem ec2-user@${aws_instance.app.public_ip} 'sudo bash -s' <<'ENDSSH'
#!/bin/bash
# Deploy application files
sudo tar -xzf /home/ec2-user/browser.tar.gz -C /var/www/html
sudo chown -R ec2-user:nginx /var/www/html
sudo chmod -R 755 /var/www/html
rm /home/ec2-user/browser.tar.gz

# Configure Nginx for both React and Python
sudo nginx -t && sudo systemctl restart nginx
ENDSSH
    EOT
  }

  depends_on = [aws_instance.app]
}

output "deploy_commands" {
    value = <<EOF
     ssh -i gyb-staging-key.pem ec2-user@${aws_instance.app.public_ip}
     EOF
}