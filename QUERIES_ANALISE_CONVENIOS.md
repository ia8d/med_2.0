# 🔍 Queries Úteis: Análise de Convênios por Médico

**Data:** 2025-10-14  
**Autor:** Sistema MedX

---

## 📊 Queries Básicas

### 1. Ver todos os médicos e seus convênios (resumo)
```sql
SELECT * FROM v_doctors_summary
ORDER BY total_insurance_plans DESC;
```

**Resultado esperado:**
```
doctor_name    | specialty    | total_companies | total_plans | insurance_companies
Dr. João Silva | Cardiologia  | 3               | 5           | Amil, Bradesco, Unimed
Dra. Ana Costa | Pediatria    | 2               | 3           | Amil, SulAmérica
```

---

### 2. Ver detalhes de convênios de um médico específico
```sql
SELECT 
  doctor_name,
  insurance_company_name,
  insurance_plan_name,
  plan_type,
  coverage_type,
  accepted_at
FROM v_doctors_insurance_coverage
WHERE doctor_id = 'UUID_DO_MEDICO'
ORDER BY insurance_company_name, insurance_plan_name;
```

---

### 3. Médicos SEM nenhum convênio cadastrado
```sql
SELECT 
  doctor_name,
  doctor_email,
  doctor_specialty
FROM v_doctors_summary
WHERE total_insurance_plans = 0
ORDER BY doctor_name;
```

**Uso:** Identificar médicos que ainda precisam cadastrar convênios

---

## 🎯 Queries por Operadora

### 4. Listar médicos que aceitam determinada operadora
```sql
SELECT DISTINCT
  doctor_name,
  doctor_specialty,
  doctor_email
FROM v_doctors_insurance_coverage
WHERE insurance_company_short_name = 'Amil'  -- Trocar pela operadora desejada
ORDER BY doctor_name;
```

**Operadoras disponíveis:**
- `Amil`
- `Unimed`
- `Bradesco Saúde`
- `SulAmérica Saúde`
- `NotreDame Intermédica`
- `Porto Seguro Saúde`
- `Hapvida`
- `São Francisco Saúde`
- `Golden Cross`
- `Prevent Senior`
- `Mediservice`

---

### 5. Ranking de operadoras mais aceitas
```sql
SELECT 
  insurance_company_short_name as operadora,
  COUNT(DISTINCT doctor_id) as total_medicos,
  COUNT(*) as total_planos_aceitos,
  ROUND(COUNT(DISTINCT doctor_id)::numeric / 
    (SELECT COUNT(*) FROM auth.users WHERE raw_user_meta_data->>'role' = 'doctor') * 100, 1
  ) as percentual_medicos
FROM v_doctors_insurance_coverage
WHERE insurance_company_id IS NOT NULL
GROUP BY insurance_company_short_name
ORDER BY total_medicos DESC, total_planos_aceitos DESC;
```

**Resultado esperado:**
```
operadora        | total_medicos | total_planos | percentual_medicos
Amil             | 8             | 15           | 80.0
Unimed           | 7             | 12           | 70.0
Bradesco Saúde   | 5             | 8            | 50.0
```

---

## 🏥 Queries por Especialidade

### 6. Convênios por especialidade médica
```sql
SELECT 
  doctor_specialty as especialidade,
  COUNT(DISTINCT doctor_id) as total_medicos,
  COUNT(DISTINCT insurance_company_id) as operadoras_distintas,
  COUNT(*) as total_planos
FROM v_doctors_insurance_coverage
WHERE insurance_company_id IS NOT NULL
GROUP BY doctor_specialty
ORDER BY total_medicos DESC;
```

---

### 7. Médicos de uma especialidade que aceitam operadora específica
```sql
SELECT 
  doctor_name,
  doctor_email,
  STRING_AGG(insurance_plan_name, ', ') as planos_aceitos
FROM v_doctors_insurance_coverage
WHERE doctor_specialty = 'Cardiologia'  -- Trocar especialidade
  AND insurance_company_short_name = 'Amil'  -- Trocar operadora
GROUP BY doctor_name, doctor_email
ORDER BY doctor_name;
```

---

## 📈 Queries Estatísticas

