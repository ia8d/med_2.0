# 🔧 Correção: Loading Infinito no Menu Follow Up

**Data:** 2025-10-27  
**Autor:** AI Assistant  
**Tipo:** Bug Fix

---

## 📋 Problema Identificado

### Sintoma
O card "Clientes em Follow Up" ficava eternamente na mensagem "Carregando clientes...", nunca mostrando os dados.

### Causa Raiz
O hook `useRealtimeList` estava entrando em **loop infinito** porque os parâmetros `filters` e `order` eram recriados a cada render do componente. 

Como esses objetos estão no array de dependências do `useEffect` dentro do hook, cada nova renderização disparava uma nova requisição, que por sua vez causava uma nova renderização, criando um ciclo infinito.

```typescript
// ❌ ANTES - Causava loop infinito
const { data: clientes, loading: loadingClientes, error } = useRealtimeList<ClienteFollowUp>({
  table: 'clientes_followup',
  filters: [  // ⚠️ Novo array a cada render
    { column: 'followup', operator: 'neq', value: 'encerrado' }
  ],
  order: { column: 'ultima_atividade', ascending: false },  // ⚠️ Novo objeto a cada render
});
```

---

## ✅ Solução Implementada

### 1. Importação do `useMemo`
```typescript
import { useState, useEffect, useMemo } from 'react';
```

### 2. Estabilização dos Parâmetros
Utilizamos `useMemo` para criar referências estáveis dos objetos `filters` e `order`:

```typescript
// ✅ DEPOIS - Referências estáveis
// Filtro estável para evitar loops infinitos
const followUpFilters = useMemo(() => [
  { column: 'followup', operator: 'neq' as const, value: 'encerrado' }
], []);

// Ordenação estável
const followUpOrder = useMemo(() => ({
  column: 'ultima_atividade',
  ascending: false
}), []);

// Buscar clientes de follow-up (excluindo os encerrados)
const { data: clientes, loading: loadingClientes, error } = useRealtimeList<ClienteFollowUp>({
  table: 'clientes_followup',
  filters: followUpFilters,
  order: followUpOrder,
});
```

---

## 🎯 Benefícios

1. **Performance**: Elimina requisições desnecessárias ao banco de dados
2. **UX**: Os clientes são carregados e exibidos corretamente
3. **Estabilidade**: Componente não trava mais em loading
4. **Previsibilidade**: Comportamento consistente em todas as renderizações

---

## 🔍 Contexto Técnico

### Como o `useMemo` Resolve o Problema

O `useMemo` garante que os objetos `followUpFilters` e `followUpOrder` **mantenham a mesma referência** entre renderizações, desde que suas dependências não mudem (nesse caso, o array de dependências está vazio `[]`, então nunca mudam).

```typescript
// A cada render:
// ❌ Sem useMemo: novo array [] !== array anterior []
// ✅ Com useMemo: mesma referência === referência anterior
```

### Dependency Array no useRealtimeList
```typescript
useEffect(() => {
  // ... código do hook
}, [table, schema, select, order?.column, order?.ascending, order?.nullsFirst, limit, primaryKey, filters]);
```

Sem o `useMemo`, o `filters` e `order` são comparados por **referência**, não por valor. Mesmo que o conteúdo seja idêntico, um novo array/objeto tem uma referência diferente, disparando o `useEffect` novamente.

---

## 📁 Arquivos Alterados

### `src/pages/FollowUp.tsx`
- ✅ Adicionado `useMemo` aos imports
- ✅ Criado `followUpFilters` com `useMemo`
- ✅ Criado `followUpOrder` com `useMemo`
- ✅ Passado referências estáveis para `useRealtimeList`

---

## 🧪 Validação

Para validar se a correção funcionou:

1. ✅ Acessar o menu "Follow Up"
2. ✅ Verificar que a mensagem "Carregando clientes..." desaparece rapidamente
3. ✅ Verificar que os clientes são exibidos (se houver dados na tabela)
4. ✅ Verificar que não há requisições infinitas no console do navegador
5. ✅ Verificar que não há loops infinitos nos logs do hook `[useRealtimeList]`

---

## 💡 Lições Aprendidas

### Quando Usar `useMemo` com Hooks Personalizados

Sempre que você passar **objetos ou arrays** como parâmetros para hooks personalizados que utilizam esses valores em arrays de dependências do `useEffect`, você deve:

1. **Estabilizar** os valores com `useMemo` ou `useCallback`
2. **Ou** modificar o hook para fazer comparação por valor em vez de referência
3. **Ou** mover a criação desses objetos para dentro do `useEffect`

### Sintomas de Loop Infinito
- Loading que nunca termina
- Muitas requisições ao banco de dados (visível no Network tab)
- Muitos logs repetidos no console
- Componente travado ou lento

---

## 📊 Comparação

| Aspecto | Antes (❌) | Depois (✅) |
|---------|-----------|------------|
| **Comportamento** | Loading infinito | Carrega e exibe dados |
| **Requisições** | Infinitas | Uma única vez |
| **Performance** | Péssima | Ótima |
| **UX** | Travado | Fluido |
| **Console** | Logs infinitos | Logs únicos |

---

## 🔗 Referências

- React Docs: [useMemo](https://react.dev/reference/react/useMemo)
- React Docs: [useEffect dependencies](https://react.dev/reference/react/useEffect#dependencies)
- Hook afetado: `src/hooks/useRealtimeList.ts`
- Componente corrigido: `src/pages/FollowUp.tsx`

