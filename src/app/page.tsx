import { DueItemsList } from '@/components/dashboard/DueItemsList'
import { Card } from '@/components/ui/Card'
import type { DashboardResponse } from '@/types'

// Busca dados diretamente no servidor (Server Component, sem waterfall)
async function getDueItems(): Promise<DashboardResponse> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${appUrl}/api/dashboard`, {
      cache: 'no-store', // Sempre busca dados frescos
    })
    if (!res.ok) throw new Error('Falha ao buscar dashboard')
    return res.json()
  } catch {
    return { items: [], totalDue: 0, hardCount: 0 }
  }
}

export default async function DashboardPage() {
  const { items, totalDue, hardCount } = await getDueItems()

  return (
    <div>
      {/* Cabeçalho do dashboard */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Painel de Revisão</h1>
        <p className="text-gray-500 text-sm mt-1">
          Revise os conteúdos de hoje para consolidar o aprendizado
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-700">{totalDue}</p>
          <p className="text-xs text-gray-500 mt-1">Para revisar hoje</p>
        </Card>

        <Card className="text-center">
          <p className={`text-3xl font-bold ${hardCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {hardCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">Urgentes (Difícil)</p>
        </Card>

        <Card className="text-center col-span-2 md:col-span-1">
          <p className="text-3xl font-bold text-gray-700">
            {totalDue - hardCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">Fácil + Médio</p>
        </Card>
      </div>

      {/* Lista de itens para revisão */}
      <DueItemsList items={items} />
    </div>
  )
}
