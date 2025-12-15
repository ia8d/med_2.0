# 🔄 Ajuste: Convênios por Médico

## 📋 Descrição da Mudança

O sistema foi ajustado para que **cada médico possa escolher seus próprios convênios** individualmente, ao invés da clínica toda aceitar os mesmos convênios.

**Data:** 13/10/2025  
**Autor:** Sistema MedX

---

## 🎯 O que mudou?

### Antes:
- ❌ Apenas Owner/Secretary podiam gerenciar convênios
- ❌ Convênios eram da clínica inteira (todos os médicos)
- ❌ Médicos não tinham acesso ao menu

### Depois:
- ✅ **Cada médico escolhe seus próprios convênios**
- ✅ Médicos têm acesso ao menu "Convênios"
- ✅ Owner/Secretary podem ver convênios de todos os médicos
- ✅ Sistema multi-médico totalmente funcional

---

## 🗄️ Mudanças no Banco de Dados

### Tabela Modificada: `clinic_accepted_insurances`

**Campo Adicionado:**
```sql
doctor_id UUID REFERENCES auth.users(id)
```

**Constraints:**
- ❌ **Removido:** UNIQUE em `insurance_plan_id`
- ✅ **Adicionado:** UNIQUE composto em `(doctor_id, insurance_plan_id)`
  - Impede que um médico aceite o mesmo plano duas vezes
  - Permite que múltiplos médicos aceitem o mesmo plano

**Índice Adicionado:**
```sql
idx_clinic_accepted_insurances_doctor
```

---

## 🔒 Novas Políticas RLS

### Política: "Médicos podem gerenciar seus próprios convênios"

**Permissões:**

| Ação | Médico | Owner | Secretary |
|------|--------|-------|-----------|
| Ver próprios convênios | ✅ | ✅ | ✅ |
| Ver convênios de outros | ❌ | ✅ | ✅ |
| Adicionar próprios convênios | ✅ | ✅ | ❌ |
| Remover próprios convênios | ✅ | ✅ | ❌ |
| Adicionar para outros médicos | ❌ | ✅ | ❌ |
| Remover de outros médicos | ❌ | ✅ | ❌ |

---

## 🎨 Mudanças na Interface

### 1. Acesso ao Menu
```typescript
// Antes
roles: ['owner', 'secretary']

// Depois
roles: ['owner', 'secretary', 'doctor']
```

### 2. Título Dinâmico
```typescript
// Para médicos
"Selecione os convênios e planos que você aceita"

// Para owner/secretary
"Visualize os convênios aceitos pelos médicos"
```

### 3. Filtros Automáticos
- **Médico:** Vê e gerencia apenas seus próprios convênios
- **Owner/Secretary:** Vê convênios de todos os médicos (read-only para secretary)

### 4. Inserção com doctor_id
```typescript
// Ao adicionar convênio
{
  insurance_plan_id: planId,
  doctor_id: user.id,  // ← NOVO
  is_active: true
}
```

---

## 📁 Arquivos Modificados

### SQL:
- ✅ `migrations/28º_Migration_adjust_insurance_per_doctor.sql` (NOVO)

### TypeScript/React:
- ✅ `src/pages/Convenios.tsx` (modificado)
- ✅ `src/components/layout/Sidebar.tsx` (modificado)

### Documentação:
- ✅ `AJUSTE_CONVENIOS_POR_MEDICO.md` (este arquivo)

---

## 🚀 Como Funciona Agora

### Para Médicos:

1. **Acessar menu "Convênios"**
   - Menu agora visível para médicos

2. **Ver operadoras disponíveis**
   - Visualiza todas as 11 operadoras
   - Visualiza os 42 planos disponíveis

3. **Selecionar seus convênios**
   - Marca os planos que aceita
   - Sistema salva vinculado ao ID do médico

4. **Gerenciar convênios**
   - Pode adicionar/remover a qualquer momento
   - Vê apenas seus próprios convênios

### Para Owner:

1. **Ver convênios de todos**
   - Visualiza convênios de todos os médicos
   - Dashboard mostra totais gerais

2. **Gerenciar para qualquer médico**
   - Pode adicionar/remover convênios
   - Pode ver quais médicos aceitam cada plano

### Para Secretary:

1. **Visualizar convênios**
   - Vê convênios de todos os médicos
   - Modo read-only (não pode modificar)

---

## 📊 Exemplo de Uso

### Cenário Real:

**Clínica com 3 médicos:**

| Médico | Convênios Aceitos |
|--------|-------------------|
| Dr. João | Amil Fácil, Unimed Nacional, Bradesco Top |
| Dra. Maria | Amil One Health, SulAmérica Executivo |
| Dr. Pedro | Hapvida Mix, Porto Seguro 200, Unimed Regional |

