import emailjs from '@emailjs/browser';

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

class EmailService {
  private serviceId: string;
  private templateId: string;
  private publicKey: string;

  constructor() {
    // These will be set via environment variables
    this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    this.templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
    
    // Initialize EmailJS
    if (this.publicKey) {
      emailjs.init(this.publicKey);
    }
  }

  async sendContactEmail(data: ContactFormData): Promise<EmailServiceResponse> {
    try {
      // Check if EmailJS is configured
      if (!this.serviceId || !this.templateId || !this.publicKey) {
        console.log('📧 EmailJS not configured, simulating email send...');
        console.log('📋 Contact data:', {
          name: data.name,
          email: data.email,
          company: data.company,
          projectType: data.projectType,
          message: data.message,
          wantsFreeConsultation: data.wantsFreeConsultation
        });
        
        // Simulate delay for better UX
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          success: true,
          message: 'Your message has been received! I\'ll respond within 24 hours. (Demo Mode)'
        };
      }

      // Real EmailJS implementation
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        company: data.company || 'Not specified',
        project_type: data.projectType,
        message: data.message,
        wants_consultation: data.wantsFreeConsultation ? 'Yes' : 'No',
        timestamp: new Date().toLocaleString(),
        to_name: 'Youssef',
        reply_to: data.email
      };

      console.log('📧 Sending email via EmailJS...');
      console.log('🔧 Template params:', templateParams);
      
      await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      console.log('✅ Email sent successfully via EmailJS');
      
      return {
        success: true,
        message: 'Your message has been sent successfully! I\'ll respond within 24 hours.'
      };

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return {
        success: false,
        message: 'Failed to send your message. Please try again or email me directly at youssef.m.ibrahim.zaky@gmail.com'
      };
    }
  }
}

export const emailService = new EmailService();