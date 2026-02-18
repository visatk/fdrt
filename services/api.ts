import axios from 'axios';

// Replace with your actual Worker URL
const API_URL = 'http://localhost:8787';

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at?: number;
  updated_at?: number;
}

export const api = {
  getNotes: async (): Promise<Note[]> => {
    const res = await axios.get(`${API_URL}/notes`);
    return res.data;
  },

  getNote: async (id: string): Promise<Note> => {
    const res = await axios.get(`${API_URL}/notes/${id}`);
    return res.data;
  },

  saveNote: async (note: Partial<Note>): Promise<{ id: string }> => {
    const res = await axios.put(`${API_URL}/notes`, note);
    return res.data;
  },

  deleteNote: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/notes/${id}`);
  },
};
