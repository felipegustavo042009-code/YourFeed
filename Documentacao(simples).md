# Documentação Técnica: Sistema de Gestão de Reservas de Salas

### 1. Sistema de Reservas Interativo e Validado

O sistema oferece um **Calendário Interativo** que permite a visualização de disponibilidade em tempo real. Garante a integridade das reservas através de:
*   **Prevenção de Conflitos de Horários**: Não permite duas reservas para a mesma sala no mesmo período.
*   **Validação de Capacidade**: Impede que o número de pessoas exceda a capacidade máxima configurada para a sala.
*   **Regra de Negócio**: Somente usuários dos tipos **Administrador** e **Funcionário** podem criar reservas.

### 2. Arquitetura e Tecnologias Utilizadas

O sistema adota uma arquitetura **Full-Stack** moderna, utilizando as seguintes tecnologias:

#### Arquitetura

| Componente | Tecnologia Principal | Estrutura |
| :--- | :--- | :--- |
| **Frontend** | React 18.3.1 | Componentes reutilizáveis, páginas (Home, Login, Salas, Reservar, Usuario), Context API para estado global. |
| **Backend** | Node.js/Express | Servidor principal, Middlewares (CORS, upload), Models (MongoDB/Mongoose), Routes e Controllers. |

#### Tecnologias Chave

| Categoria | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **Frontend** | React 18.3.1 | Construção de interfaces de usuário. |
| | TailwindCSS 3.4.17 | Framework CSS utilitário. |
| **Backend** | Node.js/Express | Ambiente de execução e framework web. |
| | MongoDB + Mongoose | Banco de dados NoSQL e modelagem de dados. |
| **Segurança** | Argon2 | Algoritmo para *hash* seguro de senhas. |
| | Nodemailer | Serviço para envio de emails (para verificação de registro). |

### 3. Gestão Completa de Salas e Usuários com Permissões

O sistema centraliza o gerenciamento de recursos e acessos:
*   **Gestão de Salas**: Oferece **CRUD** completo de salas/espaços, com categorização (Sala, Esporte, Palestra) e funcionalidade de *upload* de imagens.
*   **Gestão de Usuários**: Possui três níveis de permissão (**Administrador**, **Funcionário**, **Usuário**) e um fluxo de registro seguro com verificação por código.

---

## 🔑 Usuário Padrão de Teste (Administrador)

Para fins de teste e acesso administrativo ao sistema, utilize as seguintes credenciais:

| Campo | Valor |
| :--- | :--- |
| **Nome** | Adm |
| **Email** | adm@gmail.com |
| **Senha** | Adm123 |
| **Tipo** | Administrador |
