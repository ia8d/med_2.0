-- Descrição: Guia de debug para problemas de telefone não encontrado no menu WhatsApp
-- Data: 2025-10-11
-- Autor: Sistema MedX

# 🐛 Debug: Telefone Não Encontrado no WhatsApp

## 📋 Problema Reportado

**Sintoma:** Ao tentar enviar mensagem, aparece erro "Paciente não possui número de telefone cadastrado", mesmo quando o telefone existe.

---

## 🔍 Como Investigar

### 1. Logs Detalhados no Console

Agora o sistema gera logs completos. Abra o **Console do navegador** (F12) e observe:

**Ao selecionar uma conversa:**

```
[WhatsApp] 🔍 Buscando telefone para sessão: 550e8400-e29b-41d4-a716-446655440000
[WhatsApp] Tentando buscar em patients...
[WhatsApp] Resultado patients: {
  error: null,
  data: { phone: "5511987654321" },
  phone: "5511987654321"
}
[WhatsApp] ✅ Telefone encontrado em patients: 5511987654321
```

**Se não encontrar:**

```
[WhatsApp] 🔍 Buscando telefone para sessão: 550e8400-...
[WhatsApp] Tentando buscar em patients...
[WhatsApp] Resultado patients: {
  error: null,
  data: null,
  phone: undefined
}
[WhatsApp] Tentando buscar em pre_patients...
[WhatsApp] Resultado pre_patients: {
  error: null,
  data: null,
  phone: undefined
}
[WhatsApp] ⚠️ Nenhum telefone encontrado em ambas as tabelas
```

### 2. Indicador Visual no Header

Agora você verá o status do telefone diretamente na interface:

```
┌─────────────────────────────────────────┐
│ [Avatar] João Silva                     │
│          42 mensagens • Tel: 5511...    │ ← VERDE se encontrou
└─────────────────────────────────────────┘

OU

┌─────────────────────────────────────────┐
│ [Avatar] João Silva                     │
│          42 mensagens • Sem telefone    │ ← LARANJA se não encontrou
└─────────────────────────────────────────┘
```

### 3. Logs ao Tentar Enviar

**Ao clicar em Enviar:**

```
[WhatsApp] 📞 Verificando telefone: {
  patientPhone: "5511987654321",
  type: "string",
  trimmed: "5511987654321",
  length: 13
}
📤 Enviando mensagem via WhatsApp: { ... }
```

**Se telefone estiver vazio:**

```
[WhatsApp] 📞 Verificando telefone: {
  patientPhone: "",
  type: "string",
  trimmed: "",
  length: 0
}
[WhatsApp] ❌ Telefone inválido ou vazio
```

---

## 🔧 Possíveis Causas e Soluções

### Causa 1: Telefone é uma String Vazia

**Problema:** O campo `phone` existe no banco, mas está vazio: `""`

**Como verificar no Supabase:**

```sql
SELECT id, name, phone, LENGTH(phone) as phone_length
FROM patients
WHERE id = 'UUID_DA_SESSAO';
```

**Solução:** Atualizar o telefone no banco:

```sql
UPDATE patients
SET phone = '5511987654321'
WHERE id = 'UUID_DA_SESSAO';
```

### Causa 2: UUID Não Corresponde

**Problema:** O `session_id` na tabela `medx_history` não corresponde ao `id` em `patients` ou `pre_patients`.

**Como verificar:**

```sql
-- Pegar o session_id de uma mensagem
SELECT DISTINCT session_id
FROM medx_history
LIMIT 10;

-- Verificar se existe em patients
SELECT id, name, phone
FROM patients
WHERE id = 'SESSION_ID_AQUI';

-- Verificar se existe em pre_patients
SELECT id, name, phone
FROM pre_patients
WHERE id = 'SESSION_ID_AQUI';
```

**Solução:** Garantir que o UUID seja o mesmo em todas as tabelas.

### Causa 3: Telefone com Espaços ou Caracteres Especiais

**Problema:** Telefone tem espaços extras ou caracteres invisíveis.

**Como verificar:**

```sql
SELECT 
  id, 
  name, 
  phone,
  LENGTH(phone) as len,
  LENGTH(TRIM(phone)) as len_trimmed,
  phone = TRIM(phone) as is_clean
FROM patients
WHERE id = 'UUID_DA_SESSAO';
```

**Solução:** Limpar o telefone:

```sql
UPDATE patients
SET phone = TRIM(phone)
WHERE phone != TRIM(phone);
```

### Causa 4: Permissões RLS

