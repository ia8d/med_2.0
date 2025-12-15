# Debug - Navegação Entre Menus Não Carrega Dados

## 📋 Problema Reportado

Ao navegar entre menus usando o sidebar, os dados não são carregados. É necessário dar F5 para os dados aparecerem.

**Exemplo do fluxo:**
1. Login → Dashboard (funciona ✅)
2. Clica em "Pacientes" no menu → Página carrega mas SEM dados ❌
3. Aperta F5 → Dados aparecem ✅

## ✅ Implementações de Debug

### 1. Logs Adicionados no `useRealtimeList`

O hook `useRealtimeList` agora tem logs detalhados em todas as etapas:

#### A. Montagem do Hook
```typescript
[useRealtimeList] 🔄 Montando hook para tabela: patients
[useRealtimeList] Parâmetros: { schema, select, order, limit, filters }
```

#### B. Fetch Inicial
```typescript
[useRealtimeList] 📡 Iniciando fetch para patients...
[useRealtimeList] Ordenando por: created_at (DESC)
[useRealtimeList] ✅ Fetch concluído para patients: { rowCount: 5, error: null }
[useRealtimeList] ✅ 5 registros carregados para patients
```

#### C. Canal Realtime
```typescript
[useRealtimeList] 📡 Criando canal realtime para patients
[useRealtimeList] Status do canal patients: SUBSCRIBED
```

#### D. Mudanças em Tempo Real
```typescript
[useRealtimeList] 🔔 Mudança detectada em patients: INSERT
```

#### E. Limpeza (Cleanup)
```typescript
[useRealtimeList] 🧹 Limpando hook para patients
```

### 2. Logs no `AuthContext` (já implementados)

Os logs do realtime do AuthContext também estão ativos.

## 🔍 Como Fazer Debug

### Passo 1: Preparação
1. Abra a aplicação
2. Abra o Console (F12)
3. Limpe o console (Ctrl+L ou botão 🚫)

### Passo 2: Fazer Login
1. Faça login normalmente
2. Observe os logs do AuthContext
3. A primeira página deve carregar com logs do `useRealtimeList`

**Logs esperados:**
```
[AuthContext] Login concluído com sucesso
[useRealtimeList] 🔄 Montando hook para tabela: profiles (ou agenda, etc)
[useRealtimeList] 📡 Iniciando fetch para...
[useRealtimeList] ✅ X registros carregados
```

### Passo 3: Navegar Para Outro Menu

**TESTE CRÍTICO:** Limpe o console antes de navegar!

1. Limpe o console (Ctrl+L)
2. Clique em outro menu no sidebar (ex: Pacientes)
3. **OBSERVE OS LOGS IMEDIATAMENTE**

### Passo 4: Análise dos Logs

#### Cenário A: Hook NÃO está sendo montado ❌

**O que você vê:**
```
(Nenhum log do useRealtimeList)
```

**Diagnóstico:** O componente não está sendo montado ao navegar.

**Causa Provável:**
- React Router não está remontando o componente
- DashboardLayout está cacheando os componentes
- Problema com navegação

**Próximo Passo:** Verificar se o componente realmente monta (ir para "Soluções > Problema 1")

---

#### Cenário B: Hook monta mas fetch não executa ❌

**O que você vê:**
```
[useRealtimeList] 🔄 Montando hook para tabela: patients
[useRealtimeList] Parâmetros: { ... }
(Mas nunca aparece "Iniciando fetch")
```

**Diagnóstico:** O useEffect executa mas o fetchInitial não é chamado.

**Causa Provável:** Bug no código (improvável com o código atual)

---

#### Cenário C: Fetch executa mas não retorna dados ❌

**O que você vê:**
```
[useRealtimeList] 🔄 Montando hook para tabela: patients
[useRealtimeList] 📡 Iniciando fetch para patients...
[useRealtimeList] ✅ Fetch concluído: { rowCount: 0, error: null }
[useRealtimeList] ✅ 0 registros carregados
```

**Diagnóstico:** A query executa mas não retorna dados.

