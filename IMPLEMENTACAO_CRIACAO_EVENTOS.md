# Implementação de Criação de Eventos na Agenda

## 📋 Descrição
Implementação completa do sistema de criação de eventos na agenda, permitindo que usuários criem novos agendamentos clicando em dias/horários no calendário.

## 🎯 Funcionalidades

### 1. Modal de Criação de Eventos
- **Seleção de Paciente**: Busca e seleção de paciente existente com autocomplete
- **Criação de Paciente**: Possibilidade de criar novo paciente inline (apenas nome obrigatório)
- **Seleção de Médico**: Dropdown com lista de médicos cadastrados (mostra nome e especialização)
- **Tipo de Consulta**: Seleção do tipo (Primeira Consulta, Retorno, Procedimento, Avaliação, Teleconsulta, Outro)
- **Data e Horários**: Seleção de data, horário inicial e final
- **Observações**: Campo opcional para notas adicionais

### 2. Integração com Calendários
- **Modo Mensal**: Clique no dia abre modal com data selecionada e horário padrão (09:00)
- **Modo Semanal**: Clique no dia/horário abre modal com data e hora do slot clicado
- **Modo Diário**: Clique no slot de horário abre modal com data e hora exatas

### 3. Criação de Pacientes
- **Campos Obrigatórios**: Apenas `name`
- **Campos Opcionais**: `email`, `phone`
- Criação instantânea dentro do modal
- Seleção automática após criação

## 🔌 Endpoint de Criação de Eventos

### URL
```
POST https://webhook.n8nlabz.com.br/webhook/criar-evento
```

### Payload Enviado
```json
{
  "calendar_id": "string (ID da agenda do médico selecionado - obrigatório)",
  "nome_paciente": "string (nome do paciente selecionado)",
  "email_paciente": "string (email do paciente, pode ser vazio)",
  "nome_medico": "string (nome do médico selecionado)",
  "email_medico": "string (email do médico, pode ser vazio)",
  "especialidade_medico": "string (especialização do médico, pode ser vazio)",
  "tipo_consulta": "string (primeira_consulta | retorno | procedimento | avaliacao | teleconsulta | outro)",
  "data_inicio": "YYYY-MM-DDTHH:MM:SS (sem timezone)",
  "data_final": "YYYY-MM-DDTHH:MM:SS (sem timezone)",
  "notas": "string (observações adicionais, pode ser vazio)"
}
```

### Exemplo de Payload
```json
{
  "calendar_id": "abc123@group.calendar.google.com",
  "nome_paciente": "João Silva",
  "email_paciente": "joao@email.com",
  "nome_medico": "Dr. Carlos Santos",
  "email_medico": "carlos@clinica.com",
  "especialidade_medico": "Cardiologia",
  "tipo_consulta": "primeira_consulta",
  "data_inicio": "2024-01-15T09:00:00",
  "data_final": "2024-01-15T10:00:00",
  "notas": "Paciente com histórico de hipertensão"
}
```

### Formato de Data
- **Formato**: ISO 8601 sem timezone (local time)
- **Padrão**: `YYYY-MM-DDTHH:MM:SS`
- **Exemplo**: `2024-01-15T09:00:00`
- **Não incluir**: `Z` ou `+00:00` no final

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
1. **`src/components/agenda/CreateEventModal.tsx`**
   - Componente principal do modal de criação
   - Gerenciamento de estado do formulário
   - Busca e criação de pacientes
   - Integração com endpoint

### Arquivos Modificados
1. **`src/pages/Agenda.tsx`**
   - Import do `CreateEventModal`
   - Estados para controle do modal
   - Lógica de `handleDayClick` adaptada
   - Callback `handleEventCreated` para recarregar dados

## 🔄 Fluxo de Criação

### 1. Usuário Clica no Calendário
```
Modo Mensal → Dia sem horário → Modal com 09:00 padrão
Modo Semanal → Célula dia/hora → Modal com horário do slot
Modo Diário → Slot específico → Modal com hora exata
```

### 2. Preenchimento do Formulário
```
1. Selecionar/Criar Paciente
   ↓
2. Confirmar/Ajustar Data e Horários
   ↓
3. (Opcional) Adicionar Motivo e Observações
   ↓
4. Clicar em "Criar Evento"
```

### 3. Envio ao Endpoint
```
1. Validação dos campos obrigatórios
   ↓
2. Busca dados completos do paciente
   ↓
3. Formata datas sem timezone
   ↓
4. Envia POST para endpoint
   ↓
5. Recebe confirmação
   ↓
6. Recarrega dados da agenda
   ↓
7. Fecha modal e mostra sucesso
```