**Problema:** Row Level Security (RLS) está bloqueando a leitura do campo `phone`.

**Como verificar:**

1. Abra o Supabase Dashboard
2. Vá em **Authentication > Policies**
3. Verifique as policies da tabela `patients` e `pre_patients`
4. Certifique-se que `owner` e `secretary` podem ler o campo `phone`

**Solução:** Ajustar policies se necessário:

```sql
-- Exemplo de policy para secretary
CREATE POLICY "secretary_read_patients"
ON patients
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role IN ('owner', 'secretary')
  )
);
```

### Causa 5: Campo com Nome Diferente

**Problema:** O campo não se chama `phone`, mas sim `telefone`, `celular`, `whatsapp`, etc.

**Como verificar:**

```sql
-- Ver estrutura da tabela
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;
```

**Solução:** Ajustar o código para buscar o campo correto.

---

## 🧪 Teste Passo a Passo

### 1. Selecione a Conversa

1. Abra o menu WhatsApp
2. Abra o Console (F12)
3. Selecione uma conversa
4. **COPIE E COLE AQUI** os logs que aparecem

### 2. Verifique o Indicador Visual

- O que aparece no header? "Tel: ..." ou "Sem telefone"?

### 3. Tente Enviar Mensagem

1. Digite "teste"
2. Clique em Enviar
3. **COPIE E COLE AQUI** os logs que aparecem

### 4. Verifique o Banco de Dados

Execute no SQL Editor do Supabase:

```sql
-- Substitua pelo UUID da sessão que você está testando
SELECT 
  'patients' as tabela,
  id,
  name,
  phone,
  LENGTH(phone) as phone_length,
  phone IS NULL as phone_is_null,
  phone = '' as phone_is_empty
FROM patients
WHERE id = 'COLE_O_UUID_AQUI'

UNION ALL

SELECT 
  'pre_patients' as tabela,
  id,
  name,
  phone,
  LENGTH(phone) as phone_length,
  phone IS NULL as phone_is_null,
  phone = '' as phone_is_empty
FROM pre_patients
WHERE id = 'COLE_O_UUID_AQUI';
```

**COPIE E COLE O RESULTADO AQUI**

---

## 📊 Exemplo de Debug Completo

### Cenário Real:

**Logs no console:**

```
[WhatsApp] 🔍 Buscando telefone para sessão: 550e8400-e29b-41d4-a716-446655440000
[WhatsApp] Tentando buscar em patients...
[WhatsApp] Resultado patients: {
  error: null,
  data: { phone: "" },
  phone: ""
}
[WhatsApp] Tentando buscar em pre_patients...
[WhatsApp] Resultado pre_patients: {
  error: { code: "PGRST116", message: "No rows found" },
  data: null,
  phone: undefined
}
[WhatsApp] ⚠️ Nenhum telefone encontrado em ambas as tabelas
```

**Análise:**

- ✅ Registro existe em `patients`
- ❌ Campo `phone` é uma string vazia `""`
- ❌ Não existe em `pre_patients` (erro PGRST116)

**Solução:**

```sql
UPDATE patients
SET phone = '5511987654321'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

---

## ✅ Checklist de Verificação

Siga esta ordem para identificar o problema:

- [ ] **1. Logs do console mostram o UUID correto?**
  - Se não: O `selectedSessionId` pode estar errado

- [ ] **2. A busca retorna dados (`data: {...}`)?**
  - Se não: O UUID não existe na tabela

- [ ] **3. O campo `phone` está presente no objeto?**
  - Se não: O campo pode ter outro nome

- [ ] **4. O valor de `phone` é uma string vazia?**
  - Se sim: Atualizar o telefone no banco

- [ ] **5. O valor de `phone` tem espaços ou caracteres estranhos?**
  - Se sim: Fazer TRIM no banco

- [ ] **6. O indicador visual mostra o telefone?**
  - Se não: Há problema na busca ou no banco

- [ ] **7. A query SQL manual retorna o telefone?**
  - Se sim mas o sistema não: Problema de permissões (RLS)
  - Se não: Telefone realmente não existe

---

## 🚨 Ação Imediata

**Faça isso agora:**

1. Abra o Console (F12)
2. Selecione a conversa com problema
3. **ME ENVIE** os logs que aparecem (começando com `[WhatsApp]`)
4. **ME ENVIE** uma screenshot do header mostrando se aparece "Tel: ..." ou "Sem telefone"

Com essas informações, conseguiremos identificar exatamente o problema! 🎯

---

**Documento criado em:** 2025-10-11  
**Status:** Aguardando logs do usuário

