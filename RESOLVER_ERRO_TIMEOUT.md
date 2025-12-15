# 🔥 RESOLVER ERRO DE TIMEOUT NO LOGIN

## 🎯 Problema Identificado

Você já tem o arquivo `.env.local` configurado, mas ao tentar fazer login está dando erro de **timeout**.

**Causa:** A função RPC `get_current_user_profile` não existe no seu banco de dados Supabase. O código tenta chamar essa função durante o login e fica esperando até dar timeout.

---

## ✅ Solução: Executar a Migration Faltante

Você precisa executar a migration SQL no seu banco de dados Supabase.

### **Passo 1: Abrir o Supabase**

1. Acesse: https://app.supabase.com/
2. Faça login
3. Selecione seu projeto

### **Passo 2: Abrir o SQL Editor**

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query** (Nova Consulta)

### **Passo 3: Copiar e Executar a Migration**

Copie o conteúdo do arquivo abaixo e cole no SQL Editor:

📁 **Arquivo:** `migrations/12º_Migration_create_get_current_user_profile_function.sql`

```sql
-- Descrição: Função RPC para obter o perfil do usuário autenticado atual
-- Data: 2025-10-06
-- Autor: Sistema MedX

-- Esta função é chamada pelo frontend durante o login para buscar os dados do perfil
-- Usa auth.uid() para pegar o ID do usuário autenticado automaticamente
-- Retorna os dados do perfil vinculado ao usuário autenticado

CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE(
  id UUID,
  auth_user_id UUID,
  name TEXT,
  role TEXT,
  crm TEXT,
  specialty TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Busca o perfil do usuário atualmente autenticado
  -- auth.uid() retorna o ID do usuário do Supabase Auth
  RETURN QUERY
  SELECT 
    p.id,
    p.auth_user_id,
    p.name,
    p.role,
    p.crm,
    p.specialty,
    p.phone,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.auth_user_id = auth.uid();
END;
$$;

-- Permite que usuários autenticados executem esta função
GRANT EXECUTE ON FUNCTION get_current_user_profile() TO authenticated;

-- Comentário para documentação
COMMENT ON FUNCTION get_current_user_profile() IS 
'Retorna o perfil do usuário atualmente autenticado. Usado durante o login e refresh de sessão.';
```

### **Passo 4: Executar**

1. Cole o código SQL no editor
2. Clique em **Run** (Executar) no canto inferior direito
3. Aguarde a confirmação de sucesso ✅

### **Passo 5: Verificar se Funcionou**

Execute este SQL para verificar se a função foi criada:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_current_user_profile';
```

✅ **Resultado esperado:** Deve retornar 1 linha com o nome `get_current_user_profile`

---

## 🧪 Testar o Login Novamente

Agora que a função foi criada:

### **1. Em Desenvolvimento (localhost)**

```bash
npm run dev
```

1. Acesse: http://localhost:8080
2. Tente fazer login
3. ✅ Deve funcionar sem timeout

### **2. Em Produção (Hostinger)**

Se você já fez o deploy:

1. Acesse seu subdomínio
2. Tente fazer login
3. ✅ Deve funcionar sem timeout

Se ainda não fez o deploy, siga o `DEPLOY_RAPIDO.md`

---

## 🔍 Como Verificar se o .env.local está Correto

Mesmo que a função esteja criada, você precisa garantir que as variáveis de ambiente estão corretas.

### **Verificar Localmente (Dev)**

Abra o terminal e execute:

```bash
# Windows PowerShell
Get-Content .env.local

# Windows CMD  
type .env.local

# Linux/Mac
cat .env.local
```

**Deve conter:**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

**Verificações:**
- ✅ Variáveis começam com `VITE_`
- ✅ URL começa com `https://` e termina com `.supabase.co`
- ✅ Anon Key é uma string longa (JWT token)
- ✅ Não tem aspas nas URLs
- ✅ Não tem espaços antes ou depois do `=`

### **Verificar em Produção (Build)**

