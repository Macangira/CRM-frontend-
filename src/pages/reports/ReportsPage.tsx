import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { ExportButton } from '../../components/common/ExportButton';
import { FileText, TrendingUp, DollarSign, Award, Target, Users } from 'lucide-react';
import { analyticsService } from '../../services/crmServices';

export const ReportsPage: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const getSafeArray = (raw: any) => {
          if (typeof raw === 'string') {
            try { raw = JSON.parse(raw); } catch (e) {}
          }
          if (Array.isArray(raw)) return raw;
          if (raw && Array.isArray(raw.data)) return raw.data;
          return [];
        };

        const sales = await analyticsService.getSalesAnalytics('monthly');
        setSalesData(getSafeArray(sales?.data));
        
        const leads = await analyticsService.getLeadsAnalytics();
        setLeadsData(getSafeArray(leads?.data));
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute total aggregates from sales data
  const totalWonDeals = salesData.reduce((acc, curr) => acc + (curr.won_deals || 0), 0);
  const totalLostDeals = salesData.reduce((acc, curr) => acc + (curr.lost_deals || 0), 0);
  const totalRevenue = salesData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const overallWinRate = salesData.length > 0 
    ? (salesData.reduce((acc, curr) => acc + (curr.win_rate || 0), 0) / salesData.length).toFixed(1) 
    : '0.0';

  // Compute total leads aggregate
  const totalLeads = leadsData.reduce((acc, curr) => acc + (curr.total_leads || 0), 0);
  const totalConverted = leadsData.reduce((acc, curr) => acc + (curr.converted_leads || 0), 0);
  const overallConversionRate = totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Analytics & Executive Reports</h2>
          <p className="text-xs text-slate-500">Pipeline conversion velocity, lead source metrics, and downloadable exports</p>
        </div>
        <ExportButton filename="Enterprise_CRM_Executive_Report" />
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-400 font-medium">Loading analytics data...</div>
      ) : (
        <>
          {/* Analytics Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="space-y-2 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Overall Win Rate</span>
                <Award className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{overallWinRate}%</div>
              <p className="text-xs text-emerald-600 font-semibold">{totalWonDeals} Total Won Deals</p>
            </Card>

            <Card className="space-y-2 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Overall Lead Conversion</span>
                <Target className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{overallConversionRate}%</div>
              <p className="text-xs text-emerald-600 font-semibold">{totalConverted} Leads Converted</p>
            </Card>

            <Card className="space-y-2 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total Pipeline Revenue</span>
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-emerald-600 font-semibold">Total revenue generated</p>
            </Card>
          </div>

          {/* Visual Report Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Revenue & Deals by Period (Monthly)</h3>
              <div className="space-y-3">
                {salesData.length === 0 ? (
                  <p className="text-xs text-slate-500">No sales data found.</p>
                ) : (
                  salesData.map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-800 dark:text-slate-200">{item.period}</span>
                        <span className="text-slate-900 dark:text-slate-100">${(item.revenue || 0).toLocaleString()} ({(item.win_rate || 0).toFixed(1)}% Win Rate)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${Math.min(100, (item.win_rate || 0))}%` }} className="h-full bg-blue-500 rounded-full" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Lead Conversion by Source</h3>
              <div className="space-y-3">
                {leadsData.length === 0 ? (
                   <p className="text-xs text-slate-500">No leads data found.</p>
                ) : (
                  leadsData.map((item, idx) => {
                    const rate = (item.conversion_rate || 0).toFixed(1);
                    return (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.source || 'Unknown Source'}</span>
                          <span className="text-[10px] text-slate-500">{item.total_leads} Total, {item.converted_leads} Converted</span>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                          {rate}% Conversion
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
