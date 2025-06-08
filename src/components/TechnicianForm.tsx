import { useState } from 'react';
import { Technician } from '../types';

interface TechnicianFormProps {
  onSave: (technician: Technician) => void;
  onCancel: () => void;
  initialData?: Technician | null;
}

export default function TechnicianForm({ onSave, onCancel, initialData }: TechnicianFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    specialization: initialData?.specialization || '',
    status: initialData?.status || 'available',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const technicianData: Technician = {
      id: initialData?.id || crypto.randomUUID(),
      ...formData,
      status: formData.status as 'available' | 'busy',
      completedTickets: initialData?.completedTickets || 0,
      averageCompletionTime: initialData?.averageCompletionTime || 0,
    };
    onSave(technicianData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Specialization</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.specialization}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          placeholder="e.g., iPhone Repair, Samsung Specialist"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'busy' })}
        >
          <option value="available">Available</option>
          <option value="busy">Busy</option>
        </select>
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
          {initialData ? 'Update' : 'Add'} Technician
        </button>
      </div>
    </form>
  );
}
