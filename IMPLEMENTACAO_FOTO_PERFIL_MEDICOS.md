# Implementação de Foto de Perfil para Médicos

**Data:** 2025-10-21  
**Autor:** Sistema MedX

---

## 📋 Resumo

Foi implementado um sistema completo para que cada médico possa adicionar e gerenciar sua foto de perfil no sistema.

---

## 🗄️ Alterações no Banco de Dados

### Migration Criada

**Arquivo:** `migrations/44º_Migration_add_avatar_url_to_profiles.sql`

```sql
-- Adicionar campo avatar_url à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Comentário do novo campo
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL da foto de perfil do usuário (médico, secretária, etc)';

-- Criar índice para facilitar consultas por avatar_url
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url 
ON public.profiles(avatar_url) WHERE avatar_url IS NOT NULL;
```

**Campo adicionado:**
- `avatar_url` (TEXT) - Armazena a URL da foto de perfil

---

## 📁 Estrutura de Armazenamento

As fotos de perfil dos médicos são armazenadas no **Supabase Storage** no bucket `medical-files`, seguindo a estrutura:

```
medical-files/
  └── doctors/
      └── {doctor_id}/
          └── avatar/
              └── {nome_arquivo_unico}.{extensao}
```

**Características:**
- ✅ Tamanho máximo: 5MB
- ✅ Formatos aceitos: JPEG, PNG, WebP, GIF
- ✅ URL assinada válida por 1 ano
- ✅ Substituição automática ao fazer novo upload

---

## 🔧 Componentes Criados

### 1. DoctorAvatarUpload

**Arquivo:** `src/components/doctors/DoctorAvatarUpload.tsx`

Componente responsável pelo upload e gerenciamento da foto de perfil.

**Props:**
```typescript
interface DoctorAvatarUploadProps {
  doctorId: string;
  avatarUrl?: string;
  doctorName: string;
  onUploadSuccess?: (url: string) => void;
  onRemoveSuccess?: () => void;
  size?: 'sm' | 'md' | 'lg';
}
```

**Funcionalidades:**
- ✅ Upload de nova foto
- ✅ Substituição de foto existente
- ✅ Remoção de foto
- ✅ Preview em tempo real
- ✅ Validação de tipo e tamanho
- ✅ Loading state durante upload
- ✅ Iniciais como fallback quando não há foto

---

## 📄 Páginas Modificadas/Criadas

### 1. Página de Perfil (NOVA)

**Arquivo:** `src/pages/Profile.tsx`  
**Rota:** `/profile`  
**Acesso:** Todos os usuários (owner, doctor, secretary)

Página onde qualquer usuário pode:
- ✅ Adicionar/alterar foto de perfil
- ✅ Atualizar informações pessoais
- ✅ Editar especialização (médicos)
- ✅ Definir preço de consulta (médicos)

### 2. Página de Usuários (MODIFICADA)

**Arquivo:** `src/pages/Users.tsx`

**Alterações:**
- ✅ Modal de edição agora inclui upload de avatar
- ✅ Lista de usuários exibe avatar real ou iniciais
- ✅ Avatar com cores diferentes por tipo de usuário:
  - 🟣 Roxo: Owner
  - 🔵 Azul: Médico
  - 🟢 Verde: Secretária

### 3. Sidebar (MODIFICADA)

**Arquivo:** `src/components/layout/Sidebar.tsx`

**Alterações:**
- ✅ Exibe avatar do usuário logado
- ✅ Link clicável para a página de perfil
- ✅ Novo item de menu "Meu Perfil"

---

## 🔌 Funções Utilitárias Adicionadas

### storageUtils.ts

**Nova função:** `uploadDoctorAvatar()`

```typescript
export async function uploadDoctorAvatar(
  file: File,
  doctorId: string,
  oldAvatarUrl?: string
): Promise<{ path: string; url: string; error?: string }>
```

