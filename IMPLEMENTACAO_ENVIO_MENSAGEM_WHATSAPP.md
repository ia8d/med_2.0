-- Descrição: Implementação completa do envio de mensagens via WhatsApp no menu de conversas
-- Data: 2025-10-11
-- Autor: Sistema MedX

# 📱 Implementação: Envio de Mensagens via WhatsApp

## 📋 Visão Geral

Implementação da funcionalidade de **envio de mensagens** no menu WhatsApp, permitindo que usuários (owner e secretary) enviem mensagens de texto para pacientes e pré-pacientes diretamente pela interface do sistema.

---

## 🎯 Funcionalidade Implementada

### O que foi desenvolvido:

✅ **Envio de mensagens via API externa**  
✅ **Validações completas** (sessão, telefone, texto, usuário)  
✅ **Loading states visuais** (spinner no botão)  
✅ **Feedback de sucesso/erro** (toast notifications)  
✅ **Atualização automática da interface** (TanStack Query invalidation)  
✅ **Integração com AuthContext** (nome do usuário logado)  
✅ **Logs detalhados** para debug

---

## 🔧 Alterações Realizadas

### 1. Imports Adicionados

**Arquivo:** `src/pages/WhatsApp.tsx`

```typescript
import { Loader2 } from 'lucide-react';           // Ícone de loading
import { useAuth } from '@/contexts/AuthContext';  // Contexto de autenticação
import { getApiBaseUrl } from '@/lib/apiConfig';   // URL da API
import { toast } from 'sonner';                    // Notificações
```

### 2. Estados Adicionados

```typescript
const { user } = useAuth();                        // Usuário logado
const [sending, setSending] = useState(false);     // Estado de envio
```

### 3. Função `handleSendMessage()` Completa

**Fluxo de execução:**

```
1. Validações básicas
   ├─ Mensagem não vazia
   ├─ Sessão selecionada
   ├─ Telefone do paciente existe
   └─ Usuário autenticado

2. Preparação dos dados
   └─ Trim do texto e log dos dados

3. Ativar loading state
   └─ setSending(true)

4. Buscar URL base da API
   └─ await getApiBaseUrl()

5. Fazer requisição POST
   ├─ Endpoint: /enviar-mensagem
   ├─ Body: { session_id, numero_paciente, texto, nome_login }
   └─ Headers: Content-Type: application/json

6. Verificar resposta
   ├─ Se erro: lançar exceção
   └─ Se sucesso: processar resultado

7. Feedback de sucesso
   ├─ Toast de sucesso
   ├─ Limpar campo de texto
   └─ Invalidar queries (atualizar interface)

8. Tratamento de erros
   ├─ Log do erro
   ├─ Toast de erro
   └─ Manter texto digitado

9. Finalização
   └─ setSending(false)
```

**Código completo:**

```typescript
const handleSendMessage = async () => {
  // 1. Validações básicas
  if (!messageText.trim()) {
    toast.error('Digite uma mensagem antes de enviar');
    return;
  }

  if (!selectedSessionId) {
    toast.error('Selecione uma conversa primeiro');
    return;
  }

  if (!patientPhone) {
    toast.error('Paciente não possui número de telefone cadastrado');
    return;
  }

  if (!user?.name) {
    toast.error('Usuário não identificado. Faça login novamente.');
    return;
  }

  // 2. Preparar dados
  const messageToSend = messageText.trim();
  
  console.log('📤 Enviando mensagem via WhatsApp:', {
    session_id: selectedSessionId,
    numero_paciente: patientPhone,
    texto: messageToSend,
    nome_login: user.name,
  });

  // 3. Ativar loading
  setSending(true);

  try {
    // 4. Buscar URL base da API
    const apiBaseUrl = await getApiBaseUrl();
    
    // 5. Fazer requisição para o endpoint
    const response = await fetch(`${apiBaseUrl}/enviar-mensagem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: selectedSessionId,
        numero_paciente: patientPhone,
        texto: messageToSend,
        nome_login: user.name,
      }),
    });

    // 6. Verificar resposta
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Erro ao enviar mensagem: ${response.status}`
      );
    }

    const result = await response.json();
    console.log('✅ Resposta do servidor:', result);

    // 7. Sucesso - limpar campo e mostrar feedback
    toast.success('Mensagem enviada com sucesso!');
    setMessageText('');

    // 8. Atualizar interface
    queryClient.invalidateQueries({ queryKey: ['medx_messages', selectedSessionId] });
    queryClient.invalidateQueries({ queryKey: ['medx_sessions'] });

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro ao enviar mensagem. Tente novamente.';
    
    toast.error(errorMessage);
  } finally {
    setSending(false);
  }
};
```

