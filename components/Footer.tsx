import React from 'react';

export const Footer = ({ onStatusClick, onTermsClick, onPrivacyClick }: { onStatusClick: () => void, onTermsClick: () => void, onPrivacyClick: () => void }) => (
  <footer className="bg-surface-container-low py-12 border-t border-outline-variant/10">
    <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-10 w-full max-w-[1600px] mx-auto gap-8">
      <div className="text-lg font-bold text-primary font-brand">HospedaMaringá</div>
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {['Termos de Serviço', 'Política de Privacidade', 'Página de Status', 'Mapa da Rede'].map((item) => (
          <button 
            key={item} 
            onClick={() => {
              if (item === 'Página de Status') onStatusClick();
              if (item === 'Termos de Serviço') onTermsClick();
              if (item === 'Política de Privacidade') onPrivacyClick();
            }}
            className="text-on-surface-variant font-medium hover:underline decoration-2 underline-offset-4 transition-opacity hover:opacity-80 text-sm"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="text-on-surface-variant font-medium text-xs opacity-60">
        © 2024 HospedaMaringá. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);
