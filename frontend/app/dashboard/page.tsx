import GlassCard from '@/app/components/GlassCard';
import FinancialDashboard from '@/app/components/dashboard/FinancialDashboard';

export default function DashboardHome() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-brand-choco">Overview</h2>
                <div className="text-sm text-brand-choco/60">Welcome back, Patissier</div>
            </div>

            {/* Financial Dashboard (Live Data) */}
            <FinancialDashboard />
        </div>
    );
}
