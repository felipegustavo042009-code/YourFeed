export const mockUsuarios = [
  {
    id: '1',
    nome: 'Admin Silva',
    email: 'admin@exemplo.com',
    tipo: 'adm'
  },
  {
    id: '2',
    nome: 'João Funcionário',
    email: 'joao@exemplo.com',
    tipo: 'funcionario'
  },
  {
    id: '3',
    nome: 'Maria Usuária',
    email: 'maria@exemplo.com',
    tipo: 'usuario'
  }
];

export const mockSalas = [
  {
    id: '1',
    nome: 'Sala de Reuniões A',
    sobre: 'Sala equipada com projetor e ar condicionado',
    categoria: 'sala',
    imagem: '',
    quantidadeMaxima: 20
  },
  {
    id: '2',
    nome: 'Quadra de Futebol',
    sobre: 'Quadra coberta com iluminação',
    categoria: 'esporte',
    imagem: '',
    quantidadeMaxima: 22
  },
  {
    id: '3',
    nome: 'Auditório Principal',
    sobre: 'Auditório com capacidade para palestras e eventos',
    categoria: 'palestra',
    imagem: '',
    quantidadeMaxima: 100
  },
  {
    id: '4',
    nome: 'Sala de Reuniões B',
    sobre: 'Sala menor para reuniões executivas',
    categoria: 'sala',
    imagem: '',
    quantidadeMaxima: 10
  }
];

export const mockReservas = [
  {
    id: '1',
    ocupacaoId: '1',
    data: new Date('2025-12-15T10:00:00'),
    quantidade: 15,
    usuarioId: '2',
    nome: 'Reunião de Planejamento',
    sobre: 'Reunião trimestral de planejamento estratégico'
  },
  {
    id: '2',
    ocupacaoId: '2',
    data: new Date('2025-12-16T14:00:00'),
    quantidade: 20,
    usuarioId: '2',
    nome: 'Torneio Interno',
    sobre: 'Campeonato interno de futebol'
  },
  {
    id: '3',
    ocupacaoId: '3',
    data: new Date('2025-12-20T09:00:00'),
    quantidade: 80,
    usuarioId: '1',
    nome: 'Palestra de Inovação',
    sobre: 'Palestra sobre tendências tecnológicas 2026'
  },
  {
    id: '4',
    ocupacaoId: '1',
    data: new Date('2025-12-18T15:00:00'),
    quantidade: 10,
    usuarioId: '2',
    nome: 'Reunião de Equipe',
    sobre: 'Reunião semanal da equipe de desenvolvimento'
  },
  {
    id: '5',
    ocupacaoId: '4',
    data: new Date('2025-11-28T11:00:00'),
    quantidade: 8,
    usuarioId: '1',
    nome: 'Reunião Executiva',
    sobre: 'Reunião da diretoria'
  }
];
