#!/usr/bin/env node

// Use basic HTTP server approach until SDK compatibility is resolved
import * as http from 'http';
import ConnectWiseClient from './client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize ConnectWise Client
const connectWiseClient = new ConnectWiseClient({
  companyId: process.env.CW_COMPANY_ID || '',
  publicKey: process.env.CW_PUBLIC_KEY || '',
  privateKey: process.env.CW_PRIVATE_KEY || '',
  baseUrl: process.env.CW_URL || 'api-na.myconnectwise.net',
});

// Define routes and handlers
interface Route {
  path: string;
  method: string;
  handler: (req: http.IncomingMessage, res: http.ServerResponse, body?: any) => Promise<void>;
}

// Simple route handling logic
const routes: Route[] = [
  {
    path: '/discover',
    method: 'GET',
    handler: async (req, res) => {
      const discovery = {
        name: 'connectwise-mcp-server',
        version: '0.1.0',
        description: 'MCP server for integrating with ConnectWise Manage API',
        functions: [
          {
            name: 'cw_search_tickets',
            description: 'Search for service tickets in ConnectWise Manage',
            parameters: {
              type: 'object',
              properties: {
                conditions: {
                  type: 'string',
                  description: 'Conditions to filter tickets (using ConnectWise query format)'
                },
                page_size: {
                  type: 'number',
                  description: 'Number of tickets to return per page',
                  default: 25
                },
                page: {
                  type: 'number',
                  description: 'Page number to return',
                  default: 1
                }
              },
              required: []
            }
          },
          {
            name: 'cw_get_ticket',
            description: 'Get a service ticket by ID',
            parameters: {
              type: 'object',
              properties: {
                ticket_id: {
                  type: 'number',
                  description: 'The ID of the ticket to retrieve'
                }
              },
              required: ['ticket_id']
            }
          },
          // Add other function definitions similarly
        ]
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(discovery));
    }
  },
  {
    path: '/function/cw_search_tickets',
    method: 'POST',
    handler: async (req, res, body) => {
      try {
        const { conditions, page_size = 25, page = 1 } = body.parameters || {};
        const tickets = await connectWiseClient.searchTickets(conditions, page_size, page);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ tickets }));
      } catch (error) {
        console.error('Error searching tickets:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    }
  },
  {
    path: '/function/cw_get_ticket',
    method: 'POST',
    handler: async (req, res, body) => {
      try {
        const { ticket_id } = body.parameters || {};
        if (!ticket_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ticket_id is required' }));
          return;
        }
        
        const ticket = await connectWiseClient.getTicket(ticket_id);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ticket }));
      } catch (error) {
        console.error('Error getting ticket:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    }
  },
  // Add more route handlers for other functions
];

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Handle CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const url = req.url || '/';
  const method = req.method || 'GET';
  
  // Find matching route
  const route = routes.find(r => r.path === url && r.method === method);
  
  if (route) {
    // For POST requests, parse the request body
    if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const parsedBody = JSON.parse(body);
          await route.handler(req, res, parsedBody);
        } catch (error) {
          console.error('Error parsing request body:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request body' }));
        }
      });
    } else {
      // For GET requests, just handle directly
      await route.handler(req, res);
    }
  } else {
    // Route not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start the server on port 8080
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`ConnectWise Manage MCP Server started on port ${PORT}`);
  console.log(`Company ID: ${process.env.CW_COMPANY_ID || 'Not set'}`);
  console.log(`Base URL: ${process.env.CW_URL || 'api-na.myconnectwise.net'}`);
});
