'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import AppointmentModal from './AppointmentModal';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
}

interface AppointmentSchedulerProps {
  property: Property;
}

export default function AppointmentScheduler({ property }: AppointmentSchedulerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full border-2 border-gray-400 text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
      >
        <Calendar size={20} />
        Agendar Visita
      </button>
      
      <AppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        property={property}
      />
    </>
  );
}