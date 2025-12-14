import { useContext, useState, useEffect } from "react";
import { generateAvatar } from "../utils/avatar";
import { GlobalContext } from "../variaveisGlobais";

// Componente de perfil e gerenciamento de usuários
export default function Usuario({ usuario, onLogout, showToast }) {
  // Dados do usuário atual
  const { idLocal, setId, tipoLocal, setTipo, nomeLocal, setNomeLocal } = useContext(GlobalContext);
  
  // Estados do componente
  const [todosUsuario, setTodosUsuarios] = useState([]); // Lista de todos usuários (somente admin)
  const [editandoDados, seteditandoDados] = useState(false); // Modo edição de perfil
  const [novoEmail, setNovoEmail] = useState(""); // Novo email (não usado no final)
  const [novaSenha, setnovaSenha] = useState(""); // Nova senha para atualização
  const [novoNome, setnovoNome] = useState(""); // Novo nome para atualização

  // Gera avatar baseado no nome
  const { inicial, cor } = generateAvatar(usuario?.nome || "");

  // Carrega todos os usuários quando componente é montado (apenas admin)
  useEffect(() => {
    pegarUsuarios();
  }, []);

  // Função placeholder para salvar email (não implementada)
  const handleSalvarEmail = () => {
    seteditandoDados(false);
    showToast("E-mail atualizado com sucesso!", "success");
  };

  // Busca todos os usuários do sistema (somente admin)
  async function pegarUsuarios() {
    if (tipoLocal !== "adm") {
      console.log("Usuário não é admin, não pode ver todos os usuários");
      return;
    }

    try {
      const resposta = await fetch(`http://192.168.100.58:5000/ListenUsuarios?idUsuario=${idLocal}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        showToast("Usuários carregados com sucesso", "success");
        setTodosUsuarios(dados.usuarios || []);
      } else {
        showToast("Erro ao carregar usuários", "error");
      }
    } catch (error) {
      console.log("Erro ao pegar dados", error);
      showToast("Erro ao carregar dados", "error");
    }
  }

  // Atualiza tipo de um usuário (admin → funcionário → usuário)
  async function atualizarTipo(idUsuario, novoTipo) {
    if (tipoLocal !== "adm") {
      return; // Somente admin pode alterar tipos
    }

    try {
      const resposta = await fetch(
        `http://192.168.100.58:5000/AtualizarUsuariosTipo?idUsuario=${idUsuario}&tipoNovo=${novoTipo}&idAdm=${idLocal}`,
        {
          method: "PATCH",
        }
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        showToast("Troca de tipo realizada com sucesso", "success");
        pegarUsuarios(); // Recarrega lista
        // Atualiza nome local se foi alterado
        if (novoNome != "") {
          usuario.nome = novoNome;
        }
        setnovaSenha("");
        setnovoNome("");
      } else {
        showToast(dados || "Erro ao atualizar dados", "error");
      }
    } catch (error) {
      showToast("Troca de tipo não realizada", "error");
      console.log("Erro ao trocar tipo do usuario", error);
    }
  }

  // Exclui um usuário (somente admin)
  async function deletarUsuario(idUsuario) {
    if (tipoLocal !== "adm") {
      return;
    }

    // Confirmação do usuário
    if(!window.confirm("Têm certeza que deseja excluir o usuario")){
      return;
    }

    try {
      const resposta = await fetch(
        `http://192.168.100.58:5000/DeleteUsuarios?idUsuario=${idUsuario}&idAdm=${idLocal}`,
        {
          method: "DELETE",
        }
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        showToast("Exlusao realizada com sucesso", "success");
        pegarUsuarios(); // Recarrega lista
      } else {
        showToast(dados || "Erro ao excluir usuario", "error");
      }
    } catch (error) {
      showToast("Exclusão de usuario não realizada", "error");
      console.log("Erro na exclusão de usuario do usuario", error);
    }
  }

  // Atualiza dados do próprio usuário (nome e/ou senha)
  async function atualizarDados() {
    // Valida se pelo menos um campo foi preenchido
    if (!novoNome && !novaSenha) {
      showToast("Tem que atualizar no minimo um dos dados para funcioanr");
      return;
    }

    // Valida força da senha (se foi informada)
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,50}$/;
    if (!regex.test(novaSenha) && novaSenha != "") {
      showToast("Senha muito fraca");
      return;
    }

    // Valida tamanho do nome (se foi informado)
    if (novoNome.length <= 3 && novoNome != "") {
      showToast("Nome muito curto");
      return;
    }

    try {
      const resposta = await fetch(
        `http://192.168.100.58:5000/AtualizarUsuariosDados?idUsuario=${idLocal}&novaSenha=${novaSenha}&novoNome=${novoNome}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        showToast("Troca de dados realizada com sucesso", "success");
        // Atualiza nome no contexto se foi alterado
        if (novoNome != "") {
          setNomeLocal(novoNome);
        }
        // Limpa campos
        setnovoNome("");
        setnovaSenha("");
      }
    } catch (error) {
      showToast("Troca de dados não realizada", "error");
      console.log("Erro ao trocar dados do usuario", error);
    }
  }

  // Retorna label amigável para o tipo de usuário
  const getTipoLabel = (tipo) => {
    const labels = {
      adm: "Administrador",
      funcionario: "Funcionário",
      usuario: "Usuário",
    };
    return labels[tipo] || tipo;
  };

  // Retorna classes CSS para estilizar cada tipo de usuário
  const getTipoColor = (tipo) => {
    const baseStyle = "px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase";
    const cores = {
      adm: `${baseStyle} bg-red-100 text-red-800`, // Vermelho para admin
      funcionario: `${baseStyle} bg-blue-100 text-blue-800`, // Azul para funcionário
      usuario: `${baseStyle} bg-gray-100 text-gray-800`, // Cinza para usuário
    };
    return cores[tipo] || `${baseStyle} bg-gray-100 text-gray-800`;
  };

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Card de Perfil */}
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-10 mb-8 border border-gray-100">
          <div className="flex items-start justify-between mb-8">
            <h1 className="text-3xl font-extrabold text-stone-800 border-b-2 border-amber-400 pb-2 inline-block">
              Perfil
            </h1>
            <button
              onClick={onLogout}
              className="text-red-600 hover:text-red-800 font-semibold py-2 px-4 rounded-lg transition duration-300 border border-red-200 hover:bg-red-50"
            >
              Sair
            </button>
          </div>

          {/* Avatar e Informações Básicas */}
          <div className="flex items-center gap-8 mb-8">
            <div
              className={`w-28 h-28 ${cor} rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white`}
            >
              {inicial}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-stone-900 mb-1">{nomeLocal}</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${getTipoColor(
                  usuario?.tipo
                )}`}
              >
                {getTipoLabel(usuario?.tipo)}
              </span>
            </div>
          </div>

          {/* Edição de Dados Pessoais */}
          <div className="pt-8 mt-8 border-t border-gray-200">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-stone-800 mb-4">Edição de Dados Pessoais</h3>
              
              {editandoDados ? (
                // Modo Edição Ativo
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setnovoNome(e.target.value)}
                    className="col-span-1 md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition duration-200"
                    placeholder="Digite seu novo Nome"
                  />
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setnovaSenha(e.target.value)}
                    className="col-span-1 md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition duration-200"
                    placeholder="Digite sua nova Senha"
                  />
                  <button
                    onClick={atualizarDados}
                    className="col-span-1 px-4 py-3 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      seteditandoDados(false);
                      setNovoEmail("");
                    }}
                    className="col-span-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                // Modo Visualização
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 transition duration-200">
                  <span className="text-gray-600 font-medium">{usuario?.email}</span>
                  <button
                    onClick={() => seteditandoDados(true)}
                    className="text-stone-800 hover:text-amber-600 font-semibold transition duration-200"
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Gerenciamento de Usuários (somente admin) */}
        {tipoLocal == "adm" && todosUsuario.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-10 border border-gray-100">
            <h2 className="text-2xl font-bold text-stone-800 mb-6 border-b border-gray-200 pb-3">
              Gerenciar Usuários ({todosUsuario.length})
            </h2>
            
            {/* Lista de Usuários */}
            <div className="space-y-4 divide-y divide-gray-100">
              {todosUsuario.map((u) => {
                const { inicial: inicialUsuario, cor: corUsuario } = generateAvatar(u.nome);
                
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-amber-50 transition duration-200 border border-gray-100 shadow-sm [@media(max-width:560px)]:flex-col  flex-row"
                  >
                    {/* Informações do Usuário */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${corUsuario} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md`}
                      >
                        {inicialUsuario}
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800">{u.nome}</h3>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    
                    {/* Controles de Administração */}
                    <div className="flex items-center gap-3">
                      {/* Seletor de Tipo */}
                      <select
                        value={u.tipo}
                        onChange={(e) => atualizarTipo(u.id, e.target.value)}
                        className={`px-4 py-2 rounded-lg font-semibold border-2 focus:outline-none focus:ring-2 focus:ring-amber-400 transition duration-200 ${getTipoColor(
                          u.tipo
                        )}`}
                        disabled={u.id === usuario?.id} // Não pode alterar próprio tipo
                      >
                        <option value="usuario">Usuário</option>
                        <option value="funcionario">Funcionário</option>
                        <option value="adm">Administrador</option>
                      </select>
                      
                      {/* Botão Excluir */}
                      <button
                        onClick={() => deletarUsuario(u.id)}
                        className="px-4 py-2 rounded-lg font-semibold border-2 focus:outline-none focus:ring-2 focus:ring-amber-400 transition duration-200 bg-red-300"
                        disabled={u.id === usuario?.id} // Não pode excluir a si mesmo
                      >
                        Excluir
                      </button>
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