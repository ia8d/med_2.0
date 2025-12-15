# 🔧 PLANO DE AÇÃO: Correção e Consolidação de Migrations

**Data:** 28 de Outubro de 2025  
**Projeto:** MedX  
**Objetivo:** Preparar o projeto para replicação completa via migrations

---

## 📋 PROBLEMAS IDENTIFICADOS

1. ⚠️ **29 migrations não aplicadas ao banco**
2. ⚠️ **Tabelas criadas manualmente** (sem registro em migrations)
3. ⚠️ **3 tabelas sem RLS** (vulnerabilidade de segurança)
4. ⚠️ **Migrations duplicadas** (mesma numeração)
5. ⚠️ **Seeds não verificados** (não sabemos quais foram aplicados)

---

## 🎯 ESTRATÉGIA DE CORREÇÃO

Vamos adotar a **Opção 1: Reconciliação Progressiva** por ser a mais segura.

### Fases do Plano

```
Fase 1: Backup e Segurança          ✅ [Crítico - Fazer Primeiro]
Fase 2: Correção de Vulnerabilidades ⚠️  [Alta Prioridade]
Fase 3: Reconciliação de Migrations  📝 [Prioridade Média]
Fase 4: Validação e Testes          🧪 [Prioridade Média]
Fase 5: Documentação Final          📚 [Prioridade Baixa]
```

---

## 🚀 FASE 1: BACKUP E SEGURANÇA

### Passo 1.1: Criar Backup do Schema Atual

**Ação:** Exportar todo o schema do banco de dados atual

```bash
# Via MCP Supabase (você pode fazer isso)
# Ou via pg_dump:
pg_dump -h db.xrzufxkdpfjbjkwyzvyb.supabase.co \
  -U postgres \
  -d postgres \
  --schema-only \
  -f backup_schema_$(date +%Y%m%d).sql
```

**Resultado esperado:** Arquivo `backup_schema_YYYYMMDD.sql` com todo o schema

### Passo 1.2: Backup dos Dados Críticos

```sql
-- Exportar dados das tabelas principais
COPY (SELECT * FROM public.profiles) TO '/tmp/backup_profiles.csv' CSV HEADER;
COPY (SELECT * FROM public.patients) TO '/tmp/backup_patients.csv' CSV HEADER;
COPY (SELECT * FROM public.system_settings) TO '/tmp/backup_system_settings.csv' CSV HEADER;
COPY (SELECT * FROM public.insurance_companies) TO '/tmp/backup_insurance_companies.csv' CSV HEADER;
COPY (SELECT * FROM public.insurance_plans) TO '/tmp/backup_insurance_plans.csv' CSV HEADER;
```

---

## ⚠️ FASE 2: CORREÇÃO DE VULNERABILIDADES (URGENTE)

### Passo 2.1: Ativar RLS nas Tabelas Legadas

**Arquivo:** `migrations/52º_Migration_ativar_rls_tabelas_legadas.sql`

```sql
-- Descrição: Ativar RLS em tabelas legadas que estavam expostas
-- Data: 2025-10-28
-- Autor: Sistema MedX - Correção de Segurança

-- ============================================================================
-- ATIVAR RLS EM TABELAS LEGADAS
-- ============================================================================

-- Tabela: medx_history
ALTER TABLE public.medx_history ENABLE ROW LEVEL SECURITY;

-- Política: Todos autenticados podem ver e criar histórico
CREATE POLICY "Usuários autenticados podem gerenciar histórico"
ON public.medx_history FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Tabela: clientes_followup
ALTER TABLE public.clientes_followup ENABLE ROW LEVEL SECURITY;

-- Política: Todos autenticados podem gerenciar follow-ups
CREATE POLICY "Usuários autenticados podem gerenciar clientes_followup"
ON public.clientes_followup FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Tabela: followup_history
ALTER TABLE public.followup_history ENABLE ROW LEVEL SECURITY;

-- Política: Todos autenticados podem gerenciar histórico de follow-up
CREATE POLICY "Usuários autenticados podem gerenciar followup_history"
ON public.followup_history FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- ADICIONAR REALTIME NAS TABELAS
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.medx_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes_followup;
ALTER PUBLICATION supabase_realtime ADD TABLE public.followup_history;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON TABLE public.medx_history IS 'Histórico de conversas com pacientes (tabela legada)';
COMMENT ON TABLE public.clientes_followup IS 'Clientes em processo de follow-up (tabela legada)';
COMMENT ON TABLE public.followup_history IS 'Histórico de follow-ups realizados (tabela legada)';
```

