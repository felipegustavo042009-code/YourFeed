import { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../variaveisGlobais';

// Componente para gerenciar reservas
export default function Reservar({ showToast }) {
  // Estados principais
  const [reservas, setReservas] = useState([]); // Todas as reservas
  const [salas, setSalas] = useState([]); // Todas as salas disponíveis
  const [mesAtual, setMesAtual] = useState(new Date()); // Mês atual no calendário
  const [busca, setBusca] = useState(''); // Texto de busca
  const [modalAberto, setModalAberto] = useState(false); // Modal nova reserva
  const [modalEdicao, setModalEdicao] = useState(false); // Modal editar reserva
  const [reservaSelecionada, setReservaSelecionada] = useState(null); // Reserva sendo editada
  const [carregando, setCarregando] = useState(true); // Estado de carregamento
  const [visualizacao, setVisualizacao] = useState('suas'); // 'suas', 'calendario' ou 'todas'
  
  // Dados da nova reserva
  const [novaReserva, setNovaReserva] = useState({
    ocupacaoId: '', // ID da sala
    data: '', // Data e hora
    quantidade: 1, // Número de pessoas
    nomeEvento: '' // Nome do evento
  });
  
  const [datasIndisponiveis, setDatasIndisponiveis] = useState([]); // Datas já ocupadas

  // Dados do usuário atual
  const { idLocal, tipoLocal } = useContext(GlobalContext);
  const podeReservar = tipoLocal === 'adm' || tipoLocal === 'funcionario'; // Quem pode reservar

  // Carrega dados iniciais ao iniciar
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Calcula datas indisponíveis quando salas ou reservas mudam
  useEffect(() => {
    if (salas.length > 0 && reservas.length > 0) {
      calcularDatasIndisponiveis();
    }
  }, [salas, reservas]);

  // Carrega salas e reservas
  const carregarDadosIniciais = async () => {
    try {
      setCarregando(true);

      // Busca lista de salas
      const respostaSalas = await fetch('http:///ListarSala');
      if (!respostaSalas.ok) throw new Error('Erro ao carregar salas');
      const dadosSalas = await respostaSalas.json();
      setSalas(dadosSalas.salas || []);

      // Carrega reservas do usuário
      await carregarReservas();

    } catch (erro) {
      console.error('Erro:', erro);
      showToast('Erro ao carregar dados', 'error');
    } finally {
      setCarregando(false);
    }
  };

  // Carrega reservas da API
  const carregarReservas = async () => {
    try {
      const parametros = new URLSearchParams({
        idUsuario: idLocal // ID do usuário atual
      });

      const resposta = await fetch(`http:///ListarReserva?${parametros}`);
      if (!resposta.ok) throw new Error('Erro ao carregar reservas');

      const dados = await resposta.json();
      setReservas(dados.reservas || []);
    } catch (erro) {
      console.error('Erro:', erro);
      showToast('Erro ao carregar reservas', 'error');
    }
  };

  // Calcula quais datas já estão ocupadas
  const calcularDatasIndisponiveis = () => {
    const datasOcupadas = new Set();

    reservas.forEach(reserva => {
      const dataReserva = new Date(reserva.data);
      const dataFormatada = dataReserva.toISOString().split('T')[0];
      datasOcupadas.add(dataFormatada);
    });

    setDatasIndisponiveis(Array.from(datasOcupadas));
  };

  // Verifica se uma sala está disponível em uma data específica
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

    return !reservaMesmoDia; // Retorna true se disponível
  };

  // Retorna salas disponíveis para uma data específica
  const obterSalasDisponiveisParaData = (data) => {
    if (!data) return salas;

    const dataString = new Date(data).toISOString().split('T')[0];
    const salasOcupadas = new Set();

    // Marca salas que já têm reserva nessa data
    reservas.forEach(reserva => {
      const dataReserva = new Date(reserva.data);
      const dataReservaString = dataReserva.toISOString().split('T')[0];
      if (dataReservaString === dataString) {
        salasOcupadas.add(reserva.ocupacaoId);
      }
    });

    // Filtra apenas salas não ocupadas
    return salas.filter(sala => !salasOcupadas.has(sala.id));
  };

  // Retorna apenas as reservas do usuário atual
  const obterSuasReservas = () => {
    return reservas
      .filter(reserva => reserva.usuarioId === idLocal)
      .sort((a, b) => new Date(b.data) - new Date(a.data)); // Ordena por data (mais recente primeiro)
  };

  // Retorna todas as reservas
  const obterTodasReservas = () => {
    return reservas.sort((a, b) => new Date(a.data) - new Date(b.data));
  };

  // Navega entre meses no calendário
  const navegarMes = (direcao) => {
    const novaData = new Date(mesAtual);
    novaData.setMonth(mesAtual.getMonth() + direcao); // +1 para próximo, -1 para anterior

    const hoje = new Date();
    const limiteAnterior = new Date(hoje);
    limiteAnterior.setMonth(hoje.getMonth() - 3); // 3 meses para trás
    const limiteFuturo = new Date(hoje);
    limiteFuturo.setMonth(hoje.getMonth() + 12); // 12 meses para frente

    // Só permite navegar dentro do limite
    if (novaData >= limiteAnterior && novaData <= limiteFuturo) {
      setMesAtual(novaData);
    }
  };

  // Retorna todos os dias de um mês para o calendário
  const obterDiasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay(); // Dia da semana do primeiro dia (0=domingo)

    const dias = [];
    // Adiciona espaços vazios para os dias da semana antes do primeiro dia
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }
    // Adiciona os dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(new Date(ano, mes, dia));
    }
    return dias;
  };

  // Retorna reservas de um dia específico
  const obterReservasDoDia = (data) => {
    if (!data) return [];
    return reservas.filter(r => {
      const dataReserva = new Date(r.data);
      return dataReserva.toDateString() === data.toDateString(); // Compara apenas data, não hora
    });
  };

  // Cria uma nova reserva
  const criarReserva = async (e) => {
    e.preventDefault();

    if (!podeReservar) {
      showToast('Sem permissão para criar reserva', 'error');
      return;
    }

    // Validações
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

    // Verifica disponibilidade
    const disponivel = verificarDisponibilidadeData(novaReserva.ocupacaoId, novaReserva.data);
    if (!disponivel) {
      showToast('Esta sala já está reservada para este dia. Escolha outra data ou sala.', 'error');
      return;
    }

    try {
      // Parâmetros para a API
      const parametros = new URLSearchParams({
        idUsuario: idLocal,
        idOcupacao: novaReserva.ocupacaoId,
        data: novaReserva.data,
        quantidade: novaReserva.quantidade.toString(),
        nomeEvento: novaReserva.nomeEvento.trim()
      });

      // Envia requisição para criar reserva
      const resposta = await fetch(`http:///CriarReserva?${parametros}`, {
        method: 'POST'
      });

      if (!resposta.ok) {
        const erroDados = await resposta.json();
        throw new Error(erroDados.mensagem || 'Erro ao criar reserva');
      }

      // Atualiza a lista de reservas
      await carregarReservas();
      setModalAberto(false); // Fecha modal
      setNovaReserva({ ocupacaoId: '', data: '', quantidade: 1, nomeEvento: '' }); // Limpa formulário
      showToast('Reserva criada com sucesso!', 'success');

    } catch (erro) {
      console.error('Erro ao criar reserva:', erro);
      showToast(erro.message || 'Erro ao criar reserva', 'error');
    }
  };

  // Abre modal para editar reserva
  const abrirEdicaoReserva = (reserva) => {
    const podeEditar = reserva.usuarioId === idLocal || tipoLocal === 'adm' || tipoLocal === 'funcionario';

    if (podeEditar) {
      setReservaSelecionada(reserva);
      setModalEdicao(true);
    } else {
      showToast('Você não tem permissão para editar esta reserva', 'error');
    }
  };

  // Salva alterações na reserva
  const editarReserva = async (e) => {
    e.preventDefault();

    if (!reservaSelecionada) return;

    // Validações
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

      const resposta = await fetch(`http:///AtualizarReserva?${parametros}`, {
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

  // Exclui uma reserva
  const excluirReserva = async () => {
    if (!reservaSelecionada) return;

    // Confirmação do usuário
    if (!window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      return;
    }

    try {
      const parametros = new URLSearchParams({
        idUsuario: idLocal,
        idReserva: reservaSelecionada.id
      });

      const resposta = await fetch(`http:///DeletarReserva?${parametros}`, {
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

  // Atualiza data da nova reserva e verifica disponibilidade
  const alterarData = (e) => {
    const novaData = e.target.value;
    setNovaReserva({ ...novaReserva, data: novaData });

    // Se já tem sala selecionada, verifica se continua disponível
    if (novaReserva.ocupacaoId && novaData) {
      const salasDisponiveisPara = obterSalasDisponiveisParaData(novaData);
      const salaEstaDisponivel = salasDisponiveisPara.some(s => s.id === novaReserva.ocupacaoId);

      if (!salaEstaDisponivel) {
        setNovaReserva(prev => ({ ...prev, ocupacaoId: '' })); // Limpa sala selecionada
        showToast('A sala selecionada já está reservada para esta data. Escolha outra sala.', 'warning');
      }
    }
  };

  // Verifica se há salas disponíveis para uma data
  const verificarDataDisponivel = (data) => {
    if (!data) return true;
    const salasDisponiveis = obterSalasDisponiveisParaData(data);
    return salasDisponiveis.length > 0; // True se houver pelo menos uma sala disponível
  };

  // Filtra reservas baseado na busca e visualização
  const filtrarReservas = () => {
    let reservasParaFiltrar = [];

    if (visualizacao === 'suas') {
      reservasParaFiltrar = obterSuasReservas();
    } else if (visualizacao === 'todas') {
      reservasParaFiltrar = obterTodasReservas();
    } else {
      return [];
    }

    if (!busca) return reservasParaFiltrar;

    // Filtra por nome do evento, nome do usuário ou nome da sala
    return reservasParaFiltrar.filter(r => {
      const sala = salas.find(s => s.id === r.ocupacaoId);
      const buscaMinuscula = busca.toLowerCase();

      return r.nomeEvento?.toLowerCase().includes(buscaMinuscula) ||
        r.usuarioNome?.toLowerCase().includes(buscaMinuscula) ||
        sala?.nome.toLowerCase().includes(buscaMinuscula);
    });
  };

  // Arrays auxiliares para calendário
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Dados calculados para renderização
  const suasReservas = obterSuasReservas();
  const reservasFiltradasResultado = filtrarReservas();
  const salasDisponiveis = obterSalasDisponiveisParaData(novaReserva.data);

  // Renderização do componente
  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[#5C4033] mb-1">Reservas</h1>
              <p className="text-sm text-[#6B7280]">Gerencie suas reservas de salas e espaços</p>
            </div>
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
        {/* Barra de busca e filtros */}
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

          {/* Botões de visualização */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-auto flex-col md:flex-row md:w-fit">
            <button
              onClick={() => setVisualizacao('suas')}
              className={`px-5 py-2 rounded-md font-medium text-sm transition duration-300 ${
                visualizacao === 'suas'
                  ? 'bg-white text-[#5C4033] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#5C4033]'
              }`}
            >
              Suas Reservas
            </button>
            <button
              onClick={() => setVisualizacao('calendario')}
              className={`px-5 py-2 rounded-md font-medium text-sm transition duration-300 ${
                visualizacao === 'calendario'
                  ? 'bg-white text-[#5C4033] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#5C4033]'
              }`}
            >
              Calendário
            </button>
            <button
              onClick={() => setVisualizacao('todas')}
              className={`px-5 py-2 rounded-md font-medium text-sm transition duration-300 ${
                visualizacao === 'todas'
                  ? 'bg-white text-[#5C4033] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#5C4033]'
              }`}
            >
              Todas as Reservas
            </button>
          </div>
        </div>

        {/* Visualização: Suas Reservas */}
        {visualizacao === 'suas' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#5C4033]">Suas Reservas</h2>
              <span className="text-sm text-[#6B7280] font-medium">
                {suasReservas.length} reserva{suasReservas.length !== 1 ? 's' : ''}
              </span>
            </div>

            {carregando ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#F4D35E] border-t-[#5C4033]"></div>
              </div>
            ) : suasReservas.length > 0 ? (
              <div className="grid gap-4">
                {suasReservas.map(reserva => {
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
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              dataPassada
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {dataPassada ? 'Passada' : 'Ativa'}
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
                        className={`min-h-28 p-3 border-r border-b border-gray-200 last:border-r-0 ${
                          data
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
                              {outrasReservasDoDia.slice(0, 2).map(reserva => {
                                const podeEditar = reserva.usuarioId === idLocal || tipoLocal === 'adm' || tipoLocal === 'funcionario';
                                
                                return (
                                  <div
                                    key={reserva.id}
                                    onClick={() => podeEditar && abrirEdicaoReserva(reserva)}
                                    className={`text-xs p-2 rounded bg-[#F6E7A1] text-[#5C4033] font-medium ${
                                      podeEditar ? 'cursor-pointer hover:bg-[#F4D35E]' : 'cursor-default'
                                    } transition duration-300 truncate`}
                                    title={`${reserva.nomeEvento} - ${salas.find(s => s.id === reserva.ocupacaoId)?.nome}`}
                                  >
                                    {reserva.nomeEvento || 'Evento'}
                                  </div>
                                );
                              })}
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
                {reservasFiltradasResultado.map(reserva => {
                  const sala = salas.find(s => s.id === reserva.ocupacaoId);
                  const dataReserva = new Date(reserva.data);
                  const podeEditar = reserva.usuarioId === idLocal || tipoLocal === 'adm' || tipoLocal === 'funcionario';
                  const minhaReserva = reserva.usuarioId === idLocal;

                  return (
                    <div
                      key={reserva.id}
                      onClick={() => podeEditar && abrirEdicaoReserva(reserva)}
                      className={`bg-white border rounded-lg p-6 transition duration-300 ${
                        minhaReserva
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
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-[#6B7280]">
                  {busca ? 'Nenhuma reserva encontrada com essa busca' : 'Nenhuma reserva cadastrada'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Nova Reserva */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#5C4033] mb-1">Nova Reserva</h2>
            <p className="text-sm text-[#6B7280] mb-6">Preencha os detalhes da sua reserva</p>

            <form onSubmit={criarReserva} className="space-y-5">
              {/* Nome do Evento */}
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

              {/* Data e Hora */}
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
                  min={new Date().toISOString().slice(0, 16)} // Não permite datas passadas
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

              {/* Seleção de Sala */}
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

              {/* Quantidade de Pessoas */}
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

              {/* Botões do Modal */}
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

      {/* Modal: Editar Reserva */}
      {modalEdicao && reservaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#5C4033] mb-1">Editar Reserva</h2>
            <p className="text-sm text-[#6B7280] mb-6">Atualize os detalhes da sua reserva</p>

            {/* Informações da reserva (somente leitura) */}
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

            {/* Formulário de edição */}
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

              {/* Botões do modal de edição */}
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