**Funcionalidades:**
- ✅ Valida tipo de arquivo (imagens apenas)
- ✅ Valida tamanho (máx. 5MB)
- ✅ Remove avatar antigo antes de adicionar novo
- ✅ Gera nome de arquivo único
- ✅ Retorna URL assinada válida por 1 ano

### useFileUpload.ts

**Nova função no hook:** `uploadDoctorAvatarFile()`

```typescript
uploadDoctorAvatarFile: (
  file: File,
  doctorId: string,
  oldAvatarUrl?: string
) => Promise<{ success: boolean; url?: string; error?: string }>
```

---

## 🔐 Contexto de Autenticação

### AuthContext.tsx

**Interface User atualizada:**

```typescript
export interface User {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string; // ← NOVO CAMPO
}
```

**Função mapSupabaseUserToAppUser atualizada:**
- ✅ Agora carrega o campo `avatar_url` do perfil
- ✅ Avatar disponível globalmente via `useAuth()`

---

## 🎨 Onde o Avatar é Exibido

1. **Sidebar** - Avatar do usuário logado (clicável para perfil)
2. **Página de Usuários** - Cards de usuários mostram avatar
3. **Modal de Edição de Usuário** - Upload de avatar integrado
4. **Página de Perfil** - Upload e gerenciamento do próprio avatar

---

## 🚀 Como Usar

### Para Médicos/Usuários

1. Acesse **"Meu Perfil"** no menu lateral
2. Clique em **"Adicionar Foto"** ou **"Alterar Foto"**
3. Selecione uma imagem (máx. 5MB, formatos: JPG, PNG, WebP, GIF)
4. A foto será exibida automaticamente em todo o sistema
5. Para remover, clique no ícone de lixeira ao lado do botão de upload

### Para Owners (Administradores)

1. Acesse **"Usuários"** no menu lateral
2. Clique em **"Editar"** no usuário desejado
3. Use o componente de upload de avatar no topo do modal
4. Salve as alterações

---

## ✅ Checklist de Implementação

- [x] Criar migration para adicionar campo `avatar_url`
- [x] Adicionar funções de upload no `storageUtils.ts`
- [x] Criar hook `uploadDoctorAvatarFile` no `useFileUpload.ts`
- [x] Criar componente `DoctorAvatarUpload`
- [x] Criar página de perfil (`Profile.tsx`)
- [x] Adicionar rota `/profile` no App.tsx
- [x] Integrar avatar no modal de edição de usuários
- [x] Exibir avatar na lista de usuários
- [x] Adicionar item "Meu Perfil" no menu sidebar
- [x] Exibir avatar do usuário logado no sidebar
- [x] Atualizar AuthContext para carregar `avatar_url`

---

## 📊 Estatísticas

- **Arquivos criados:** 3
  - `DoctorAvatarUpload.tsx`
  - `Profile.tsx`
  - `44º_Migration_add_avatar_url_to_profiles.sql`

- **Arquivos modificados:** 6
  - `storageUtils.ts`
  - `useFileUpload.ts`
  - `Users.tsx`
  - `Sidebar.tsx`
  - `App.tsx`
  - `AuthContext.tsx`

---

## 🔄 Próximos Passos Recomendados

1. **Aplicar a migration no banco de dados** (executar o SQL no Supabase)
2. **Testar upload de avatar** em diferentes tamanhos e formatos
3. **Verificar políticas RLS** do bucket `medical-files` no Supabase
4. **Considerar adicionar avatar em outras páginas:**
   - Agenda (exibir avatar do médico nos appointments)
   - Prontuários (exibir avatar do médico responsável)
   - WhatsApp (exibir avatar do médico atribuído)

---

## 📝 Notas Técnicas

- Os avatares são armazenados separadamente por médico para facilitar a organização
- A URL do avatar é uma signed URL com validade de 1 ano, renovada automaticamente
- Ao fazer upload de um novo avatar, o antigo é deletado automaticamente do storage
- O sistema exibe iniciais do nome como fallback quando não há foto
- As cores dos avatares variam de acordo com o tipo de usuário (owner/doctor/secretary)

---

**✅ Implementação Concluída com Sucesso!**

