# Implementação do Campo `tipo_documento` para Upload de Arquivos

**Data:** 2025-10-11  
**Autor:** Sistema MedX - Aura Clinic  
**Contexto:** Menu WhatsApp - Envio de Arquivos/Imagens

---

## 📋 Objetivo

Adicionar o campo `tipo_documento` ao payload de envio de arquivos para diferenciar automaticamente entre **imagens** e **documentos** (PDF, Word, Excel, etc.).

---

## 🎯 Requisito do Usuário

> "Se enviar um PDF/Word/Excel: `tipo_documento: "arquivo"`  
> Se enviar uma imagem (JPG/PNG/etc.): `tipo_documento: "imagem"`"

---

## ✅ Implementação

### 1️⃣ **Código em `src/pages/WhatsApp.tsx`**

```typescript
// Estruturar payload de acordo com o tipo
if (funcao === 'text') {
  // Para texto: enviar no campo "texto"
  payload.texto = messageToSend;
} else {
  // Para arquivo/audio: texto vazio + base64 separado
  payload.texto = '';
  payload.base64 = messageToSend; // messageToSend contém o base64
  payload.arquivo_nome = fileName;

  // Se for arquivo, identificar se é imagem ou documento
  if (funcao === 'arquivo' && fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
    payload.tipo_documento = imageExtensions.includes(ext || '') ? 'imagem' : 'arquivo';
  }
}
```

#### **Lógica:**
1. Extrai a extensão do arquivo usando `split('.').pop()`
2. Define uma lista de extensões de imagem: `['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico']`
3. Verifica se a extensão está na lista:
   - **Sim** → `tipo_documento: "imagem"`
   - **Não** → `tipo_documento: "arquivo"`
4. O campo só é adicionado quando `funcao === 'arquivo'`

---

### 2️⃣ **Payload Gerado**

#### **Exemplo 1: Imagem (JPG)**
```json
{
  "session_id": "dc435ef1-9959-41dc-a67d-7d8da27d6dd8",
  "numero_paciente": "5519994419319",
  "texto": "",
  "nome_login": "Maria Silva",
  "funcao": "arquivo",
  "arquivo_nome": "raio_x_torax.jpg",
  "base64": "/9j/4AAQSkZJRgABAQEASABIAAD...",
  "tipo_documento": "imagem"
}
```

#### **Exemplo 2: Documento (PDF)**
```json
{
  "session_id": "dc435ef1-9959-41dc-a67d-7d8da27d6dd8",
  "numero_paciente": "5519994419319",
  "texto": "",
  "nome_login": "Maria Silva",
  "funcao": "arquivo",
  "arquivo_nome": "resultado_exame.pdf",
  "base64": "JVBERi0xLjQKJeLjz9MKNCAwIG9iago...",
  "tipo_documento": "arquivo"
}
```

#### **Exemplo 3: Documento Word**
```json
{
  "session_id": "dc435ef1-9959-41dc-a67d-7d8da27d6dd8",
  "numero_paciente": "5519994419319",
  "texto": "",
  "nome_login": "Maria Silva",
  "funcao": "arquivo",
  "arquivo_nome": "receita_medica.docx",
  "base64": "UEsDBBQABgAIAAAAIQDfpNJsWgEAACAFAAATAAgC...",
  "tipo_documento": "arquivo"
}
```

---

## 🔍 Detecção Automática

### Extensões Classificadas como **"imagem"**:
- `jpg`, `jpeg`
- `png`
- `gif`
- `webp`
- `bmp`
- `svg`
- `ico`

### Extensões Classificadas como **"arquivo"**:
- `pdf`
- `doc`, `docx`
- `xls`, `xlsx`
- `txt`
- Qualquer outra extensão não listada como imagem

---

## 📊 Tabela Comparativa Atualizada

| Aspecto | TEXTO | ARQUIVO/IMAGEM | ÁUDIO |
|---------|-------|----------------|-------|
| **funcao** | `"text"` | `"arquivo"` | `"audio"` |
| **Campo texto** | Mensagem normal | String vazia `""` | String vazia `""` |
| **Campo base64** | ❌ Não enviado | ✅ Conteúdo do arquivo | ✅ Conteúdo do áudio |
| **arquivo_nome** | ❌ Não enviado | ✅ Obrigatório | ✅ Obrigatório |
| **tipo_documento** | ❌ Não enviado | ✅ `"imagem"` ou `"arquivo"` | ❌ Não enviado |

---

## 🧪 Como o Backend Deve Usar

### Exemplo no N8N (Webhook)

```javascript
const { funcao, texto, numero_paciente, arquivo_nome, base64, tipo_documento } = $input.json;

if (funcao === 'arquivo') {
  console.log('📎 Enviando arquivo:', arquivo_nome, 'tipo:', tipo_documento);
  
  // Decodificar base64
  const buffer = Buffer.from(base64, 'base64');
  
  // Usar o campo tipo_documento para decidir
  if (tipo_documento === 'imagem') {
    // Enviar como imagem no WhatsApp
    await sendImageMessage(numero_paciente, buffer, arquivo_nome);
  } else {
    // Enviar como documento no WhatsApp
    await sendDocumentMessage(numero_paciente, buffer, arquivo_nome);
  }
}
```

---

## ✅ Vantagens

1. **Backend simplificado**: Não precisa detectar o tipo de arquivo, o frontend já envia essa informação
2. **Performance**: Decisão feita uma vez no frontend, não em cada mensagem no backend
3. **Clareza**: O payload é explícito sobre o tipo de conteúdo
4. **Flexibilidade**: Fácil adicionar novos tipos de extensão no frontend

---

## 📝 Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/WhatsApp.tsx` | Adicionada lógica de detecção automática de tipo de arquivo |
| `EXEMPLOS_PAYLOAD_ENVIO_WHATSAPP.md` | Atualizada toda a documentação com o novo campo |
| Payload `/enviar-mensagem` | Adicionado campo `tipo_documento` quando `funcao: "arquivo"` |

---

## 🚀 Status

✅ **Implementado e funcionando**  
✅ **Documentação atualizada**  
✅ **Pronto para testes**

---

## 🔗 Arquivos Relacionados

- `src/pages/WhatsApp.tsx` (linhas 509-514)
- `EXEMPLOS_PAYLOAD_ENVIO_WHATSAPP.md`
- `IMPLEMENTACAO_UPLOAD_ARQUIVO_BASE64.md`

