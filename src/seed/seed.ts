/**
 * Script de seed: popula disciplinas e conteúdos de exemplo.
 * Execute com: npm run seed
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../lib/db/schema'

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool, { schema })

  console.log('🌱 Inserindo disciplinas...')

  // Insere as 3 disciplinas de exemplo (ignora se já existirem)
  await db
    .insert(schema.disciplines)
    .values([
      { name: 'Direito Civil' },
      { name: 'Direito Penal' },
      { name: 'Direito Processual Civil' },
    ])
    .onConflictDoNothing()

  // Busca IDs das disciplinas para usar nas notas
  const [civil, penal, processual] = await db
    .select()
    .from(schema.disciplines)
    .orderBy(schema.disciplines.id)

  console.log('📝 Inserindo notas de exemplo...')

  // Insere notas de exemplo com nextReviewAt = agora (aparecem no dashboard)
  await db
    .insert(schema.contentItems)
    .values([
      {
        title: 'Contratos no Direito Civil: Princípios Fundamentais',
        type: 'note',
        body: `# Contratos no Direito Civil

## Princípios Fundamentais

Os contratos são acordos de vontade entre duas ou mais partes, destinados a criar, modificar ou extinguir obrigações.

### Princípio da Autonomia da Vontade
As partes são livres para pactuar o que quiserem, desde que não contrariem a lei, a ordem pública e os bons costumes.

### Princípio da Boa-Fé Objetiva
Art. 422 do CC: "Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa-fé."

### Princípio do Pacta Sunt Servanda
O contrato faz lei entre as partes. Uma vez celebrado validamente, deve ser cumprido.

### Requisitos de Validade
- **Agente capaz**: partes com capacidade jurídica
- **Objeto lícito, possível e determinado**
- **Forma prescrita ou não defesa em lei**

> **Dica de revisão**: Associe cada princípio a um artigo do Código Civil!`,
        disciplineId: civil?.id,
        difficulty: 'hard',
        nextReviewAt: new Date(), // Aparece imediatamente no dashboard
      },
      {
        title: 'Crimes contra o Patrimônio: Furto e Roubo',
        type: 'note',
        body: `# Crimes contra o Patrimônio

## Furto (Art. 155 CP)
Subtrair coisa alheia móvel para si ou para outrem.
- **Pena**: reclusão de 1 a 4 anos + multa

### Furto Qualificado (Art. 155, §4º)
- Destruição ou rompimento de obstáculo
- Abuso de confiança, fraude ou escalada
- Emprego de chave falsa
- Concurso de duas ou mais pessoas

## Roubo (Art. 157 CP)
Subtrair coisa alheia móvel mediante violência ou grave ameaça.
- **Pena**: reclusão de 4 a 10 anos + multa

### Diferença Principal
No **furto** não há violência ou ameaça. No **roubo** há emprego de violência ou grave ameaça à pessoa.

### Latrocínio (Art. 157, §3º, II)
Roubo seguido de morte. Crime hediondo.
- **Pena**: reclusão de 20 a 30 anos`,
        disciplineId: penal?.id,
        difficulty: 'medium',
        nextReviewAt: new Date(),
      },
      {
        title: 'Processo de Conhecimento: Fases e Prazos',
        type: 'note',
        body: `# Processo de Conhecimento no CPC/2015

## Fases do Processo

### 1. Postulatória
- Petição inicial (art. 319 CPC)
- Citação do réu (prazo: 15 dias para contestar)
- Contestação e reconvenção

### 2. Saneamento e Organização
- Audiência de conciliação/mediação (art. 334 CPC)
- Decisão de saneamento
- Especificação de provas

### 3. Instrutória
- Produção de provas
- Audiência de instrução e julgamento

### 4. Decisória
- Sentença (art. 489 CPC)

## Prazos Importantes
| Ato | Prazo |
|-----|-------|
| Contestação | 15 dias úteis |
| Recurso de apelação | 15 dias úteis |
| Agravo de instrumento | 15 dias úteis |
| Embargos de declaração | 5 dias úteis |

> **Atenção**: O CPC/2015 adotou contagem em **dias úteis** para a maioria dos prazos!`,
        disciplineId: processual?.id,
        difficulty: 'easy',
        nextReviewAt: new Date(),
      },
    ])
    .onConflictDoNothing()

  console.log('✅ Seed concluído com sucesso!')
  await pool.end()
}

main().catch((err) => {
  console.error('❌ Erro no seed:', err)
  process.exit(1)
})