### 4. Interface Atualizada

**Barra de mensagens com loading state:**

```tsx
<div className="flex items-center gap-2">
  <Input
    placeholder="Digite sua mensagem..."
    value={messageText}
    onChange={(e) => setMessageText(e.target.value)}
    onKeyPress={handleKeyPress}
    disabled={!selectedSessionId || sending}  // ← Desabilita durante envio
    className="flex-1"
  />
  <Button
    onClick={handleSendMessage}
    disabled={!messageText.trim() || !selectedSessionId || sending}  // ← Desabilita durante envio
    size="icon"
    className="shrink-0"
  >
    {sending ? (
      <Loader2 className="h-4 w-4 animate-spin" />  // ← Spinner
    ) : (
      <Send className="h-4 w-4" />  // ← Ícone normal
    )}
  </Button>
</div>
```

**Estados do botão:**

| Estado | Condição | Visual |
|--------|----------|--------|
| **Ativo** | Texto digitado + sessão selecionada + não enviando | Botão azul com ícone Send |
| **Desabilitado** | Sem texto OU sem sessão | Botão cinza |
| **Enviando** | `sending === true` | Botão com spinner animado |

---

## 📡 Integração com API

### Endpoint

**URL:** `${apiBaseUrl}/enviar-mensagem`  
**Método:** POST  
**Content-Type:** application/json

### Request Body

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "numero_paciente": "5511987654321",
  "texto": "Olá! Como posso ajudar?",
  "nome_login": "Maria Silva"
}
```

**Campos:**

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `session_id` | string (UUID) | ID da sessão/conversa (mesmo ID do paciente/pré-paciente) | `"550e8400-..."` |
| `numero_paciente` | string | Número de telefone do paciente (com código do país) | `"5511987654321"` |
| `texto` | string | Mensagem de texto a ser enviada | `"Olá! Como posso ajudar?"` |
| `nome_login` | string | Nome completo do usuário logado | `"Maria Silva"` |

### Response Esperada (Sucesso)

```json
{
  "success": true,
  "message_id": "wamid.HBgLNTUxMTk4NzY1NDMyMRUCABEYEjFBNUIyQzNENEU1RjZHNzhIAA==",
  "status": "sent",
  "timestamp": "2025-10-11T14:30:00.000Z"
}
```

### Response Esperada (Erro)

```json
{
  "success": false,
  "error": "Número de telefone inválido",
  "code": "INVALID_PHONE"
}
```

---

## 🔐 Validações Implementadas

### Validações antes do envio:

1. **Mensagem não vazia**
   ```typescript
   if (!messageText.trim()) {
     toast.error('Digite uma mensagem antes de enviar');
     return;
   }
   ```

2. **Sessão selecionada**
   ```typescript
   if (!selectedSessionId) {
     toast.error('Selecione uma conversa primeiro');
     return;
   }
   ```

3. **Telefone do paciente existe**
   ```typescript
   if (!patientPhone) {
     toast.error('Paciente não possui número de telefone cadastrado');
     return;
   }
   ```

4. **Usuário autenticado**
   ```typescript
   if (!user?.name) {
     toast.error('Usuário não identificado. Faça login novamente.');
     return;
   }
   ```

### Validações de resposta da API:

```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(
    errorData.error || `Erro ao enviar mensagem: ${response.status}`
  );
}
```

---

## 🎨 Feedback Visual

### Toast Notifications

**Sucesso:**
```typescript
toast.success('Mensagem enviada com sucesso!');
```

**Erros:**
```typescript
// Sem mensagem digitada
toast.error('Digite uma mensagem antes de enviar');

// Sem sessão selecionada
toast.error('Selecione uma conversa primeiro');

// Sem telefone
toast.error('Paciente não possui número de telefone cadastrado');

// Sem usuário
toast.error('Usuário não identificado. Faça login novamente.');

