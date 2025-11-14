# Personal AI photoshop - Erase tool

This project is a 1-page admin panel for editing images using AI inpainting.
The tool allows the user to upload a picture, manually mark unwanted areas using a brush mask, and send the masked image to Stability AI for correction.

Project includes:

- React + TypeScript
- Vite (for fastest dev environment)
- ESLint (code quality)
- Prettier (consistent formatting)

## Installation & Setup

1.  In your project, open terminal and enter:

    ``git clone https://github.com/MartaMarkiv/personal-photoshop.git``

    `cd personal-photoshop`

    `npm install` - install all packages

2.  Add environment variables:

    Create .env file:

    `VITE_STABILITY_API_KEY=your_api_key`


3.  Start development server:

    `npm run dev`

    The project will be available at http://localhost:5173


## Notes

  - This implementation uses Stability Inpainting API for image correction.

  - Only 5 edit requests are allowed (per session).