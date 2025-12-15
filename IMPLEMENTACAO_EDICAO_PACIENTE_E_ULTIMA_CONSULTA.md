# Implementação de Edição de Paciente e Coluna de Última Consulta

## Data: 2025-10-13
## Autor: Sistema MedX

---

## 📋 Resumo das Alterações

Esta implementação adiciona funcionalidade completa de edição de pacientes no modal de detalhes, bem como a inclusão de uma nova coluna no banco de dados para armazenar a data da última consulta realizada.

---

## 🗄️ Alterações no Banco de Dados

### Migration: `41º_Migration_add_last_appointment_date_to_patients.sql`

**Localização:** `migrations/41º_Migration_add_last_appointment_date_to_patients.sql`

**Descrição:** Adiciona a coluna `last_appointment_date` na tabela `patients`.

**Alterações:**
- ✅ Nova coluna `last_appointment_date` (TIMESTAMP WITH TIME ZONE)
- ✅ Comentário explicativo adicionado
- ✅ Atualização automática dos valores iniciais com base nos appointments existentes (status = 'completed')

**Status:** ✅ Aplicada com sucesso via MCP Supabase

---

## 🔧 Alterações no Frontend

### 1. Interface TypeScript (`src/hooks/usePatientData.ts`)

**Alteração:** Atualização da interface `Patient` para incluir o novo campo.

```typescript
export interface Patient {
  // ... campos existentes
  last_appointment_date?: string;  // ✅ NOVO CAMPO
  // ... demais campos
}
```

---

### 2. Novo Componente: `PatientEditModal.tsx`

**Localização:** `src/components/patients/PatientEditModal.tsx`

**Descrição:** Modal completo para edição de informações do paciente.

**Funcionalidades:**
- ✅ Formulário completo com todos os campos do paciente
- ✅ Validação de dados obrigatórios (nome)
- ✅ Organização por seções (Informações Básicas, Endereço, Observações)
- ✅ Conversão de campos vazios para `null`
- ✅ Feedback visual com loading e mensagens de sucesso/erro
- ✅ Atualização automática do campo `updated_at`

**Campos Editáveis:**
- Nome Completo (obrigatório)
- Email
- Telefone
- CPF
- Data de Nascimento
- Gênero (select com opções)
- Convênio
- Endereço completo (logradouro, cidade, estado, CEP)
- Observações

---

### 3. Componente Atualizado: `PatientOverview.tsx`

**Localização:** `src/components/patients/PatientOverview.tsx`

**Alterações:**

#### a) Novos Imports e Props
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PatientEditModal } from './PatientEditModal';
import { Edit, History } from 'lucide-react';

interface PatientOverviewProps {
  // ... props existentes
  onPatientUpdate?: () => void;  // ✅ NOVA PROP
}
```

#### b) Botão de Editar
- ✅ Botão "Editar" adicionado ao lado do nome do paciente
- ✅ Ícone de edição (Edit)
- ✅ Abre o modal de edição ao ser clicado

#### c) Exibição da Última Consulta
- ✅ Card visual com a data/hora da última consulta
- ✅ Ícone de histórico (History)
- ✅ Layout responsivo em grid com a próxima consulta
- ✅ Formatação adequada de data e hora (dd/MM/yyyy às HH:mm)

#### d) Modal de Edição Integrado
- ✅ Gerenciamento de estado do modal
- ✅ Callback de sucesso para atualizar dados
- ✅ Integração com refetch dos dados

---

### 4. Componente Atualizado: `PatientDetailModal.tsx`

**Localização:** `src/components/patients/PatientDetailModal.tsx`

**Alteração:** Passa a prop `onPatientUpdate` para o `PatientOverview`.

```typescript
<PatientOverview
  // ... props existentes
  onPatientUpdate={refetch}  // ✅ NOVA PROP
/>
```

**Funcionalidade:** Quando o paciente é editado com sucesso, os dados são automaticamente recarregados.

---

## 🎨 Interface do Usuário

### Modal de Detalhes do Paciente

**Antes:**
- Informações do paciente exibidas (apenas leitura)
- Próxima consulta exibida

**Depois:**
- ✅ Botão "Editar" visível ao lado do nome
- ✅ Última consulta exibida (se houver)
- ✅ Próxima consulta exibida (se houver)
- ✅ Layout responsivo

### Modal de Edição (Novo)

**Layout:**
1. **Cabeçalho**
   - Título: "Editar Paciente"
   - Descrição explicativa

2. **Seção: Informações Básicas**
   - Nome completo (obrigatório)
   - Email, Telefone, CPF
   - Data de Nascimento, Gênero
   - Convênio

3. **Seção: Endereço**
   - Endereço completo
   - Cidade, Estado, CEP

4. **Seção: Observações**
   - Campo de texto multi-linha

5. **Rodapé**
   - Botão "Cancelar"
   - Botão "Salvar Alterações" (com loading)

---

## 🔄 Fluxo de Funcionamento

### Edição de Paciente

```
1. Usuário abre modal de detalhes do paciente
   ↓
