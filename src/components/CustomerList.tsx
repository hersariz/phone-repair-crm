import { useState, useEffect } from 'react';
import { Customer, ServiceTicket } from '../types';
import { Plus, Search, History, MessageCircle, Mail, X, Calendar, Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import CustomerForm from './CustomerForm';

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [formData, setFormData] = useState<Customer | null>(null);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [selectedCustomerTickets, setSelectedCustomerTickets] = useState<ServiceTicket[]>([]);

  useEffect(() => {
    const storedCustomers = localStorage.getItem('customers');
    const storedTickets = localStorage.getItem('tickets');
    
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    }
    
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets));
    }
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleSaveCustomer = (customer: Customer) => {
    if (customers.some(c => c.id === customer.id)) {
      const updatedCustomers = customers.map(c => (c.id === customer.id ? customer : c));
      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    } else {
      const newCustomers = [...customers, customer];
      setCustomers(newCustomers);
      localStorage.setItem('customers', JSON.stringify(newCustomers));
    }
    setShowForm(false);
    setSelectedCustomer(null);
    setFormData(null);
  };

  const handleEditCustomer = (customer: Customer) => {
    setFormData(customer);
    setShowForm(true);
    setSelectedCustomer(customer.id);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setSelectedCustomer(null);
    setFormData(null);
  };

  const handleAddNewCustomer = () => {
    setFormData(null);
    setShowForm(true);
    setSelectedCustomer(null);
  };

  const handleShowServiceHistory = (customerId: string) => {
    const customerTickets = tickets.filter(ticket => ticket.customerId === customerId);
    setSelectedCustomerTickets(customerTickets);
    setShowServiceHistory(true);
    setSelectedCustomer(customerId);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'in-progress':
        return 'Dalam Proses';
      case 'failed':
        return 'Tidak dapat diperbaiki';
      default:
        return 'Menunggu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'in-progress':
        return <Wrench className="h-4 w-4 mr-1" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 mr-1" />;
      default:
        return <Calendar className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button
          onClick={handleAddNewCustomer}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search customers by name or phone..."
          className="w-full px-4 py-2 border rounded-lg pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a 
                    href={`https://wa.me/${customer.phone.replace(/\+/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-green-600 hover:text-green-800"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {customer.phone}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.address}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer.email && (
                    <a 
                      href={`mailto:${customer.email}`}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      {customer.email}
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleShowServiceHistory(customer.id)}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <History className="h-4 w-4 mr-1" />
                      Service History
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <CustomerForm
              initialData={formData || undefined}
              onSave={handleSaveCustomer}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      )}

      {showServiceHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Service History - {customers.find(c => c.id === selectedCustomer)?.name}
              </h2>
              <button 
                onClick={() => setShowServiceHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedCustomerTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Belum ada riwayat servis untuk pelanggan ini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCustomerTickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    className="border rounded-lg p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-lg">{ticket.deviceType}</h3>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getStatusBadgeColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {getStatusDisplay(ticket.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{ticket.problem}</p>
                    {ticket.status === 'failed' && ticket.failureReason && (
                      <p className="text-red-600 text-sm mt-2">Alasan: {ticket.failureReason}</p>
                    )}
                    <div className="mt-2 text-sm text-gray-500 flex justify-between">
                      <span>Biaya: Rp {ticket.estimatedCost?.toLocaleString() || '0'}</span>
                      <span>Tanggal: {new Date(ticket.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    {ticket.notes && (
                      <p className="mt-2 text-sm border-t pt-2">Catatan: {ticket.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowServiceHistory(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
