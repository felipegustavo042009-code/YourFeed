# Guia de Integração com Backend

Este documento explica como integrar o frontend React com o backend Express/MongoDB.

## 📍 Localização dos Dados Mockados

Todos os dados mockados estão no arquivo:
```
src/data/mockData.js
```

Este arquivo contém:
- `mockUsuarios` - Array de usuários
- `mockSalas` - Array de salas/ocupações
- `mockReservas` - Array de reservas

## 🔄 Passo a Passo para Integração

### 1. Instalar biblioteca HTTP (opcional)

```bash
pnpm install axios
```

### 2. Criar arquivo de configuração da API

Crie `src/api/config.js`:

```javascript
export const API_URL = 'http://localhost:4000';

export const api = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.mensagem || 'Erro na requisição');
  }
  
  return response.json();
};
```

### 3. Substituir operações em cada página

#### **Salas.jsx** - Listar e Criar Salas

**Antes (mockado):**
```javascript
const [salas, setSalas] = useState(mockSalas);
```

**Depois (integrado):**
```javascript
import { api } from '../api/config';

const [salas, setSalas] = useState([]);

useEffect(() => {
  const carregarSalas = async () => {
    try {
      const data = await api('/ListarOcupacoes');
      setSalas(data.ocupacoes);
    } catch (error) {
      showToast('Erro ao carregar salas', 'error');
    }
  };
  carregarSalas();
}, []);

const handleCriarSala = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append('nome', novaSala.nome);
    formData.append('sobre', novaSala.sobre);
    formData.append('categoria', novaSala.categoria);
    formData.append('quantidadeMaxima', novaSala.quantidadeMaxima);
    formData.append('idUsuario', usuario.id);
    
    const response = await fetch(`${API_URL}/CriarSala`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    setSalas([...salas, data.sala]);
    showToast('Sala criada com sucesso!', 'success');
  } catch (error) {
    showToast('Erro ao criar sala', 'error');
  }
};
```

#### **Reservar.jsx** - Listar e Criar Reservas

**Antes (mockado):**
```javascript
const [reservas, setReservas] = useState(mockReservas);
```

**Depois (integrado):**
```javascript
import { api } from '../api/config';

const [reservas, setReservas] = useState([]);

useEffect(() => {
  const carregarReservas = async () => {
    try {
      const data = await api(`/ListarReserva?idUsuario=${usuario.id}`);
      setReservas(data.reservas);
    } catch (error) {
      showToast('Erro ao carregar reservas', 'error');
    }
  };
  carregarReservas();
}, [usuario]);

const handleCriarReserva = async (e) => {
  e.preventDefault();
  try {
    const params = new URLSearchParams({
      idUsuario: usuario.id,
      idOcupacao: novaReserva.ocupacaoId,
      data: new Date(novaReserva.data).toISOString(),
      quantidade: novaReserva.quantidade,
      nome: novaReserva.nome,
      sobre: novaReserva.sobre
    });
    
    const data = await api(`/CriarReserva?${params}`, { method: 'POST' });
    setReservas([...reservas, data.reserva]);
    showToast('Reserva criada com sucesso!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const handleEditarReserva = async (e) => {
  e.preventDefault();
  try {
    const params = new URLSearchParams({
      idUsuario: usuario.id,
      idReserva: reservaSelecionada.id,
      quantidade: reservaSelecionada.quantidade,
      nome: reservaSelecionada.nome,
      sobre: reservaSelecionada.sobre
    });
    
    await api(`/AtualizarReserva?${params}`, { method: 'PATCH' });
    setReservas(reservas.map(r => 
      r.id === reservaSelecionada.id ? reservaSelecionada : r
    ));
    showToast('Reserva atualizada!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const handleDeletarReserva = async () => {
  try {
    const params = new URLSearchParams({
      idUsuario: usuario.id,
      idReserva: reservaSelecionada.id
    });
    
    await api(`/DeletarReserva?${params}`, { method: 'DELETE' });
    setReservas(reservas.filter(r => r.id !== reservaSelecionada.id));
    showToast('Reserva deletada!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
};
```

