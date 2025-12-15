-- Descrição: Seed de exemplo mostrando como cadastrar convênios para médicos
-- Data: 2025-10-28
-- Autor: Sistema MedX
-- ATENÇÃO: Este é um arquivo de EXEMPLO. Execute apenas em ambiente de desenvolvimento/testes.

-- ============================================
-- CONTEXTO
-- ============================================

-- Este seed demonstra como vincular convênios aos médicos do sistema.
-- Na produção, os médicos fazem isso pela interface web (menu "Convênios").

-- ============================================
-- IMPORTANTE: VERIFICAR IDS DOS MÉDICOS
-- ============================================

-- Antes de executar, verificar os IDs reais dos médicos:
-- SELECT id, name, email FROM profiles WHERE role = 'doctor';

-- ============================================
-- EXEMPLO 1: Dr. João (Cardiologista)
-- ============================================

-- Supondo que Dr. João aceita:
-- - Amil One Health
-- - Hapvida Premium
-- - Bradesco Saúde Top Nacional

-- Primeiro, encontrar os IDs dos planos:
/*
SELECT 
  ic.short_name as operadora,
  ip.name as plano,
  ip.id as plan_id
FROM insurance_plans ip
JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE ip.name IN ('Amil One Health', 'Hapvida Premium', 'Bradesco Saúde Top Nacional')
ORDER BY ic.short_name, ip.name;
*/

-- Depois, inserir os aceites (AJUSTAR OS IDs):
/*
INSERT INTO clinic_accepted_insurances (doctor_id, insurance_plan_id, is_active, notes)
VALUES 
  -- Dr. João aceita Amil One Health
  (
    (SELECT id FROM profiles WHERE email = 'joao@n8nlabz.com.br' AND role = 'doctor'),
    (SELECT id FROM insurance_plans WHERE name = 'Amil One Health'),
    true,
    'Cadastrado via seed de exemplo'
  ),
  -- Dr. João aceita Hapvida Premium
  (
    (SELECT id FROM profiles WHERE email = 'joao@n8nlabz.com.br' AND role = 'doctor'),
    (SELECT id FROM insurance_plans WHERE name = 'Hapvida Premium'),
    true,
    'Cadastrado via seed de exemplo'
  ),
  -- Dr. João aceita Bradesco Saúde Top Nacional
  (
    (SELECT id FROM profiles WHERE email = 'joao@n8nlabz.com.br' AND role = 'doctor'),
    (SELECT id FROM insurance_plans WHERE name = 'Bradesco Saúde Top Nacional'),
    true,
    'Cadastrado via seed de exemplo'
  );
*/

-- ============================================
-- EXEMPLO 2: Dra. Gabriella (Cardiologista)
-- ============================================

-- Supondo que Dra. Gabriella aceita:
-- - SulAmérica Prestige
-- - Unimed Nacional

/*
INSERT INTO clinic_accepted_insurances (doctor_id, insurance_plan_id, is_active, notes)
VALUES 
  -- Dra. Gabriella aceita SulAmérica Prestige
  (
    (SELECT id FROM profiles WHERE email = 'gabriella@n8nlabz.com.br' AND role = 'doctor'),
    (SELECT id FROM insurance_plans WHERE name = 'SulAmérica Prestige'),
    true,
    'Cadastrado via seed de exemplo'
  ),
  -- Dra. Gabriella aceita Unimed Nacional
  (
    (SELECT id FROM profiles WHERE email = 'gabriella@n8nlabz.com.br' AND role = 'doctor'),
    (SELECT id FROM insurance_plans WHERE name = 'Unimed Nacional'),
    true,
    'Cadastrado via seed de exemplo'
  );
*/

-- ============================================
-- EXEMPLO 3: Dr. Arthur (Endocrinologista)
-- ============================================

-- Supondo que Dr. Arthur aceita:
-- - Intermédica Smart 400
-- - Amil Fácil

/*
INSERT INTO clinic_accepted_insurances (doctor_id, insurance_plan_id, is_active, notes)
VALUES 
  -- Dr. Arthur aceita Intermédica Smart 400
  (
    (SELECT id FROM profiles WHERE email = 'arthur123@gmail.com' AND role = 'doctor'),
    (SELECT id FROM insurance_plans WHERE name = 'Smart 400'),
    true,
    'Cadastrado via seed de exemplo'
  ),
  -- Dr. Arthur aceita Amil Fácil
  (
    (SELECT id FROM profiles WHERE email = 'arthur123@gmail.com' AND role = 'doctor'),
    (SELECT id FROM insurance_plans WHERE name = 'Amil Fácil'),
    true,
    'Cadastrado via seed de exemplo'
  );
*/

-- ============================================
-- VERIFICAÇÃO PÓS-SEED
-- ============================================

-- Após executar, verificar se os dados foram inseridos corretamente:
/*
SELECT 
  p.name as medico,
  p.specialization as especialidade,
  ic.short_name as operadora,
  ip.name as plano,
  cai.is_active as ativo,
  cai.accepted_at as data_aceite
FROM clinic_accepted_insurances cai
JOIN profiles p ON p.id = cai.doctor_id
JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE cai.is_active = true
ORDER BY p.name, ic.short_name, ip.name;
*/

-- ============================================
-- VERIFICAR NA VIEW CONSOLIDADA
-- ============================================

-- Verificar o resultado na tabela doctors_insurance_summary:
/*
SELECT 
  doctor_name,
  doctor_specialty,
  total_insurance_companies as operadoras,
  total_insurance_plans as planos,
  insurance_plans_list as convenios
FROM doctors_insurance_summary
ORDER BY doctor_name;
*/

-- ============================================
-- COMO REMOVER UM CONVÊNIO
-- ============================================

-- Para desativar um convênio (não deletar):
/*
UPDATE clinic_accepted_insurances
SET 
  is_active = false,
  notes = 'Médico não aceita mais este convênio'
WHERE doctor_id = (SELECT id FROM profiles WHERE email = 'joao@n8nlabz.com.br')
  AND insurance_plan_id = (SELECT id FROM insurance_plans WHERE name = 'Amil One Health');
*/

-- Para deletar permanentemente:
/*
DELETE FROM clinic_accepted_insurances
WHERE doctor_id = (SELECT id FROM profiles WHERE email = 'joao@n8nlabz.com.br')
  AND insurance_plan_id = (SELECT id FROM insurance_plans WHERE name = 'Amil One Health');
*/

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. **Na produção:** Médicos cadastram via interface web (menu "Convênios")
2. **doctor_id:** Sempre usar profiles.id (não auth.users.id)
3. **insurance_plan_id:** ID do plano específico (não da operadora)
4. **is_active = true:** Apenas planos ativos aparecem na "Visão de Convênios"
5. **Trigger automático:** Ao inserir/atualizar, a tabela doctors_insurance_summary é atualizada automaticamente
6. **Realtime:** Mudanças aparecem instantaneamente na interface
*/

-- ============================================
-- FIM DO SEED DE EXEMPLO
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '📝 Seed de exemplo preparado!';
  RAISE NOTICE '   Este arquivo está COMENTADO por segurança.';
  RAISE NOTICE '   Descomente os blocos INSERT para executar em ambiente de desenvolvimento.';
  RAISE NOTICE '   NUNCA execute este seed em PRODUÇÃO sem verificar os IDs.';
END $$;