// Erro da API
toast.error(errorMessage);
```

### Loading States

**Input desabilitado:**
```typescript
disabled={!selectedSessionId || sending}
```

**Botão desabilitado:**
```typescript
disabled={!messageText.trim() || !selectedSessionId || sending}
```

**Spinner animado:**
```tsx
{sending ? (
  <Loader2 className="h-4 w-4 animate-spin" />
) : (
  <Send className="h-4 w-4" />
)}
```

---

## 🔄 Atualização Automática da Interface

### Invalidação de Queries

Após o envio bem-sucedido, as queries são invalidadas para atualizar a interface:

```typescript
// Atualizar lista de mensagens da conversa atual
queryClient.invalidateQueries({ 
  queryKey: ['medx_messages', selectedSessionId] 
});

// Atualizar lista de sessões (última mensagem, contador, etc.)
queryClient.invalidateQueries({ 
  queryKey: ['medx_sessions'] 
});
```

**O que isso faz:**

1. **Lista de mensagens:** Busca novamente as mensagens da conversa, incluindo a mensagem recém-enviada (se o webhook já inseriu no banco)
2. **Lista de sessões:** Atualiza o preview da última mensagem e o contador de mensagens

### Realtime

Se o sistema de webhook inserir a mensagem no banco (`medx_history`), o Realtime vai disparar automaticamente e atualizar a interface em tempo real:

```typescript
// Já implementado (linhas 242-272 do WhatsApp.tsx)
const channel = supabase
  .channel('realtime:medx_history-ui')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'medx_history' }, 
    (payload) => {
      // Invalidar queries automaticamente
    }
  )
  .subscribe();
```

---

## 🐛 Tratamento de Erros

### Tipos de Erro

| Erro | Causa | Mensagem |
|------|-------|----------|
| **Validação** | Campo vazio ou inválido | Mensagens específicas via toast |
| **Rede** | Timeout ou sem conexão | `"Erro ao enviar mensagem. Tente novamente."` |
| **API** | Erro no servidor (4xx, 5xx) | Mensagem do campo `error` da resposta |
| **Parsing** | Resposta inválida | `"Erro ao enviar mensagem. Tente novamente."` |

### Logs de Debug

**Sucesso:**
```
📤 Enviando mensagem via WhatsApp: { session_id, numero_paciente, texto, nome_login }
✅ Resposta do servidor: { ... }
```

**Erro:**
```
❌ Erro ao enviar mensagem: [Error message]
```

### Preservação de Dados

Em caso de erro:

- ✅ O texto digitado **NÃO é limpo** (usuário pode tentar novamente)
- ✅ O estado `sending` é resetado para `false`
- ✅ O input e botão voltam ao estado normal

---

## 🧪 Como Testar

### 1. Teste Básico (Caminho Feliz)

1. Faça login como `owner` ou `secretary`
2. Acesse o menu **WhatsApp**
3. Selecione uma conversa com telefone cadastrado
4. Digite uma mensagem (ex: "Teste de envio")
5. Clique no botão **Enviar** ou pressione **Enter**
6. Verifique:
   - ✅ Botão mostra spinner durante envio
   - ✅ Input fica desabilitado durante envio
   - ✅ Toast de sucesso aparece
   - ✅ Campo de texto é limpo
   - ✅ Mensagem aparece na conversa (após atualização)

### 2. Teste de Validações

**Sem mensagem:**
1. Selecione uma conversa
2. Clique em **Enviar** sem digitar nada
3. Verifique: Toast "Digite uma mensagem antes de enviar"

**Sem conversa selecionada:**
1. Digite uma mensagem
2. Não selecione nenhuma conversa
3. Clique em **Enviar**
4. Verifique: Toast "Selecione uma conversa primeiro"

**Paciente sem telefone:**
1. Selecione uma conversa de paciente sem telefone cadastrado
2. Digite uma mensagem
3. Clique em **Enviar**
4. Verifique: Toast "Paciente não possui número de telefone cadastrado"

### 3. Teste de Erro de API

**Simular erro 500:**
1. Desconectar o webhook temporariamente
2. Tentar enviar mensagem
3. Verifique:
   - ✅ Toast de erro aparece
   - ✅ Texto digitado é preservado
   - ✅ Usuário pode tentar novamente

### 4. Teste de Loading State

1. Enviar mensagem em rede lenta
2. Tentar digitar durante o envio
3. Verifique:
   - ✅ Input fica desabilitado
   - ✅ Botão mostra spinner
   - ✅ Não é possível enviar novamente

### 5. Teste de Atalho de Teclado

1. Digite uma mensagem
2. Pressione **Enter**
3. Verifique: Mensagem é enviada (mesmo comportamento do botão)

---

## 📊 Logs do Console

### Durante o Envio

```
📤 Enviando mensagem via WhatsApp: {
  session_id: "550e8400-e29b-41d4-a716-446655440000",
  numero_paciente: "5511987654321",
  texto: "Olá! Como posso ajudar?",
  nome_login: "Maria Silva"
}
```

### Após Sucesso

```
✅ Resposta do servidor: {
  success: true,
  message_id: "wamid.xxxxx",
  status: "sent"
}
```

### Após Erro

```
❌ Erro ao enviar mensagem: Número de telefone inválido
```

---

## 🔗 Dependências

### Contextos

- **AuthContext:** Fornece `user.name` (nome do usuário logado)

### Bibliotecas

- **sonner:** Toast notifications
- **lucide-react:** Ícones (Send, Loader2)
- **@tanstack/react-query:** Cache e invalidação de queries

### Utilitários

- **getApiBaseUrl():** Busca URL base da API do `system_settings`
- **queryClient.invalidateQueries():** Força refetch das queries

---

## 🚀 Melhorias Futuras (Opcional)

### 1. Inserção Otimista

Mostrar a mensagem na interface **antes** da confirmação da API:

```typescript
// Adicionar mensagem temporária ao cache
queryClient.setQueryData(
  ['medx_messages', selectedSessionId],
  (old: any[]) => [...old, tempMessage]
);

