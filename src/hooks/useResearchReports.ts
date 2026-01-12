import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ResearchReport {
  id: string;
  asset_type: 'fund' | 'etf' | 'stock' | 'crypto';
  asset_id: string;
  asset_name: string;
  asset_symbol: string | null;
  fundamental_analysis: any;
  quality_analysis: any;
  valuation_analysis: any;
  risk_analysis: any;
  performance_analysis: any;
  governance_analysis: any;
  esg_analysis: any;
  portfolio_role: any;
  scenario_analysis: any;
  model_governance: any;
  overall_quality_score: number | null;
  risk_score: number | null;
  valuation_score: number | null;
  esg_score: number | null;
  data_sources: string[] | null;
  confidence_level: 'high' | 'medium' | 'low' | null;
  material_changes: string[] | null;
  last_significant_change: string | null;
  version: number;
  generated_at: string;
  data_as_of: string;
  created_at: string;
  updated_at: string;
}

export interface ResearchChangeLog {
  id: string;
  report_id: string;
  asset_type: string;
  asset_id: string;
  change_type: string;
  change_summary: string;
  previous_values: any;
  new_values: any;
  significance: 'material' | 'moderate' | 'minor' | null;
  created_at: string;
}

export function useResearchReports() {
  const [reports, setReports] = useState<ResearchReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(null);
  const [changeLogs, setChangeLogs] = useState<ResearchChangeLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = useCallback(async (assetType?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('asset_research_reports')
        .select('*')
        .order('generated_at', { ascending: false });

      if (assetType) {
        query = query.eq('asset_type', assetType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data as ResearchReport[]);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load research reports');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReportById = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_research_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSelectedReport(data as ResearchReport);
      return data as ResearchReport;
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load research report');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReportByAsset = useCallback(async (assetType: string, assetId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_research_reports')
        .select('*')
        .eq('asset_type', assetType)
        .eq('asset_id', assetId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSelectedReport(data as ResearchReport);
      return data as ResearchReport | null;
    } catch (error) {
      console.error('Error fetching report:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchChangeLogs = useCallback(async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('research_change_log')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChangeLogs(data as ResearchChangeLog[]);
    } catch (error) {
      console.error('Error fetching change logs:', error);
    }
  }, []);

  const generateReport = useCallback(async (
    assetType: 'fund' | 'etf' | 'stock' | 'crypto',
    assetId: string,
    assetName: string,
    assetSymbol?: string,
    assetData?: any
  ) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-research-report', {
        body: {
          asset_type: assetType,
          asset_id: assetId,
          asset_name: assetName,
          asset_symbol: assetSymbol,
          asset_data: assetData || {},
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Research report generated for ${assetName}`);
      return data.report as ResearchReport;
    } catch (error) {
      console.error('Error generating report:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate report';
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateBulkReports = useCallback(async (
    assets: Array<{
      assetType: 'fund' | 'etf' | 'stock' | 'crypto';
      assetId: string;
      assetName: string;
      assetSymbol?: string;
      assetData?: any;
    }>
  ) => {
    setIsGenerating(true);
    const results: { success: number; failed: number } = { success: 0, failed: 0 };

    for (const asset of assets) {
      try {
        const report = await generateReport(
          asset.assetType,
          asset.assetId,
          asset.assetName,
          asset.assetSymbol,
          asset.assetData
        );
        if (report) {
          results.success++;
        } else {
          results.failed++;
        }
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        results.failed++;
      }
    }

    setIsGenerating(false);
    toast.success(`Generated ${results.success} reports, ${results.failed} failed`);
    return results;
  }, [generateReport]);

  return {
    reports,
    selectedReport,
    changeLogs,
    isLoading,
    isGenerating,
    fetchReports,
    fetchReportById,
    fetchReportByAsset,
    fetchChangeLogs,
    generateReport,
    generateBulkReports,
    setSelectedReport,
  };
}