**Causa Provável:**
- Filtros estão bloqueando os dados
- RLS (Row Level Security) bloqueando
- Não há dados na tabela

**Próximo Passo:** Ir para "Soluções > Problema 2"

---

#### Cenário D: Fetch retorna erro ❌

**O que você vê:**
```
[useRealtimeList] 🔄 Montando hook para tabela: patients
[useRealtimeList] 📡 Iniciando fetch para patients...
[useRealtimeList] ❌ Erro ao buscar patients: [mensagem do erro]
```

**Diagnóstico:** Erro na query ou conexão.

**Próximo Passo:** Copie o erro e investigue na seção "Erros Comuns"

---

#### Cenário E: Tudo funciona mas interface não atualiza ❌

**O que você vê:**
```
[useRealtimeList] 🔄 Montando hook para tabela: patients
[useRealtimeList] 📡 Iniciando fetch para patients...
[useRealtimeList] ✅ 5 registros carregados para patients
(Mas a tela continua vazia ou com loading)
```

**Diagnóstico:** Os dados carregam mas a UI não renderiza.

**Causa Provável:**
- Componente não está usando o estado corretamente
- Loading state não atualiza
- Erro de renderização

**Próximo Passo:** Ir para "Soluções > Problema 3"

---

#### Cenário F: Componente desmonta antes do fetch ⚠️

**O que você vê:**
```
[useRealtimeList] 🔄 Montando hook para tabela: patients
[useRealtimeList] 📡 Iniciando fetch para patients...
[useRealtimeList] 🧹 Limpando hook para patients (ANTES do fetch completar)
[useRealtimeList] ⚠️ Componente desmontado, ignorando resultado
```

**Diagnóstico:** O componente está desmontando muito rápido.

**Causa Provável:**
- Navegação rápida entre páginas
- React Router está remontando componentes demais
- Problema com Strict Mode

**Próximo Passo:** Ir para "Soluções > Problema 4"

---

## 🛠️ Soluções

### Problema 1: Componente Não Monta

**Verificação:**

Adicione um log temporário no componente que não carrega. Exemplo em `Patients.tsx`:

```typescript
export default function Patients() {
  console.log('🎯 [Patients] Componente montando');
  
  const { data: patients, loading, error } = useRealtimeList<Patient>({
    table: 'patients',
    order: { column: 'created_at', ascending: false },
  });
  
  // ... resto do código
}
```

**Se o log NÃO aparece:**
- O React Router não está trocando o componente
- Possível problema com o `<Routes>` no App.tsx

**Solução:**
Verificar se o App.tsx tem todas as rotas configuradas corretamente.

---

### Problema 2: Query Não Retorna Dados

**Diagnóstico Manual:**

Abra o console e execute:

```javascript
// Substitua 'patients' pela tabela que não está carregando
const { data, error } = await supabase
  .from('patients')
  .select('*')
  .order('created_at', { ascending: false });

console.log('Resultado:', { count: data?.length, error });
```

**Se retornar dados:**
- O problema é com os filtros do `useRealtimeList`
- Verifique os filtros passados para o hook

**Se NÃO retornar dados:**
- Verifique RLS no Supabase
- Verifique se há dados na tabela

**Verificar RLS:**

Execute no SQL Editor do Supabase:
```sql
-- Ver políticas da tabela
SELECT * FROM pg_policies WHERE tablename = 'patients';
```

---

### Problema 3: UI Não Atualiza

**Verificação:**

No componente, adicione logs temporários:

```typescript
const { data: patients, loading, error } = useRealtimeList<Patient>({
  table: 'patients',
  order: { column: 'created_at', ascending: false },
});

console.log('🎯 [Patients] Estado atual:', { 
  patientsCount: patients.length, 
  loading, 
  error 
});

useEffect(() => {
  console.log('🎯 [Patients] Dados mudaram:', patients.length);
}, [patients]);
```

**Se os logs mostram dados mas a UI não renderiza:**
- Problema de renderização condicional
- Verifique se há `if (loading) return ...` bloqueando

