# System Design AI

This is a web application that generates system design problems and visualizes the solutions using AI. It leverages Next.js, Genkit, and the Google AI SDK to provide a platform for practicing system design interviews and learning about different architectural patterns.

## Features

- **Problem Generation:** Generates realistic system design problems based on user-defined constraints and requirements.
- **Solution Visualization:** Creates a visual representation of the system architecture proposed as a solution.
- **Interactive Diagram:** Allows users to interact with the generated diagram, zoom, pan, and explore different components.
- **Customization:** Provides options to customize the problem generation process and the level of detail in the diagram.

## Running Locally

To run the project locally, follow these steps:

To get started, take a look at src/app/page.tsx.
- Clone the repository.
- Install dependencies using `npm install`.
- Set up your environment variables (e.g., API keys for the Google AI SDK).
- Run the development server using `npm run dev`.
- Access the application at `http://localhost:3000`.

## Dockerization

To build the Docker image for multiple architectures using buildx, navigate to the root of the project and run:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t systematic-designer .
```

*Note: You may need to set up a buildx builder that supports these platforms.*

To run the Docker container with your Google API Key, replace `YOUR_GOOGLE_API_KEY` with your actual key:

```bash
docker run -p 3000:3000 -e GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY systematic-designer
```

This will run the application on port 3000.

## Getting Started

To start exploring the application, take a look at the main page component in `src/app/page.tsx`.
