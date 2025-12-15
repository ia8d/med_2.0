# 📊 Implementação: Visão de Convênios por Médico

**Data:** 2025-10-14  
**Autor:** Sistema MedX  
**Status:** ✅ Implementado e Funcional

---

## 🎯 Objetivo

Criar uma página/tabela visual que mostra **todos os médicos** da clínica e os **convênios que cada um aceita**, permitindo ao owner e secretária ter uma visão consolidada de quais médicos atendem cada operadora/plano.

---

## 🗄️ Estrutura do Banco de Dados

### 1️⃣ VIEW: `v_doctors_insurance_coverage`

**Propósito:** Visão detalhada/expandida - uma linha para cada combinação médico + plano

```sql
CREATE OR REPLACE VIEW v_doctors_insurance_coverage AS
SELECT 
  u.id as doctor_id,
  u.email as doctor_email,
  u.raw_user_meta_data->>'name' as doctor_name,
  u.raw_user_meta_data->>'specialty' as doctor_specialty,
  ic.id as insurance_company_id,
  ic.name as insurance_company_name,
  ic.short_name as insurance_company_short_name,
  ip.id as insurance_plan_id,
  ip.name as insurance_plan_name,
  ip.plan_type,
  ip.coverage_type,
  cai.id as acceptance_id,
  cai.accepted_at,
  cai.is_active,
  cai.notes
FROM auth.users u
LEFT JOIN clinic_accepted_insurances cai ON cai.doctor_id = u.id AND cai.is_active = true
LEFT JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
LEFT JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE u.raw_user_meta_data->>'role' = 'doctor'
ORDER BY u.raw_user_meta_data->>'name', ic.name, ip.name;
```

**Campos Retornados:**
- `doctor_id`, `doctor_email`, `doctor_name`, `doctor_specialty`
- `insurance_company_id`, `insurance_company_name`, `insurance_company_short_name`
- `insurance_plan_id`, `insurance_plan_name`, `plan_type`, `coverage_type`
- `acceptance_id`, `accepted_at`, `is_active`, `notes`

**Exemplo de Resultado:**
| doctor_name | doctor_specialty | insurance_company_short_name | insurance_plan_name |
|-------------|------------------|------------------------------|---------------------|
| Dr. João | Cardiologia | Amil | Amil Fácil |
| Dr. João | Cardiologia | Unimed | Unimed Nacional |
| Dra. Maria | Pediatria | Bradesco | Bradesco Top |

---

### 2️⃣ VIEW: `v_doctors_summary`

**Propósito:** Visão consolidada/agregada - uma linha por médico com totais

```sql
CREATE OR REPLACE VIEW v_doctors_summary AS
SELECT 
  u.id as doctor_id,
  u.email as doctor_email,
  u.raw_user_meta_data->>'name' as doctor_name,
  u.raw_user_meta_data->>'specialty' as doctor_specialty,
  COUNT(DISTINCT ic.id) as total_insurance_companies,
  COUNT(cai.id) as total_insurance_plans,
  STRING_AGG(DISTINCT ic.short_name, ', ' ORDER BY ic.short_name) as insurance_companies,
  STRING_AGG(ic.short_name || ' - ' || ip.name, ', ' ORDER BY ic.short_name, ip.name) as insurance_plans_list
FROM auth.users u
LEFT JOIN clinic_accepted_insurances cai ON cai.doctor_id = u.id AND cai.is_active = true
LEFT JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
LEFT JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE u.raw_user_meta_data->>'role' = 'doctor'
GROUP BY u.id, u.email, u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'specialty'
ORDER BY u.raw_user_meta_data->>'name';
```

**Campos Retornados:**
- `doctor_id`, `doctor_email`, `doctor_name`, `doctor_specialty`
- `total_insurance_companies` - Número de operadoras distintas
- `total_insurance_plans` - Número total de planos aceitos
- `insurance_companies` - Lista de operadoras (ex: "Amil, Bradesco, Unimed")
- `insurance_plans_list` - Lista completa (ex: "Amil - Amil Fácil, Unimed - Nacional")

**Exemplo de Resultado:**
| doctor_name | specialty | total_companies | total_plans | insurance_companies | insurance_plans_list |
|-------------|-----------|-----------------|-------------|---------------------|----------------------|
| Dr. João | Cardiologia | 2 | 3 | Amil, Unimed | Amil - Fácil, Amil - One, Unimed - Nacional |
| Dra. Maria | Pediatria | 1 | 2 | Bradesco | Bradesco - Top, Bradesco - Nacional |

---

## 🖥️ Interface Frontend

