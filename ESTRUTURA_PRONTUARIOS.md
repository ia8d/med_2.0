# Estrutura do Sistema de Prontuários - MedX

**Data de Criação:** 05/10/2025  
**Autor:** Sistema MedX  
**Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
3. [Armazenamento de Arquivos](#armazenamento-de-arquivos)
4. [Componentes e Funcionalidades](#componentes-e-funcionalidades)
5. [Como Replicar para Outra Clínica](#como-replicar-para-outra-clínica)
6. [Backup e Recuperação](#backup-e-recuperação)
7. [Manutenção e Suporte](#manutenção-e-suporte)

---

## 🎯 Visão Geral

O Sistema de Prontuários do MedX é uma solução completa para gestão de pacientes, permitindo:

- **Cadastro completo de pacientes** com foto
- **Prontuários médicos** com histórico de consultas
- **Fichas de anamnese** completas
- **Dados clínicos** (peso, altura, pressão, etc.)
- **Histórico de exames** com anexos
- **Linha do tempo** visual de todos os atendimentos
- **Upload de arquivos** (exames, documentos, imagens)
- **Relação médico-paciente** (N:N - multiplos médicos por paciente)

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **patients**
Cadastro principal de pacientes.

```sql
- id (UUID, PK)
- name (TEXT, NOT NULL)
- email (TEXT)
- phone (TEXT)
- cpf (TEXT)
- birth_date (DATE)
- gender (TEXT)
- address (TEXT)
- city (TEXT)
- state (TEXT)
- zip_code (TEXT)
- avatar_url (TEXT) -- URL da foto do paciente
- next_appointment_date (TIMESTAMPTZ) -- Data da próxima consulta
- notes (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**Índices:**
- `idx_patients_name` - Busca por nome
- `idx_patients_cpf` - Busca por CPF
- `idx_patients_email` - Busca por email
- `idx_patients_phone` - Busca por telefone

---

#### 2. **patient_doctors**
Relação N:N entre pacientes e médicos (múltiplos médicos podem atender um paciente).

```sql
- id (UUID, PK)
- patient_id (UUID, FK -> patients)
- doctor_id (UUID, FK -> profiles)
- is_primary (BOOLEAN) -- Indica se é o médico principal
- created_at (TIMESTAMPTZ)
```

**Constraint:** `UNIQUE(patient_id, doctor_id)`

---

#### 3. **medical_records**
Prontuários das consultas médicas.

```sql
- id (UUID, PK)
- patient_id (UUID, FK -> patients)
- doctor_id (UUID, FK -> profiles)
- appointment_date (TIMESTAMPTZ, NOT NULL)
- chief_complaint (TEXT) -- Queixa principal
- history_present_illness (TEXT) -- HDA
- physical_examination (TEXT) -- Exame físico
- diagnosis (TEXT) -- Diagnóstico
- treatment_plan (TEXT) -- Plano de tratamento
- prescriptions (TEXT) -- Prescrições
- notes (TEXT) -- Observações
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

---

#### 4. **appointments**
Consultas agendadas.

```sql
- id (UUID, PK)
- patient_id (UUID, FK -> patients)
- doctor_id (UUID, FK -> profiles)
- appointment_date (TIMESTAMPTZ, NOT NULL)
- duration_minutes (INTEGER, DEFAULT 30)
- status (TEXT) -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
- type (TEXT) -- Tipo de consulta
- notes (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

---

#### 5. **anamnesis**
Fichas de anamnese completas.

```sql
- id (UUID, PK)
- patient_id (UUID, FK -> patients)
- doctor_id (UUID, FK -> profiles)
- chief_complaint (TEXT) -- Queixa principal
- history_present_illness (TEXT) -- HDA
- past_medical_history (TEXT) -- HPP
- family_history (TEXT) -- História familiar
- social_history (TEXT) -- Hábitos de vida
- allergies (TEXT) -- Alergias
- current_medications (TEXT) -- Medicamentos em uso
- review_of_systems (TEXT) -- Revisão de sistemas
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

---

#### 6. **clinical_data**
Dados clínicos mensuráveis (sinais vitais).

```sql
- id (UUID, PK)
- patient_id (UUID, FK -> patients)
- doctor_id (UUID, FK -> profiles, NULL)
- measurement_date (TIMESTAMPTZ)
- weight_kg (DECIMAL)
- height_cm (DECIMAL)
- bmi (DECIMAL) -- Calculado automaticamente
- blood_pressure_systolic (INTEGER)
- blood_pressure_diastolic (INTEGER)
- heart_rate (INTEGER)
- temperature_celsius (DECIMAL)
- oxygen_saturation (INTEGER)
- notes (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

---

#### 7. **exam_history**
Histórico de exames realizados.

```sql
- id (UUID, PK)
- patient_id (UUID, FK -> patients)
- doctor_id (UUID, FK -> profiles, NULL)
- exam_type (TEXT, NOT NULL) -- Tipo do exame
- exam_name (TEXT, NOT NULL) -- Nome do exame
- exam_date (DATE, NOT NULL)
- result_summary (TEXT) -- Resumo do resultado
- observations (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

---

#### 8. **medical_attachments**
Referências aos arquivos armazenados no Supabase Storage.

```sql
- id (UUID, PK)
- patient_id (UUID, FK -> patients)
- uploaded_by (UUID, FK -> profiles, NULL)
- related_to_type (TEXT) -- 'medical_record', 'exam', 'anamnesis', 'general'
- related_to_id (UUID) -- ID da entidade relacionada
- file_name (TEXT, NOT NULL)
- file_path (TEXT, NOT NULL) -- Caminho no Storage
- file_size_bytes (BIGINT)
- file_type (TEXT)
- description (TEXT)
- created_at (TIMESTAMPTZ)
```

---

## 📁 Armazenamento de Arquivos

### Supabase Storage

**Bucket:** `medical-files`

**Configurações:**
- **Público:** Não (requer autenticação)
- **Limite por arquivo:** 50MB
- **Tipos permitidos:** 
  - Imagens: JPG, PNG, GIF, WEBP
  - Documentos: PDF, DOC, DOCX, XLS, XLSX, TXT
  - Médicos: DICOM

### Estrutura de Pastas

```
medical-files/
├── {patient_id}/
│   ├── avatar/
│   │   └── profile.jpg (foto do paciente)
│   ├── medical_records/
│   │   └── prontuario-2025-10-05.pdf
│   ├── exams/
│   │   ├── hemograma-2025-10-05.pdf
│   │   └── raio-x-2025-10-03.jpg
│   └── attachments/
│       └── documento-geral.pdf
```

**Exemplo de path completo:**
```
medical-files/550e8400-e29b-41d4-a716-446655440000/avatar/profile_1728123456_a1b2c3.jpg
```

### Políticas de Acesso (RLS)

Apenas usuários autenticados com roles `owner`, `doctor` ou `secretary` podem:
- **SELECT:** Visualizar arquivos
- **INSERT:** Fazer upload
- **UPDATE:** Atualizar metadados
- **DELETE:** Deletar arquivos

---

## 🧩 Componentes e Funcionalidades

### Hooks Customizados

1. **usePatientData(patientId)**
   - Busca dados completos do paciente
   - Retorna: patient, medicalRecords, anamnesis, clinicalData, examHistory, attachments, doctors
   - Suporta realtime updates

2. **useFileUpload()**
   - Gerencia upload de arquivos
   - Controla progresso e erros
   - Funções: upload, uploadAvatar, removeFile

3. **usePatientTimeline(patientId)**
   - Consolida todos os eventos do paciente
   - Ordena cronologicamente
   - Tipos: consultas, prontuários, exames, anamneses, dados clínicos

### Componentes Principais

1. **PatientDetailModal** - Modal principal com abas
2. **PatientOverview** - Visão geral e dados do paciente
3. **PatientAvatarUpload** - Upload de foto do paciente
4. **MedicalRecordsList** / **MedicalRecordForm** - Prontuários
5. **AnamnesisForm** - Ficha de anamnese
6. **ClinicalDataForm** - Registro de dados clínicos
7. **PatientTimeline** - Linha do tempo visual
8. **FileUploadZone** - Upload de múltiplos arquivos

---

## 🔄 Como Replicar para Outra Clínica

### Passo 1: Preparar o Projeto

1. **Clonar repositório:**
```bash
git clone <repositorio>
cd aura-clinic-vue
```

2. **Instalar dependências:**
```bash
npm install
```

### Passo 2: Criar Novo Projeto no Supabase

1. Acessar [supabase.com](https://supabase.com)
2. Criar novo projeto
3. Anotar:
   - Project URL
   - Anon Key
   - Service Role Key

### Passo 3: Configurar Variáveis de Ambiente

Criar arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### Passo 4: Executar Migrations

**Na ordem:**

1. `1º_Migration_habilitar_realtime_todas_tabelas.sql`
2. `2º_Migration_create_doctor_schedules.sql`
3. `3º_Migration_create_doctor_user_function.sql`
4. `4º_Migration_create_profile_calendars.sql`
5. `5º_Migration_add_profile_fields.sql`
6. **`6º_Migration_create_patient_tables.sql` ← NOVO**

**Como executar:**

Via SQL Editor no Supabase Dashboard:
1. Acesse o projeto no Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo de cada migration
4. Execute em ordem

Ou via CLI do Supabase:
```bash
supabase db push
```

### Passo 5: Executar Seeds

1. **`1º_Seed_example_doctor_schedules.sql`** (opcional - apenas exemplo)
2. **`2º_Seed_create_storage_bucket.sql` ← NOVO**

**Importante:** O seed 2 cria o bucket `medical-files` e suas políticas de acesso.

### Passo 6: Verificar Configurações

1. **Realtime habilitado** em todas as tabelas
2. **RLS (Row Level Security)** ativo
3. **Bucket medical-files** criado
4. **Políticas de Storage** ativas

### Passo 7: Criar Primeiro Usuário (Owner)

```sql
-- Via SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@clinica.com', crypt('senha-temporaria', gen_salt('bf')), NOW());

-- Pegar o ID do usuário criado e inserir profile
INSERT INTO profiles (auth_user_id, name, role, email)
VALUES ('<user-id>', 'Administrador', 'owner', 'admin@clinica.com');
```

### Passo 8: Iniciar Aplicação

```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 💾 Backup e Recuperação

### Backup do Banco de Dados

**Via Supabase Dashboard:**
1. Acesse **Database** → **Backups**
2. Supabase faz backups automáticos diários
3. Para backup manual: **Create Backup**

**Via pg_dump (mais controle):**
```bash
pg_dump -h db.xxx.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup-medx-$(date +%Y%m%d).dump
```

### Backup do Storage

**Opção 1: Via Supabase CLI**
```bash
supabase storage download \
  --bucket medical-files \
  --path . \
  --output ./backups/medical-files
```

**Opção 2: Programático (Node.js)**
```javascript
import { supabase } from './lib/supabaseClient';

async function backupStorage() {
  const { data: files } = await supabase.storage
    .from('medical-files')
    .list();

  for (const file of files) {
    const { data } = await supabase.storage
      .from('medical-files')
      .download(file.name);
    
    // Salvar localmente
    fs.writeFileSync(`./backup/${file.name}`, data);
  }
}
```

### Recuperação

**Restaurar Banco:**
```bash
pg_restore -h db.xxx.supabase.co \
  -U postgres \
  -d postgres \
  -c \
  backup-medx-20251005.dump
```

**Restaurar Storage:**
```bash
supabase storage upload \
  --bucket medical-files \
  --path ./backups/medical-files
```

### Estratégia de Backup Recomendada

1. **Diário:** Backup automático do banco (Supabase)
2. **Semanal:** Backup manual do Storage (script)
3. **Mensal:** Backup completo local (banco + storage)
4. **Antes de atualizações:** Snapshot completo

---

## 🔧 Manutenção e Suporte

### Logs e Monitoramento

**Tabelas a monitorar:**
- `patients` - Crescimento de cadastros
- `medical_records` - Volume de atendimentos
- `medical_attachments` - Uso de storage

**Queries úteis:**

```sql
-- Total de pacientes
SELECT COUNT(*) FROM patients;

-- Pacientes cadastrados por mês
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as total
FROM patients
GROUP BY mes
ORDER BY mes DESC;

-- Uso de storage por paciente
SELECT 
  p.name,
  COUNT(ma.id) as total_arquivos,
  SUM(ma.file_size_bytes) / 1024 / 1024 as mb_usados
FROM patients p
LEFT JOIN medical_attachments ma ON ma.patient_id = p.id
GROUP BY p.id, p.name
ORDER BY mb_usados DESC
LIMIT 10;

-- Pacientes sem médico responsável
SELECT p.*
FROM patients p
LEFT JOIN patient_doctors pd ON pd.patient_id = p.id
WHERE pd.id IS NULL;
```

### Limpeza de Dados

**Arquivos órfãos** (sem referência no banco):
```sql
-- Identificar attachments sem arquivo
SELECT * FROM medical_attachments
WHERE file_path NOT IN (
  SELECT path FROM storage.objects WHERE bucket_id = 'medical-files'
);
```

**Pacientes inativos** (sem atendimento há mais de 2 anos):
```sql
SELECT p.*, MAX(mr.appointment_date) as ultima_consulta
FROM patients p
LEFT JOIN medical_records mr ON mr.patient_id = p.id
GROUP BY p.id
HAVING MAX(mr.appointment_date) < NOW() - INTERVAL '2 years'
  OR MAX(mr.appointment_date) IS NULL;
```

### Performance

**Índices importantes:**
- Sempre indexar FKs
- Indexar campos de busca (name, email, cpf)
- Indexar datas (appointment_date, created_at)

**Vacuuming** (Supabase gerencia automaticamente)

### Troubleshooting

**Problema:** Upload de arquivo falha
- Verificar limite de 50MB
- Verificar tipo de arquivo permitido
- Verificar políticas RLS do bucket

**Problema:** Paciente não aparece na busca
- Verificar RLS policies
- Verificar se usuário está autenticado
- Verificar role do usuário

**Problema:** Timeline vazia
- Verificar se há dados nas tabelas relacionadas
- Verificar permissões de SELECT nas tabelas

---

## 📞 Contato e Suporte

Para dúvidas ou problemas:
- **Email:** suporte@medx.com.br
- **Documentação:** [docs.medx.com.br](https://docs.medx.com.br)

---

**© 2025 MedX - Sistema de Gestão Clínica**
