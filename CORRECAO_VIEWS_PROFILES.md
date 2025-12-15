# 🔧 Correção Final: VIEWs Usando Profiles

**Data:** 2025-10-14  
**Status:** ✅ RESOLVIDO E TESTADO

---

## 🎯 Problema Relatado

Usuário perguntou: *"A tabela `v_doctors_insurance_coverage` é uma view, ela não deveria mostrar os dados que cada médico preenche no menu convênios?"*

**Resposta:** SIM! Mas estava retornando tudo NULL.

---

## 🔍 Diagnóstico Completo

### 1️⃣ Verificação dos Dados
✅ **Dados existem e estão corretos:**
```
Dr Fernando cadastrou 3 convênios:
- Amil - Amil One Health
- Hapvida - Hapvida Premium
- Intermédica - Smart 500
```

### 2️⃣ Verificação da VIEW
❌ **VIEW estava ERRADA:**
```sql
-- Definição antiga (INCORRETA)
FROM auth.users u
LEFT JOIN clinic_accepted_insurances cai ON cai.doctor_id = u.id
```

**Problema:**
- Sistema usa tabela `profiles` para gerenciar usuários
- `doctor_id` = `profiles.id`
- VIEW buscava em `auth.users.id`
- **JOIN não funciona!** → Retorna NULL

---

## ✅ Solução Aplicada

### Recriar VIEWs usando `profiles`:

```sql
-- VIEW v_doctors_insurance_coverage (CORRIGIDA)
CREATE OR REPLACE VIEW v_doctors_insurance_coverage AS
SELECT 
  p.id as doctor_id,
  p.email as doctor_email,
  p.name as doctor_name,
  p.specialization as doctor_specialty,
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
FROM profiles p  -- ← Mudou de auth.users para profiles
LEFT JOIN clinic_accepted_insurances cai ON cai.doctor_id = p.id AND cai.is_active = true
LEFT JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
LEFT JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE p.role = 'doctor'
ORDER BY p.name, ic.name, ip.name;

-- VIEW v_doctors_summary (CORRIGIDA)
CREATE OR REPLACE VIEW v_doctors_summary AS
SELECT 
  p.id as doctor_id,
  p.email as doctor_email,
  p.name as doctor_name,
  p.specialization as doctor_specialty,
  COUNT(DISTINCT ic.id) as total_insurance_companies,
  COUNT(cai.id) as total_insurance_plans,
  STRING_AGG(DISTINCT ic.short_name, ', ' ORDER BY ic.short_name) as insurance_companies,
  STRING_AGG(ic.short_name || ' - ' || ip.name, ', ' ORDER BY ic.short_name, ip.name) as insurance_plans_list
FROM profiles p  -- ← Mudou de auth.users para profiles
LEFT JOIN clinic_accepted_insurances cai ON cai.doctor_id = p.id AND cai.is_active = true
LEFT JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
LEFT JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE p.role = 'doctor'
GROUP BY p.id, p.email, p.name, p.specialization
ORDER BY p.name;
```

---

## 🧪 Teste Realizado

### VIEW `v_doctors_insurance_coverage`:
```sql
SELECT * FROM v_doctors_insurance_coverage 
WHERE insurance_company_id IS NOT NULL;
```

**Resultado:**
| doctor_name | doctor_specialty | insurance_company_short_name | insurance_plan_name |
|-------------|------------------|------------------------------|---------------------|
| Dr Fernando | Endocrinologista | Amil | Amil One Health |
| Dr Fernando | Endocrinologista | Hapvida | Hapvida Premium |
| Dr Fernando | Endocrinologista | Intermédica | Smart 500 |

✅ **Funcionando perfeitamente!**

---

### VIEW `v_doctors_summary`:
```sql
SELECT * FROM v_doctors_summary 
WHERE total_insurance_plans > 0;
```

**Resultado:**
| doctor_name | doctor_specialty | total_companies | total_plans | insurance_plans_list |
|-------------|------------------|-----------------|-------------|----------------------|
| Dr Fernando | Endocrinologista | 3 | 3 | Amil - Amil One Health, Hapvida - Hapvida Premium, Intermédica - Smart 500 |

