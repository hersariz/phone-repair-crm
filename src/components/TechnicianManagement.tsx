import { useState, useEffect } from 'react';
import { Technician, ServiceTicket } from '../types';
import { Plus, Search, Award } from 'lucide-react';
import TechnicianForm from './TechnicianForm';

export default function TechnicianManagement() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

  useEffect(() => {
    const storedTechnicians = localStorage.getItem('technicians');
    const storedTickets = localStorage.getItem('tickets');
    if (storedTechnicians) {
      setTechnicians(JSON.parse(storedTechnicians));
    }
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets));
    }
  }, []);

  const handleSaveTechnician = (technician: Technician) => {
    let updatedTechnicians;
    if (editingTechnician) {
      updatedTechnicians = technicians.map((t) =>
        t.id === editingTechnician.id ? technician : t
      );
    } else {
      updatedTechnicians = [...technicians, {
        ...technician,
        status: 'available',
        completedTickets: 0,
        averageCompletionTime: 0
      }] as Technician[];
    }
    setTechnicians(updatedTechnicians);
    localStorage.setItem('technicians', JSON.stringify(updatedTechnicians));
    setShowForm(false);
    setEditingTechnician(null);
  };

  const handleEditTechnician = (technician: Technician) => {
    setEditingTechnician(technician);
    setShowForm(true);
  };

  const getCompletedTicketsCount = (technicianId: string) => {
    return tickets.filter(
      ticket => ticket.technicianId === technicianId && ticket.status === 'completed'
    ).length;
  };

  const getAverageCompletionTime = (technicianId: string) => {
    const completedTickets = tickets.filter(
      ticket => ticket.technicianId === technicianId && ticket.status === 'completed'
    );
    
    if (completedTickets.length === 0) return 0;

    const totalTime = completedTickets.reduce((sum, ticket) => {
      if (ticket.completionTime && ticket.createdAt) {
        const start = new Date(ticket.createdAt).getTime();
        const end = new Date(ticket.completionTime).getTime();
        return sum + (end - start);
      }
      return sum;
    }, 0);

    return Math.round(totalTime / (completedTickets.length * 1000 * 60 * 60)); // Convert to hours
  };

  const filteredTechnicians = technicians.filter(technician =>
    technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    technician.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (ticketId: string, newStatus: ServiceTicket['status']) => {
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: newStatus, 
            updatedAt: new Date().toISOString(),
            completionTime: newStatus === 'completed' ? new Date().toISOString() : ticket.completionTime
          }
        : ticket
    );

    // Cek apakah teknisi bisa kembali available
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
            status: technicianTickets.length >= 5 ? 'busy' : 'available'
          };
        }
        return tech;
      });

      // Perbaiki tipe status dengan memastikan hanya 'available' atau 'busy'
      const validatedTechnicians = updatedTechnicians.map(tech => ({
        ...tech,
        status: tech.status === 'busy' ? 'busy' : 'available'
      })) as Technician[];

      setTechnicians(validatedTechnicians);
      localStorage.setItem('technicians', JSON.stringify(validatedTechnicians));
    }

    setTickets(updatedTickets);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Technician Management</h1>
        <button
          onClick={() => {
            setEditingTechnician(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Technician
        </button>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search technicians..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Tickets</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Completion Time (hours)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTechnicians.map((technician) => (
              <tr key={technician.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getCompletedTicketsCount(technician.id) > 10 && (
                      <Award className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
                    {technician.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{technician.specialization}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${technician.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {technician.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getCompletedTicketsCount(technician.id)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getAverageCompletionTime(technician.id)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEditTechnician(technician)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <TechnicianForm
              onSave={handleSaveTechnician}
              onCancel={() => {
                setShowForm(false);
                setEditingTechnician(null);
              }}
              initialData={editingTechnician}
            />
          </div>
        </div>
      )}
    </div>
  );
}