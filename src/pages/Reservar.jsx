import { useState } from 'react';
import { mockReservas, mockSalas } from '../data/mockData';

export default function Reservar({ usuario, showToast }) {
  const [reservas, setReservas] = useState(mockReservas);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalEdicao, setModalEdicao] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);
  const [novaReserva, setNovaReserva] = useState({
    ocupacaoId: '',
    data: '',
    quantidade: 1,
    nome: '',
    sobre: ''
  });

  const podeReservar = usuario?.tipo === 'adm' || usuario?.tipo === 'funcionario';

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

  const getDiasDoMes = () => {
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

  const getReservasDoDia = (data) => {
    if (!data) return [];
    return reservas.filter(r => {
      const dataReserva = new Date(r.data);
      return dataReserva.toDateString() === data.toDateString();
    });
  };

  const reservasFiltradas = reservas.filter(r => {
    if (!busca) return true;
    const sala = mockSalas.find(s => s.id === r.ocupacaoId);
    return r.nome.toLowerCase().includes(busca.toLowerCase()) ||
           sala?.nome.toLowerCase().includes(busca.toLowerCase());
  });

  const handleCriarReserva = (e) => {
    e.preventDefault();
    
    const reserva = {
      id: (reservas.length + 1).toString(),
      ...novaReserva,
      data: new Date(novaReserva.data),
      quantidade: parseInt(novaReserva.quantidade),
      usuarioId: usuario.id
    };
    
    setReservas([...reservas, reserva]);
    setModalAberto(false);
    setNovaReserva({ ocupacaoId: '', data: '', quantidade: 1, nome: '', sobre: '' });
    showToast('Reserva criada com sucesso!', 'success');
  };

  const handleAbrirEdicao = (reserva) => {
    if (reserva.usuarioId === usuario?.id || usuario?.tipo === 'adm' || usuario?.tipo === 'funcionario') {
      setReservaSelecionada(reserva);
      setModalEdicao(true);
    }
  };

  const handleEditarReserva = (e) => {
    e.preventDefault();
    setReservas(reservas.map(r => 
      r.id === reservaSelecionada.id ? reservaSelecionada : r
    ));
    setModalEdicao(false);
    showToast('Reserva atualizada com sucesso!', 'success');
  };

  const handleDeletarReserva = () => {
    setReservas(reservas.filter(r => r.id !== reservaSelecionada.id));
    setModalEdicao(false);
    showToast('Reserva deletada com sucesso!', 'success');
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Reservas</h1>
          {podeReservar && (
            <button
              onClick={() => setModalAberto(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
            >
              + Nova Reserva
            </button>
          )}
        </div>
        
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome do evento ou sala..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navegarMes(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            ← Anterior
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </h2>
          <button
            onClick={() => navegarMes(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            Próximo →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {diasSemana.map(dia => (
            <div key={dia} className="text-center font-semibold text-gray-600 py-2">
              {dia}
            </div>
          ))}
          
          {getDiasDoMes().map((data, index) => {
            const reservasDoDia = data ? getReservasDoDia(data) : [];
            const isHoje = data && data.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-24 p-2 border rounded-lg ${
                  data ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                } ${isHoje ? 'border-blue-500 border-2' : 'border-gray-200'}`}
              >
                {data && (
                  <>
                    <div className="font-semibold text-gray-800 mb-1">
                      {data.getDate()}
                    </div>
                    <div className="space-y-1">
                      {reservasDoDia.slice(0, 2).map(reserva => {
                        const sala = mockSalas.find(s => s.id === reserva.ocupacaoId);
                        return (
                          <div
                            key={reserva.id}
                            onClick={() => handleAbrirEdicao(reserva)}
                            className="text-xs bg-blue-100 text-blue-800 p-1 rounded cursor-pointer hover:bg-blue-200 transition truncate"
                          >
                            {reserva.nome}
                          </div>
                        );
                      })}
                      {reservasDoDia.length > 2 && (
                        <div className="text-xs text-gray-600 font-semibold">
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

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {busca ? 'Resultados da Busca' : 'Todas as Reservas'}
        </h2>
        <div className="space-y-3">
          {reservasFiltradas.map(reserva => {
            const sala = mockSalas.find(s => s.id === reserva.ocupacaoId);
            const dataReserva = new Date(reserva.data);
            return (
              <div
                key={reserva.id}
                onClick={() => handleAbrirEdicao(reserva)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{reserva.nome}</h3>
                    <p className="text-gray-600 text-sm">{reserva.sobre}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      📍 {sala?.nome} • 👥 {reserva.quantidade} pessoas
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600 font-semibold">
                      {dataReserva.toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {dataReserva.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nova Reserva</h2>
            <form onSubmit={handleCriarReserva}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Sala/Espaço</label>
                <select
                  value={novaReserva.ocupacaoId}
                  onChange={(e) => setNovaReserva({ ...novaReserva, ocupacaoId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma sala</option>
                  {mockSalas.map(sala => (
                    <option key={sala.id} value={sala.id}>{sala.nome}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Nome do Evento</label>
                <input
                  type="text"
                  value={novaReserva.nome}
                  onChange={(e) => setNovaReserva({ ...novaReserva, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Sobre</label>
                <textarea
                  value={novaReserva.sobre}
                  onChange={(e) => setNovaReserva({ ...novaReserva, sobre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={novaReserva.data}
                  onChange={(e) => setNovaReserva({ ...novaReserva, data: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Quantidade de Pessoas</label>
                <input
                  type="number"
                  value={novaReserva.quantidade}
                  onChange={(e) => setNovaReserva({ ...novaReserva, quantidade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition duration-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalEdicao && reservaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Reserva</h2>
            {reservaSelecionada.usuarioId === usuario?.id || usuario?.tipo === 'adm' || usuario?.tipo === 'funcionario' ? (
              <form onSubmit={handleEditarReserva}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Nome do Evento</label>
                  <input
                    type="text"
                    value={reservaSelecionada.nome}
                    onChange={(e) => setReservaSelecionada({ ...reservaSelecionada, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Sobre</label>
                  <textarea
                    value={reservaSelecionada.sobre}
                    onChange={(e) => setReservaSelecionada({ ...reservaSelecionada, sobre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Quantidade de Pessoas</label>
                  <input
                    type="number"
                    value={reservaSelecionada.quantidade}
                    onChange={(e) => setReservaSelecionada({ ...reservaSelecionada, quantidade: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletarReserva}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition duration-300"
                  >
                    Deletar
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalEdicao(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition duration-300"
                  >
                    Fechar
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Você não tem permissão para editar esta reserva.</p>
                <button
                  onClick={() => setModalEdicao(false)}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition duration-300"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
