# 📊 Ajuste de Métricas do Dashboard - MedX

**Data:** 2025-10-28  
**Autor:** Sistema MedX  
**Status:** ✅ Concluído

---

## 🎯 Objetivo

Ajustar as métricas do dashboard para mostrar **valores reais** do banco de dados, substituindo valores mockados/estáticos por dados dinâmicos consultados diretamente via Supabase.

---

## 📋 O Que Foi Feito

### 1️⃣ **Criação do Hook Customizado** (`useDashboardMetrics`)

**Arquivo:** `src/hooks/useDashboardMetrics.ts`

✅ Hook React que busca todas as métricas do dashboard em tempo real  
✅ Implementa fallback manual caso a function RPC não exista  
✅ Calcula tendências comparando mês atual vs. mês anterior  
✅ Retorna estado de loading e erro para UX adequada

**Métricas Disponíveis:**
- Consultas hoje
- Consultas mês atual vs. anterior
- Pacientes CRM (total e novos este mês)
- Pré-pacientes
- Equipe médica (médicos + secretárias)
- Mensagens WhatsApp (hoje e mês)
- Follow-ups pendentes
- Prontuários criados
- Consultas IA

---

### 2️⃣ **Atualização do Dashboard** (`src/pages/Dashboard.tsx`)

**Antes:**
- Usava `useRealtimeList` para buscar dados brutos
- Calculava métricas no componente (não otimizado)
- Trends fixos em `+0%`
- Apenas 4 métricas básicas

**Depois:**
- Usa `useDashboardMetrics` para buscar dados otimizados
- **8 métricas relevantes** com dados reais
- Trends calculados dinamicamente com comparação mensal
- Loading state durante carregamento
- Descrições contextualizadas para cada métrica

**Novas Métricas Adicionadas:**
```typescript
✅ Equipe Médica (médicos + secretárias)
✅ Mensagens WhatsApp (hoje + mês)
✅ Follow-ups Pendentes
✅ Prontuários Criados
✅ Consultas IA (agentes utilizados)
```

---

### 3️⃣ **Migration: Function PostgreSQL Otimizada**

**Arquivo:** `migrations/25º_Migration_create_dashboard_metrics_function.sql`

**Function:** `get_dashboard_metrics()`

✅ Retorna **todas as métricas em uma única consulta** (performance otimizada)  
✅ Usa `SECURITY DEFINER` para garantir permissões adequadas  
✅ Calcula automaticamente datas (hoje, mês atual, mês anterior)  
✅ Retorna dados tipados com precisão (BIGINT)

**Vantagens:**
- ⚡ **Performance:** 1 consulta ao invés de 14 consultas separadas
- 🔒 **Segurança:** Execução com permissões controladas
- 🧹 **Manutenibilidade:** Lógica de negócio centralizada no banco
- 📊 **Consistência:** Garantia de dados consistentes em uma transação

---

## 📊 Dados Reais Retornados (Exemplo Atual)

```json
{
  "consultas_hoje": 0,
  "consultas_mes_atual": 0,
  "consultas_mes_anterior": 0,
  "total_pacientes_crm": 1,
  "pacientes_mes_atual": 1,
  "pacientes_mes_anterior": 0,
  "total_pre_pacientes": 0,
  "total_medicos": 4,
  "total_secretarias": 2,
  "mensagens_hoje": 0,
  "mensagens_mes_atual": 0,
  "followups_pendentes": 0,
  "prontuarios_criados": 1,
  "consultas_ia": 0
}
```

---

## 🎨 Visual das Métricas no Dashboard

### Cards de Métricas (Magic Bento Grid - 8 cards)

1. **Consultas Hoje**
   - Valor: Número de consultas agendadas para hoje
   - Trend: % comparado com consultas do mês vs. mês anterior
   - Ícone: Calendar

2. **Pacientes CRM**
   - Valor: Total de pacientes cadastrados
   - Trend: % de novos pacientes este mês
   - Ícone: Users

3. **Pré Pacientes**
   - Valor: Leads aguardando conversão
   - Trend: Não aplicável
   - Ícone: Activity

4. **Equipe Médica**
   - Valor: Número de médicos ativos
   - Trend: Número de secretárias (ex: "+2 sec.")
   - Ícone: Stethoscope

