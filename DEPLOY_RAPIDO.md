# ⚡ Deploy Rápido - Hostinger

## 🚨 IMPORTANTE: Se Você Está com Erro de Timeout

**Se ao tentar fazer login está dando erro de timeout**, você precisa executar uma migration no Supabase primeiro!

👉 **Leia o arquivo:** `RESOLVER_ERRO_TIMEOUT.md` e execute a migration antes de continuar.

---

## 🚀 4 Passos Simples

### 1️⃣ Executar Migration no Supabase (Obrigatório)

⚠️ **ESTE PASSO É ESSENCIAL** para evitar erro de timeout no login!

1. Acesse https://app.supabase.com/
2. Vá em **SQL Editor**
3. Copie e execute o conteúdo de: `migrations/12º_Migration_create_get_current_user_profile_function.sql`

> 💡 Veja `RESOLVER_ERRO_TIMEOUT.md` para instruções detalhadas

### 2️⃣ Configurar `.env.local`

Crie o arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

> 💡 Veja `TEMPLATE_ENV_LOCAL.txt` para instruções detalhadas

### 3️⃣ Fazer o Build

```bash
npm run build:validate
```

Este comando vai:
- ✅ Fazer o build
- ✅ Validar se tudo está correto
- ✅ Verificar se o `.htaccess` está presente

### 4️⃣ Upload na Hostinger

1. Acesse **Gerenciador de Arquivos**
2. Vá até a pasta do subdomínio
3. **Delete arquivos antigos**
4. **Upload de TUDO da pasta `dist`**
5. Verifique se `.htaccess` foi enviado

---

## ✅ Testes Pós-Deploy

### Teste 1: Erro 404
```
1. Acesse uma rota: https://seusite.com/dashboard
2. Dê F5
3. ✅ Não deve dar erro 404
```

### Teste 2: Supabase
```javascript
// Console do navegador (F12):
console.log(import.meta.env.VITE_SUPABASE_URL)
// ✅ Deve exibir a URL (não undefined)
```

### Teste 3: Login
```
1. Tente fazer login
2. ✅ Deve funcionar
```

---

## 🐛 Problemas?

| Problema | Solução Rápida |
|----------|----------------|
| **404 ao dar F5** | `.htaccess` não foi enviado → Envie manualmente |
| **`undefined` no console** | `.env.local` estava errado → Refaça o build |
| **Erro no login** | Credenciais erradas → Verifique no Supabase |

---

## 📚 Documentação Completa

- **Guia Detalhado:** `GUIA_DEPLOY_HOSTINGER.md`
- **Checklist:** `PRE_DEPLOY_CHECKLIST.md`
- **Resumo:** `RESUMO_CORREÇÕES_DEPLOY.md`

---

## 🎯 Comandos Úteis

```bash
# Build + validação (RECOMENDADO)
npm run build:validate

# Apenas build
npm run build

# Apenas validar build existente
npm run validate

# Preview local antes de enviar
npm run preview
```

---

**Tempo total:** ~10 minutos ⏱️

