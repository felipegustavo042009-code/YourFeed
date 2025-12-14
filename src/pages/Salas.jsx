import { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../variaveisGlobais';

// Componente para gerenciar salas
export default function Salas({ showToast }) {
  // Estados principais
  const [salas, setSalas] = useState([]); // Lista de salas
  const [modalAberto, setModalAberto] = useState(false); // Modal criar sala
  const [modalEditarAberto, setModalEditarAberto] = useState(false); // Modal editar sala
  const [salaSelecionada, setSalaSelecionada] = useState(null); // Sala sendo editada
  const [loading, setLoading] = useState(true); // Estado carregamento
  const [imagemBase64, setImagemBase64] = useState(null); // Imagem em Base64
  const [previewImagem, setPreviewImagem] = useState(null); // Preview da imagem

  // Dados da nova sala
  const [novaSala, setNovaSala] = useState({
    nome: '',
    sobre: '',
    categoria: 'sala',
    quantidadeMaxima: 10
  });

  // Dados da sala sendo editada
  const [salaEditando, setSalaEditando] = useState({
    id: '',
    nome: '',
    sobre: '',
    categoria: 'sala',
    quantidadeMaxima: 10
  });

  // Verifica permissões do usuário
  const { idLocal, tipoLocal } = useContext(GlobalContext);
  const podeGerenciar = tipoLocal === 'adm'; // Só admin pode gerenciar

  // Carrega salas ao iniciar
  useEffect(() => {
    carregarSalas();
  }, []);

  // Busca salas da API
  const carregarSalas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/ListarSala');
      if (!response.ok) throw new Error('Erro ao carregar salas');
      
      const data = await response.json();
      setSalas(data.salas || []);
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao carregar salas', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cria nova sala
  const criarSala = async (e) => {
    e.preventDefault();
    
    if (!podeGerenciar) {
      showToast('Sem permissão para criar sala', 'error');
      return;
    }

    try {
      // Preparar dados para enviar
      const dadosParaEnviar = {
        imagemBase64: imagemBase64
      };

      // Parâmetros da requisição
      const queryParams = new URLSearchParams({
        idUsuarios: idLocal,
        nome: novaSala.nome,
        sobre: novaSala.sobre || '',
        tipo: novaSala.categoria,
        quantidadeMaxima: novaSala.quantidadeMaxima.toString()
      });

      const response = await fetch(`/CriarSala?${queryParams}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensagem || 'Erro ao criar sala');
      }

      await carregarSalas(); // Recarrega lista
      
      setModalAberto(false);
      resetarFormulario(); // Limpa formulário
      showToast('Sala criada com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      showToast(error.message || 'Erro ao criar sala', 'error');
    }
  };

  // Abre modal para editar sala
  const abrirModalEditar = (sala) => {
    setSalaSelecionada(sala);
    setSalaEditando({
      id: sala.id,
      nome: sala.nome,
      sobre: sala.sobre || '',
      categoria: sala.categoria,
      quantidadeMaxima: sala.quantidadeMaxima
    });
    setPreviewImagem(sala.imagem); // Carrega imagem atual (Base64)
    setModalEditarAberto(true);
  };

  // Atualiza dados da sala
  const atualizarSala = async (e) => {
    e.preventDefault();
    
    if (!podeGerenciar) {
      showToast('Sem permissão para atualizar sala', 'error');
      return;
    }

    try {
      // Preparar dados para enviar
      const dadosParaEnviar = {
        imagemBase64: imagemBase64 || salaSelecionada.imagem
      };

      const queryParams = new URLSearchParams({
        idUsuario: idLocal,
        idSala: salaEditando.id,
        nome: salaEditando.nome,
        sobre: salaEditando.sobre || '',
        quantidadeMaxima: salaEditando.quantidadeMaxima.toString()
      });

      const response = await fetch(`/AtualizarSala?${queryParams}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensagem || 'Erro ao atualizar sala');
      }

      await carregarSalas(); // Recarrega lista
      
      setModalEditarAberto(false);
      resetarFormulario(); // Limpa formulário
      showToast('Sala atualizada com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao atualizar sala:', error);
      showToast(error.message || 'Erro ao atualizar sala', 'error');
    }
  };

  // Exclui sala
  const deletarSala = async (idSala) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita.')) {
      return;
    }

    if (!podeGerenciar) {
      showToast('Sem permissão para excluir sala', 'error');
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        idUsuario: idLocal,
        idSala: idSala
      });

      const response = await fetch(`/DeletarSala?${queryParams}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensagem || 'Erro ao excluir sala');
      }

      await carregarSalas(); // Recarrega lista
      showToast('Sala excluída com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao excluir sala:', error);
      showToast(error.message || 'Erro ao excluir sala', 'error');
    }
  };

  // Limpa formulários e estados
  const resetarFormulario = () => {
    setNovaSala({
      nome: '',
      sobre: '',
      categoria: 'sala',
      quantidadeMaxima: 10
    });
    setSalaEditando({
      id: '',
      nome: '',
      sobre: '',
      categoria: 'sala',
      quantidadeMaxima: 10
    });
    setImagemBase64(null);
    setPreviewImagem(null);
    setSalaSelecionada(null);
  };

  // Processa upload de imagem e converte para Base64
  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Valida tipo de arquivo
      if (!file.type.match('image.*')) {
        showToast('Por favor, selecione apenas imagens', 'error');
        return;
      }

      // Valida tamanho (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5MB', 'error');
        return;
      }

      // Converte para Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagemBase64(base64String);
        setPreviewImagem(base64String); // Para preview
      };
      reader.onerror = () => {
        showToast('Erro ao ler a imagem', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  // Obtém URL da imagem da sala
  const getImagemSala = (sala) => {
    if (sala.imagem) {
      // Se a imagem já está em Base64, retorna diretamente
      return sala.imagem;
    }
    return null; // Sem imagem
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Cabeçalho */}
      <header className="p-4 md:p-8 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Salas e Espaços
          </h1>
          {podeGerenciar && (
            <button
              onClick={() => { setModalAberto(true); resetarFormulario(); }}
              className="flex items-center gap-2 py-2 px-6 text-lg font-bold rounded-xl"
            >
              <span className="text-xl">+</span> Nova Sala
            </button>
          )}
        </div>
      </header>

      {/* Lista de Salas */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4"></div>
            <p className="mt-4 text-lg font-semibold">Carregando salas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {salas.map((sala) => (
              <div key={sala.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                
                {/* Imagem da Sala */}
                <div className="relative h-48 overflow-hidden">
                  {getImagemSala(sala) ? (
                    <img 
                      src={getImagemSala(sala)} 
                      alt={sala.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      <span className="text-7xl">🏢</span>
                    </div>
                  )}
                  
                  {/* Botões de ação (somente admin) */}
                  {podeGerenciar && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="flex gap-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => abrirModalEditar(sala)}
                          className="bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg"
                          title="Editar sala"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deletarSala(sala.id)}
                          className="bg-white/90 hover:bg-white text-red-600 p-3 rounded-full shadow-lg"
                          title="Excluir sala"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Informações da Sala */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{sala.nome}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100">
                      {sala.categoria}
                    </span>
                  </div>
                  <p className="text-sm mb-4 text-gray-600">{sala.sobre}</p>
                  
                  <div className="flex items-center text-sm font-semibold">
                    <span className="text-lg mr-2">👥</span>
                    <span>Capacidade: {sala.quantidadeMaxima}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Mensagem se não houver salas */}
            {salas.length === 0 && (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xl font-semibold">Nenhuma sala encontrada.</p>
                <p className="text-sm mt-2 text-gray-600">
                  {podeGerenciar ? 'Clique em "+ Nova Sala" para começar.' : 'Aguarde o administrador cadastrar as salas.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Criar Nova Sala */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Criar Nova Sala</h2>
              <button onClick={() => { setModalAberto(false); resetarFormulario(); }}>
                ✕
              </button>
            </div>
            
            <form onSubmit={criarSala}>
              {/* Nome */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Nome *</label>
                <input
                  type="text"
                  value={novaSala.nome}
                  onChange={(e) => setNovaSala({ ...novaSala, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              {/* Descrição */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Sobre</label>
                <textarea
                  value={novaSala.sobre}
                  onChange={(e) => setNovaSala({ ...novaSala, sobre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              
              {/* Categoria */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Categoria *</label>
                <select
                  value={novaSala.categoria}
                  onChange={(e) => setNovaSala({ ...novaSala, categoria: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="sala">Sala</option>
                  <option value="esporte">Esporte</option>
                  <option value="palestra">Palestra</option>
                  <option value="reuniao">Reunião</option>
                </select>
              </div>
              
              {/* Capacidade */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Capacidade Máxima *</label>
                <input
                  type="number"
                  value={novaSala.quantidadeMaxima}
                  onChange={(e) => setNovaSala({ ...novaSala, quantidadeMaxima: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  required
                />
              </div>

              {/* Upload de Imagem */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Imagem da Sala</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagemChange}
                    className="hidden"
                    id="imagemInput"
                  />
                  <label htmlFor="imagemInput" className="cursor-pointer block">
                    {previewImagem ? (
                      <div>
                        <img 
                          src={previewImagem} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <p className="text-sm text-blue-600">Clique para alterar a imagem</p>
                      </div>
                    ) : (
                      <div className="py-8">
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-sm text-gray-600">Clique para selecionar uma imagem</p>
                        <p className="text-xs text-gray-500 mt-1">Máximo 5MB • JPG, PNG, GIF</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              {/* Botões */}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 text-lg font-bold rounded-xl bg-yellow-500 text-white"
                >
                  Criar Sala
                </button>
                <button
                  type="button"
                  onClick={() => { setModalAberto(false); resetarFormulario(); }}
                  className="flex-1 py-3 px-4 text-lg font-semibold rounded-xl bg-gray-100 text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Sala */}
      {modalEditarAberto && salaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Editar Sala</h2>
              <button onClick={() => { setModalEditarAberto(false); resetarFormulario(); }}>
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-3 rounded-lg bg-yellow-50">
              <p className="text-sm">Editando: <span className="font-semibold">{salaSelecionada.nome}</span></p>
            </div>
            
            <form onSubmit={atualizarSala}>
              {/* Nome */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Nome *</label>
                <input
                  type="text"
                  value={salaEditando.nome}
                  onChange={(e) => setSalaEditando({ ...salaEditando, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              {/* Descrição */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Sobre</label>
                <textarea
                  value={salaEditando.sobre}
                  onChange={(e) => setSalaEditando({ ...salaEditando, sobre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              
              {/* Categoria (apenas leitura) */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Categoria</label>
                <div className="px-4 py-2 border rounded-lg bg-gray-50">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100">
                    {salaEditando.categoria}
                  </span>
                  <p className="text-xs text-gray-600 mt-1">A categoria não pode ser alterada</p>
                </div>
              </div>
              
              {/* Capacidade */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Capacidade Máxima *</label>
                <input
                  type="number"
                  value={salaEditando.quantidadeMaxima}
                  onChange={(e) => setSalaEditando({ ...salaEditando, quantidadeMaxima: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  required
                />
              </div>

              {/* Upload de Imagem */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Imagem da Sala</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagemChange}
                    className="hidden"
                    id="imagemInputEditar"
                  />
                  <label htmlFor="imagemInputEditar" className="cursor-pointer block">
                    {previewImagem ? (
                      <div>
                        <img 
                          src={previewImagem} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <p className="text-sm text-blue-600">Nova imagem selecionada. Clique para alterar.</p>
                      </div>
                    ) : salaSelecionada.imagem ? (
                      <div>
                        <img 
                          src={salaSelecionada.imagem} 
                          alt="Imagem atual"
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <p className="text-sm text-gray-600">Imagem atual. Clique para substituir.</p>
                      </div>
                    ) : (
                      <div className="py-8">
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-sm text-gray-600">Nenhuma imagem. Clique para adicionar.</p>
                        <p className="text-xs text-gray-500 mt-1">Máximo 5MB • JPG, PNG, GIF</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              {/* Botões */}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 text-lg font-bold rounded-xl bg-blue-600 text-white"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => { setModalEditarAberto(false); resetarFormulario(); }}
                  className="flex-1 py-3 px-4 text-lg font-semibold rounded-xl bg-gray-100 text-gray-700"
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