**Aplicar imediatamente:**
```bash
# Via Supabase CLI
supabase db push

# Ou via MCP
# Aplicar esta migration usando o MCP Supabase
```

---

## 📝 FASE 3: RECONCILIAÇÃO DE MIGRATIONS

### Passo 3.1: Criar Migration de Reconciliação Inteligente

**Arquivo:** `migrations/53º_Migration_reconciliacao_estado_atual.sql`

```sql
-- Descrição: Migration de reconciliação - verifica estado atual e ajusta apenas o necessário
-- Data: 2025-10-28
-- Autor: Sistema MedX - Reconciliação

-- ============================================================================
-- EXTENSÕES NECESSÁRIAS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- FUNÇÃO AUXILIAR: Verificar se coluna existe
-- ============================================================================
CREATE OR REPLACE FUNCTION column_exists(
    ptable TEXT, 
    pcolumn TEXT, 
    pschema TEXT DEFAULT 'public'
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = pschema 
        AND table_name = ptable 
        AND column_name = pcolumn
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RECONCILIAR TABELA: insurance_companies
-- ============================================================================
DO $$
BEGIN
    -- Criar tabela se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'insurance_companies') THEN
        CREATE TABLE public.insurance_companies (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            short_name VARCHAR(100),
            logo_url TEXT,
            market_share DECIMAL(5,2),
            beneficiaries INTEGER,
            headquarters VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- RLS
        ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Operadoras visíveis para todos autenticados"
        ON insurance_companies FOR SELECT
        TO authenticated
        USING (true);
        
        -- Comentário
        COMMENT ON TABLE public.insurance_companies IS 'Operadoras de planos de saúde disponíveis no sistema';
        
        RAISE NOTICE 'Tabela insurance_companies criada';
    ELSE
        RAISE NOTICE 'Tabela insurance_companies já existe - OK';
    END IF;
END $$;

-- ============================================================================
-- RECONCILIAR TABELA: insurance_plans
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'insurance_plans') THEN
        CREATE TABLE public.insurance_plans (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            insurance_company_id UUID NOT NULL REFERENCES insurance_companies(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            plan_type VARCHAR(100),
            coverage_type VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Planos visíveis para todos autenticados"
        ON insurance_plans FOR SELECT
        TO authenticated
        USING (true);
        
        COMMENT ON TABLE public.insurance_plans IS 'Planos oferecidos por cada operadora de saúde';
        
        RAISE NOTICE 'Tabela insurance_plans criada';
    ELSE
        RAISE NOTICE 'Tabela insurance_plans já existe - OK';
    END IF;
END $$;

-- ============================================================================
-- RECONCILIAR TABELA: clinic_accepted_insurances
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clinic_accepted_insurances') THEN
        CREATE TABLE public.clinic_accepted_insurances (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            insurance_plan_id UUID NOT NULL REFERENCES insurance_plans(id) ON DELETE CASCADE,
            doctor_id UUID REFERENCES profiles(id),
            is_active BOOLEAN DEFAULT true,
            notes TEXT,
            accepted_at TIMESTAMPTZ DEFAULT NOW(),
            accepted_by UUID,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT unique_doctor_plan UNIQUE (doctor_id, insurance_plan_id)
        );
        
        ALTER TABLE public.clinic_accepted_insurances ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Tabela clinic_accepted_insurances criada';
    ELSE
        -- Verificar se coluna doctor_id existe
        IF NOT column_exists('clinic_accepted_insurances', 'doctor_id') THEN
            ALTER TABLE clinic_accepted_insurances 
            ADD COLUMN doctor_id UUID REFERENCES profiles(id);
            
            RAISE NOTICE 'Coluna doctor_id adicionada à clinic_accepted_insurances';
        END IF;
        
        RAISE NOTICE 'Tabela clinic_accepted_insurances já existe - OK';
    END IF;
END $$;

-- ============================================================================
-- RECONCILIAR TABELA: clinic_info
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clinic_info') THEN
        CREATE TABLE public.clinic_info (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            address_line TEXT,
            address_number TEXT,
            neighborhood TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            opening_hours TEXT,
            policy_scheduling TEXT,
            policy_rescheduling TEXT,
            policy_cancellation TEXT,
            doctor_ids UUID[],
            doctor_team JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE public.clinic_info ENABLE ROW LEVEL SECURITY;
        
        COMMENT ON TABLE public.clinic_info IS 'Informações da clínica: endereço, horários e políticas de atendimento.';
        
        RAISE NOTICE 'Tabela clinic_info criada';
    ELSE
        -- Verificar colunas adicionais
        IF NOT column_exists('clinic_info', 'doctor_ids') THEN
            ALTER TABLE clinic_info ADD COLUMN doctor_ids UUID[];
            RAISE NOTICE 'Coluna doctor_ids adicionada';
        END IF;
        
        IF NOT column_exists('clinic_info', 'doctor_team') THEN
            ALTER TABLE clinic_info ADD COLUMN doctor_team JSONB;
            RAISE NOTICE 'Coluna doctor_team adicionada';
        END IF;
        
        RAISE NOTICE 'Tabela clinic_info já existe - OK';
    END IF;
END $$;

-- ============================================================================
-- RECONCILIAR TABELA: followup_config
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'followup_config') THEN
        CREATE TABLE public.followup_config (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            clinic_id UUID REFERENCES clinic_info(id) ON DELETE CASCADE,
            followup1_minutes INTEGER NOT NULL DEFAULT 7,
            followup2_minutes INTEGER NOT NULL DEFAULT 15,
            followup3_minutes INTEGER NOT NULL DEFAULT 30,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(clinic_id)
        );
        
        ALTER TABLE public.followup_config ENABLE ROW LEVEL SECURITY;
        
        COMMENT ON TABLE public.followup_config IS 'Configuração dos períodos de follow-up (em minutos)';
        
        RAISE NOTICE 'Tabela followup_config criada';
    ELSE
        RAISE NOTICE 'Tabela followup_config já existe - OK';
    END IF;
END $$;

-- ============================================================================
-- VERIFICAR OUTRAS COLUNAS IMPORTANTES
-- ============================================================================

-- Verificar coluna health_insurance em patients
DO $$
BEGIN
    IF NOT column_exists('patients', 'health_insurance') THEN
        ALTER TABLE patients ADD COLUMN health_insurance TEXT;
        COMMENT ON COLUMN patients.health_insurance IS 'Convênio médico do paciente';
        RAISE NOTICE 'Coluna health_insurance adicionada a patients';
    END IF;
    
    IF NOT column_exists('patients', 'last_appointment_date') THEN
        ALTER TABLE patients ADD COLUMN last_appointment_date TIMESTAMPTZ;
        COMMENT ON COLUMN patients.last_appointment_date IS 'Data e hora da última consulta realizada pelo paciente';
        RAISE NOTICE 'Coluna last_appointment_date adicionada a patients';
    END IF;
    
    IF NOT column_exists('patients', 'stage') THEN
        ALTER TABLE patients ADD COLUMN stage TEXT DEFAULT 'crm';
        RAISE NOTICE 'Coluna stage adicionada a patients';
    END IF;
END $$;

-- Verificar coluna consultation_price em profiles
DO $$
BEGIN
    IF NOT column_exists('profiles', 'consultation_price') THEN
        ALTER TABLE profiles ADD COLUMN consultation_price NUMERIC DEFAULT 0.00;
        COMMENT ON COLUMN profiles.consultation_price IS 'Preço da consulta do médico (em reais)';
        RAISE NOTICE 'Coluna consultation_price adicionada a profiles';
    END IF;
    
    IF NOT column_exists('profiles', 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        COMMENT ON COLUMN profiles.avatar_url IS 'URL da foto de perfil do usuário (médico, secretária, etc)';
        RAISE NOTICE 'Coluna avatar_url adicionada a profiles';
    END IF;
END $$;

-- Verificar colunas de medicação em agent_consultations
DO $$
BEGIN
    IF NOT column_exists('agent_consultations', 'medication_name') THEN
        ALTER TABLE agent_consultations ADD COLUMN medication_name TEXT;
        COMMENT ON COLUMN agent_consultations.medication_name IS 'Nome do medicamento calculado (para Agent Medicação)';
        RAISE NOTICE 'Coluna medication_name adicionada';
    END IF;
    
    IF NOT column_exists('agent_consultations', 'medication_dosage') THEN
        ALTER TABLE agent_consultations ADD COLUMN medication_dosage TEXT;
        COMMENT ON COLUMN agent_consultations.medication_dosage IS 'Dosagem calculada do medicamento';
        RAISE NOTICE 'Coluna medication_dosage adicionada';
    END IF;
    
    IF NOT column_exists('agent_consultations', 'medication_frequency') THEN
        ALTER TABLE agent_consultations ADD COLUMN medication_frequency TEXT;
        COMMENT ON COLUMN agent_consultations.medication_frequency IS 'Frequência de administração do medicamento';
        RAISE NOTICE 'Coluna medication_frequency adicionada';
    END IF;
    
    IF NOT column_exists('agent_consultations', 'exam_type') THEN
        ALTER TABLE agent_consultations ADD COLUMN exam_type TEXT;
        COMMENT ON COLUMN agent_consultations.exam_type IS 'Tipo de exame analisado pelo Agent de Exames';
        RAISE NOTICE 'Coluna exam_type adicionada';
    END IF;
    
    IF NOT column_exists('agent_consultations', 'exam_result_summary') THEN
        ALTER TABLE agent_consultations ADD COLUMN exam_result_summary TEXT;
        COMMENT ON COLUMN agent_consultations.exam_result_summary IS 'Resumo da análise do exame';
        RAISE NOTICE 'Coluna exam_result_summary adicionada';
    END IF;
    
    IF NOT column_exists('agent_consultations', 'exam_file_name') THEN
        ALTER TABLE agent_consultations ADD COLUMN exam_file_name TEXT;
        COMMENT ON COLUMN agent_consultations.exam_file_name IS 'Nome do arquivo PDF do exame analisado';
        RAISE NOTICE 'Coluna exam_file_name adicionada';
    END IF;
    
    IF NOT column_exists('agent_consultations', 'exam_analysis_date') THEN
        ALTER TABLE agent_consultations ADD COLUMN exam_analysis_date TIMESTAMPTZ DEFAULT NOW();
        COMMENT ON COLUMN agent_consultations.exam_analysis_date IS 'Data em que a análise do exame foi realizada';
        RAISE NOTICE 'Coluna exam_analysis_date adicionada';
    END IF;
END $$;

-- Verificar coluna reason em appointments
DO $$
BEGIN
    IF NOT column_exists('appointments', 'reason') THEN
        ALTER TABLE appointments ADD COLUMN reason TEXT;
        COMMENT ON COLUMN appointments.reason IS 'Motivo/razão da consulta';
        RAISE NOTICE 'Coluna reason adicionada a appointments';
    END IF;
END $$;

-- ============================================================================
-- LIMPAR FUNÇÃO AUXILIAR
-- ============================================================================
DROP FUNCTION IF EXISTS column_exists(TEXT, TEXT, TEXT);

-- ============================================================================
-- FIM DA RECONCILIAÇÃO
-- ============================================================================
```

