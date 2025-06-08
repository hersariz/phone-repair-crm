import { useState, useEffect } from 'react';
import { InventoryItem } from '../types';

interface InventoryFormProps {
  onSave: (item: InventoryItem) => void;
  onCancel: () => void;
  initialData?: InventoryItem | null;
}

export default function InventoryForm({ onSave, onCancel, initialData }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    minQuantity: 0,
    price: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        quantity: initialData.quantity,
        minQuantity: initialData.minQuantity,
        price: initialData.price,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData: InventoryItem = {
      id: initialData?.id || crypto.randomUUID(),
      ...formData,
    };
    onSave(itemData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Item Name</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Current Stock</label>
        <input
          type="number"
          required
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Minimum Stock Level</label>
        <input
          type="number"
          required
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.minQuantity}
          onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price (Rp)</label>
        <input
          type="number"
          required
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
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
          {initialData ? 'Update' : 'Add'} Item
        </button>
      </div>
    </form>
  );
}
