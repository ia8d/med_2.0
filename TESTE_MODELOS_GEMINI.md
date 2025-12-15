# 🧪 Script de Teste - Descobrir Qual Modelo Funciona

## 🎯 Objetivo
Testar todos os modelos do Gemini para descobrir qual funciona com sua API key.

---

## 🚀 Como Usar

### **Passo 1: Abrir Console do Navegador**
Pressione **F12** e vá na aba **Console**

### **Passo 2: Cole e Execute o Script**

```javascript
// ============================================
// 🧪 SCRIPT DE TESTE - MODELOS GEMINI
// ============================================

async function testarModelosGemini() {
  // 🔑 COLE SUA API KEY AQUI
  const apiKey = 'SUA_API_KEY_AQUI';
  
  // Lista de modelos para testar
  const modelos = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro-vision',
    'gemini-pro',
  ];
  
  console.log('🔍 Testando modelos do Gemini...\n');
  console.log('='.repeat(50));
  
  const modelosFuncionando = [];
  
  for (const modelo of modelos) {
    try {
      console.log(`\n🔄 Testando: ${modelo}...`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${modelo}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Responda apenas: OK' }] }]
          })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${modelo} - FUNCIONOU!`);
        modelosFuncionando.push(modelo);
      } else {
        const errorText = await response.text();
        console.log(`❌ ${modelo} - Erro ${response.status}: ${errorText.substring(0, 100)}`);
      }
      
      // Aguardar 1 segundo entre requisições (respeitar rate limit)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ${modelo} - Erro de rede:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 RESUMO DOS TESTES:\n');
  
  if (modelosFuncionando.length === 0) {
    console.log('❌ NENHUM modelo funcionou!');
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Gere uma nova API key: https://makersuite.google.com/app/apikey');
    console.log('2. Verifique se sua API key está correta');
    console.log('3. Tente criar a API key em um projeto novo');
    console.log('4. Verifique se você está em uma região suportada');
  } else {
    console.log(`✅ ${modelosFuncionando.length} modelo(s) funcionando:\n`);
    modelosFuncionando.forEach((modelo, index) => {
      console.log(`${index + 1}. ${modelo}`);
    });
    
    console.log('\n🎯 RECOMENDAÇÃO:');
    console.log(`Use o modelo: ${modelosFuncionando[0]}`);
    console.log('\n📝 Para configurar no sistema, execute no SQL do Supabase:');
    console.log(`\nUPDATE public.system_settings`);
    console.log(`SET value = '${modelosFuncionando[0]}'`);
    console.log(`WHERE key = 'gemini_model';`);
  }
  
  console.log('\n' + '='.repeat(50));
}

// Executar teste
testarModelosGemini();
```

---

## 📋 Passo 3: Interpretar Resultados

### ✅ **Se algum modelo funcionar:**
Você verá algo como:
```
✅ gemini-1.5-flash-latest - FUNCIONOU!
```

**Configure no banco:**
```sql
UPDATE public.system_settings 
SET value = 'gemini-1.5-flash-latest' 
WHERE key = 'gemini_model';
```

### ❌ **Se NENHUM modelo funcionar:**
Você verá:
```
❌ NENHUM modelo funcionou!
```

**Soluções:**
1. **Gere uma nova API key**: https://makersuite.google.com/app/apikey
2. **Crie em um projeto NOVO** (não use projeto antigo)
3. **Teste novamente** com a nova key

---

## 🎯 Teste Rápido Individual

Se quiser testar apenas um modelo específico (ex: `gemini-1.5-flash-latest`):

```javascript
const apiKey = 'SUA_API_KEY_AQUI';
const modelo = 'gemini-1.5-flash-latest';

fetch(`https://generativelanguage.googleapis.com/v1/models/${modelo}:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'teste' }] }]
  })
})
.then(r => r.json())
.then(d => console.log('✅ Funcionou!', d))
.catch(e => console.error('❌ Erro:', e));
```

---

## 🔍 Teste com Imagem/PDF (Modelos Vision)

Para testar se o modelo suporta análise de arquivos:

```javascript
const apiKey = 'SUA_API_KEY_AQUI';
const modelo = 'gemini-1.5-flash-latest';

// Imagem de teste em base64 (1x1 pixel PNG transparente)
const imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

fetch(`https://generativelanguage.googleapis.com/v1/models/${modelo}:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{
      parts: [
        { text: 'Descreva esta imagem' },
        { inline_data: { mime_type: 'image/png', data: imageBase64 } }
      ]
    }]
  })
})
.then(r => r.json())
.then(d => console.log('✅ Suporta imagens!', d))
.catch(e => console.error('❌ Não suporta imagens:', e));
```

---

## 📊 Tabela de Modelos

| Modelo | Velocidade | Custo | Suporte a Imagens/PDF |
|--------|-----------|-------|----------------------|
| `gemini-2.0-flash-exp` | ⚡⚡⚡ | Grátis | ✅ Sim |
| `gemini-1.5-flash-latest` | ⚡⚡⚡ | Grátis | ✅ Sim |
| `gemini-1.5-flash-002` | ⚡⚡⚡ | Grátis | ✅ Sim |
| `gemini-1.5-flash` | ⚡⚡⚡ | Grátis | ✅ Sim |
| `gemini-1.5-pro-latest` | ⚡⚡ | Grátis | ✅ Sim |
| `gemini-1.5-pro` | ⚡⚡ | Grátis | ✅ Sim |
| `gemini-pro-vision` | ⚡ | Grátis | ✅ Sim |
| `gemini-pro` | ⚡ | Grátis | ❌ Não |

---

## 🎁 Rate Limits (Tier Gratuito)

- ⚡ **15 requests por minuto**
- 📊 **1 milhão de tokens por dia**
- 📈 **1.500 requests por dia**

---

## 💡 Dicas

### **1. Se todos os modelos derem 404:**
→ Problema com a API key, gere uma nova

### **2. Se todos os modelos derem 403:**
→ API key não tem permissões, habilite "Generative Language API"

### **3. Se todos os modelos derem 429:**
→ Quota excedida, aguarde 1 minuto

### **4. Se alguns funcionarem e outros não:**
→ Configure o que funciona e está tudo certo!

---

## ✅ Checklist Final

Depois de descobrir qual modelo funciona:

- [ ] Anotei qual(is) modelo(s) funcionou(ram)
- [ ] Executei o SQL para configurar no banco
- [ ] Testei no sistema (Agent de Exames)
- [ ] Verificou os logs do console (F12)
- [ ] Funcionou! 🎉

---

## 📞 Ainda com Problemas?

Se NENHUM modelo funcionar mesmo com API key nova:

1. **Verifique sua região** - Alguns países podem ter restrições
2. **Tente VPN** para US/EU para testar
3. **Entre em contato** com suporte Google AI: https://support.google.com/

---

**Execute o script e me diga qual modelo funcionou! 🚀**

