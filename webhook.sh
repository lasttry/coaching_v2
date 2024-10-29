#!/bin/bash
git -C /var/www/coaching pull origin main
npm install
npx prisma migrate deploy
npx next build
pm2 restart coaching