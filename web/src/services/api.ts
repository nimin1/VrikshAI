/**
 * VrikshAI API Service
 *
 * Handles all API communication with the backend.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'react-toastify';
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  DarshanRequest,
  DarshanResponse,
  ChikitsaRequest,
  ChikitsaResponse,
  SevaRequest,
  SevaResponse,
  VanaResponse,
  PlantResponse,
  AddPlantRequest,
  UpdatePlantRequest,
  ApiError,
} from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api');
const API_TIMEOUT = 30000; // 30 seconds

// Token management
const TOKEN_KEY = 'vriksh_ai_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.error || 'An error occurred';

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/auth';
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// Auth API
// ============================================================================

export async function login(data: LoginRequest): Promise<AuthResponse> {
  console.log('api.login - Making request to /auth/login');
  const response = await apiClient.post<any>('/auth/login', data);
  console.log('api.login - Response received:', response);
  console.log('api.login - Response data:', response.data);
  console.log('api.login - Response data type:', typeof response.data);

  // TEMP FIX: If response.data is a string (HTTP response), parse the JSON from it
  let responseData: any = response.data;
  if (typeof responseData === 'string') {
    console.log('api.login - Response is a string, parsing JSON...');
    // Extract JSON from HTTP response string
    const jsonMatch = (responseData as string).match(/\{.*\}/s);
    if (jsonMatch) {
      responseData = JSON.parse(jsonMatch[0]);
      console.log('api.login - Parsed JSON:', responseData);
    }
  }

  console.log('api.login - Token:', responseData.token);
  console.log('api.login - User:', responseData.user);
  setToken(responseData.token);
  console.log('api.login - Token saved to localStorage');
  return responseData as AuthResponse;
}

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const response = await apiClient.post<any>('/auth/signup', data);

  // TEMP FIX: If response.data is a string (HTTP response), parse the JSON from it
  let responseData: any = response.data;
  if (typeof responseData === 'string') {
    const jsonMatch = (responseData as string).match(/\{.*\}/s);
    if (jsonMatch) {
      responseData = JSON.parse(jsonMatch[0]);
    }
  }

  setToken(responseData.token);
  return responseData as AuthResponse;
}

export function logout(): void {
  removeToken();
  window.location.href = '/auth';
}

export async function verifyToken(): Promise<{ success: boolean; user?: any }> {
  try {
    const response = await apiClient.get<any>('/auth/verify');

    // TEMP FIX: If response.data is a string (HTTP response), parse the JSON from it
    let responseData: any = response.data;
    if (typeof responseData === 'string') {
      const jsonMatch = responseData.match(/\{.*\}/s);
      if (jsonMatch) {
        responseData = JSON.parse(jsonMatch[0]);
      }
    }

    return { success: true, user: responseData.user };
  } catch (error) {
    return { success: false };
  }
}

// ============================================================================
// Darshan API (Plant Identification)
// ============================================================================

export async function aiDarshan(data: DarshanRequest): Promise<DarshanResponse> {
  // Backend expects image_base64, not image
  const requestData = {
    image_base64: data.image
  };

  const response = await apiClient.post<any>('/darshan', requestData);

  // TEMP FIX: If response.data is a string (HTTP response), parse the JSON from it
  let responseData: any = response.data;
  if (typeof responseData === 'string') {
    const jsonMatch = responseData.match(/\{.*\}/s);
    if (jsonMatch) {
      responseData = JSON.parse(jsonMatch[0]);
    }
  }

  // Backend returns {success, darshan}, frontend expects {result, timestamp}
  return {
    result: responseData.darshan,
    timestamp: new Date().toISOString()
  } as DarshanResponse;
}

// ============================================================================
// Chikitsa API (Health Diagnosis)
// ============================================================================

export async function aiChikitsa(data: ChikitsaRequest): Promise<ChikitsaResponse> {
  const response = await apiClient.post<ChikitsaResponse>('/chikitsa', data);
  return response.data;
}

// ============================================================================
// Seva API (Care Schedules)
// ============================================================================

export async function sevaSchedule(data: SevaRequest): Promise<SevaResponse> {
  const response = await apiClient.post<SevaResponse>('/seva', data);
  return response.data;
}

// ============================================================================
// Vana API (Plant Collection)
// ============================================================================

export async function getMeraVana(): Promise<VanaResponse> {
  const response = await apiClient.get<VanaResponse>('/vana');
  return response.data;
}

export async function getPlant(plantId: string): Promise<PlantResponse> {
  const response = await apiClient.get<PlantResponse>(`/vana/${plantId}`);
  return response.data;
}

export async function addPlant(data: AddPlantRequest): Promise<PlantResponse> {
  const response = await apiClient.post<PlantResponse>('/vana', data);
  return response.data;
}

export async function updatePlant(
  plantId: string,
  data: UpdatePlantRequest
): Promise<PlantResponse> {
  const response = await apiClient.put<PlantResponse>(`/vana/${plantId}`, data);
  return response.data;
}

export async function deletePlant(plantId: string): Promise<void> {
  await apiClient.delete(`/vana/${plantId}`);
}

// ============================================================================
// Image Utilities
// ============================================================================

/**
 * Convert image file to base64 string for API upload.
 */
export async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file size (max 5MB).
 */
export function validateImageSize(file: File): boolean {
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  return file.size <= MAX_SIZE_BYTES;
}

/**
 * Validate image file type.
 */
export function validateImageType(file: File): boolean {
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return ALLOWED_TYPES.includes(file.type);
}

/**
 * Compress image using canvas (client-side compression).
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1024,
  quality: number = 0.75
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Process image for upload: validate, compress, and convert to base64.
 */
export async function processImageForUpload(file: File): Promise<string> {
  // Validate type
  if (!validateImageType(file)) {
    throw new Error('Invalid image type. Please use JPEG, PNG, or WebP.');
  }

  // Compress image
  const compressedFile = await compressImage(file);

  // Validate size after compression
  if (!validateImageSize(compressedFile)) {
    throw new Error('Image size exceeds 5MB limit even after compression.');
  }

  // Convert to base64
  const base64 = await convertImageToBase64(compressedFile);

  return base64;
}
