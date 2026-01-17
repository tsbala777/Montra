import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from 'recharts';
import { Investment, InvestmentType } from '../types';
import {
    TrendingUp,
    TrendingDown,
    Plus,
    X,
    Edit2,
    Trash2,
    Wallet,
    Target,
    PieChart as PieChartIcon,
    BarChart3,
    Calendar,
    DollarSign,
    Landmark,
    Bitcoin,
    Gem,
    Building2,
    Briefcase,
    MoreHorizontal
} from 'lucide-react';

interface Props {
    investments: Investment[];
    currency: string;
    onAddInvestment: (investment: Omit<Investment, 'id'>) => void;
    onUpdateInvestment: (investment: Investment) => void;
    onDeleteInvestment: (id: string) => void;
}

const INVESTMENT_TYPES: { value: InvestmentType; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'stocks', label: 'Stocks', icon: <TrendingUp size={18} />, color: '#6366f1' },
    { value: 'mutual_funds', label: 'Mutual Funds', icon: <PieChartIcon size={18} />, color: '#8b5cf6' },
    { value: 'gold', label: 'Gold', icon: <Gem size={18} />, color: '#eab308' },
    { value: 'crypto', label: 'Crypto', icon: <Bitcoin size={18} />, color: '#f97316' },
    { value: 'fixed_deposit', label: 'Fixed Deposit', icon: <Landmark size={18} />, color: '#22c55e' },
    { value: 'real_estate', label: 'Real Estate', icon: <Building2 size={18} />, color: '#06b6d4' },
    { value: 'other', label: 'Other', icon: <Briefcase size={18} />, color: '#64748b' },
];

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#eab308', '#f97316', '#22c55e', '#06b6d4', '#64748b'];

