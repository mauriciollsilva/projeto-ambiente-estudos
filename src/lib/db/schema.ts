import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  uuid,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Tabela de disciplinas (ex: Direito Civil, Direito Penal)
export const disciplines = pgTable('disciplines', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Tabela unificada de conteúdo (notas Markdown e PDFs)
export const contentItems = pgTable(
  'content_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 500 }).notNull(),
    // 'note' para notas Markdown, 'pdf' para arquivos PDF
    type: varchar('type', { length: 10 }).notNull().default('note'),
    // Conteúdo Markdown (apenas para notas)
    body: text('body'),
    // Caminho no disco para o arquivo PDF
    filePath: varchar('file_path', { length: 1000 }),
    // Texto extraído do PDF para exibição na tela de leitura
    extractedText: text('extracted_text'),
    disciplineId: integer('discipline_id').references(() => disciplines.id, {
      onDelete: 'set null',
    }),

    // --- Campos SRS (Repetição Espaçada) ---
    // Último nível de dificuldade avaliado
    difficulty: varchar('difficulty', { length: 10 }).default('medium'),
    // Contador de revisões realizadas
    reviewCount: integer('review_count').default(0).notNull(),
    // Data da última revisão
    lastReviewedAt: timestamp('last_reviewed_at'),
    // Data da próxima revisão agendada (base do dashboard)
    nextReviewAt: timestamp('next_review_at').default(sql`NOW()`).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // Índice para acelerar a query do dashboard (WHERE next_review_at <= NOW())
    nextReviewIdx: index('idx_content_items_next_review').on(table.nextReviewAt),
  })
)

// Histórico de todas as revisões realizadas (log de auditoria)
export const reviewHistory = pgTable('review_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentItemId: uuid('content_item_id')
    .notNull()
    .references(() => contentItems.id, { onDelete: 'cascade' }),
  difficulty: varchar('difficulty', { length: 10 }).notNull(),
  reviewedAt: timestamp('reviewed_at').defaultNow().notNull(),
  nextReviewAt: timestamp('next_review_at').notNull(),
})

// Tipos TypeScript inferidos do schema (usados em todo o app)
export type Discipline = typeof disciplines.$inferSelect
export type ContentItem = typeof contentItems.$inferSelect
export type ReviewHistory = typeof reviewHistory.$inferSelect
export type NewContentItem = typeof contentItems.$inferInsert
export type NewDiscipline = typeof disciplines.$inferInsert
