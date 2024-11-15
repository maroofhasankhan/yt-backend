# Yt Clone Backend

## Overview

This project is a Node.js application that provides a backend service for user registration and file uploads. It uses Express.js for handling HTTP requests, Mongoose for MongoDB interactions, and Multer for file uploads. The application also integrates with Cloudinary for image storage.

## Features

- User registration with validation
- File upload using Multer
- Image storage on Cloudinary
- Error handling with custom error classes
- JWT-based authentication

## Prerequisites

- Node.js (version 14 or higher)
- MongoDB
- Cloudinary account for image storage

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repo.git
   ```

2. Navigate to the project directory:

   ```bash
   cd your-repo
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables:

   Create a `.env` file in the root directory and add the following variables:

   ```plaintext
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=your_access_token_expiry
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry
   CLOUDINARY_URL=your_cloudinary_url
   ```

5. Start the application:

   ```bash
   npm start
   ```

## Usage

- **Register a User**: Send a POST request to `/register` with the required fields (`fullname`, `username`, `email`, `password`) and files (`avatar`, `coverImage`).

## Project Structure

- `src/controllers`: Contains the controller logic for handling requests.
- `src/models`: Contains Mongoose models for database interactions.
- `src/middlewares`: Contains middleware functions for request processing.
- `src/routes`: Contains route definitions for the application.
- `src/utils`: Contains utility functions and classes.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please contact [maroofhasankhan@gmail.com](mailto:maroofhasankhan@gmail.com).