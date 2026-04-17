// Re-exporta tipos inferidos do schema do banco de dados
export type {
  Discipline,
  ContentItem,
  ReviewHistory,
  NewContentItem,
  NewDiscipline,
} from '@/lib/db/schema'

// ContentItem enriquecido com o nome da disciplina (usado no dashboard e listas)
export interface ContentItemWithDiscipline {
  id: string
  title: string
  type: string
  body: string | null
  filePath: string | null
  extractedText: string | null
  disciplineId: number | null
  disciplineName: string | null
  difficulty: string | null
  reviewCount: number
  lastReviewedAt: Date | null
  nextReviewAt: Date
  createdAt: Date
  updatedAt: Date
}

// Resposta da API do dashboard
export interface DashboardResponse {
  items: ContentItemWithDiscipline[]
  totalDue: number
  hardCount: number
}

// Corpo da requisição de revisão SRS
export interface ReviewRequest {
  difficulty: 'easy' | 'medium' | 'hard'
}

// Resposta da API de revisão
export interface ReviewResponse {
  success: boolean
  nextReviewAt: string
  difficulty: string
}

export type SrsDifficulty = 'easy' | 'medium' | 'hard'
