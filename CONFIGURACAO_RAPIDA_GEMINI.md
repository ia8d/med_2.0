# ⚡ Configuração Rápida - Gemini API

## 🎯 Passo a Passo (5 minutos)

### **1. Obter API Key**
Acesse: https://makersuite.google.com/app/apikey

### **2. Executar SQL no Supabase**

Abra o **SQL Editor** no Supabase Dashboard e execute:

```sql
-- Inserir configuração da API key do Gemini
INSERT INTO public.system_settings (key, value, description, is_active) VALUES
    ('gemini_api_key', 'SUA_API_KEY_AQUI', 'API key do Google Gemini Flash para análise de exames laboratoriais e imagens médicas', true)
ON CONFLICT (key) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();
```

### **3. Atualizar com sua API Key**

Substitua `SUA_API_KEY_AQUI` pela chave real:

```sql
UPDATE public.system_settings 
SET value = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' 
WHERE key = 'gemini_api_key';
```

### **4. Verificar Configuração**

```sql
SELECT key, value, is_active 
FROM public.system_settings 
WHERE key = 'gemini_api_key';
```

### **5. Testar no Sistema**

1. Acesse: **Menu Assistente → Agent de Exames**
2. Faça upload de um PDF ou imagem de exame
3. Clique em **"Analisar Exame"**
4. ✅ Pronto!

---

## 🔍 Verificação de Funcionamento

### **Console do Navegador (F12):**
Se tudo estiver correto, você verá:

```
🔍 Iniciando análise com Gemini Flash...
📄 Arquivo: hemograma.pdf Tipo: application/pdf Tamanho: 245678
🔑 Buscando API key do Gemini...
📦 Convertendo arquivo para base64...
✅ Conversão concluída
🚀 Enviando requisição para Gemini Flash...
📥 Resposta recebida do Gemini
✅ Análise gerada com sucesso!
📝 Tamanho da resposta: 2847 caracteres
✅ Análise completa! Tamanho: 2847 caracteres
```

---

## ❌ Erros Comuns

### **"API key do Gemini não configurada"**
- Execute o SQL de inserção/atualização acima

### **"Erro na API do Gemini: 404"** 🔥 **RESOLVIDO!**
- ✅ **O código foi atualizado!** Agora tenta 4 modelos diferentes automaticamente
- ✅ Se ainda der erro, **gere uma nova API key**: https://makersuite.google.com/app/apikey
- ✅ Veja guia completo: `TROUBLESHOOTING_GEMINI_404.md`

### **"Erro na API do Gemini: 400"**
- API key inválida, verifique se copiou corretamente

### **"Erro na API do Gemini: 429"**
- Quota excedida, aguarde 1 minuto (15 requests/minuto no tier gratuito)

### **"Por favor, selecione apenas arquivos: PDF, PNG, JPG, JPEG, WEBP"**
- Tipo de arquivo não suportado

---

## 🎁 Tier Gratuito do Gemini

✅ **15 requests por minuto**  
✅ **1 milhão de tokens por dia**  
✅ **1.500 requests por dia**  

**Suficiente para:**
- Clínicas pequenas/médias
- Testes e desenvolvimento
- Uso regular (não massivo)

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique se a API key está correta no banco
3. Teste sua API key diretamente: https://ai.google.dev/tutorials/rest_quickstart

---

✅ **Configuração completa!** Agora você pode analisar exames com IA! 🚀

