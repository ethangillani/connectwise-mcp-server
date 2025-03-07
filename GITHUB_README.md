# ConnectWise Manage MCP Server for Claude

A Model Context Protocol (MCP) server that integrates Claude with the ConnectWise Manage API. This allows Claude to interact directly with your ConnectWise Manage instance to retrieve tickets, companies, contacts, and more.

![ConnectWise Manage + Claude](/docs/images/banner.png)

## Features

- 🔑 Simple authentication with ConnectWise Manage API keys
- 🎫 Retrieve and search service tickets
- 🏢 Access company information
- 👤 Look up contact details
- 🔧 Create and update tickets
- 📋 Query service boards and other configuration data

## Why Use It?

- Enable Claude to directly access your ConnectWise Manage data
- Ask natural language questions about your tickets, companies, and contacts
- Have Claude create tickets and updates based on your conversations
- Integrate your MSP operations with Claude's powerful AI capabilities

## Installation

### Prerequisites

- Node.js 16+
- A ConnectWise Manage instance
- ConnectWise Manage API credentials (Company ID, Public Key, Private Key)

### Installation Steps

1. Install the package globally:
   ```bash
   npm install -g connectwise-mcp-server
   ```

2. Configure your Claude Desktop to use the server (see Configuration section below)

### Building from Source

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/connectwise-mcp-server.git
   cd connectwise-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Link for local development (optional):
   ```bash
   npm link
   ```

## Configuration

### Setting up API Credentials

1. In ConnectWise Manage, create an API Member and API Key
2. Make sure the API Member has appropriate permissions for the operations you want to perform

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

Replace the placeholder values with your actual ConnectWise Manage API credentials.

## Available Functions

| Function | Description |
|----------|-------------|
| `cw_search_tickets` | Search for service tickets using ConnectWise conditions |
| `cw_get_ticket` | Retrieve a specific ticket by ID |
| `cw_create_ticket` | Create a new service ticket |
| `cw_search_companies` | Search for companies using ConnectWise conditions |
| `cw_get_company` | Retrieve a specific company by ID |
| `cw_search_contacts` | Search for contacts using ConnectWise conditions |
| `cw_get_contact` | Retrieve a specific contact by ID |
| `cw_get_boards` | Get a list of service boards |
| `cw_get_members` | Get a list of members |

## Example Usage with Claude

Once you've properly configured the ConnectWise MCP server with Claude Desktop, you can use it in your conversations. Here are some examples:

**Searching for tickets**
```
Please search for any open tickets that contain the word "server" in the summary.
```

**Creating a ticket**
```
Create a new ConnectWise ticket for company ABC Corp with the summary "Email server not responding" and assign it to the Help Desk board.
```

**Looking up company information**
```
Can you find the contact information for Acme, Inc. in our ConnectWise system?
```

## Security Considerations

- API keys provide full access to your ConnectWise Manage instance based on the permissions of the API Member
- Store your credentials securely and never share your configuration file
- Consider creating a dedicated API Member with limited permissions specific to the functionality you need

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The Model Context Protocol developers at Anthropic
- ConnectWise for their API documentation
