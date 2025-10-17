export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          severity: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          severity?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          severity?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      benefits: {
        Row: {
          benefit_type: string
          coverage_end_date: string | null
          coverage_start_date: string | null
          created_at: string
          employee_contribution: number | null
          employee_id: string
          employer_contribution: number | null
          id: string
          plan_name: string | null
          provider: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          benefit_type: string
          coverage_end_date?: string | null
          coverage_start_date?: string | null
          created_at?: string
          employee_contribution?: number | null
          employee_id: string
          employer_contribution?: number | null
          id?: string
          plan_name?: string | null
          provider?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          benefit_type?: string
          coverage_end_date?: string | null
          coverage_start_date?: string | null
          created_at?: string
          employee_contribution?: number | null
          employee_id?: string
          employer_contribution?: number | null
          id?: string
          plan_name?: string | null
          provider?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string
          document_name: string
          document_type: string
          expiry_date: string | null
          file_path: string | null
          id: string
          notes: string | null
          upload_date: string
        }
        Insert: {
          client_id: string
          created_at?: string
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          upload_date?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_goals: {
        Row: {
          client_id: string
          created_at: string
          current_amount: number | null
          goal_name: string
          goal_type: string
          id: string
          monthly_contribution: number | null
          notes: string | null
          priority: string | null
          status: string | null
          target_amount: number | null
          target_date: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          current_amount?: number | null
          goal_name: string
          goal_type: string
          id?: string
          monthly_contribution?: number | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          target_amount?: number | null
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          current_amount?: number | null
          goal_name?: string
          goal_type?: string
          id?: string
          monthly_contribution?: number | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          target_amount?: number | null
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_meetings: {
        Row: {
          action_items: string[] | null
          agenda: string[] | null
          client_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          location: string | null
          meeting_date: string
          meeting_type: string
          next_meeting_date: string | null
          notes: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          action_items?: string[] | null
          agenda?: string[] | null
          client_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_type: string
          next_meeting_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          action_items?: string[] | null
          agenda?: string[] | null
          client_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_type?: string
          next_meeting_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          annual_income: number | null
          aum: number | null
          client_id: string
          created_at: string
          date_of_birth: string | null
          email: string
          id: string
          investment_experience: string | null
          investment_objectives: string[] | null
          last_contact_date: string | null
          liquidity_needs: string | null
          name: string
          net_worth: number | null
          notes: string | null
          occupation: string | null
          phone: string | null
          risk_profile: string | null
          status: string | null
          time_horizon: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          annual_income?: number | null
          aum?: number | null
          client_id: string
          created_at?: string
          date_of_birth?: string | null
          email: string
          id?: string
          investment_experience?: string | null
          investment_objectives?: string[] | null
          last_contact_date?: string | null
          liquidity_needs?: string | null
          name: string
          net_worth?: number | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          risk_profile?: string | null
          status?: string | null
          time_horizon?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          annual_income?: number | null
          aum?: number | null
          client_id?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string
          id?: string
          investment_experience?: string | null
          investment_objectives?: string[] | null
          last_contact_date?: string | null
          liquidity_needs?: string | null
          name?: string
          net_worth?: number | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          risk_profile?: string | null
          status?: string | null
          time_horizon?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      compliance_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          employee_id: string | null
          expiry_date: string | null
          file_path: string | null
          id: string
          notes: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          employee_id?: string | null
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          employee_id?: string | null
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_contact_data: {
        Row: {
          column_id: string
          contact_id: string
          created_at: string
          id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          column_id: string
          contact_id: string
          created_at?: string
          id?: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          column_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contact_data_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "crm_custom_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contact_data_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          priority: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_custom_columns: {
        Row: {
          column_name: string
          column_options: Json | null
          column_order: number | null
          column_type: string
          created_at: string
          id: string
          is_required: boolean | null
          updated_at: string
        }
        Insert: {
          column_name: string
          column_options?: Json | null
          column_order?: number | null
          column_type: string
          created_at?: string
          id?: string
          is_required?: boolean | null
          updated_at?: string
        }
        Update: {
          column_name?: string
          column_options?: Json | null
          column_order?: number | null
          column_type?: string
          created_at?: string
          id?: string
          is_required?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_interactions: {
        Row: {
          contact_id: string
          created_at: string
          description: string | null
          id: string
          interaction_date: string
          interaction_type: string
          outcome: string | null
          subject: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          description?: string | null
          id?: string
          interaction_date?: string
          interaction_type: string
          outcome?: string | null
          subject?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          description?: string | null
          id?: string
          interaction_date?: string
          interaction_type?: string
          outcome?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      cyber_risk_assessments: {
        Row: {
          assessment_name: string
          assigned_to: string | null
          category: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          impact_score: number | null
          likelihood_score: number | null
          mitigation_status: string | null
          risk_level: string | null
          updated_at: string
        }
        Insert: {
          assessment_name: string
          assigned_to?: string | null
          category: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          impact_score?: number | null
          likelihood_score?: number | null
          mitigation_status?: string | null
          risk_level?: string | null
          updated_at?: string
        }
        Update: {
          assessment_name?: string
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          impact_score?: number | null
          likelihood_score?: number | null
          mitigation_status?: string | null
          risk_level?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          account_number_encrypted: string | null
          address: string | null
          bank_name: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          email: string
          employee_id: string
          employment_type: string | null
          first_name: string
          hire_date: string
          id: string
          last_name: string
          pay_frequency: string | null
          pay_rate: number
          phone: string | null
          position: string | null
          routing_number_encrypted: string | null
          ssn_encrypted: string | null
          state: string | null
          status: string | null
          termination_date: string | null
          updated_at: string
          user_id: string | null
          zip: string | null
        }
        Insert: {
          account_number_encrypted?: string | null
          address?: string | null
          bank_name?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email: string
          employee_id: string
          employment_type?: string | null
          first_name: string
          hire_date: string
          id?: string
          last_name: string
          pay_frequency?: string | null
          pay_rate: number
          phone?: string | null
          position?: string | null
          routing_number_encrypted?: string | null
          ssn_encrypted?: string | null
          state?: string | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
          zip?: string | null
        }
        Update: {
          account_number_encrypted?: string | null
          address?: string | null
          bank_name?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string
          employee_id?: string
          employment_type?: string | null
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          pay_frequency?: string | null
          pay_rate?: number
          phone?: string | null
          position?: string | null
          routing_number_encrypted?: string | null
          ssn_encrypted?: string | null
          state?: string | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          category: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          type: string
        }
        Insert: {
          category?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          type: string
        }
        Update: {
          category?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          mfa_enabled: boolean | null
          mfa_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payroll_items: {
        Row: {
          created_at: string
          employee_id: string
          federal_tax: number | null
          gross_pay: number
          health_insurance: number | null
          hours_worked: number | null
          id: string
          medicare: number | null
          net_pay: number
          other_deductions: number | null
          payroll_run_id: string
          retirement_401k: number | null
          social_security: number | null
          state_tax: number | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          federal_tax?: number | null
          gross_pay: number
          health_insurance?: number | null
          hours_worked?: number | null
          id?: string
          medicare?: number | null
          net_pay: number
          other_deductions?: number | null
          payroll_run_id: string
          retirement_401k?: number | null
          social_security?: number | null
          state_tax?: number | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          federal_tax?: number | null
          gross_pay?: number
          health_insurance?: number | null
          hours_worked?: number | null
          id?: string
          medicare?: number | null
          net_pay?: number
          other_deductions?: number | null
          payroll_run_id?: string
          retirement_401k?: number | null
          social_security?: number | null
          state_tax?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_items_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          created_at: string
          id: string
          pay_period_end: string
          pay_period_start: string
          payment_date: string
          processed_at: string | null
          processed_by: string | null
          run_date: string
          status: string | null
          total_gross: number | null
          total_net: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pay_period_end: string
          pay_period_start: string
          payment_date: string
          processed_at?: string | null
          processed_by?: string | null
          run_date: string
          status?: string | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pay_period_end?: string
          pay_period_start?: string
          payment_date?: string
          processed_at?: string | null
          processed_by?: string | null
          run_date?: string
          status?: string | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          allocation_percentage: number | null
          asset_name: string
          asset_type: string
          client_id: string
          created_at: string
          current_value: number | null
          id: string
          purchase_date: string | null
          purchase_price: number | null
          quantity: number | null
          symbol: string | null
          updated_at: string
        }
        Insert: {
          allocation_percentage?: number | null
          asset_name: string
          asset_type: string
          client_id: string
          created_at?: string
          current_value?: number | null
          id?: string
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number | null
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          allocation_percentage?: number | null
          asset_name?: string
          asset_type?: string
          client_id?: string
          created_at?: string
          current_value?: number | null
          id?: string
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number | null
          symbol?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_vault: {
        Row: {
          access_count: number | null
          category: string | null
          created_at: string
          encrypted_data: string
          id: string
          last_accessed: string | null
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_count?: number | null
          category?: string | null
          created_at?: string
          encrypted_data: string
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_count?: number | null
          category?: string | null
          created_at?: string
          encrypted_data?: string
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_policies: {
        Row: {
          compliance_frameworks: string[] | null
          created_at: string
          description: string | null
          id: string
          last_reviewed: string | null
          policy_name: string
          policy_type: string
          status: string | null
          updated_at: string
        }
        Insert: {
          compliance_frameworks?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          last_reviewed?: string | null
          policy_name: string
          policy_type: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          compliance_frameworks?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          last_reviewed?: string | null
          policy_name?: string
          policy_type?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tax_settings: {
        Row: {
          created_at: string
          federal_rate: number | null
          id: string
          medicare_rate: number | null
          social_security_rate: number | null
          state: string | null
          state_rate: number | null
          unemployment_rate: number | null
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          federal_rate?: number | null
          id?: string
          medicare_rate?: number | null
          social_security_rate?: number | null
          state?: string | null
          state_rate?: number | null
          unemployment_rate?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          federal_rate?: number | null
          id?: string
          medicare_rate?: number | null
          social_security_rate?: number | null
          state?: string | null
          state_rate?: number | null
          unemployment_rate?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      time_off_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          days_requested: number
          employee_id: string
          end_date: string
          id: string
          notes: string | null
          request_type: string
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested: number
          employee_id: string
          end_date: string
          id?: string
          notes?: string | null
          request_type: string
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested?: number
          employee_id?: string
          end_date?: string
          id?: string
          notes?: string | null
          request_type?: string
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_off_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "manager" | "analyst" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "manager", "analyst", "viewer"],
    },
  },
} as const
