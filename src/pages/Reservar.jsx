import { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../variaveisGlobais';

export default function Reservar({ showToast }) {
  // Estados principais
  const [reservas, setReservas] = useState([]);
  const [salas, setSalas] = useState([]);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalEdicao, setModalEdicao] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [visualizacao, setVisualizacao] = useState('suas');

  const [filtrarOpcao, setFiltrarOpcao] = useState('todos')
  const [ordenacaoData, setOrdenacaoData] = useState('dec');

  const [novaReserva, setNovaReserva] = useState({
    ocupacaoId: '',
    data: '',
    quantidade: 1,
    nomeEvento: ''
  });

  const [datasIndisponiveis, setDatasIndisponiveis] = useState([]);

  const { idLocal, tipoLocal } = useContext(GlobalContext);
  const podeReservar = tipoLocal === 'adm' || tipoLocal === 'funcionario' || tipoLocal === 'usuario';

  // Carregar dados iniciais ao montar componente
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Calcular datas indisponíveis quando salas ou reservas mudam
  useEffect(() => {
    if (salas.length > 0 && reservas.length > 0) {
      calcularDatasIndisponiveis();
    }
  }, [salas, reservas]);

  // Função para carregar salas e reservas
  const carregarDadosIniciais = async () => {
    try {
      setCarregando(true);

      const respostaSalas = await fetch('http://192.168.100.58:5000/ListarSala');
      if (!respostaSalas.ok) throw new Error('Erro ao carregar salas');
      const dadosSalas = await respostaSalas.json();
      setSalas(dadosSalas.salas || []);

      await carregarReservas();

    } catch (erro) {
      console.error('Erro:', erro);
      showToast('Erro ao carregar dados', 'error');
    } finally {
      setCarregando(false);
    }
  };

  // Carregar reservas do usuário
  const carregarReservas = async () => {
    try {
      const parametros = new URLSearchParams({
        idUsuario: idLocal
      });

      const resposta = await fetch(`http://192.168.100.58:5000/ListarReserva?${parametros}`);
      if (!resposta.ok) throw new Error('Erro ao carregar reservas');

      const dados = await resposta.json();
      setReservas(dados.reservas || []);
    } catch (erro) {
      console.error('Erro:', erro);
      showToast('Erro ao carregar reservas', 'error');
    }
  };

  // Calcular quais datas já têm reservas
  const calcularDatasIndisponiveis = () => {
    const datasOcupadas = new Set();

    reservas.forEach(reserva => {
      const dataReserva = new Date(reserva.data);
      const dataFormatada = dataReserva.toISOString().split('T')[0];
      datasOcupadas.add(dataFormatada);
    });

    setDatasIndisponiveis(Array.from(datasOcupadas));
  };

  // Verificar se uma sala está disponível em uma data específica
  const verificarDisponibilidadeData = (salaId, data) => {
    if (!salaId || !data) return true;

    const dataSelecionada = new Date(data);
    const dataString = dataSelecionada.toISOString().split('T')[0];

    const reservaMesmoDia = reservas.find(r => {
      if (r.ocupacaoId !== salaId) return false;

      const dataReserva = new Date(r.data);
      const dataReservaString = dataReserva.toISOString().split('T')[0];
      return dataReservaString === dataString;
    });

    return !reservaMesmoDia;
  };

  // Obter salas disponíveis para uma data específica
  const obterSalasDisponiveisParaData = (data) => {
    if (!data) return salas;

    const dataString = new Date(data).toISOString().split('T')[0];
    const salasOcupadas = new Set();

    reservas.forEach(reserva => {
      const dataReserva = new Date(reserva.data);
      const dataReservaString = dataReserva.toISOString().split('T')[0];
      if (dataReservaString === dataString) {
        salasOcupadas.add(reserva.ocupacaoId);
      }
    });

    return salas.filter(sala => !salasOcupadas.has(sala.id));
  };

  // Filtrar reservas do usuário atual
  const obterSuasReservas = () => {
    return reservas.filter(reserva => reserva.usuarioId === idLocal);
  };

  // Ordenar reservas por data (crescente ou decrescente)
  const ordenarReservas = (reservasParaOrdenar) => {
    return [...reservasParaOrdenar].sort((a, b) => {
      const dataA = new Date(a.data);
      const dataB = new Date(b.data);
      return ordenacaoData === 'cre' ? dataA - dataB : dataB - dataA;
    });
  };

  // Aplicar todos os filtros: visualização, status e busca
  const filtrarReservas = () => {
    let reservasParaFiltrar = [];

    if (visualizacao === 'suas') {
      reservasParaFiltrar = obterSuasReservas();
    } else if (visualizacao === 'todas') {
      reservasParaFiltrar = reservas;
    } else {
      return [];
    }

    if (filtrarOpcao !== 'todos') {
      reservasParaFiltrar = reservasParaFiltrar.filter(r => r.status === filtrarOpcao);
    }

    if (busca) {
      reservasParaFiltrar = reservasParaFiltrar.filter(r => {
        const sala = salas.find(s => s.id === r.ocupacaoId);
        const buscaMinuscula = busca.toLowerCase();

        return r.nomeEvento?.toLowerCase().includes(buscaMinuscula) ||
          r.usuarioNome?.toLowerCase().includes(buscaMinuscula) ||
          sala?.nome.toLowerCase().includes(buscaMinuscula);
      });
    }

    return ordenarReservas(reservasParaFiltrar);
  };

  // Navegar entre meses no calendário
  const navegarMes = (direcao) => {
    const novaData = new Date(mesAtual);
    novaData.setMonth(mesAtual.getMonth() + direcao);

    const hoje = new Date();
    const limiteAnterior = new Date(hoje);
    limiteAnterior.setMonth(hoje.getMonth() - 3);
    const limiteFuturo = new Date(hoje);
    limiteFuturo.setMonth(hoje.getMonth() + 12);

    if (novaData >= limiteAnterior && novaData <= limiteFuturo) {
      setMesAtual(novaData);
    }
  };

  // Gerar array de dias do mês atual para o calendário
  const obterDiasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();

    const dias = [];
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(new Date(ano, mes, dia));
    }
    return dias;
  };

  // Obter todas as reservas de um dia específico
  const obterReservasDoDia = (data) => {
    if (!data) return [];
    return reservas.filter(r => {
      const dataReserva = new Date(r.data);
      return dataReserva.toDateString() === data.toDateString();
    });
  };

  // Criar uma nova reserva
  const criarReserva = async (e) => {
    e.preventDefault();

    if (!podeReservar) {
      showToast('Sem permissão para criar reserva', 'error');
      return;
    }

    if (!novaReserva.nomeEvento || novaReserva.nomeEvento.trim() === '') {
      showToast('Nome do evento é obrigatório', 'error');
      return;
    }

    if (!novaReserva.ocupacaoId) {
      showToast('Selecione uma sala', 'error');
      return;
    }

    if (!novaReserva.data) {
      showToast('Selecione uma data e hora', 'error');
      return;
    }

    const disponivel = verificarDisponibilidadeData(novaReserva.ocupacaoId, novaReserva.data);
    if (!disponivel) {
      showToast('Esta sala já está reservada para este dia. Escolha outra data ou sala.', 'error');
      return;
    }

    try {
      const parametros = new URLSearchParams({
        idUsuario: idLocal,
        idOcupacao: novaReserva.ocupacaoId,
        data: novaReserva.data,
        quantidade: novaReserva.quantidade.toString(),
        nomeEvento: novaReserva.nomeEvento.trim()
      });

      const resposta = await fetch(`http://192.168.100.58:5000/CriarReserva?${parametros}`, {
        method: 'POST'
      });

      if (!resposta.ok) {
        const erroDados = await resposta.json();
        throw new Error(erroDados.mensagem || 'Erro ao criar reserva');
      }

      await carregarReservas();
      setModalAberto(false);
      setNovaReserva({ ocupacaoId: '', data: '', quantidade: 1, nomeEvento: '' });
      if (tipoLocal == 'usuario') {
        showToast('Reserva criada com sucesso, espere um adm confirmar!', 'success');
      }
      else {
        showToast('Reserva criada com sucesso!', 'success');
      }

    } catch (erro) {
      console.error('Erro ao criar reserva:', erro);
      showToast(erro.message || 'Erro ao criar reserva', 'error');
    }
  };

  // Abrir modal para editar uma reserva
  const abrirEdicaoReserva = (reserva) => {
    const podeEditar = reserva.usuarioId === idLocal || tipoLocal === 'adm';

    if (podeEditar) {
      setReservaSelecionada(reserva);
      setModalEdicao(true);
    } else {
      showToast('Você não tem permissão para editar esta reserva', 'error');
    }
  };

  // Editar uma reserva existente
  const editarReserva = async (e) => {
    e.preventDefault();

    if (!reservaSelecionada) return;

    if (!reservaSelecionada.nomeEvento || reservaSelecionada.nomeEvento.trim() === '') {
      showToast('Nome do evento é obrigatório', 'error');
      return;
    }

    try {
      const parametros = new URLSearchParams({
        idUsuario: idLocal,
        idReserva: reservaSelecionada.id,
        quantidade: reservaSelecionada.quantidade.toString(),
        nomeEvento: reservaSelecionada.nomeEvento.trim()
      });

      const resposta = await fetch(`http://192.168.100.58:5000/AtualizarReserva?${parametros}`, {
        method: 'PATCH'
      });

      if (!resposta.ok) {
        const erroDados = await resposta.json();
        throw new Error(erroDados.mensagem || 'Erro ao atualizar reserva');
      }

      await carregarReservas();
      setModalEdicao(false);
      showToast('Reserva atualizada com sucesso!', 'success');

    } catch (erro) {
      console.error('Erro ao atualizar reserva:', erro);
      showToast(erro.message || 'Erro ao atualizar reserva', 'error');
    }
  };

  // Excluir uma reserva
  const excluirReserva = async () => {
    if (!reservaSelecionada) return;

    if (!window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      return;
    }

    try {
      const parametros = new URLSearchParams({
        idUsuario: idLocal,
        idReserva: reservaSelecionada.id
      });

      const resposta = await fetch(`http://192.168.100.58:5000/DeletarReserva?${parametros}`, {
        method: 'DELETE'
      });

      if (!resposta.ok) {
        const erroDados = await resposta.json();
        throw new Error(erroDados.mensagem || 'Erro ao excluir reserva');
      }

      await carregarReservas();
      setModalEdicao(false);
      showToast('Reserva excluída com sucesso!', 'success');

    } catch (erro) {
      console.error('Erro ao excluir reserva:', erro);
      showToast(erro.message || 'Erro ao excluir reserva', 'error');
    }
  };

  // Atualizar data na nova reserva e verificar disponibilidade
  const alterarData = (e) => {
    const novaData = e.target.value;
    setNovaReserva({ ...novaReserva, data: novaData });

    if (novaReserva.ocupacaoId && novaData) {
      const salasDisponiveisPara = obterSalasDisponiveisParaData(novaData);
      const salaEstaDisponivel = salasDisponiveisPara.some(s => s.id === novaReserva.ocupacaoId);

      if (!salaEstaDisponivel) {
        setNovaReserva(prev => ({ ...prev, ocupacaoId: '' }));
        showToast('A sala selecionada já está reservada para esta data. Escolha outra sala.', 'warning');
      }
    }
  };

  // Verificar se há salas disponíveis para uma data
  const verificarDataDisponivel = (data) => {
    if (!data) return true;
    const salasDisponiveis = obterSalasDisponiveisParaData(data);
    return salasDisponiveis.length > 0;
  };

  // Atualizar status de uma reserva (apenas para administradores)
  const atualizarTipo = async (novoTipo, idReserva) => {
    if (novoTipo == '') {
      showToast('Erro ao pegar o novo tipo', 'error');
      return;
    }

    try {
      const parametros = new URLSearchParams({
        idAdm: idLocal,
        idReserva: idReserva,
        novoStatus: novoTipo
      });

      const resposta = await fetch(`http://192.168.100.58:5000/AtualizarTipo?${parametros}`, {
        method: 'PATCH'
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        showToast(`Atualização para ${novoTipo} feita`, "success");
        await carregarReservas();
      } else {
        showToast(dados.mensagem || 'Erro ao atualizar status', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao conectar com o servidor', 'error');
    }
  };

  // Arrays auxiliares para exibição
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Dados calculados para renderização
  const reservasFiltradasResultado = filtrarReservas();
  const salasDisponiveis = obterSalasDisponiveisParaData(novaReserva.data);

  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho da página */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="-4xl font-bold text-[#5C4033] mb-1">Reservas</h1>
              <p className="text-sm text-[#6B7280]">Gerencie suas reservas de salas e espaços</p>
            </div>
            {/* Botão para nova reserva (apenas se tiver permissão) */}
            {podeReservar && (
              <button
                onClick={() => setModalAberto(true)}
                className="px-6 py-3 bg-[#F4D35E] hover:bg-[#F6E7A1] text-[#3E2A21] font-semibold rounded-lg transition duration-300 shadow-sm hover:shadow-md"
              >
                + Nova Reserva
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Seção de busca e filtros */}
        <div className="mb-8">
          <div className="mb-6">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={
                visualizacao === 'suas'
                  ? "Buscar suas reservas..."
                  : "Buscar todas as reservas..."
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 placeholder-gray-500 transition duration-200"
            />
          </div>

          {/* Botões de visualização e filtros */}
          <div className="flex gap-4 items-center flex-col md:flex-row">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full flex-col md:flex-row md:w-fit">
              <button
                onClick={() => setVisualizacao('suas')}
                className={`px-5 py-2 rounded-md font-medium text-sm transition duration-300 ${visualizacao === 'suas'
                  ? 'bg-white text-[#5C4033] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#5C4033]'
                  }`}
              >
                Suas Reservas
              </button>
              <button
                onClick={() => setVisualizacao('calendario')}
                className={`px-5 py-2 rounded-md font-medium text-sm transition duration-300 ${visualizacao === 'calendario'
                  ? 'bg-white text-[#5C4033] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#5C4033]'
                  }`}
              >
                Calendário
              </button>
              <button
                onClick={() => setVisualizacao('todas')}
                className={`px-5 py-2 rounded-md font-medium text-sm transition duration-300 ${visualizacao === 'todas'
                  ? 'bg-white text-[#5C4033] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#5C4033]'
                  }`}
              >
                Todas as Reservas
              </button>
            </div>

            {/* Filtros de ordenação e status */}
            <div className="flex flex-row gap-4 [@media(max-width:410px)]:flex-col">
              <select
                value={ordenacaoData}
                onChange={(e) => setOrdenacaoData(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 text-sm"
              >
                <option value="dec">Data ↓ (Decrescente)</option>
                <option value="cre">Data ↑ (Crescente)</option>
              </select>

              {/* Filtro de status (apenas para administradores) */}
              {tipoLocal === 'adm' && visualizacao === 'todas' && (
                <select
                  value={filtrarOpcao}
                  onChange={(e) => setFiltrarOpcao(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 text-sm"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="aceita">Aceita</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Visualização: Suas Reservas */}
        {visualizacao === 'suas' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#5C4033]">Suas Reservas</h2>
              <span className="text-sm text-[#6B7280] font-medium">
                {reservasFiltradasResultado.length} reserva{reservasFiltradasResultado.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Indicador de carregamento */}
            {carregando ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#F4D35E] border-t-[#5C4033]"></div>
              </div>
            ) : reservasFiltradasResultado.length > 0 ? (
              <div className="grid gap-4">
                {/* Lista de reservas do usuário */}
                {reservasFiltradasResultado.map(reserva => {
                  const sala = salas.find(s => s.id === reserva.ocupacaoId);
                  const dataReserva = new Date(reserva.data);
                  const dataPassada = new Date(reserva.data) < new Date();

                  return (
                    <div
                      key={reserva.id}
                      onClick={() => abrirEdicaoReserva(reserva)}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-[#F4D35E] transition duration-300 cursor-pointer group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-[#5C4033] text-lg group-hover:text-[#3E2A21]">
                              {reserva.nomeEvento || 'Evento sem nome'}
                            </h3>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${reserva.status === 'pendente'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-green-100 text-green-700'
                              }`}>
                              {reserva.status === 'pendente' ? 'Pendente' : 'Ativa'}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm text-[#6B7280]">
                            <p className="font-medium">
                              <span className="text-[#5C4033]">Sala:</span> {reserva.salaNome || sala?.nome}
                            </p>
                            <p>
                              <span className="text-[#5C4033]">Capacidade:</span> {reserva.quantidade} de {sala?.quantidadeMaxima} pessoas
                            </p>
                          </div>
                        </div>
                        <div className="md:text-right">
                          <div className="text-[#5C4033] font-bold text-lg">
                            {dataReserva.toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-[#6B7280] text-sm">
                            {dataReserva.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Mensagem quando não há reservas */
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-[#6B7280] mb-4">Você não tem reservas</p>
                {podeReservar && (
                  <button
                    onClick={() => setModalAberto(true)}
                    className="text-[#F4D35E] hover:text-[#F6E7A1] font-semibold transition duration-300"
                  >
                    Faça sua primeira reserva!
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Visualização: Calendário */}
        {visualizacao === 'calendario' && (
          <div>
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <button onClick={() => navegarMes(-1)}>←</button>
                  <h2 className="text-2xl font-bold text-[#5C4033] min-w-fit">
                    {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                  </h2>
                  <button onClick={() => navegarMes(1)}>→</button>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#F4D35E] rounded-full"></div>
                    <span className="text-[#6B7280]">Suas reservas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#F6E7A1] rounded-full"></div>
                    <span className="text-[#6B7280]">Outras reservas</span>
                  </div>
                </div>
              </div>

              {/* Grid do calendário */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
                  {diasSemana.map(dia => (
                    <div key={dia} className="text-center font-semibold text-[#5C4033] py-4 px-2 bg-gray-50 border-r border-gray-200 last:border-r-0">
                      {dia}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0">
                  {obterDiasDoMes().map((data, indice) => {
                    const reservasDoDia = data ? obterReservasDoDia(data) : [];
                    const hoje = data && data.toDateString() === new Date().toDateString();
                    const disponivel = verificarDataDisponivel(data);
                    const suasReservasDoDia = data ? reservasDoDia.filter(r => r.usuarioId === idLocal) : [];
                    const outrasReservasDoDia = data ? reservasDoDia.filter(r => r.usuarioId !== idLocal) : [];

                    return (
                      <div
                        key={indice}
                        className={`min-h-28 p-3 border-r border-b border-gray-200 last:border-r-0 ${data
                          ? disponivel
                            ? 'bg-white hover:bg-gray-50'
                            : 'bg-gray-50'
                          : 'bg-gray-50'
                          } ${hoje ? 'ring-2 ring-[#F4D35E] ring-inset' : ''}`}
                      >
                        {data && (
                          <>
                            <div className={`font-bold mb-2 text-sm ${!disponivel ? 'text-gray-400' : 'text-[#5C4033]'}`}>
                              {data.getDate()}
                              {!disponivel && <span className="ml-1">🔒</span>}
                            </div>
                            <div className="space-y-1">
                              {/* Suas reservas no dia */}
                              {suasReservasDoDia.slice(0, 2).map(reserva => (
                                <div
                                  key={reserva.id}
                                  onClick={() => abrirEdicaoReserva(reserva)}
                                  className="text-xs p-2 rounded bg-[#F4D35E] text-[#3E2A21] font-medium cursor-pointer hover:bg-[#F6E7A1] transition duration-300 truncate"
                                  title={`${reserva.nomeEvento} - ${salas.find(s => s.id === reserva.ocupacaoId)?.nome}`}
                                >
                                  {reserva.nomeEvento || 'Evento'}
                                </div>
                              ))}
                              {/* Reservas de outros usuários */}
                              {outrasReservasDoDia.slice(0, 2).map(reserva => {
                                const podeEditar = reserva.usuarioId === idLocal || tipoLocal === 'adm' || tipoLocal === 'funcionario';

                                return (
                                  <div
                                    key={reserva.id}
                                    onClick={() => podeEditar && abrirEdicaoReserva(reserva)}
                                    className={`text-xs p-2 rounded bg-[#F6E7A1] text-[#5C4033] font-medium ${podeEditar ? 'cursor-pointer hover:bg-[#F4D35E]' : 'cursor-default'
                                      } transition duration-300 truncate`}
                                    title={`${reserva.nomeEvento} - ${salas.find(s => s.id === reserva.ocupacaoId)?.nome}`}
                                  >
                                    {reserva.nomeEvento || 'Evento'}
                                  </div>
                                );
                              })}
                              {/* Indicador de mais reservas */}
                              {reservasDoDia.length > 2 && (
                                <div className="text-xs text-[#6B7280] font-semibold px-2">
                                  +{reservasDoDia.length - 2} mais
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visualização: Todas as Reservas */}
        {visualizacao === 'todas' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#5C4033]">Todas as Reservas</h2>
              <span className="text-sm text-[#6B7280] font-medium">
                {reservasFiltradasResultado.length} reserva{reservasFiltradasResultado.length !== 1 ? 's' : ''}
                {busca && ' (filtradas)'}
              </span>
            </div>

            {carregando ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#F4D35E] border-t-[#5C4033]"></div>
              </div>
            ) : reservasFiltradasResultado.length > 0 ? (
              <div className="grid gap-4">
                {/* Lista de todas as reservas */}
                {reservasFiltradasResultado.map(reserva => {
                  const sala = salas.find(s => s.id === reserva.ocupacaoId);
                  const dataReserva = new Date(reserva.data);
                  const podeEditar = reserva.usuarioId === idLocal || tipoLocal === 'adm' || tipoLocal === 'funcionario';
                  const minhaReserva = reserva.usuarioId === idLocal;

                  return (
                    <div
                      key={reserva.id}
                      onClick={() => podeEditar && abrirEdicaoReserva(reserva)}
                      className={`bg-white border rounded-lg p-6 transition duration-300 ${minhaReserva
                        ? 'border-[#F4D35E] hover:shadow-md hover:border-[#F6E7A1]'
                        : 'border-gray-200 hover:shadow-md hover:border-gray-300'
                        } ${podeEditar ? 'cursor-pointer' : 'cursor-default'} group`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-[#5C4033] text-lg group-hover:text-[#3E2A21]">
                              {reserva.nomeEvento || 'Evento sem nome'}
                            </h3>
                            {minhaReserva && (
                              <span className="text-xs bg-[#F4D35E] text-[#3E2A21] px-3 py-1 rounded-full font-semibold">
                                Minha
                              </span>
                            )}
                            {reserva.status == 'pendente' && (
                              <span className="text-xs bg-[#F4D35E] text-[#3E2A21] px-3 py-1 rounded-full font-semibold">
                                Pendente
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm text-[#6B7280]">
                            <p className="font-medium">
                              <span className="text-[#5C4033]">Sala:</span> {reserva.salaNome || sala?.nome} • <span className="text-[#5C4033]">Por:</span> {reserva.usuarioNome || 'Usuário'}
                            </p>
                            <p>
                              <span className="text-[#5C4033]">Capacidade:</span> {reserva.quantidade} de {sala?.quantidadeMaxima} pessoas
                            </p>
                          </div>
                        </div>
                        <div className="md:text-right">
                          {/* Botões de aprovação para administradores (versão desktop) */}
                          {reserva.status == 'pendente' && tipoLocal === 'adm' ? (
                            <div className='flex-row gap-2 mb-2 justify-end hidden md:flex'>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  atualizarTipo('aceita', reserva.id);
                                }}
                                className=" group flex items-center w-6 hover:w-24 overflow-hidden transition-all duration-300 bg-green-200 rounded-md text-black"
                              >
                                <span>✔️</span>
                                <span className=' ml-2 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100'>Aceitar</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  atualizarTipo('recusado', reserva.id);
                                }}
                                className="group flex items-center w-6 hover:w-24 overflow-hidden transition-all duration-300 bg-red-200 rounded-md text-black"
                              >
                                <span>❌</span>
                                <span className=' ml-2 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100'>Recusar</span>
                              </button>
                            </div>
                          ) : null}
                          <div className="text-[#5C4033] font-bold text-lg">
                            {dataReserva.toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-[#6B7280] text-sm">
                            {dataReserva.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {/* Botões de aprovação para administradores (versão mobile) */}
                          {reserva.status == 'pendente' && tipoLocal === 'adm' ? (
                            <div className='flex flex-row gap-2 mb-2 justify-start  md:hidden'>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  atualizarTipo('aceita', reserva.id);
                                }}
                                className=" group flex items-center w-6 hover:w-24 overflow-hidden transition-all duration-300 bg-green-200 rounded-md text-black"
                              >
                                <span>✔️</span>
                                <span className=' ml-2 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100'>Aceitar</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  atualizarTipo('recusado', reserva.id);
                                }}
                                className="group flex items-center w-6 hover:w-24 overflow-hidden transition-all duration-300 bg-red-200 rounded-md text-black"
                              >
                                <span>❌</span>
                                <span className=' ml-2 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100'>Recusar</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Mensagem quando não há reservas */
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-[#6B7280]">
                  {busca ? 'Nenhuma reserva encontrada com essa busca' : 'Nenhuma reserva cadastrada'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para criar nova reserva */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#5C4033] mb-1">Nova Reserva</h2>
            <p className="text-sm text-[#6B7280] mb-6">Preencha os detalhes da sua reserva</p>

            <form onSubmit={criarReserva} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                  Nome do Evento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={novaReserva.nomeEvento}
                  onChange={(e) => setNovaReserva({ ...novaReserva, nomeEvento: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 placeholder-gray-500 transition duration-200"
                  placeholder="Ex: Reunião de equipe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                  Data e Hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={novaReserva.data}
                  onChange={alterarData}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 transition duration-200"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
                {novaReserva.data && (
                  <div className="mt-2">
                    {salasDisponiveis.length > 0 ? (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ {salasDisponiveis.length} sala(s) disponível(eis)
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">
                        ✗ Nenhuma sala disponível nesta data
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                  Sala/Espaço <span className="text-red-500">*</span>
                </label>
                <select
                  value={novaReserva.ocupacaoId}
                  onChange={(e) => setNovaReserva({ ...novaReserva, ocupacaoId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 transition duration-200"
                  required
                  disabled={!novaReserva.data || salasDisponiveis.length === 0}
                >
                  <option value="">
                    {!novaReserva.data
                      ? "Selecione uma data primeiro"
                      : salasDisponiveis.length === 0
                        ? "Nenhuma sala disponível"
                        : "Selecione uma sala"}
                  </option>
                  {salasDisponiveis.map(sala => (
                    <option key={sala.id} value={sala.id}>
                      {sala.nome} (Máx: {sala.quantidadeMaxima} pessoas)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                  Quantidade de Pessoas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={novaReserva.quantidade}
                  onChange={(e) => setNovaReserva({ ...novaReserva, quantidade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 transition duration-200"
                  min="1"
                  required
                  disabled={!novaReserva.ocupacaoId}
                />
                {novaReserva.ocupacaoId && (
                  <div className="mt-2 text-sm text-[#6B7280]">
                    {(() => {
                      const salaSelecionada = salas.find(s => s.id === novaReserva.ocupacaoId);
                      return salaSelecionada
                        ? `Capacidade máxima: ${salaSelecionada.quantidadeMaxima} pessoas`
                        : '';
                    })()}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#F4D35E] hover:bg-[#F6E7A1] text-[#3E2A21] font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!novaReserva.data || !novaReserva.ocupacaoId || salasDisponiveis.length === 0}
                >
                  Criar Reserva
                </button>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#5C4033] font-semibold py-3 rounded-lg transition duration-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar reserva */}
      {modalEdicao && reservaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#5C4033] mb-1">Editar Reserva</h2>
            <p className="text-sm text-[#6B7280] mb-6">Atualize os detalhes da sua reserva</p>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-3">
                <p className="text-sm text-[#6B7280]">
                  <span className="font-semibold text-[#5C4033]">Sala:</span> {reservaSelecionada.salaNome}
                </p>
                <p className="text-sm text-[#6B7280]">
                  <span className="font-semibold text-[#5C4033]">Data:</span> {new Date(reservaSelecionada.data).toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-[#6B7280]">
                  <span className="font-semibold text-[#5C4033]">Reservado por:</span> {reservaSelecionada.usuarioNome || 'Usuário'}
                </p>
              </div>
            </div>

            <form onSubmit={editarReserva} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                  Nome do Evento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reservaSelecionada.nomeEvento}
                  onChange={(e) => setReservaSelecionada({
                    ...reservaSelecionada,
                    nomeEvento: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 transition duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                  Quantidade de Pessoas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={reservaSelecionada.quantidade}
                  onChange={(e) => setReservaSelecionada({
                    ...reservaSelecionada,
                    quantidade: parseInt(e.target.value) || 1
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 transition duration-200"
                  min="1"
                  required
                />
                <div className="mt-2 text-sm text-[#6B7280]">
                  {(() => {
                    const salaSelecionada = salas.find(s => s.id === reservaSelecionada.ocupacaoId);
                    return salaSelecionada
                      ? `Capacidade máxima: ${salaSelecionada.quantidadeMaxima} pessoas`
                      : '';
                  })()}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#F4D35E] hover:bg-[#F6E7A1] text-[#3E2A21] font-semibold py-3 rounded-lg transition duration-300"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={excluirReserva}
                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 rounded-lg transition duration-300"
                >
                  Excluir Reserva
                </button>
                <button
                  type="button"
                  onClick={() => setModalEdicao(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-[#5C4033] font-semibold py-3 rounded-lg transition duration-300"
                >
                  Fechar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}