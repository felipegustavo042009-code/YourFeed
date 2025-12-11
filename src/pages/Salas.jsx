import { useState } from 'react';
import { mockSalas } from '../data/mockData';

export default function Salas({ usuario, showToast }) {
  const [salas, setSalas] = useState(mockSalas);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaSala, setNovaSala] = useState({
    nome: '',
    sobre: '',
    categoria: 'sala',
    quantidadeMaxima: 10
  });

  const podeGerenciar = usuario?.tipo === 'adm';

  const handleCriarSala = (e) => {
    e.preventDefault();
    
    const sala = {
      id: (salas.length + 1).toString(),
      ...novaSala,
      imagem: '',
      quantidadeMaxima: parseInt(novaSala.quantidadeMaxima)
    };
    
    setSalas([...salas, sala]);
    setModalAberto(false);
    setNovaSala({ nome: '', sobre: '', categoria: 'sala', quantidadeMaxima: 10 });
    showToast('Sala criada com sucesso!', 'success');
  };

  const getCategoriaColor = (categoria) => {
    const cores = {
      sala: 'bg-blue-100 text-blue-800',
      esporte: 'bg-green-100 text-green-800',
      palestra: 'bg-purple-100 text-purple-800'
    };
    return cores[categoria] || 'bg-gray-100 text-gray-800';
  };

  const getCategoriaIcon = (categoria) => {
    const icons = {
      sala: '🏢',
      esporte: '⚽',
      palestra: '🎤'
    };
    return icons[categoria] || '📍';
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Salas e Espaços</h1>
        {podeGerenciar && (
          <button
            onClick={() => setModalAberto(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
          >
            + Nova Sala
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salas.map((sala) => (
          <div key={sala.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-6xl">
              {getCategoriaIcon(sala.categoria)}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{sala.nome}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoriaColor(sala.categoria)}`}>
                  {sala.categoria}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{sala.sobre}</p>
              <div className="flex items-center text-gray-700">
                <span className="text-2xl mr-2">👥</span>
                <span className="font-semibold">Capacidade: {sala.quantidadeMaxima}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nova Sala</h2>
            <form onSubmit={handleCriarSala}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Nome</label>
                <input
                  type="text"
                  value={novaSala.nome}
                  onChange={(e) => setNovaSala({ ...novaSala, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Sobre</label>
                <textarea
                  value={novaSala.sobre}
                  onChange={(e) => setNovaSala({ ...novaSala, sobre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Categoria</label>
                <select
                  value={novaSala.categoria}
                  onChange={(e) => setNovaSala({ ...novaSala, categoria: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sala">Sala</option>
                  <option value="esporte">Esporte</option>
                  <option value="palestra">Palestra</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Capacidade Máxima</label>
                <input
                  type="number"
                  value={novaSala.quantidadeMaxima}
                  onChange={(e) => setNovaSala({ ...novaSala, quantidadeMaxima: e.target.value })}
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
    </div>
  );
}
