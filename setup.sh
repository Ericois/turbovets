#!/bin/bash

# ===========================================
# TURBOVETS SETUP SCRIPT
# ===========================================
# This script sets up the Turbovets Task Management System

set -e  # Exit on any error

echo "🚀 Setting up Turbovets Task Management System..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update the values."
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build shared libraries
echo "🔨 Building shared libraries..."
npx nx build data
npx nx build auth

# Create database directory
echo "🗄️  Setting up database..."
mkdir -p data

# Seed the database
echo "🌱 Seeding database..."
npm run seed:db

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Review and update .env file if needed"
echo "2. Start the API server: npm run start:api"
echo "3. Start the frontend: npm run start:frontend"
echo "4. Or use the static frontend: npm run start:static"
echo ""
echo "🌐 Access points:"
echo "   API: http://localhost:3000"
echo "   Angular Frontend: http://localhost:4200"
echo "   Static Frontend: http://localhost:4201"
echo "   Enhanced Dashboard: http://localhost:4202"
echo ""
echo "🔐 Default login credentials:"
echo "   Email: owner@acme.com"
echo "   Password: password123"
echo ""