---

## 🧪 FASE 4: VALIDAÇÃO E TESTES

### Passo 4.1: Script de Validação

**Arquivo:** `scripts/validar_estado_banco.sql`

```sql
-- Descrição: Script de validação do estado do banco de dados
-- Verifica se todas as tabelas, colunas e políticas RLS estão corretas

-- ============================================================================
-- VERIFICAR TABELAS OBRIGATÓRIAS
-- ============================================================================
DO $$
DECLARE
    tabelas_obrigatorias TEXT[] := ARRAY[
        'profiles', 'patients', 'appointments', 'follow_ups', 'messages',
        'teleconsultations', 'profile_calendars', 'patient_doctors',
        'medical_records', 'anamnesis', 'clinical_data', 'exam_history',
        'medical_attachments', 'agent_consultations', 'doctor_schedules',
        'system_settings', 'pre_patients', 'insurance_companies',
        'insurance_plans', 'clinic_accepted_insurances',
        'doctors_insurance_summary', 'clinic_info', 'followup_config'
    ];
    tabela TEXT;
    existe BOOLEAN;
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'VALIDAÇÃO DE TABELAS';
    RAISE NOTICE '============================================';
    
    FOREACH tabela IN ARRAY tabelas_obrigatorias
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = tabela
        ) INTO existe;
        
        IF existe THEN
            RAISE NOTICE '✅ Tabela % existe', tabela;
        ELSE
            RAISE WARNING '❌ Tabela % NÃO EXISTE', tabela;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- VERIFICAR RLS ATIVADO
-- ============================================================================
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'VERIFICAÇÃO DE RLS';
    RAISE NOTICE '============================================';
    
    FOR rec IN 
        SELECT tablename, relrowsecurity
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE t.schemaname = 'public'
        ORDER BY t.tablename
    LOOP
        IF rec.relrowsecurity THEN
            RAISE NOTICE '✅ % - RLS ATIVO', rec.tablename;
        ELSE
            RAISE WARNING '⚠️  % - RLS DESATIVADO', rec.tablename;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- VERIFICAR POLÍTICAS RLS
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- VERIFICAR REALTIME
-- ============================================================================
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;

-- ============================================================================
-- ESTATÍSTICAS GERAIS
-- ============================================================================
SELECT 
    'Tabelas Públicas' AS metrica,
    COUNT(*)::TEXT AS valor
FROM pg_tables
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Tabelas com RLS',
    COUNT(*)::TEXT
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public' AND c.relrowsecurity = true

UNION ALL

SELECT 
    'Políticas RLS',
    COUNT(*)::TEXT
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Tabelas no Realtime',
    COUNT(*)::TEXT
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

---

## 📚 FASE 5: DOCUMENTAÇÃO FINAL

### Passo 5.1: Criar Guia de Replicação

**Arquivo:** `GUIA_REPLICACAO_COMPLETA.md`

```markdown
# 🚀 Guia de Replicação Completa do Projeto MedX

