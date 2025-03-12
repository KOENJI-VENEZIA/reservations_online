// server.js
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Path = require('path');

const init = async () => {
  // Create a Hapi server on localhost at port 3000
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  // Register Inert to serve static files
  await server.register(Inert);

  // Route to serve index.html from the root directory
  server.route({
    method: 'GET',
    path: '/',
    handler: {
      file: Path.join(__dirname, 'index.html')
    }
  });

  // Route to serve static files from the "public" directory
  server.route({
    method: 'GET',
    path: '/public/{param*}',
    handler: {
      directory: {
        path: Path.join(__dirname, 'public'),
      },
    },
  });

  // Example API endpoint
  server.route({
    method: 'GET',
    path: '/api/data',
    handler: (request, h) => {
      // This could be any dynamic data or logic
      return { message: 'This is an API response damn' };
    },
  });

  // Start the server
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

// Initialize the server
init();