export const Investments: React.FC<Props> = ({
    investments,
    currency,
    onAddInvestment,
    onUpdateInvestment,
    onDeleteInvestment
}) => {
    const [showModal, setShowModal] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'stocks' as InvestmentType,
        symbol: '',
        purchasePrice: '',
        currentValue: '',
        quantity: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Calculate portfolio metrics
    const portfolioMetrics = useMemo(() => {
        const totalInvested = investments.reduce((acc, inv) => acc + (inv.purchasePrice * inv.quantity), 0);
        const totalCurrentValue = investments.reduce((acc, inv) => acc + (inv.currentValue * inv.quantity), 0);
        const totalReturns = totalCurrentValue - totalInvested;
        const returnPercentage = totalInvested > 0 ? ((totalReturns / totalInvested) * 100) : 0;

        // Best performer
        let bestPerformer = investments[0];
        investments.forEach(inv => {
            const currentReturn = ((inv.currentValue - inv.purchasePrice) / inv.purchasePrice) * 100;
            const bestReturn = bestPerformer ? ((bestPerformer.currentValue - bestPerformer.purchasePrice) / bestPerformer.purchasePrice) * 100 : 0;
            if (currentReturn > bestReturn) bestPerformer = inv;
        });

        return {
            totalInvested,
            totalCurrentValue,
            totalReturns,
            returnPercentage,
            bestPerformer
        };
    }, [investments]);

    // Asset allocation data for pie chart
    const allocationData = useMemo(() => {
        const typeValues: Record<string, number> = {};
        investments.forEach(inv => {
            const value = inv.currentValue * inv.quantity;
            typeValues[inv.type] = (typeValues[inv.type] || 0) + value;
        });

        return Object.entries(typeValues).map(([type, value]) => ({
            name: INVESTMENT_TYPES.find(t => t.value === type)?.label || type,
            value,
            percentage: portfolioMetrics.totalCurrentValue > 0
                ? Math.round((value / portfolioMetrics.totalCurrentValue) * 100)
                : 0
        }));
    }, [investments, portfolioMetrics.totalCurrentValue]);

    const handleOpenModal = (investment?: Investment) => {
        if (investment) {
            setEditingInvestment(investment);
            setFormData({
                name: investment.name,
                type: investment.type,
                symbol: investment.symbol || '',
                purchasePrice: investment.purchasePrice.toString(),
                currentValue: investment.currentValue.toString(),
                quantity: investment.quantity.toString(),
                purchaseDate: investment.purchaseDate,
                notes: investment.notes || ''
            });
        } else {
            setEditingInvestment(null);
            setFormData({
                name: '',
                type: 'stocks',
                symbol: '',
                purchasePrice: '',
                currentValue: '',
                quantity: '',
                purchaseDate: new Date().toISOString().split('T')[0],
                notes: ''
            });
        }
        setShowModal(true);
    };

    const handleSave = () => {
        const investmentData = {
            name: formData.name,
            type: formData.type,
            symbol: formData.symbol || undefined,
            purchasePrice: parseFloat(formData.purchasePrice) || 0,
            currentValue: parseFloat(formData.currentValue) || parseFloat(formData.purchasePrice) || 0,
            quantity: parseFloat(formData.quantity) || 1,
            purchaseDate: formData.purchaseDate,
            notes: formData.notes || undefined
        };

        if (editingInvestment) {
            onUpdateInvestment({ ...investmentData, id: editingInvestment.id });
        } else {
            onAddInvestment(investmentData);
        }
        setShowModal(false);
    };

    const getTypeInfo = (type: InvestmentType) => {
        return INVESTMENT_TYPES.find(t => t.value === type) || INVESTMENT_TYPES[6];
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Investments</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track your investment portfolio</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/25"
                >
                    <Plus size={18} />
                    Add Investment
                </button>
            </div>

            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Portfolio Value */}
                <div className="bg-indigo-600 p-5 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Wallet size={16} />
                        <span className="text-xs font-medium">Portfolio Value</span>
                    </div>
                    <p className="text-2xl font-bold">{currency}{portfolioMetrics.totalCurrentValue.toLocaleString()}</p>
                    <p className="text-xs opacity-75 mt-1">
                        Invested: {currency}{portfolioMetrics.totalInvested.toLocaleString()}
                    </p>
                </div>

                {/* Total Returns */}
                <div className={`p-5 rounded-2xl ${portfolioMetrics.totalReturns >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-rose-50 dark:bg-rose-950/30'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        {portfolioMetrics.totalReturns >= 0 ? (
                            <TrendingUp size={16} className="text-emerald-600" />
                        ) : (
                            <TrendingDown size={16} className="text-rose-600" />
                        )}
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Returns</span>
                    </div>
                    <p className={`text-2xl font-bold ${portfolioMetrics.totalReturns >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {portfolioMetrics.totalReturns >= 0 ? '+' : ''}{currency}{portfolioMetrics.totalReturns.toLocaleString()}
                    </p>
                    <p className={`text-xs font-semibold mt-1 ${portfolioMetrics.totalReturns >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {portfolioMetrics.returnPercentage >= 0 ? '+' : ''}{portfolioMetrics.returnPercentage.toFixed(2)}%
                    </p>
                </div>

                {/* Number of Holdings */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 size={16} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Holdings</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{investments.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Active investments</p>
                </div>

                {/* Best Performer */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-amber-500" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Best Performer</span>
                    </div>
                    {portfolioMetrics.bestPerformer ? (
                        <>
                            <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                {portfolioMetrics.bestPerformer.name}
                            </p>
                            <p className="text-xs text-emerald-600 font-semibold mt-1">
                                +{(((portfolioMetrics.bestPerformer.currentValue - portfolioMetrics.bestPerformer.purchasePrice) / portfolioMetrics.bestPerformer.purchasePrice) * 100).toFixed(2)}%
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-slate-400">No investments yet</p>
                    )}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Asset Allocation Pie Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Asset Allocation</h3>

                    {investments.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-slate-400">
                            <div className="text-center">
                                <PieChartIcon size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Add investments to see allocation</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-6">
                            <div className="w-40 h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={allocationData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {allocationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-2">
                                {allocationData.map((item, idx) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                            />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Investment Type Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">By Investment Type</h3>

                    <div className="space-y-4">
                        {INVESTMENT_TYPES.filter(type =>
                            investments.some(inv => inv.type === type.value)
                        ).map(type => {
                            const typeInvestments = investments.filter(inv => inv.type === type.value);
                            const typeValue = typeInvestments.reduce((acc, inv) => acc + (inv.currentValue * inv.quantity), 0);
                            const typePercentage = portfolioMetrics.totalCurrentValue > 0
                                ? (typeValue / portfolioMetrics.totalCurrentValue) * 100
                                : 0;

                            return (
                                <div key={type.value}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: type.color + '20', color: type.color }}
                                            >
                                                {type.icon}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{type.label}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                            {currency}{typeValue.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${typePercentage}%`, backgroundColor: type.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {investments.length === 0 && (
                            <p className="text-center text-slate-400 py-8">No investments added yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Holdings List */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Holdings</h3>
                    <span className="text-sm text-slate-500">{investments.length} investments</span>
                </div>

                {investments.length === 0 ? (
                    <div className="text-center py-12">
                        <Wallet size={48} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-500 mb-4">No investments yet</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Add Your First Investment
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {investments.map(investment => {
                            const typeInfo = getTypeInfo(investment.type);
                            const totalValue = investment.currentValue * investment.quantity;
                            const totalCost = investment.purchasePrice * investment.quantity;
                            const returnAmount = totalValue - totalCost;
                            const returnPercent = ((investment.currentValue - investment.purchasePrice) / investment.purchasePrice) * 100;

                            return (
                                <div
                                    key={investment.id}
                                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}
                                        >
                                            {typeInfo.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{investment.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{typeInfo.label}</span>
                                                {investment.symbol && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-mono">{investment.symbol}</span>
                                                    </>
                                                )}
                                                <span>•</span>
                                                <span>{investment.quantity} units</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {currency}{totalValue.toLocaleString()}
                                            </p>
                                            <p className={`text-xs font-semibold ${returnAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {returnAmount >= 0 ? '+' : ''}{currency}{returnAmount.toLocaleString()} ({returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%)
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(investment)}
                                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} className="text-slate-500" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteInvestment(investment.id)}
                                                className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} className="text-rose-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Investment Modal */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />

                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {editingInvestment ? 'Edit Investment' : 'Add Investment'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                                <X size={16} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                            {/* Investment Type */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {INVESTMENT_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => setFormData({ ...formData, type: type.value })}
                                            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${formData.type === type.value
                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500'
                                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <span style={{ color: type.color }}>{type.icon}</span>
                                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Apple Inc, HDFC Bank"
                                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Symbol (optional) */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Symbol (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.symbol}
                                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                    placeholder="e.g., AAPL, HDFCBANK"
                                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-mono font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Quantity & Purchase Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        placeholder="1"
                                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Purchase Price</label>
                                    <input
                                        type="number"
                                        value={formData.purchasePrice}
                                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Current Value */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Current Value (per unit)</label>
                                <input
                                    type="number"
                                    value={formData.currentValue}
                                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                                    placeholder="Same as purchase price"
                                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Purchase Date */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Purchase Date</label>
                                <input
                                    type="date"
                                    value={formData.purchaseDate}
                                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Notes (Optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Any notes about this investment..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={handleSave}
                                disabled={!formData.name || !formData.purchasePrice}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${formData.name && formData.purchasePrice
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {editingInvestment ? 'Update Investment' : 'Add Investment'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