## 🧪 Validações Implementadas

### Campos Obrigatórios
- ✅ Paciente selecionado
- ✅ Médico selecionado
- ✅ Data do evento
- ✅ Horário inicial
- ✅ Horário final

### Validações de Paciente
- ✅ Nome obrigatório ao criar novo paciente
- ✅ Email e telefone opcionais
- ✅ Seleção automática após criação

### Validações de Horário
- ⚠️ Horário final calculado automaticamente (1h após início)
- ⚠️ Usuário pode ajustar manualmente

## 🎨 UI/UX

### Componentes Utilizados
- `Dialog` - Container do modal
- `Command` / `Popover` - Busca de paciente com autocomplete
- `Input` - Campos de texto e data/hora
- `Textarea` - Campo de observações
- `Button` - Ações do formulário

### Estados de Loading
- 🔄 Carregamento de pacientes
- 🔄 Criação de novo paciente
- 🔄 Envio do evento ao endpoint

### Feedback ao Usuário
- ✅ Toast de sucesso ao criar paciente
- ✅ Toast de sucesso ao criar evento
- ❌ Toast de erro em caso de falha
- ℹ️ Toast de validação para campos obrigatórios

## 📊 Estrutura da Tabela `patients`

### Campos Obrigatórios
- `name` (text) - Nome completo do paciente

### Campos Opcionais
- `email` (text)
- `phone` (text)
- `birth_date` (date)
- `cpf` (text)
- `gender` (text)
- `address` (text)
- `city` (text)
- `state` (text)
- `zip_code` (text)
- `health_insurance` (text)
- `avatar_url` (text)
- `notes` (text)

## 🔐 Considerações de Segurança

1. **Validação de Entrada**: Todos os campos são validados antes do envio
2. **Sanitização**: Trim aplicado em campos de texto
3. **Tratamento de Erros**: Try/catch em todas operações assíncronas
4. **Logs**: Console logs para debugging (remover em produção)

## 🚀 Próximos Passos Sugeridos

1. **Edição de Eventos**: Permitir editar eventos existentes
2. **Exclusão de Eventos**: Permitir cancelar/excluir eventos
3. **Validação de Conflitos**: Verificar se horário está disponível
4. **Notificações**: Enviar notificação ao paciente após criação
5. **Recorrência**: Permitir criar eventos recorrentes
6. **Anexos**: Permitir anexar documentos ao evento

## 📝 Notas de Implementação

### Formato de Data Importante
⚠️ O endpoint espera datas **sem timezone** no formato `YYYY-MM-DDTHH:MM:SS`

Exemplo correto:
```javascript
const dataInicio = `${eventDate}T${startTime}:00`;
// Resultado: "2024-01-15T09:00:00"
```

Exemplo incorreto:
```javascript
const dataInicio = new Date(...).toISOString();
// Resultado: "2024-01-15T09:00:00Z" ❌ (tem Z no final)
```

### Calendar ID
- O `calendar_id` é buscado automaticamente da tabela `profile_calendars` baseado no médico selecionado
- Médicos sem agenda vinculada aparecem desabilitados no dropdown com indicação "(Sem agenda)"
- Validação: Se o médico não tiver `calendar_id`, mostra erro ao tentar criar evento
- O sistema garante que apenas médicos com agenda configurada podem ter eventos criados

## 🐛 Troubleshooting

### Evento não aparece no calendário
1. Verificar se o endpoint retornou sucesso (200)
2. Verificar se a data está no range visível do calendário
3. Verificar se o filtro de médico está correto
4. Tentar recarregar manualmente a página

### Paciente não é criado
1. Verificar se o nome foi preenchido
2. Verificar console para erros do Supabase
3. Verificar permissões RLS da tabela `patients`

### Médico aparece desabilitado "(Sem agenda)"
1. O médico não tem registro na tabela `profile_calendars`
2. Para vincular agenda ao médico, inserir na tabela:
```sql
INSERT INTO profile_calendars (profile_id, calendar_id, calendar_name)
VALUES ('id_do_medico', 'id_da_agenda_google', 'Nome da Agenda');
```

### Modal não abre
1. Verificar console para erros
2. Verificar se `handleDayClick` está sendo chamado
3. Verificar estado `isCreateEventModalOpen`

## 📅 Data de Criação
- **Data**: 2024-10-06
- **Autor**: Sistema MedX
- **Versão**: 1.0.0

---

**Documentação completa da implementação de criação de eventos na Agenda MedX** ✨

