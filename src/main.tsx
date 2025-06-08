import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Inisialisasi akun default jika belum ada data pengguna
const initializeDefaultUser = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.length === 0) {
    // Tambahkan akun admin default
    const defaultAdmin = {
      id: crypto.randomUUID(),
      name: 'Admin',
      email: 'admin@crmapp.com',
      password: 'admin123',
      phone: '+6281234567890',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Tambahkan akun CSO default
    const defaultCSO = {
      id: crypto.randomUUID(),
      name: 'Customer Service',
      email: 'cs@crmapp.com',
      password: 'cs123',
      phone: '+6281234567891',
      role: 'cso',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify([defaultAdmin, defaultCSO]));
    console.log('Default users initialized');
  }
};

// Perbaikan data customer di localStorage agar field name selalu ada
const fixCustomerData = () => {
  const customers = JSON.parse(localStorage.getItem('customers') || '[]');
  let changed = false;
  const fixedCustomers = customers.map((c: any) => {
    if (!c.name) {
      changed = true;
      return { ...c, name: `Unknown Customer (${c.id})` };
    }
    return c;
  });
  if (changed) {
    localStorage.setItem('customers', JSON.stringify(fixedCustomers));
    console.log('Customer data fixed in localStorage');
  }
};

// Jalankan inisialisasi data
initializeDefaultUser();
fixCustomerData();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