**Benefícios:**
- ✅ Cada médico tem autonomia
- ✅ Pacientes sabem qual médico atende seu convênio
- ✅ Owner tem visão geral
- ✅ Sistema flexível e escalável

---

## 🔍 Queries Úteis

### Ver convênios por médico:

```sql
SELECT 
  u.raw_user_meta_data->>'name' as medico,
  ic.name as operadora,
  ip.name as plano
FROM clinic_accepted_insurances cai
JOIN auth.users u ON u.id = cai.doctor_id
JOIN insurance_plans ip ON ip.id = cai.insurance_plan_id
JOIN insurance_companies ic ON ic.id = ip.insurance_company_id
WHERE cai.is_active = true
ORDER BY u.raw_user_meta_data->>'name', ic.name;
```

### Contar convênios por médico:

```sql
SELECT 
  u.raw_user_meta_data->>'name' as medico,
  COUNT(*) as total_convenios
FROM clinic_accepted_insurances cai
JOIN auth.users u ON u.id = cai.doctor_id
WHERE cai.is_active = true
GROUP BY u.id, u.raw_user_meta_data->>'name'
ORDER BY COUNT(*) DESC;
```

### Ver médicos que aceitam um plano específico:

```sql
SELECT 
  u.raw_user_meta_data->>'name' as medico,
  u.raw_user_meta_data->>'email' as email
FROM clinic_accepted_insurances cai
JOIN auth.users u ON u.id = cai.doctor_id
WHERE cai.insurance_plan_id = 'ID_DO_PLANO'
  AND cai.is_active = true;
```

---

## ✅ Checklist de Verificação

Após aplicar o ajuste, verifique:

- [ ] Migration executada com sucesso
- [ ] Campo `doctor_id` criado
- [ ] Constraints atualizadas
- [ ] Políticas RLS ativas
- [ ] Menu visível para médicos
- [ ] Médico pode adicionar convênios
- [ ] Médico pode remover convênios
- [ ] Médico vê apenas seus convênios
- [ ] Owner vê todos os convênios
- [ ] Secretary vê todos (read-only)

---

## 🔄 Migration Aplicada

```sql
-- Execute no Supabase:
migrations/28º_Migration_adjust_insurance_per_doctor.sql
```

**Status:** ✅ Aplicada em 13/10/2025

---

## 📈 Impacto

### Positivo:
- ✅ Maior autonomia para médicos
- ✅ Sistema mais flexível
- ✅ Melhor experiência do usuário
- ✅ Permite especialização por médico
- ✅ Facilita agendamento por convênio

### Considerações:
- ⚠️ Owner precisa monitorar convênios de todos
- ⚠️ Comunicação clara aos pacientes sobre qual médico aceita cada convênio

---

## 🔮 Próximos Passos Sugeridos

### Fase 1 - Visualização:
- [ ] Dashboard para owner ver convênios por médico
- [ ] Filtro de médicos na página de convênios
- [ ] Badge mostrando quantos médicos aceitam cada plano

### Fase 2 - Integração:
- [ ] Filtrar médicos disponíveis no agendamento por convênio do paciente
- [ ] Mostrar convênios aceitos no perfil do médico
- [ ] Validação automática: paciente + convênio + médico

### Fase 3 - Relatórios:
- [ ] Relatório de convênios mais aceitos
- [ ] Análise de coverage por médico
- [ ] Dashboard comparativo

---

## 💡 Exemplo de Fluxo Completo

### Médico:
```
1. Login como médico
2. Menu → Convênios
3. Ver 11 operadoras
4. Expandir Amil
5. Clicar em "Amil Medial"
6. Toast: "Convênio adicionado aos seus convênios aceitos"
7. Card fica verde ✓
8. Estatísticas atualizam
```

### Owner:
```
1. Login como owner
2. Menu → Convênios
3. Ver todos os convênios de todos os médicos
4. Pode adicionar/remover para qualquer médico
5. Dashboard mostra totais gerais
```

---

## 🎯 Resultado Final

```
✅ Sistema Multi-Médico Funcional
✅ Cada médico com seus convênios
✅ Owner com visão geral
✅ Secretary pode visualizar
✅ RLS configurado corretamente
✅ Interface adaptada
✅ Documentação completa
```

---

## 📞 Suporte

Para dúvidas sobre o ajuste:
1. Consulte este documento
2. Verifique as policies RLS no Supabase
3. Execute as queries de exemplo
4. Teste com diferentes roles

---

**Versão:** 2.0 (Ajustado para Multi-Médico)  
**Data:** 13/10/2025  
**Status:** ✅ **FUNCIONANDO**  
**Compatível com:** Sistema MedX v1.0+

---

**🎊 Sistema ajustado com sucesso!**

Agora cada médico tem autonomia para gerenciar seus próprios convênios! 🚀

