# Containerfile for building ai-managed-2048 on Linux (x86_64)
# Used in CI and for local containerized builds via scripts/container-tauri.sh
FROM node:22-slim AS base

# Install system dependencies required by Tauri on Linux
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libwebkit2gtk-4.1-dev \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install pnpm
RUN npm install -g pnpm@latest

WORKDIR /app

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY src-tauri/Cargo.toml src-tauri/Cargo.lock* ./src-tauri/

# Install JS dependencies
RUN pnpm install --ignore-scripts || pnpm install --ignore-scripts

# Install Rust dependencies (warm the cache)
RUN cd src-tauri && cargo fetch 2>/dev/null || true

# Copy remaining source
COPY . .

FROM base AS dev
CMD ["pnpm", "tauri", "dev", "--no-watch"]

FROM base AS build
RUN pnpm tauri build
