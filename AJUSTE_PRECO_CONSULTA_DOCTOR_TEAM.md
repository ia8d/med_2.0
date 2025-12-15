# Ajuste: Preço de Consulta no doctor_team

## 📋 O Que Mudou

Agora o campo `consultation_price` é salvo em **DOIS lugares**:

### 1️⃣ Tabela `profiles` (dados individuais)
```sql
SELECT id, name, specialization, consultation_price
FROM profiles
WHERE role = 'doctor'
```

### 2️⃣ Tabela `clinic_info` → coluna `doctor_team` (JSON)
```json
[
  {
    "name": "Dr Fernando",
    "specialization": "Endocrinologista",
    "consultation_price": 200.00
  },
  {
    "name": "Dr. João",
    "specialization": "Cardiologista",
    "consultation_price": 150.00
  }
]
```

## 🔄 Como Funciona

### Ao clicar em "Salvar preços":
1. ✅ Atualiza `consultation_price` na tabela `profiles` (para cada médico)
2. ✅ Atualiza o JSON `doctor_team` na tabela `clinic_info` (com preços atualizados)

### Ao clicar em "Salvar equipe médica":
1. ✅ Atualiza `doctor_ids` e `doctor_team` na tabela `clinic_info`
2. ✅ Inclui automaticamente o `consultation_price` no JSON

## 📊 Estrutura Completa do doctor_team

```json
{
  "id": "f9cf57fb-9e6f-4b96-ab30-72f61c48a659",
  "doctor_ids": [
    "3df7303c-7cf3-43f3-b1de-d6b91244e2f8",
    "32303c26-80b8-41f7-98ec-ed24999f1ee4",
    "5fea642f-be2b-428a-acd2-40ff3c720254"
  ],
  "doctor_team": [
    {
      "name": "Dr Fernando",
      "specialization": "Endocrinologista",
      "consultation_price": 200.00
    },
    {
      "name": "Dr. João",
      "specialization": "Cardiologista",
      "consultation_price": 150.00
    },
    {
      "name": "Dra. Gabriella",
      "specialization": "Cardiologista",
      "consultation_price": 180.00
    }
  ]
}
```

## 🎯 Prioridade de Dados

Ao carregar a página:
1. **Primeiro:** Carrega preços da tabela `profiles`
2. **Depois:** Se houver preços em `doctor_team`, **sobrescreve** (prioridade)

Isso garante que os dados em `doctor_team` sempre prevalecem.

## ✨ Benefícios

### ✅ Dupla Redundância
- Dados salvos em dois lugares
- Se um lugar falhar, o outro tem backup

### ✅ Performance
- `doctor_team` é JSON otimizado para leitura rápida
- Não precisa fazer JOIN para buscar dados da equipe

### ✅ Consistência
- Ambos os locais são atualizados simultaneamente
- Interface garante sincronização automática

## 🔧 Arquivos Alterados

### 1. `src/pages/ClinicInfo.tsx`

#### Interface atualizada:
```typescript
doctor_team?: { 
  name?: string | null; 
  specialization?: string | null; 
  consultation_price?: number | null // ← NOVO
}[] | null;
```

#### Função `handleSavePrices`:
```typescript
// Salva em profiles
await supabase.from('profiles').update({ consultation_price })

// Salva em clinic_info → doctor_team
await supabase.from('clinic_info').update({ 
  doctor_team: [
    { name, specialization, consultation_price }
  ]
})
```

#### Função `handleSaveTeam`:
```typescript
const team = doctors.map((d) => ({ 
  name: d.name,
  specialization: d.specialization,
  consultation_price: doctorPrices[d.id] || d.consultation_price // ← INCLUI PREÇO
}));
```

## 🚀 Como Testar

### 1. Via Interface:
1. Acesse "Informações da Clínica"
2. Digite um preço (ex: R$ 200,00)
3. Clique em "Salvar preços"
4. Verifique no banco de dados

### 2. Via MCP (Supabase):
```sql
-- Ver preços na tabela profiles
SELECT name, consultation_price 
FROM profiles 
WHERE role = 'doctor';

-- Ver preços no doctor_team
SELECT jsonb_pretty(doctor_team) 
FROM clinic_info;
```

## ✅ Status Atual

**Testado e Funcionando:**
- ✅ Salva em `profiles.consultation_price`
- ✅ Salva em `clinic_info.doctor_team[].consultation_price`
- ✅ Formatação brasileira (R$ 50,00)
- ✅ Sincronização automática
- ✅ Prioridade do `doctor_team` ao carregar

---

**Data:** 20/10/2025  
**Status:** ✅ Implementado e Testado via MCP  
**Projeto:** MedX (xrzufxkdpfjbjkwyzvyb)

