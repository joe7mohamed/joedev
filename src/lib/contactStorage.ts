// Contact storage with localStorage fallback

export interface ContactSubmission {
  _id?: string;
  name: string;
  email: string;
  company?: string;
  projectType: string;
  message: string;
  wantsFreeConsultation: boolean;
  submittedAt: Date;
  read: boolean;
}

// Placeholder functions for backward compatibility
export async function saveContactSubmission(data: Omit<ContactSubmission, '_id' | 'submittedAt' | 'read'>): Promise<{ insertedId: string }> {
  // This function is no longer used since we're using email service
  console.log('Contact submission data:', data);
  return { insertedId: Date.now().toString() };
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  // Return empty array since we're not storing contacts anymore
  return [];
}

export async function updateContactSubmission(id: string, updates: Partial<ContactSubmission>): Promise<void> {
  // Placeholder function
  console.log('Update contact:', id, updates);
}

export async function deleteContactSubmission(id: string): Promise<void> {
  // Placeholder function  
  console.log('Delete contact:', id);
}