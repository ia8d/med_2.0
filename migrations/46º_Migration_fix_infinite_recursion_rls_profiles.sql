-- Descrição: Correção de recursão infinita nas políticas RLS da tabela profiles
-- Data: 2025-10-24
-- Autor: Sistema MedX - Correção de Segurança
-- Contexto: As políticas RLS criadas anteriormente causavam erro de recursão infinita
--           durante o login porque faziam subquery na própria tabela profiles.
--           Esta migration implementa uma solução usando função auxiliar SECURITY DEFINER.

-- ====================================================================================
-- PROBLEMA IDENTIFICADO
-- ====================================================================================

-- Erro: "infinite recursion detected in policy for relation 'profiles'"
-- 
-- Causa: As políticas faziam subquery na tabela profiles para verificar role:
--   EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'owner')
--
-- Quando o usuário tenta fazer login:
--   1. Sistema tenta SELECT na tabela profiles
--   2. Política RLS verifica se usuário tem perfil (SELECT profiles)
--   3. Sistema tenta SELECT na tabela profiles (LOOP!)
--   4. ❌ ERROR: infinite recursion

-- ====================================================================================
-- ETAPA 1: REMOVER POLÍTICAS COM RECURSÃO
-- ====================================================================================

DROP POLICY IF EXISTS "authenticated_users_can_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "owners_can_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile_or_owner_all" ON profiles;
DROP POLICY IF EXISTS "only_owners_can_delete_profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- ====================================================================================
-- ETAPA 2: CRIAR FUNÇÃO AUXILIAR SEM RECURSÃO
-- ====================================================================================

-- Esta função usa SECURITY DEFINER para executar com privilégios do criador,
-- efetivamente bypassando as políticas RLS e evitando recursão
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER  -- ⚠️ Executa com privilégios do criador, bypassa RLS
SET search_path = public
STABLE  -- Resultado não muda durante uma transação
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Busca role do usuário atual sem acionar políticas RLS
  SELECT role INTO user_role
  FROM profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
  
  -- Retorna a role ou string vazia se não encontrar
  RETURN COALESCE(user_role, '');
END;
$$;

-- Comentário explicativo da função
COMMENT ON FUNCTION get_user_role() IS 
  'Retorna a role do usuário autenticado sem causar recursão nas políticas RLS. '
  'Usa SECURITY DEFINER para bypassar RLS internamente.';

-- ====================================================================================
-- ETAPA 3: CRIAR POLÍTICAS RLS SEM RECURSÃO
-- ====================================================================================

-- POLÍTICA SELECT: Usuários autenticados podem ver todos os perfis
-- Sem recursão - usa USING (true) porque todos precisam ver perfis
CREATE POLICY "select_profiles_authenticated" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON POLICY "select_profiles_authenticated" ON profiles IS
  'Permite todos os usuários autenticados visualizarem perfis. '
  'Necessário para listagens de médicos, secretárias, etc.';

-- POLÍTICA INSERT: Apenas owners podem criar novos perfis
-- Usa função auxiliar que não causa recursão
CREATE POLICY "insert_profiles_owner_only" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'owner');

COMMENT ON POLICY "insert_profiles_owner_only" ON profiles IS
  'Apenas usuários com role owner podem criar novos perfis. '
  'Usa função auxiliar get_user_role() para evitar recursão.';

-- POLÍTICA UPDATE: Usuários podem atualizar próprio perfil, owners podem atualizar todos
-- Combina verificação direta (auth_user_id) com função auxiliar
CREATE POLICY "update_profiles_own_or_owner" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth_user_id = auth.uid() OR  -- Próprio perfil (verificação direta)
    get_user_role() = 'owner'      -- Ou é owner (função auxiliar)
  )
  WITH CHECK (
    auth_user_id = auth.uid() OR
    get_user_role() = 'owner'
  );

COMMENT ON POLICY "update_profiles_own_or_owner" ON profiles IS
  'Usuários podem atualizar seu próprio perfil. Owners podem atualizar qualquer perfil. '
  'Usa verificação direta (auth_user_id) primeiro, depois função auxiliar para owners.';

-- POLÍTICA DELETE: Apenas owners podem deletar perfis
-- Proteção crítica usando função auxiliar
CREATE POLICY "delete_profiles_owner_only" ON profiles
  FOR DELETE
  TO authenticated
  USING (get_user_role() = 'owner');

COMMENT ON POLICY "delete_profiles_owner_only" ON profiles IS
  '⚠️ POLÍTICA CRÍTICA: Apenas owners podem deletar perfis. '
  'Usa função auxiliar get_user_role() para evitar recursão.';

-- ====================================================================================
-- VALIDAÇÃO
-- ====================================================================================

-- Verificar que todas as políticas foram criadas corretamente
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'profiles';
  
  IF policy_count != 4 THEN
    RAISE EXCEPTION 'Esperado 4 políticas, encontrado %', policy_count;
  END IF;
  
  RAISE NOTICE '✅ Todas as 4 políticas RLS foram criadas com sucesso';
END $$;

-- Testar função auxiliar
DO $$
DECLARE
  test_result TEXT;
BEGIN
  SELECT get_user_role() INTO test_result;
  RAISE NOTICE '✅ Função get_user_role() está funcionando (retornou: %)', 
    COALESCE(test_result, 'NULL');
END $$;

-- ====================================================================================
-- RESUMO DA SOLUÇÃO
-- ====================================================================================

-- ❌ PROBLEMA:
--    Políticas RLS faziam subquery na própria tabela profiles -> recursão infinita
--
-- ✅ SOLUÇÃO:
--    1. Função auxiliar get_user_role() com SECURITY DEFINER bypassa RLS
--    2. SELECT usa USING (true) - sem verificação complexa
--    3. INSERT/DELETE usam função auxiliar para verificar role
--    4. UPDATE combina verificação direta com função auxiliar
--
-- 🔒 SEGURANÇA MANTIDA:
--    - SELECT: Todos autenticados podem ver (necessário para o sistema)
--    - INSERT: Apenas owners podem criar
--    - UPDATE: Próprio perfil ou owner
--    - DELETE: Apenas owners (proteção crítica)
--
-- ⚡ PERFORMANCE:
--    - SECURITY DEFINER bypassa RLS internamente (rápido)
--    - STABLE garante cache do resultado durante transação
--    - Verificação direta de auth_user_id evita função quando possível

-- ====================================================================================
-- TESTES SUGERIDOS
-- ====================================================================================

-- Após aplicar esta migration, testar:
-- 1. ✅ Login de usuário owner
-- 2. ✅ Login de usuário doctor
-- 3. ✅ Login de usuário secretary
-- 4. ✅ Listagem de perfis no sistema
-- 5. ✅ Edição do próprio perfil
-- 6. ✅ Owner editando perfil de outro usuário
-- 7. ❌ Não-owner tentando deletar perfil (deve falhar)
-- 8. ❌ Não-owner tentando criar perfil (deve falhar)


