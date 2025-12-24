import { apiService } from "./api";
const API_BASE_URL = 'http://localhost:8000';

class PatternApi {
  constructor() {
    apiService.baseURL = API_BASE_URL;
    apiService.isRefreshing = false;
    apiService.refreshSubscribers = [];
  }
  
  async get() {
    const response = await fetch(`${apiService.baseURL}/pattern`, {
      method: 'GET',
      headers: apiService.getHeaders(),
      credentials: 'include'
    });
    return apiService.handleResponse(response);
  }
  
  async getById(id) {
    const response = await fetch(`${apiService.baseURL}/pattern/${id}`, {
      method: 'GET',
      headers: apiService.getHeaders(),
      credentials: 'include'
    });
    return apiService.handleResponse(response);
  }

  async create(name, fields) {
    const requestBody = {
      name: name,
      fields: fields
    };
    const response = await fetch(`${apiService.baseURL}/pattern`, {
      method: 'POST',
      headers: apiService.getHeaders(),
      body: JSON.stringify(requestBody),
      credentials: 'include'
    });
    return apiService.handleResponse(response);
  }

  async update(id, name, fields) {
    const response = await fetch(`${apiService.baseURL}/pattern/${id}`, {
      method: 'PUT',
      headers: apiService.getHeaders(),
      body: JSON.stringify({
        id: id,
        name: name,
        fields: fields
      }),
      credentials: 'include'
    });
    return apiService.handleResponse(response);
  }

  async delete(id) {
    const response = await fetch(`${apiService.baseURL}/pattern/${id}`, {
      method: 'DELETE',
      headers: apiService.getHeaders(),
      credentials: 'include'
    });
    return apiService.handleResponse(response);
  }
}

export const patternApi = new PatternApi();