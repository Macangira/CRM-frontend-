import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Search, Command, Users, Building2, Briefcase, CheckSquare, UserPlus, Shield, Settings, FileText, ArrowRight, X, Loader2 } from 'lucide-react';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import { searchService, customerService, dealService, leadService, taskService } from '../../services/crmServices';
import { Customer, Deal, Lead, Task } from '../../types';

export interface CommandPaletteProps {
  onNavigate: (path: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
  const { isOpen, closePalette } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Search Results State
  const [searchResults, setSearchResults] = useState<{
    customers: Customer[];
    deals: Deal[];
    leads: Lead[];
    tasks: Task[];
  }>({
    customers: [],
    deals: [],
    leads: [],
    tasks: []
  });

  useEffect(() => {
    if (!query || !query.trim()) {
      setSearchResults({ customers: [], deals: [], leads: [], tasks: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Parallelized Live Entity Search + FastAPI Global Search
        const [customers, deals, leads, tasks] = await Promise.all([
          customerService.getCustomers(query.trim()),
          dealService.getDeals(query.trim()),
          leadService.getLeads(query.trim()),
          taskService.getTasks(query.trim())
        ]);

        setSearchResults({
          customers: Array.isArray(customers) ? customers.slice(0, 4) : [],
          deals: Array.isArray(deals) ? deals.slice(0, 4) : [],
          leads: Array.isArray(leads) ? leads.slice(0, 4) : [],
          tasks: Array.isArray(tasks) ? tasks.slice(0, 4) : []
        });

        // Trigger FastAPI backend global search endpoint in background
        searchService.globalSearch(query.trim());
      } catch (err) {
        console.warn("Global Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    onNavigate(path);
    closePalette();
    setQuery('');
  };

  const navCommands = [
    { label: 'Dashboard Overview', path: '/dashboard', icon: <Command className="w-4 h-4 text-blue-400" /> },
    { label: 'Customers Directory', path: '/customers', icon: <Users className="w-4 h-4 text-emerald-400" /> },
    { label: 'Companies Directory', path: '/companies', icon: <Building2 className="w-4 h-4 text-indigo-400" /> },
    { label: 'Deals & Revenue Pipeline', path: '/deals', icon: <Briefcase className="w-4 h-4 text-purple-400" /> },
    { label: 'Tasks & Calendar Board', path: '/tasks', icon: <CheckSquare className="w-4 h-4 text-amber-400" /> },
    { label: 'Sales Leads Pipeline', path: '/leads', icon: <UserPlus className="w-4 h-4 text-cyan-400" /> },
    { label: 'Audit Activity Log', path: '/activities', icon: <FileText className="w-4 h-4 text-pink-400" /> },
    { label: 'User Directory', path: '/users', icon: <Users className="w-4 h-4 text-sky-400" /> },
    { label: 'Roles & RBAC Control', path: '/roles', icon: <Shield className="w-4 h-4 text-red-400" /> },
    { label: 'Analytics & Reports', path: '/reports', icon: <FileText className="w-4 h-4 text-teal-400" /> },
    { label: 'Account Settings', path: '/settings', icon: <Settings className="w-4 h-4 text-zinc-400" /> }
  ];

  const filteredNavCommands = navCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const paletteContent = (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-4 bg-black/80 backdrop-blur-md animate-fadeIn" style={{ zIndex: 9999 }}>
      <div className="w-full max-w-xl bg-[#0e1017] border border-zinc-800/90 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col animate-scaleUp text-left">
        
        {/* Search Bar Input */}
        <div className="flex items-center px-4 border-b border-zinc-800/80 py-3.5 bg-zinc-900/50">
          <Search className="w-5 h-5 text-blue-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search customers, deals, leads, tasks... (Esc to exit)"
            className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none text-sm font-medium"
          />
          {isSearching && <Loader2 className="w-4 h-4 text-blue-400 animate-spin mr-2 shrink-0" />}
          <button onClick={closePalette} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
          
          {/* Matching Navigation Shortcuts */}
          {filteredNavCommands.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Navigation Shortcuts
              </div>
              <div className="mt-1 space-y-0.5">
                {filteredNavCommands.map(cmd => (
                  <button
                    key={cmd.path}
                    onClick={() => handleSelect(cmd.path)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-zinc-800/80 text-zinc-200 group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {cmd.icon}
                      <span className="font-semibold">{cmd.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Customers */}
          {query.trim() && searchResults.customers.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Matching Customers ({searchResults.customers.length})
              </div>
              <div className="mt-1 space-y-1">
                {searchResults.customers.map(cust => (
                  <button
                    key={cust.id}
                    onClick={() => handleSelect('/customers')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-emerald-500/40 text-xs text-left transition-colors"
                  >
                    <div>
                      <div className="font-bold text-zinc-100">{cust.name}</div>
                      <div className="text-[11px] text-zinc-400">{cust.companyName} • {cust.email}</div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400">${cust.totalDealsValue.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Deals */}
          {query.trim() && searchResults.deals.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" /> Matching Deals ({searchResults.deals.length})
              </div>
              <div className="mt-1 space-y-1">
                {searchResults.deals.map(deal => (
                  <button
                    key={deal.id}
                    onClick={() => handleSelect('/deals')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-amber-500/40 text-xs text-left transition-colors"
                  >
                    <div>
                      <div className="font-bold text-zinc-100">{deal.title}</div>
                      <div className="text-[11px] text-zinc-400">Stage: {deal.stage}</div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400">${(deal.value || 0).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Sales Leads */}
          {query.trim() && searchResults.leads.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-3 h-3" /> Matching Leads ({searchResults.leads.length})
              </div>
              <div className="mt-1 space-y-1">
                {searchResults.leads.map(lead => (
                  <button
                    key={lead.id}
                    onClick={() => handleSelect('/leads')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-purple-500/40 text-xs text-left transition-colors"
                  >
                    <div>
                      <div className="font-bold text-zinc-100">{lead.title}</div>
                      <div className="text-[11px] text-zinc-400">{lead.contactName} ({lead.companyName})</div>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-300">{lead.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Tasks */}
          {query.trim() && searchResults.tasks.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3 h-3" /> Matching Tasks ({searchResults.tasks.length})
              </div>
              <div className="mt-1 space-y-1">
                {searchResults.tasks.map(tsk => (
                  <button
                    key={tsk.id}
                    onClick={() => handleSelect('/tasks')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-cyan-500/40 text-xs text-left transition-colors"
                  >
                    <div>
                      <div className="font-bold text-zinc-100">{tsk.title}</div>
                      <div className="text-[11px] text-zinc-400">Due: {tsk.dueDate || 'Today'}</div>
                    </div>
                    <span className="text-[11px] font-semibold text-cyan-300">{tsk.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && !isSearching && searchResults.customers.length === 0 && searchResults.deals.length === 0 && searchResults.leads.length === 0 && searchResults.tasks.length === 0 && filteredNavCommands.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching CRM records found for "{query}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#090a0f] border-t border-zinc-800/80 text-[11px] text-zinc-400 flex justify-between items-center">
          <span>Trigger search anywhere with <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-zinc-300">Ctrl+K</kbd></span>
          <span className="font-semibold text-blue-400">SpireCRM Search Engine</span>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(paletteContent, document.body);
};
