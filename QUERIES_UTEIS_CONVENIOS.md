# 🔍 Queries Úteis - Sistema de Convênios

## 📊 Consultas para Relatórios

### Ver todos os convênios aceitos pela clínica

```sql
SELECT 
  ic.name as operadora,
  ic.short_name,
  ip.name as plano,
  ip.plan_type as tipo,
  ip.coverage_type as cobertura,
  cai.accepted_at as "aceito_em",
  cai.notes as observacoes
FROM clinic_accepted_insurances cai
JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE cai.is_active = true
ORDER BY ic.name, ip.name;
```

---

### Contar planos aceitos por operadora

```sql
SELECT 
  ic.name as operadora,
  COUNT(cai.id) as planos_aceitos,
  ic.market_share as "participação_mercado_%",
  ic.beneficiaries as beneficiarios
FROM insurance_companies ic
LEFT JOIN insurance_plans ip ON ip.insurance_company_id = ic.id
LEFT JOIN clinic_accepted_insurances cai ON cai.insurance_plan_id = ip.id AND cai.is_active = true
GROUP BY ic.id, ic.name, ic.market_share, ic.beneficiaries
HAVING COUNT(cai.id) > 0
ORDER BY COUNT(cai.id) DESC, ic.market_share DESC;
```

---

### Ver planos por tipo (Básico, Intermediário, Premium)

```sql
SELECT 
  ip.plan_type as tipo_plano,
  COUNT(cai.id) as total_aceitos
FROM clinic_accepted_insurances cai
JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
WHERE cai.is_active = true
GROUP BY ip.plan_type
ORDER BY 
  CASE ip.plan_type
    WHEN 'Premium' THEN 1
    WHEN 'Intermediário' THEN 2
    WHEN 'Básico' THEN 3
  END;
```

---

### Ver planos por tipo de cobertura

```sql
SELECT 
  ip.coverage_type as cobertura,
  COUNT(cai.id) as total_aceitos
FROM clinic_accepted_insurances cai
JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
WHERE cai.is_active = true
GROUP BY ip.coverage_type
ORDER BY 
  CASE ip.coverage_type
    WHEN 'Nacional' THEN 1
    WHEN 'Estadual' THEN 2
    WHEN 'Regional' THEN 3
    WHEN 'Municipal' THEN 4
  END;
```

---

## 🔗 Integração com Pacientes (Futura)

### Adicionar campo de convênio na tabela de pacientes

```sql
-- Adicionar coluna para vincular paciente ao convênio
ALTER TABLE patients 
ADD COLUMN insurance_plan_id UUID REFERENCES insurance_plans(id);

-- Adicionar índice para performance
CREATE INDEX idx_patients_insurance_plan ON patients(insurance_plan_id);

-- Adicionar campo para número da carteirinha
ALTER TABLE patients 
ADD COLUMN insurance_card_number VARCHAR(50);

-- Adicionar campo para validade da carteirinha
ALTER TABLE patients 
ADD COLUMN insurance_card_expiry DATE;
```

---

### Query: Ver pacientes por convênio

```sql
SELECT 
  ic.name as operadora,
  ip.name as plano,
  COUNT(p.id) as total_pacientes
FROM insurance_companies ic
JOIN insurance_plans ip ON ip.insurance_company_id = ic.id
LEFT JOIN patients p ON p.insurance_plan_id = ip.id
GROUP BY ic.id, ic.name, ip.id, ip.name
HAVING COUNT(p.id) > 0
ORDER BY COUNT(p.id) DESC;
```

---

### Query: Validar se convênio do paciente é aceito

```sql
-- Verificar se um paciente tem convênio aceito pela clínica
SELECT 
  p.name as paciente,
  ic.name as operadora,
  ip.name as plano,
  CASE 
    WHEN cai.id IS NOT NULL THEN 'SIM'
    ELSE 'NÃO'
  END as "aceito_pela_clinica"
FROM patients p
JOIN insurance_plans ip ON ip.id = p.insurance_plan_id
JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
LEFT JOIN clinic_accepted_insurances cai ON cai.insurance_plan_id = ip.id AND cai.is_active = true
WHERE p.id = 'ID_DO_PACIENTE';
```

