import React, { useEffect, useState } from 'react';
import { companyService } from '../../services/crmServices';
import { Company } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../constants/permissions';
import { Building2, Plus, ExternalLink, Globe, Phone, MapPin } from 'lucide-react';

export const CompanyListPage: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Form states matching FastAPI CreateCompany schema
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [industry, setIndustry] = useState('Software & Technology');
  const [phone, setPhone] = useState('+1 (800) 555-0199');
  const [country, setCountry] = useState('United States');
  const [revenue, setRevenue] = useState(50000000);
  const [employees, setEmployees] = useState(500);
  const [address, setAddress] = useState('Corporate HQ, 100 Tech Blvd');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await companyService.createCompany({
        name,
        domain,
        industry,
        phone,
        country,
        size: Number(employees),
        employeeCount: Number(employees),
        annualRevenue: Number(revenue),
        address,
        website: `https://${domain.replace(/^https?:\/\//, '')}`,
        assignedUserId: user?.id || 'usr_1',
        assignedUserName: user?.fname || 'Account Owner'
      });
      setShowCreateModal(false);
      setName('');
      setDomain('');
      loadCompanies();
    } catch (err) {
      console.error("Create Company error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Company>[] = [
    {
      key: 'name',
      header: 'Company Name',
      sortable: true,
      accessor: cmp => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/20 shrink-0">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="font-bold text-zinc-100">{cmp.name || 'Organization'}</div>
            {cmp.domain && (
              <a href={`https://${cmp.domain.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                {cmp.domain} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'industry',
      header: 'Industry',
      sortable: true,
      accessor: cmp => <Badge variant="primary">{cmp.industry || 'Software'}</Badge>
    },
    {
      key: 'annualRevenue',
      header: 'Annual Revenue',
      sortable: true,
      accessor: cmp => cmp.annualRevenue ? `$${(cmp.annualRevenue / 1000000).toFixed(1)}M` : '—'
    },
    {
      key: 'employeeCount',
      header: 'Staff Size',
      sortable: true,
      accessor: cmp => cmp.employeeCount ? `${cmp.employeeCount.toLocaleString()} staff` : '—'
    },
    {
      key: 'assignedUserName',
      header: 'Account Owner',
      sortable: true
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight">Companies Directory</h2>
          <p className="text-xs text-zinc-400">Corporate accounts, organization sizes, and assigned sales executives</p>
        </div>
        {hasPermission(user, 'company:create') && (
          <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add Organization
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={companies}
        isLoading={isLoading}
        searchPlaceholder="Search companies by name, industry, domain..."
        onRowClick={cmp => setSelectedCompany(cmp)}
        renderMobileCard={(cmp: Company) => (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/20 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{cmp.name}</div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 truncate mt-0.5">
                    {cmp.domain || 'No domain'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-[11px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-2 truncate">
                <Globe className="w-3.5 h-3.5 shrink-0" /> {cmp.country || 'No country'}
              </div>
              <div className="flex items-center gap-2 truncate">
                <Phone className="w-3.5 h-3.5 shrink-0" /> {cmp.phone || 'No phone'}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <Badge variant="primary">{cmp.industry || 'Unknown'}</Badge>
              <div className="text-xs text-zinc-500">
                <span className="font-bold text-emerald-500">{cmp.annualRevenue ? `$${(cmp.annualRevenue / 1000000).toFixed(1)}M` : '—'}</span>
              </div>
            </div>
          </div>
        )}
      />

      {/* Centered Glassmorphic Add Organization Modal with Fixed Footer */}
      {hasPermission(user, 'company:create') && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Register New Organization"
          description="Create a corporate company profile in FastAPI backend MongoDB"
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-company-form" isLoading={isSubmitting} className="px-6">
                Save Organization Profile
              </Button>
            </div>
          }
        >
          <form id="create-company-form" onSubmit={handleCreateCompany} className="space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Apex Global Corp"
              />
              <Input
                label="Domain / Website"
                required
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="apexglobal.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Industry Sector"
                required
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="e.g. Cloud Infrastructure"
              />
              <Input
                label="Phone Number"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (800) 555-0199"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Country Location"
                required
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="United States"
              />
              <Input
                label="Staff Size (Employees)"
                type="number"
                value={employees}
                onChange={e => setEmployees(Number(e.target.value))}
                placeholder="500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Annual Revenue ($)"
                type="number"
                value={revenue}
                onChange={e => setRevenue(Number(e.target.value))}
                placeholder="50000000"
              />
              <Input
                label="Corporate Address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="100 Tech Blvd, Suite 400"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Company Profile Detail Drawer */}
      {selectedCompany && (
        <Drawer
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          title="Company Account Profile"
          description={selectedCompany.domain}
        >
          <div className="space-y-6">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md space-y-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5" /> {selectedCompany.name}
              </h3>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {selectedCompany.address || 'Corporate HQ'}, {selectedCompany.country || 'USA'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 border border-zinc-800 rounded-xl">
                <span className="text-zinc-400">Industry</span>
                <div className="text-sm font-bold text-zinc-100 mt-0.5">{selectedCompany.industry}</div>
              </div>
              <div className="p-3 border border-zinc-800 rounded-xl">
                <span className="text-zinc-400">Account Owner</span>
                <div className="text-sm font-bold text-zinc-100 mt-0.5">
                  {selectedCompany.assignedUserName || 'Sophia Chen'}
                </div>
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
