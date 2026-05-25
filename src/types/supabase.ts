export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          age: number | null;
          state: string | null;
          city: string | null;
          employer_name: string | null;
          employer_state: string | null;
          is_remote: boolean | null;
          lifestyle_tier: string | null;
          housing_type: string | null;
          gross_annual_salary: number | null;
          pay_frequency: string | null;
          filing_status: string | null;
          contribution_pct_401k: number | null;
          employer_match_pct: number | null;
          employer_match_cap_pct: number | null;
          monthly_rent: number | null;
          monthly_car: number | null;
          monthly_insurance: number | null;
          monthly_student_loans: number | null;
          monthly_food: number | null;
          monthly_utilities: number | null;
          monthly_fun: number | null;
          monthly_travel: number | null;
          other_monthly_expenses: number | null;
          emergency_fund_months: number | null;
          current_investment_balance: number | null;
          expected_annual_return: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          age?: number | null;
          state?: string | null;
          city?: string | null;
          employer_name?: string | null;
          employer_state?: string | null;
          is_remote?: boolean | null;
          lifestyle_tier?: string | null;
          housing_type?: string | null;
          gross_annual_salary?: number | null;
          pay_frequency?: string | null;
          filing_status?: string | null;
          contribution_pct_401k?: number | null;
          employer_match_pct?: number | null;
          employer_match_cap_pct?: number | null;
          monthly_rent?: number | null;
          monthly_car?: number | null;
          monthly_insurance?: number | null;
          monthly_student_loans?: number | null;
          monthly_food?: number | null;
          monthly_utilities?: number | null;
          monthly_fun?: number | null;
          monthly_travel?: number | null;
          other_monthly_expenses?: number | null;
          emergency_fund_months?: number | null;
          current_investment_balance?: number | null;
          expected_annual_return?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          age?: number | null;
          state?: string | null;
          city?: string | null;
          employer_name?: string | null;
          employer_state?: string | null;
          is_remote?: boolean | null;
          lifestyle_tier?: string | null;
          housing_type?: string | null;
          gross_annual_salary?: number | null;
          pay_frequency?: string | null;
          filing_status?: string | null;
          contribution_pct_401k?: number | null;
          employer_match_pct?: number | null;
          employer_match_cap_pct?: number | null;
          monthly_rent?: number | null;
          monthly_car?: number | null;
          monthly_insurance?: number | null;
          monthly_student_loans?: number | null;
          monthly_food?: number | null;
          monthly_utilities?: number | null;
          monthly_fun?: number | null;
          monthly_travel?: number | null;
          other_monthly_expenses?: number | null;
          emergency_fund_months?: number | null;
          current_investment_balance?: number | null;
          expected_annual_return?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
