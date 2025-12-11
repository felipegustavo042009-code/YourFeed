import { useState } from 'react';
import { mockUsuarios } from '../data/mockData';
import { generateAvatar } from '../utils/avatar';

export default function Usuario({ usuario, onLogout, showToast }) {
  const [usuarios, setUsuarios] = useState(mockUsuarios);
  const [editandoEmail, setEditandoEmail] = useState(false);
  const [novoEmail, setNovoEmail] = useState(usuario?.email || '');

  const isAdmin = usuario?.tipo === 'adm';
  const { inicial, cor } = generateAvatar(usuario?.nome || '');

  const handleSalvarEmail = () => {
    setEditandoEmail(false);
    showToast('E-mail atualizado com sucesso!', 'success');
  };

  const handleAlterarTipo = (idUsuario, novoTipo) => {
    setUsuarios(usuarios.map(u => 
      u.id === idUsuario ? { ...u, tipo: novoTipo } : u
    ));
    showToast('Tipo de usuário alterado!', 'success');
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      adm: 'Administrador',
      funcionario: 'Funcionário',
      usuario: 'Usuário'
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo) => {
    const cores = {
      adm: 'bg-red-100 text-red-800',
      funcionario: 'bg-blue-100 text-blue-800',
      usuario: 'bg-gray-100 text-gray-800'
    };
    return cores[tipo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
            >
              Sair
            </button>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div className={`w-24 h-24 ${cor} rounded-full flex items-center justify-center text-white text-4xl font-bold`}>
              {inicial}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{usuario?.nome}</h2>
              <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getTipoColor(usuario?.tipo)}`}>
                {getTipoLabel(usuario?.tipo)}
              </span>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">E-mail</label>
              {editandoEmail ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSalvarEmail}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition duration-300"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setEditandoEmail(false);
                      setNovoEmail(usuario?.email || '');
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg transition duration-300"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{usuario?.email}</span>
                  <button
                    onClick={() => setEditandoEmail(true)}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gerenciar Usuários</h2>
            <div className="space-y-4">
              {usuarios.map((u) => {
                const { inicial: inicialUsuario, cor: corUsuario } = generateAvatar(u.nome);
                return (
                  <div key={u.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${corUsuario} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                        {inicialUsuario}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{u.nome}</h3>
                        <p className="text-sm text-gray-600">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={u.tipo}
                        onChange={(e) => handleAlterarTipo(u.id, e.target.value)}
                        className={`px-4 py-2 rounded-lg font-semibold border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getTipoColor(u.tipo)}`}
                        disabled={u.id === usuario?.id}
                      >
                        <option value="usuario">Usuário</option>
                        <option value="funcionario">Funcionário</option>
                        <option value="adm">Administrador</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
