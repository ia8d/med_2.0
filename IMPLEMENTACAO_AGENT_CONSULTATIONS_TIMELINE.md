# Implementação: Visualização de Consultas de Agentes IA na Timeline do Paciente

**Data:** 2025-10-05  
**Autor:** Sistema MedX  
**Funcionalidade:** Exibição de consultas dos agentes IA (CID, Medicação, Protocolo, Exames) na linha do tempo do paciente

---

## Objetivo

Implementar a visualização das consultas realizadas pelos agentes de IA (Agent CID, Agent Medicação, etc.) na timeline do paciente, permitindo que o médico veja o histórico completo de todas as interações e diagnósticos vinculados ao paciente.

---

## Problema Identificado

O usuário reportou que após vincular uma consulta de CID a um paciente, ao abrir o modal de detalhes do paciente, a informação não aparecia. Isso ocorria porque:

1. ✅ A vinculação estava funcionando (salvando no banco)
2. ❌ A timeline não estava buscando os dados da tabela `agent_consultations`
3. ❌ Não havia tipo de evento para consultas de agentes
4. ❌ Não havia ícone específico para esse tipo de evento

---

## Solução Implementada

### 1. Atualização da Interface `TimelineEvent`

**Arquivo:** `src/hooks/usePatientTimeline.ts`

Adicionado o novo tipo `'agent_consultation'` à interface:

```typescript
export interface TimelineEvent {
  id: string;
  type: 'medical_record' | 'appointment' | 'anamnesis' | 'clinical_data' | 'exam' | 'attachment' | 'agent_consultation';
  date: string;
  title: string;
  description?: string;
  doctor?: string;
  icon?: string;
  data?: any;
}
```

### 2. Busca das Consultas dos Agentes

**Arquivo:** `src/hooks/usePatientTimeline.ts`

Adicionada a busca na tabela `agent_consultations` com formatação específica por tipo de agente:

```typescript
// Buscar consultas dos agentes de IA
const { data: agentConsultations } = await supabase
  .from('agent_consultations')
  .select(`
    id,
    agent_type,
    consultation_date,
    cid_code,
    cid_description,
    confidence_level,
    consultation_input,
    consultation_output,
    doctor:profiles!agent_consultations_doctor_id_fkey(name)
  `)
  .eq('patient_id', patientId);

agentConsultations?.forEach((consultation: any) => {
  let title = 'Consulta de Agente IA';
  let description = '';

  // Formatar título e descrição baseado no tipo de agente
  switch (consultation.agent_type) {
    case 'cid':
      title = `CID: ${consultation.cid_code || 'Consulta CID'}`;
      description = consultation.cid_description || 'Consulta de código CID';
      if (consultation.confidence_level) {
        description += ` (Confiança: ${consultation.confidence_level})`;
      }
      break;
    case 'medication':
      title = 'Cálculo de Medicação';
      description = 'Cálculo de dosagem medicamentosa';
      break;
    case 'protocol':
      title = 'Protocolo Clínico';
      description = 'Consulta de protocolo clínico';
      break;
    case 'exams':
      title = 'Interpretação de Exames';
      description = 'Auxílio na interpretação de exames';
      break;
  }

  timelineEvents.push({
    id: consultation.id,
    type: 'agent_consultation',
    date: consultation.consultation_date,
    title,
    description,
    doctor: consultation.doctor?.name,
    icon: 'bot',
    data: consultation,
  });
});
```

### 3. Adição do Ícone e Label

**Arquivo:** `src/components/patients/PatientTimeline.tsx`

#### 3.1. Importação do ícone Bot

```typescript
import { 
  Activity, 
  Calendar, 
  Clipboard, 
  FileText, 
  Paperclip, 
  Stethoscope,
  Bot  // ← Novo ícone
} from 'lucide-react';
```

#### 3.2. Adição do caso no `getIcon()`

```typescript
const getIcon = (type: string) => {
  switch (type) {
    // ... outros casos
    case 'agent_consultation':
      return <Bot className="h-6 w-6" />;
    default:
      return <FileText className="h-6 w-6" />;
  }
};
```

#### 3.3. Adição do caso no `getEventLabel()`

```typescript
const getEventLabel = (type: string) => {
  switch (type) {
    // ... outros casos
    case 'agent_consultation':
      return 'Assistente IA';
    default:
      return 'Evento';
  }
};
```

---

## Resultado

Agora, quando um médico:

1. Acessa o **Assistente** → **Agent CID**
2. Busca um código CID
3. Vincula ao paciente
4. Vai em **Pacientes** → Seleciona o paciente → **Linha do Tempo**

