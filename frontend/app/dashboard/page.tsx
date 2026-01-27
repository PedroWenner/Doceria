import GlassCard from '@/app/components/GlassCard';

export default function DashboardHome() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-brand-choco">Overview</h2>
                <div className="text-sm text-brand-choco/60">Welcome back, Patissier</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="p-6 border-brand-pink/30 bg-white/40">
                    <p className="text-brand-choco/60 mb-2 font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-brand-choco">$12,450</p>
                    <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full mt-2 inline-block">+12%</span>
                </GlassCard>
                <GlassCard className="p-6 border-brand-pink/30 bg-white/40">
                    <p className="text-brand-choco/60 mb-2 font-medium">Orders</p>
                    <p className="text-3xl font-bold text-brand-choco">156</p>
                </GlassCard>
                <GlassCard className="p-6 border-brand-pink/30 bg-white/40">
                    <p className="text-brand-choco/60 mb-2 font-medium">Pending</p>
                    <p className="text-3xl font-bold text-brand-choco">23</p>
                </GlassCard>
                <GlassCard className="p-6 border-brand-pink/30 bg-white/40">
                    <p className="text-brand-choco/60 mb-2 font-medium">Customers</p>
                    <p className="text-3xl font-bold text-brand-choco">892</p>
                </GlassCard>
            </div>

            {/* Recent Activity Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-brand-choco mb-6">Recent Orders</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/30 rounded-xl border border-white/50">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-brand-pink/20 flex items-center justify-center text-2xl">🍰</div>
                                    <div>
                                        <p className="font-bold text-brand-choco">Chocolate Gateau</p>
                                        <p className="text-xs text-brand-choco/60">Cust #{1000 + i}</p>
                                    </div>
                                </div>
                                <span className="text-brand-choco font-bold">$45.00</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-xl font-bold text-brand-choco mb-6">Top Products</h3>
                    <ul className="space-y-3">
                        <li className="flex justify-between text-brand-choco/80 pb-2 border-b border-white/30">
                            <span>Macarons Box</span>
                            <span className="font-bold">84 sold</span>
                        </li>
                        <li className="flex justify-between text-brand-choco/80 pb-2 border-b border-white/30">
                            <span>Red Velvet</span>
                            <span className="font-bold">65 sold</span>
                        </li>
                        <li className="flex justify-between text-brand-choco/80">
                            <span>Eclairs</span>
                            <span className="font-bold">42 sold</span>
                        </li>
                    </ul>
                </GlassCard>
            </div>
        </div>
    );
}
