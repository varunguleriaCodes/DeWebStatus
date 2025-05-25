# DeWebStatus

> **Web3 based website status check**

DeWebStatus is a decentralized application that leverages Web3 technologies to monitor and report the status of websites in a trustless, on-chain manner. By utilizing blockchain technology, it ensures transparent, tamper-proof status monitoring without relying on centralized authorities. New validators can join making website status more reliable.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend (Rust)](#backend-rust)
  - [Frontend (TypeScript)](#frontend-typescript)
  - [Hub (TypeScript)](#hub-typescript)
- [Configuration](#configuration)

## Features

- ✅ **Decentralized status checks** recorded on-chain for transparency and immutability
- ✅ **Real-time monitoring dashboard** with live updates and historical data
- ✅ **Modular architecture** (backend, frontend, hub, validator) for scalability
- ✅ **Secure message validation** and relaying between components
- ✅ **Web3 integration** with smart contracts for trustless operations
- ✅ **Multi-chain support** for various blockchain networks
- ✅ **Consensus-based validation** ensuring accurate status reporting

## Architecture

DeWebStatus is organized into four main components that work together to provide a complete decentralized monitoring solution:

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │◄──►│     Backend     │◄──►│    Database     │
│   (TypeScript)  │    │     (Rust)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Validator     │◄──►│      Hub        │
                       │ (TypeScript)    │    │  (TypeScript)   │
                       └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Solana Blockchain│
                                               │  (for payments)  │
                                               └─────────────────┘
                                                        ▲
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │     Backend     │
                                               │  (payment API)  │
                                               └─────────────────┘
```

### Component Details

1. **Backend (Rust)**
   - Create new User
   - Provides REST APIs for status polling
   - Handles website status checks and data aggregatio
   - Provide REST APIs for new Website additions.

2. **Frontend (TypeScript)**
   - User dashboard built with modern TypeScript, React/Vue, and CSS
   - Displays real-time website statuses and comprehensive historical data
   - Provides intuitive UI for adding/removing monitored websites

3. **Hub (TypeScript)**
   - Central message broker and orchestrator
   - Receives status events from the backend and distributes to frontend
   - Manages WebSocket connections for real-time updates
   - Handles load balancing and message queuing

4. **Validator (TypeScript)**
   - Validates the integrity and authenticity of status reports
   - Implements consensus mechanisms for multi-node validation
   - Ensures only legitimate checks are recorded on-chain
   - Prevents spam and malicious reporting

## Prerequisites

Before setting up DeWebStatus, ensure you have the following installed:

- **Node.js** (v16 or higher) with **npm** or **yarn**
- **Rust** (v1.65 or higher) with `cargo`
- **Git** for version control
- **Bun** for validator and hub setup.
## Installation

### Quick Start

First, clone the repository:

```bash
git clone https://github.com/varunguleriaCodes/DeWebStatus.git
cd DeWebStatus
```

### Backend (Rust)

The backend handles blockchain interactions and status monitoring logic.

```bash
cd backend

# Install dependencies
cargo build

# Run backend project
cargo run -p main

```

### Frontend (TypeScript)

The frontend provides the user interface for monitoring and managing websites.

```bash
cd frontend

# Install dependencies
npm install

# Run in development mode
npm run dev

```

### Hub (TypeScript)

The hub orchestrates communication with Validators.

```bash
cd hub

# Install dependencies
bun install

# Start the hub
bun run dev
```

### Validator (TypeScript)

The validator send the status reports.

```bash
cd hub

# Install dependencies
bun install

# Start the hub
bun run dev
```

## Configuration

### Environment Setup

Each component requires specific environment variables for proper operation, the env.sample is provided for each file copy the variables and give values to run.



### Adding Websites to Monitor

#### Via Web Interface

1. Navigate to the dashboard
2. Click "Add Website" button
3. Enter the website URL and monitoring parameters
4. Configure check interval and notification settings
5. Submit the form to start monitoring

#### Via API

Add a website programmatically:

```bash
curl -X POST http://localhost:8080/api/websites \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "name": "Example Website",
    "interval": 300,
    "timeout": 30,
    "expectedStatus": 200
  }'
```

### Dashboard Features

- **Real-time Status**: Live updates of website availability
- **Historical Charts**: Uptime trends and response time graphs
- **Alert Management**: Configure notifications for status changes
- **Multi-chain View**: Monitor across different blockchain networks
- **Validator Network**: View active validators and consensus status


**Built with ❤️ by Varun Guleria**

For more information, visit the [project repository](https://github.com/varunguleriaCodes/DeWebStatus).
