import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from "@/hooks/useAnalytics";

interface EngagementChartProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
}

export const EngagementChart = ({ title, subtitle, data }: EngagementChartProps) => {
  const hasData = data.length > 0 && data.some(d => d.followers > 0 || d.engagement > 0 || d.likes > 0);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Engagement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Likes</span>
          </div>
        </div>
      </div>
      
      <div className="h-[280px]">
        {!hasData ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">No data yet</p>
              <p className="text-sm">Connect an Instagram account to see analytics</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(340, 82%, 52%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(340, 82%, 52%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(280, 70%, 50%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(280, 70%, 50%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px -10px hsl(var(--foreground) / 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--card-foreground))', fontWeight: 600 }}
                itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <Area 
                type="monotone" 
                dataKey="followers" 
                stroke="hsl(340, 82%, 52%)" 
                fillOpacity={1} 
                fill="url(#colorFollowers)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="engagement" 
                stroke="hsl(280, 70%, 50%)" 
                fillOpacity={1} 
                fill="url(#colorEngagement)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="likes" 
                stroke="hsl(142, 76%, 36%)" 
                fillOpacity={1} 
                fill="url(#colorLikes)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