### Página: `DoctorsInsurance.tsx`

**Localização:** `src/pages/DoctorsInsurance.tsx`

**Funcionalidades:**

1. **Cards de Estatísticas:**
   - Total de Médicos
   - Médicos com Convênios
   - Média de Planos por Médico

2. **Busca em Tempo Real:**
   - Filtra por nome do médico
   - Filtra por especialidade
   - Filtra por operadora/convênio

3. **Tabela Visual:**
   - Nome e email do médico
   - Especialidade (badge)
   - Número de operadoras (badge)
   - Número de planos (badge)
   - Lista de convênios aceitos

4. **Permissões:**
   - Acesso: `owner` e `secretary`
   - Médicos **não** têm acesso (eles usam a página `/convenios`)

---

## 🎨 Componentes Utilizados

```typescript
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
```

---

## 🚀 Fluxo de Dados

```
1. Usuário acessa /doctors-insurance (owner ou secretary)
                ↓
2. useEffect carrega dados da VIEW v_doctors_summary
                ↓
3. Supabase retorna lista de médicos com seus convênios
                ↓
4. Estado (doctors) é atualizado
                ↓
5. Tabela renderiza os dados
                ↓
6. Usuário pode buscar/filtrar em tempo real
```

---

## 📋 Menu e Roteamento

### Sidebar (`src/components/layout/Sidebar.tsx`)

```typescript
{ 
  path: '/doctors-insurance', 
  icon: FileSpreadsheet, 
  label: 'Visão de Convênios', 
  roles: ['owner', 'secretary'] 
}
```

### Rota (`src/App.tsx`)

```typescript
import DoctorsInsurance from "./pages/DoctorsInsurance";

<Route path="/doctors-insurance" element={<DoctorsInsurance />} />
```

---

## 🔍 Queries Úteis

### 1. Ver convênios de um médico específico:
```sql
SELECT * FROM v_doctors_insurance_coverage 
WHERE doctor_id = 'UUID_DO_MEDICO';
```

### 2. Ver resumo de todos os médicos:
```sql
SELECT * FROM v_doctors_summary;
```

### 3. Médicos que aceitam determinada operadora:
```sql
SELECT DISTINCT doctor_name, doctor_specialty
FROM v_doctors_insurance_coverage 
WHERE insurance_company_short_name = 'Amil';
```

### 4. Médicos SEM nenhum convênio:
```sql
SELECT doctor_name, doctor_email, doctor_specialty
FROM v_doctors_summary
WHERE total_insurance_plans = 0;
```

### 5. Estatísticas gerais:
```sql
SELECT 
  COUNT(*) as total_medicos,
  COUNT(CASE WHEN total_insurance_plans > 0 THEN 1 END) as medicos_com_convenio,
  ROUND(AVG(total_insurance_plans), 2) as media_planos_por_medico,
  MAX(total_insurance_plans) as max_planos
FROM v_doctors_summary;
```

### 6. Ranking de operadoras mais aceitas:
```sql
SELECT 
  insurance_company_short_name,
  COUNT(DISTINCT doctor_id) as total_medicos,
  COUNT(*) as total_planos_aceitos
FROM v_doctors_insurance_coverage
WHERE insurance_company_id IS NOT NULL
GROUP BY insurance_company_short_name
ORDER BY total_medicos DESC;
```

---

## 🎯 Diferenças Entre as Páginas

### `/convenios` (Página do Médico)
- **Usuários:** `owner`, `secretary`, `doctor`
- **Função:** Médico **seleciona** os convênios que **ele** aceita
- **Dados:** Filtrados por `doctor_id = user.id`
- **Ação:** Adicionar/remover convênios próprios

### `/doctors-insurance` (Visão Geral)
- **Usuários:** `owner`, `secretary`
- **Função:** Visualizar **todos os médicos** e seus convênios
- **Dados:** Todos os médicos da clínica
- **Ação:** Apenas visualização (read-only)

---

## 📊 Relacionamento das Tabelas

```
┌─────────────────┐
│   auth.users    │
│   (Médicos)     │
│   - id          │
│   - email       │
│   - metadata    │
└────────┬────────┘
         │
         │ doctor_id
         ▼
┌───────────────────────────┐
│ clinic_accepted_insurances│
│   - id                    │
│   - doctor_id       ◄─────┤
│   - insurance_plan_id     │
│   - is_active             │
└────────┬──────────────────┘
         │
         │ insurance_plan_id
         ▼
┌─────────────────────┐
│  insurance_plans    │
│   - id              │
│   - name            │
│   - company_id      │
└────────┬────────────┘
         │
         │ insurance_company_id
         ▼
┌──────────────────────┐
│ insurance_companies  │
│   - id               │
│   - name             │
│   - short_name       │
└──────────────────────┘
```

