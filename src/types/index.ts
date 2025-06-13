// 文件上传相关类型
export interface UploadFile {
  file_id: string
  filename: string
  file_size: number
  file_type: string
  upload_time: string
  is_converted: boolean
  pdf_path?: string
}

// 分析任务相关类型
export interface AnalysisProgress {
  current_step: string
  progress_percentage: number
  step_description: string
  estimated_remaining_time?: number
}

export interface AnalysisTask {
  task_id: string
  file_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: AnalysisProgress
  result?: AnalysisResult
  error_message?: string
  created_at: string
  updated_at: string
}

// 分析结果相关类型
export interface DocumentSource {
  page_number?: number
  section?: string
  paragraph?: string
  source_text?: string
}

export interface ExtractedField {
  value?: string
  source?: DocumentSource
  confidence?: number
  notes?: string
}

export interface QualificationCriteria {
  company_certifications: ExtractedField[]
  project_experience: ExtractedField[]
  team_requirements: ExtractedField[]
  other_requirements: ExtractedField[]
}

export interface BasicInformation {
  project_name: ExtractedField
  tender_number: ExtractedField
  budget_amount: ExtractedField
  bid_deadline: ExtractedField
  bid_opening_time: ExtractedField
  bid_bond_amount: ExtractedField
  bid_bond_account: ExtractedField
  purchaser_name: ExtractedField
  purchaser_contact: ExtractedField
  agent_name: ExtractedField
  agent_contact: ExtractedField
  qualification_criteria: QualificationCriteria
}

export interface ScoreComposition {
  technical_score: ExtractedField
  commercial_score: ExtractedField
  price_score: ExtractedField
  other_scores: ExtractedField[]
}

export interface ScoringItem {
  category: string
  item_name: string
  max_score?: number | string
  criteria?: string
  source?: DocumentSource
}

export interface ScoringCriteria {
  preliminary_review: ExtractedField[]
  evaluation_method: ExtractedField
  score_composition: ScoreComposition
  detailed_scoring: ScoringItem[]
  bonus_points: ExtractedField[]
  disqualification_clauses: ExtractedField[]
}

export interface OtherInformation {
  breach_liability: ExtractedField[]
  contract_terms: ExtractedField[]
  payment_terms: ExtractedField
  delivery_requirements: ExtractedField
  bid_validity: ExtractedField
  intellectual_property: ExtractedField
  confidentiality: ExtractedField
  risk_warnings: ExtractedField[]
}

export interface AnalysisResult {
  document_name: string
  analysis_time: string
  basic_information: BasicInformation
  scoring_criteria: ScoringCriteria
  other_information: OtherInformation
  processing_notes: string[]
}

// API响应类型
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// 错误类型
export interface ApiError {
  error_code: string
  error_message: string
  details?: Record<string, any>
  timestamp: string
}
