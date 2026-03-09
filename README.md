# Movie Streaming App

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Ammar88908/movie-streaming-app.git
   cd movie-streaming-app
   ```

2. **Install Dependencies**:
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root of the project and add the necessary environment variables:
   ```text
   MONGODB_URI=<Your_MongoDB_Atlas_URI>
   PORT=3000
   ```

## Deployment Guide

### Glitch
1. Go to [Glitch.com](https://glitch.com/).
2. Create a new project and choose the "Clone from Git Repository" option.
3. Paste the GitHub repository URL and click on "Import from GitHub".
4. Add your environment variables in the `.env` file on Glitch.
5. Glitch will automatically start the server.
6. Your app will be live at `https://<your-project-name>.glitch.me`

### Render
1. Go to [Render.com](https://render.com/).
2. Click on "New" and select "Web Service".
3. Connect your GitHub account and select the movie-streaming-app repository.
4. Set the build command to `npm install` and start command to `npm start`.
5. Add environment variables in the settings section.
6. Click on "Create Web Service" and your app will be deployed.

## MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account (or log in).
2. Create a new project and then create a new cluster.
3. Under "Database Access", add a new database user with a password.
4. Under "Network Access", allow access from your current IP address.
5. Obtain your MongoDB connection string, replace `<password>` with your password and copy the string.
6. Paste this connection string in your `.env` file as `MONGODB_URI`.

## Usage Instructions
1. Run the application:
   ```bash
   npm start
   ```
2. Open your browser and go to `http://localhost:3000`
3. Follow the on-screen instructions to start streaming movies!

---

This README covers setup, deployment, MongoDB integration, and usage instructions for the Movie Streaming App.