---

## 📅 Integração com Agendamentos (Futura)

### Adicionar convênio aos agendamentos

```sql
-- Ver agendamentos por convênio
SELECT 
  ic.name as operadora,
  ip.name as plano,
  COUNT(a.id) as total_consultas,
  DATE_TRUNC('month', a.scheduled_at) as mes
FROM appointments a
JOIN patients p ON p.id = a.patient_id
JOIN insurance_plans ip ON ip.id = p.insurance_plan_id
JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
GROUP BY ic.id, ic.name, ip.id, ip.name, DATE_TRUNC('month', a.scheduled_at)
ORDER BY mes DESC, COUNT(a.id) DESC;
```

---

### Relatório financeiro por convênio

```sql
-- Total de consultas e valores por convênio (exemplo)
SELECT 
  ic.name as operadora,
  ip.name as plano,
  COUNT(a.id) as total_consultas,
  SUM(a.value) as valor_total,
  AVG(a.value) as valor_medio
FROM appointments a
JOIN patients p ON p.id = a.patient_id
JOIN insurance_plans ip ON ip.id = p.insurance_plan_id
JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE a.status = 'completed'
  AND a.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ic.id, ic.name, ip.id, ip.name
ORDER BY SUM(a.value) DESC;
```

---

## 🎯 Queries de Manutenção

### Limpar convênios inativos antigos

```sql
-- Ver convênios inativos
SELECT 
  ic.name as operadora,
  ip.name as plano,
  cai.accepted_at,
  cai.is_active
FROM clinic_accepted_insurances cai
JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE cai.is_active = false;

-- Deletar convênios inativos (cuidado!)
-- DELETE FROM clinic_accepted_insurances WHERE is_active = false;
```

---

### Verificar planos sem operadora (inconsistência)

```sql
-- Isso não deveria retornar resultados devido ao FOREIGN KEY
SELECT ip.*
FROM insurance_plans ip
LEFT JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE ic.id IS NULL;
```

---

### Adicionar notas a um convênio aceito

```sql
-- Adicionar observação sobre um convênio específico
UPDATE clinic_accepted_insurances
SET notes = 'Aceita apenas consultas de rotina. Não aceita cirurgias.'
WHERE insurance_plan_id = 'ID_DO_PLANO';
```

---

## 📈 Queries de Análise

### Top 5 operadoras mais aceitas

```sql
SELECT 
  ic.name as operadora,
  ic.market_share,
  COUNT(cai.id) as planos_aceitos,
  ROUND((COUNT(cai.id)::numeric / 
    (SELECT COUNT(*) FROM clinic_accepted_insurances WHERE is_active = true)) * 100, 2) 
    as "porcentagem_do_total"
FROM insurance_companies ic
JOIN insurance_plans ip ON ip.insurance_company_id = ic.id
JOIN clinic_accepted_insurances cai ON cai.insurance_plan_id = ip.id
WHERE cai.is_active = true
GROUP BY ic.id, ic.name, ic.market_share
ORDER BY COUNT(cai.id) DESC
LIMIT 5;
```

---

### Cobertura total estimada de beneficiários

```sql
-- Estimar quantos beneficiários potenciais a clínica atende
SELECT 
  COUNT(DISTINCT ic.id) as operadoras_aceitas,
  SUM(DISTINCT ic.beneficiaries) as beneficiarios_potenciais,
  ROUND(AVG(ic.market_share), 2) as "market_share_medio_%"
FROM insurance_companies ic
JOIN insurance_plans ip ON ip.insurance_company_id = ic.id
JOIN clinic_accepted_insurances cai ON cai.insurance_plan_id = ip.id
WHERE cai.is_active = true;
```

---

## 🔄 Backup e Restore

### Backup dos convênios aceitos

```sql
-- Criar tabela de backup
CREATE TABLE clinic_accepted_insurances_backup AS
SELECT * FROM clinic_accepted_insurances;

-- Ou exportar como JSON
SELECT json_agg(row_to_json(t))
FROM (
  SELECT 
    ic.name as operadora,
    ip.name as plano,
    cai.notes,
    cai.accepted_at,
    cai.is_active
  FROM clinic_accepted_insurances cai
  JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
  JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
) t;
```

