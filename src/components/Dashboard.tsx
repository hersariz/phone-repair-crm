import { useEffect, useState } from 'react';
import { ServiceTicket, Customer, Technician, InventoryItem } from '../types';
import { format } from 'date-fns';
import { Clock, CircleAlert, CircleCheck, Package, Wrench, Squircle, CircleX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MonthlyReport from './MonthlyReport';

export default function Dashboard() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);

  useEffect(() => {
    const storedTickets = localStorage.getItem('tickets');
    const storedCustomers = localStorage.getItem('customers');
    const storedTechnicians = localStorage.getItem('technicians');
    const storedInventory = localStorage.getItem('inventory');
    
    if (storedTickets) setTickets(JSON.parse(storedTickets));
    if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
    if (storedTechnicians) setTechnicians(JSON.parse(storedTechnicians));
    if (storedInventory) setInventory(JSON.parse(storedInventory));
  }, []);

  const pendingTickets = tickets.filter(ticket => ticket.status === 'pending');
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'in-progress');
  const completedTickets = tickets.filter(ticket => ticket.status === 'completed');
  const failedTickets = tickets.filter(ticket => ticket.status === 'failed');

  const todayTickets = tickets.filter(ticket => {
    const ticketDate = new Date(ticket.createdAt).toDateString();
    const today = new Date().toDateString();
    return ticketDate === today;
  });

  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Tidak dapat diperbaiki';
      default:
        return status;
    }
  };

  const chartData = [
    { name: getStatusDisplay('pending'), value: pendingTickets.length },
    { name: getStatusDisplay('in-progress'), value: inProgressTickets.length },
    { name: getStatusDisplay('completed'), value: completedTickets.length },
    { name: getStatusDisplay('failed'), value: failedTickets.length },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => setShowMonthlyReport(!showMonthlyReport)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {showMonthlyReport ? 'Show Overview' : 'Show Monthly Report'}
        </button>
      </div>
      
      {showMonthlyReport ? (
        <MonthlyReport tickets={tickets} technicians={technicians} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <div className="bg-orange-100 p-6 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Pending</h2>
                  <p className="text-3xl font-bold text-orange-600">{pendingTickets.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-100 p-6 rounded-lg">
              <div className="flex items-center">
                <CircleAlert className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">In Progress</h2>
                  <p className="text-3xl font-bold text-blue-600">{inProgressTickets.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-100 p-6 rounded-lg">
              <div className="flex items-center">
                <CircleCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Completed</h2>
                  <p className="text-3xl font-bold text-green-600">{completedTickets.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-100 p-6 rounded-lg">
              <div className="flex items-center">
                <CircleX className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Tidak dapat diperbaiki</h2>
                  <p className="text-3xl font-bold text-red-600">{failedTickets.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-100 p-6 rounded-lg">
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Today's Tickets</h2>
                  <p className="text-3xl font-bold text-purple-600">{todayTickets.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Service Status Overview</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
                <div className="flex items-center">
                  <Squircle className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {lowStockItems.length} items need attention
                  </span>
                </div>
              </div>
              
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  All items are well stocked!
                </div>
              ) : (
                <div className="overflow-y-auto max-h-64">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="mb-4 p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <Package className="h-5 w-5 text-red-500 mr-3" />
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Category: {item.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-red-600">
                            Current Stock: {item.quantity}
                          </div>
                          <div className="text-xs text-gray-500">
                            Minimum Required: {item.minQuantity}
                          </div>
                        </div>
                      </div>
                      {item.quantity === 0 && (
                        <div className="mt-2 text-sm text-red-600 font-medium">
                          ⚠️ Out of stock! Order immediately
                        </div>
                      )}
                      {item.quantity > 0 && item.quantity <= item.minQuantity && (
                        <div className="mt-2 text-sm text-amber-600 font-medium">
                          ⚠️ Low stock! Consider restocking soon
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-600">
                <p className="flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Stock at 0: Immediate action required
                </p>
                <p className="flex items-center mt-1">
                  <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                  Stock below minimum: Plan for restock
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
