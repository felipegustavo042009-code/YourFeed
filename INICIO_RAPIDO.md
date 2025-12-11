# 🚀 Início Rápido - Create React App

## Instalação e Execução

```bash
# 1. Navegar até o projeto
cd sistema-reservas

# 2. Instalar dependências
npm install

# 3. Iniciar servidor de desenvolvimento
npm start

# O navegador abrirá automaticamente em http://localhost:3000
```

## 📱 Testando o Sistema

### 1. Página Inicial
- Clique em **"Entrar"** para fazer login
- Clique em **"Ver Salas sem Login"** para visualizar salas (modo visitante)

### 2. Login
Use um dos e-mails de teste:
- `admin@exemplo.com` - Administrador
- `joao@exemplo.com` - Funcionário
- `maria@exemplo.com` - Usuário comum

**Importante**: O código de verificação aparece no toast após inserir o e-mail!

## 🔧 Comandos Disponíveis

```bash
npm start      # Inicia desenvolvimento (porta 3000)
npm run build  # Build para produção
npm test       # Executa testes
```

## 📝 Estrutura

```
src/
├── components/    # Navbar, Toast
├── pages/         # Home, Login, Salas, Reservar, Usuario
├── data/          # mockData.js (SUBSTITUA pela API)
├── utils/         # avatar.js
└── App.js         # Componente principal
```

## 💡 Dicas Rápidas

- Código de login aparece no **toast** (canto superior direito)
- Funcionários e admins podem criar reservas
- Apenas admins podem criar salas
- Calendário navega 12 meses futuros e 3 anteriores

## 📖 Documentação Completa

- `README.md` - Documentação técnica
- `INTEGRACAO.md` - Como integrar com backend
