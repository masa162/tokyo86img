import axios from 'axios';
import type { ApiResponse, Work, Episode, Illustration, IllustrationInput, EpisodeInput } from '@unbelong/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const worksApi = {
  list: (type?: string) => 
    client.get<ApiResponse<Work[]>>('/api/works', { params: { type } }),
  get: (id: string) => 
    client.get<ApiResponse<Work>>(`/api/works/${id}`),
};

export const illustrationsApi = {
  list: () => 
    client.get<ApiResponse<Illustration[]>>('/api/illustrations'),
  get: (id: string) => 
    client.get<ApiResponse<Illustration>>(`/api/illustrations/${id}`),
  create: (data: IllustrationInput) => 
    client.post<ApiResponse<Illustration>>('/api/illustrations', data),
  update: (id: string, data: Partial<IllustrationInput>) => 
    client.put<ApiResponse<Illustration>>(`/api/illustrations/${id}`, data),
  delete: (id: string) => 
    client.delete<ApiResponse<void>>(`/api/illustrations/${id}`),
};

export const episodesApi = {
  list: (workId?: string) => 
    client.get<ApiResponse<Episode[]>>('/api/episodes', { params: { workId } }),
  get: (id: string) => 
    client.get<ApiResponse<Episode>>(`/api/episodes/${id}`),
  create: (data: EpisodeInput) => 
    client.post<ApiResponse<Episode>>('/api/episodes', data),
  update: (id: string, data: Partial<EpisodeInput>) => 
    client.put<ApiResponse<Episode>>(`/api/episodes/${id}`, data),
  delete: (id: string) => 
    client.delete<ApiResponse<void>>(`/api/episodes/${id}`),
};

export const imageApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<ApiResponse<{ id: string; filename: string; variants: string[] }>>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default client;