## Pré-requisitos

- Conta Supabase ativa
- Supabase CLI instalado
- Node.js 18+ instalado
- Git instalado

## Passo 1: Criar Novo Projeto Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Preencha:
   - Nome: MedX (ou outro nome)
   - Database Password: [escolha uma senha forte]
   - Region: us-east-2 (ou mais próxima)

## Passo 2: Configurar Projeto Localmente

```bash
# Clonar repositório
git clone [url-do-repositorio]
cd medx

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp TEMPLATE_ENV_LOCAL.txt .env.local

# Editar .env.local com as credenciais do Supabase
```

## Passo 3: Aplicar Migrations (EM ORDEM)

```bash
# Conectar ao projeto
supabase link --project-ref [seu-project-ref]

# Aplicar migrations
supabase db push
```

## Passo 4: Aplicar Seeds (EM ORDEM)

```bash
# Seeds obrigatórios
psql $DATABASE_URL -f seeds/2º_Seed_create_storage_bucket.sql
psql $DATABASE_URL -f seeds/5º_Seed_initial_system_settings.sql
psql $DATABASE_URL -f seeds/6º_Seed_gemini_api_key.sql
psql $DATABASE_URL -f seeds/8º_Seed_insurance_companies_and_plans.sql

# Seeds opcionais (dados de exemplo)
psql $DATABASE_URL -f seeds/4º_Seed_example_doctor_schedules_horizontal.sql
psql $DATABASE_URL -f seeds/5º_Seed_exemplo_convenios_medicos.sql
```

