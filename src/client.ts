import axios, { AxiosInstance } from 'axios';

interface ConnectWiseClientConfig {
  companyId: string;
  publicKey: string;
  privateKey: string;
  baseUrl: string;
}

interface Ticket {
  id?: number;
  summary: string;
  description?: string;
  board: { id: number };
  company: { id: number };
  contact?: { id: number };
  status?: { id: number };
  priority?: { id: number };
  [key: string]: any;
}

class ConnectWiseClient {
  private client: AxiosInstance;
  private config: ConnectWiseClientConfig;

  constructor(config: ConnectWiseClientConfig) {
    this.config = config;
    
    if (!config.companyId || !config.publicKey || !config.privateKey) {
      console.warn('ConnectWise credentials not fully provided. Some API calls may fail.');
    }
    
    const auth = Buffer.from(`${config.companyId}+${config.publicKey}:${config.privateKey}`).toString('base64');
    
    this.client = axios.create({
      baseURL: `https://${config.baseUrl}/v4_6_release/apis/3.0`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  /**
   * Search for service tickets
   */
  async searchTickets(conditions?: string, pageSize: number = 25, page: number = 1): Promise<any[]> {
    try {
      const params: Record<string, any> = {
        pageSize,
        page,
      };
      
      if (conditions) {
        params.conditions = conditions;
      }
      
      const response = await this.client.get('/service/tickets', { params });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Error searching tickets');
      return [];
    }
  }
  
  /**
   * Get a specific ticket by ID
   */
  async getTicket(ticketId: number): Promise<any> {
    try {
      const response = await this.client.get(`/service/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error, `Error getting ticket ${ticketId}`);
      throw error;
    }
  }
  
  /**
   * Create a new ticket
   */
  async createTicket(ticketData: Ticket): Promise<any> {
    try {
      const response = await this.client.post('/service/tickets', ticketData);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Error creating ticket');
      throw error;
    }
  }
  
  /**
   * Update an existing ticket
   */
  async updateTicket(ticketId: number, ticketData: Partial<Ticket>): Promise<any> {
    try {
      const response = await this.client.patch(`/service/tickets/${ticketId}`, ticketData);
      return response.data;
    } catch (error) {
      this.handleApiError(error, `Error updating ticket ${ticketId}`);
      throw error;
    }
  }
  
  /**
   * Search for companies
   */
  async searchCompanies(conditions?: string, pageSize: number = 25, page: number = 1): Promise<any[]> {
    try {
      const params: Record<string, any> = {
        pageSize,
        page,
      };
      
      if (conditions) {
        params.conditions = conditions;
      }
      
      const response = await this.client.get('/company/companies', { params });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Error searching companies');
      return [];
    }
  }
  
  /**
   * Get a specific company by ID
   */
  async getCompany(companyId: number): Promise<any> {
    try {
      const response = await this.client.get(`/company/companies/${companyId}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error, `Error getting company ${companyId}`);
      throw error;
    }
  }
  
  /**
   * Search for contacts
   */
  async searchContacts(conditions?: string, pageSize: number = 25, page: number = 1): Promise<any[]> {
    try {
      const params: Record<string, any> = {
        pageSize,
        page,
      };
      
      if (conditions) {
        params.conditions = conditions;
      }
      
      const response = await this.client.get('/company/contacts', { params });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Error searching contacts');
      return [];
    }
  }
  
  /**
   * Get a specific contact by ID
   */
  async getContact(contactId: number): Promise<any> {
    try {
      const response = await this.client.get(`/company/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error, `Error getting contact ${contactId}`);
      throw error;
    }
  }
  
  /**
   * Get service boards
   */
  async getBoards(conditions?: string): Promise<any[]> {
    try {
      const params: Record<string, any> = {};
      
      if (conditions) {
        params.conditions = conditions;
      }
      
      const response = await this.client.get('/service/boards', { params });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Error getting service boards');
      return [];
    }
  }
  
  /**
   * Get members
   */
  async getMembers(conditions?: string): Promise<any[]> {
    try {
      const params: Record<string, any> = {};
      
      if (conditions) {
        params.conditions = conditions;
      }
      
      const response = await this.client.get('/system/members', { params });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Error getting members');
      return [];
    }
  }
  
  /**
   * Handle API errors consistently
   */
  private handleApiError(error: any, message: string): void {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const responseData = error.response?.data;
      
      console.error(`${message}: ${statusCode}`, responseData);
      
      if (statusCode === 401) {
        console.error('Authentication error: Check your ConnectWise credentials');
      }
    } else {
      console.error(`${message}:`, error);
    }
  }
}

export default ConnectWiseClient;