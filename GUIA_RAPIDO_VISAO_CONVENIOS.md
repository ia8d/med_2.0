# 🚀 Guia Rápido: Visão de Convênios

**Para gestores que querem ver quais médicos aceitam quais convênios**

---

## 🎯 O Que É?

Uma página que mostra **todos os médicos** da clínica e **quais convênios cada um aceita**, em uma tabela visual e interativa.

---

## 👥 Quem Pode Acessar?

- ✅ **Owner** (proprietário)
- ✅ **Secretary** (secretária)
- ❌ **Doctor** (médico usa outra página)

---

## 🖱️ Como Acessar?

```
1. Faça login como owner ou secretary
2. No menu lateral, clique em "Visão de Convênios"
3. Pronto! Você verá a lista de médicos
```

---

## 📊 O Que Vou Ver?

### 1️⃣ Cards no Topo (Estatísticas)
```
┌──────────────┐  ┌──────────────┐  ┌──────────┐
│ Total        │  │ Com          │  │ Média    │
│ Médicos: 5   │  │ Convênios: 3 │  │ Planos:  │
│              │  │              │  │ 4.2      │
└──────────────┘  └──────────────┘  └──────────┘
```

### 2️⃣ Campo de Busca
```
🔍 [Digite aqui para buscar...]
```
- Busca por nome do médico
- Busca por especialidade
- Busca por convênio/operadora

### 3️⃣ Tabela de Médicos
```
┌──────────────┬──────────────┬──────────┬────────┬─────────────────┐
│ Médico       │ Especialidade│ Operado- │ Planos │ Convênios       │
│              │              │ ras      │        │ Aceitos         │
├──────────────┼──────────────┼──────────┼────────┼─────────────────┤
│ Dr. João     │ Cardiologia  │    2     │   5    │ Amil - Fácil,   │
│ joao@...     │              │          │        │ Unimed - Nac... │
└──────────────┴──────────────┴──────────┴────────┴─────────────────┘
```

---

## 🔍 Como Usar a Busca?

### Exemplo 1: Buscar por médico
```
Digite: "João"
Resultado: Mostra apenas o Dr. João
```

### Exemplo 2: Buscar por especialidade
```
Digite: "Cardiologia"
Resultado: Mostra todos os cardiologistas
```

### Exemplo 3: Buscar por operadora
```
Digite: "Amil"
Resultado: Mostra todos os médicos que aceitam Amil
```

---

## 💡 Casos de Uso

### Caso 1: Paciente ligou perguntando
**Situação:** Paciente tem convênio Amil e quer saber quais médicos atendem

**Solução:**
1. Acesse "Visão de Convênios"
2. Digite "Amil" na busca
3. Veja lista de médicos que aceitam Amil
4. Informe ao paciente

---

### Caso 2: Preciso de um cardiologista específico
**Situação:** Preciso saber se algum cardiologista aceita Unimed

**Solução:**
1. Acesse "Visão de Convênios"
2. Digite "Cardiologia" na busca
3. Olhe na coluna "Convênios Aceitos"
4. Veja se aparece "Unimed"

---

### Caso 3: Análise de cobertura
**Situação:** Quero saber quantos médicos temos com convênios

**Solução:**
1. Acesse "Visão de Convênios"
2. Olhe o card "Com Convênios" no topo
3. Veja o número total

---

## ❓ Perguntas Frequentes

### 1. Por que alguns médicos aparecem com "0" convênios?
**R:** O médico ainda não cadastrou os convênios que aceita. Ele precisa:
1. Fazer login
2. Ir em menu "Convênios"
3. Selecionar os convênios que aceita

---

### 2. Os dados são em tempo real?
**R:** Sim! Quando um médico adiciona/remove convênios, basta **recarregar a página** e verá a atualização.

---

### 3. Posso editar os convênios daqui?
**R:** Não. Esta página é **apenas visualização**. Apenas os médicos podem adicionar/remover seus convênios.

---

### 4. Por que não vejo o menu "Visão de Convênios"?
**R:** Você precisa estar logado como **owner** ou **secretary**. Médicos não têm acesso.

---

### 5. Qual a diferença entre "Convênios" e "Visão de Convênios"?

| Menu | Para quem? | O que faz? |
|------|-----------|------------|
| **Convênios** | Owner, Secretary, Doctor | Médico seleciona convênios |
| **Visão de Convênios** | Owner, Secretary | Gestor visualiza todos |

---

## 🎯 Atalhos Úteis

### Ver médicos sem convênios:
```
Olhe na tabela → médicos com "0" na coluna "Planos"
```

### Ver total de convênios por médico:
```
Olhe a coluna "Planos" (número total de planos)
```

### Ver quais operadoras o médico aceita:
```
Olhe a coluna "Operadoras" (número de operadoras distintas)
```

---

## 📱 Exemplo Visual

```
═══════════════════════════════════════════════════════
        Médicos e Convênios
─────────────────────────────────────────────────────── 
  
  [5 Médicos]  [3 Com Convênios]  [4.2 Média]

─────────────────────────────────────────────────────── 
  
  🔍 [Buscar por médico, especialidade ou convênio]

─────────────────────────────────────────────────────── 

  ╔════════════════════════════════════════════════╗
  ║ Dr. João Silva                                 ║
  ║ joao@email.com                                 ║
  ║ ─────────────────────────────────────────────  ║
  ║ Especialidade: Cardiologia                     ║
  ║ Operadoras: 2    Planos: 5                     ║
  ║ Aceita: Amil - Fácil, Amil - One,             ║
  ║         Unimed - Nacional, Unimed - Regional   ║
  ╚════════════════════════════════════════════════╝
  
  ╔════════════════════════════════════════════════╗
  ║ Dra. Maria Santos                              ║
  ║ maria@email.com                                ║
  ║ ─────────────────────────────────────────────  ║
  ║ Especialidade: Pediatria                       ║
  ║ Operadoras: 1    Planos: 3                     ║
  ║ Aceita: Bradesco - Top Nacional,              ║
  ║         Bradesco - Executivo                   ║
  ╚════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════
```

---

## ✅ Checklist Rápido

**Antes de usar:**
- [ ] Estou logado como owner ou secretary
- [ ] Vejo o menu "Visão de Convênios" no sidebar

**Ao usar:**
- [ ] Vejo os cards com estatísticas
- [ ] Vejo a tabela com lista de médicos
- [ ] Consigo buscar/filtrar

**Se algo não funcionar:**
1. Recarregue a página (F5)
2. Faça logout e login novamente
3. Verifique se é owner/secretary

---

## 🎯 Resumo em 3 Passos

```
1️⃣ Login (owner/secretary)
        ↓
2️⃣ Menu "Visão de Convênios"
        ↓
3️⃣ Veja todos os médicos e convênios
```

---

## 📞 Dúvidas?

**Documentação completa:**
- `IMPLEMENTACAO_VISAO_CONVENIOS.md` → Documentação técnica
- `QUERIES_ANALISE_CONVENIOS.md` → Queries para análises
- `ENTREGA_VISAO_CONVENIOS.md` → Resumo da entrega

---

**🎉 Pronto para usar!**

---

**Última atualização:** 2025-10-14