#### **Login.jsx** - Autenticação

**Antes (mockado):**
```javascript
const handleEnviarEmail = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  setTimeout(() => {
    const codigoGerado = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCodigoEnviado(codigoGerado);
    setEtapa('codigo');
    setLoading(false);
    showToast(`Código enviado: ${codigoGerado}`, 'success');
  }, 1500);
};
```

**Depois (integrado):**
```javascript
import { api } from '../api/config';

const handleEnviarEmail = async (e) => {
  e.preventDefault();
  setLoading(true);
  showToast('Enviando código...', 'info');
  
  try {
    await api(`/enviar-token?email=${email}`, { method: 'POST' });
    setEtapa('codigo');
    showToast('Código enviado para seu e-mail!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setLoading(false);
  }
};

const handleValidarCodigo = async (e) => {
  e.preventDefault();
  setLoading(true);
  showToast('Validando código...', 'info');
  
  try {
    const params = new URLSearchParams({
      Email: email,
      Senha: 'senha_padrao'
    });
    
    const data = await api(`/LoginUsuario?${params}`, { method: 'POST' });
    showToast('Login realizado com sucesso!', 'success');
    onLogin(data);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setLoading(false);
  }
};
```

#### **Usuario.jsx** - Gerenciar Usuários

**Antes (mockado):**
```javascript
const [usuarios, setUsuarios] = useState(mockUsuarios);
```

**Depois (integrado):**
```javascript
import { api } from '../api/config';

const [usuarios, setUsuarios] = useState([]);

useEffect(() => {
  if (isAdmin) {
    const carregarUsuarios = async () => {
      try {
        const data = await api(`/ListenUsuarios?idUsuario=${usuario.id}`);
        setUsuarios(data.usuarios);
      } catch (error) {
        showToast('Erro ao carregar usuários', 'error');
      }
    };
    carregarUsuarios();
  }
}, [usuario, isAdmin]);

const handleAlterarTipo = async (idUsuario, novoTipo) => {
  try {
    const params = new URLSearchParams({
      idUsuario: idUsuario,
      tipoNovo: novoTipo
    });
    
    await api(`/AtualizarUsuarios?${params}`, { method: 'PATCH' });
    setUsuarios(usuarios.map(u => 
      u.id === idUsuario ? { ...u, tipo: novoTipo } : u
    ));
    showToast('Tipo de usuário alterado!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
};
```

## 🔐 Persistência de Autenticação

Adicione no `App.jsx` para manter usuário logado:

```javascript
import { useState, useEffect } from 'react';

function App() {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('usuario');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('usuario');
    }
  }, [usuario]);

  // resto do código...
}
```

## 🌐 CORS no Backend

Certifique-se de que o backend permite requisições do frontend:

```javascript
// No server.js
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // URL do frontend
  credentials: true
}));
```

## 🧪 Testando a Integração

1. Inicie o backend: `node server.js` (porta 4000)
2. Inicie o frontend: `pnpm dev` (porta 5173)
3. Teste cada funcionalidade:
   - Login com e-mail
   - Visualização de salas
   - Criação de reservas
   - Gestão de usuários (admin)

## 📝 Checklist de Integração

- [ ] Criar arquivo `src/api/config.js`
- [ ] Substituir imports de `mockData` por chamadas de API
- [ ] Adicionar `useEffect` para carregar dados iniciais
- [ ] Implementar tratamento de erros
- [ ] Adicionar loading states
- [ ] Configurar CORS no backend
- [ ] Implementar persistência de autenticação
- [ ] Testar todas as funcionalidades
- [ ] Ajustar formatação de datas
- [ ] Validar permissões de usuário

## 🐛 Problemas Comuns

### Erro de CORS
**Solução**: Adicionar configuração CORS no backend

### Dados não carregam
**Solução**: Verificar se backend está rodando e URL está correta

### Token expirado
**Solução**: Implementar refresh token ou re-login automático

### Upload de imagem não funciona
**Solução**: Usar FormData e não JSON para upload de arquivos
