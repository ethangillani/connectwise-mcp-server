#!/usr/bin/env node

import { createServer } from '@modelcontextprotocol/sdk';
import ConnectWiseClient from './client.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize ConnectWise Client
const connectWiseClient = new ConnectWiseClient({
  companyId: process.env.CW_COMPANY_ID || '',
  publicKey: process.env.CW_PUBLIC_KEY || '',
  privateKey: process.env.CW_PRIVATE_KEY || '',
  baseUrl: process.env.CW_URL || 'api-na.myconnectwise.net',
});

// Define MCP Server
const server = createServer({
  title: 'ConnectWise Manage MCP Server',
  description: 'MCP server for integrating with ConnectWise Manage API',
  version: '0.1.0',
  functions: [
    // Ticket Functions
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
      },
      handler: async ({ conditions, page_size = 25, page = 1 }: { 
        conditions?: string, 
        page_size?: number, 
        page?: number 
      }) => {
        try {
          const response = await connectWiseClient.searchTickets(conditions, page_size, page);
          return { tickets: response };
        } catch (error) {
          console.error('Error searching tickets:', error);
          return { error: error instanceof Error ? error.message : 'Unknown error' };
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
      },
      handler: async ({ ticket_id }: { ticket_id: number }) => {
        try {
          const response = await connectWiseClient.getTicket(ticket_id);
          return { ticket: response };
        } catch (error) {
          console.error(`Error getting ticket ${ticket_id}:`, error);
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    },
    
    {
      name: 'cw_create_ticket',
      description: 'Create a new service ticket',
      parameters: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description: 'Summary of the ticket'
          },
          description: {
            type: 'string',
            description: 'Detailed description of the ticket'
          },
          board_id: {
            type: 'number',
            description: 'ID of the board to create the ticket on'
          },
          company_id: {
            type: 'number',
            description: 'ID of the company the ticket is for'
          },
          contact_id: {
            type: 'number',
            description: 'ID of the contact the ticket is for (optional)'
          }
        },
        required: ['summary', 'board_id', 'company_id']
      },
      handler: async ({ 
        summary, 
        description, 
        board_id, 
        company_id, 
        contact_id 
      }: { 
        summary: string, 
        description?: string, 
        board_id: number, 
        company_id: number, 
        contact_id?: number 
      }) => {
        try {
          const response = await connectWiseClient.createTicket({
            summary,
            description,
            board: { id: board_id },
            company: { id: company_id },
            ...(contact_id ? { contact: { id: contact_id } } : {})
          });
          return { ticket: response };
        } catch (error) {
          console.error('Error creating ticket:', error);
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    },
    
    // Company Functions
    {
      name: 'cw_search_companies',
      description: 'Search for companies in ConnectWise Manage',
      parameters: {
        type: 'object',
        properties: {
          conditions: {
            type: 'string',
            description: 'Conditions to filter companies (using ConnectWise query format)'
          },
          page_size: {
            type: 'number',
            description: 'Number of companies to return per page',
            default: 25
          },
          page: {
            type: 'number',
            description: 'Page number to return',
            default: 1
          }
        },
        required: []
      },
      handler: async ({ conditions, page_size = 25, page = 1 }: { 
        conditions?: string, 
        page_size?: number, 
        page?: number 
      }) => {
        try {
          const response = await connectWiseClient.searchCompanies(conditions, page_size, page);
          return { companies: response };
        } catch (error) {
          console.error('Error searching companies:', error);
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    },
    
    {
      name: 'cw_get_company',
      description: 'Get a company by ID',
      parameters: {
        type: 'object',
        properties: {
          company_id: {
            type: 'number',
            description: 'The ID of the company to retrieve'
          }
        },
        required: ['company_id']
      },
      handler: async ({ company_id }: { company_id: number }) => {
        try {
          const response = await connectWiseClient.getCompany(company_id);
          return { company: response };
        } catch (error) {
          console.error(`Error getting company ${company_id}:`, error);
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    },
    
    // Contact Functions
    {
      name: 'cw_search_contacts',
      description: 'Search for contacts in ConnectWise Manage',
      parameters: {
        type: 'object',
        properties: {
          conditions: {
            type: 'string',
            description: 'Conditions to filter contacts (using ConnectWise query format)'
          },
          page_size: {
            type: 'number',
            description: 'Number of contacts to return per page',
            default: 25
          },
          page: {
            type: 'number',
            description: 'Page number to return',
            default: 1
          }
        },
        required: []
      },
      handler: async ({ conditions, page_size = 25, page = 1 }: { 
        conditions?: string, 
        page_size?: number, 
        page?: number 
      }) => {
        try {
          const response = await connectWiseClient.searchContacts(conditions, page_size, page);
          return { contacts: response };
        } catch (error) {
          console.error('Error searching contacts:', error);
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    },
    
    {
      name: 'cw_get_contact',
      description: 'Get a contact by ID',
      parameters: {
        type: 'object',
        properties: {
          contact_id: {
            type: 'number',
            description: 'The ID of the contact to retrieve'
          }
        },
        required: ['contact_id']
      },
      handler: async ({ contact_id }: { contact_id: number }) => {
        try {
          const response = await connectWiseClient.getContact(contact_id);
          return { contact: response };
        } catch (error) {
          console.error(`Error getting contact ${contact_id}:`, error);
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    },
    
    // Configuration Functions
    {
      name: 'cw_get_boards',
      description: 'Get service boards',
      parameters: {
        type: 'object',
        properties: {
          conditions: {
            type: 'string',
            description: 'Conditions to filter boards (using ConnectWise query format)'
          }
        },
        required: []
      },
      handler: async ({ conditions }: { conditions?: string }) => {
        try {
          const response = await connectWiseClient.getBoards(conditions);
          return { boards: response };
        } catch (error) {
          console.error('Error getting boards:', error);
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    },
    
    {
      name: 'cw_get_members',
      description: 'Get members',
      parameters: {
        type: 'object',
        properties: {
          conditions: {
            type: 'string',
            description: 'Conditions to filter members (using ConnectWise query format)'
          }
        },
        required: []
      },
      handler: async ({ conditions }: { conditions?: string }) => {
        try {
          const response = await connectWiseClient.getMembers(conditions);
          return { members: response };
        } catch (error) {
          console.error('Error getting members:', error);
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    }
  ],
  events: [],
  resources: []
});

// Start the server
server.listen().catch((err: Error) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Log startup message
console.log('ConnectWise Manage MCP Server started');
console.log(`Company ID: ${process.env.CW_COMPANY_ID || 'Not set'}`);
console.log(`Base URL: ${process.env.CW_URL || 'api-na.myconnectwise.net'}`);
