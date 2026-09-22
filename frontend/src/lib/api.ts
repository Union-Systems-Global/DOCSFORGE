const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },
  post: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },
  put: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('API Request Failed');
    return res.json();
  }
};
