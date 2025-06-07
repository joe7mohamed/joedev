// API client for backend communication
// In production, these would call actual backend endpoints

export interface SessionBooking {
  _id?: string;
  name: string;
  email: string;
  company?: string;
  projectType: string;
  budget: string;
  timeline: string;
  description: string;
  preferredDate?: string;
  preferredTime?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  calendarEventId?: string;
  meetingLink?: string;
}

export interface AdminUser {
  username: string;
  role: 'admin';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
  refreshToken: string;
  expiresIn: number;
}


// Mock data storage (in production, this would be handled by the backend)
const mockBookings: SessionBooking[] = [];

// Session Booking APIs
export async function createSessionBooking(booking: Omit<SessionBooking, '_id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<SessionBooking> {
  // In production, this would be:
  // const response = await fetch(`${API_BASE_URL}/bookings`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(booking)
  // });
  // return response.json();

  // Mock implementation
  const newBooking: SessionBooking = {
    ...booking,
    _id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockBookings.push(newBooking);
  console.log('Session booking created:', newBooking);
  return newBooking;
}

export async function getAllSessionBookings(): Promise<SessionBooking[]> {
  // In production:
  // const response = await fetch(`${API_BASE_URL}/bookings`, {
  //   headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
  // });
  // return response.json();

  // Use contact storage for real data
  try {
    const { getContactSubmissions } = await import('../lib/contactStorage');
    const submissions = await getContactSubmissions();
    
    // Convert contact submissions to session bookings format
    return submissions.map((submission: { _id?: string; name: string; email: string; company?: string; projectType: string; message: string; submittedAt: Date }) => ({
      _id: submission._id!,
      name: submission.name,
      email: submission.email,
      company: submission.company,
      projectType: submission.projectType,
      budget: 'To be discussed',
      timeline: 'To be discussed',
      description: submission.message,
      preferredDate: undefined,
      preferredTime: undefined,
      status: 'pending' as const,
      createdAt: submission.submittedAt,
      updatedAt: submission.submittedAt,
    }));
  } catch (error) {
    console.error('Error fetching session bookings:', error);
    return mockBookings;
  }
}

export async function updateSessionBooking(id: string, updates: Partial<SessionBooking>): Promise<SessionBooking | null> {
  // In production:
  // const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
  //   method: 'PATCH',
  //   headers: { 
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${getStoredAuthToken()}` 
  //   },
  //   body: JSON.stringify(updates)
  // });
  // return response.json();

  // Mock implementation
  const index = mockBookings.findIndex(b => b._id === id);
  if (index === -1) return null;
  
  mockBookings[index] = {
    ...mockBookings[index],
    ...updates,
    updatedAt: new Date()
  };
  
  return mockBookings[index];
}

export async function deleteSessionBooking(id: string): Promise<boolean> {
  // In production:
  // const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
  //   method: 'DELETE',
  //   headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
  // });
  // return response.ok;

  // Mock implementation
  const index = mockBookings.findIndex(b => b._id === id);
  if (index === -1) return false;
  
  mockBookings.splice(index, 1);
  return true;
}

// Authentication APIs
export async function validateAdminCredentials(credentials: LoginCredentials): Promise<boolean> {
  // In production:
  // const response = await fetch(`${API_BASE_URL}/auth/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials)
  // });
  // return response.ok;

  // Mock implementation - DO NOT use in production!
  return credentials.username === 'joeadmin' && credentials.password === 'JoeAdmin2024!';
}

export function generateAuthTokens(user: AdminUser): AuthToken {
  // In production, this would be handled by the backend
  // Here we create a mock token
  const mockToken = btoa(JSON.stringify({ user, iat: Date.now() }));
  
  return {
    token: mockToken,
    refreshToken: mockToken + '_refresh',
    expiresIn: 3600,
  };
}

export function verifyToken(token: string): AdminUser | null {
  // In production, this would verify with the backend
  // Mock implementation
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.user && decoded.iat && Date.now() - decoded.iat < 3600000) {
      return decoded.user;
    }
  } catch {
    // Invalid token
  }
  return null;
}

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_refresh_token');
}

export function storeAuthTokens(authToken: AuthToken): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('admin_token', authToken.token);
  localStorage.setItem('admin_refresh_token', authToken.refreshToken);
  localStorage.setItem('admin_token_expires', (Date.now() + authToken.expiresIn * 1000).toString());
}

export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_token_expires');
}

export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;
  
  const expiresAt = localStorage.getItem('admin_token_expires');
  if (!expiresAt) return true;
  
  return Date.now() > parseInt(expiresAt);
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  const token = getStoredAuthToken();
  if (!token) return null;

  if (isTokenExpired()) {
    clearAuthTokens();
    return null;
  }

  return verifyToken(token);
}