---

## 🎨 Views Úteis

### View: Convênios aceitos completos

```sql
CREATE OR REPLACE VIEW v_accepted_insurances AS
SELECT 
  cai.id as acceptance_id,
  ic.id as company_id,
  ic.name as company_name,
  ic.short_name as company_short_name,
  ic.market_share,
  ic.beneficiaries,
  ip.id as plan_id,
  ip.name as plan_name,
  ip.plan_type,
  ip.coverage_type,
  cai.notes,
  cai.accepted_at,
  cai.is_active
FROM clinic_accepted_insurances cai
JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE cai.is_active = true
ORDER BY ic.name, ip.name;

-- Usar a view:
SELECT * FROM v_accepted_insurances;
```

---

### View: Estatísticas de convênios

```sql
CREATE OR REPLACE VIEW v_insurance_stats AS
SELECT 
  (SELECT COUNT(*) FROM insurance_companies WHERE is_active = true) as total_companies,
  (SELECT COUNT(*) FROM insurance_plans WHERE is_active = true) as total_plans,
  (SELECT COUNT(*) FROM clinic_accepted_insurances WHERE is_active = true) as accepted_plans,
  (SELECT COUNT(DISTINCT ip.insurance_company_id) 
   FROM clinic_accepted_insurances cai
   JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
   WHERE cai.is_active = true) as accepted_companies,
  (SELECT SUM(beneficiaries)
   FROM insurance_companies ic
   WHERE EXISTS (
     SELECT 1 FROM insurance_plans ip
     JOIN clinic_accepted_insurances cai ON cai.insurance_plan_id = ip.id
     WHERE ip.insurance_company_id = ic.id AND cai.is_active = true
   )) as total_potential_beneficiaries;

-- Usar a view:
SELECT * FROM v_insurance_stats;
```

---

## 🔐 Queries de Segurança

### Ver políticas RLS ativas

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('insurance_companies', 'insurance_plans', 'clinic_accepted_insurances')
ORDER BY tablename, policyname;
```

---

### Testar permissões de usuário

```sql
-- Verificar se usuário atual pode inserir convênio
SELECT 
  auth.uid() as user_id,
  (auth.jwt() -> 'user_metadata' ->> 'role') as user_role,
  CASE 
    WHEN (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner' THEN 'PODE GERENCIAR'
    ELSE 'SOMENTE VISUALIZAÇÃO'
  END as permissao;
```

---

## 📱 Queries para API/Frontend

### Buscar operadoras com total de planos

```sql
SELECT 
  ic.*,
  COUNT(ip.id) as total_plans,
  COUNT(cai.id) as accepted_plans
FROM insurance_companies ic
LEFT JOIN insurance_plans ip ON ip.insurance_company_id = ic.id AND ip.is_active = true
LEFT JOIN clinic_accepted_insurances cai ON cai.insurance_plan_id = ip.id AND cai.is_active = true
WHERE ic.is_active = true
GROUP BY ic.id
ORDER BY ic.market_share DESC;
```

---

### Buscar planos com status de aceitação

```sql
SELECT 
  ip.*,
  ic.name as company_name,
  ic.short_name as company_short_name,
  CASE WHEN cai.id IS NOT NULL THEN true ELSE false END as is_accepted
FROM insurance_plans ip
JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
LEFT JOIN clinic_accepted_insurances cai ON cai.insurance_plan_id = ip.id AND cai.is_active = true
WHERE ip.insurance_company_id = 'ID_DA_OPERADORA'
  AND ip.is_active = true
ORDER BY ip.plan_type, ip.name;
```

---

## 💡 Dicas

1. **Performance:** Use sempre os índices criados
2. **Segurança:** Teste as RLS policies com diferentes roles
3. **Manutenção:** Faça backup regular dos convênios aceitos
4. **Análise:** Use as views para relatórios mais rápidos
5. **Integração:** Planeje a integração com pacientes gradualmente

---

**Documento criado em:** 13/10/2025  
**Para uso com:** Sistema MedX - Módulo de Convênios

