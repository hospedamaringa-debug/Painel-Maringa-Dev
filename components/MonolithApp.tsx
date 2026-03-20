'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCircle, 
  AlertCircle, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Download, 
  Plus, 
  Cloud, 
  Server, 
  Cpu, 
  Globe, 
  FileText, 
  ArrowRight, 
  HelpCircle, 
  Settings, 
  CheckCircle,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  History,
  Tag,
  Filter,
  Activity,
  ShieldCheck,
  Clock,
  Search,
  RefreshCw,
  Database,
  Lock,
  Layout,
  ListTodo,
  Calendar,
  Users,
  MoreVertical,
  MessageSquare,
  Key,
  ExternalLink,
  Terminal,
  Info,
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Bell,
  BellDot,
  MessageCircle,
  Bot,
  Phone,
  Send,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import ReCAPTCHA from 'react-google-recaptcha';
import { AI_GREETING, AI_SYSTEM_INSTRUCTION } from '../lib/ai-config';

// --- Helpers ---

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatNumberBR = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const parseCurrency = (value: string) => {
  // Remove R$ e espaços
  const cleanValue = value.replace('R$', '').replace(/\s/g, '');
  
  // Se contiver vírgula, assume que é o separador decimal brasileiro
  if (cleanValue.includes(',')) {
    // Remove pontos de milhar e troca vírgula por ponto
    return parseFloat(cleanValue.replace(/\./g, '').replace(',', '.')) || 0;
  }
  // Se não tiver vírgula mas tiver ponto, assume que o ponto é o decimal (padrão internacional)
  return parseFloat(cleanValue) || 0;
};

// --- Types ---

type Page = 'dashboard' | 'billing' | 'support' | 'services' | 'domains' | 'status' | 'activity' | 'projects' | 'service-manage' | 'ticket-detail' | 'terms' | 'privacy' | 'products' | 'profile';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Completo' | 'Pendente' | 'Atrasado';
  transactionId?: string;
}

interface AccessInfo {
  username: string;
  password: string;
  mainIp: string;
  additionalIps?: string[];
  cpanelUrl?: string;
  directAdminUrl?: string;
  nameservers: string[];
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    bandwidth?: string;
    os?: string;
  };
}

interface SSLInfo {
  domain: string;
  status: string;
  fqdns: string[];
  crt: string;
  key: string;
  cabundle: string;
}

interface UserProfile {
  name: string;
  email: string;
  cpf: string;
  cnpj: string;
  phone: string;
  address: string;
  neighborhood: string;
  company: string;
  city: string;
  country: string;
  zipCode: string;
  domain: string;
  birthDate: string;
}

interface Service {
  id: string;
  name: string;
  host: string;
  type: 'hosting' | 'vps' | 'dedicated' | 'ssl';
  status: 'active' | 'suspended' | 'pending';
  nextBilling?: string;
  billingCycle?: string;
  accessInfo?: AccessInfo;
  sslInfo?: SSLInfo;
}

interface SupportTicket {
  id: string;
  title: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  status: 'Aberto' | 'Em Andamento' | 'Fechado';
  updatedAt: string;
}

// --- Mock Data ---

const MOCK_INVOICES: Invoice[] = [
  { id: '#9042', date: '17 de Mar, 2024', amount: 5.00, status: 'Completo', transactionId: '03NOBCIPYYW6VZ26' },
  { id: '#9043', date: '18 de Mar, 2024', amount: 5.00, status: 'Pendente' },
  { id: '#9044', date: '19 de Mar, 2024', amount: 5.00, status: 'Pendente' },
];

const MOCK_SERVICES: Service[] = [
  { 
    id: '1', 
    name: 'Hospedagem Pro Compartilhada', 
    host: 'monolith-v1.com', 
    type: 'hosting', 
    status: 'active',
    nextBilling: '12 de Out, 2024',
    billingCycle: 'Anual',
    accessInfo: {
      username: 'monolith_user',
      password: '••••••••••••',
      mainIp: '162.241.123.45',
      cpanelUrl: 'https://monolith-v1.com:2083',
      nameservers: ['ns1.monolith-dns.com', 'ns2.monolith-dns.com'],
      specs: {
        storage: '50GB NVMe',
        bandwidth: 'Ilimitado',
        ram: '2GB Compartilhado'
      }
    }
  },
  { 
    id: '2', 
    name: 'VPS Gerenciado NVMe', 
    host: '192.168.1.44', 
    type: 'vps', 
    status: 'active',
    nextBilling: '05 de Abr, 2024',
    billingCycle: 'Mensal',
    accessInfo: {
      username: 'root',
      password: '••••••••••••',
      mainIp: '192.168.1.44',
      additionalIps: ['192.168.1.45', '192.168.1.46'],
      directAdminUrl: 'https://192.168.1.44:2222',
      nameservers: ['ns1.monolith-vps.com', 'ns2.monolith-vps.com'],
      specs: {
        cpu: '4 Núcleos vCPU',
        ram: '8GB LPDDR5',
        storage: '400GB NVMe SSD',
        os: 'Ubuntu 22.04 LTS'
      }
    }
  },
  { 
    id: '3', 
    name: 'Certificado SSL', 
    host: 'hospedamaringa.com.br', 
    type: 'ssl', 
    status: 'active',
    nextBilling: '18 de Nov, 2024',
    billingCycle: 'Anual',
    sslInfo: {
      domain: 'hospedamaringa.com.br',
      status: 'AutoSSL Domain Validated',
      fqdns: ['hospedamaringa.com.br', 'www.hospedamaringa.com.br', 'mail.hospedamaringa.com.br'],
      crt: '-----BEGIN CERTIFICATE-----\nMIIF... (dados do certificado) ...\n-----END CERTIFICATE-----',
      key: '-----BEGIN PRIVATE KEY-----\nMIIE... (chave privada) ...\n-----END PRIVATE KEY-----',
      cabundle: '-----BEGIN CERTIFICATE-----\nMIIF... (pacote de autoridades) ...\n-----END CERTIFICATE-----'
    }
  },
];

const MOCK_TICKETS: SupportTicket[] = [
  { id: '#MN-8291', title: 'Latência no Banco de Dados em US-EAST-1', priority: 'Alta', status: 'Aberto', updatedAt: '14m atrás' },
  { id: '#MN-8104', title: 'Erro na Renovação do Certificado SSL', priority: 'Média', status: 'Em Andamento', updatedAt: '2h atrás' },
  { id: '#MN-7922', title: 'Dúvida sobre a Fatura #8292', priority: 'Baixa', status: 'Fechado', updatedAt: '12 de Dez, 2023' },
];

const MOCK_TICKET_RESPONSES: Record<string, { sender: string, role: 'support' | 'user', message: string, time: string }[]> = {
  '#MN-8291': [
    { sender: 'Alex Sterling', role: 'user', message: 'Estou vendo picos significativos de latência no meu cluster de banco de dados US-EAST-1. Consultas que normalmente levam 10ms agora estão levando mais de 500ms.', time: '20m atrás' },
    { sender: 'Suporte Hospeda Maringá (Sarah)', role: 'support', message: 'Olá Alex, identificamos um problema de congestionamento de rede na região US-EAST-1 afetando alguns clusters NVMe. Nossa equipe de engenharia está redirecionando o tráfego agora. Você deve ver o desempenho voltar ao normal nos próximos 10 minutos.', time: '14m atrás' },
  ],
  '#MN-8104': [
    { sender: 'Alex Sterling', role: 'user', message: 'A renovação automática do meu certificado SSL em dev-stack.net falhou com um erro de timeout. Você pode verificar o status do desafio ACME?', time: '3h atrás' },
    { sender: 'Suporte Hospeda Maringá (Mike)', role: 'support', message: 'Verificando agora. Parece que seu provedor de DNS está bloqueando nossas solicitações de validação. Certifique-se de que a porta 53 esteja aberta para nossa faixa de IP ou adicione o registro TXT manualmente para ignorar a verificação automatizada.', time: '2h atrás' },
  ],
  '#MN-7922': [
    { sender: 'Alex Sterling', role: 'user', message: 'Fui cobrado duas vezes pela Fatura #8292. Você pode verificar e emitir um reembolso para a transação duplicada?', time: '12 de Dez, 2023' },
    { sender: 'Faturamento Hospeda Maringá', role: 'support', message: 'Verificamos a cobrança duplicada. Um reembolso foi processado e deve aparecer em sua conta dentro de 3 a 5 dias úteis. Pedimos desculpas pelo inconveniente.', time: '12 de Dez, 2023' },
  ]
};

interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: string;
  latency: string;
}

const MOCK_STATUS: SystemStatus[] = [
  { name: 'API Gateway', status: 'operational', uptime: '99.99%', latency: '24ms' },
  { name: 'Banco de Dados Primário', status: 'operational', uptime: '99.95%', latency: '12ms' },
  { name: 'Armazenamento de Objetos', status: 'operational', uptime: '100%', latency: '45ms' },
  { name: 'Serviço de Autenticação', status: 'operational', uptime: '99.99%', latency: '18ms' },
  { name: 'Rede de Entrega de Conteúdo (CDN)', status: 'operational', uptime: '99.99%', latency: '32ms' },
  { name: 'Mecanismo de Computação (US-EAST)', status: 'degraded', uptime: '98.4%', latency: '110ms' },
];

interface ActivityLog {
  id: string;
  event: string;
  user: string;
  category: 'infrastructure' | 'security' | 'billing' | 'account';
  timestamp: string;
  details: string;
}

const MOCK_ACTIVITY: ActivityLog[] = [
  { id: 'act_1', event: 'Reinicialização do Servidor', user: 'Sistema', category: 'infrastructure', timestamp: '10m atrás', details: 'Node-04 reiniciado devido à atualização do kernel.' },
  { id: 'act_2', event: 'Login Bem-sucedido', user: 'Alex Sterling', category: 'account', timestamp: '45m atrás', details: 'Login de novo dispositivo: Chrome/macOS.' },
  { id: 'act_3', event: 'Regra de Firewall Atualizada', user: 'Alex Sterling', category: 'security', timestamp: '2h atrás', details: 'Porta 443 adicionada para permitir tráfego HTTPS.' },
  { id: 'act_4', event: 'Backup Concluído', user: 'Sistema', category: 'infrastructure', timestamp: '4h atrás', details: 'Snapshot diário do DB-Primary bem-sucedido.' },
  { id: 'act_5', event: 'Método de Pagamento Adicionado', user: 'Alex Sterling', category: 'billing', timestamp: '1d atrás', details: 'Cartão Visa com final 4242 adicionado.' },
  { id: 'act_6', event: 'Senha Alterada', user: 'Alex Sterling', category: 'security', timestamp: '2d atrás', details: 'Usuário iniciou a rotação de senha.' },
];

interface ProjectTask {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  members: number;
  tasks: ProjectTask[];
}

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'Migração de Infraestrutura',
    description: 'Movendo sistemas legados para os novos clusters Hospeda Maringá NVMe.',
    progress: 65,
    members: 8,
    tasks: [
      { id: 'task_1', title: 'Verificação de snapshot do banco de dados', status: 'done', priority: 'high', assignee: 'Alex S.', dueDate: '22 de Mar' },
      { id: 'task_2', title: 'Teste de latência de rede', status: 'in-progress', priority: 'medium', assignee: 'Sarah K.', dueDate: '24 de Mar' },
      { id: 'task_3', title: 'Migração de certificado SSL', status: 'todo', priority: 'high', assignee: 'Alex S.', dueDate: '25 de Mar' },
    ]
  },
  {
    id: 'proj_2',
    name: 'Auditoria de Segurança Q1',
    description: 'Revisão trimestral de segurança e testes de invasão.',
    progress: 30,
    members: 4,
    tasks: [
      { id: 'task_4', title: 'Revisão de regras de firewall', status: 'in-progress', priority: 'high', assignee: 'Mike R.', dueDate: '28 de Mar' },
      { id: 'task_5', title: 'Análise de log de acesso do usuário', status: 'todo', priority: 'low', assignee: 'Sarah K.', dueDate: '02 de Abr' },
    ]
  }
];