---

## ✅ Checklist de Implementação

- [x] Criar VIEW `v_doctors_insurance_coverage` no banco
- [x] Criar VIEW `v_doctors_summary` no banco
- [x] Criar componente `DoctorsInsurance.tsx`
- [x] Adicionar rota em `App.tsx`
- [x] Adicionar menu na `Sidebar.tsx`
- [x] Implementar cards de estatísticas
- [x] Implementar busca/filtro
- [x] Implementar tabela visual
- [x] Documentar migration (`31º_Migration_create_doctors_insurance_views.sql`)
- [x] Criar documentação completa

---

## 🎨 Layout da Página

```
┌─────────────────────────────────────────────────────┐
│ Médicos e Convênios                                 │
│ Visualize todos os médicos e os convênios aceitos   │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Total    │  │   Com    │  │  Média   │          │
│  │ Médicos  │  │ Convênios│  │  Planos  │          │
│  │    5     │  │     3    │  │   4.2    │          │
│  └──────────┘  └──────────┘  └──────────┘          │
├─────────────────────────────────────────────────────┤
│  [🔍 Buscar por médico, especialidade ou convênio]  │
├─────────────────────────────────────────────────────┤
│ Médico          │ Especialidade │ Operadoras │ ... │
├─────────────────┼───────────────┼────────────┼─────┤
│ Dr. João        │ Cardiologia   │     2      │ ... │
│ joao@email.com  │               │            │     │
├─────────────────┼───────────────┼────────────┼─────┤
│ Dra. Maria      │ Pediatria     │     1      │ ... │
│ maria@email.com │               │            │     │
└─────────────────┴───────────────┴────────────┴─────┘
```

---

## 🚀 Como Usar

### 1. Como Owner/Secretary:
```
1. Faça login como owner ou secretary
2. Clique no menu "Visão de Convênios"
3. Veja a lista de todos os médicos
4. Use a busca para encontrar informações específicas
5. Visualize estatísticas gerais no topo
```

### 2. Como Médico:
```
1. Faça login como doctor
2. Clique no menu "Convênios"
3. Selecione os convênios que você aceita
4. Suas escolhas aparecerão na "Visão de Convênios" para owner/secretary
```

---

## 📝 Notas Importantes

1. **VIEWs são read-only:** Não é possível inserir/atualizar diretamente na VIEW
2. **Dados em tempo real:** As VIEWs sempre mostram dados atualizados
3. **Permissões RLS:** As VIEWs respeitam as políticas RLS das tabelas base
4. **Especialidade:** Campo `specialty` vem de `auth.users.raw_user_meta_data`
5. **Médicos sem convênios:** Aparecem na lista com totalizadores zerados

---

## 🔧 Manutenção Futura

### Adicionar novos campos na VIEW:
```sql
-- Exemplo: adicionar telefone do médico
CREATE OR REPLACE VIEW v_doctors_summary AS
SELECT 
  -- ... campos existentes
  u.raw_user_meta_data->>'phone' as doctor_phone
FROM auth.users u
-- ... resto da query
```

### Criar novas VIEWs customizadas:
```sql
-- Exemplo: VIEW de operadoras mais populares
CREATE OR REPLACE VIEW v_popular_insurances AS
SELECT 
  ic.short_name,
  COUNT(DISTINCT cai.doctor_id) as doctors_count,
  COUNT(cai.id) as total_acceptances
FROM insurance_companies ic
JOIN insurance_plans ip ON ip.insurance_company_id = ic.id
JOIN clinic_accepted_insurances cai ON cai.insurance_plan_id = ip.id
WHERE cai.is_active = true
GROUP BY ic.id, ic.short_name
ORDER BY doctors_count DESC;
```

---

## 🎉 Conclusão

A funcionalidade de **Visão de Convênios** permite que gestores da clínica tenham uma visão consolidada e estratégica de quais médicos atendem cada convênio, facilitando:

- **Gestão de operadoras:** Saber quais médicos atendem cada plano
- **Planejamento:** Identificar gaps de cobertura
- **Comunicação:** Informar pacientes sobre médicos disponíveis por convênio
- **Análise:** Estatísticas sobre aceitação de convênios

---

**Arquivos relacionados:**
- `migrations/31º_Migration_create_doctors_insurance_views.sql`
- `src/pages/DoctorsInsurance.tsx`
- `src/App.tsx`
- `src/components/layout/Sidebar.tsx`

