import { ServiceTicket, Customer, Technician } from '../types';

interface InvoiceProps {
  ticket: ServiceTicket;
  customer: Customer;
  technician: Technician;
  onClose: () => void;
}

export default function Invoice({ ticket, customer, technician, onClose }: InvoiceProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl invoice-print">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">PhoneRepair CRM</h1>
            <p className="text-gray-500">Professional Device Repair Service</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">Invoice</h2>
            <p className="text-gray-500">#{ticket.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Customer and Technician Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-2">Customer Details</h3>
            <div className="space-y-1">
              <p>{customer.name}</p>
              <p>{customer.phone}</p>
              <p>{customer.email}</p>
              <p>{customer.address}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Technician Details</h3>
            <div className="space-y-1">
              <p>{technician.name}</p>
              <p>Specialization-{technician.specialization}</p>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Service Details</h3>
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Device Type:</p>
                <p>{ticket.deviceType}</p>
              </div>
              <div>
                <p className="font-medium">Problem Description:</p>
                <p>{ticket.problem}</p>
              </div>
              <div>
                <p className="font-medium">Status:</p>
                <p className="capitalize">{ticket.status}</p>
              </div>
              <div>
                <p className="font-medium">Estimated Cost:</p>
                <p>Rp {ticket.estimatedCost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4">
          <p className="text-gray-500 text-sm text-center">
            Thank you for choosing PhoneRepair CRM. For any inquiries, please contact us at support@phonerepair.com
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Invoice
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
