# 🔗 Implementação de Suporte a URLs Externas em Anexos Médicos

**Data:** 2025-10-13  
**Autor:** AI Assistant  
**Descrição:** Ajuste no sistema de anexos para suportar tanto URLs externas quanto caminhos de arquivo no storage local

---

## 📋 Contexto

A tabela `medical_attachments` armazena referências de arquivos médicos na coluna `file_path`. Anteriormente, o sistema esperava apenas caminhos relativos ao Supabase Storage. Com esta implementação, o sistema agora suporta **dois tipos de valores** em `file_path`:

1. **Caminho local no Storage**: `patient_id/folder/arquivo.pdf`
2. **URL externa completa**: `https://example.com/arquivo.pdf`

---

## ✨ Funcionalidades Implementadas

### 1. Função `isFullUrl()` - Detecção de URLs

**Arquivo:** `src/lib/storageUtils.ts`

```typescript
export function isFullUrl(filePath: string): boolean {
  try {
    const url = new URL(filePath);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
```

**Objetivo:** Detectar se um `file_path` é uma URL completa ou um caminho relativo.

---

### 2. Função `getFileUrl()` - Obtenção Universal de URLs

**Arquivo:** `src/lib/storageUtils.ts`

```typescript
export async function getFileUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    // Se já é uma URL completa, retornar diretamente
    if (isFullUrl(filePath)) {
      return filePath;
    }

    // Caso contrário, buscar URL signed do storage
    return await getSignedUrl(filePath, expiresIn);
  } catch (error) {
    console.error('Erro ao obter URL do arquivo:', error);
    return null;
  }
}
```

**Objetivo:** Função universal que:
- Retorna a URL diretamente se já for completa
- Busca URL signed do storage se for caminho local
- Abstrai a lógica de detecção para o resto do código

---

### 3. Atualização da Função `deleteFile()`

**Arquivo:** `src/lib/storageUtils.ts`

```typescript
export async function deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Se for uma URL externa, não tentar deletar do storage
    if (isFullUrl(filePath)) {
      console.log('URL externa detectada, não será deletada do storage:', filePath);
      return { success: true };
    }

    // Continua com a lógica de deleção do storage...
  }
}
```

**Objetivo:** Evitar tentativas de deletar URLs externas do storage local.

---

### 4. Atualização do Componente `AttachmentCard`

**Arquivo:** `src/components/patients/AttachmentCard.tsx`

**Mudanças:**
1. Importação alterada de `getSignedUrl` para `getFileUrl`
2. Uso da nova função no carregamento de URLs

```typescript
import { getFileUrl, isImageFile, isPdfFile, formatFileSize } from '@/lib/storageUtils';

// ...

const loadSignedUrl = async () => {
  setLoadingUrl(true);
  try {
    // getFileUrl detecta automaticamente se é URL externa ou caminho do storage
    const url = await getFileUrl(attachment.file_path, 3600);
    if (url) {
      setPreviewUrl(url);
    }
  } catch (error) {
    console.error('Erro ao carregar URL:', error);
  } finally {
    setLoadingUrl(false);
  }
};
```

---

## 🎯 Como Usar

### Inserir Anexo com URL Externa

```sql
INSERT INTO public.medical_attachments (
  patient_id,
  uploaded_by,
  related_to_type,
  file_name,
  file_path,
  file_type,
  description
) VALUES (
  'uuid-do-paciente',
  'uuid-do-usuario',
  'exam',
  'Exame de Sangue.pdf',
  'https://exemplo.com/arquivos/exame.pdf', -- URL externa
  'application/pdf',
  'Exame laboratorial externo'
);
```

### Inserir Anexo com Caminho Local

```sql
INSERT INTO public.medical_attachments (
  patient_id,
  uploaded_by,
  related_to_type,
  file_name,
  file_path,
  file_type,
  description
) VALUES (
  'uuid-do-paciente',
  'uuid-do-usuario',
  'exam',
  'Raio-X.jpg',
  'patient-uuid/exams/raio-x_123456.jpg', -- Caminho do storage
  'image/jpeg',
  'Raio-X de tórax'
);
```

