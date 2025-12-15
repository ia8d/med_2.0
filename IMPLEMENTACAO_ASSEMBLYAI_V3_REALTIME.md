# Implementação AssemblyAI v3 Realtime - Histórico e Status

## 📋 Resumo
Integração da API v3 de transcrição em tempo real da AssemblyAI na página de Teleconsulta.

## 🔍 Descobertas do Protocolo v3

### 1. Endpoint WebSocket
```
wss://streaming.assemblyai.com/v3/ws?token=TEMPORARY_TOKEN
```

### 2. Fluxo de Autenticação
- Backend gera token temporário via: `GET https://streaming.assemblyai.com/v3/token` com header `Authorization: API_KEY`
- Token tem TTL máximo de 600 segundos
- Token é passado como query param no WebSocket

### 3. Mensagens do Servidor
```json
// Início da sessão
{"type": "Begin", "id": "...", "expires_at": timestamp}

// Transcrição parcial (não confirmado ainda)
{"type": "PartialTranscript", "text": "..."}

// Transcrição final (não confirmado ainda)
{"type": "FinalTranscript", "text": "...", "confidence": 0.95}
```

### 4. Formato de Áudio Esperado
**PCM de 16-bit linear, 16kHz, mono** enviado como base64 em JSON:
```json
{"audio_data": "base64_encoded_pcm_16bit"}
```

## ✅ Implementação Atual

### Hook useAssemblyAITranscription
Localização: `src/pages/Teleconsulta.tsx` (linhas 15-175)

#### Fluxo
1. `startTranscription()` → Busca token do backend
2. Conecta ao WebSocket v3
3. Aguarda mensagem `type: 'Begin'`
4. Inicia captura de áudio via AudioContext
5. Converte Float32 → Int16 PCM → base64 → JSON
6. Envia frames de 4096 samples (8192 bytes) via `{ audio_data: base64 }`
7. Processa `PartialTranscript` e `Final Transcript`

#### Código de Captura PCM
```typescript
const audioContext = new AudioContext({ sampleRate: 16000 });
const source = audioContext.createMediaStreamSource(stream);
const processor = audioContext.createScriptProcessor(4096, 1, 1);

processor.onaudioprocess = (e) => {
  const inputData = e.inputBuffer.getChannelData(0);
  const pcmData = new Int16Array(inputData.length);
  
  // Float32 (-1 a 1) → Int16 (-32768 a 32767)
  for (let i = 0; i < inputData.length; i++) {
    const s = Math.max(-1, Math.min(1, inputData[i]));
    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  // Converte para base64
  const bytes = new Uint8Array(pcmData.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  
  // Envia JSON
  wsRef.current.send(JSON.stringify({ audio_data: base64 }));
};
```

## ⚠️ Problema Atual

### Erro Persistente
```
code: 3005
reason: 'Invalid JSON: Expecting value: line 1 column 1 (char 0)'
```

### Sintomas
- Conexão estabelecida ✅
- Mensagem `Begin` recebida ✅
- AudioContext iniciado ✅
- Frames PCM sendo enviados ✅ (logs mostram valores corretos)
- Servidor fecha conexão após ~3-4 frames ❌

### Possíveis Causas
1. **Cache do navegador**: Múltiplas versões do código rodando simultaneamente (logs duplicados)
2. **Formato de áudio incorreto**: Servidor pode esperar outro encoding (mu-law, a-law, etc.)
3. **Timing**: Servidor pode ter limite de tempo entre frames
4. **Endianness**: Int16 little-endian vs big-endian
5. **Mensagem inicial**: Pode precisar de handshake adicional após `Begin`

## 🔧 Próximos Passos

### 1. Limpar Cache Completamente
```bash
# No navegador
Ctrl + Shift + Delete → Limpar cache de imagens e arquivos
# OU
Abrir em aba anônima: Ctrl + Shift + N
# OU
Hard refresh: Ctrl + Shift + R
```

### 2. Testar com Logs Limpos
Após limpar cache, coletar logs completos desde:
- "Conectado ao AssemblyAI"
- Todas as mensagens recebidas
- Todos os frames enviados (com samples)
- Erro final com code/reason

### 3. Alternativas a Testar

#### A. Verificar documentação oficial
- Consultar docs mais recentes da AssemblyAI v3
- Verificar se há SDK oficial para Web com exemplo funcional

#### B. Testar formato alternativo
```typescript
// Em vez de JSON, tentar binário puro
wsRef.current.send(pcmData.buffer);
```

#### C. Adicionar delay entre frames
```typescript
// Throttle para ~100ms entre envios
let lastSend = 0;
processor.onaudioprocess = (e) => {
  const now = Date.now();
  if (now - lastSend < 100) return;
  lastSend = now;
  // ... enviar áudio
};
```

#### D. Usar AudioWorklet em vez de ScriptProcessor
ScriptProcessor está deprecated. Implementar com AudioWorklet moderno.

## 📝 Configuração do Backend

### Endpoint de Token
URL: `https://webhook.n8nlabz.com.br/webhook/assemblyai-token`

Deve fazer:
```bash
curl -G https://streaming.assemblyai.com/v3/token \
  -H "Authorization: $(SELECT value FROM system_settings WHERE key='assembly_key')" \
  -d expires_in_seconds=600
```

Retornar:
```json
{
  "token": "temporary_session_token_here"
}
```

## 🗄️ Banco de Dados

### Tabela: system_settings
```sql
key = 'assembly_key'
value = 'bfee****b447' (32 caracteres)
is_active = true
```

## 📚 Referências
- [AssemblyAI Streaming v3 Docs](https://www.assemblyai.com/docs/api-reference/streaming/realtime)
- [Errors and Closures](https://www.assemblyai.com/docs/speech-to-text/universal-streaming/common-session-errors-and-closures)
- [v2 to v3 Migration](https://www.assemblyai.com/docs/guides/v2_to_v3_migration_js)

## 🔴 Problema Bloqueador

### Formatos Testados (TODOS falharam)
1. ❌ `{"type":"AudioData","audio_data":"base64..."}` → Erro: Invalid Message Type: AudioData
2. ❌ `"base64_string"` (string pura) → Erro: Invalid JSON
3. ❌ `{"audio_data":"base64..."}` (sem type) → Erro: Invalid Message Type: (vazio)
4. ❌ Binary ArrayBuffer direto → Erro: Invalid JSON

### Conclusão Atual
A API v3 de realtime da AssemblyAI via WebSocket **não está funcionando com os formatos documentados**. Possibilidades:
- Documentação desatualizada
- Endpoint v3 ainda em beta/desenvolvimento
- Requer autenticação adicional ou headers específicos
- Token temporário pode não ser compatível com todos os recursos

## 🎯 Solução Recomendada

### Usar v2 (Estável e Documentada)
```
wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=API_KEY
```

**Diferenças v2:**
- Usa API key direta (não token temporário)
- Formato: `{"audio_data": "base64_pcm_16bit"}`
- Tipos de mensagem: `PartialTranscript`, `FinalTranscript`
- Campo de texto: `res.text`
- Requer `sample_rate` na URL

### Alternativa: SDK Oficial
Considerar usar o SDK oficial da AssemblyAI em vez de implementação manual:
```bash
npm install assemblyai
```

---

**Data de Criação:** 2025-10-07  
**Última Atualização:** 2025-10-07  
**Status:** 🔴 Bloqueado - v3 não aceita nenhum formato testado
**Recomendação:** Migrar para v2 ou SDK oficial