## Passo 5: Criar Primeiro Usuário

1. Acesse o Authentication no Supabase Dashboard
2. Crie um usuário manualmente
3. Em User Metadata, adicione: `{"role": "owner"}`

## Passo 6: Iniciar Aplicação

```bash
npm run dev
```

## Verificação

- [ ] Aplicação abre em http://localhost:5173
- [ ] Login funciona
- [ ] Dashboard carrega sem erros
- [ ] Pode criar pacientes
- [ ] Realtime funciona (teste em 2 abas)
```

---

## 📋 RESUMO DAS AÇÕES IMEDIATAS

### ✅ Fazer AGORA (Crítico)

1. **Aplicar Migration 52** (Ativar RLS nas tabelas legadas)
   - Arquivo criado acima
   - Resolver vulnerabilidade de segurança

2. **Fazer Backup Completo**
   - Exportar schema atual
   - Exportar dados críticos
   - Guardar em local seguro

### ⏭️ Fazer em Seguida (Alta Prioridade)

3. **Aplicar Migration 53** (Reconciliação)
   - Arquivo criado acima
   - Garantir que todas as colunas existam

4. **Executar Script de Validação**
   - Verificar se tudo está correto
   - Identificar problemas remanescentes

### 📝 Fazer Depois (Prioridade Média)

5. **Testar Replicação em Ambiente Limpo**
   - Criar novo projeto Supabase de teste
   - Aplicar todas as migrations
   - Verificar se tudo funciona

6. **Documentar Processo**
   - Finalizar guias
   - Criar vídeo tutorial (opcional)

---

## 🎉 RESULTADO ESPERADO

Após executar este plano:

✅ Todas as tabelas terão RLS ativado  
✅ Todas as migrations estarão documentadas  
✅ O projeto será totalmente replicável  
✅ Outra pessoa poderá configurar o banco do zero  
✅ Histórico completo de alterações estará disponível  
✅ Backups estarão seguros  

---

**Próximo Passo Sugerido:** Aplicar imediatamente a Migration 52 (RLS nas tabelas legadas)

