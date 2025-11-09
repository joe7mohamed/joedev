import axios from 'axios';

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  projectType: string;
  message: string;
  wantsFreeConsultation: boolean;
}

export interface EmailServiceResponse {
  success: boolean;
  message: string;
}

class ContactService {
  private apiUrl: string;

  constructor() {
    // Use the current domain for API calls
    this.apiUrl = import.meta.env.PROD 
      ? 'https://joedev.net/api' 
      : 'http://localhost:3000/api';
  }

  async submitContact(data: ContactFormData): Promise<EmailServiceResponse> {
    try {
      console.log('📧 Submitting contact form to MongoDB...');
      console.log('📋 Contact data:', {
        name: data.name,
        email: data.email,
        company: data.company,
        projectType: data.projectType,
        message: data.message,
        wantsFreeConsultation: data.wantsFreeConsultation
      });
      
      const response = await axios.post(`${this.apiUrl}/contacts`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      if (response.data.success) {
        console.log('✅ Contact form submitted successfully');
        return {
          success: true,
          message: 'Your message has been received! I\'ll respond within 24 hours.'
        };
      } else {
        throw new Error(response.data.message || 'Failed to submit contact form');
      }

    } catch (error) {
      console.error('❌ Failed to submit contact form:', error);
      
      // Provide user-friendly error messages
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return {
            success: false,
            message: 'Request timeout. Please check your connection and try again.'
          };
        }
        if (error.response?.status === 429) {
          return {
            success: false,
            message: 'Too many requests. Please wait a moment and try again.'
          };
        }
        if (error.response && error.response.status >= 500) {
          return {
            success: false,
            message: 'Server error. Please try again later or email me directly at youssef.m.ibrahim.zaky@gmail.com'
          };
        }
      }
      
      return {
        success: false,
        message: 'Failed to send your message. Please try again or email me directly at youssef.m.ibrahim.zaky@gmail.com'
      };
    }
  }
}

export const contactService = new ContactService();