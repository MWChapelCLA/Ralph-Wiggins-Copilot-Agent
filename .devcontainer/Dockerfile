FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/bash vscode \
    && mkdir -p /home/vscode/.vscode-server /home/vscode/.vscode-server-insiders \
    && chown -R vscode:vscode /home/vscode

# Set up workspace
WORKDIR /workspace
RUN chown -R vscode:vscode /workspace

USER vscode

# Configure npm to use user-local directory for global packages
RUN mkdir -p /home/vscode/.npm-global \
    && npm config set prefix /home/vscode/.npm-global

# Add npm global bin to PATH
ENV PATH="/home/vscode/.npm-global/bin:${PATH}"

# Verify installation
RUN node --version && npm --version
