# 🏥 MedX 2.0 - Healthcare CRM & AI Orchestration Suite

Uma plataforma corporativa completa para gestão de clínicas e consultórios médicos. O MedX 2.0 centraliza CRM, teleconsultas nativas, mensageria omnichannel (WhatsApp) e Inteligência Artificial (LLMs) em um único ecossistema seguro e escalável. 

O sistema foi arquitetado para reduzir a carga operacional de secretárias e potencializar a decisão clínica dos médicos através de agentes autônomos.

## 🎥 Demonstração Prática (Video Demo)
A teoria da orquestração é complexa, mas o uso é simples. Assista ao vídeo de demonstração onde ilustramos a integração do WhatsApp, a atualização do Dashboard em tempo real e a Inteligência Artificial operando o prontuário:

👉 **[Assistir ao Vídeo de Demonstração do MedX 2.0](https://drive.google.com/file/d/11y7Prq2dOGacBoZNM21hU4B9ZLbkeG9a/view?usp=sharing)**

*(Nota: O vídeo ilustra a interface de gestão, a captura de leads via mensageria e o preenchimento autônomo abordados nesta documentação).*
## 🚧 Status do Projeto & Documentação (MVP)
Este repositório reflete o **MVP (Produto Mínimo Viável)** da plataforma. O *core* de agendamento, orquestração de IA e teleconsultas está funcional, porém o código passa por ajustes contínuos, refatoração e otimização de performance.
*   **Cultura de Documentação:** Navegando pelo repositório, você encontrará diversos arquivos `.md` espalhados pelas pastas. Eles contêm a documentação técnica detalhada, fluxos lógicos e passos de implementação de cada módulo, garantindo que qualquer desenvolvedor consiga entender a arquitetura e escalar o produto.

## 🚀 Arquitetura "Megazord" (AI-Augmented Development)
Este projeto é um *case* real de desenvolvimento de software hiper-acelerado. Ele foi construído orquestrando uma *stack* fragmentada de Inteligências Artificiais e plataformas *Low-Code* para entregar um produto complexo em tempo recorde:
*   **Lovable:** Geração rápida dos componentes visuais (React/Shadcn UI) e prototipagem do Front-end.
*   **Cursor IDE:** Atuação como engenheiro de software pareado (AI Pair Programming) para refatorar a base de código, ajustar tipagens no TypeScript, criar rotas de integração e iterar sobre o MVP.
*   **n8n:** O verdadeiro "motor" da aplicação, rodando em background para processar webhooks, rotear mensagens de WhatsApp e orquestrar a lógica pesada.

## 🛠️ Core Tech Stack & Infraestrutura
*   **Gestão de Dados e Autenticação:** Supabase (PostgreSQL) com políticas estritas de *Row Level Security* (RLS), garantindo que médicos e secretárias acessem apenas os dados permitidos por seus papéis (Role-Based Access Control).
*   **Mensageria Omnichannel:** Integração direta com WhatsApp (via APIs dedicadas) para processamento de texto, áudio e documentos em tempo real.
*   **Motores de Inteligência Artificial:** Integração nativa com **Google Gemini** e ferramentas de transcrição (Speech-to-Text) para processamento de linguagem natural e visão computacional (leitura de exames).

## ⚙️ Módulos Principais do Sistema

### 🎥 Teleconsulta e Prontuário Autônomo
*   Ambiente de videoconferência nativo com envio automatizado de links de acesso via WhatsApp.
*   **Transcrição em Tempo Real (STT):** O áudio da consulta é transcrito enquanto acontece.
*   **Geração de Prontuário via IA:** Ao encerrar a chamada, a LLM analisa a transcrição e gera um resumo clínico estruturado (anamnese, queixas, observações) que é salvo automaticamente no histórico (Timeline) do paciente.

### 🤖 Assistentes Médicos de IA (Clinical Co-Pilots)
*   **Análise de Exames:** Visão computacional para leitura de exames laboratoriais (PDF/Imagens), extraindo métricas e gerando alertas.
*   **Cálculo Posológico e CIDs:** Agentes treinados para sugerir diagnósticos (CID) baseados em sintomas e calcular dosagens medicamentosas complexas.
*   *Nota de Engenharia: A IA atua estritamente como suporte à decisão clínica (Co-Pilot), possuindo disclaimers de isenção de responsabilidade e exigindo validação humana final.*

### 💬 Automação de Atendimento e Triagem
*   **Pré-Pacientes vs. Pacientes:** Pipeline de conversão inteligente. O sistema distingue *leads* de pacientes já agendados, alterando o comportamento do agente de IA.
*   **Gestão de Agendamento e Convênios:** Agentes capazes de ler agendas complexas (com pausas e turnos), cruzar com mais de 11 operadoras/47 planos de saúde aceitos pela clínica e marcar a consulta via WhatsApp.
*   **Sistema de Follow-up:** Agendamento de retornos automatizados (7, 15, 30 dias) orquestrados pelo n8n.

## 🔒 Segurança e Conformidade (Security by Design)
Lidar com dados de saúde exige governança absoluta. Toda a arquitetura foi construída com foco em resiliência e privacidade:
*   Autenticação JWT via Supabase.
*   Tratamento de transbordo (Hand-off): A IA pausa automaticamente quando um humano assume o atendimento, mantendo o contexto salvo no PostgreSQL para auditoria.
*   Isolamento de *Tenants*: O banco de dados impede o cruzamento acidental de prontuários, mantendo a integridade exigida por regulamentações de proteção de dados (LGPD).

## 🔐 Acesso aos Fluxos de Orquestração (n8n)
O código aberto neste repositório contempla o Front-end (MVP) e as documentações/migrações SQL do Supabase. Por diretrizes de **Segurança da Informação (Security by Design)** e proteção de chaves de API/Webhooks do ambiente de produção, os arquivos JSON de orquestração do n8n são mantidos em repositório privado.

Quer entender a fundo como essa arquitetura foi desenhada ou discutir a implementação da orquestração de IA na prática? **Vamos conversar:**

[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/555399364186)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gabriel-freitas-elumina/)

---

> _"O futuro da saúde digital não está em substituir o médico, mas em eliminar o atrito operacional e o trabalho repetitivo. O MedX 2.0 é a aplicação prática da Inteligência Artificial como uma extensão da capacidade de atendimento humano."_
