# 💻 Sistema de Gerenciamento de Locação de Espaços

## Desafio de Programação Jovem Tech

Este projeto foi desenvolvido como parte do **Desafio de Programação** do curso Jovem Tech, com o objetivo de criar um **Sistema de Gerenciamento de Locação de Espaços** (salas, laboratórios, coworking, etc.), inspirado em ambientes de inovação como o CajuHub.

O sistema é uma solução **Full-Stack** completa para a gestão de recursos e reservas, implementando regras de negócio complexas e um fluxo de autenticação seguro.

---

## ✨ Funcionalidades Principais

O sistema foi desenhado para oferecer uma gestão robusta e intuitiva, com as seguintes funcionalidades centrais:

### 1. Sistema de Reservas Inteligente
*   **Calendário Interativo:** Visualização de disponibilidade em tempo real.
*   **Prevenção de Conflitos:** Bloqueio automático de reservas para a mesma sala no mesmo período.
*   **Validação de Capacidade:** Impede reservas que excedam a capacidade máxima configurada para o espaço.
*   **Busca Avançada:** Filtros por data, nome do evento e nome da sala.

### 2. Gestão Completa de Espaços (CRUD)
*   **Cadastro de Salas:** Criação, leitura, atualização e exclusão (CRUD) de espaços.
*   **Categorização:** Classificação dos espaços em categorias como **Sala**, **Esporte** e **Palestra**.
*   **Upload de Imagens:** Funcionalidade para anexar imagens a cada espaço.

### 3. Autenticação e Autorização Segura
*   **Níveis de Permissão:** Três perfis de usuário: **Administrador**, **Funcionário** e **Usuário**.
*   **Registro Verificado:** Fluxo de cadastro seguro com verificação de email por código (Nodemailer).
*   **Segurança:** Utilização do algoritmo **Argon2** para *hash* seguro de senhas.

### 4. Gestão de Usuários
*   **Perfil Personalizado:** Edição de dados pessoais e avatar automático.
*   **Controle de Acesso:** Administradores podem gerenciar e alterar os tipos de permissão dos usuários.

---

## 🛠️ Pilha de Tecnologia (Tech Stack)

O projeto adota uma arquitetura moderna e escalável, utilizando as seguintes tecnologias:

| Categoria | Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- | :--- |
| **Frontend** | **React** | 18.3.1 | Construção da Interface de Usuário (UI). |
| | **TailwindCSS** | 3.4.17 | Framework CSS utilitário para estilização e responsividade (*Mobile First*). |
| | **Context API** | - | Gerenciamento de estado global da aplicação. |
| **Backend** | **Node.js** | - | Ambiente de execução JavaScript no servidor. |
| | **Express.js** | 5.2.1 | Framework web para a construção da API RESTful. |
| **Banco de Dados** | **MongoDB** | - | Banco de dados NoSQL flexível. |
| | **Mongoose** | 9.0.1 | Modelagem de dados e interação com o MongoDB. |
| **Segurança** | **Argon2** | 0.44.0 | Algoritmo de *hashing* de senhas. |
| **Outros** | **Nodemailer** | 7.0.11 | Serviço para envio de emails de verificação. |
| | **Multer** | 2.0.2 | Middleware para manipulação de *upload* de arquivos. |

---

## 🔑 Credenciais de Teste (Administrador)

Para fins de avaliação e acesso a todas as funcionalidades administrativas (CRUD de Salas, Gestão de Usuários, etc.), utilize as seguintes credenciais:

| Campo | Valor |
| :--- | :--- |
| **Nome** | Adm |
| **Email** | `adm@gmail.com` |
| **Senha** | `Adm123` |
| **Tipo** | Administrador |

---

## 📄 Documentação Detalhada

Para mais detalhes sobre a arquitetura, modelos de dados (schemas) e todos os *endpoints* da API, consulte a documentação técnica completa do projeto.

*   [Documentação Técnica Completa (SobreSite.md)](./SobreSite.md)
*   [Documentação Simples (Documentacao(simples).md)](./Documentacao(simples).md)
