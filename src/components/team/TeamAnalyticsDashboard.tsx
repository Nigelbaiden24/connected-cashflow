import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface TeamAnalyticsDashboardProps {
  members: any[];
}

export function TeamAnalyticsDashboard({ members }: TeamAnalyticsDashboardProps) {
  // Department distribution
  const departmentData = members.reduce((acc: any, member) => {
    acc[member.department] = (acc[member.department] || 0) + 1;
    return acc;
  }, {});

  const departmentChartData = Object.entries(departmentData).map(([name, value]) => ({
    name,
    value
  }));

  // Status distribution
  const statusData = members.reduce((acc: any, member) => {
    acc[member.status] = (acc[member.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name,
    value
  }));

  // Workload distribution
  const workloadData = [
    { range: '0-20%', count: members.filter(m => m.workload_score <= 20).length },
    { range: '21-40%', count: members.filter(m => m.workload_score > 20 && m.workload_score <= 40).length },
    { range: '41-60%', count: members.filter(m => m.workload_score > 40 && m.workload_score <= 60).length },
    { range: '61-80%', count: members.filter(m => m.workload_score > 60 && m.workload_score <= 80).length },
    { range: '81-100%', count: members.filter(m => m.workload_score > 80).length },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team by Department</CardTitle>
          <CardDescription>Distribution across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workload Distribution</CardTitle>
          <CardDescription>Members by workload level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workloadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem"
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}