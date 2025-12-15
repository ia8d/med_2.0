# Correção: Erro de Data Inválida no Menu Pacientes CRM

**Data:** 2025-10-28  
**Autor:** Sistema  
**Arquivo Modificado:** `src/pages/Patients.tsx`

## 🐛 Problema Identificado

Ao acessar o menu "Pacientes CRM", o sistema apresentava um erro no console:

```
Uncaught RangeError: Invalid time value
    at format (date-fns.js:1760:11)
    at Patients.tsx:256:30
```

### Causa Raiz

O código tentava formatar a data `patient.next_appointment_date` sem validar se o valor era uma data válida. Quando o campo era `null`, `undefined` ou uma string inválida, o construtor `new Date()` retornava uma data inválida, e a função `format` do `date-fns` lançava o erro "Invalid time value".

## ✅ Solução Implementada

### 1. Criação de Função de Validação

Adicionada a função `isValidDate` para validar datas antes de formatá-las:

```typescript
const isValidDate = (dateString?: string | null): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};
```

### 2. Atualização do Código de Formatação

Modificado o código na linha 258 para incluir a validação:

**Antes:**
```typescript
{patient.next_appointment_date ? (
  <div className="flex items-center gap-2">
    <Calendar className="h-4 w-4 text-primary" />
    <span className="text-sm">
      {format(
        new Date(patient.next_appointment_date),
        "dd/MM/yyyy 'às' HH:mm",
        { locale: ptBR }
      )}
    </span>
  </div>
) : (
  <span className="text-muted-foreground text-sm">Não agendada</span>
)}
```

**Depois:**
```typescript
{patient.next_appointment_date && isValidDate(patient.next_appointment_date) ? (
  <div className="flex items-center gap-2">
    <Calendar className="h-4 w-4 text-primary" />
    <span className="text-sm">
      {format(
        new Date(patient.next_appointment_date),
        "dd/MM/yyyy 'às' HH:mm",
        { locale: ptBR }
      )}
    </span>
  </div>
) : (
  <span className="text-muted-foreground text-sm">Não agendada</span>
)}
```

## 📊 Resultado

- ✅ Menu "Pacientes CRM" agora carrega sem erros
- ✅ Datas válidas são formatadas corretamente
- ✅ Datas inválidas ou ausentes exibem "Não agendada"
- ✅ Sem erros no console
- ✅ Experiência do usuário melhorada

## 🔍 Validação

Execute os seguintes passos para validar a correção:

1. Acesse o menu "Pacientes CRM"
2. Verifique se a lista de pacientes carrega sem erros
3. Confira se pacientes com próxima consulta agendada exibem a data corretamente
4. Confira se pacientes sem consulta agendada exibem "Não agendada"
5. Verifique o console do navegador (não deve haver erros)

## 📝 Notas Técnicas

- A função `isValidDate` verifica se o valor existe e se pode ser convertido em uma data válida
- A validação usa `!isNaN(date.getTime())` para detectar datas inválidas
- O fallback "Não agendada" é exibido para qualquer data inválida ou ausente
- A solução é defensiva e previne erros futuros com dados inconsistentes

## 🎯 Prevenção de Problemas Similares

Para evitar problemas similares no futuro:

1. Sempre validar datas antes de formatá-las com `date-fns`
2. Usar funções auxiliares de validação reutilizáveis
3. Implementar fallbacks apropriados para dados ausentes ou inválidos
4. Considerar adicionar validação no backend para garantir qualidade dos dados

