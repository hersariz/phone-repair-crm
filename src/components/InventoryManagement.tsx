import { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { Plus, Search, CircleAlert } from 'lucide-react';
import InventoryForm from './InventoryForm';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    }
  }, []);

  const handleSaveItem = (item: InventoryItem) => {
    let updatedInventory;
    if (editingItem) {
      updatedInventory = inventory.map((i) => 
        i.id === editingItem.id ? item : i
      );
    } else {
      updatedInventory = [...inventory, item];
    }
    setInventory(updatedInventory);
    localStorage.setItem('inventory', JSON.stringify(updatedInventory));
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleUpdateStock = (itemId: string, change: number) => {
    const updatedInventory = inventory.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setInventory(updatedInventory);
    localStorage.setItem('inventory', JSON.stringify(updatedInventory));
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </button>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search inventory..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.quantity <= item.minQuantity && (
                      <CircleAlert className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    {item.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateStock(item.id, -1)}
                      className="px-2 py-1 text-sm bg-gray-100 rounded"
                    >
                      -
                    </button>
                    <span className={`font-medium ${
                      item.quantity <= item.minQuantity ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateStock(item.id, 1)}
                      className="px-2 py-1 text-sm bg-gray-100 rounded"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.minQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">Rp {item.price.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEditItem(item)}
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
            <InventoryForm
              onSave={handleSaveItem}
              onCancel={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
              initialData={editingItem}
            />
          </div>
        </div>
      )}
    </div>
  );
}
