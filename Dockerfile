FROM node:22-bookworm

# Install build dependencies
# - python3 and build-essential for node-gyp
# - libsecret-1-dev, libx11-dev, libxkbfile-dev for VS Code native modules
# - pkg-config for finding libraries
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python-is-python3 \
    git \
    pkg-config \
    libsecret-1-dev \
    libx11-dev \
    libxkbfile-dev \
    libkrb5-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHON=python3

# Copy package files first for caching
COPY package.json package-lock.json .npmrc* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Default command to run the Mac build (for arm64 as seen in workflows)
# Note: This produces an unsigned build as no certificates are provided.
CMD ["npm", "run", "gulp", "vscode-darwin-arm64-min"]
