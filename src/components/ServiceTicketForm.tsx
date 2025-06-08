import { useState } from 'react';
import { ServiceTicket, Customer } from '../types';

interface ServiceTicketFormProps {
  customers: Customer[];
  onSave: (ticket: ServiceTicket) => void;
  onCancel: () => void;
}

export default function ServiceTicketForm({ customers, onSave, onCancel }: ServiceTicketFormProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    deviceType: '',
    problem: '',
    notes: '',
    estimatedCost: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: ServiceTicket = {
      id: crypto.randomUUID(),
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(newTicket);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Customer</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.customerId}
          onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
        >
          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} - {customer.phone}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Device Type</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.deviceType}
          onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Problem Description</label>
        <textarea
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          value={formData.problem}
          onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={2}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Estimated Cost (Rp)</label>
        <input
          type="number"
          required
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.estimatedCost === 0 ? '' : formData.estimatedCost}
          onChange={(e) => {
            const val = e.target.value;
            setFormData({ ...formData, estimatedCost: val === '' ? 0 : parseInt(val) });
          }}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Create Ticket
        </button>
      </div>
    </form>
  );
}