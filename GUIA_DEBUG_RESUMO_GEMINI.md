# 🔍 Guia de Debug - Resumo com Gemini

## 🎯 Objetivo
Este guia te ajudará a identificar exatamente onde o processo está travando.

---

## ✅ Confirmado via MCP

### **API Key do Gemini está configurada:**
```
✅ key: gemini_api_key
✅ value: AIzaSyD_ef7vgky9pxg6rWrXqW2MFU_GOp18aXI
✅ is_active: true
```

### **Permissões RLS estão corretas:**
```
✅ SELECT permitido para is_active = true
✅ Políticas configuradas corretamente
```

---

## 🧪 Teste Novamente

### **Passo 1: Abrir Console (F12)**
- Chrome/Edge: Pressione `F12`
- Firefox: Pressione `F12`

### **Passo 2: Limpar Console**
- Clique no ícone 🚫 ou pressione `Ctrl + L`

### **Passo 3: Acessar WhatsApp**
```
Dashboard → Menu WhatsApp
```

### **Passo 4: Selecionar Conversa**
- Clique em **qualquer conversa** da lista

### **Passo 5: Gerar Resumo**
- Clique no ícone **📄** (Gerar resumo)
- Selecione o período: **"Dia atual"**
- Clique em **"Gerar Análise"**

### **Passo 6: Observar Logs no Console**

Agora você verá logs **MUITO MAIS DETALHADOS**:

---

## 📊 Logs Esperados (em ordem)

### **1. Início**
```
📥 Buscando mensagens da sessão: [ID]
🔄 Período selecionado: dia_atual
```

### **2. Mensagens Recebidas**
```
📨 Mensagens recebidas: [Array]
✅ [X] mensagens encontradas
📋 Primeira mensagem: {...}
```

### **3. Início da Análise**
```
🤖 Iniciando análise com Gemini...
⏳ Aguarde, isso pode levar alguns segundos...
🔍 [analyzeConversation] Iniciando análise de conversa com Gemini...
📊 [analyzeConversation] Session ID: [ID]
📅 [analyzeConversation] Período: dia_atual
💬 [analyzeConversation] Total de mensagens: [X]
📋 [analyzeConversation] Estrutura da primeira mensagem: {...}
```

### **4. Filtro de Período**
```
🔄 [analyzeConversation] Filtrando mensagens por período...
📝 [analyzeConversation] Mensagens no período: [X]
```

### **5. Busca da API Key**
```
🔑 [analyzeConversation] Buscando API key do Gemini...
🔍 [getSystemSetting] Buscando configuração: gemini_api_key
📊 [getSystemSetting] Resultado para 'gemini_api_key': {data: {...}, error: null}
✅ [getSystemSetting] Valor encontrado para 'gemini_api_key': AIzaSyD_ef7vgky9pxg...
🔐 [analyzeConversation] API key recebida: Sim (length: 39)
✅ [analyzeConversation] API key validada com sucesso!
```

### **6. Formatação**
```
📝 [analyzeConversation] Formatando mensagens para análise...
✅ [analyzeConversation] Mensagens formatadas. Tamanho: [X] caracteres
```

### **7. Cálculo de Métricas**
```
📊 [analyzeConversation] Calculando métricas básicas...
✅ [analyzeConversation] Métricas calculadas: {total_mensagens: X, ...}
```

### **8. Preparação do Prompt**
```
🎯 [analyzeConversation] Preparando prompt para Gemini...
✅ [analyzeConversation] Prompt preparado. Tamanho: [X] caracteres
```

### **9. Requisições ao Gemini**
```
🚀 [analyzeConversation] Iniciando requisições para Gemini API...
📋 [analyzeConversation] Modelos a tentar: [...]
🔄 [analyzeConversation] Tentando modelo: gemini-2.0-flash...
```

### **10. Sucesso**
```
✅ Modelo gemini-2.0-flash funcionou!
📥 Resposta recebida do Gemini
✅ Análise de conversa concluída com sucesso!
📊 Resumo recebido: {...}
```

---

## 🚨 Identificar Onde Trava

### **Se travar DEPOIS de:**

