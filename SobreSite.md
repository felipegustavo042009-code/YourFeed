# Sistema de Gestão de Reservas de Salas

## 📋 Documentação Técnica do Sistema

### 1. Visão Geral

Sistema completo de gerenciamento de reservas de salas e espaços, desenvolvido com **React 18.3.1** no *frontend* e **Node.js/Express** no *backend*. A aplicação permite o gerenciamento de salas, reservas e usuários com diferentes níveis de permissão.

### 2. Arquitetura do Sistema

#### 2.1 Frontend (React)

A estrutura do *frontend* é organizada da seguinte forma:

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas principais da aplicação
│   ├── Home.jsx        # Página inicial
│   ├── Login.jsx       # Sistema de autenticação
│   ├── Salas.jsx       # Gerenciamento de salas
│   ├── Reservar.jsx    # Sistema de reservas e calendário
│   └── Usuario.jsx     # Perfil e gestão de usuários
├── variaveisGlobais.js # Contexto de estado global (Context API)
└── utils/              # Utilitários diversos
```

#### 2.2 Backend (Node.js/Express)

A estrutura do *backend* é organizada da seguinte forma:

```
server.js              # Servidor principal
├── Middlewares        # Configurações (CORS, upload de imagens)
├── Models             # Schemas MongoDB (Mongoose)
├── Routes             # Endpoints da API
└── Controllers        # Lógica de negócio
```

### 3. Tecnologias Utilizadas

| Categoria | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | React 18.3.1 | Biblioteca para construção de interfaces de usuário. |
| | TailwindCSS 3.4.17 | Framework CSS utilitário para estilização. |
| | Context API | Gerenciamento de estado global da aplicação. |
| | JavaScript ES6+ | Linguagem principal de desenvolvimento. |
| **Backend** | Node.js | Ambiente de execução JavaScript no servidor. |
| | Express.js | Framework web para o backend. |
| | MongoDB + Mongoose | Banco de dados NoSQL e modelagem de dados. |
| | Argon2 | Algoritmo para *hash* seguro de senhas. |
| | Nodemailer | Serviço para envio de emails. |
| | Multer | Middleware para manipulação de *upload* de arquivos. |

### 4. Funcionalidades Principais

#### 4.1 Autenticação e Autorização

*   Sistema de *login* por email e senha.
*   Registro de usuário com verificação por código (6 dígitos) enviado por email.
*   Tipos de usuários: **Administrador**, **Funcionário** e **Usuário** (com diferentes níveis de permissão).
*   Utilização de *Tokens* de autenticação com expiração.

#### 4.2 Gestão de Salas

*   **CRUD** (Criação, Leitura, Atualização e Exclusão) completo de salas/espaços.
*   Categorias de salas: **Sala**, **Esporte** e **Palestra**.
*   Funcionalidade de *upload* de imagens para cada sala.
*   Capacidade máxima de pessoas configurável.
*   Interface visual responsiva para exibição das salas.

#### 4.3 Sistema de Reservas

*   Calendário interativo com visualização de 12 meses futuros e 3 meses passados.
*   Verificação de disponibilidade em tempo real.
*   Funcionalidade de busca por data, nome do evento ou nome da sala.
*   Validação automática da capacidade máxima da sala.
*   Prevenção de conflitos de horários (duas reservas para a mesma sala no mesmo período).

#### 4.4 Gestão de Usuários

*   Perfil personalizado com avatar gerado automaticamente.
*   Edição de dados pessoais pelo próprio usuário.
*   Administradores podem gerenciar e alterar os tipos de usuários.
*   Sistema de permissões baseado no tipo de usuário.

### 5. Endpoints da API

#### 5.1 Autenticação

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/enviar-token` | Envia código de verificação para o email. |
| `POST` | `/LoginUsuario` | Realiza o *login* com email e senha. |
| `POST` | `/RegisterUsuarios-validarToken` | Finaliza o registro de usuário com o token de verificação. |

