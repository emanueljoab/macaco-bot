#!/bin/bash
cd "$(dirname "$0")"
git pull
npm install
pm2 restart macaco || (pm2 start src/index.js --name macaco && pm2 save)
