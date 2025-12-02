import { ValidationError } from "./exception";
import { NotFoundError } from "./exception";
import { UnauthorizedError } from "./exception";
import { TokenRefreshError } from "./exception";
const API_BASE_URL = 'http://localhost:8000';


class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  subscribeTokenRefresh(callback) {
    this.refreshSubscribers.push(callback);
  }

  onTokenRefreshed(newToken) {
    this.refreshSubscribers.forEach(callback => callback(newToken));
    this.refreshSubscribers = [];
  }

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      switch (response.status) {
        case 400:
          throw new ValidationError('Логин занят');
        case 401:
          if (response.url.includes('/auth') || response.url.includes('/refresh')) {
            throw new UnauthorizedError('Неправильный пароль');
          }
          return await this.handleUnauthorized(response);
        case 404:
          throw new NotFoundError('Пользователь не найден');
        default:
          throw new Error(errorData.message);
      }
    }

    return response.json();
  }

  async handleUnauthorized(response) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      try {
        const newTokens = await this.refreshToken();
        localStorage.setItem('auth_token', newTokens.access_token);
        this.onTokenRefreshed(newTokens.access_token);
        this.isRefreshing = false;
        return await this.retryOriginalRequest(response);
      } catch (err) {
        this.isRefreshing = false;
        this.clearAuth();
        throw new UnauthorizedError(err.message || 'Authentication failed');
      }
    } else {
      return new Promise((resolve) => {
        this.subscribeTokenRefresh((newToken) => {
          resolve(this.retryOriginalRequest(response));
        });
      });
    }
  }

  async retryOriginalRequest(originalResponse) {
    const originalRequest = originalResponse.clone();
    const token = localStorage.getItem('auth_token');
    const requestOptions = {
      method: originalRequest.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    };
    if (originalRequest.method !== 'GET' && originalRequest.method !== 'HEAD') {
      requestOptions.body = await originalRequest.text();
    }
    const newResponse = await fetch(originalRequest.url, requestOptions);
    return this.handleResponse(newResponse);
  }

  clearAuth() {
    localStorage.removeItem('auth_token');
  }

  async refreshToken() {
    const response = await fetch(`${this.baseURL}/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Token refresh failed' }));
      this.clearAuth();
      throw new TokenRefreshError(errorData.message);
    }

    return response.json();
  }

  async getAllProjects() {
    const response = await fetch(`${this.baseURL}/project`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response);
  }

  async getProjectById(projectId) {
    const response = await fetch(`${this.baseURL}/project/${projectId}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response);
  }

async addProject(name, description) {
  const requestBody = {
    name: name, 
    description: description
  };
  const response = await fetch(`${this.baseURL}/project`, {
    method: 'POST',
    headers: this.getHeaders(),
    body: JSON.stringify(requestBody),
    credentials: 'include'
  });
  
  return this.handleResponse(response);
}

  async updateProject(id, name, description) {
    const response = await fetch(`${this.baseURL}/project/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        id: id,
        name: name, 
        description: description 
      }),
      credentials: 'include'
    });
    return this.handleResponse(response);
  }

  async deleteProject(id) {
    const response = await fetch(`${this.baseURL}/project/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response);
  }

  async auth(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await fetch(`${this.baseURL}/auth`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const tokens = await this.handleResponse(response);
    if (tokens.access_token) {
      localStorage.setItem('auth_token', tokens.access_token);
    }
    return tokens;
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.warn(err.message);
    } finally {
      this.clearAuth();
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }

  async registration(nickname, email, password) {
    const formData = new FormData();
    formData.append('nickname', nickname);
    formData.append('email', email);
    formData.append('password', password);
    const response = await fetch(`${this.baseURL}/registration`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    return this.handleResponse(response);
  }

  async get_user(){
    const response = await fetch(`${this.baseURL}/user`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();