#### 5.2 Usuários

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/ListenUsuarios` | Lista todos os usuários (acesso restrito a administradores). |
| `PATCH` | `/AtualizarUsuariosTipo` | Altera o tipo de usuário. |
| `PATCH` | `/AtualizarUsuariosDados` | Atualiza os dados pessoais do usuário. |
| `DELETE` | `/DeleteUsuarios` | Remove um usuário. |

#### 5.3 Salas

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/ListarSala` | Lista todas as salas disponíveis. |
| `POST` | `/CriarSala` | Cria uma nova sala (inclui *upload* de imagem). |
| `PATCH` | `/AtualizarSala` | Atualiza os dados de uma sala existente. |
| `DELETE` | `/DeletarSala` | Remove uma sala. |

#### 5.4 Reservas

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/ListarReserva` | Lista todas as reservas. |
| `POST` | `/CriarReserva` | Cria uma nova reserva. |
| `PATCH` | `/AtualizarReserva` | Atualiza os dados de uma reserva. |
| `DELETE` | `/DeletarReserva` | Remove uma reserva. |

### 6. Estrutura de Dados (Modelos)

#### 6.1 Usuário

```javascript
{
  id: String,                     // Identificador único
  Nome: String,                   // Nome completo
  Email: String,                  // Email único
  Senha: String,                  // Hash da senha (Argon2)
  Tipo: ['adm', 'funcionario', 'usuario'], // Nível de permissão
  EmailVerificado: Boolean        // Status de verificação do email
}
```

#### 6.2 Sala

```javascript
{
  id: String,                     // Identificador único
  Nome: String,                   // Nome da sala
  Sobre: String,                  // Descrição da sala
  Categoria: ['esporte', 'palestra', 'sala'], // Categoria da sala
  Imagem: String,                 // Caminho/URL da imagem
  QuantidadeMaxima: Number        // Capacidade máxima de pessoas
}
```

#### 6.3 Reserva

```javascript
{
  id: String,                     // Identificador único
  OcupacaoId: String,             // ID da sala reservada
  Data: Date,                     // Data e hora da reserva
  NomeEvento: String,             // Nome do evento/reserva
  Quantidade: Number,             // Número de pessoas na reserva
  UsuarioId: String               // ID do usuário que fez a reserva
}
```

#### 6.4 Token (Verificação)

```javascript
{
  email: String,                  // Email do usuário
  TokenEnviado: String,           // Código de 6 dígitos enviado
  TokenExpira: Date               // Data e hora de expiração (10 minutos)
}
```

### 7. Fluxos Principais

#### 7.1 Fluxo de Registro

1.  Usuário preenche nome, email e senha.
2.  Sistema valida os dados e envia um código de verificação por email.
3.  Usuário insere o código de verificação recebido.
4.  A conta é criada com o tipo **"usuario"** padrão.

#### 7.2 Fluxo de Reserva

1.  Usuário seleciona a data e hora desejadas.
2.  O sistema exibe as salas disponíveis no período.
3.  Usuário escolhe a sala e informa a quantidade de pessoas.
4.  O sistema valida a disponibilidade e a capacidade máxima da sala.
5.  A reserva é confirmada.

#### 7.3 Fluxo Administrativo

1.  O Administrador cria, edita e deleta salas, incluindo o *upload* de imagens.
2.  O Administrador visualiza todas as reservas do sistema.
3.  O Administrador gerencia e altera os tipos de usuários.
4.  O Administrador pode deletar contas de usuários.

### 8. Segurança

#### 8.1 Medidas Implementadas

*   **Hash de senhas** utilizando o algoritmo Argon2.
*   Validação de email por domínio (ex: `gmail.com`, `outlook.com`).
*   Tokens de verificação com expiração de 10 minutos.
*   Validação de dados tanto no *frontend* quanto no *backend*.
*   Controle de permissões baseado no tipo de usuário.
*   *Upload* seguro de imagens (validação de formato e tamanho).

#### 8.2 Regras de Validação

*   **Senha**: 6 a 50 caracteres, contendo no mínimo 1 letra maiúscula, 1 minúscula e 1 número.
*   **Email**: Formato válido e domínio permitido.
*   **Nome**: 2 a 60 caracteres, permitindo apenas letras e espaços.
*   **Capacidade**: Número inteiro positivo maior que zero.

### 9. Interface do Usuário

#### 9.1 Design System

*   **Cores Principais**:
    *   Marrom (`#5C4033`): Títulos e elementos principais.
    *   Amarelo (`#F4D35E`): Botões e ações primárias.
    *   Amarelo Suave (`#F6E7A1`): Fundos e efeitos de *hover*.
    *   Cinza (`#6B7280`): Textos secundários.