✅ **Funcionando perfeitamente!**

---

## 📊 Comparação: Antes vs Depois

### ❌ Antes (ERRADO):
```
FROM auth.users u
  ↓
doctor_id não existe em auth.users
  ↓
JOIN falha
  ↓
Retorna NULL
```

### ✅ Depois (CORRETO):
```
FROM profiles p
  ↓
doctor_id = profiles.id
  ↓
JOIN funciona
  ↓
Retorna dados corretos
```

---

## 📁 Arquivos Atualizados

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `migrations/31º_Migration_create_doctors_insurance_views.sql` | ✅ Atualizado | VIEWs corrigidas |
| `migrations/32º_Migration_fix_doctors_view_with_function.sql` | ✅ Atualizado | Função corrigida |
| `CORRECAO_VIEWS_PROFILES.md` | ✨ Criado | Este documento |

---

## 🎓 Resumo Técnico

### Problema Geral:
O sistema **MedX** gerencia usuários através da tabela `profiles`, não diretamente em `auth.users`.

### Estrutura:
```
auth.users (Supabase Auth - apenas autenticação)
    ↓ auth_user_id
profiles (Dados dos usuários - usado pelo sistema)
    ↓ id (user.id no AuthContext)
clinic_accepted_insurances (doctor_id = profiles.id)
```

### Solução:
**TODAS** as queries/functions/views que precisam buscar usuários devem usar `profiles`, não `auth.users`.

---

## ✅ Checklist Final

- [x] VIEW `v_doctors_insurance_coverage` corrigida
- [x] VIEW `v_doctors_summary` corrigida
- [x] Função `get_doctors_insurance_summary()` corrigida
- [x] Testado via SQL (funciona!)
- [x] Migration atualizada
- [x] Documentação completa
- [ ] **Testar no frontend** (aguardando usuário)

---

## 🚀 Como Usar as VIEWs

### 1. VIEW Detalhada (v_doctors_insurance_coverage):
```sql
-- Ver todos os convênios de todos os médicos
SELECT * FROM v_doctors_insurance_coverage;

-- Ver convênios de um médico específico
SELECT * FROM v_doctors_insurance_coverage 
WHERE doctor_name = 'Dr Fernando';

-- Ver quais médicos aceitam determinada operadora
SELECT DISTINCT doctor_name, doctor_specialty
FROM v_doctors_insurance_coverage
WHERE insurance_company_short_name = 'Amil';
```

### 2. VIEW Resumida (v_doctors_summary):
```sql
-- Ver resumo de todos os médicos
SELECT * FROM v_doctors_summary;

-- Ver médicos com mais de X convênios
SELECT * FROM v_doctors_summary
WHERE total_insurance_plans > 2;

-- Estatísticas gerais
SELECT 
  AVG(total_insurance_plans) as media_planos,
  MAX(total_insurance_plans) as max_planos
FROM v_doctors_summary;
```

---

## 💡 Uso no Frontend

### Opção 1: Usar a VIEW (simplificada):
```typescript
const { data } = await supabase
  .from('v_doctors_summary')
  .select('*');
```

### Opção 2: Usar a Função (recomendado):
```typescript
const { data } = await supabase
  .rpc('get_doctors_insurance_summary');
```

**Recomendação:** Use a **função** (Opção 2) porque ela tem `SECURITY DEFINER` e garante acesso mesmo se houver restrições RLS futuras.

---

## 🎉 Conclusão

**Problema:** VIEWs retornavam NULL  
**Causa:** Buscavam em `auth.users` ao invés de `profiles`  
**Solução:** VIEWs recriadas usando `profiles`  
**Status:** ✅ **FUNCIONANDO PERFEITAMENTE**

Os 3 convênios do Dr Fernando agora aparecem corretamente em ambas as VIEWs!

---

**Última atualização:** 2025-10-14  
**Testado:** ✅ Via SQL direto  
**Próximo:** Teste no frontend

