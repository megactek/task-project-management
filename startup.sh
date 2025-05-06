#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")"

# Install dependencies if they don't exist
if [ ! -d "node_modules" ]; then
    npm install
fi

# Build the application
npm run build

# Start the application
npm run start 