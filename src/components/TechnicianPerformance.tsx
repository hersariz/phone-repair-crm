import { useState, useEffect } from 'react';
import { ServiceTicket, Technician } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TechnicianPerformanceProps {
  technicians: Technician[];
  tickets: ServiceTicket[];
}

export default function TechnicianPerformance({ technicians, tickets }: TechnicianPerformanceProps) {
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  
  useEffect(() => {
    calculatePerformanceMetrics();
  }, [technicians, tickets]);
  
  const calculatePerformanceMetrics = () => {
    const metrics = technicians.map(technician => {
      // Tiket yang diselesaikan oleh teknisi ini
      const completedTickets = tickets.filter(t => 
        t.technicianId === technician.id && t.status === 'completed'
      );
      
      // Jumlah tiket yang diselesaikan
      const ticketCount = completedTickets.length;
      
      // Waktu rata-rata penyelesaian (dalam jam)
      let avgCompletionTime = 0;
      if (ticketCount > 0) {
        const totalTime = completedTickets.reduce((total, ticket) => {
          const startTime = new Date(ticket.createdAt).getTime();
          const endTime = new Date(ticket.completionTime || ticket.updatedAt).getTime();
          return total + (endTime - startTime);
        }, 0);
        avgCompletionTime = totalTime / ticketCount / (1000 * 60 * 60); // Convert to hours
      }
      
      // Tingkat keberhasilan
      const failedTickets = tickets.filter(t => 
        t.technicianId === technician.id && t.status === 'failed'
      );
      const successRate = ticketCount > 0 ? 
        ((ticketCount - failedTickets.length) / ticketCount) * 100 : 0;
      
      return {
        name: technician.name,
        ticketCount,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10, // Round to 1 decimal
        successRate: Math.round(successRate),
        specialization: technician.specialization
      };
    });
    
    setPerformanceData(metrics);
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Kinerja Teknisi</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Jumlah Tiket Diselesaikan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ticketCount" name="Jumlah Tiket" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Waktu Penyelesaian Rata-rata (Jam)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgCompletionTime" name="Waktu (Jam)" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {performanceData.map(tech => (
          <div key={tech.name} className="border rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-lg">{tech.name}</h4>
            <p className="text-sm text-gray-600">Spesialisasi: {tech.specialization}</p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span>Tiket Diselesaikan:</span>
                <span className="font-medium">{tech.ticketCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Waktu Rata-rata:</span>
                <span className="font-medium">{tech.avgCompletionTime} jam</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tingkat Keberhasilan:</span>
                <span className="font-medium">{tech.successRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 