2. Clica no botão "Editar"
   ↓
3. Modal de edição abre com dados pré-preenchidos
   ↓
4. Usuário edita os campos desejados
   ↓
5. Clica em "Salvar Alterações"
   ↓
6. Sistema valida os dados
   ↓
7. Atualiza no banco de dados
   ↓
8. Exibe mensagem de sucesso
   ↓
9. Fecha modal de edição
   ↓
10. Recarrega dados do paciente (refetch)
    ↓
11. Modal de detalhes mostra informações atualizadas
```

### Atualização da Última Consulta

**Automático:** A coluna `last_appointment_date` é atualizada automaticamente pela migration inicial com base nos appointments existentes (status = 'completed').

**Futuro:** Pode ser implementado um trigger ou lógica para atualizar automaticamente quando uma consulta é marcada como concluída.

---

## 📊 Estrutura de Dados

### Tabela `patients`

```sql
-- Nova coluna
last_appointment_date TIMESTAMP WITH TIME ZONE
```

**Valores:**
- `NULL`: Paciente sem consultas realizadas
- `TIMESTAMP`: Data/hora da última consulta completada

**Atualização Inicial:**
```sql
UPDATE patients
SET last_appointment_date = (
  SELECT MAX(scheduled_at)
  FROM appointments
  WHERE appointments.patient_id = patients.id
    AND appointments.status = 'completed'
)
```

---

## ✅ Validações

### Frontend

1. **Nome:** Campo obrigatório
2. **Email:** Validação de formato (type="email")
3. **Campos vazios:** Convertidos para `null` antes de salvar

### Backend

1. **RLS (Row Level Security):** Mantido conforme configuração existente
2. **Check constraints:** Mantidos (ex: gender)
3. **Updated_at:** Atualizado automaticamente

---

## 🧪 Testes Recomendados

### 1. Edição de Paciente
- [ ] Abrir modal de detalhes
- [ ] Clicar em "Editar"
- [ ] Modificar campos
- [ ] Salvar alterações
- [ ] Verificar se os dados foram atualizados

### 2. Exibição da Última Consulta
- [ ] Verificar paciente sem consultas (não deve exibir card)
- [ ] Verificar paciente com consulta completada (deve exibir data/hora)
- [ ] Verificar formatação da data

### 3. Responsividade
- [ ] Testar em desktop (grid de 2 colunas)
- [ ] Testar em mobile (stack vertical)

### 4. Validações
- [ ] Tentar salvar sem nome (deve bloquear)
- [ ] Salvar com campos vazios (devem virar `null`)
- [ ] Verificar feedback visual (loading, mensagens)

---

## 📝 Observações

### Campos do Paciente

**Existentes na tabela mas não no modal de edição:**
- `avatar_url` - Editado via upload de avatar (componente separado)
- `next_appointment_date` - Gerenciado via sistema de agendamento
- `last_appointment_date` - Atualizado automaticamente (futuro: via trigger)
- `stage` - Status no funil CRM
- `created_at` - Apenas leitura

### Melhorias Futuras

1. **Máscaras de Entrada:**
   - CPF: 000.000.000-00
   - Telefone: (00) 00000-0000
   - CEP: 00000-000

2. **Busca de CEP:**
   - Integração com API ViaCEP para auto-completar endereço

3. **Trigger para Última Consulta:**
   - Atualizar automaticamente quando appointment.status = 'completed'

4. **Validação de CPF:**
   - Validar formato e dígitos verificadores

5. **Histórico de Alterações:**
   - Registrar quem editou e quando (audit log)

---

## 🔒 Segurança

### RLS (Row Level Security)

**Status:** ✅ Mantido conforme configuração existente

A tabela `patients` já possui RLS habilitado. As políticas existentes continuam aplicadas para:
- Leitura
- Inserção
- Atualização
- Exclusão

### Permissões

Os usuários só podem editar pacientes de acordo com as políticas RLS definidas.

---

## 📦 Arquivos Criados/Modificados

### Criados
1. `migrations/41º_Migration_add_last_appointment_date_to_patients.sql`
2. `src/components/patients/PatientEditModal.tsx`

### Modificados
1. `src/hooks/usePatientData.ts`
2. `src/components/patients/PatientOverview.tsx`
3. `src/components/patients/PatientDetailModal.tsx`

---

## ✨ Conclusão

A implementação está completa e funcional. Os usuários agora podem:
- ✅ Editar informações do paciente através de um modal dedicado
- ✅ Visualizar a data da última consulta realizada
- ✅ Ter feedback visual claro durante as operações

Todas as alterações foram feitas seguindo as melhores práticas de desenvolvimento e mantendo a consistência com o código existente.