// --- Components ---

const Navbar = ({ currentPage, setCurrentPage, onNotificationClick }: { currentPage: Page, setCurrentPage: (p: Page) => void, onNotificationClick?: (type: string) => void }) => {
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

  const navItems: { label: string, value: Page }[] = [
    { label: 'Início', value: 'dashboard' },
    { label: 'Produtos', value: 'products' },
    { label: 'Domínios', value: 'domains' },
    { label: 'Projetos', value: 'projects' },
    { label: 'Suporte', value: 'support' },
    { label: 'Faturamento', value: 'billing' },
    { label: 'Status', value: 'status' },
    { label: 'Atividade', value: 'activity' },
  ];

  const notifications = [
    { id: 1, title: 'Ticket Aberto', detail: '#MN-8291: Latência no Banco de Dados em US-EAST-1', type: 'suporte', time: '14m atrás' },
    { id: 3, title: 'Alerta do Sistema', detail: 'Mecanismo de Computação (US-EAST) está degradado', type: 'status', time: '1h atrás' },
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
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">3 Novas</span>
                  </div>
                  <div className="divide-y divide-outline-variant/10">
                    {notifications.map((n) => (
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

const Footer = ({ onStatusClick, onTermsClick, onPrivacyClick }: { onStatusClick: () => void, onTermsClick: () => void, onPrivacyClick: () => void }) => (
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

// --- Page Components ---

const TermsOfServicePage = ({ onBack }: { onBack: () => void }) => (
  <div className="max-w-4xl mx-auto space-y-12">
    <header className="text-center">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs hover:gap-3 transition-all mx-auto"
      >
        <ArrowLeft size={16} />
        Voltar para a Visão Geral
      </button>
      <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Termos de Serviço</h1>
      <p className="text-on-surface-variant text-lg leading-relaxed">Última atualização: 20 de Março de 2024</p>
    </header>

    <div className="bg-surface-container-lowest p-8 md:p-12 rounded-2xl border border-outline-variant/10 space-y-8 text-on-surface-variant leading-relaxed">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface font-headline">1. Aceitação dos Termos</h2>
        <p>Ao acessar e usar a plataforma HospedaMaringá, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com estes termos, por favor, não use nossos serviços.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface font-headline">2. Acordo de Nível de Serviço (SLA)</h2>
        <p>Garantimos 99,99% de tempo de atividade para nossa infraestrutura principal. No caso de uma violação deste SLA, os clientes podem ter direito a créditos de serviço, conforme descrito em nossa documentação detalhada de SLA.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface font-headline">3. Responsabilidades do Usuário</h2>
        <p>Os usuários são responsáveis por manter a segurança de suas credenciais de conta e por todas as atividades que ocorrem em sua conta. Você concorda em nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface font-headline">4. Atividades Proibidas</h2>
        <p>Nossa infraestrutura não pode ser usada para atividades ilegais, incluindo, mas não se limitando a: hospedagem de malware, realização de ataques DDoS ou acesso não autorizado a outros sistemas.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface font-headline">5. Limitação de Responsabilidade</h2>
        <p>A HospedaMaringá não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do seu uso ou incapacidade de usar o serviço.</p>
      </section>
    </div>
  </div>
);

const PrivacyPolicyPage = ({ onBack }: { onBack: () => void }) => (
  <div className="max-w-4xl mx-auto space-y-12">
    <header className="text-center">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs hover:gap-3 transition-all mx-auto"
      >
        <ArrowLeft size={16} />
        Voltar para a Visão Geral
      </button>
      <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Política de Privacidade</h1>
      <p className="text-on-surface-variant text-lg leading-relaxed">Última atualização: 20 de Março de 2024</p>
    </header>

    <div className="bg-surface-container-lowest p-8 md:p-12 rounded-2xl border border-outline-variant/10 space-y-8 text-on-surface-variant leading-relaxed">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface font-headline">1. Informações que Coletamos</h2>
        <p>Coletamos informações que você nos fornece diretamente, como quando você cria uma conta, atualiza seu perfil ou entra em contato com o suporte. Isso pode incluir seu nome, endereço de e-mail e informações de faturamento.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface font-headline">2. Como Usamos Suas Informações</h2>
        <p>Usamos as informações que coletamos para fornecer, manter e melhorar nossos serviços, processar transações e nos comunicar com você sobre sua conta e nossa plataforma.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface font-headline">3. Segurança de Dados</h2>
        <p>Implementamos medidas de segurança padrão da indústria para proteger suas informações pessoais contra acesso, divulgação ou destruição não autorizados. No entanto, nenhum método de transmissão pela internet é 100% seguro.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface font-headline">4. Serviços de Terceiros</h2>
        <p>Podemos compartilhar suas informações com prestadores de serviços terceirizados que realizam serviços em nosso nome, como processamento de pagamentos e análise de dados. Esses provedores são obrigados a proteger suas informações.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface font-headline">5. Seus Direitos</h2>
        <p>Você tem o direito de acessar, atualizar ou excluir suas informações pessoais. Você pode gerenciar as configurações de sua conta através da plataforma ou entrar em contato conosco para obter assistência.</p>
      </section>
    </div>
  </div>
);

const ProductsPage = () => {
  const products = [
    {
      id: 'hosting',
      title: 'Hospedagem Compartilhada',
      description: 'Ideal para sites pequenos e blogs. Performance otimizada com NVMe.',
      price: 'R$ 19,90',
      period: '/mês',
      icon: <Globe size={24} />,
      features: ['Domínio Grátis', 'SSL Ilimitado', 'Backups Diários', 'Suporte 24/7']
    },
    {
      id: 'vps',
      title: 'Servidores VPS',
      description: 'Controle total e recursos dedicados para aplicações escaláveis.',
      price: 'R$ 89,00',
      period: '/mês',
      icon: <Cpu size={24} />,
      features: ['Acesso Root', 'IP Dedicado', 'Escalabilidade Real', 'SSD NVMe']
    },
    {
      id: 'dedicated',
      title: 'Servidores Dedicados',
      description: 'Poder bruto para grandes projetos e infraestruturas críticas.',
      price: 'R$ 450,00',
      period: '/mês',
      icon: <Server size={24} />,
      features: ['Hardware Exclusivo', 'Tráfego Ilimitado', 'Rede 10Gbps', 'Monitoramento']
    },
    {
      id: 'ssl',
      title: 'Certificados SSL',
      description: 'Segurança e confiança para seus visitantes com criptografia forte.',
      price: 'R$ 49,00',
      period: '/ano',
      icon: <ShieldCheck size={24} />,
      features: ['Validação de Domínio', 'Selo de Segurança', 'Compatível com Browsers', 'Garantia']
    },
    {
      id: 'backup',
      title: 'Backup de Dados',
      description: 'Proteção contra perda de dados com armazenamento externo seguro.',
      price: 'R$ 29,90',
      period: '/mês',
      icon: <Database size={24} />,
      features: ['Snapshots Automáticos', 'Retenção de 30 dias', 'Restauração Rápida', 'Criptografia']
    },
    {
      id: 'licenses',
      title: 'Licenças e Softwares',
      description: 'Licenciamento oficial para cPanel, Plesk, CloudLinux e mais.',
      price: 'Sob consulta',
      period: '',
      icon: <Terminal size={24} />,
      features: ['Ativação Imediata', 'Suporte Técnico', 'Preços Competitivos', 'Gestão Centralizada']
    }
  ];

  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <span className="font-label text-xs tracking-widest uppercase text-primary font-bold mb-4 block">Soluções de Infraestrutura</span>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Nossos Planos e Produtos</h1>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Escolha a solução ideal para o seu projeto. De hospedagem simples a infraestruturas complexas e dedicadas.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10 hover:border-primary/30 transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                {product.icon}
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-primary">{product.price}</div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{product.period}</div>
              </div>
            </div>
            
            <h3 className="font-headline text-xl font-bold mb-3 group-hover:text-primary transition-colors">{product.title}</h3>
            <p className="text-on-surface-variant text-sm mb-8 flex-grow">{product.description}</p>
            
            <ul className="space-y-3 mb-8">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-xs font-medium text-on-surface">
                  <CheckCircle size={14} className="text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <button className="w-full py-4 bg-surface-container-highest text-on-surface font-bold rounded-xl hover:bg-primary hover:text-on-primary transition-all active:scale-95">
              Assinar Agora
            </button>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-primary/10">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold font-headline mb-4">Precisa de uma solução personalizada?</h2>
          <p className="text-on-surface-variant">Nossos arquitetos de nuvem podem desenhar uma infraestrutura sob medida para as necessidades específicas do seu negócio.</p>
        </div>
        <button className="px-8 py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-95 whitespace-nowrap">
          Falar com Especialista
        </button>
      </div>
    </div>
  );
};

const DashboardPage = ({ onManageService, onViewActivity, onOpenTicket, onViewStatus, onTicketClick, onViewProjects, onViewBilling }: { 
  onManageService: (id: string) => void, 
  onViewActivity: () => void,
  onOpenTicket: () => void,
  onViewStatus: () => void,
  onTicketClick: (id: string) => void,
  onViewProjects: () => void,
  onViewBilling: () => void
}) => {
  const [cpu, setCpu] = useState(42);
  const [mem, setMem] = useState(85);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => {
        const delta = (Math.random() - 0.5) * 6;
        const next = prev + delta;
        return next < 35 ? 35 : next > 55 ? 55 : next;
      });
      setMem(prev => {
        const delta = (Math.random() - 0.5) * 2;
        const next = prev + delta;
        return next < 82 ? 82 : next > 88 ? 88 : next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12">
      <div>
        <label className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block">Painel de Infraestrutura</label>
        <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary">Bem vindo, Alex Sterling</h1>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Servidor */}
          <div className="md:col-span-2 bg-surface-container-low rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary rounded-full pulse-ring"></span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Load Averages</span>
              </div>
            </div>
            <h3 className="font-headline text-2xl font-bold mb-8">Servidor</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Carga da CPU', value: `${Math.round(cpu)}%`, sub: 'Média: 2.4 GHz por núcleo', progress: cpu },
                { label: 'Memória', value: `${(8 * mem / 100).toFixed(1)}GB`, sub: 'Total: 8GB LPDDR5', progress: mem },
                { label: 'Disco NVMe', value: '120GB', sub: '400GB SSD Provisionado', progress: 30 },
              ].map(stat => (
                <div key={stat.label} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</label>
                    <span className="font-headline text-2xl font-black text-primary">{stat.value}</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-primary" 
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>

        {/* Active Services */}
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col h-[420px]">
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h3 className="font-bold text-xl mb-1">Serviços Ativos</h3>
              <p className="text-on-surface-variant text-sm">{MOCK_SERVICES.length} Assinaturas ativas</p>
            </div>
            <div className="">
              <Cloud className="text-[#035e75]" size={24} />
            </div>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
            {MOCK_SERVICES.map(service => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-3">
                  {service.type === 'hosting' ? <Server className="text-[#035e75]" size={20} /> : <Cpu className="text-[#035e75]" size={20} />}
                  <div>
                    <p className="font-bold text-sm">{service.name}</p>
                    <p className="text-xs text-on-surface-variant">{service.host}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onManageService(service.id)}
                  className="text-primary font-bold text-xs uppercase tracking-wider hover:underline"
                >
                  Gerenciar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Suporte e Faturas */}
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm flex flex-col h-[420px]">
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h3 className="font-bold text-xl mb-1">Suporte e Faturas</h3>
              <p className="text-on-surface-variant text-sm">Faturas, Tickets e Projetos</p>
            </div>
            <div className="">
              <MessageSquare className="text-[#035e75]" size={24} />
            </div>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
            {/* 1 Fatura Pendente */}
            {MOCK_INVOICES.filter(i => i.status === 'Pendente').slice(0, 1).map(invoice => (
              <div 
                key={invoice.id} 
                onClick={onViewBilling}
                className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="">
                    <CreditCard className="text-[#035e75]" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">Fatura Pendente {invoice.id}</p>
                    <p className="text-xs text-on-surface-variant">Vencimento: {invoice.date} • R$ {invoice.amount.toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-error text-error">
                  Pendente
                </span>
              </div>
            ))}

            {/* 1 Ticket Aberto */}
            {MOCK_TICKETS.filter(t => t.status === 'Aberto').slice(0, 1).map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => onTicketClick(ticket.id)}
                className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="">
                    <MessageSquare className="text-[#035e75]" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{ticket.title}</p>
                    <p className="text-xs text-on-surface-variant">{ticket.id} • {ticket.updatedAt}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                  ticket.priority === 'Alta' ? 'border-error text-error' : 
                  ticket.priority === 'Média' ? 'border-secondary text-secondary' : 
                  'border-outline-variant text-on-surface-variant'
                }`}>
                  {ticket.priority === 'Alta' ? 'Alta' : ticket.priority === 'Média' ? 'Média' : 'Baixa'}
                </span>
              </div>
            ))}

            {/* Projeto em Desenvolvimento */}
            <div 
              onClick={onViewProjects}
              className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="">
                  <Layout className="text-[#035e75]" size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm group-hover:text-primary transition-colors">Projeto em Desenvolvimento</p>
                  <p className="text-xs text-on-surface-variant">Status: Em Progresso • Clique para ver detalhes</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-primary text-primary">
                Projeto
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-8">
        <div className="bg-primary rounded-xl p-8 text-on-primary shadow-lg shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform">
            <HelpCircle size={120} />
          </div>
          <h4 className="text-xl font-bold mb-2">Precisa de Assistência Técnica?</h4>
          <p className="text-primary-fixed text-sm mb-6 leading-relaxed">Nossos engenheiros de infraestrutura estão disponíveis 24/7 para clientes de VPS gerenciado.</p>
          <button 
            onClick={onOpenTicket}
            className="w-full bg-surface-container-lowest text-primary py-3 rounded-lg font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
          >
            Abrir Ticket
          </button>
        </div>

        <div className="bg-surface-container-low rounded-xl p-8">
          <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
            <FileText className="text-secondary" size={20} />
            Atividade Recente
          </h4>
          <div className="space-y-6">
            {[
              { title: 'Novo Login Detectado', sub: 'Hoje, 10:12 • Maringá, PR (IP: 187.12.34.56)', active: true },
              { title: 'Fatura #MON-4492 Paga', sub: '14 de Nov, 2024 • R$ 10,00', active: true },
              { title: 'Backup Concluído', sub: '13 de Nov, 2024 • monolith-v1.com', active: false },
              { title: 'Atualização do Sistema', sub: '10 de Nov, 2024 • VPS Kernel 6.1', active: true },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className={`min-w-[4px] h-12 rounded-full ${activity.active ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                <div>
                  <p className="text-sm font-bold">{activity.title}</p>
                  <p className="text-xs text-on-surface-variant">{activity.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={onViewActivity}
            className="mt-8 text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
          >
            Ver Todo o Histórico <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>

    <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-surface-container-high rounded-xl gap-4">
      <div className="flex items-center gap-4 text-sm font-medium">
        <span className="flex items-center gap-2 text-primary font-bold">
          <CheckCircle size={18} />
          Todos os Sistemas Operacionais
        </span>
        <span className="hidden md:block w-1 h-1 bg-outline-variant rounded-full"></span>
        <span className="text-on-surface-variant">Última verificação: 2 minutos atrás</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-tighter">Tempo de Atividade</span>
          <span className="font-headline text-xl font-black">99.99%</span>
        </div>
        <button 
          onClick={onViewStatus}
          className="text-[10px] font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 hover:border-primary transition-all pb-1"
        >
          Status Detalhado
        </button>
      </div>
    </div>
  </div>
);
};

const BillingPage = ({ userProfile, invoices, setInvoices }: { userProfile: UserProfile, invoices: Invoice[], setInvoices: (invoices: Invoice[]) => void }) => {
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState('10,00');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<'pix' | 'boleto' | 'nupay'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Novos estados para Métodos de Pagamento
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [customPaymentMethods, setCustomPaymentMethods] = useState([
    { id: 'sys-1', icon: <QrCode size={20} />, title: 'Pix (Sistema)', sub: 'Pagamento Instantâneo', type: 'system' },
    { id: 'sys-2', icon: <FileText size={20} />, title: 'Boleto (Sistema)', sub: 'Compensação em até 3 dias', type: 'system' },
  ]);
  
  const [newCard, setNewCard] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  // Estados para busca de status
  const [transactionSearchId, setTransactionSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchStatus = async () => {
    if (!transactionSearchId) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const response = await fetch('/api/payments/paghiper/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionSearchId })
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        setSearchResult(data);
      } else {
        const text = await response.text();
        console.error('Resposta não-JSON recebida:', text);
        setSearchResult({ error: 'Erro interno do servidor. Tente novamente mais tarde.' });
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      setSearchResult({ error: 'Falha na consulta' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.name || !newCard.number || !newCard.expiry || !newCard.cvv) return;

    const last4 = newCard.number.replace(/\s/g, '').slice(-4);
    const brand = newCard.number.startsWith('4') ? 'Visa' : 'Mastercard';

    const newMethod = {
      id: `custom-${Date.now()}`,
      icon: <CreditCard size={20} />,
      title: `•••• •••• •••• ${last4}`,
      sub: `${brand} • Expira em ${newCard.expiry}`,
      type: 'custom'
    };

    setCustomPaymentMethods([...customPaymentMethods, newMethod]);
    setIsAddCardModalOpen(false);
    setNewCard({ name: '', number: '', expiry: '', cvv: '' });
  };

  const handleDeleteMethod = (id: string) => {
    setCustomPaymentMethods(customPaymentMethods.filter(m => m.id !== id));
  };

  const handleApplyCredit = () => {
    const amount = parseCurrency(creditAmount);
    if (amount <= 0) return;
    
    // Formata de volta para o padrão brasileiro para exibir no modal
    setCreditAmount(formatNumberBR(amount));
    
    // Gera uma fatura temporária para pagamento do crédito
    handlePayInvoice({
      id: `#CR-${Math.floor(Math.random() * 9000) + 1000}`,
      date: 'Hoje',
      amount: amount,
      status: 'Pendente'
    });
    
    setIsCreditModalOpen(false);
  };

  const invoicesRef = useRef(invoices);
  useEffect(() => {
    invoicesRef.current = invoices;
  }, [invoices]);

  useEffect(() => {
    const pollPaymentStatus = async () => {
      const pendingInvoices = invoicesRef.current.filter(inv => inv.status === 'Pendente' && inv.transactionId);
      if (pendingInvoices.length === 0) return;

      for (const invoice of pendingInvoices) {
        try {
          const response = await fetch('/api/payments/paghiper/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_id: invoice.transactionId })
          });
          
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (data.status_request && (data.status_request.status === 'paid' || data.status_request.status === 'completed')) {
              setInvoices(invoicesRef.current.map(inv => 
                inv.id === invoice.id ? { ...inv, status: 'Completo', date: new Date().toLocaleDateString('pt-BR') } : inv
              ));
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status do pagamento:', error);
        }
      }
    };

    pollPaymentStatus();
    const interval = setInterval(pollPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const paymentMethods = [
    'Boleto Bancário',
    'Pix',
    'Cartão de Crédito',
    'Transferência'
  ];

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
    setPaymentResult(null);
  };

  const processPayment = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    setPaymentResult(null);

    try {
      let endpoint = '';
      if (checkoutMethod === 'pix') endpoint = '/api/payments/paghiper/pix';
      if (checkoutMethod === 'boleto') endpoint = '/api/payments/paghiper/boleto';
      if (checkoutMethod === 'nupay') endpoint = '/api/payments/nupay';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id.replace('#', ''),
          amount: selectedInvoice.amount,
          description: `Pagamento Fatura ${selectedInvoice.id}`,
          payerName: userProfile.name,
          payerEmail: userProfile.email,
          payerCpf: userProfile.cpf || userProfile.cnpj
        })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || contentType.indexOf("application/json") === -1) {
        const text = await response.text();
        console.error('Resposta não-JSON recebida no pagamento:', text);
        setPaymentResult({ error: 'Erro interno do servidor ao processar pagamento.' });
        return;
      }

      const data = await response.json();
      
      if (checkoutMethod === 'pix' && data.pix_create_request) {
        if (data.pix_create_request.result === 'reject') {
          setPaymentResult({ error: data.pix_create_request.response_message || 'Erro desconhecido ao gerar PIX' });
        } else {
          // PagHiper retorna pix_code como um objeto contendo qrcode_image_url e emv (código copia e cola)
          const pixInfo = data.pix_create_request.pix_code;
          const transactionId = data.pix_create_request.transaction_id;
          
          // Atualiza a fatura com o transactionId para polling
          setInvoices(invoices.map(inv => 
            inv.id === selectedInvoice.id ? { ...inv, transactionId } : inv
          ));

          setPaymentResult({ 
            pix_code: pixInfo.emv || '', 
            qrcode_image_url: pixInfo.qrcode_image_url || '' 
          });
        }
      } else if (checkoutMethod === 'boleto' && data.create_request) {
        if (data.create_request.result === 'reject') {
          setPaymentResult({ error: data.create_request.response_message || 'Erro desconhecido ao gerar Boleto' });
        } else {
          const transactionId = data.create_request.transaction_id;
          
          // Atualiza a fatura com o transactionId para polling
          setInvoices(invoices.map(inv => 
            inv.id === selectedInvoice.id ? { ...inv, transactionId } : inv
          ));

          setPaymentResult({ bank_slip: data.create_request.bank_slip });
        }
      } else if (data.error) {
        setPaymentResult({ error: typeof data.error === 'string' ? data.error : JSON.stringify(data.error) });
      } else {
        setPaymentResult({ error: 'Resposta inesperada do servidor.' });
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setPaymentResult({ error: 'Falha ao processar o pagamento. Verifique sua conexão.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Opcional: Adicionar um toast ou feedback visual
  };

  return (
    <div className="space-y-12">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <span className="text-[10px] text-primary tracking-widest font-bold uppercase block mb-2">Assinatura Atual</span>
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden border border-outline-variant/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="md:border-r md:border-outline-variant/10 md:pr-8">
                <h1 className="text-3xl font-extrabold text-on-surface tracking-tight font-headline mb-2">Enterprise Cloud Node</h1>
                <p className="text-xs text-on-surface-variant font-medium">Faturado anualmente • Próxima renovação: 12 de Out, 2024</p>
                
                <div className="mt-8 flex flex-wrap gap-3">
                  <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">Upgrade de Plano</button>
                  <button 
                    onClick={() => setIsCreditModalOpen(true)}
                    className="bg-surface-container-highest text-on-surface px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-surface-variant transition-all active:scale-95"
                  >
                    Carregar Créditos
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 group hover:border-primary/20 transition-colors">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Hospedagem Pro Compartilhada</h4>
                    <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Próxima: 12 de Out, 2024</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 group hover:border-primary/20 transition-colors">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                    <Server size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">VPS Gerenciado NVMe</h4>
                    <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Próxima: 05 de Abr, 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-amber-50/50 rounded-xl p-8 backdrop-blur-sm relative border border-amber-200/30">
          <div className="flex justify-between items-start mb-6">
            <AlertCircle className="text-amber-600" size={32} />
            <span className="text-amber-600 font-black font-headline text-2xl border-b-2 border-amber-600/30 pb-1">Pendente</span>
          </div>
          <h3 className="text-xl font-bold text-amber-900 mb-2">Fatura em Aberto</h3>
          <p className="text-amber-800/70 text-sm mb-6 leading-relaxed">Fatura #9042 para renovação de domínio está atrasada há 3 dias.</p>
          <div className="text-2xl font-bold text-amber-700 mb-6">{formatCurrency(10.00)}</div>
          <button 
            onClick={() => handlePayInvoice({ id: '#9042', date: '17 de Mar, 2024', amount: 10.00, status: 'Pendente' })}
            className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition-all active:scale-95 shadow-lg shadow-amber-600/20"
          >
            Pagar Agora
          </button>
        </div>
      </section>

      <AnimatePresence>
        {isCreditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreditModalOpen(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/10 overflow-hidden"
            >
              <div className="bg-primary p-8 text-on-primary">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-headline text-2xl font-bold">Carregar Créditos</h3>
                  <button onClick={() => setIsCreditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <p className="text-on-primary/70 text-sm">Adicione saldo à sua conta Hospeda Maringá</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Valor do Crédito (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">R$</span>
                    <input 
                      type="text" 
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      onBlur={() => {
                        const amount = parseCurrency(creditAmount);
                        if (amount > 0) setCreditAmount(formatNumberBR(amount));
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-12 pr-4 py-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Método de Pagamento</label>
                  <div className="grid grid-cols-1 gap-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          paymentMethod === method 
                            ? 'bg-primary/5 border-primary text-primary' 
                            : 'bg-surface-container-low border-outline-variant/10 text-on-surface hover:border-primary/30'
                        }`}
                      >
                        <span className="font-bold text-sm">{method}</span>
                        {paymentMethod === method && <CheckCircle size={18} />}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleApplyCredit}
                  className="w-full bg-primary text-on-primary py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
                >
                  Aplicar Crédito
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaymentModalOpen && selectedInvoice && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-primary p-8 text-on-primary shrink-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-headline text-2xl font-bold">Pagamento de Fatura</h3>
                  <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <p className="text-on-primary/70 text-sm">Fatura {selectedInvoice.id} • R$ {selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                {!paymentResult ? (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Escolha o Método de Pagamento</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: 'pix', name: 'PIX (PagHiper)', icon: <QrCode size={24} /> },
                          { id: 'boleto', name: 'Boleto (PagHiper)', icon: <FileText size={24} /> },
                          { id: 'nupay', name: 'NuPay', icon: <CreditCard size={24} /> }
                        ].map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setCheckoutMethod(method.id as any)}
                            className={`flex flex-col items-center justify-center p-6 gap-3 rounded-2xl border-2 transition-all ${
                              checkoutMethod === method.id 
                                ? 'bg-primary/5 border-primary text-primary' 
                                : 'bg-surface-container-low border-outline-variant/10 text-on-surface hover:border-primary/30'
                            }`}
                          >
                            {method.icon}
                            <span className="font-bold text-sm text-center">{method.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={processPayment}
                      disabled={isProcessing}
                      className="w-full bg-primary text-on-primary py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                          Processando...
                        </>
                      ) : (
                        <>Gerar Pagamento</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {paymentResult.error ? (
                      <div className="p-6 bg-error-container text-on-error-container rounded-2xl text-center">
                        <AlertCircle size={48} className="mx-auto mb-4 text-error" />
                        <h4 className="font-bold text-lg mb-2">Erro no Pagamento</h4>
                        <p>{paymentResult.error}</p>
                        <button 
                          onClick={() => setPaymentResult(null)}
                          className="mt-6 px-6 py-2 bg-error text-on-error rounded-lg font-bold text-sm"
                        >
                          Tentar Novamente
                        </button>
                      </div>
                    ) : checkoutMethod === 'pix' ? (
                      <div className="text-center space-y-6">
                        <div className="inline-block p-4 bg-white rounded-2xl">
                          {paymentResult.qrcode_image_url ? (
                            <img src={paymentResult.qrcode_image_url} alt="QR Code PIX" className="w-48 h-48 object-contain" />
                          ) : (
                            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-400">
                              <QrCode size={64} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-2">Escaneie o QR Code</h4>
                          <p className="text-sm text-on-surface-variant mb-6">Abra o app do seu banco e escaneie o código acima para pagar via PIX.</p>
                          
                        <div className="text-left space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ou copie o código PIX</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              readOnly 
                              value={paymentResult.pix_code || ''} 
                              className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3 font-mono text-xs focus:outline-none"
                            />
                            <button 
                              onClick={() => copyToClipboard(paymentResult.pix_code || '')}
                              className="px-4 bg-secondary text-on-secondary rounded-lg font-bold hover:bg-secondary/90 transition-colors"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                        </div>
                      </div>
                    ) : checkoutMethod === 'boleto' ? (
                      <div className="text-center space-y-6">
                        <FileText size={64} className="mx-auto text-primary" />
                        <div>
                          <h4 className="font-bold text-lg mb-2">Boleto Gerado com Sucesso</h4>
                          <p className="text-sm text-on-surface-variant mb-6">Seu boleto foi gerado e está pronto para pagamento. O prazo de compensação é de até 3 dias úteis.</p>
                          <a 
                            href={paymentResult.bank_slip?.url_slip || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-opacity"
                          >
                            <Download size={20} />
                            Visualizar / Imprimir Boleto
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <CreditCard size={64} className="mx-auto text-[#8A05BE]" />
                        <div>
                          <h4 className="font-bold text-lg mb-2">Redirecionando para NuPay</h4>
                          <p className="text-sm text-on-surface-variant mb-6">Você será redirecionado para o ambiente seguro do Nubank para concluir o pagamento.</p>
                          <a 
                            href={paymentResult.checkoutUrl || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#8A05BE] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                          >
                            <ExternalLink size={20} />
                            Pagar com NuPay
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold font-headline tracking-tight">Métodos de Pagamento</h2>
        <div className="bg-surface-container-low rounded-xl p-2 space-y-2">
          {customPaymentMethods.map((method) => (
            <div key={method.id} className="bg-surface-container-lowest p-5 rounded-lg flex items-center justify-between group cursor-pointer hover:bg-surface-bright transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-on-surface/5 rounded flex items-center justify-center text-on-surface-variant">
                  {method.icon}
                </div>
                <div>
                  <p className="font-bold text-sm">{method.title}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">{method.sub}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {method.type === 'system' ? (
                  <span className="text-primary text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Sistema</span>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMethod(method.id);
                    }}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir Método"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setIsAddCardModalOpen(true)}
          className="text-primary font-bold text-xs flex items-center space-x-2 hover:underline decoration-2 underline-offset-4"
        >
          <Plus size={16} />
          <span>Adicionar Novo Método</span>
        </button>
      </div>

      <AnimatePresence>
        {isAddCardModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddCardModalOpen(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/10 overflow-hidden"
            >
              <div className="bg-primary p-8 text-on-primary">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-headline text-2xl font-bold">Novo Cartão de Crédito</h3>
                  <button onClick={() => setIsAddCardModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <p className="text-on-primary/70 text-sm">Adicione um novo cartão para pagamentos automáticos</p>
              </div>

              <form onSubmit={handleAddCard} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nome no Cartão</label>
                  <input 
                    type="text" 
                    required
                    value={newCard.name}
                    onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Ex: JOÃO SILVA"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Número do Cartão</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={newCard.number}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        val = val.replace(/(\d{4})/g, '$1 ').trim();
                        if (val.length <= 19) setNewCard({...newCard, number: val});
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                      placeholder="0000 0000 0000 0000"
                    />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Data Expiração</label>
                    <input 
                      type="text" 
                      required
                      value={newCard.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 2) {
                          setNewCard({...newCard, expiry: val});
                        } else if (val.length <= 4) {
                          setNewCard({...newCard, expiry: val.slice(0, 2) + '/' + val.slice(2)});
                        }
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="MM/AA"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Código (CVV)</label>
                    <input 
                      type="text" 
                      required
                      value={newCard.cvv}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 4) setNewCard({...newCard, cvv: val});
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="123"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
                >
                  Salvar Cartão
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-extrabold font-headline tracking-tight">Histórico de Faturamento</h2>
          <button className="text-[10px] font-bold text-primary uppercase tracking-widest">Baixar Tudo</button>
        </div>

        {/* Ferramenta de Busca de Status PagHiper */}
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Consulta de status do boleto / PIX</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="text" 
                  placeholder="ID da Transação (ex: HP...)" 
                  value={transactionSearchId}
                  onChange={(e) => {
                    setTransactionSearchId(e.target.value);
                    if (e.target.value === '') setSearchResult(null);
                  }}
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>
            <button 
              onClick={handleSearchStatus}
              disabled={isSearching || !transactionSearchId}
              className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {isSearching ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
              Consultar
            </button>
          </div>

          {searchResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border relative ${searchResult.error || (searchResult.status_request && searchResult.status_request.result === 'reject') ? 'bg-error-container text-on-error-container border-error/20' : 'bg-primary/5 text-on-surface border-primary/20'}`}
            >
              <button 
                onClick={() => setSearchResult(null)}
                className="absolute top-2 right-2 text-on-surface-variant hover:text-primary"
              >
                <X size={16} />
              </button>
              {searchResult.error ? (
                <p className="text-sm font-medium">{searchResult.error}</p>
              ) : searchResult.status_request && searchResult.status_request.result === 'reject' ? (
                <p className="text-sm font-medium">{searchResult.status_request.response_message}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase">Status</span>
                    <span className="font-bold text-primary">{searchResult.status_request?.status || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase">Valor</span>
                    <span className="font-bold">{formatCurrency(searchResult.status_request?.value_cents / 100 || 0)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase">Data</span>
                    <span>{
                      searchResult.status_request?.date || 
                      searchResult.status_request?.created_date || 
                      searchResult.status_request?.paid_date || 
                      searchResult.status_request?.due_date || 
                      searchResult.status_request?.payment_date || 
                      searchResult.status_request?.transaction_date || 
                      searchResult.status_request?.date_created || 
                      searchResult.status_request?.date_paid || 
                      searchResult.status_request?.order_date || 
                      searchResult.status_request?.date_request || 
                      searchResult.status_request?.date_status || 
                      searchResult.status_request?.date_transaction || 
                      searchResult.status_request?.date_payment || 
                      searchResult.status_request?.date_order || 
                      searchResult.status_request?.date_invoice || 
                      searchResult.status_request?.date_status_update || 
                      searchResult.status_request?.date_confirmed || 
                      searchResult.status_request?.date_approval || 
                      searchResult.status_request?.date_payment_confirmed || 
                      searchResult.status_request?.transaction_date_time || 
                      searchResult.status_request?.date_status_change || 
                      searchResult.status_request?.date_status_updated || 
                      searchResult.status_request?.date_status_confirmed || 
                      searchResult.status_request?.date_status_approved || 
                      searchResult.status_request?.date_status_paid || 
                      searchResult.status_request?.date_status_completed || 
                      searchResult.status_request?.date_status_finished || 
                      searchResult.status_request?.date_status_finalized || 
                      searchResult.status_request?.date_status_processed || 
                      searchResult.status_request?.date_status_received || 
                      searchResult.status_request?.date_status_notified || 
                      searchResult.status_request?.date_status_sent || 
                      searchResult.status_request?.date_status_delivered || 
                      searchResult.status_request?.date_status_returned || 
                      searchResult.status_request?.date_status_refunded || 
                      searchResult.status_request?.date_status_cancelled || 
                      searchResult.status_request?.date_status_expired || 
                      searchResult.status_request?.date_status_rejected || 
                      searchResult.status_request?.date_status_failed || 
                      searchResult.status_request?.date_status_denied || 
                      searchResult.status_request?.date_status_voided || 
                      searchResult.status_request?.date_status_reversed || 
                      searchResult.status_request?.date_status_chargeback || 
                      searchResult.status_request?.date_status_disputed || 
                      searchResult.status_request?.date_status_awaiting || 
                      searchResult.status_request?.date_status_pending || 
                      searchResult.status_request?.date_status_in_progress || 
                      searchResult.status_request?.date_status_on_hold || 
                      searchResult.status_request?.date_status_waiting_payment || 
                      searchResult.status_request?.date_status_waiting || 
                      searchResult.status_request?.date_status_authorized || 
                      searchResult.status_request?.date_status_pre_authorized || 
                      searchResult.status_request?.date_status_partially_refunded || 
                      searchResult.status_request?.date_status_under_review || 
                      searchResult.status_request?.date_status_on_hold_review || 
                      searchResult.status_request?.date_status_waiting_review || 
                      searchResult.status_request?.date_status_under_investigation || 
                      searchResult.status_request?.date_status_disputed_review || 
                      searchResult.status_request?.date_status_chargeback_review || 
                      searchResult.status_request?.date_status_voided_review || 
                      searchResult.date || 
                      searchResult.created_date || 
                      searchResult.paid_date || 
                      'N/A'
                    }</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                {['Fatura', 'Data', 'Valor', 'Status', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {invoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-surface-bright transition-colors">
                  <td className="px-6 py-5 font-bold text-sm text-on-surface">{invoice.id}</td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{invoice.date}</td>
                  <td className="px-6 py-5 font-bold text-sm">{formatCurrency(invoice.amount)}</td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded ${invoice.status === 'Completo' ? 'bg-[#08ac76]/10 text-[#08ac76]' : 'bg-primary/10 text-primary'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right flex items-center justify-end gap-3">
                    {invoice.status === 'Pendente' && (
                      <button 
                        onClick={() => handlePayInvoice(invoice)}
                        className="px-3 py-1.5 bg-error text-on-error rounded-lg font-bold text-xs hover:bg-error/90 transition-colors"
                      >
                        Pagar
                      </button>
                    )}
                    {invoice.status === 'Completo' && (
                      <span className="px-3 py-1.5 bg-[#08ac76]/10 text-[#08ac76] rounded-lg font-bold text-xs">
                        Pago
                      </span>
                    )}
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6 mt-12">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-primary" size={24} />
          <h2 className="text-2xl font-extrabold font-headline tracking-tight">Configurações de Webhook</h2>
        </div>
        
        <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Para que o sistema receba confirmações de pagamento automáticas do PagHiper, configure a URL abaixo no seu painel da PagHiper em <strong>Minha Conta &gt; Configurações &gt; Retorno Automático</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">URL de Notificação (Webhook)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/api/payments/paghiper/webhook`} 
                className="flex-1 bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-4 font-mono text-xs focus:outline-none"
              />
              <button 
                onClick={() => copyToClipboard(`${window.location.origin}/api/payments/paghiper/webhook`)}
                className="px-6 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Copy size={18} />
                Copiar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-outline-variant/10">
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <ShieldCheck size={14} /> IPs Autorizados (Whitelist)
              </h4>
              <ul className="space-y-2">
                {['3.228.145.191', '15.188.152.107', '54.207.60.165'].map(ip => (
                  <li key={ip} className="flex items-center gap-2 text-xs font-mono text-on-surface-variant bg-surface-container-lowest px-3 py-1.5 rounded-lg w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {ip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Users size={14} /> User-Agents Aceitos
              </h4>
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-on-surface-variant bg-surface-container-lowest p-2 rounded-lg leading-tight">
                  PAGHIPER-Webhook/1.3
                </p>
                <p className="text-[10px] font-mono text-on-surface-variant bg-surface-container-lowest p-2 rounded-lg leading-tight">
                  Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-[10px] text-primary font-medium leading-relaxed">
              <strong>Nota de Segurança:</strong> O sistema está configurado para validar a origem das notificações através destes IPs e User-Agents, garantindo que apenas a PagHiper possa atualizar o status dos seus pagamentos.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-primary text-on-primary rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -ml-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mb-48 blur-3xl"></div>
      </div>
      <div className="relative z-10 max-w-xl">
        <h2 className="text-3xl font-black font-headline mb-4 leading-tight">Mude para o faturamento bienal e economize até 25%</h2>
        <p className="text-on-primary/80 font-medium">Estenda seu compromisso e garanta nossas taxas de infraestrutura atuais pelos próximos 24 meses.</p>
      </div>
      <div className="relative z-10">
        <button className="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform active:scale-95">Calcular Economia</button>
      </div>
    </section>
  </div>
  );
};

const SupportPage = ({ onTicketClick }: { onTicketClick: (id: string) => void }) => {
  const [filter, setFilter] = useState<'Todos' | 'Abertos' | 'Fechados'>('Todos');
  const [search, setSearch] = useState('');

  const filteredTickets = MOCK_TICKETS.filter(ticket => {
    const matchesFilter = 
      filter === 'Todos' || 
      (filter === 'Abertos' && (ticket.status === 'Aberto' || ticket.status === 'Em Andamento')) ||
      (filter === 'Fechados' && ticket.status === 'Fechado');
    const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase()) || ticket.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold mb-4 block">Central de Ajuda</span>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Tickets de Suporte</h1>
        <p className="text-on-surface-variant text-lg leading-relaxed">Gerencie suas consultas de infraestrutura. Nossos engenheiros estão monitorando o monólito 24 horas por dia.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-surface-container-low rounded-xl p-8 flex items-center justify-between overflow-hidden relative group">
          <div>
            <div className="text-4xl font-headline font-black text-primary mb-1">04</div>
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Tickets Ativos</div>
          </div>
          <div className="h-16 w-px bg-outline-variant/20 hidden md:block"></div>
          <div>
            <div className="text-4xl font-headline font-black text-on-surface mb-1">12m</div>
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Resposta Média</div>
          </div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <button className="flex flex-col items-center justify-center gap-3 bg-surface-container-highest text-on-surface p-6 rounded-xl font-bold active:scale-95 transition-all border border-outline-variant/20 hover:bg-surface-container-high group">
            <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <Zap size={24} />
            </div>
            <span className="text-xs uppercase tracking-widest">Fast-Track</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary to-primary-container text-on-primary p-6 rounded-xl font-bold active:scale-95 transition-all shadow-lg hover:shadow-primary/20 group">
            <div className="p-3 bg-white/20 rounded-full text-white">
              <Plus size={24} />
            </div>
            <span className="text-xs uppercase tracking-widest">Novo Ticket</span>
          </button>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar tickets..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mr-2">Filtrar:</span>
            {['Todos', 'Abertos', 'Fechados'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                  filter === f
                    ? 'bg-primary text-on-primary border-primary shadow-sm' 
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/10 hover:border-primary/30'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-outline-variant/20 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mr-2">Ordenar por:</span>
            <button className="px-4 py-2 bg-surface-container-lowest rounded-lg text-xs font-bold border border-outline-variant/10 hover:border-primary/30 transition-all text-primary border-primary/20">Mais Recentes</button>
            <button className="px-4 py-2 bg-surface-container-lowest rounded-lg text-xs font-bold border border-outline-variant/10 hover:border-primary/30 transition-all text-on-surface-variant">Prioridade</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
          <div 
            key={ticket.id} 
            onClick={() => onTicketClick(ticket.id)}
            className="bg-surface-container-lowest p-6 md:p-8 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-container-low transition-colors group cursor-pointer border border-transparent hover:border-primary/10"
          >
            <div className="flex items-start gap-6">
              <div className="mt-1">
                {ticket.status === 'Aberto' ? (
                  <span className="w-3 h-3 rounded-full bg-primary block relative">
                    <span className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping opacity-75"></span>
                  </span>
                ) : ticket.status === 'Em Andamento' ? (
                  <span className="w-3 h-3 rounded-full bg-secondary block"></span>
                ) : (
                  <CheckCircle className="text-outline" size={20} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{ticket.title}</h3>
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    ticket.priority === 'Alta' ? 'border-error text-error' : 
                    ticket.priority === 'Média' ? 'border-secondary text-secondary' : 
                    'border-outline-variant text-on-surface-variant'
                  }`}>
                    Prioridade {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-on-surface-variant text-sm">
                  <span className="flex items-center gap-1 font-medium"><Tag size={14} /> {ticket.id}</span>
                  <span className="flex items-center gap-1"><History size={14} /> Atualizado {ticket.updatedAt}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest mb-1">Status</span>
                <span className={`font-bold ${ticket.status === 'Aberto' ? 'text-primary' : ticket.status === 'Em Andamento' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  {ticket.status}
                </span>
              </div>
              <ChevronRight className="text-outline group-hover:text-primary transition-colors" />
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
            <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum ticket encontrado</h3>
            <p className="text-on-surface-variant">Tente ajustar seus filtros ou consulta de pesquisa.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TicketDetailPage = ({ ticketId, onBack }: { ticketId: string, onBack: () => void }) => {
  const ticket = MOCK_TICKETS.find(t => t.id === ticketId);
  const responses = MOCK_TICKET_RESPONSES[ticketId] || [];

  if (!ticket) return null;

  return (
    <div className="space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Voltar para Tickets</span>
      </button>

      <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black font-headline text-on-surface">{ticket.title}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                ticket.priority === 'Alta' ? 'border-error text-error' : 
                ticket.priority === 'Média' ? 'border-secondary text-secondary' : 
                'border-outline-variant text-on-surface-variant'
              }`}>
                Prioridade {ticket.priority}
              </span>
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant text-sm">
              <span className="font-bold">{ticket.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><History size={14} /> Última atualização {ticket.updatedAt}</span>
              <span>•</span>
              <span className={`font-bold ${ticket.status === 'Aberto' ? 'text-primary' : ticket.status === 'Em Andamento' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                {ticket.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-lg font-bold hover:bg-surface-container-high transition-colors">Fechar Ticket</button>
            <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform">Responder</button>
          </div>
        </div>

        <div className="space-y-6">
          {responses.map((resp, i) => (
            <div key={i} className={`flex flex-col ${resp.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] p-6 rounded-2xl ${
                resp.role === 'user' 
                  ? 'bg-primary text-on-primary rounded-tr-none' 
                  : 'bg-surface-container-low text-on-surface rounded-tl-none border border-outline-variant/10'
              }`}>
                <div className="flex items-center justify-between gap-8 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{resp.sender}</span>
                    <span className={`text-[10px] uppercase tracking-widest opacity-70 ${resp.role === 'user' ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                      {resp.role === 'user' ? 'Usuário' : 'Suporte'}
                    </span>
                  </div>
                  <span className={`text-[10px] opacity-70 ${resp.role === 'user' ? 'text-on-primary' : 'text-on-surface-variant'}`}>{resp.time}</span>
                </div>
                <p className="leading-relaxed">{resp.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">AS</div>
            <span className="font-bold">Alex Sterling</span>
          </div>
          <textarea 
            placeholder="Digite sua mensagem aqui..."
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-4"
          />
          <div className="flex justify-between items-center">
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold transition-colors">
              <Plus size={18} />
              <span>Anexar Arquivos</span>
            </button>
            <button className="bg-primary text-on-primary px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 transition-transform active:scale-95">Enviar Resposta</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusPage = () => (
  <div className="space-y-12">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div className="max-w-2xl">
        <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold mb-4 block">Saúde do Sistema</span>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Status do Serviço</h1>
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 p-4 rounded-xl w-fit">
          <CheckCircle className="text-primary" size={24} />
          <span className="font-bold text-primary">Todos os Sistemas Operacionais</span>
        </div>
      </div>
      <button className="flex items-center gap-2 bg-surface-container-highest text-on-surface px-6 py-3 rounded-lg font-bold active:scale-95 transition-all">
        <RefreshCw size={18} />
        <span>Atualizar Status</span>
      </button>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_STATUS.map((service, i) => (
        <div key={i} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-lg">{service.name}</h3>
            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
              service.status === 'operational' ? 'border-primary text-primary' : 
              service.status === 'degraded' ? 'border-secondary text-secondary' : 
              'border-error text-error'
            }`}>
              {service.status === 'operational' ? 'Operacional' : service.status === 'degraded' ? 'Degradado' : 'Interrupção'}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant font-medium">Tempo de Atividade (90d)</span>
              <span className="font-bold">{service.uptime}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant font-medium">Latência</span>
              <span className="font-bold">{service.latency}</span>
            </div>
            <div className="flex gap-1 h-8 items-end">
              {[...Array(30)].map((_, j) => (
                <div 
                  key={j} 
                  className={`flex-1 rounded-full ${j === 25 && service.status === 'degraded' ? 'bg-secondary h-4' : 'bg-primary h-8'} opacity-${Math.max(20, 100 - (29-j)*2)}`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>

    <section className="bg-surface-container-low rounded-xl p-8">
      <h2 className="text-2xl font-bold font-headline mb-6">Incidentes Recentes</h2>
      <div className="space-y-6">
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <AlertCircle size={20} />
            </div>
            <div className="w-px h-full bg-outline-variant/20 mt-2"></div>
          </div>
          <div className="pb-8">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">18 de Março de 2024</p>
            <h4 className="font-bold text-lg mb-2">Interrupção Parcial: Nós de Computação US-EAST</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">Experimentamos um breve período de aumento de latência e problemas de conectividade intermitente para nós de computação na região US-EAST. O problema foi rastreado até um provedor de backbone e foi resolvido.</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">15 de Março de 2024</p>
            <h4 className="font-bold text-lg mb-2">Manutenção Agendada: Migração de Banco de Dados</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">Migração bem-sucedida de clusters de banco de dados primários para a nova infraestrutura baseada em NVMe. Nenhuma interrupção foi observada durante a transição.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const ActivityLogPage = ({ initialCategory = 'Toda Atividade' }: { initialCategory?: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const categories = ['Toda Atividade', 'Infraestrutura', 'Segurança', 'Faturamento', 'Conta'];

  const filteredLogs = MOCK_ACTIVITY.filter(log => {
    const matchesSearch = log.event.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const categoryMap: Record<string, string> = {
      'Infraestrutura': 'infrastructure',
      'Segurança': 'security',
      'Faturamento': 'billing',
      'Conta': 'account'
    };

    const matchesCategory = selectedCategory === 'Toda Atividade' || log.category === categoryMap[selectedCategory];

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold mb-4 block">Trilha de Auditoria</span>
          <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Log de Atividades</h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">Um histórico detalhado de todas as ações realizadas em sua conta e infraestrutura Hospeda Maringá.</p>
        </div>
        <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-xl border border-outline-variant/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-container-lowest border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary w-64"
            />
          </div>
          <button className="bg-primary text-on-primary p-2 rounded-lg active:scale-95 transition-all">
            <Download size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              selectedCategory === cat ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-surface-container-low">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-surface-bright transition-colors flex flex-col md:flex-row gap-6 items-start">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className={`p-3 rounded-xl ${
                    log.category === 'infrastructure' ? 'bg-primary/10 text-primary' : 
                    log.category === 'security' ? 'bg-error-container text-on-error-container' : 
                    log.category === 'billing' ? 'bg-secondary-container text-on-secondary-container' : 
                    'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {log.category === 'infrastructure' ? <Database size={20} /> : 
                     log.category === 'security' ? <Lock size={20} /> : 
                     log.category === 'billing' ? <CreditCard size={20} /> : 
                     <UserCircle size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{log.event}</p>
                    <p className="text-xs text-on-surface-variant">{log.timestamp}</p>
                  </div>
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-on-surface-variant leading-relaxed">{log.details}</p>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full">
                  <Tag size={12} className="text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    {log.category === 'infrastructure' ? 'Infraestrutura' : 
                     log.category === 'security' ? 'Segurança' : 
                     log.category === 'billing' ? 'Faturamento' : 'Conta'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full">
                  <UserCircle size={14} className="text-on-surface-variant" />
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{log.user}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center text-on-surface-variant">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">Nenhum log encontrado</p>
              <p className="text-sm">Tente ajustar sua pesquisa ou filtros.</p>
            </div>
          )}
        </div>
        <div className="p-6 bg-surface-container-low text-center">
          <button className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">Carregar Mais Atividades</button>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ onViewActivityHistory, userProfile, setUserProfile }: { onViewActivityHistory: () => void, userProfile: UserProfile, setUserProfile: (profile: UserProfile) => void }) => {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isGeneralDataExpanded, setIsGeneralDataExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfile({ ...userProfile, [name]: value });
  };

  const countries = [
    "Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaidjan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia-Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "France (European Territory)", "French Guyana", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Great Britain", "Greece", "Greenland", "Grenada", "Guadeloupe (French)", "Guam (USA)", "Guatemala", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Heard and McDonald Islands", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast (Cote D`Ivoire)", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique (French)", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldavia", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "Neutral Zone", "New Caledonia (French)", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn Island", "Poland", "Polynesia (French)", "Portugal", "Puerto Rico", "Qatar", "Reunion (French)", "Romania", "Russian Federation", "Rwanda", "S. Georgia & S. Sandwich Isls.", "Saint Helena", "Saint Kitts & Nevis Anguilla", "Saint Lucia", "Saint Pierre and Miquelon", "Saint Tome and Principe", "Saint Vincent & Grenadines", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovak Republic", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syria", "Tadjikistan", "Taiwan", "Tanzania", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "USA Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City State", "Venezuela", "Vietnam", "Virgin Islands (British)", "Virgin Islands (USA)", "Wallis and Futuna Islands", "Western Sahara", "Yemen", "Zaire", "Zambia", "Zimbabwe"
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <span className="font-label text-xs tracking-widest uppercase text-primary font-bold mb-4 block">Configurações da Conta</span>
          <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Perfil do Usuário</h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">Gerencie suas informações pessoais, preferências de segurança e acesso à conta.</p>
        </div>
        <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UserCircle size={40} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Alex Sterling</h3>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Membro Premium</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Data */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h2 className="text-xl font-bold font-headline mb-8 flex items-center gap-3">
              <UserCircle className="text-primary" size={24} />
              Informações Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nome Completo</label>
                <input type="text" name="name" value={userProfile.name} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Endereço de E-mail</label>
                <input type="email" name="email" value={userProfile.email} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Número de Telefone</label>
                <input type="tel" name="phone" value={userProfile.phone} onChange={handleInputChange} placeholder="+1 (555) 123-4567" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Numero Contrato</label>
                  <Lock size={12} className="text-on-surface-variant/50" />
                </div>
                <input 
                  type="text" 
                  maxLength={9} 
                  placeholder="000000000" 
                  disabled 
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all cursor-not-allowed opacity-70" 
                />
              </div>
            </div>

            <AnimatePresence>
              {isGeneralDataExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-8 border-t border-outline-variant/10 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Endereço</label>
                      <input type="text" name="address" value={userProfile.address} onChange={handleInputChange} placeholder="Rua, número, apto" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Bairro</label>
                      <input type="text" name="neighborhood" value={userProfile.neighborhood} onChange={handleInputChange} placeholder="Seu bairro" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Empresa</label>
                      <input type="text" name="company" value={userProfile.company} onChange={handleInputChange} placeholder="Nome da empresa" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Cidade</label>
                      <input type="text" name="city" value={userProfile.city} onChange={handleInputChange} placeholder="Sua cidade" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Pais</label>
                      <select name="country" value={userProfile.country} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all">
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">CEP</label>
                      <input type="text" name="zipCode" value={userProfile.zipCode} onChange={handleInputChange} placeholder="00000-000" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">CNPJ</label>
                      <input type="text" name="cnpj" value={userProfile.cnpj} onChange={handleInputChange} placeholder="00.000.000/0000-00" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">CPF</label>
                      <input type="text" name="cpf" value={userProfile.cpf} onChange={handleInputChange} placeholder="000.000.000-00" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nascimento</label>
                      <input type="date" name="birthDate" value={userProfile.birthDate} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Domínio</label>
                      <input type="text" name="domain" value={userProfile.domain} onChange={handleInputChange} placeholder="exemplo.com.br" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-4 mt-8">
              <button 
                onClick={() => setIsGeneralDataExpanded(!isGeneralDataExpanded)}
                className="px-8 py-3 bg-surface-container-highest text-on-surface rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2"
              >
                {isGeneralDataExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Dados Gerais
              </button>
              <button 
                onClick={handleSave}
                className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Salvar Alterações
              </button>
            </div>
          </section>

          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 z-50"
              >
                <CheckCircle size={24} />
                Perfil atualizado com sucesso!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gerenciamento de Senha */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h2 className="text-xl font-bold font-headline mb-8 flex items-center gap-3">
              <Key className="text-secondary" size={24} />
              Segurança e Senha
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Senha Atual</label>
                <div className="relative">
                  <input 
                    type={showCurrentPass ? "text" : "password"} 
                    defaultValue="password123" 
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all pr-12" 
                  />
                  <button 
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nova Senha</label>
                  <div className="relative">
                    <input 
                      type={showNewPass ? "text" : "password"} 
                      placeholder="Digite a nova senha" 
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all pr-12" 
                    />
                    <button 
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Confirmar Nova Senha</label>
                  <input type="password" placeholder="Confirme a nova senha" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all" />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Atualizar Senha
                </button>
                <button className="px-6 py-3 bg-surface-container-highest text-on-surface rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all">
                  Recuperar Senha
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Saúde da Segurança */}
          <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10">
            <h2 className="text-lg font-bold font-headline mb-6 flex items-center gap-3">
              <ShieldCheck className="text-primary" size={20} />
              Saúde da Segurança
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-sm font-bold">2FA Ativado</span>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Gerenciar</button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant font-medium">Pontuação de Segurança</span>
                  <span className="font-bold text-primary">92/100</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[92%]"></div>
                </div>
              </div>

              <button className="w-full py-4 bg-surface-container-highest text-on-surface font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all active:scale-95 flex items-center justify-center gap-2">
                <Settings size={16} />
                Segurança Avançada
              </button>
            </div>
          </section>

          {/* Recent Logins */}
          <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10">
            <h2 className="text-lg font-bold font-headline mb-6 flex items-center gap-3">
              <History className="text-secondary" size={20} />
              Recent Logins
            </h2>
            <div className="space-y-4">
              {[
                { device: 'Chrome / macOS', location: 'San Francisco, US', time: 'Active Now', current: true },
                { device: 'Safari / iPhone 15', location: 'San Francisco, US', time: '2h ago', current: false },
                { device: 'Firefox / Windows', location: 'London, UK', time: '2d ago', current: false },
              ].map((login, i) => (
                <div key={i} className="flex items-start justify-between py-3 border-b border-outline-variant/10 last:border-0">
                  <div>
                    <p className="text-sm font-bold">{login.device}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{login.location}</p>
                  </div>
                  <span className={`text-[10px] font-bold ${login.current ? 'text-primary' : 'text-on-surface-variant'}`}>{login.time}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={onViewActivityHistory}
              className="w-full mt-6 py-3 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
            >
              Visualizar Históricos
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

const ProjectsPage = () => (
  <div className="space-y-12">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div className="max-w-2xl">
        <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold mb-4 block">Colaboração</span>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Gerenciamento de Projetos</h1>
        <p className="text-on-surface-variant text-lg leading-relaxed">Coordene implantações de infraestrutura e auditorias de segurança com sua equipe.</p>
      </div>
      <button className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold active:scale-95 transition-all shadow-lg">
        <Plus size={20} />
        <span>Novo Projeto</span>
      </button>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <h2 className="text-xl font-bold font-headline mb-4">Projetos Ativos</h2>
        <div className="space-y-4">
          {MOCK_PROJECTS.map(project => (
            <div key={project.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/5 rounded-lg text-primary">
                  <Layout size={20} />
                </div>
                <button className="text-on-surface-variant hover:text-on-surface">
                  <MoreVertical size={18} />
                </button>
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">{project.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-on-surface-variant uppercase tracking-widest">Progresso</span>
                  <span className="text-primary">{project.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[...Array(Math.min(project.members, 3))].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">
                      <UserCircle size={20} className="text-on-surface-variant" />
                    </div>
                  ))}
                  {project.members > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">
                      +{project.members - 3}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <span className="flex items-center gap-1 text-xs font-medium"><ListTodo size={14} /> {project.tasks.length}</span>
                  <span className="flex items-center gap-1 text-xs font-medium"><MessageSquare size={14} /> 12</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-headline">Tarefas: Migração de Infraestrutura</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-surface-container-low rounded-lg text-on-surface-variant hover:text-primary transition-colors">
              <Filter size={18} />
            </button>
            <button className="p-2 bg-surface-container-low rounded-lg text-on-surface-variant hover:text-primary transition-colors">
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10">
          <div className="divide-y divide-outline-variant/10">
            {MOCK_PROJECTS[0].tasks.map(task => (
              <div key={task.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-bright transition-colors group">
                <div className="flex items-start gap-4">
                  <button className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.status === 'done' ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant hover:border-primary'
                  }`}>
                    {task.status === 'done' && <CheckCircle size={12} />}
                  </button>
                  <div>
                    <h4 className={`font-bold text-base mb-1 ${task.status === 'done' ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                      {task.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <span className={`px-2 py-0.5 rounded uppercase tracking-widest font-black text-[9px] border ${
                        task.priority === 'high' ? 'border-error text-error' : 
                        task.priority === 'medium' ? 'border-secondary text-secondary' : 
                        'border-outline-variant text-on-surface-variant'
                      }`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      <span className="flex items-center gap-1 text-on-surface-variant font-medium">
                        <Calendar size={12} /> {task.dueDate}
                      </span>
                      <span className="flex items-center gap-1 text-on-surface-variant font-medium uppercase tracking-widest">
                        <UserCircle size={12} /> {task.assignee}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    task.status === 'done' ? 'border-primary text-primary' : 
                    task.status === 'in-progress' ? 'border-secondary text-secondary' : 
                    'border-outline-variant text-on-surface-variant'
                  }`}>
                    {task.status === 'done' ? 'Concluído' : task.status === 'in-progress' ? 'Em Andamento' : task.status === 'review' ? 'Revisão' : 'A Fazer'}
                  </span>
                  <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full p-4 bg-surface-container-low text-primary font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
            <Plus size={16} /> Adicionar Tarefa
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" /> Membros da Equipe
            </h4>
            <div className="space-y-4">
              {['Alex Sterling (Líder)', 'Sarah K.', 'Mike R.', 'John D.'].map((member, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                      <UserCircle size={20} className="text-on-surface-variant" />
                    </div>
                    <span className="text-sm font-medium">{member}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Activity size={18} className="text-secondary" /> Atualizações Recentes
            </h4>
            <div className="space-y-4">
              {[
                { user: 'Alex S.', action: 'concluiu', target: 'Snapshot do banco de dados', time: '2h atrás' },
                { user: 'Sarah K.', action: 'atualizou', target: 'Latência de rede', time: '4h atrás' },
              ].map((update, i) => (
                <div key={i} className="text-xs">
                  <p className="text-on-surface mb-1">
                    <span className="font-bold">{update.user}</span> {update.action} <span className="font-bold">{update.target}</span>
                  </p>
                  <p className="text-on-surface-variant">{update.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ServiceManagePage = ({ serviceId, onBack }: { serviceId: string, onBack: () => void }) => {
  const service = MOCK_SERVICES.find(s => s.id === serviceId);
  const [showPassword, setShowPassword] = useState(false);

  if (!service) return <div className="p-20 text-center font-bold text-xl">Serviço não encontrado</div>;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, we'd show a toast here
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-3 bg-surface-container-low rounded-xl text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <span className="font-label text-xs tracking-widest uppercase text-primary font-bold mb-1 block">Painel de Gerenciamento</span>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">{service.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${
            service.status === 'active' ? 'border-primary text-primary' : 'border-error text-error'
          }`}>
            {service.status === 'active' ? 'Ativo' : service.status === 'suspended' ? 'Suspenso' : 'Pendente'}
          </span>
          <span className="text-on-surface-variant font-medium text-sm">{service.host}</span>
        </div>
      </header>

      {service.type === 'ssl' && service.sslInfo ? (
        <div className="space-y-8">
          <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <ShieldCheck className="text-primary" size={24} />
              Informações do Certificado SSL
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Domínio</label>
                <div className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/5">
                  <CheckCircle className="text-emerald-500" size={20} />
                  <span className="font-mono font-bold text-primary">{service.sslInfo.domain}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status do Certificado</label>
                <div className="flex items-center p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/5">
                  <span className="font-bold text-on-surface">{service.sslInfo.status}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-8">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">FQDNs</label>
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/5 flex flex-wrap gap-2">
                {service.sslInfo.fqdns.map(fqdn => (
                  <span key={fqdn} className="px-3 py-1 bg-surface-container-low rounded-lg text-sm font-mono">{fqdn}</span>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Certificado (CRT)</label>
                  <button onClick={() => copyToClipboard(service.sslInfo!.crt)} className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                    <Copy size={14} /> Copiar CRT
                  </button>
                </div>
                <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/5 overflow-x-auto">
                  <pre className="font-mono text-xs text-on-surface-variant whitespace-pre-wrap break-all">{service.sslInfo.crt}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Chave Privada (KEY)</label>
                  <button onClick={() => copyToClipboard(service.sslInfo!.key)} className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                    <Copy size={14} /> Copiar KEY
                  </button>
                </div>
                <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/5 overflow-x-auto">
                  <pre className="font-mono text-xs text-on-surface-variant whitespace-pre-wrap break-all">{service.sslInfo.key}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Pacote de Autoridades de Certificação (CABUNDLE)</label>
                  <button onClick={() => copyToClipboard(service.sslInfo!.cabundle)} className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                    <Copy size={14} /> Copiar CABUNDLE
                  </button>
                </div>
                <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/5 overflow-x-auto">
                  <pre className="font-mono text-xs text-on-surface-variant whitespace-pre-wrap break-all">{service.sslInfo.cabundle}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : service.accessInfo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Credenciais de Acesso */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Lock className="text-primary" size={24} />
                Credenciais de Acesso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Usuário</label>
                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/5">
                    <span className="font-mono font-bold text-primary">{service.accessInfo.username}</span>
                    <button onClick={() => copyToClipboard(service.accessInfo!.username)} className="text-on-surface-variant hover:text-primary transition-colors">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Senha</label>
                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/5">
                    <span className="font-mono font-bold text-primary">
                      {showPassword ? 'm0n0l1th_P@ss_2024' : '••••••••••••'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowPassword(!showPassword)} className="text-on-surface-variant hover:text-primary transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button onClick={() => copyToClipboard('m0n0l1th_P@ss_2024')} className="text-on-surface-variant hover:text-primary transition-colors">
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rede e DNS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Globe className="text-secondary" size={24} />
                  Informações de Rede
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-surface-container-lowest rounded-xl">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Endereço IP Principal</p>
                      <p className="font-mono font-bold text-primary">{service.accessInfo.mainIp}</p>
                    </div>
                    <button onClick={() => copyToClipboard(service.accessInfo!.mainIp)} className="text-on-surface-variant hover:text-primary">
                      <Copy size={18} />
                    </button>
                  </div>
                  {service.accessInfo.additionalIps && (
                    <div className="p-4 bg-surface-container-lowest rounded-xl">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">IPs Adicionais</p>
                      <div className="space-y-2">
                        {service.accessInfo.additionalIps.map(ip => (
                          <div key={ip} className="flex justify-between items-center">
                            <span className="font-mono text-sm">{ip}</span>
                            <button onClick={() => copyToClipboard(ip)} className="text-on-surface-variant hover:text-primary">
                              <Copy size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Database className="text-primary" size={24} />
                  Servidores de Nomes DNS
                </h3>
                <div className="space-y-4">
                  {service.accessInfo.nameservers.map((ns, i) => (
                    <div key={ns} className="flex justify-between items-center p-4 bg-surface-container-lowest rounded-xl">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">NS {i + 1}</p>
                        <p className="font-mono text-sm font-bold">{ns}</p>
                      </div>
                      <button onClick={() => copyToClipboard(ns)} className="text-on-surface-variant hover:text-primary">
                        <Copy size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Painéis de Controle e Especificações */}
          <div className="space-y-8">
            <div className="bg-primary rounded-2xl p-8 text-on-primary shadow-lg shadow-primary/20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Terminal size={24} />
                Painéis de Controle
              </h3>
              <div className="space-y-4">
                {service.accessInfo.cpanelUrl && (
                  <a 
                    href={service.accessInfo.cpanelUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">cP</div>
                      <span className="font-bold">Login cPanel</span>
                    </div>
                    <ExternalLink size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
                {service.accessInfo.directAdminUrl && (
                  <a 
                    href={service.accessInfo.directAdminUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">DA</div>
                      <span className="font-bold">DirectAdmin</span>
                    </div>
                    <ExternalLink size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
                <button className="w-full mt-4 py-3 bg-surface-container-lowest text-primary rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform">
                  Acesso ao Webmail
                </button>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Info className="text-secondary" size={24} />
                Especificações do Serviço
              </h3>
              <div className="space-y-4">
                {Object.entries(service.accessInfo.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-3 border-b border-outline-variant/10 last:border-0">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      {key === 'cpu' ? 'CPU' : key === 'ram' ? 'RAM' : key === 'storage' ? 'Armazenamento' : key === 'bandwidth' ? 'Largura de Banda' : key === 'os' ? 'SO' : key}
                    </span>
                    <span className="font-bold text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// --- Main App ---

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: AI_GREETING }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAIChatOpen]);

  useEffect(() => {
    // Tawk.to Script Integration
    const script = document.createElement("script");
    script.async = true;
    script.src = 'https://embed.tawk.to/56a7b6410f45914704429953/1ephijqta';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    const s0 = document.getElementsByTagName("script")[0];
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(script, s0);
    }

    // Initialize Tawk_API if not exists
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const supportChannels = [
    { 
      name: 'WhatsApp', 
      icon: <Phone size={24} className="text-[#25D366]" />, 
      description: 'Atendimento rápido via WhatsApp',
      action: () => window.open('https://wa.me/5544999999999', '_blank')
    },
    { 
      name: 'Chat ao Vivo', 
      icon: <MessageCircle size={24} className="text-primary" />, 
      description: 'Fale com um de nossos especialistas',
      action: () => {
        if ((window as any).Tawk_API && (window as any).Tawk_API.toggle) {
          (window as any).Tawk_API.toggle();
          setIsOpen(false);
        }
      }
    },
    { 
      name: 'Assistente IA', 
      icon: <Bot size={24} className="text-secondary" />, 
      description: 'Suporte inteligente 24/7',
      action: () => {
        setIsOpen(false);
        setIsAIChatOpen(true);
      }
    }
  ];

  const handleRecaptchaChange = async (token: string | null) => {
    if (!token) {
      setIsRecaptchaVerified(false);
      return;
    }
    
    try {
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      if (data.success) {
        setIsRecaptchaVerified(true);
      } else {
        setIsRecaptchaVerified(false);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      }
    } catch (error) {
      console.error('Error verifying reCAPTCHA:', error);
      setIsRecaptchaVerified(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !isRecaptchaVerified) return;
    
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        // Prioriza a chave customizada configurada nos Secrets, senão usa a chave fornecida pelo usuário, senão a padrão da plataforma
        const apiKey = process.env.NEXT_PUBLIC_CUSTOM_GEMINI_KEY || 'AIzaSyAP5kcApgnuFZY-ijMV8g5GDE6t5hFJcIw' || process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
        console.log('Inicializando IA com chave:', apiKey === 'AIzaSyAP5kcApgnuFZY-ijMV8g5GDE6t5hFJcIw' ? 'Hardcoded do Usuário' : (process.env.NEXT_PUBLIC_CUSTOM_GEMINI_KEY ? 'Customizada (Secrets)' : 'Padrão da Plataforma'));
        const ai = new GoogleGenAI({ apiKey });
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: AI_SYSTEM_INSTRUCTION
          }
        });
      }

      let response: any;
      let retries = 3;
      let delay = 1000;
      
      while (retries > 0) {
        try {
          response = await chatRef.current.sendMessage({ message: userText });
          break;
        } catch (err: any) {
          const errorString = err?.toString() || '';
          const errorMessageStr = err?.message || '';
          if ((errorString.includes('429') || errorMessageStr.includes('429') || errorString.includes('RESOURCE_EXHAUSTED') || errorMessageStr.includes('RESOURCE_EXHAUSTED')) && retries > 1) {
            retries--;
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
          } else {
            throw err;
          }
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: response?.text || 'Desculpe, não consegui processar sua solicitação.' }]);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      let errorMessage = 'Ocorreu um erro ao conectar com o assistente. Tente novamente mais tarde.';
      
      const errorString = error?.toString() || '';
      const errorMessageStr = error?.message || '';
      
      if (errorString.includes('429') || errorMessageStr.includes('429') || errorString.includes('RESOURCE_EXHAUSTED') || errorMessageStr.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = 'A chave de API (AIzaSyAP5kcApgnuFZY-ijMV8g5GDE6t5hFJcIw) ainda está retornando erro de limite de cota (429). Como você acabou de adicionar o faturamento, pode levar alguns minutos para o Google Cloud atualizar o status da sua conta. Por favor, aguarde uns 5 a 10 minutos e tente novamente.';
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatus = () => {
    const now = new Date();
    // Brasilia is UTC-3
    const utcHours = now.getUTCHours();
    const brasiliaHours = (utcHours - 3 + 24) % 24;
    const isOnline = brasiliaHours >= 8 && brasiliaHours < 18;
    return {
      isOnline,
      text: isOnline ? 'Suporte Online agora' : 'Estamos fechados agora'
    };
  };

  const status = getStatus();

  return (
    <div className="fixed bottom-8 right-8 z-[100]" ref={widgetRef}>
      <AnimatePresence>
        {isAIChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/10 overflow-hidden flex flex-col"
          >
            <div className="bg-secondary p-4 text-on-secondary flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-headline font-bold">Assistente IA</h3>
                  <p className="text-on-secondary/80 text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAIChatOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-container-lowest">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-on-primary rounded-tr-sm' 
                      : 'bg-surface-container-low text-on-surface rounded-tl-sm border border-outline-variant/10'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-low text-on-surface p-4 rounded-2xl rounded-tl-sm border border-outline-variant/10 flex gap-1">
                    <span className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/10 shrink-0">
              {!isRecaptchaVerified && (
                <div className="mb-3 flex justify-center transform scale-90 origin-bottom">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LcpEu0qAAAAADw-N2UeiNua991w-hPfSMK1UuXZ"
                    onChange={handleRecaptchaChange}
                    theme="dark"
                  />
                </div>
              )}
              <div className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isRecaptchaVerified ? "Digite sua mensagem..." : "Complete o reCAPTCHA primeiro"}
                  disabled={!isRecaptchaVerified}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 resize-none custom-scrollbar disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading || !isRecaptchaVerified}
                  className="absolute right-2 p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {isOpen && !isAIChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-80 bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/10 overflow-hidden"
          >
            <div className="bg-primary p-6 text-on-primary">
              <h3 className="font-headline text-xl font-bold mb-1">Central de Ajuda</h3>
              <p className="text-on-primary/70 text-xs">Como podemos ajudar você hoje?</p>
            </div>
            
            <div className="p-4 space-y-3">
              {supportChannels.map((channel) => (
                <button
                  key={channel.name}
                  onClick={channel.action}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-all group border border-transparent hover:border-outline-variant/10"
                >
                  <div className="group-hover:scale-110 transition-transform">
                    {channel.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-on-surface">{channel.name}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">{channel.description}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/10">
              <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest justify-center">
                <span className={`w-2 h-2 ${status.isOnline ? 'bg-primary animate-pulse' : 'bg-outline-variant'} rounded-full`}></span>
                {status.text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          if (isAIChatOpen) {
            setIsAIChatOpen(false);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${
          isOpen || isAIChatOpen ? 'bg-surface-container-lowest text-primary rotate-90' : 'bg-primary text-on-primary'
        }`}
      >
        {isOpen || isAIChatOpen ? <X size={32} /> : <MessageSquare size={32} />}
      </button>
    </div>
  );
};

export default function MonolithApp() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activityCategory, setActivityCategory] = useState('Toda Atividade');
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Sterling',
    email: 'alex@sterling.com',
    phone: '+1 (555) 123-4567',
    address: '',
    neighborhood: '',
    company: '',
    city: '',
    country: 'Brasil',
    zipCode: '',
    cnpj: '20.962.496/0001-91',
    cpf: '031.277.389-78',
    birthDate: '',
    domain: ''
  });

  const handlePageChange = (page: Page) => {
    if (page === 'activity') {
      setActivityCategory('Toda Atividade');
    }
    setCurrentPage(page);
  };

  const handleManageService = (id: string) => {
    setSelectedServiceId(id);
    setCurrentPage('service-manage');
  };

  const handleTicketClick = (id: string) => {
    setSelectedTicketId(id);
    setCurrentPage('ticket-detail');
  };

  const handleNotificationClick = (type: string) => {
    if (type === 'suporte') {
      setCurrentPage('support');
    } else if (type === 'faturamento') {
      setCurrentPage('billing');
    } else if (type === 'status') {
      setActivityCategory('Infraestrutura');
      setCurrentPage('activity');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={handlePageChange} 
        onNotificationClick={handleNotificationClick}
      />
      
      <main className="flex-grow pt-32 pb-24 px-6 md:px-10 lg:px-20 max-w-[1600px] mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentPage === 'dashboard' && (
              <DashboardPage 
                onManageService={handleManageService} 
                onViewActivity={() => handlePageChange('activity')} 
                onOpenTicket={() => setCurrentPage('support')}
                onViewStatus={() => setCurrentPage('status')}
                onTicketClick={handleTicketClick}
                onViewProjects={() => setCurrentPage('projects')}
                onViewBilling={() => setCurrentPage('billing')}
              />
            )}
            {currentPage === 'products' && <ProductsPage />}
            {currentPage === 'billing' && <BillingPage userProfile={userProfile} invoices={invoices} setInvoices={setInvoices} />}
            {currentPage === 'support' && <SupportPage onTicketClick={handleTicketClick} />}
            {currentPage === 'ticket-detail' && selectedTicketId && (
              <TicketDetailPage ticketId={selectedTicketId} onBack={() => setCurrentPage('support')} />
            )}
            {currentPage === 'status' && <StatusPage />}
            {currentPage === 'activity' && <ActivityLogPage initialCategory={activityCategory} />}
            {currentPage === 'projects' && <ProjectsPage />}
            {currentPage === 'profile' && (
              <ProfilePage 
                onViewActivityHistory={() => {
                  setActivityCategory('Conta');
                  setCurrentPage('activity');
                }} 
                userProfile={userProfile}
                setUserProfile={setUserProfile}
              />
            )}
            {currentPage === 'terms' && <TermsOfServicePage onBack={() => setCurrentPage('dashboard')} />}
            {currentPage === 'privacy' && <PrivacyPolicyPage onBack={() => setCurrentPage('dashboard')} />}
            {currentPage === 'service-manage' && selectedServiceId && (
              <ServiceManagePage 
                serviceId={selectedServiceId} 
                onBack={() => setCurrentPage('dashboard')} 
              />
            )}
            {(currentPage === 'services' || currentPage === 'domains') && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-surface-container-low p-12 rounded-full mb-6">
                  <Settings size={64} className="text-primary animate-spin-slow" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Módulo em Manutenção</h2>
                <p className="text-on-surface-variant max-w-md">Estamos atualizando nosso mecanismo de gerenciamento de {currentPage === 'services' ? 'serviços' : 'domínios'}. Por favor, volte em alguns minutos.</p>
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="mt-8 text-primary font-bold uppercase tracking-widest text-xs border-b-2 border-primary/20 hover:border-primary transition-all pb-1"
                >
                  Voltar para Visão Geral
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer 
        onStatusClick={() => setCurrentPage('status')} 
        onTermsClick={() => setCurrentPage('terms')}
        onPrivacyClick={() => setCurrentPage('privacy')}
      />

      <SupportWidget />
    </div>
  );
}