5. **Mensagens WhatsApp**
   - Valor: Mensagens enviadas/recebidas hoje
   - Trend: Total de mensagens no mês
   - Ícone: MessageSquare

6. **Follow-ups Pendentes**
   - Valor: Follow-ups aguardando ação
   - Trend: Não aplicável
   - Ícone: ClipboardList

7. **Prontuários**
   - Valor: Total de prontuários criados
   - Trend: Não aplicável
   - Ícone: FileText

8. **Consultas IA**
   - Valor: Total de consultas aos agentes de IA
   - Trend: Não aplicável
   - Ícone: TrendingUp

---

## 🧮 Cálculo de Tendências

**Lógica Implementada:**

```typescript
const calculateTrend = (current: number, previous: number): string => {
  if (previous === 0 && current === 0) return '0%';
  if (previous === 0) return '+100%';
  
  const diff = ((current - previous) / previous) * 100;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${Math.round(diff)}%`;
}
```

**Cores:**
- Verde (`text-green-500`): Trends positivos (+)
- Vermelho (`text-red-500`): Trends negativos (-)
- Cinza (`text-muted-foreground`): Trends neutros (—)

---

## 🔄 Fluxo de Dados

```mermaid
graph LR
    A[Dashboard Component] --> B[useDashboardMetrics Hook]
    B --> C{RPC Function Exists?}
    C -->|Yes| D[get_dashboard_metrics()]
    C -->|No| E[Fallback: Manual Queries]
    D --> F[Supabase Database]
    E --> F
    F --> G[Return Metrics]
    G --> H[Calculate Trends]
    H --> I[Update UI]
```

---

## ✅ Validação e Testes

### Testes Realizados via MCP:

1. ✅ **Conexão com banco de dados:** OK
2. ✅ **Listagem de tabelas:** 24 tabelas identificadas
3. ✅ **Consulta manual de métricas:** Dados corretos
4. ✅ **Aplicação da migration:** Sucesso
5. ✅ **Teste da function `get_dashboard_metrics()`:** Retornando dados esperados

### Teste da Function:

```sql
SELECT * FROM get_dashboard_metrics();
```

**Resultado:** ✅ Retorna todas as 14 métricas corretamente

---

## 📁 Arquivos Criados/Modificados

### Criados:
- ✅ `src/hooks/useDashboardMetrics.ts`
- ✅ `migrations/25º_Migration_create_dashboard_metrics_function.sql`
- ✅ `AJUSTE_METRICAS_DASHBOARD_2025-10-28.md` (este arquivo)

### Modificados:
- ✅ `src/pages/Dashboard.tsx`

---

## 🚀 Como Usar

### No Frontend:

```typescript
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

function Dashboard() {
  const metrics = useDashboardMetrics();
  
  return (
    <div>
      <h1>Consultas Hoje: {metrics.consultasHoje}</h1>
      <p>Trend: {metrics.calculateTrend(metrics.consultasMesAtual, metrics.consultasMesAnterior)}</p>
      <button onClick={metrics.refresh}>Atualizar</button>
    </div>
  );
}
```

### No Banco de Dados:

```sql
-- Buscar todas as métricas em uma única query
SELECT * FROM get_dashboard_metrics();
```

---

## 🎓 Lições Aprendidas

1. **Performance:** Functions PostgreSQL são muito mais eficientes que múltiplas consultas
2. **Manutenibilidade:** Lógica de negócio no banco facilita atualizações
3. **Fallback:** Sempre implementar fallback manual para garantir funcionamento
4. **UX:** Loading states e tratamento de erros são essenciais
5. **Trends:** Comparações mensais são mais úteis que valores absolutos

---

## 📝 Próximos Passos Sugeridos

- [ ] Implementar cache das métricas (ex: React Query)
- [ ] Adicionar filtros por período (semana, mês, ano)
- [ ] Criar gráfico de evolução mensal
- [ ] Implementar notificações para métricas críticas
- [ ] Exportar relatórios em PDF/Excel
- [ ] Adicionar comparação anual (ano vs. ano)

---

## 🔗 Referências

- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL SECURITY DEFINER](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [React Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

**✅ Sistema de Métricas implementado com sucesso!**

Todas as métricas agora refletem **dados reais** do banco de dados, com trends calculados dinamicamente e performance otimizada.


