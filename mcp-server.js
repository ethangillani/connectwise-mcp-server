#!/usr/bin/env node

const http = require('http');
const axios = require('axios');

// Configuration
const CW_COMPANY_ID = process.env.CW_COMPANY_ID || '';
const CW_PUBLIC_KEY = process.env.CW_PUBLIC_KEY || '';
const CW_PRIVATE_KEY = process.env.CW_PRIVATE_KEY || '';
const CW_URL = process.env.CW_URL || 'api-na.myconnectwise.net';
const PORT = process.env.PORT || 3000;

// Create Axios client for ConnectWise API
const createCWClient = () => {
  const auth = Buffer.from(`${CW_COMPANY_ID}+${CW_PUBLIC_KEY}:${CW_PRIVATE_KEY}`).toString('base64');
  return axios.create({
    baseURL: `https://${CW_URL}/v4_6_release/apis/3.0`,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
};

// CW API functions
const cwClient = createCWClient();

const searchTickets = async (conditions = '', pageSize = 25, page = 1) => {
  try {
    const params = { pageSize, page };
    if (conditions) params.conditions = conditions;
    const response = await cwClient.get('/service/tickets', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching tickets:', error.message);
    return [];
  }
};

const getTicket = async (ticketId) => {
  try {
    const response = await cwClient.get(`/service/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting ticket ${ticketId}:`, error.message);
    throw error;
  }
};

const searchCompanies = async (conditions = '', pageSize = 25, page = 1) => {
  try {
    const params = { pageSize, page };
    if (conditions) params.conditions = conditions;
    const response = await cwClient.get('/company/companies', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching companies:', error.message);
    return [];
  }
};

// MCP Server
const server = http.createServer(async (req, res) => {
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
    return;
  }

  // Function endpoints
  if (req.url === '/function/cw_search_tickets' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { conditions, page_size = 25, page = 1 } = JSON.parse(body).parameters || {};
        const tickets = await searchTickets(conditions, page_size, page);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ tickets }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message || 'Unknown error' }));
      }
    });
    return;
  }

  if (req.url === '/function/cw_get_ticket' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { ticket_id } = JSON.parse(body).parameters || {};
        if (!ticket_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ticket_id is required' }));
          return;
        }
        const ticket = await getTicket(ticket_id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ticket }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message || 'Unknown error' }));
      }
    });
    return;
  }

  if (req.url === '/function/cw_search_companies' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { conditions, page_size = 25, page = 1 } = JSON.parse(body).parameters || {};
        const companies = await searchCompanies(conditions, page_size, page);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ companies }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message || 'Unknown error' }));
      }
    });
    return;
  }

  // Handle 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Start server
server.listen(PORT, () => {
  console.log(`ConnectWise MCP Server running on port ${PORT}`);
  console.log(`Company ID: ${CW_COMPANY_ID}`);
  console.log(`Base URL: ${CW_URL}`);
});
