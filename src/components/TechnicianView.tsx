import { useState } from 'react';
import { ServiceTicket, Customer, Technician } from '../types';

interface TechnicianViewProps {
  tickets: ServiceTicket[];
  customers: Customer[];
  technicians: Technician[];
  onUpdateTicket: (ticketId: string, status: 'completed', description: string) => void;
}

export default function TechnicianView({ tickets, customers, technicians, onUpdateTicket }: TechnicianViewProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const handleUpdateStatus = (ticketId: string) => {
    if (description.trim() === '') {
      alert('Deskripsi tidak boleh kosong!');
      return;
    }
    onUpdateTicket(ticketId, 'completed', description);
    setSelectedTicketId(null);
    setDescription('');
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        {tickets
          .filter(ticket => ticket.status === 'in-progress')
          .map(ticket => {
            const customer = customers.find(c => c.id === ticket.customerId);
            const technician = technicians.find(t => t.id === ticket.technicianId);
            return (
              <div key={ticket.id} className="p-4 border rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold">{ticket.deviceType} - {ticket.problem}</h2>
                <p className="text-sm text-gray-600">Customer: {customer ? customer.name : ticket.customerId}</p>
                <p className="text-sm text-gray-600">Teknisi: {technician ? technician.name : ticket.technicianId}</p>
                <p className="text-sm text-gray-600">Status: {ticket.status}</p>

                {selectedTicketId === ticket.id ? (
                  <div className="mt-4">
                    <textarea
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder="Tambahkan deskripsi (misal: sedang menunggu sparepart)..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(ticket.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                      >
                        Selesaikan Tiket
                      </button>
                      <button
                        onClick={() => setSelectedTicketId(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className="mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Update Status
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