### 8. Estatísticas gerais do sistema
```sql
SELECT 
  COUNT(*) as total_medicos,
  COUNT(CASE WHEN total_insurance_plans > 0 THEN 1 END) as medicos_com_convenio,
  COUNT(CASE WHEN total_insurance_plans = 0 THEN 1 END) as medicos_sem_convenio,
  ROUND(AVG(total_insurance_plans), 2) as media_planos_por_medico,
  MAX(total_insurance_plans) as max_planos,
  MIN(CASE WHEN total_insurance_plans > 0 THEN total_insurance_plans END) as min_planos
FROM v_doctors_summary;
```

**Resultado esperado:**
```
total_medicos | medicos_com_convenio | medicos_sem_convenio | media_planos | max_planos | min_planos
10            | 8                    | 2                    | 4.2          | 12         | 1
```

---

### 9. Distribuição de médicos por número de convênios
```sql
SELECT 
  CASE 
    WHEN total_insurance_plans = 0 THEN '0 convênios'
    WHEN total_insurance_plans BETWEEN 1 AND 3 THEN '1-3 convênios'
    WHEN total_insurance_plans BETWEEN 4 AND 6 THEN '4-6 convênios'
    WHEN total_insurance_plans BETWEEN 7 AND 10 THEN '7-10 convênios'
    ELSE '10+ convênios'
  END as faixa,
  COUNT(*) as quantidade_medicos
FROM v_doctors_summary
GROUP BY faixa
ORDER BY faixa;
```

---

### 10. Top 5 médicos com mais convênios
```sql
SELECT 
  doctor_name,
  doctor_specialty,
  total_insurance_companies as operadoras,
  total_insurance_plans as planos,
  insurance_companies as lista_operadoras
FROM v_doctors_summary
ORDER BY total_insurance_plans DESC
LIMIT 5;
```

---

## 🔍 Queries de Busca Avançada

### 11. Buscar médicos por tipo de plano
```sql
SELECT DISTINCT
  doctor_name,
  doctor_specialty,
  insurance_company_short_name,
  insurance_plan_name
FROM v_doctors_insurance_coverage
WHERE plan_type = 'Premium'  -- Opções: Básico, Premium, Executivo
ORDER BY doctor_name;
```

---

### 12. Médicos que aceitam planos específicos (busca por nome)
```sql
SELECT DISTINCT
  doctor_name,
  doctor_specialty,
  insurance_company_short_name,
  insurance_plan_name
FROM v_doctors_insurance_coverage
WHERE insurance_plan_name ILIKE '%nacional%'  -- Busca case-insensitive
ORDER BY doctor_name;
```

---

### 13. Médicos com cobertura regional vs nacional
```sql
SELECT 
  coverage_type as tipo_cobertura,
  COUNT(DISTINCT doctor_id) as total_medicos,
  COUNT(*) as total_planos
FROM v_doctors_insurance_coverage
WHERE coverage_type IS NOT NULL
GROUP BY coverage_type
ORDER BY total_medicos DESC;
```

---

## 🎯 Queries para Gestão

### 14. Identificar "gaps" - operadoras sem médicos
```sql
SELECT 
  ic.short_name as operadora_sem_medicos,
  ic.name as nome_completo
FROM insurance_companies ic
WHERE ic.id NOT IN (
  SELECT DISTINCT insurance_company_id
  FROM v_doctors_insurance_coverage
  WHERE insurance_company_id IS NOT NULL
)
ORDER BY ic.short_name;
```

**Uso:** Identificar oportunidades de captação/credenciamento

---

### 15. Planos sem nenhum médico aceitando
```sql
SELECT 
  ic.short_name as operadora,
  ip.name as plano,
  ip.plan_type as tipo,
  ip.coverage_type as cobertura
FROM insurance_plans ip
JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE ip.id NOT IN (
  SELECT DISTINCT insurance_plan_id
  FROM clinic_accepted_insurances
  WHERE is_active = true
)
ORDER BY ic.short_name, ip.name;
```

---

### 16. Médicos que só aceitam 1 ou 2 convênios (possível expansão)
```sql
SELECT 
  doctor_name,
  doctor_email,
  doctor_specialty,
  total_insurance_plans as convenios_atuais,
  insurance_plans_list as convenios
FROM v_doctors_summary
WHERE total_insurance_plans BETWEEN 1 AND 2
ORDER BY total_insurance_plans, doctor_name;
```

**Uso:** Conversar com médicos para ampliar rede de convênios

---

## 📊 Queries para Relatórios

