# BeSocial

A demo app for displaying a social feed and allowing users to add their own posts.

## Prerequisites

This app is tested on [Node.js](https://nodejs.org) version 22.14.0.

## Install

```bash
npm install
# or
yarn 
# or
pnpm install
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Dev server running on [http://localhost:3000](http://localhost:3000) 

## Running with Docker

Either run it with a single Docker compose command:

```bash
docker compose up --build
```

Or build the image and run the container manually:

```bash
docker build -t next-social-feed .

docker run -p 3000:3000 -v ${PWD}:/app -v /app/node_modules next-social-feed
```

Dev server should be available on [http://localhost:3000](http://localhost:3000) 