#### **"📥 Buscando mensagens da sessão"**
**Problema:** Não consegue buscar mensagens do banco

**Solução:**
1. Verifique se está autenticado
2. Verifique permissões RLS na tabela `medx_history`
3. Execute no console:
```javascript
await supabase.from('medx_history').select('*').limit(1)
```

---

#### **"🔑 Buscando API key do Gemini"**
**Problema:** Não consegue buscar a API key

**Solução:**
1. Verifique se está autenticado
2. Execute no console:
```javascript
const { data, error } = await supabase
  .from('system_settings')
  .select('value')
  .eq('key', 'gemini_api_key')
  .eq('is_active', true)
  .single();
console.log({ data, error });
```

---

#### **"🚀 Iniciando requisições para Gemini API"**
**Problema:** Requisição ao Gemini está travando ou falhando

**Possíveis causas:**
1. **Problema de CORS** (bloqueio de navegador)
2. **API Key inválida**
3. **Região não suportada**
4. **Firewall/Proxy bloqueando**

**Solução:**
1. Teste a API Key manualmente:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyD_ef7vgky9pxg6rWrXqW2MFU_GOp18aXI" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Olá"}]}]}'
```

2. Verifique no console se há erro de CORS:
```
Access to fetch at 'https://generativelanguage.googleapis.com...' has been blocked by CORS policy
```

3. Se houver erro CORS, adicione o domínio permitido na API Key do Gemini:
   - https://makersuite.google.com/app/apikey
   - Editar API Key → Application restrictions → HTTP referrers

---

## 🔧 Testes Manuais no Console

### **1. Testar Supabase**
```javascript
// Testar conexão
const { data: user } = await supabase.auth.getUser();
console.log('Usuário:', user);

// Testar system_settings
const { data: settings, error } = await supabase
  .from('system_settings')
  .select('*')
  .eq('is_active', true);
console.log('Settings:', settings, 'Error:', error);

// Testar medx_history
const { data: msgs, error: msgsError } = await supabase
  .from('medx_history')
  .select('*')
  .limit(5);
console.log('Mensagens:', msgs, 'Error:', msgsError);
```

### **2. Testar API do Gemini**
```javascript
// Testar Gemini API diretamente
const apiKey = 'AIzaSyD_ef7vgky9pxg6rWrXqW2MFU_GOp18aXI';
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: 'Diga olá' }]
      }]
    })
  }
);

const data = await response.json();
console.log('Resposta do Gemini:', data);
```

---

## 📋 Checklist de Verificação

### **Antes de Testar:**
- [ ] Console aberto (F12)
- [ ] Console limpo
- [ ] Rede estável
- [ ] Autenticado no sistema

### **Durante o Teste:**
- [ ] Observar TODOS os logs
- [ ] Anotar onde trava
- [ ] Copiar mensagem de erro (se houver)
- [ ] Verificar aba Network (F12 → Network)

### **Depois do Teste:**
- [ ] Copiar TODOS os logs do console
- [ ] Verificar se há erros em vermelho
- [ ] Verificar requisições HTTP na aba Network
- [ ] Reportar onde exatamente travou

---

## 🎯 Próximos Passos

### **1. Execute o teste** conforme descrito acima

### **2. Me informe EXATAMENTE onde travou:**
- Qual foi o **último log** que apareceu?
- Há algum **erro em vermelho**?
- Há algo na **aba Network** (requisições HTTP)?

### **3. Execute os testes manuais** no console se necessário

---

## 💡 Dica Extra

Se quiser ver TUDO que está acontecendo, ative logs detalhados:

```javascript
// No console, execute:
localStorage.setItem('debug', '*');
```

Depois recarregue a página (F5) e teste novamente.

---

## 📞 Informações para Reportar

Quando testar, me envie:

1. **Último log que apareceu no console**
2. **Mensagens de erro (se houver)**
3. **Screenshot dos logs**
4. **Resposta dos testes manuais** (se executou)

Com essas informações, conseguirei identificar exatamente o problema! 🎯

---

**Status:** 🔍 Debug Mode Ativado  
**Versão:** 1.0 com logs detalhados  
**Data:** 11/10/2025

