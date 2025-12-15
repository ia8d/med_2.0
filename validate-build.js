/**
 * Script de Validação de Build
 * 
 * Verifica se todos os arquivos necessários estão presentes
 * na pasta dist após o build
 * 
 * Uso: node validate-build.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');

console.log('\n🔍 Validando build...\n');

let hasErrors = false;

// Verificar se a pasta dist existe
if (!fs.existsSync(distPath)) {
  console.error('❌ Pasta dist não encontrada!');
  console.error('   Execute: npm run build');
  process.exit(1);
}

// Lista de arquivos obrigatórios
const requiredFiles = [
  'index.html',
  '.htaccess'
];

// Verificar arquivos obrigatórios
requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} encontrado`);
  } else {
    console.error(`❌ ${file} NÃO encontrado!`);
    hasErrors = true;
  }
});

// Verificar pasta assets
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assetsFiles = fs.readdirSync(assetsPath);
  const jsFiles = assetsFiles.filter(f => f.endsWith('.js'));
  const cssFiles = assetsFiles.filter(f => f.endsWith('.css'));
  
  console.log(`✅ Pasta assets encontrada`);
  console.log(`   📦 ${jsFiles.length} arquivo(s) JavaScript`);
  console.log(`   🎨 ${cssFiles.length} arquivo(s) CSS`);
  
  if (jsFiles.length === 0) {
    console.error('   ❌ Nenhum arquivo JavaScript encontrado!');
    hasErrors = true;
  }
  
  if (cssFiles.length === 0) {
    console.error('   ❌ Nenhum arquivo CSS encontrado!');
    hasErrors = true;
  }
} else {
  console.error('❌ Pasta assets NÃO encontrada!');
  hasErrors = true;
}

// Verificar conteúdo do .htaccess
const htaccessPath = path.join(distPath, '.htaccess');
if (fs.existsSync(htaccessPath)) {
  const htaccessContent = fs.readFileSync(htaccessPath, 'utf8');
  if (htaccessContent.includes('RewriteEngine On') && htaccessContent.includes('index.html')) {
    console.log('✅ .htaccess configurado corretamente');
  } else {
    console.error('❌ .htaccess existe mas pode estar mal configurado');
    hasErrors = true;
  }
}

// Verificar tamanho total do build
const getDirectorySize = (dirPath) => {
  let size = 0;
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  });
  
  return size;
};

const totalSize = getDirectorySize(distPath);
const sizeMB = (totalSize / 1024 / 1024).toFixed(2);

console.log(`\n📊 Tamanho total do build: ${sizeMB} MB`);

if (totalSize < 1024) {
  console.warn('⚠️  Build muito pequeno. Algo pode estar errado!');
  hasErrors = true;
}

// Resultado final
console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.error('\n❌ Build inválido! Corrija os erros acima.\n');
  process.exit(1);
} else {
  console.log('\n✅ Build válido! Pronto para deploy.\n');
  console.log('📤 Próximos passos:');
  console.log('   1. Acesse o Gerenciador de Arquivos da Hostinger');
  console.log('   2. Vá até a pasta do subdomínio');
  console.log('   3. Delete todos os arquivos antigos');
  console.log('   4. Faça upload de TODOS os arquivos da pasta dist');
  console.log('   5. Verifique se o .htaccess foi enviado');
  console.log('   6. Teste o site!\n');
  process.exit(0);
}