**Exemplo de problema comum:**
```typescript
// ❌ ERRADO - se loading nunca vira false, nunca renderiza
if (loading) return <div>Carregando...</div>;

// ✅ CORRETO - renderiza condicional dentro do JSX
return (
  <div>
    {loading ? <Spinner /> : <DataTable data={patients} />}
  </div>
);
```

---

### Problema 4: Componente Desmonta Rápido

**Causa:** React 18 Strict Mode monta/desmonta componentes duas vezes em desenvolvimento.

**Solução 1:** Ignorar - isso é esperado em dev mode e não acontece em produção.

**Solução 2 (temporária):** Desabilitar Strict Mode em `main.tsx`:

```typescript
// ANTES
<React.StrictMode>
  <AuthProvider>
    <App />
  </AuthProvider>
</React.StrictMode>

// DEPOIS (apenas para debug)
<AuthProvider>
  <App />
</AuthProvider>
```

⚠️ **IMPORTANTE:** Reabilite o StrictMode depois do debug!

---

## 🔄 Teste de Navegação Completo

Use este roteiro para testar sistematicamente:

### Roteiro de Teste

1. **Limpar estado:**
   - Logout
   - Limpar console (Ctrl+L)
   - Fazer login novamente

2. **Primeira navegação:**
   - [ ] Limpar console
   - [ ] Clicar em "Pacientes"
   - [ ] Copiar todos os logs
   - [ ] Verificar se dados carregam

3. **Segunda navegação:**
   - [ ] Limpar console
   - [ ] Clicar em "Usuários"
   - [ ] Copiar todos os logs
   - [ ] Verificar se dados carregam

4. **Terceira navegação:**
   - [ ] Limpar console
   - [ ] Voltar para "Pacientes"
   - [ ] Copiar todos os logs
   - [ ] Verificar se dados carregam

### Análise dos Resultados

**Todas funcionam:** ✅ O problema estava resolvido!

**Apenas a primeira falha:** 🤔 Pode ser problema de inicialização

**Todas falham:** ❌ Problema sistemático com navegação

**Intermitente:** ⚠️ Pode ser race condition ou timing

---

## 📝 Checklist de Debug

Quando reportar o problema, inclua:

- [ ] **Navegação testada:** De qual página para qual página?
- [ ] **Logs completos:** Copie TODOS os logs do console após navegação
- [ ] **Status visual:** A tela mostra "carregando" ou fica em branco?
- [ ] **Comportamento no F5:** Os dados aparecem depois do F5?
- [ ] **Reprodutível:** Acontece toda vez ou às vezes?
- [ ] **Navegador:** Chrome, Firefox, Edge, etc?
- [ ] **Modo:** Desenvolvimento (npm run dev) ou produção?

---

## 🎯 Próximos Passos

1. **Teste agora:**
   - Faça login
   - Navegue entre menus
   - Observe os logs atentamente

2. **Copie os logs:**
   - Logs de ANTES da navegação
   - Logs DURANTE a navegação
   - Logs DEPOIS da navegação

3. **Identifique o cenário:**
   - Qual dos cenários (A-F) acima aconteceu?
   - Use a seção de Soluções correspondente

4. **Se não resolver:**
   - Copie TODOS os logs
   - Informe qual cenário aconteceu
   - Detalhe o fluxo de navegação exato

---

## 📌 Arquivos Modificados

- `src/hooks/useRealtimeList.ts` - Logs detalhados em todas as etapas
- `src/contexts/AuthContext.tsx` - Logs do realtime (já existentes)

---

## 🔗 Arquivos Relacionados

- `src/App.tsx` - Configuração das rotas
- `src/pages/Patients.tsx` - Exemplo de página usando `useRealtimeList`
- `src/pages/Users.tsx` - Exemplo de página usando `useRealtimeList`
- `src/components/layout/DashboardLayout.tsx` - Layout que envolve as páginas
- `src/components/layout/Sidebar.tsx` - Menu de navegação

