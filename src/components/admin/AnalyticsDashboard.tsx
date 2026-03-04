
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, Eye, MapPin, Globe, Loader2, Calendar } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

import { useRadio } from '@/contexts/RadioContext';
import { Radio as RadioIcon } from 'lucide-react';

const AnalyticsDashboard = () => {
    const { onlineCount } = useRadio();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [filter, setFilter] = useState('7days'); // 24h, 7days, 30days, month, year, all, custom
    const [customDate, setCustomDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        fetchAnalytics();
    }, [filter, customDate]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            let query = supabase.from('page_views' as any).select('*');

            const now = new Date();
            if (filter === '24h') {
                query = query.gte('created_at', subDays(now, 1).toISOString());
            } else if (filter === '7days') {
                query = query.gte('created_at', subDays(now, 7).toISOString());
            } else if (filter === '30days') {
                query = query.gte('created_at', subDays(now, 30).toISOString());
            } else if (filter === 'month') {
                query = query.gte('created_at', startOfMonth(now).toISOString());
            } else if (filter === 'year') {
                query = query.gte('created_at', new Date(now.getFullYear(), 0, 1).toISOString());
            } else if (filter === 'custom') {
                const start = startOfDay(new Date(customDate));
                const end = endOfDay(new Date(customDate));
                query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
            }

            const { data: views, error } = await query.order('created_at', { ascending: true });

            if (error) throw error;
            setData(views || []);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Process data for charts
    const getDailyData = () => {
        const daily: Record<string, number> = {};
        data.forEach(view => {
            const day = format(parseISO(view.created_at), 'dd/MM');
            daily[day] = (daily[day] || 0) + 1;
        });
        return Object.entries(daily).map(([name, visits]) => ({ name, visits }));
    };

    const getPageData = () => {
        const pages: Record<string, number> = {};
        data.forEach(view => {
            const p = view.path === '/' ? 'Home' : view.path;
            pages[p] = (pages[p] || 0) + 1;
        });
        return Object.entries(pages)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    };

    const getCityData = () => {
        const cities: Record<string, number> = {};
        data.forEach(view => {
            const city = view.city || 'Desconhecido';
            cities[city] = (cities[city] || 0) + 1;
        });
        return Object.entries(cities)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    };

    const uniqueVisitors = new Set(data.map(v => v.session_id)).size;

    if (loading && data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="font-display font-bold text-2xl text-foreground">Análise de Visitantes</h2>

                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="24h">Últimas 24 horas</SelectItem>
                            <SelectItem value="7days">Últimos 7 dias</SelectItem>
                            <SelectItem value="30days">Últimos 30 dias</SelectItem>
                            <SelectItem value="month">Este mês</SelectItem>
                            <SelectItem value="year">Este ano</SelectItem>
                            <SelectItem value="all">Tudo</SelectItem>
                            <SelectItem value="custom">Data Específica</SelectItem>
                        </SelectContent>
                    </Select>
                    {filter === 'custom' && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                            <input
                                type="date"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                className="bg-background border rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    Ouvintes Ao Vivo
                                </p>
                                <h3 className="text-3xl font-bold mt-1">{onlineCount}</h3>
                            </div>
                            <RadioIcon className="w-8 h-8 text-red-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total de Visualizações</p>
                                <h3 className="text-3xl font-bold mt-1">{data.length}</h3>
                            </div>
                            <Eye className="w-8 h-8 text-primary opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Visitantes Únicos</p>
                                <h3 className="text-3xl font-bold mt-1">{uniqueVisitors}</h3>
                            </div>
                            <Users className="w-8 h-8 text-secondary opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Cidades Atendidas</p>
                                <h3 className="text-3xl font-bold mt-1">{new Set(data.map(v => v.city).filter(Boolean)).size}</h3>
                            </div>
                            <MapPin className="w-8 h-8 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Acessos por Dia
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getDailyData()}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                />
                                <Area type="monotone" dataKey="visits" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVisits)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Páginas mais Visitadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getPageData()} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" fontSize={10} width={100} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                />
                                <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Localização: Top Cidades
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 flex flex-col md:flex-row items-center">
                        <div className="w-full md:w-1/2 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={getCityData()}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {getCityData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-2 mt-4 md:mt-0">
                            {getCityData().map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <span className="text-muted-foreground">{item.value} visitas</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Loader2 className="w-4 h-4" /> Atividade Recente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                            {data.slice().reverse().slice(0, 10).map((view, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold truncate max-w-[200px]">{view.path === '/' ? 'Página Inicial' : view.path}</span>
                                        <span className="text-[10px] text-muted-foreground">{view.city || 'Desconhecido'}, {view.country || 'BR'}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        {format(parseISO(view.created_at), 'HH:mm (dd/MM)')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
