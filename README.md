
# DbIM (Database Interaction Manager)

DbIM is a full-stack application designed to manage and query data related to music artists, albums, and record companies. It features a GraphQL API for flexible data interactions and utilizes MongoDB and Redis for efficient storage and caching.

---

## Features

### Core Functionalities
- **GraphQL API**: 
  - Fetch lists of artists, albums, and record companies.
  - Retrieve specific artists, albums, or record companies by ID.
  - Query songs by artist ID.
  - Find albums by genre.
  - Retrieve record companies based on founding year range.
  - Search for artists by name.
- **Database Management**: 
  - MongoDB integration for efficient handling and storage of music-related data.
- **Caching**: 
  - Redis implementation for caching frequently accessed queries and data.
- **Input Validation**: 
  - Helper functions for validating strings, names, and dates with supported formats.

### Frontend Features
- **User-Friendly Interface**: Built with React and styled using PrimeReact for a responsive and engaging UI.
- **Dynamic Routing**: Client-side navigation powered by React Router DOM.
- **GraphQL Integration**: Apollo Client for seamless communication with the backend API.

---

## Technologies Used

### Backend (Server)
- **Express.js**: Backend framework for handling routes and middleware.
- **Apollo Server**: GraphQL API implementation.
- **MongoDB**: NoSQL database for data storage.
- **Redis**: In-memory data structure store for caching.
- **Axios**: HTTP client for API communication.
- **Moment.js**: Library for date and time manipulation.

### Frontend (Client)
- **React.js**: Framework for building the user interface.
- **Apollo Client**: GraphQL client for querying and caching data.
- **React Router DOM**: Client-side navigation and routing.
- **PrimeReact**: Rich UI components for enhanced user experience.
- **Moment.js**: Date and time handling.

---

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16 or higher recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (running instance)
- [Redis](https://redis.io/) (running instance)

---

## Getting Started

### Clone the Repository
```bash
git clone https://github.com/SKele10/DbIM.git
cd dbim
```

### Setting Up the Server
1. Navigate to the server directory:
   ```bash
   cd dbim_server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables in `.env`:
   ```env
   MONGO_URI=your_mongo_connection_string
   REDIS_URI=your_redis_connection_string
   PORT=4000
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:4000`.

### Setting Up the Client
1. Navigate to the client directory:
   ```bash
   cd dbim_client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables in `.env`:
   ```env
   VITE_API_URL=http://localhost:4000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

### Server
```
/dbim_server/
|-- server.js            # Main server entry point
|-- resolvers.js         # GraphQL resolvers
|-- typeDefs.js          # GraphQL type definitions
|-- config/              # MongoDB and Redis configurations
|-- helper.js            # Utility functions
|-- package.json         # Server dependencies
```

### Client
```
/dbim_client/
|-- src/
|   |-- components/      # Reusable React components
|   |-- pages/           # Page-level components
|   |-- App.jsx          # Main React application
|-- index.html           # Main HTML entry point
|-- package.json         # Client dependencies
|-- vite.config.js       # Vite configuration
```

---

## Deployment

### Backend
1. Build a Docker image:
   ```bash
   docker build -t dbim-server .
   ```
2. Run the container:
   ```bash
   docker run -p 4000:4000 dbim-server
   ```

### Frontend
1. Build the production-ready client:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to a web server (e.g., Netlify, Vercel).

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