### 17. Relatório completo: Médico → Especialidade → Convênios
```sql
SELECT 
  ds.doctor_name,
  ds.doctor_email,
  ds.doctor_specialty,
  ds.total_insurance_companies,
  ds.total_insurance_plans,
  STRING_AGG(
    dic.insurance_company_short_name || ': ' || dic.insurance_plan_name,
    E'\n'
  ) as convenios_detalhados
FROM v_doctors_summary ds
LEFT JOIN v_doctors_insurance_coverage dic ON dic.doctor_id = ds.doctor_id
GROUP BY 
  ds.doctor_name, 
  ds.doctor_email, 
  ds.doctor_specialty, 
  ds.total_insurance_companies, 
  ds.total_insurance_plans
ORDER BY ds.doctor_name;
```

---

### 18. Matriz: Médicos x Operadoras (formato pivotado)
```sql
SELECT 
  doctor_name,
  MAX(CASE WHEN insurance_company_short_name = 'Amil' THEN '✓' ELSE '-' END) as Amil,
  MAX(CASE WHEN insurance_company_short_name = 'Unimed' THEN '✓' ELSE '-' END) as Unimed,
  MAX(CASE WHEN insurance_company_short_name = 'Bradesco Saúde' THEN '✓' ELSE '-' END) as Bradesco,
  MAX(CASE WHEN insurance_company_short_name = 'SulAmérica Saúde' THEN '✓' ELSE '-' END) as SulAmerica,
  total_insurance_plans as total
FROM v_doctors_insurance_coverage
JOIN v_doctors_summary USING (doctor_id)
GROUP BY doctor_name, total_insurance_plans
ORDER BY doctor_name;
```

**Resultado esperado:**
```
doctor_name    | Amil | Unimed | Bradesco | SulAmerica | total
Dr. João       | ✓    | ✓      | -        | ✓          | 5
Dra. Maria     | ✓    | -      | ✓        | -          | 3
```

---

## 🚨 Queries de Monitoramento

### 19. Últimas atualizações de convênios (recentemente aceitos)
```sql
SELECT 
  doctor_name,
  insurance_company_short_name as operadora,
  insurance_plan_name as plano,
  accepted_at as data_aceite
FROM v_doctors_insurance_coverage
WHERE accepted_at IS NOT NULL
ORDER BY accepted_at DESC
LIMIT 20;
```

---

### 20. Médicos inativos (sem convênios há mais de X dias)
```sql
SELECT 
  ds.doctor_name,
  ds.doctor_email,
  MAX(dic.accepted_at) as ultimo_aceite
FROM v_doctors_summary ds
LEFT JOIN v_doctors_insurance_coverage dic ON dic.doctor_id = ds.doctor_id
GROUP BY ds.doctor_name, ds.doctor_email
HAVING MAX(dic.accepted_at) < NOW() - INTERVAL '90 days' OR MAX(dic.accepted_at) IS NULL
ORDER BY ultimo_aceite NULLS FIRST;
```

---

## 💡 Dicas de Uso

### Para executar no Supabase:
1. Acesse o projeto no Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole a query desejada
4. Clique em **Run**

### Para usar no código TypeScript:
```typescript
const { data, error } = await supabase
  .from('v_doctors_summary')
  .select('*')
  .order('total_insurance_plans', { ascending: false });
```

### Para exportar resultados:
- Use o botão **Download CSV** no SQL Editor do Supabase
- Ou use ferramentas como DBeaver, pgAdmin

---

## 📌 Queries Favoritas (Quick Access)

**Mais usadas:**
- Query #3: Médicos sem convênios
- Query #5: Ranking de operadoras
- Query #8: Estatísticas gerais
- Query #10: Top 5 médicos
- Query #14: Operadoras sem médicos

---

## 🔧 Criando Novas Queries

### Template base:
```sql
-- Descrição: [Descrever o objetivo]
SELECT 
  -- Campos desejados
FROM v_doctors_summary ds
LEFT JOIN v_doctors_insurance_coverage dic ON dic.doctor_id = ds.doctor_id
WHERE 
  -- Condições
GROUP BY 
  -- Agrupamento
ORDER BY 
  -- Ordenação
LIMIT 100;
```

---

**Arquivos relacionados:**
- `migrations/31º_Migration_create_doctors_insurance_views.sql`
- `IMPLEMENTACAO_VISAO_CONVENIOS.md`
- `src/pages/DoctorsInsurance.tsx`

