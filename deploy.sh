#!/bin/bash
set -e

# ============================================
# Coaching App - Deploy Script
# ============================================

# Configuration
APP_DIR="/var/www/coaching"
APP_NAME="coaching"
LOG_FILE="/var/log/coaching-deploy.log"
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
	local level=$1
	local message=$2
	local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
	echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

info() {
	echo -e "${BLUE}ℹ${NC} $1"
	log "INFO" "$1"
}
success() {
	echo -e "${GREEN}✓${NC} $1"
	log "SUCCESS" "$1"
}
warning() {
	echo -e "${YELLOW}⚠${NC} $1"
	log "WARNING" "$1"
}
error() {
	echo -e "${RED}✗${NC} $1"
	log "ERROR" "$1"
}

# Error handler
handle_error() {
	error "Deploy failed at step: $1"
	error "Check logs at: $LOG_FILE"
	exit 1
}

# Header
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Coaching App - Production Deploy${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

info "Starting deploy at $(date)"
info "App directory: $APP_DIR"

# Check if directory exists
if [ ! -d "$APP_DIR" ]; then
	error "Directory $APP_DIR does not exist!"
	exit 1
fi

cd "$APP_DIR" || handle_error "cd to app directory"

# Step 1: Git pull
info "Pulling latest changes from $BRANCH..."
if git pull origin "$BRANCH"; then
	success "Git pull completed"
else
	handle_error "git pull"
fi

# Show what changed
CHANGES=$(git log --oneline -1)
info "Latest commit: $CHANGES"

# Step 2: Install dependencies
info "Installing dependencies..."
if npm install --legacy-peer-deps; then
	success "Dependencies installed"
else
	handle_error "npm install"
fi

# Step 3: Generate Prisma client
info "Generating Prisma client..."
if npx prisma generate; then
	success "Prisma client generated"
else
	handle_error "prisma generate"
fi

# Step 4: Run database migrations
info "Running database migrations..."
if npx prisma migrate deploy; then
	success "Database migrations completed"
else
	handle_error "prisma migrate deploy"
fi

# Step 5: Build the application
info "Building application (this may take a while)..."
if npx next build; then
	success "Build completed"
else
	handle_error "next build"
fi

# Step 6: Restart the application
info "Restarting application..."
if pm2 restart "$APP_NAME"; then
	success "Application restarted"
else
	handle_error "pm2 restart"
fi

# Final status
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Deploy completed successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
info "Deploy finished at $(date)"

# Show PM2 status
pm2 status "$APP_NAME"