Depois de fazer o build, você pode verificar se as variáveis foram incluídas:

```bash
npm run build
```

Depois, abra o arquivo gerado em `dist/assets/index-[hash].js` e procure por sua URL do Supabase. Se encontrar, as variáveis foram incluídas corretamente.

**Forma mais fácil:** Use o validador que criei:

```bash
npm run validate
```

---

## 🐛 Outros Problemas Possíveis

### ❌ Erro: "Invalid login credentials"

**Causa:** Email ou senha incorretos

**Solução:** Verifique as credenciais. Se necessário, crie um novo usuário.

### ❌ Erro: "Seu perfil não foi encontrado no sistema"

**Causa:** O usuário foi criado no Supabase Auth mas não tem registro na tabela `profiles`

**Solução:** Execute este SQL no Supabase para criar o perfil:

```sql
-- Substitua 'seu-email@exemplo.com' pelo email do usuário
INSERT INTO profiles (auth_user_id, name, role)
SELECT 
  id,
  email,
  'doctor'
FROM auth.users
WHERE email = 'seu-email@exemplo.com'
ON CONFLICT (auth_user_id) DO NOTHING;
```

### ❌ Erro: "Network error" ou "Failed to fetch"

**Causa:** Problema de conectividade ou URL do Supabase incorreta

**Soluções:**
1. Verifique sua conexão com a internet
2. Confirme que a `VITE_SUPABASE_URL` está correta
3. Verifique se o projeto Supabase está ativo (não pausado)
4. Abra o Console do navegador (F12) e veja o erro exato

### ❌ Erro: "CORS error"

**Causa:** Domínio não autorizado no Supabase

**Solução:**
1. Acesse o painel do Supabase
2. Vá em **Authentication** > **URL Configuration**
3. Adicione sua URL em **Site URL** e **Redirect URLs**:
   - Para dev: `http://localhost:8080`
   - Para produção: `https://seusubdominio.seudominio.com`

---

## 📋 Checklist Completo

Marque conforme for executando:

- [ ] Executei a migration `12º_Migration_create_get_current_user_profile_function.sql` no Supabase
- [ ] Verifiquei que a função foi criada com sucesso
- [ ] Confirmei que o `.env.local` existe e está correto
- [ ] Variáveis começam com `VITE_`
- [ ] URL e Anon Key estão corretas (copiadas do painel Supabase)
- [ ] Testei o login em desenvolvimento (localhost)
- [ ] Login funcionou sem timeout ✅
- [ ] (Opcional) Fiz o build e deploy para produção
- [ ] (Opcional) Testei o login em produção

---

## 🎯 Resumo Rápido

```bash
# 1. Execute a migration no Supabase (SQL Editor)
#    Arquivo: migrations/12º_Migration_create_get_current_user_profile_function.sql

# 2. Verifique o .env.local
type .env.local

# 3. Teste em dev
npm run dev

# 4. Tente fazer login
#    ✅ Deve funcionar sem timeout!
```

---

## 💡 Por Que Isso Aconteceu?

O sistema estava tentando chamar uma função RPC (`get_current_user_profile`) que:
- É usada para buscar os dados do perfil do usuário durante o login
- Precisa existir no banco de dados Supabase
- **Não estava criada** nas suas migrations anteriores

Quando a função não existe, o Supabase fica tentando executá-la por 15 segundos até dar timeout.

Agora com a migration executada, a função existe e o login funcionará instantaneamente! 🚀

---

## 📞 Ainda com Problemas?

Se após executar a migration ainda tiver erro de timeout:

1. **Abra o Console do navegador (F12)**
2. Vá na aba **Console**
3. Copie o erro completo que aparecer
4. Verifique se tem alguma mensagem específica sobre:
   - Conexão recusada
   - CORS
   - Credenciais inválidas
   - Outro erro específico

Com o erro exato do console, é mais fácil identificar o problema!

---

**Data:** 2025-10-06  
**Arquivo Criado:** `migrations/12º_Migration_create_get_current_user_profile_function.sql`

