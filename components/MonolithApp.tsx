'use client';

import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Page = 'dashboard' | 'billing' | 'support' | 'services' | 'domains' | 'status' | 'activity' | 'projects';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

interface Service {
  id: string;
  name: string;
  host: string;
  type: 'hosting' | 'vps' | 'dedicated';
  status: 'active' | 'suspended' | 'pending';
}

interface SupportTicket {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Closed';
  updatedAt: string;
}

// --- Mock Data ---

const MOCK_INVOICES: Invoice[] = [
  { id: '#MN-8932', date: 'Sep 12, 2023', amount: 1240.00, status: 'Paid' },
  { id: '#MN-8841', date: 'Aug 12, 2023', amount: 45.00, status: 'Paid' },
  { id: '#MN-8720', date: 'Jul 12, 2023', amount: 12.50, status: 'Paid' },
];

const MOCK_SERVICES: Service[] = [
  { id: '1', name: 'Shared Pro Hosting', host: 'monolith-v1.com', type: 'hosting', status: 'active' },
  { id: '2', name: 'Managed VPS NVMe', host: '192.168.1.44', type: 'vps', status: 'active' },
];

const MOCK_TICKETS: SupportTicket[] = [
  { id: '#MN-8291', title: 'Database Latency in US-EAST-1', priority: 'High', status: 'Open', updatedAt: '14m ago' },
  { id: '#MN-8104', title: 'SSL Certificate Renewal Error', priority: 'Medium', status: 'In Progress', updatedAt: '2h ago' },
  { id: '#MN-7922', title: 'Invoice #8292 Query', priority: 'Low', status: 'Closed', updatedAt: 'Dec 12, 2023' },
];

interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: string;
  latency: string;
}

const MOCK_STATUS: SystemStatus[] = [
  { name: 'API Gateway', status: 'operational', uptime: '99.99%', latency: '24ms' },
  { name: 'Primary Database', status: 'operational', uptime: '99.95%', latency: '12ms' },
  { name: 'Object Storage', status: 'operational', uptime: '100%', latency: '45ms' },
  { name: 'Authentication Service', status: 'operational', uptime: '99.99%', latency: '18ms' },
  { name: 'Content Delivery Network', status: 'operational', uptime: '99.99%', latency: '32ms' },
  { name: 'Compute Engine (US-EAST)', status: 'degraded', uptime: '98.4%', latency: '110ms' },
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
  { id: 'act_1', event: 'Server Restart', user: 'System', category: 'infrastructure', timestamp: '10m ago', details: 'Node-04 restarted due to kernel update.' },
  { id: 'act_2', event: 'Login Successful', user: 'Alex Sterling', category: 'account', timestamp: '45m ago', details: 'Login from new device: Chrome/macOS.' },
  { id: 'act_3', event: 'Firewall Rule Updated', user: 'Alex Sterling', category: 'security', timestamp: '2h ago', details: 'Added port 443 to allow HTTPS traffic.' },
  { id: 'act_4', event: 'Backup Completed', user: 'System', category: 'infrastructure', timestamp: '4h ago', details: 'Daily snapshot of DB-Primary successful.' },
  { id: 'act_5', event: 'Payment Method Added', user: 'Alex Sterling', category: 'billing', timestamp: '1d ago', details: 'Visa card ending in 4242 added.' },
  { id: 'act_6', event: 'Password Changed', user: 'Alex Sterling', category: 'security', timestamp: '2d ago', details: 'User initiated password rotation.' },
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
    name: 'Infrastructure Migration',
    description: 'Moving legacy systems to the new Monolith NVMe clusters.',
    progress: 65,
    members: 8,
    tasks: [
      { id: 'task_1', title: 'Database snapshot verification', status: 'done', priority: 'high', assignee: 'Alex S.', dueDate: 'Mar 22' },
      { id: 'task_2', title: 'Network latency testing', status: 'in-progress', priority: 'medium', assignee: 'Sarah K.', dueDate: 'Mar 24' },
      { id: 'task_3', title: 'SSL certificate migration', status: 'todo', priority: 'high', assignee: 'Alex S.', dueDate: 'Mar 25' },
    ]
  },
  {
    id: 'proj_2',
    name: 'Security Audit Q1',
    description: 'Quarterly security review and penetration testing.',
    progress: 30,
    members: 4,
    tasks: [
      { id: 'task_4', title: 'Firewall rule review', status: 'in-progress', priority: 'high', assignee: 'Mike R.', dueDate: 'Mar 28' },
      { id: 'task_5', title: 'User access log analysis', status: 'todo', priority: 'low', assignee: 'Sarah K.', dueDate: 'Apr 02' },
    ]
  }
];

