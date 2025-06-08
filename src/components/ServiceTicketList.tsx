import { useState, useEffect } from 'react';
import { ServiceTicket, Customer, Technician, InventoryItem } from '../types';
import { Plus, Search, Squircle } from 'lucide-react';
import ServiceTicketForm from './ServiceTicketForm';
import TechnicianView from './TechnicianView';
import Invoice from './Invoice';
import { smsService } from '../services/smsService';

type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export default function ServiceTicketList() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [showFailureDialog, setShowFailureDialog] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicketForInvoice, setSelectedTicketForInvoice] = useState<ServiceTicket | null>(null);
  const [ticketPriority, setTicketPriority] = useState<{ [key: string]: TicketPriority }>({});

  useEffect(() => {
    const storedTickets = localStorage.getItem('tickets');
    const storedCustomers = localStorage.getItem('customers');
    const storedTechnicians = localStorage.getItem('technicians');
    
    if (storedTickets) setTickets(JSON.parse(storedTickets));
    if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
    if (storedTechnicians) setTechnicians(JSON.parse(storedTechnicians));
  }, []);

  const handleSaveTicket = (ticket: ServiceTicket | { status: string; technicianId: string; id: string; customerId: string; deviceType: string; problem: string; notes: string; failureReason?: string; createdAt: string; updatedAt: string; estimatedCost: number; completionTime?: string; partsUsed?: InventoryItem[] }) => {
    const availableTechnicians = technicians.filter(t => t.status === 'available');
    
    if (availableTechnicians.length === 0) {
      // Jika tidak ada teknisi available, simpan tiket dengan status pending
      const updatedTickets = [...tickets, { ...ticket, status: 'pending' as const }];
      setTickets(updatedTickets);
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
      setShowForm(false);
      return;
    }

    // Cari teknisi berikutnya menggunakan round robin
    const lastAssignedTechnicianId = tickets[tickets.length - 1]?.technicianId;
    const lastTechnicianIndex = availableTechnicians.findIndex(t => t.id === lastAssignedTechnicianId);
    const nextTechnicianIndex = (lastTechnicianIndex + 1) % availableTechnicians.length;
    const nextTechnician = availableTechnicians[nextTechnicianIndex];

    // Assign tiket ke teknisi
    const newTicket = {
      ...ticket,
      status: 'in-progress',
      technicianId: nextTechnician.id,
    };
    const updatedTickets = [...tickets, newTicket as ServiceTicket];
    setTickets(updatedTickets);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    setShowForm(false);
  };

  const handleStatusChange = (ticketId: string, newStatus: ServiceTicket['status']) => {
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: newStatus, 
            updatedAt: new Date().toISOString(),
            completionTime: newStatus === 'completed' ? new Date().toISOString() : ticket.completionTime,
            failureReason: undefined
          }
        : ticket
    );

    // Update status teknisi jika tiket diubah
    const completedTicket = updatedTickets.find(t => t.id === ticketId);
    if (completedTicket?.technicianId) {
      const technicianTickets = updatedTickets.filter(t => 
        t.technicianId === completedTicket.technicianId && 
        t.status === 'in-progress'
      );

      const updatedTechnicians = technicians.map(tech => {
        if (tech.id === completedTicket.technicianId) {
          return {
            ...tech,
            status: technicianTickets.length >= 5 ? 'busy' as const : 'available' as const
          };
        }
        return tech;
      });

      setTechnicians(updatedTechnicians);
      localStorage.setItem('technicians', JSON.stringify(updatedTechnicians));
    }

    setTickets(updatedTickets);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));

    // Temukan customer untuk ticket ini
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      const customer = customers.find(c => c.id === ticket.customerId);
      if (customer) {
        let additionalInfo = '';
        
        if (newStatus === 'completed') {
          additionalInfo = 'Perangkat Anda sudah siap diambil.';
        } else if (newStatus === 'in-progress') {
          additionalInfo = 'Teknisi kami sedang mengerjakan perangkat Anda.';
        } else if (newStatus === 'failed') {
          additionalInfo = 'Mohon maaf, terdapat kendala dalam perbaikan. Tim kami akan menghubungi Anda.';
        }
        
        // Kirim SMS pemberitahuan
        try {
          smsService.sendServiceUpdate(
            { name: customer.name, phone: customer.phone },
            ticket.id,
            newStatus,
            additionalInfo
          );
        } catch (error) {
          console.error('Failed to send SMS notification:', error);
        }
      }
    }
  };

  const handleFailureSubmit = () => {
    if (!selectedTicketId || !failureReason) return;

    const updatedTickets = tickets.map(ticket => 
      ticket.id === selectedTicketId 
        ? { 
            ...ticket, 
            status: 'failed',
            failureReason,
            updatedAt: new Date().toISOString()
          }
        : ticket
    );
    setTickets(updatedTickets as ServiceTicket[]);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    setShowFailureDialog(false);
    setFailureReason('');
    setSelectedTicketId(null);
  };

  const handleAssignTechnician = (ticketId: string, technicianId: string) => {
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId
        ? { 
            ...ticket, 
            technicianId,
            status: ticket.status === 'pending' ? 'in-progress' : ticket.status,
            updatedAt: new Date().toISOString() 
          }
        : ticket
    );

    // Update technician status if they have >= 5 tickets
    const technicianTickets = updatedTickets.filter(t => 
      t.technicianId === technicianId && 
      t.status === 'in-progress'
    );

    const updatedTechnicians = technicians.map(tech => {
      if (tech.id === technicianId) {
        return {
          ...tech,
          status: technicianTickets.length >= 5 ? 'busy' as const : 'available' as const
        };
      }
      return tech;
    });

    setTickets(updatedTickets);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    
    setTechnicians(updatedTechnicians);
    localStorage.setItem('technicians', JSON.stringify(updatedTechnicians));
  };

  const handleUpdateTicket = (ticketId: string, status: 'completed', description: string) => {
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status, description, updatedAt: new Date().toISOString() }
        : ticket
    );

    setTickets(updatedTickets);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
  };

  const filteredTickets = tickets.filter(ticket => {
    const customer = customers.find(c => c.id === ticket.customerId);
    const searchString = `${customer?.name} ${customer?.phone} ${ticket.deviceType} ${ticket.problem}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: ServiceTicket['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const calculatePriority = (ticket: ServiceTicket): TicketPriority => {
    // Tiket yang lebih lama memiliki prioritas lebih tinggi
    const ticketAge = Date.now() - new Date(ticket.createdAt).getTime();
    const ageInDays = ticketAge / (1000 * 60 * 60 * 24);
    
    // Bobot berdasarkan tipe masalah
    const problemWeights: { [key: string]: number } = {
      "Layar Rusak": 3,
      "Tidak Bisa Nyala": 4,
      "Baterai": 2,
      "Software": 1
    };
    
    // Hitung skor prioritas
    let priorityScore = ageInDays;
    
    // Tambahkan bobot berdasarkan tipe masalah
    for (const [problem, weight] of Object.entries(problemWeights)) {
      if (ticket.problem.toLowerCase().includes(problem.toLowerCase())) {
        priorityScore += weight;
        break;
      }
    }
    
    // Tentukan prioritas berdasarkan skor
    if (priorityScore > 7) return 'urgent';
    if (priorityScore > 4) return 'high';
    if (priorityScore > 2) return 'medium';
    return 'low';
  };

  useEffect(() => {
    const priorities: { [key: string]: TicketPriority } = {};
    
    tickets.forEach(ticket => {
      priorities[ticket.id] = calculatePriority(ticket);
    });
    
    setTicketPriority(priorities);
  }, [tickets]);

  const distributeTickets = () => {
    // Urutkan tiket berdasarkan prioritas
    const pendingTickets = tickets
      .filter(t => t.status === 'pending')
      .sort((a, b) => {
        const priorityA = ticketPriority[a.id] || 'low';
        const priorityB = ticketPriority[b.id] || 'low';
        
        const priorityWeight = { urgent: 3, high: 2, medium: 1, low: 0 };
        return priorityWeight[priorityB] - priorityWeight[priorityA];
      });
    
    const availableTechnicians = technicians.filter(t => t.status === 'available');
    
    if (availableTechnicians.length === 0 || pendingTickets.length === 0) return;

    let updatedTickets = [...tickets];
    let updatedTechnicians = [...technicians];

    // Implementasi round robin
    let currentTechnicianIndex = 0;
    pendingTickets.forEach(ticket => {
      const technician = availableTechnicians[currentTechnicianIndex];
      const ticketIndex = updatedTickets.findIndex(t => t.id === ticket.id);
      
      // Assign tiket ke teknisi
      updatedTickets[ticketIndex] = {
        ...updatedTickets[ticketIndex],
        status: 'in-progress',
        technicianId: technician.id
      };

      // Update index untuk teknisi berikutnya
      currentTechnicianIndex = (currentTechnicianIndex + 1) % availableTechnicians.length;
    });

    // Update status teknisi jika memiliki >= 5 tiket in-progress
    availableTechnicians.forEach(tech => {
      const technicianTickets = updatedTickets.filter(t => 
        t.technicianId === tech.id && 
        t.status === 'in-progress'
      );

      if (technicianTickets.length >= 5) {
        const techIndex = updatedTechnicians.findIndex(t => t.id === tech.id);
        updatedTechnicians[techIndex] = {
          ...updatedTechnicians[techIndex],
          status: 'busy' as const
        };
      }
    });

    setTickets(updatedTickets);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    
    setTechnicians(updatedTechnicians);
    localStorage.setItem('technicians', JSON.stringify(updatedTechnicians));

    console.log('Pending Tickets:', pendingTickets);
    console.log('Available Technicians:', availableTechnicians);
    console.log('Current Technician Index:', currentTechnicianIndex);
  };

  useEffect(() => {
    distributeTickets();
  }, [tickets, technicians]);

  const clearTickets = () => {
    localStorage.removeItem('tickets');
    setTickets([]); // Reset state tickets ke array kosong
  };

  // Contoh: Cek apakah pengguna adalah teknisi
  const isTechnician = true; // Ganti dengan logika autentikasi yang sesuai

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Tickets</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </button>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search tickets..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.map((ticket) => {
              const customer = customers.find(c => c.id === ticket.customerId);
              return (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{customer?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.deviceType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      {ticket.problem}
                      {ticket.status === 'failed' && ticket.failureReason && (
                        <div className="text-sm text-red-600 mt-1 flex items-center">
                          <Squircle className="h-4 w-4 mr-1" />
                          Tidak dapat diperbaiki: {ticket.failureReason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status === 'failed' ? 'Tidak dapat diperbaiki' : ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={ticket.technicianId || ''}
                      onChange={(e) => handleAssignTechnician(ticket.id, e.target.value)}
                      disabled={ticket.status === 'completed' || ticket.status === 'failed'}
                      className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 
                        ${(ticket.status === 'completed' || ticket.status === 'failed') ? 'bg-gray-100' : ''}`}
                    >
                      <option value="">Assign Technician</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} - {tech.specialization}
                        </option>
                      ))}
                    </select> 
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp {ticket.estimatedCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value as ServiceTicket['status'])}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Tidak dapat diperbaiki</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedTicketForInvoice(ticket)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Generate Invoice
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <ServiceTicketForm 
              customers={customers}
              onSave={handleSaveTicket}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {showFailureDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Alasan Tidak Dapat Diperbaiki</h3>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              placeholder="Jelaskan mengapa perangkat tidak dapat diperbaiki..."
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowFailureDialog(false);
                  setFailureReason('');
                  setSelectedTicketId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFailureSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={clearTickets}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Clear All Tickets
        </button>
      </div>

      {isTechnician ? (
        <TechnicianView
          tickets={tickets.filter(t => t.technicianId === 'ID_TEKNISI')} // Ganti dengan ID teknisi yang sesuai
          customers={customers}
          technicians={technicians}
          onUpdateTicket={handleUpdateTicket}
        />
      ) : (
        // Tampilan untuk admin/pengguna lain
        <div>
          {/* ... kode untuk admin ... */}
        </div>
      )}

      {selectedTicketForInvoice && (
        <Invoice
          ticket={selectedTicketForInvoice}
          customer={customers.find(c => c.id === selectedTicketForInvoice.customerId)!}
          technician={technicians.find(t => t.id === selectedTicketForInvoice.technicianId)!}
          onClose={() => setSelectedTicketForInvoice(null)}
        />
      )}
    </div>
  );
}