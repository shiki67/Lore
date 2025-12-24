import { apiService } from "./api";
const API_BASE_URL = 'http://localhost:8000';


class NoteApi {
  constructor() {
    apiService.baseURL = API_BASE_URL;
    apiService.isRefreshing = false;
    apiService.refreshSubscribers = [];
  }
  async getNotes() {
    const response = await fetch(`${apiService.baseURL}/note`, {
      method: 'GET',
      headers: apiService.getHeaders(),
      credentials: 'include'
    });
    return apiService.handleResponse(response);
  }
  async getNotesForProject(project_id) {
    const response = await fetch(`${apiService.baseURL}/note/project/${project_id}`, {
      method: 'GET',
      headers: apiService.getHeaders(),
      credentials: 'include'
    });
    const notes = await apiService.handleResponse(response);
    console.log('API: Заметки для проекта', project_id, ':', notes); // Для отладки
    return notes;
  }
  async getNotesWithoutProject() {
    const allNotes = await this.getNotes();
    
    const freeNotes = allNotes.filter(note => 
      !note.project_id
    );
    return freeNotes
  }

  async getNoteById(id) {
    const response = await fetch(`${apiService.baseURL}/note/${id}`, {
      method: 'GET',
      headers: apiService.getHeaders(),
      credentials: 'include'
    });
    return apiService.handleResponse(response);
  }

    async addForm(data, pattern_id) {
    const requestBody = {
        data: data,
        pattern_id: pattern_id,
    };
    console.log('Тело запроса для создания:', requestBody);
    const response = await fetch(`${apiService.baseURL}/note`, {
        method: 'POST',
        headers: apiService.getHeaders(),
        body: JSON.stringify(requestBody),
        credentials: 'include'
    });
    return apiService.handleResponse(response);
    }

  async update(id, data, project_id) {
    console.log(data, project_id);
    const response = await fetch(`${apiService.baseURL}/note/${id}`, {
      method: 'PUT',
      headers: apiService.getHeaders(),
      body: JSON.stringify({
        id: id,
        data: data,
        project_id: project_id,
      }),
      credentials: 'include'
    });
    return apiService.handleResponse(response);
  }

  async delete(id) {
    const response = await fetch(`${apiService.baseURL}/note/${id}`, {
      method: 'DELETE',
      headers: apiService.getHeaders(),
      credentials: 'include'
    });
    return apiService.handleResponse(response);
  }
}

export const noteApi = new NoteApi();