// Se API falhar, remover mensagem temporária
```

**Benefício:** UX mais rápida e responsiva

### 2. Retry Automático

Tentar reenviar automaticamente em caso de falha de rede:

```typescript
let retries = 0;
const MAX_RETRIES = 3;

while (retries < MAX_RETRIES) {
  try {
    // Fazer requisição
    break;
  } catch (error) {
    retries++;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

**Benefício:** Maior confiabilidade em redes instáveis

### 3. Indicador de Digitação

Mostrar "... está digitando" quando o usuário está escrevendo:

```typescript
const [isTyping, setIsTyping] = useState(false);

// Debounce no onChange do Input
// Enviar sinal de "typing" para outros usuários
```

**Benefício:** Experiência mais próxima do WhatsApp real

### 4. Status de Entrega

Mostrar ícones de status (enviado, entregue, lido):

```typescript
// Adicionar campo status na mensagem
{message.status === 'sent' && <Check />}
{message.status === 'delivered' && <CheckCheck />}
{message.status === 'read' && <CheckCheck className="text-blue-500" />}
```

**Benefício:** Usuário sabe se a mensagem foi recebida

### 5. Upload de Arquivos

Permitir anexar imagens, documentos, etc.:

```tsx
<Button onClick={handleAttachFile}>
  <Paperclip className="h-4 w-4" />
</Button>
```

**Benefício:** Comunicação mais rica

---

## 📄 Arquivos Modificados

### `src/pages/WhatsApp.tsx`

**Linhas modificadas:**

- **Linha 14:** Import de `Loader2`
- **Linha 19:** Import de `useAuth`
- **Linha 20:** Import de `getApiBaseUrl`
- **Linha 21:** Import de `toast`
- **Linha 207:** Uso de `useAuth()` para pegar `user`
- **Linha 338:** Adicionar estado `sending`
- **Linhas 372-455:** Implementação completa de `handleSendMessage()`
- **Linhas 682-696:** Atualização da UI com loading state

**Total de alterações:** ~100 linhas (imports + função + UI)

---

## ✅ Checklist de Implementação

- [x] Importar bibliotecas necessárias
- [x] Adicionar estado `sending`
- [x] Integrar com `useAuth()` para pegar nome do usuário
- [x] Implementar validações básicas
- [x] Fazer requisição para API externa
- [x] Tratar erros e exceções
- [x] Adicionar feedback visual (toast)
- [x] Atualizar UI com loading state
- [x] Invalidar queries após sucesso
- [x] Testar caminho feliz
- [x] Testar validações
- [x] Documentar implementação

---

## 📚 Documentos Relacionados

- `ANALISE_COMPLETA_MENU_WHATSAPP.md` - Análise prévia do sistema
- `src/contexts/AuthContext.tsx` - Contexto de autenticação
- `src/lib/apiConfig.ts` - Configuração de API
- `src/lib/medxHistory.ts` - Funções de histórico
- `IMPLEMENTACAO_ENVIO_MEDICACAO_PACIENTE.md` - Implementação similar (referência)

---

**Implementação concluída em:** 2025-10-11  
**Autor:** Sistema MedX  
**Status:** ✅ Pronto para Produção

