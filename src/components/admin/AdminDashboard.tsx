import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import axios from 'axios';

interface Contact {
  _id: string;
  name: string;
  email: string;
  company?: string;
  projectType: string;
  message: string;
  wantsFreeConsultation: boolean;
  createdAt: string;
  ip?: string;
  userAgent?: string;
}

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectTypeFilter, setProjectTypeFilter] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    consultationRequests: 0
  });

  const apiUrl = import.meta.env.PROD 
    ? 'https://joedev.net/api' 
    : 'http://localhost:3000/api';

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (projectTypeFilter) params.append('projectType', projectTypeFilter);

      const response = await axios.get(`${apiUrl}/admin?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setContacts(response.data.data);
        setTotalPages(response.data.pagination.pages);
        
        // Calculate stats
        const total = response.data.pagination.total;
        const thisMonth = response.data.data.filter((contact: Contact) => {
          const contactDate = new Date(contact.createdAt);
          const now = new Date();
          return contactDate.getMonth() === now.getMonth() && 
                 contactDate.getFullYear() === now.getFullYear();
        }).length;
        const consultationRequests = response.data.data.filter(
          (contact: Contact) => contact.wantsFreeConsultation
        ).length;

        setStats({ total, thisMonth, consultationRequests });
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        onLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await axios.delete(`${apiUrl}/admin?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchContacts(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentPage, searchTerm, projectTypeFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProjectTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'web-development': 'bg-blue-100 text-blue-800',
      'mobile-app': 'bg-green-100 text-green-800',
      'ui-ux-design': 'bg-purple-100 text-purple-800',
      'consultation': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <Button onClick={onLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Total Contacts</h3>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">This Month</h3>
                <div className="text-3xl font-bold text-green-600">{stats.thisMonth}</div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Consultation Requests</h3>
                <div className="text-3xl font-bold text-purple-600">{stats.consultationRequests}</div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
                  <SelectTrigger className="max-w-sm">
                    <SelectValue placeholder="Filter by project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="web-development">Web Development</SelectItem>
                    <SelectItem value="mobile-app">Mobile App</SelectItem>
                    <SelectItem value="ui-ux-design">UI/UX Design</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Contacts List */}
            {isLoading ? (
              <div className="text-center py-8">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
                <p className="text-gray-600">Try adjusting your search criteria.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <Card key={contact._id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{contact.name}</h3>
                        <p className="text-gray-600">{contact.email}</p>
                        {contact.company && (
                          <p className="text-sm text-gray-500">{contact.company}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getProjectTypeBadgeColor(contact.projectType)}>
                          {contact.projectType.replace('-', ' ')}
                        </Badge>
                        {contact.wantsFreeConsultation && (
                          <Badge variant="secondary">Consultation</Badge>
                        )}
                        <Button
                          onClick={() => deleteContact(contact._id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Message:</h4>
                      <p className="text-gray-700 dark:text-gray-300">{contact.message}</p>
                    </div>
                    
                    <div className="text-sm text-gray-500 flex justify-between">
                      <span>Submitted: {formatDate(contact.createdAt)}</span>
                      {contact.ip && <span>IP: {contact.ip}</span>}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}