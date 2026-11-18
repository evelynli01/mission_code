**Mission: Code** is an interactive, spy-themed educational game that introduces beginner programming concepts through a series of coding missions. Players guide Agent Cipher through a high-security facility by writing and executing Python-style commands, solving puzzles, and avoiding obstacles.

**[Play Mission: Code on Google Playground](https://playground.google/g/npiIkw)**

## Intended Audience

Mission: Code is designed primarily for middle-school and early-high-school students who are beginning to learn Python. It is intended as a supplemental learning experience alongside traditional programming instruction.

## Problem and Opportunity

Introductory programming can feel abstract when students are first learning how code translates into actions.

Mission: Code explores how game-based learning, visual feedback, and interactive problem-solving can help students understand foundational programming concepts in a more engaging environment.

## Gameplay and Primary User Flow

Players take on the role of a secret agent completing missions across five floors of a high-security facility.

1. **Start the mission:** Enter Mission Headquarters and select an available floor.
2. **Learn the concept:** Review the floor's lesson, examples, and interactive practice activities.
3. **Write code:** Use the code editor to create movement instructions and solve the mission.
4. **Execute and debug:** Run, step through, or reset the code while observing Agent Cipher's movements and feedback.
5. **Progress through the facility:** Complete missions to unlock additional floors and reach the final vault.

The five floors introduce sequencing and functions, variables and arguments, loops, conditional statements, and combining previously learned concepts.

The game includes guided tutorials, contextual hints, visual feedback, and saved progress.

## Technical Stack

- **React:** User interface and interactive game components
- **TypeScript:** Game logic, application state, and lesson data
- **HTML Canvas:** Rendering the 2D game environment
- **Tailwind-style utility classes:** Interface styling
- **Lucide React:** Interface icons
- **Browser Local Storage:** Saving player progress and game settings
- **Google Playground:** AI-assisted development, game hosting, and deployment

### APIs and Platform Integration

The project uses the Google Playground SDK for integration with the Playground environment.

The exported source includes SDK utilities and a simulated SDK implementation intended for testing. No separate external data API or API key is required for the documented gameplay flow.

The game's coding interactions use a custom Python-style command system rather than a standalone Python interpreter.

## How to Play

Mission: Code is publicly deployed through Google Playground.

1. Open the [published game](https://playground.google/g/npiIkw).
2. Sign in with your Google account (such as a Gmail account) if prompted.
3. Start the game and follow the introductory tutorial.
4. Complete the coding missions and progress through the facility.

**The published Google Playground version is the recommended way to play the game.**

## Local Development and Setup

This repository contains the source files exported from Google Playground, including the React and TypeScript components, game logic, assets, configuration, and supporting utilities.

The exported project does not include a `package.json` or `index.html` because it was developed and deployed within the Google Playground environment.

A standalone local development environment has **not yet been configured or verified**. Running the project outside Google Playground would require additional setup, including installing dependencies, configuring a frontend build environment, and testing compatibility with the Playground SDK.

For this reason, there are currently no verified local installation or startup commands.

To experience the working application, please use the published Google Playground link above.

## Known Limitations

- The experience is currently limited to five missions and a single-player learning flow.
- The game introduces selected foundational Python concepts rather than providing a complete Python curriculum.
- Testing has included peer feedback, but formal usability testing with the intended middle-school audience has not yet been completed.
- Standalone local development and deployment have not been configured.
- Further accessibility testing with assistive technologies is needed.

## Future Improvements

Potential future improvements include:

- Conducting usability and learning-outcome testing with students in the intended age group
- Expanding accessibility testing and support
- Exploring teacher-created missions and classroom integration
- Investigating a more immersive 3D version of the learning experience
- Supporting a reproducible standalone local development environment

## Development Process and AI Disclosure

Mission: Code was developed using Google Playground with AI-assisted code generation and iterative prompting.

The development process involved defining gameplay requirements, refining the user experience, testing interactions, troubleshooting issues, and making design decisions based on observations and feedback.

ChatGPT was also used to support troubleshooting and development planning.

The game builds on an earlier human-computer interaction class concept, which informed the direction of the playable experience.

## Third-Party Notices

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for additional third-party information included with the exported project.