---

## ✅ Vantagens da Implementação

1. **Retrocompatibilidade Total**: Todos os anexos existentes continuam funcionando
2. **Flexibilidade**: Suporta URLs de serviços externos (WhatsApp, outros sistemas)
3. **Segurança**: URLs externas não são deletadas do storage
4. **Transparência**: O sistema detecta automaticamente o tipo de caminho
5. **Manutenibilidade**: Centralizado em funções reutilizáveis

---

## 📊 Estrutura da Tabela `medical_attachments`

```sql
CREATE TABLE public.medical_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  related_to_type TEXT CHECK (related_to_type IN ('medical_record', 'exam', 'anamnesis', 'general')),
  related_to_id UUID,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- 🔹 Agora suporta URLs completas ou caminhos locais
  file_size_bytes BIGINT,
  file_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🧪 Casos de Teste

### ✅ Caso 1: URL Externa
- **Input:** `https://api.whatsapp.com/media/file.pdf`
- **Resultado:** URL retornada diretamente, sem buscar no storage

### ✅ Caso 2: Caminho Local
- **Input:** `abc-123/attachments/file.pdf`
- **Resultado:** URL signed gerada do Supabase Storage

### ✅ Caso 3: Deleção de URL Externa
- **Input:** Deletar anexo com URL externa
- **Resultado:** Registro deletado do banco, arquivo externo não é afetado

### ✅ Caso 4: Deleção de Arquivo Local
- **Input:** Deletar anexo com caminho local
- **Resultado:** Registro deletado do banco + arquivo removido do storage

---

## 🔧 Arquivos Modificados

1. ✅ `src/lib/storageUtils.ts` - Novas funções auxiliares + detecção inteligente de extensões
2. ✅ `src/components/patients/AttachmentCard.tsx` - Uso da nova função + preview de URLs

---

## 🔍 Detecção Inteligente de Extensões

**Problema resolvido:** Arquivos com URLs externas podem ter nomes genéricos sem extensão (ex: "Enviada pelo WhatsApp"), mas a URL termina com `.jpg`.

**Solução implementada:**

```typescript
export function isImageFile(fileName: string, filePath?: string): boolean {
  // 1. Tenta pelo fileName primeiro
  const ext = getFileExtension(fileName);
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    return true;
  }
  
  // 2. Se não encontrou extensão no fileName, tenta pelo filePath
  if (filePath) {
    const extFromPath = getFileExtension(filePath);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extFromPath);
  }
  
  return false;
}
```

**Exemplo prático:**
- **file_name:** "Enviada pelo WhatsApp" (sem extensão)
- **file_path:** "https://exemplo.com/arquivo.jpg" (com extensão)
- **Resultado:** ✅ Detectado como imagem e exibe preview!

A mesma lógica foi aplicada para `isPdfFile()`.

---

## 📝 Observações Importantes

- A função `getSignedUrl()` ainda existe e pode ser usada diretamente quando se sabe que é um caminho local
- A função `getFileUrl()` deve ser a preferida para casos genéricos
- URLs externas não expiram, diferente das URLs signed do storage (1 hora de validade)
- A validação de tipo de arquivo agora verifica tanto `file_name` quanto `file_path`
- Ideal para arquivos do WhatsApp que vêm com nomes genéricos

---

## 🚀 Próximos Passos (Opcional)

- [ ] Adicionar validação de domínios permitidos para URLs externas
- [ ] Implementar cache de URLs signed para melhor performance
- [ ] Adicionar metadata para diferenciar origem do arquivo na UI
- [ ] Criar relatório de uso de storage vs URLs externas

---

**Status:** ✅ Implementado e Testado  
**Compatibilidade:** 100% retrocompatível  
**Versão:** 1.0.0

