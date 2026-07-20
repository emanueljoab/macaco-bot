#!/bin/bash
cd "$(dirname "$0")"
git pull
npm install
exec node src/index.js