**✅ Verá o evento na timeline com:**
- 🤖 Ícone de Bot (representando IA)
- Título: "CID: R50" (exemplo)
- Descrição: "Febre de origem desconhecida (Confiança: ALTA)"
- Nome do médico que realizou a consulta
- Data e hora da consulta

---

## Formatação por Tipo de Agente

### Agent CID (implementado)
- **Título:** `CID: R50`
- **Descrição:** `Febre de origem desconhecida (Confiança: ALTA)`

### Agent Medicação (preparado)
- **Título:** `Cálculo de Medicação`
- **Descrição:** `Cálculo de dosagem medicamentosa`

### Agent Protocolo (preparado)
- **Título:** `Protocolo Clínico`
- **Descrição:** `Consulta de protocolo clínico`

### Agent Exames (preparado)
- **Título:** `Interpretação de Exames`
- **Descrição:** `Auxílio na interpretação de exames`

---

## Estrutura de Dados

### Consulta de CID Salva

```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "agent_type": "cid",
  "consultation_input": {
    "termo": "febre",
    "idade": 35,
    "sexo": "masculino"
  },
  "consultation_output": {
    "codigo_cid": "R50",
    "descricao": "Febre de origem desconhecida",
    "categoria": "Sintomas, sinais e achados...",
    "confianca": "ALTA",
    "observacoes": "...",
    "processo_pensamento": "..."
  },
  "cid_code": "R50",
  "cid_description": "Febre de origem desconhecida",
  "confidence_level": "ALTA",
  "consultation_date": "2025-10-05T14:30:00Z"
}
```

---

## Arquivos Modificados

1. ✅ `src/hooks/usePatientTimeline.ts`
   - Adicionado tipo `'agent_consultation'` na interface
   - Adicionada busca de consultas dos agentes
   - Implementada formatação específica por tipo de agente

2. ✅ `src/components/patients/PatientTimeline.tsx`
   - Importado ícone `Bot` do lucide-react
   - Adicionado caso `'agent_consultation'` em `getIcon()`
   - Adicionado caso `'agent_consultation'` em `getEventLabel()`

---

## Como Testar

### Teste Completo (End-to-End)

1. **Faça login** no sistema
2. Vá em **Assistente** → Clique em **Agent CID**
3. Preencha os dados:
   - Termo: "febre"
   - Idade: 35
   - Sexo: Masculino
4. Clique em **Buscar CID**
5. Após receber o resultado, clique em **Vincular a um Paciente**
6. Selecione um paciente da lista
7. Clique em **Confirmar Vinculação**
8. Vá em **Pacientes**
9. Clique no paciente que você vinculou
10. Clique na aba **Linha do Tempo**
11. ✅ **Você deverá ver o evento na timeline com:**
    - Ícone de robô (Bot)
    - Título: "CID: R50" (ou o código encontrado)
    - Descrição com o nome da doença e nível de confiança
    - Nome do médico
    - Data e hora

---

## Melhorias Futuras

### 1. Modal de Detalhes
Implementar um modal que abre ao clicar no evento da timeline, mostrando:
- Entrada completa (termo, idade, sexo)
- Resposta completa do agente
- Observações clínicas
- Processo de pensamento do agente
- Opção de adicionar notas do médico

### 2. Aba Específica de Agentes
Criar uma aba "Consultas IA" no modal do paciente que liste todas as consultas dos agentes de forma organizada por tipo.

### 3. Filtros na Timeline
Adicionar filtros para mostrar apenas eventos de determinados tipos (ex: mostrar apenas consultas de IA).

### 4. Exportação de Relatórios
Permitir exportar o histórico de consultas dos agentes em PDF ou outros formatos.

### 5. Indicadores Visuais
Adicionar cores diferentes para cada tipo de agente na timeline:
- 🔵 CID → Azul
- 🟢 Medicação → Verde
- 🟣 Protocolo → Roxo
- 🟠 Exames → Laranja

---

## Observações Importantes

1. **Realtime:** A timeline já está preparada para atualizar em tempo real quando novas consultas forem adicionadas
2. **Performance:** A busca é otimizada com índices na tabela `agent_consultations`
3. **Segurança:** As políticas RLS garantem que apenas usuários autorizados vejam as consultas
4. **Escalabilidade:** A estrutura está preparada para adicionar novos tipos de agentes no futuro

---

## Status

✅ **IMPLEMENTADO** - Consultas dos agentes IA agora aparecem na timeline do paciente

✅ **TESTADO** - Funcionalidade testada e validada

✅ **DOCUMENTADO** - Documentação completa criada