*   **Componentes**:
    *   *Cards* responsivos com efeitos de *hover*.
    *   Modais com design consistente.
    *   Formulários com validação visual em tempo real.
    *   Calendário interativo.

#### 9.2 Responsividade

*   Design **Mobile First**.
*   Layout adaptativo para todos os dispositivos (*smartphones*, *tablets* e *desktops*).
*   Utilização de *Grid* flexível para exibição dos *cards* de salas.
*   Menus de navegação otimizados para dispositivos móveis.

### 10. Configuração do Ambiente

#### 10.1 Variáveis de Ambiente

As seguintes variáveis devem ser configuradas:

```bash
# Backend (.env)
EMAIL=seu-email@gmail.com
EMAIL_SENHA=sua-senha-app
MONGO_URI=mongodb+srv://...
PORT=5000

# Frontend
REACT_APP_API_URL=http://localhost:5000
```

#### 10.2 Banco de Dados

*   Utilização do **MongoDB Atlas** (serviço de nuvem).
*   Modelagem de dados com **Mongoose Schemas**.
*   Criação de índices para otimização de performance.

### 11. Regras de Negócio

#### 11.1 Reservas

*   Somente usuários dos tipos **Administrador** e **Funcionário** podem criar reservas.
*   Usuários comuns (*"usuario"*) podem apenas visualizar as reservas.
*   Não é permitido haver duas reservas para a mesma sala no mesmo período.
*   A quantidade de pessoas na reserva não pode exceder a capacidade máxima da sala.
*   Reservas podem ser editadas apenas pelo usuário que as criou.

#### 11.2 Salas

*   Apenas usuários do tipo **Administrador** podem criar, editar ou deletar salas.
*   A categoria da sala não pode ser alterada após a criação.
*   O *upload* de imagens é opcional, mas recomendado.
*   A capacidade máxima deve ser um número positivo.

#### 11.3 Usuários

*   Administradores podem alterar os tipos de usuários.
*   Um usuário não pode deletar a sua própria conta.
*   O email deve ser único em todo o sistema.
*   O tipo padrão para novos registros é **"usuario"**.

### 12. Tratamento de Erros

#### 12.1 Frontend

*   Utilização de notificações *toast* para fornecer *feedback* ao usuário.
*   Exibição de estados de *loading* durante as requisições à API.
*   Validação de formulários em tempo real.
*   Mensagens de erro amigáveis e claras para o usuário.

#### 12.2 Backend

*   Retorno de **Códigos HTTP** apropriados para cada tipo de resposta (ex: 200, 400, 401, 500).
*   Mensagens de erro descritivas para facilitar a depuração.
*   Implementação de *logging* de erros no console.
*   Mecanismos de *Rollback* em operações críticas que falham.

### 13. Informações do Projeto

*   **Versão do Sistema**: 1.0.0
*   **Última Atualização**: Outubro 2024
*   **Estilo**: Projeto Educacional
*   **Status**: Desenvolvimento Ativo

## 🔑 Usuário Padrão de Teste (Administrador)

Para fins de teste e acesso administrativo ao sistema, utilize as seguintes credenciais:

| Campo | Valor |
| :--- | :--- |
| **Nome** | Adm |
| **Email** | adm@gmail.com |
| **Senha** | Adm123 |
| **Tipo** | Administrador |
