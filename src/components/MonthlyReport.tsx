import { useState, useEffect, useMemo } from 'react';
import { ServiceTicket, Technician } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar } from 'lucide-react';

interface MonthlyReportProps {
  tickets: ServiceTicket[];
  technicians: Technician[];
}

export default function MonthlyReport({ tickets, technicians }: MonthlyReportProps) {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const monthStart = startOfMonth(new Date(selectedMonth));
  const monthEnd = endOfMonth(new Date(selectedMonth));

  const monthlyData = useMemo(() => {
    const monthTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      return ticketDate >= monthStart && ticketDate <= monthEnd;
    });

    // Calculate total revenue (only from completed tickets)
    const totalRevenue = monthTickets.reduce((sum, ticket) => 
      ticket.status === 'completed' ? sum + ticket.estimatedCost : sum, 0
    );

    // Calculate ticket status distribution
    const statusDistribution = [
      { name: 'Pending', value: monthTickets.filter(t => t.status === 'pending').length },
      { name: 'In Progress', value: monthTickets.filter(t => t.status === 'in-progress').length },
      { name: 'Completed', value: monthTickets.filter(t => t.status === 'completed').length },
      { name: 'Tidak dapat diperbaiki', value: monthTickets.filter(t => t.status === 'failed').length }
    ];

    // Calculate top technicians
    const technicianPerformance = technicians.map(tech => {
      const techTickets = monthTickets.filter(ticket => ticket.technicianId === tech.id);
      return {
        name: tech.name,
        completedTickets: techTickets.filter(t => t.status === 'completed').length,
        failedTickets: techTickets.filter(t => t.status === 'failed').length,
        revenue: techTickets.filter(t => t.status === 'completed')
          .reduce((sum, ticket) => sum + ticket.estimatedCost, 0)
      };
    }).sort((a, b) => b.completedTickets - a.completedTickets);

    // Calculate common problems
    const problemCounts = monthTickets.reduce((acc: Record<string, number>, ticket) => {
      acc[ticket.deviceType] = (acc[ticket.deviceType] || 0) + 1;
      return acc;
    }, {});

    // Daily revenue data
    const dailyRevenue = eachDayOfInterval({ start: monthStart, end: monthEnd })
      .map(date => {
        const dayTickets = monthTickets.filter(ticket => 
          format(new Date(ticket.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        return {
          date: format(date, 'dd/MM'),
          revenue: dayTickets.filter(t => t.status === 'completed')
            .reduce((sum, ticket) => sum + ticket.estimatedCost, 0)
        };
      });

    return {
      totalRevenue,
      technicianPerformance,
      problemCounts,
      dailyRevenue,
      statusDistribution,
      completedTickets: statusDistribution[2].value,
      failedTickets: statusDistribution[3].value
    };
  }, [tickets, technicians, monthStart, monthEnd]);

  const COLORS = ['#FFA500', '#3B82F6', '#10B981', '#EF4444'];

  const handleExportPDF = () => {
    alert('PDF Export functionality would go here');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Monthly Report</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Revenue Overview</h3>
          <div className="text-3xl font-bold text-blue-600">
            Rp {monthlyData.totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            From {monthlyData.completedTickets} completed tickets
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Tidak dapat diperbaiki</h3>
          <div className="text-3xl font-bold text-red-600">
            {monthlyData.failedTickets}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            tickets this month
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
          <div className="text-3xl font-bold text-green-600">
            {monthlyData.completedTickets + monthlyData.failedTickets > 0
              ? Math.round((monthlyData.completedTickets / (monthlyData.completedTickets + monthlyData.failedTickets)) * 100)
              : 0}%
          </div>
          <div className="text-sm text-gray-600 mt-1">
            completion rate
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Daily Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#4F46E5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={monthlyData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {monthlyData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg col-span-2">
          <h3 className="text-lg font-semibold mb-4">Top Performing Technicians</h3>
          <div className="space-y-4">
            {monthlyData.technicianPerformance.slice(0, 5).map((tech, index) => (
              <div key={tech.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  <span className="ml-3">{tech.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {tech.completedTickets} completed / {tech.failedTickets} tidak dapat diperbaiki
                  </div>
                  <div className="text-sm text-gray-600">Rp {tech.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
