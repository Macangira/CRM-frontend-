import React, { useEffect, useState } from 'react';
import { dashboardService, customerService, taskService, dealService } from '../../services/crmServices';
import { DashboardMetrics, Activity, Customer, Task, Deal } from '../../types';
import { Card } from '../../components/ui/Card';
import { MetricCard } from '../../components/common/MetricCard';
import { RevenueLineChart } from '../../components/charts/RevenueLineChart';
import { PipelineDoughnutChart } from '../../components/charts/PipelineDoughnutChart';
import { useAuth } from '../../context/AuthContext';
import { SkeletonDashboard } from '../../components/ui/Skeleton';
import { FileText, UserCircle, Users, CheckSquare, DollarSign, UserPlus, CheckCircle, Bell, ArrowUpRight, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';

export interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState<(DashboardMetrics & { todayDueTasks?: any[] }) | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state for charts
  const [salesFilter, setSalesFilter] = useState<'Day' | 'Week' | 'Month'>('Month');
  const [detailsFilter, setDetailsFilter] = useState<'Day' | 'Week' | 'Month'>('Month');
  const [breakdownFilter, setBreakdownFilter] = useState<'Day' | 'Week' | 'Month'>('Month');

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [m, act, cust, tsk, dlList] = await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getRecentActivities(),
          customerService.getCustomers(),
          taskService.getTasks(),
          dealService.getDeals()
        ]);
        setMetrics(m || null);
        setActivities(Array.isArray(act) ? act : []);
        setCustomers(Array.isArray(cust) ? cust : []);
        setTasks(Array.isArray(tsk) ? tsk : []);
        setDeals(Array.isArray(dlList) ? dlList : []);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeActivities = Array.isArray(activities) ? activities : [];
  const safeDeals = Array.isArray(deals) ? deals : [];

  // Deal logic for top chart
  const openPipelineDeals = safeDeals.filter(d => d.stage !== 'lost' && d.stage !== 'won');
  const wonDeals = safeDeals.filter(d => d.stage === 'won');
  
  const totalIncome = safeDeals.filter(d => d.stage !== 'lost').reduce((sum, d) => sum + (d.value || 0), 0);
  const openDealsValue = openPipelineDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const wonDealsValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const totalCustomersCount = metrics?.totalCustomers ?? safeCustomers.length;
  
  const now = new Date();
  const monthLabels: string[] = [];
  const monthKeys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toLocaleString('en-US', { month: 'short' }));
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  const monthlyRevenue = monthKeys.map(key =>
    safeDeals
      .filter(d => {
        if (!d.createdAt) return false;
        const dd = new Date(d.createdAt);
        const mk = `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}`;
        return mk === key;
      })
      .reduce((sum, d) => sum + (d.value || 0), 0)
  );

  // Pipeline Breakdown
  const STAGE_ORDER = ['qualification', 'proposal', 'negotiation', 'won', 'lost'] as const;
  const STAGE_LABELS = ['Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  const stageValues = STAGE_ORDER.map(stage =>
    safeDeals.filter(d => d.stage === stage).reduce((sum, d) => sum + (d.value || 0), 0)
  );

  const displayName = user?.fname ? user.fname : (user?.name ? user.name.split(' ')[0] : 'User');
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Activity Icon Helper
  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'deal': return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'customer': return <Users className="w-4 h-4 text-blue-400" />;
      case 'task': return <CheckCircle className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-zinc-400" />;
    }
  };

  const FilterPills = ({ active, onChange }: { active: string, onChange: (val: any) => void }) => (
    <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
      {['Day', 'Week', 'Month'].map(t => (
        <button 
          key={t}
          onClick={() => onChange(t)}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${active === t ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          {t}
        </button>
      ))}
      <button className="px-2 py-1 ml-1 text-zinc-500 hover:text-zinc-300 transition-colors">
        <Calendar className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Welcome / Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-noise bg-zinc-900/30 backdrop-blur-3xl p-6 rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2">
            {getGreeting()}, {displayName} <span className="text-2xl animate-wave origin-bottom-right">👋</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5 font-medium">
            Here's what's happening with your pipeline today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
          </p>
        </div>
      </div>

      {/* KPI Glassmorphic Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Customers"
          value={metrics?.totalCustomers ?? (safeCustomers.length || 0)}
          icon={<Users className="w-4 h-4" />}
          hoverColorTheme="cyan"
          onClick={() => onNavigate('/customers')}
        />
        <MetricCard
          title="Open Deals Value"
          value={`$${openDealsValue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
          changeLabel={`${openPipelineDeals.length} active deal${openPipelineDeals.length !== 1 ? 's' : ''}`}
          hoverColorTheme="blue"
          onClick={() => onNavigate('/deals')}
        />
        <MetricCard
          title="Leads This Month"
          value={metrics?.totalLeads ?? 0}
          icon={<UserPlus className="w-4 h-4 text-purple-400" />}
          hoverColorTheme="purple"
          onClick={() => onNavigate('/leads')}
        />
        <MetricCard
          title="Tasks Due Today"
          value={metrics?.pendingTasks ?? (safeTasks.length || 0)}
          icon={<CheckSquare className="w-4 h-4 text-amber-400" />}
          hoverColorTheme="amber"
          onClick={() => onNavigate('/tasks')}
        />
      </div>

      {/* Top Row: Sales Chart & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Your Sales */}
        <Card className="lg:col-span-8 p-6 flex flex-col min-h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-[15px] font-bold text-zinc-100">Deal Revenue</h3>
              <div className="text-3xl font-extrabold text-zinc-100 mt-2">
                ${totalIncome.toLocaleString()}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Total income</p>
            </div>
            <FilterPills active={salesFilter} onChange={setSalesFilter} />
          </div>
          <div className="flex-1">
            <RevenueLineChart 
              data={monthlyRevenue} 
              labels={monthLabels} 
              colorTheme="blue" 
            />
          </div>
        </Card>

        {/* Card 2: Latest Events */}
        <Card className="lg:col-span-4 p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-zinc-100">Latest Events</h3>
            <button onClick={() => onNavigate('/activities')} className="text-xs font-semibold bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 py-1.5 px-3 rounded-full transition-colors">
              View all
            </button>
          </div>
          
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-3 mb-4">
            <span>Event</span>
            <span>Details</span>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {safeActivities.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No recent events found.</p>
            ) : (
              safeActivities.slice(0, 5).map((act, i) => (
                <div key={act.id || i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-zinc-100 truncate max-w-[160px]">
                        {act.description?.split(' ').slice(0, 4).join(' ') || 'Event Update'}...
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {act.performedByName || 'System'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-zinc-300">
                      {act.timestamp ? new Date(act.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short' }) : 'Today'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Row: Breakdown & Income Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 3: Income Breakdown */}
        <Card className="lg:col-span-5 p-6 flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[15px] font-bold text-zinc-100">Pipeline Breakdown</h3>
            <FilterPills active={breakdownFilter} onChange={setBreakdownFilter} />
          </div>
          <div className="flex-1 flex flex-col justify-center">
             <PipelineDoughnutChart 
               stageValues={stageValues} 
               labels={STAGE_LABELS} 
               totalValue={totalIncome}
             />
          </div>
        </Card>

        {/* Card 4: Income Details */}
        <Card className="lg:col-span-7 p-6 flex flex-col min-h-[420px] justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[15px] font-bold text-zinc-100">Performance Details</h3>
              <FilterPills active={detailsFilter} onChange={setDetailsFilter} />
            </div>
            <div className="h-[220px]">
               <RevenueLineChart 
                 data={monthlyRevenue} 
                 labels={monthLabels} 
                 colorTheme="green" 
               />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t border-zinc-800/50">
            <div className="text-center border-r border-zinc-800/50 last:border-0">
              <div className="text-xl font-bold text-zinc-100">${openDealsValue.toLocaleString()}</div>
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">Open Pipeline</div>
            </div>
            <div className="text-center border-r border-zinc-800/50 last:border-0">
              <div className="text-xl font-bold text-zinc-100">${wonDealsValue.toLocaleString()}</div>
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">Closed Won</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-zinc-100">{totalCustomersCount}</div>
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">Total Customers</div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
