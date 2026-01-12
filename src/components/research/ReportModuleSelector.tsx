import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, Star, AlertTriangle, Lightbulb } from 'lucide-react';

export interface ReportModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: number;
}

const REPORT_MODULES: ReportModule[] = [
  {
    id: 'asset-research',
    title: 'Asset Research Report',
    description: 'Full single-asset research including fundamentals, risk profile, performance diagnostics, and scenario analysis.',
    icon: <FileText className="h-5 w-5" />,
    priority: 1,
  },
  {
    id: 'weekly-risk',
    title: 'Weekly Risk Monitor',
    description: 'Short-form monitoring report covering market risk environment, volatility observations, and key risk drivers.',
    icon: <Shield className="h-5 w-5" />,
    priority: 2,
  },
  {
    id: 'monthly-quality',
    title: 'Monthly Asset Quality Review',
    description: 'Quality-focused review including improving/deteriorating signals and cross-asset observations.',
    icon: <Star className="h-5 w-5" />,
    priority: 3,
  },
  {
    id: 'score-alerts',
    title: 'Score Change Alerts',
    description: 'Alert-style report summarizing material score changes with explanations and implications.',
    icon: <AlertTriangle className="h-5 w-5" />,
    priority: 4,
  },
  {
    id: 'thematic-insight',
    title: 'Thematic Insight Notes',
    description: 'Thematic research notes covering strategic relevance, sector exposure, and historical context.',
    icon: <Lightbulb className="h-5 w-5" />,
    priority: 5,
  },
];

interface ReportModuleSelectorProps {
  selectedModules: string[];
  onModulesChange: (modules: string[]) => void;
}

export function ReportModuleSelector({ selectedModules, onModulesChange }: ReportModuleSelectorProps) {
  const toggleModule = (moduleId: string) => {
    if (selectedModules.includes(moduleId)) {
      onModulesChange(selectedModules.filter(id => id !== moduleId));
    } else {
      // Add in priority order
      const newModules = [...selectedModules, moduleId].sort((a, b) => {
        const aModule = REPORT_MODULES.find(m => m.id === a);
        const bModule = REPORT_MODULES.find(m => m.id === b);
        return (aModule?.priority || 0) - (bModule?.priority || 0);
      });
      onModulesChange(newModules);
    }
  };

  const selectAll = () => {
    onModulesChange(REPORT_MODULES.map(m => m.id));
  };

  const clearAll = () => {
    onModulesChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Select Report Modules</h3>
          <p className="text-sm text-muted-foreground">
            Choose the modules to include in your research report
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-sm text-primary hover:underline"
          >
            Select All
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={clearAll}
            className="text-sm text-muted-foreground hover:underline"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {REPORT_MODULES.map((module) => {
          const isSelected = selectedModules.includes(module.id);
          const orderIndex = selectedModules.indexOf(module.id);

          return (
            <Card
              key={module.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                  : 'hover:border-muted-foreground/30'
              }`}
              onClick={() => toggleModule(module.id)}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleModule(module.id)}
                  className="mt-1"
                />
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {module.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{module.title}</h4>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">
                        #{orderIndex + 1}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {module.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedModules.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Report Assembly Order:</p>
          <div className="flex flex-wrap gap-2">
            {selectedModules.map((moduleId, index) => {
              const module = REPORT_MODULES.find(m => m.id === moduleId);
              return (
                <Badge key={moduleId} variant="outline" className="gap-1">
                  <span className="font-bold">{index + 1}.</span>
                  {module?.title}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { REPORT_MODULES };
