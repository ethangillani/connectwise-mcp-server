# ConnectWise Manage MCP Server

A Model Context Protocol server that provides integration with the ConnectWise Manage API. This server enables Claude to interact with ConnectWise Manage to perform operations like retrieving tickets, companies, contacts, and more.

## Features

- Authentication with ConnectWise Manage API using API keys
- Support for retrieving tickets, companies, contacts, and other entities
- Ability to create, update, and delete entities
- Filtering and pagination support for queries

## Installation

### Using NPM

```bash
npm install -g connectwise-mcp-server
```

### Manual Setup

1. Clone this repository
2. Install dependencies with `npm install`
3. Build the project with `npm run build`
4. Start the server with `npm start`

## Configuration

To use this MCP server, you'll need to provide ConnectWise Manage API credentials:

- Company ID
- Public Key
- Private Key
- ConnectWise Manage URL (e.g., api-na.myconnectwise.net)

### Claude Desktop Configuration

Add the following to your Claude Desktop configuration file (typically located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "connectwise": {
      "command": "npx",
      "args": ["-y", "connectwise-mcp-server"],
      "env": {
        "CW_COMPANY_ID": "your_company_id",
        "CW_PUBLIC_KEY": "your_public_key",
        "CW_PRIVATE_KEY": "your_private_key",
        "CW_URL": "api-na.myconnectwise.net"
      },
      "options": {
        "autoStart": true,
        "logLevel": "info"
      }
    }
  }
}
```

## Available Functions

### Search Tickets

Searches for service tickets in ConnectWise Manage.

```
cw_search_tickets(conditions, page_size, page)
```

### Get Ticket

Retrieves a specific service ticket by ID.

```
cw_get_ticket(ticket_id)
```

### Create Ticket

Creates a new service ticket.

```
cw_create_ticket(summary, description, board_id, company_id)
```

### Search Companies

Searches for companies in ConnectWise Manage.

```
cw_search_companies(conditions, page_size, page)
```

### Get Company

Retrieves a specific company by ID.

```
cw_get_company(company_id)
```

## License

MIT
