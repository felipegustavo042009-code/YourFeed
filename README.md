# Sistema de Reservas - Frontend React

Frontend completo em React para sistema de gerenciamento de reservas de salas e espaços.

## 🚀 Tecnologias

- **React 18.3.1** - Biblioteca JavaScript para construção de interfaces
- **Create React App** - Ferramenta oficial para criar aplicações React
- **TailwindCSS 3.4.17** - Framework CSS utilitário
- **JavaScript (ES6+)** - Linguagem de programação

## 📋 Funcionalidades

### Autenticação
- **Home**: Página inicial com design próprio e botões "Entrar" e "Ver Salas sem Login"
- **Login**: Sistema de autenticação por e-mail com código de verificação
  - Usuário insere e-mail
  - Recebe código (simulado no frontend)
  - Confirma código para autenticar
  - Toast notifications durante carregamentos

### Gestão de Salas
- **Visualização**: Todos podem ver as salas disponíveis
- **Criação**: Apenas administradores podem criar novas salas
- **Categorias**: Sala, Esporte, Palestra
- **Informações**: Nome, descrição, categoria e capacidade máxima

### Sistema de Reservas
- **Calendário**: Navegação por 12 meses futuros e 3 meses anteriores
- **Busca**: Por data ou nome do evento
- **Criação**: Funcionários e administradores podem criar reservas
- **Edição/Exclusão**: Apenas o criador da reserva pode editar/deletar
- **Campos**: Nome do evento, sobre, sala, data/hora, quantidade de pessoas

### Gestão de Usuários
- **Avatar**: Gerado automaticamente com letra inicial e cor aleatória
- **Perfil**: Nome e e-mail editável
- **Administração**: Administradores podem ver todos os usuários e alterar tipos
- **Tipos de Usuário**:
  - `usuario`: Apenas visualização
  - `funcionario`: Pode criar reservas
  - `adm`: Controle total (criar salas, gerenciar usuários)

## 🎨 Design

- Interface totalmente responsiva
- Design moderno com gradientes e sombras
- Componentes reutilizáveis
- Sistema de cores consistente
- Animações suaves

## 📦 Estrutura do Projeto

```
src/
├── components/
│   ├── Navbar.jsx          # Barra de navegação
│   └── Toast.jsx           # Notificações toast
├── pages/
│   ├── Home.jsx            # Página inicial
│   ├── Login.jsx           # Página de login
│   ├── Salas.jsx           # Gestão de salas
│   ├── Reservar.jsx        # Calendário e reservas
│   └── Usuario.jsx         # Perfil e gestão de usuários
├── data/
│   └── mockData.js         # Dados mockados (substituir por API)
├── utils/
│   └── avatar.js           # Gerador de avatares
├── App.js                  # Componente principal
├── index.js                # Entry point
└── index.css               # Estilos globais (Tailwind)
```

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# Build para produção
npm run build

# Testar a aplicação
npm test
```

## 🔌 Integração com Backend

### Dados Mockados

Os dados estão em `src/data/mockData.js`:
- `mockUsuarios`: Lista de usuários
- `mockSalas`: Lista de salas/espaços
- `mockReservas`: Lista de reservas

### Endpoints do Backend

Para integrar com o backend, substitua as operações locais pelas chamadas de API:

#### Usuários
- `GET /ListenUsuarios?idUsuario={id}` - Listar todos (apenas admin)
- `POST /LoginUsuario?Email={email}&Senha={senha}` - Login
- `POST /RegisterUsuarios-validarToken` - Registrar com token
- `DELETE /DeleteUsuarios?idUsuario={id}` - Deletar usuário
- `PATCH /AtualizarUsuarios?idUsuario={id}&tipoNovo={tipo}` - Atualizar tipo

#### Token
- `POST /enviar-token?email={email}` - Enviar código de verificação

#### Salas (Ocupações)
- `GET /ListarOcupacoes` - Listar todas as salas
- `POST /CriarSala` - Criar sala (admin, com upload de imagem)
- `DELETE /DeletarSala?idUsuario={id}&idSala={id}` - Deletar sala
- `PATCH /AtualizarSala` - Atualizar sala

#### Reservas
- `GET /ListarReserva?idUsuario={id}` - Listar reservas
- `POST /CriarReserva` - Criar reserva (funcionário/admin)
- `DELETE /DeletarReserva?idUsuario={id}&idReserva={id}` - Deletar
- `PATCH /AtualizarReserva` - Atualizar reserva

### Exemplo de Integração

```javascript
// Exemplo: Listar salas
const listarSalas = async () => {
  try {
    const response = await fetch('http://localhost:4000/ListarOcupacoes');
    const data = await response.json();
    setSalas(data.ocupacoes);
  } catch (error) {
    showToast('Erro ao carregar salas', 'error');
  }
};

// Exemplo: Criar reserva
const criarReserva = async (reserva) => {
  try {
    const response = await fetch(
      `http://localhost:4000/CriarReserva?idUsuario=${usuario.id}&idOcupacao=${reserva.ocupacaoId}&data=${reserva.data}&quantidade=${reserva.quantidade}&nome=${reserva.nome}&sobre=${reserva.sobre}`,
      { method: 'POST' }
    );
    const data = await response.json();
    showToast('Reserva criada com sucesso!', 'success');
  } catch (error) {
    showToast('Erro ao criar reserva', 'error');
  }
};
```

## 👥 Usuários de Teste

- **Admin**: admin@exemplo.com (Tipo: adm)
- **Funcionário**: joao@exemplo.com (Tipo: funcionario)
- **Usuário**: maria@exemplo.com (Tipo: usuario)

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1920px+)
- Tablet (768px - 1919px)
- Mobile (320px - 767px)

## 🎯 Próximos Passos

1. Integrar com o backend real substituindo `mockData.js`
2. Implementar upload de imagens para salas
3. Adicionar persistência de autenticação (localStorage/sessionStorage)
4. Implementar paginação para listas grandes
5. Adicionar filtros avançados no calendário
6. Implementar notificações em tempo real

## 📄 Licença

Projeto desenvolvido para fins educacionais.
