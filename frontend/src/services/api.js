const API_BASE_URL = process.env.REACT_APP_API_URL || import.meta.env.VITE_REACT_APP_API_URL;


class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(username, password) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async verifyToken() {
    if (!this.token) {
      throw new Error('No token available');
    }
    
    return await this.makeRequest('/auth/verify');
  }

  logout() {
    this.setToken(null);
  }

  // Shipment endpoints
  async getShipments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/shipments?${queryString}` : '/shipments';
    return await this.makeRequest(endpoint);
  }

  async getShipment(id) {
    return await this.makeRequest(`/shipments/${id}`);
  }

  async createShipment(shipmentData) {
    return await this.makeRequest('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  }

  async updateShipment(id, shipmentData) {
    return await this.makeRequest(`/shipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shipmentData),
    });
  }

  async deleteShipment(id) {
    return await this.makeRequest(`/shipments/${id}`, {
      method: 'DELETE',
    });
  }

  async getShipmentStats() {
    return await this.makeRequest('/shipments/stats/summary');
  }
}

export default new ApiService();
