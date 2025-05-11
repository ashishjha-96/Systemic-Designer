# **App Name**: Systematic Designer

## Core Features:

- Problem Generation: Use a Large Language Model tool to generate system design problems with solutions and reasoning.
- Structured Display: Display the problem statement, solution, reasoning, diagrams, and key concepts in a structured format.
- Customization Options: Allow users to select difficulty level, problem type, and toggle visibility of different sections (problem, solution, reasoning, key concepts, diagrams).

## Style Guidelines:

- Primary color: Neutral gray (#F5F5F5) for a clean background.
- Secondary color: Darker gray (#333333) for text and important elements.
- Accent: Teal (#008080) for interactive elements and highlights.
- Clear and readable sans-serif fonts for problem statements, solutions, and reasoning.
- Use a modular layout with clear separation between problem, solution, reasoning, key concepts, and diagrams.
- Use simple and consistent icons to represent different system design concepts.

## Dockerization

To build the Docker image, navigate to the root of the project and run:

```bash
docker build -t systematic-designer .
```

To run the Docker container, you need to provide your Google API Key as an environment variable. Replace `YOUR_GOOGLE_API_KEY` with your actual key:

```bash
docker run -p 3000:3000 -e GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY systematic-designer
```

This will run the application on port 3000.