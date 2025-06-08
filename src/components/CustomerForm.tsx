import { useState } from 'react';
import { Customer } from '../types';

interface CustomerFormProps {
  onSave: (customer: Customer) => void;
  onCancel: () => void;
  initialData?: Customer;
}

export default function CustomerForm({ onSave, onCancel, initialData }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      alert(phoneError);
      return;
    }
    const updatedCustomer: Customer = {
      id: initialData?.id || crypto.randomUUID(),
      ...formData,
      createdAt: new Date().toISOString(),
    };
    onSave(updatedCustomer);
  };

  const validatePhone = (phone: string) => {
    const phonePattern = /^\+62\d{9,12}$/;
    if (!phonePattern.test(phone)) {
      return 'Nomor telepon harus diawali +62 dan diikuti 9-12 digit angka';
    }
    return '';
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
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Nomor Telepon
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            +62
          </span>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone.replace('+62', '')}
            onChange={(e) => setFormData({
              ...formData,
              phone: `+62${e.target.value.replace(/\D/g, '')}`
            })}
            className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="81234567890"
            maxLength={13}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
          Save
        </button>
      </div>
    </form>
  );
}