// --- Components ---

const Navbar = ({ currentPage, setCurrentPage }: { currentPage: Page, setCurrentPage: (p: Page) => void }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { label: string, value: Page }[] = [
    { label: 'Services', value: 'services' },
    { label: 'Domains', value: 'domains' },
    { label: 'Projects', value: 'projects' },
    { label: 'Support', value: 'support' },
    { label: 'Billing', value: 'billing' },
    { label: 'Status', value: 'status' },
    { label: 'Activity', value: 'activity' },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-surface shadow-[0_20px_40px_rgba(20,27,44,0.06)]">
      <div className="flex justify-between items-center w-full px-6 md:px-10 h-20 max-w-[1920px] mx-auto">
        <div 
          className="text-2xl font-black tracking-tighter text-primary font-brand cursor-pointer"
          onClick={() => setCurrentPage('dashboard')}
        >
          Monolith Hosting
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
          <button className="text-on-surface-variant hover:text-primary transition-colors">
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

const Footer = () => (
  <footer className="bg-surface-container-low py-12 border-t border-outline-variant/10">
    <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-10 w-full max-w-[1920px] mx-auto gap-8">
      <div className="text-lg font-bold text-primary font-brand">Monolith Infrastructure</div>
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {['Terms of Service', 'Privacy Policy', 'Status Page', 'Network Map'].map((item) => (
          <a key={item} href="#" className="text-on-surface-variant font-medium hover:underline decoration-2 underline-offset-4 transition-opacity hover:opacity-80 text-sm">
            {item}
          </a>
        ))}
      </div>
      <div className="text-on-surface-variant font-medium text-xs opacity-60">
        © 2024 Monolith Infrastructure. All rights reserved.
      </div>
    </div>
  </footer>
);

// --- Page Components ---

const DashboardPage = () => (
  <div className="space-y-12">
    <div>
      <label className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block">Infrastructure Dashboard</label>
      <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface">Cloud Overview</h1>
    </div>

    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resource Consumption */}
        <div className="md:col-span-2 bg-surface-container-low rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary rounded-full pulse-ring"></span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Performance</span>
            </div>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-8">Resource Consumption</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'CPU Load', value: '42%', sub: 'Average: 2.4 GHz per core', progress: 42 },
              { label: 'Memory', value: '6.8GB', sub: 'Total: 8GB LPDDR5', progress: 85 },
              { label: 'NVMe Disk', value: '120GB', sub: '400GB SSD Provisioned', progress: 30 },
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
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-xl mb-1">Active Services</h3>
              <p className="text-on-surface-variant text-sm">2 Subscriptions active</p>
            </div>
            <div className="bg-primary-fixed p-3 rounded-lg">
              <Cloud className="text-primary" size={24} />
            </div>
          </div>
          <div className="space-y-4">
            {MOCK_SERVICES.map(service => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-3">
                  {service.type === 'hosting' ? <Server className="text-secondary" size={20} /> : <Cpu className="text-primary" size={20} />}
                  <div>
                    <p className="font-bold text-sm">{service.name}</p>
                    <p className="text-xs text-on-surface-variant">{service.host}</p>
                  </div>
                </div>
                <button className="text-primary font-bold text-xs uppercase tracking-wider hover:underline">Manage</button>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-xl mb-1">Portfolio</h3>
              <p className="text-on-surface-variant text-sm">2 Domains registered</p>
            </div>
            <div className="bg-secondary-fixed p-3 rounded-lg">
              <Globe className="text-secondary" size={24} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-white text-[10px] font-bold">.COM</div>
                <div>
                  <p className="font-bold text-sm">monolith-infra.com</p>
                  <p className="text-xs text-error font-medium">Expires in 12 days</p>
                </div>
              </div>
              <button className="bg-primary text-on-primary px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform">Renew</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-on-surface-variant flex items-center justify-center text-white text-[10px] font-bold">.NET</div>
                <div>
                  <p className="font-bold text-sm">dev-stack.net</p>
                  <p className="text-xs text-on-surface-variant">Auto-renew active</p>
                </div>
              </div>
              <button className="text-primary font-bold text-xs uppercase tracking-wider hover:underline">Settings</button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-8">
        <div className="bg-primary rounded-xl p-8 text-on-primary shadow-lg shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform">
            <HelpCircle size={120} />
          </div>
          <h4 className="text-xl font-bold mb-2">Need Technical Assistance?</h4>
          <p className="text-primary-fixed text-sm mb-6 leading-relaxed">Our infrastructure engineers are available 24/7 for managed VPS clients.</p>
          <button className="w-full bg-surface-container-lowest text-primary py-3 rounded-lg font-bold text-xs uppercase tracking-widest active:scale-95 transition-all">Open Ticket</button>
        </div>

        <div className="bg-surface-container-low rounded-xl p-8">
          <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
            <FileText className="text-secondary" size={20} />
            Recent Activity
          </h4>
          <div className="space-y-6">
            {[
              { title: 'Invoice #MON-4492 Paid', sub: 'Nov 14, 2024 • $149.00', active: true },
              { title: 'Backup Completed', sub: 'Nov 13, 2024 • monolith-v1.com', active: false },
              { title: 'System Upgrade', sub: 'Nov 10, 2024 • VPS Kernel 6.1', active: true },
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
          <button className="mt-8 text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
            View All History <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>

    <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-surface-container-high rounded-xl gap-4">
      <div className="flex items-center gap-4 text-sm font-medium">
        <span className="flex items-center gap-2 text-primary font-bold">
          <CheckCircle size={18} />
          All Systems Operational
        </span>
        <span className="hidden md:block w-1 h-1 bg-outline-variant rounded-full"></span>
        <span className="text-on-surface-variant">Last checked: 2 minutes ago</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-tighter">Uptime</span>
          <span className="font-headline text-xl font-black">99.99%</span>
        </div>
        <a className="text-[10px] font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 hover:border-primary transition-all pb-1" href="#">Detailed Status</a>
      </div>
    </div>
  </div>
);

const BillingPage = () => (
  <div className="space-y-12">
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 space-y-6">
        <span className="text-[10px] text-primary tracking-widest font-bold uppercase block mb-2">Current Subscription</span>
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Enterprise Cloud Node</h1>
              <p className="text-on-surface-variant mt-2 font-medium">Billed annually • Next renewal: Oct 12, 2024</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-primary font-headline">$1,240<span className="text-lg font-medium text-on-surface-variant">/yr</span></div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold mt-2">
                <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-lg font-bold text-xs shadow-lg hover:opacity-90 transition-all active:scale-95">Upgrade Plan</button>
            <button className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-lg font-bold text-xs hover:bg-surface-variant transition-all active:scale-95">Manage Add-ons</button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 bg-error-container/40 rounded-xl p-8 backdrop-blur-sm relative border border-error/10">
        <div className="flex justify-between items-start mb-6">
          <AlertCircle className="text-error" size={32} />
          <span className="text-error font-black font-headline text-2xl">Pending</span>
        </div>
        <h3 className="text-xl font-bold text-on-error-container mb-2">Unpaid Invoice</h3>
        <p className="text-on-error-container/80 text-sm mb-6 leading-relaxed">Invoice #MN-9042 for domain renewal is overdue by 3 days.</p>
        <div className="text-2xl font-bold text-error mb-6">$24.99</div>
        <button className="w-full bg-error text-on-error py-3 rounded-lg font-bold hover:bg-error/90 transition-all active:scale-95">Pay Now</button>
      </div>
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold font-headline tracking-tight">Payment Methods</h2>
        <div className="bg-surface-container-low rounded-xl p-2 space-y-2">
          {[
            { icon: <CreditCard size={20} />, title: '•••• •••• •••• 4242', sub: 'Visa • Expires 12/26', primary: true },
            { icon: <Wallet size={20} />, title: 'billing@monolith.tech', sub: 'PayPal Connected' },
            { icon: <QrCode size={20} />, title: 'Instant Transfer (PIX)', sub: 'Available in Brazil' },
          ].map((method, i) => (
            <div key={i} className="bg-surface-container-lowest p-5 rounded-lg flex items-center justify-between group cursor-pointer hover:bg-surface-bright transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-on-surface/5 rounded flex items-center justify-center text-on-surface-variant">
                  {method.icon}
                </div>
                <div>
                  <p className="font-bold text-sm">{method.title}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">{method.sub}</p>
                </div>
              </div>
              {method.primary && <span className="text-primary text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Primary</span>}
            </div>
          ))}
        </div>
        <button className="text-primary font-bold text-xs flex items-center space-x-2 hover:underline decoration-2 underline-offset-4">
          <Plus size={16} />
          <span>Add New Method</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-extrabold font-headline tracking-tight">Billing History</h2>
          <button className="text-[10px] font-bold text-primary uppercase tracking-widest">Download All</button>
        </div>
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                {['Invoice', 'Date', 'Amount', 'Status', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {MOCK_INVOICES.map(invoice => (
                <tr key={invoice.id} className="hover:bg-surface-bright transition-colors">
                  <td className="px-6 py-5 font-bold text-sm text-on-surface">{invoice.id}</td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{invoice.date}</td>
                  <td className="px-6 py-5 font-bold text-sm">${invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black tracking-widest uppercase px-2 py-1 bg-primary/10 text-primary rounded">{invoice.status}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
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
    </section>

    <section className="bg-primary text-on-primary rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -ml-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mb-48 blur-3xl"></div>
      </div>
      <div className="relative z-10 max-w-xl">
        <h2 className="text-3xl font-black font-headline mb-4 leading-tight">Switch to biennial billing and save up to 25%</h2>
        <p className="text-on-primary/80 font-medium">Extend your commitment and lock in our current infrastructure rates for the next 24 months.</p>
      </div>
      <div className="relative z-10">
        <button className="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform active:scale-95">Calculate Savings</button>
      </div>
    </section>
  </div>
);

const SupportPage = () => (
  <div className="space-y-12">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div className="max-w-2xl">
        <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold mb-4 block">Help Center</span>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Support Tickets</h1>
        <p className="text-on-surface-variant text-lg leading-relaxed">Manage your infrastructure inquiries. Our engineers are monitoring the monolith around the clock.</p>
      </div>
      <button className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-bold active:scale-95 transition-all shadow-lg">
        <Plus size={20} />
        <span>Open New Ticket</span>
      </button>
    </header>

    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-2 bg-surface-container-low rounded-xl p-8 flex items-center justify-between overflow-hidden relative group">
        <div>
          <div className="text-4xl font-headline font-black text-primary mb-1">04</div>
          <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Active Tickets</div>
        </div>
        <div className="h-16 w-px bg-outline-variant/20 hidden md:block"></div>
        <div>
          <div className="text-4xl font-headline font-black text-on-surface mb-1">12m</div>
          <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Avg. Response</div>
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
      </div>

      <div className="md:col-span-2 bg-surface-container-highest rounded-xl p-2 flex items-center gap-2">
        <button className="flex-1 bg-surface-container-lowest text-primary py-4 px-6 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2">
          <Filter size={16} />
          All Tickets
        </button>
        <button className="flex-1 hover:bg-surface-container-low py-4 px-6 rounded-lg font-semibold text-on-surface-variant transition-colors flex items-center justify-center">Open</button>
        <button className="flex-1 hover:bg-surface-container-low py-4 px-6 rounded-lg font-semibold text-on-surface-variant transition-colors flex items-center justify-center">Closed</button>
      </div>
    </section>

    <div className="flex flex-col gap-4">
      {MOCK_TICKETS.map(ticket => (
        <div key={ticket.id} className="bg-surface-container-lowest p-6 md:p-8 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-container-low transition-colors group cursor-pointer">
          <div className="flex items-start gap-6">
            <div className="mt-1">
              {ticket.status === 'Open' ? (
                <span className="w-3 h-3 rounded-full bg-primary block relative">
                  <span className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping opacity-75"></span>
                </span>
              ) : ticket.status === 'In Progress' ? (
                <span className="w-3 h-3 rounded-full bg-secondary block"></span>
              ) : (
                <CheckCircle className="text-outline" size={20} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-on-surface">{ticket.title}</h3>
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  ticket.priority === 'High' ? 'bg-error-container text-on-error-container' : 
                  ticket.priority === 'Medium' ? 'bg-secondary-container text-on-secondary-container' : 
                  'bg-outline-variant/30 text-on-surface-variant'
                }`}>
                  {ticket.priority} Priority
                </span>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant text-sm">
                <span className="flex items-center gap-1 font-medium"><Tag size={14} /> {ticket.id}</span>
                <span className="flex items-center gap-1"><History size={14} /> Updated {ticket.updatedAt}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest mb-1">Status</span>
              <span className={`font-bold ${ticket.status === 'Open' ? 'text-primary' : ticket.status === 'In Progress' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                {ticket.status}
              </span>
            </div>
            <ChevronRight className="text-outline group-hover:text-primary transition-colors" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatusPage = () => (
  <div className="space-y-12">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div className="max-w-2xl">
        <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold mb-4 block">System Health</span>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Service Status</h1>
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 p-4 rounded-xl w-fit">
          <CheckCircle className="text-primary" size={24} />
          <span className="font-bold text-primary">All Systems Operational</span>
        </div>
      </div>
      <button className="flex items-center gap-2 bg-surface-container-highest text-on-surface px-6 py-3 rounded-lg font-bold active:scale-95 transition-all">
        <RefreshCw size={18} />
        <span>Refresh Status</span>
      </button>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_STATUS.map((service, i) => (
        <div key={i} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-lg">{service.name}</h3>
            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
              service.status === 'operational' ? 'bg-primary/10 text-primary' : 
              service.status === 'degraded' ? 'bg-secondary-container text-on-secondary-container' : 
              'bg-error-container text-on-error-container'
            }`}>
              {service.status}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant font-medium">Uptime (90d)</span>
              <span className="font-bold">{service.uptime}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant font-medium">Latency</span>
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
      <h2 className="text-2xl font-bold font-headline mb-6">Recent Incidents</h2>
      <div className="space-y-6">
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <AlertCircle size={20} />
            </div>
            <div className="w-px h-full bg-outline-variant/20 mt-2"></div>
          </div>
          <div className="pb-8">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">March 18, 2024</p>
            <h4 className="font-bold text-lg mb-2">Partial Outage: US-EAST Compute Nodes</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">We experienced a brief period of increased latency and intermittent connectivity issues for compute nodes in the US-EAST region. The issue was traced back to a backbone provider and has been resolved.</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">March 15, 2024</p>
            <h4 className="font-bold text-lg mb-2">Scheduled Maintenance: Database Migration</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">Successfully migrated primary database clusters to new NVMe-backed infrastructure. No downtime was observed during the transition.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const ActivityLogPage = () => (
  <div className="space-y-12">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div className="max-w-2xl">
        <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold mb-4 block">Audit Trail</span>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Activity Log</h1>
        <p className="text-on-surface-variant text-lg leading-relaxed">A detailed history of all actions performed on your Monolith account and infrastructure.</p>
      </div>
      <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-xl border border-outline-variant/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="bg-surface-container-lowest border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary w-64"
          />
        </div>
        <button className="bg-primary text-on-primary p-2 rounded-lg active:scale-95 transition-all">
          <Download size={20} />
        </button>
      </div>
    </header>

    <div className="flex flex-wrap gap-2 mb-8">
      {['All Activity', 'Infrastructure', 'Security', 'Billing', 'Account'].map((cat, i) => (
        <button 
          key={i} 
          className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            i === 0 ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>

    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
      <div className="divide-y divide-surface-container-low">
        {MOCK_ACTIVITY.map((log) => (
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
              <UserCircle size={14} className="text-on-surface-variant" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{log.user}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-surface-container-low text-center">
        <button className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">Load More Activity</button>
      </div>
    </div>
  </div>
);

const ProjectsPage = () => (
  <div className="space-y-12">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div className="max-w-2xl">
        <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold mb-4 block">Collaboration</span>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-6">Project Management</h1>
        <p className="text-on-surface-variant text-lg leading-relaxed">Coordinate infrastructure deployments and security audits with your team.</p>
      </div>
      <button className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold active:scale-95 transition-all shadow-lg">
        <Plus size={20} />
        <span>New Project</span>
      </button>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <h2 className="text-xl font-bold font-headline mb-4">Active Projects</h2>
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
                  <span className="text-on-surface-variant uppercase tracking-widest">Progress</span>
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
          <h2 className="text-xl font-bold font-headline">Tasks: Infrastructure Migration</h2>
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
                      <span className={`px-2 py-0.5 rounded uppercase tracking-widest font-black text-[9px] ${
                        task.priority === 'high' ? 'bg-error-container text-on-error-container' : 
                        task.priority === 'medium' ? 'bg-secondary-container text-on-secondary-container' : 
                        'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {task.priority}
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
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    task.status === 'done' ? 'bg-primary/10 text-primary' : 
                    task.status === 'in-progress' ? 'bg-secondary-container text-on-secondary-container' : 
                    'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full p-4 bg-surface-container-low text-primary font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
            <Plus size={16} /> Add Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" /> Team Members
            </h4>
            <div className="space-y-4">
              {['Alex Sterling (Lead)', 'Sarah K.', 'Mike R.', 'John D.'].map((member, i) => (
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
              <Activity size={18} className="text-secondary" /> Recent Updates
            </h4>
            <div className="space-y-4">
              {[
                { user: 'Alex S.', action: 'completed', target: 'Database snapshot', time: '2h ago' },
                { user: 'Sarah K.', action: 'updated', target: 'Network latency', time: '4h ago' },
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

// --- Main App ---

export default function MonolithApp() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="flex-grow pt-32 pb-24 px-6 md:px-10 lg:px-20 max-w-[1920px] mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentPage === 'dashboard' && <DashboardPage />}
            {currentPage === 'billing' && <BillingPage />}
            {currentPage === 'support' && <SupportPage />}
            {currentPage === 'status' && <StatusPage />}
            {currentPage === 'activity' && <ActivityLogPage />}
            {currentPage === 'projects' && <ProjectsPage />}
            {(currentPage === 'services' || currentPage === 'domains') && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-surface-container-low p-12 rounded-full mb-6">
                  <Settings size={64} className="text-primary animate-spin-slow" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Module Under Maintenance</h2>
                <p className="text-on-surface-variant max-w-md">We are currently upgrading our {currentPage} management engine. Please check back in a few minutes.</p>
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="mt-8 text-primary font-bold uppercase tracking-widest text-xs border-b-2 border-primary/20 hover:border-primary transition-all pb-1"
                >
                  Return to Overview
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
