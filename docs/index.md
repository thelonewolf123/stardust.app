# Fusion-grid: container provision engine

Fusion-grid is a powerful container provision engine built with Node.js, TypeScript, MongoDB, Redis and Pulumi. It allows you to easily manage and orchestrate containers in your infrastructure, providing a seamless experience for containerized applications.

## Features

-   **Easy to use**: Fusion-grid is built with simplicity in mind. It's easy to use and easy to deploy.
-   **scalable**: Fusion-grid is built to scale. It can handle thousands of containers with ease.
-   **Secure**: Fusion-grid is built with security in mind. It uses the latest security standards and best practices.
-   **Open source**: Fusion-grid is open source and free to use. You can contribute to the project and make it better.

## Getting started

### Architecture

![Architecture](https://raw.githubusercontent.com/thelonewolf123/soul-forge/main/docs/images/architecture.png)

### Prerequisites

-   Node.js
-   MongoDB
-   Redis
-   Pulumi
-   RabbitMQ

### Installation

1. Clone the repo

```sh
git clone https://github.com/thelonewolf123/fusion-grid.git
```

2. Install NPM packages for pulumi

```sh
cd infra && yarn install
```

4. Deploy on aws

```sh
yarn infra:up
```

### Tear down

```sh

yarn infra:down
```
