'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BellDot, UserCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (p: any) => void;
  onNotificationClick?: (type: string) => void;
  notifications: any[];
}

export const Navbar = ({ currentPage, setCurrentPage, onNotificationClick, notifications }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const navItems: { label: string, value: string }[] = [
    { label: 'Início', value: 'dashboard' },
    { label: 'Produtos', value: 'products' },
    { label: 'Domínios', value: 'domains' },
    { label: 'Projetos', value: 'projects' },
    { label: 'Suporte', value: 'support' },
    { label: 'Faturamento', value: 'billing' },
    { label: 'Status', value: 'status' },
    { label: 'Atividade', value: 'activity' },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-surface shadow-[0_20px_40px_rgba(20,27,44,0.06)]">
      <div className="flex justify-between items-center w-full px-6 md:px-10 h-20 max-w-[1600px] mx-auto">
        <div 
          className="text-2xl font-black tracking-tighter text-primary font-brand cursor-pointer"
          onClick={() => setCurrentPage('dashboard')}
        >
          HospedaMaringá
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setCurrentPage(item.value)}
              className={`font-medium transition-all duration-300 ease-in-out font-label text-[10px] tracking-widest uppercase pb-1 border-b-2 ${
                currentPage === item.value 
                  ? 'text-primary border-primary font-bold' 
                  : 'text-on-surface-variant border-transparent hover:text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="text-on-surface-variant hover:text-primary transition-colors p-2 relative"
            >
              <BellDot size={24} className="text-primary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-outline-variant/10 bg-surface-container-low flex justify-between items-center">
                    <h4 className="font-bold text-xs uppercase tracking-widest">Notificações</h4>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{notifications.length} Novas</span>
                  </div>
                  <div className="divide-y divide-outline-variant/10">
                    {notifications.map((n: any) => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          if (onNotificationClick) {
                            onNotificationClick(n.type);
                          } else {
                            if (n.type === 'suporte') setCurrentPage('support');
                            if (n.type === 'faturamento') setCurrentPage('billing');
                            if (n.type === 'status') setCurrentPage('activity');
                          }
                          setIsNotificationsOpen(false);
                        }}
                        className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">{n.title}</span>
                          <span className="text-[10px] text-on-surface-variant">{n.time}</span>
                        </div>
                        <p className="text-xs font-medium text-on-surface line-clamp-2 mb-1 group-hover:text-primary transition-colors">{n.detail}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full p-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-low transition-colors">
                    Limpar Tudo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setCurrentPage('profile')}
            className={`transition-colors p-2 rounded-full ${currentPage === 'profile' ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <UserCircle size={28} />
          </button>
          
          <button 
            className="md:hidden text-on-surface-variant"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-t border-outline-variant/20 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setCurrentPage(item.value);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left font-bold font-label text-xs tracking-widest uppercase ${
                    currentPage === item.value ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
