#!/usr/bin/env node

const http = require('http');
const axios = require('axios');

// Configuration
const CW_COMPANY_ID = process.env.CW_COMPANY_ID || '';
const CW_PUBLIC_KEY = process.env.CW_PUBLIC_KEY || '';
const CW_PRIVATE_KEY = process.env.CW_PRIVATE_KEY || '';
const CW_URL = process.env.CW_URL || 'api-na.myconnectwise.net';
const PORT = parseInt(process.env.PORT || '3456');

console.log('Starting ConnectWise MCP Server with:');
console.log(`- Company ID: ${CW_COMPANY_ID}`);
console.log(`- Base URL: ${CW_URL}`);
console.log(`- Port: ${PORT}`);

// Simple error handling
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// Create Axios client for ConnectWise API
const createCWClient = () => {
  const auth = Buffer.from(`${CW_COMPANY_ID}+${CW_PUBLIC_KEY}:${CW_PRIVATE_KEY}`).toString('base64');
  return axios.create({
    baseURL: `https://${CW_URL}/v4_6_release/apis/3.0`,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
  });
};

// CW API functions
const cwClient = createCWClient();

const searchTickets = async (conditions = '', pageSize = 25, page = 1) => {
  try {
    console.log(`Searching tickets with conditions: ${conditions || 'none'}`);
    const params = { pageSize, page };
    if (conditions) params.conditions = conditions;
    const response = await cwClient.get('/service/tickets', { params });
    console.log(`Found ${response.data.length} tickets`);
    return response.data;
  } catch (error) {
    console.error('Error searching tickets:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return [];
  }
};

const getTicket = async (ticketId) => {
  try {
    console.log(`Getting ticket with ID: ${ticketId}`);
    const response = await cwClient.get(`/service/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting ticket ${ticketId}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

const searchCompanies = async (conditions = '', pageSize = 25, page = 1) => {
  try {
    console.log(`Searching companies with conditions: ${conditions || 'none'}`);
    const params = { pageSize, page };
    if (conditions) params.conditions = conditions;
    const response = await cwClient.get('/company/companies', { params });
    console.log(`Found ${response.data.length} companies`);
    return response.data;
  } catch (error) {
    console.error('Error searching companies:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return [];
  }
};

// MCP Server
const server = http.createServer(async (req, res) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // MCP discovery endpoint
  if (req.url === '/discover' && req.method === 'GET') {
    console.log('Processing discover request');
    const discovery = {
      functions: [
        {
          name: 'cw_search_tickets',
          description: 'Search for service tickets in ConnectWise Manage',
          parameters: {
            type: 'object',
            properties: {
              conditions: {
                type: 'string',
                description: 'Conditions to filter tickets'
              },
              page_size: {
                type: 'number',
                description: 'Number of tickets per page',
                default: 25
              },
              page: {
                type: 'number',
                description: 'Page number',
                default: 1
              }
            }
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
        {
          name: 'cw_search_companies',
          description: 'Search for companies in ConnectWise Manage',
          parameters: {
            type: 'object',
            properties: {
              conditions: {
                type: 'string', 
                description: 'Conditions to filter companies'
              },
              page_size: {
                type: 'number',
                description: 'Number of companies per page',
                default: 25
              },
              page: {
                type: 'number',
                description: 'Page number',
                default: 1
              }
            }
          }
        }
      ]
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(discovery));
    console.log('Sent discovery response');
    return;
  }

  // Function endpoints
  if (req.url === '/function/cw_search_tickets' && req.method === 'POST') {
    console.log('Processing cw_search_tickets request');
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        console.log('Request body:', body);
        const parsedBody = JSON.parse(body);
        const { conditions, page_size = 25, page = 1 } = parsedBody.parameters || {};
        console.log(`Parsed parameters: conditions=${conditions}, page_size=${page_size}, page=${page}`);
        
        const tickets = await searchTickets(conditions, page_size, page);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ tickets }));
        console.log('Sent cw_search_tickets response');
      } catch (error) {
        console.error('Error processing cw_search_tickets:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message || 'Unknown error' }));
      }
    });
    return;
  }

  if (req.url === '/function/cw_get_ticket' && req.method === 'POST') {
    console.log('Processing cw_get_ticket request');
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        console.log('Request body:', body);
        const parsedBody = JSON.parse(body);
        const { ticket_id } = parsedBody.parameters || {};
        console.log(`Parsed parameters: ticket_id=${ticket_id}`);
        
        if (!ticket_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ticket_id is required' }));
          console.log('Error: ticket_id is required');
          return;
        }
        
        const ticket = await getTicket(ticket_id);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ticket }));
        console.log('Sent cw_get_ticket response');
      } catch (error) {
        console.error('Error processing cw_get_ticket:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message || 'Unknown error' }));
      }
    });
    return;
  }

  if (req.url === '/function/cw_search_companies' && req.method === 'POST') {
    console.log('Processing cw_search_companies request');
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        console.log('Request body:', body);
        const parsedBody = JSON.parse(body);
        const { conditions, page_size = 25, page = 1 } = parsedBody.parameters || {};
        console.log(`Parsed parameters: conditions=${conditions}, page_size=${page_size}, page=${page}`);
        
        const companies = await searchCompanies(conditions, page_size, page);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ companies }));
        console.log('Sent cw_search_companies response');
      } catch (error) {
        console.error('Error processing cw_search_companies:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message || 'Unknown error' }));
      }
    });
    return;
  }

  // Handle 404
  console.log('No matching route found, sending 404');
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Listen handling with error recovery
const startServer = () => {
  try {
    server.listen(PORT, () => {
      console.log(`ConnectWise MCP Server running on port ${PORT}`);
      console.log(`Company ID: ${CW_COMPANY_ID}`);
      console.log(`Base URL: ${CW_URL}`);
    });
    
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Trying again in 5 seconds...`);
        setTimeout(() => {
          server.close();
          startServer();
        }, 5000);
      } else {
        console.error('Server error:', e);
      }
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
