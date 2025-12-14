import { useState, useContext } from "react";
import { GlobalContext } from "../variaveisGlobais";

// Componente de Login/Cadastro
export default function Login({ onLogin, onVoltar, showToast }) {
  // Dados globais do usuário
  const { idLocal, setId, tipoLocal, setTipo, setNomeLocal, nomeLocal } = useContext(GlobalContext);

  // Estados do formulário
  const [etapa, setEtapa] = useState("login"); // login, cadastro ou codigo
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState(""); // Código de verificação

  // Estados para mensagens de erro/validação
  const [textErroNome, setTextErroNome] = useState("");
  const [textErroEmail, setTextErroEmail] = useState("");
  const [textErroSenha, setTextErroSenha] = useState("");

  const [loading, setLoading] = useState(false); // Estado de carregamento

  // Regras de validação
  const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,60}$/;
  const regexEmail = /^[A-Za-z0-9._%+-]+@(gmail\.com|outlook\.com)$/;
  const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,50}$/;

  // Valida dados do cadastro
  const validarCadastro = () => {
    // Valida nome
    if (!regexNome.test(nome)) {
      setTextErroNome("✗ Nome inválido. Use apenas letras e espaços (2–60 caracteres)");
      return false;
    }
    setTextErroNome("✓ Nome válido");

    // Valida email
    if (!email.trim()) {
      setTextErroEmail("✗ Email é obrigatório");
      return false;
    }

    if (!regexEmail.test(email) || email.length > 100) {
      setTextErroEmail("✗ Email inválido ou muito longo (máx. 100 caracteres)");
      return false;
    }
    setTextErroEmail("✓ Email válido");

    // Valida senha
    if (!regexSenha.test(senha)) {
      setTextErroSenha("✗ Senha inválida. Deve ter 6–50 caracteres, 1 maiúscula, 1 minúscula e 1 número");
      return false;
    }
    setTextErroSenha("✓ Senha válida");
    return true;
  };

  // Envia token para email (cadastro)
  const handleEnviarToken = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Valida dados antes de enviar
    if (etapa === "cadastro") {
      if (!validarCadastro()) {
        showToast("Corrija os erros antes de continuar", "error");
        setLoading(false);
        return;
      }
    }

    // Chama API para enviar token
    try {
      const response = await fetch(`http://192.168.100.58:5000/enviar-token?email=${email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Token enviado com sucesso!", "success");
        setEtapa("codigo"); // Vai para etapa de código
      } else {
        showToast(data.error || "Erro ao enviar token", "error");
      }
    } catch (error) {
      showToast("Erro ao conectar com o servidor", "error");
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  // Faz login do usuário
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Verifica se campos estão preenchidos
    if (!email || !senha) {
      showToast("Preencha email e senha", "error");
      setLoading(false);
      return;
    }

    // Chama API de login
    try {
      const response = await fetch(`http://192.168.100.58:5000/LoginUsuario?Email=${email}&Senha=${senha}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Login realizado com sucesso!", "success");
        // Salva dados do usuário no contexto global
        setId(data.id);
        setTipo(data.tipo);
        setNomeLocal(data.nome);
        onLogin(data); // Notifica componente pai
      } else {
        showToast(data || "Credenciais inválidas", "error");
      }
    } catch (error) {
      showToast("Erro ao conectar com o servidor", "error");
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  // Valida código de verificação e cria conta
  const handleValidarCodigo = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Chama API para validar código e criar conta
    try {
      const response = await fetch(`http://192.168.100.58:5000/RegisterUsuarios-validarToken?email=${email}&senha=${senha}&nome=${nome}&token=${codigo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Conta criada com sucesso! Faça login", "success");
        setEtapa("login"); // Volta para login
        // Salva dados do novo usuário
        setId(data.id);
        setTipo(data.tipo);
        setNomeLocal(data.nome);
        // Limpa formulário
        setNome("");
        setSenha("");
        setCodigo("");
      } else {
        showToast(data.error || "Erro ao criar conta", "error");
      }
    } catch (error) {
      showToast("Erro ao conectar com o servidor", "error");
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden flex items-center justify-center">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F4D35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#5C4033] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">

          {/* Lado esquerdo - Mensagem/Informações */}
          <div className="hidden lg:flex flex-col justify-center items-start max-w-md">
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-white mb-4">
                Bem-vindo ao <span className="text-[#F4D35E]">Sistema</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Gerencie suas reservas de forma simples, rápida e eficiente. Acesso seguro e interface intuitiva para sua comodidade.
              </p>
            </div>

            {/* Lista de benefícios */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F4D35E] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#3E2A21] font-bold text-sm">✓</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Segurança Garantida</p>
                  <p className="text-gray-400 text-sm">Autenticação com verificação por código</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F4D35E] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#3E2A21] font-bold text-sm">✓</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Interface Moderna</p>
                  <p className="text-gray-400 text-sm">Design limpo e responsivo para todos os dispositivos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F4D35E] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#3E2A21] font-bold text-sm">✓</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Suporte Profissional</p>
                  <p className="text-gray-400 text-sm">Equipe dedicada para ajudá-lo sempre</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário */}
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-2 backdrop-blur-sm" style={{ paddingLeft: '20px', paddingRight: '20px' }}>

              {/* Botão Voltar */}
              <button
                onClick={onVoltar}
                className="mb-3 p-2 hover:bg-gray-100 rounded-lg transition duration-300 text-[#5C4033] font-bold text-lg"
                title="Voltar"
              >
                ← Voltar
              </button>

              {/* Título baseado na etapa */}
              <div className="mb-5">
                <h2 className="text-3xl font-bold text-[#5C4033] mb-2">
                  {etapa === "login"
                    ? "Entrar"
                    : etapa === "cadastro"
                      ? "Cadastro"
                      : "Verificar Código"}
                </h2>
                <p className="text-[#6B7280] text-sm">
                  {etapa === "login"
                    ? "Acesse sua conta com segurança"
                    : etapa === "cadastro"
                      ? "Crie sua conta em alguns passos"
                      : "Insira o código enviado para seu email"}
                </p>
              </div>

              {/* Formulário de Login */}
              {etapa === "login" ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 placeholder-gray-500 transition duration-200"
                      placeholder="seu@email.com"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                      Senha
                    </label>
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 placeholder-gray-500 transition duration-200"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#F4D35E] hover:bg-[#F6E7A1] text-[#3E2A21] font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#3E2A21] border-t-transparent rounded-full animate-spin"></div>
                        Entrando...
                      </span>
                    ) : (
                      "Entrar"
                    )}
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-[#6B7280]">ou</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setEtapa("cadastro");
                      setSenha("");
                      setTextErroNome("");
                      setTextErroEmail("");
                      setTextErroSenha("");
                    }}
                    className="w-full text-[#5C4033] hover:text-[#3E2A21] font-semibold py-3 border border-gray-200 rounded-lg transition duration-300 hover:bg-gray-50"
                  >
                    Criar nova conta
                  </button>
                </form>
              ) : etapa === "cadastro" ? (
                // Formulário de Cadastro
                <form onSubmit={handleEnviarToken} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 placeholder-gray-500 transition duration-200"
                      placeholder="Seu nome completo"
                      required
                      disabled={loading}
                    />
                    {textErroNome && (
                      <span className={`text-xs mt-2 block ${textErroNome.includes("✓") ? "text-green-600" : "text-red-600"}`}>
                        {textErroNome}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 placeholder-gray-500 transition duration-200"
                      placeholder="seu@email.com"
                      required
                      disabled={loading}
                    />
                    {textErroEmail && (
                      <span className={`text-xs mt-2 block ${textErroEmail.includes("✓") ? "text-green-600" : "text-red-600"}`}>
                        {textErroEmail}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                      Senha
                    </label>
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 placeholder-gray-500 transition duration-200"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    {textErroSenha && (
                      <span className={`text-xs mt-2 block ${textErroSenha.includes("✓") ? "text-green-600" : "text-red-600"}`}>
                        {textErroSenha}
                      </span>
                    )}
                    <p className="text-xs text-[#6B7280] mt-2">
                      Mínimo 6 caracteres, 1 maiúscula, 1 minúscula e 1 número
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#F4D35E] hover:bg-[#F6E7A1] text-[#3E2A21] font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#3E2A21] border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                      </span>
                    ) : (
                      "Enviar Código de Verificação"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEtapa("login");
                      setNome("");
                      setEmail("");
                      setSenha("");
                      setTextErroNome("");
                      setTextErroEmail("");
                      setTextErroSenha("");
                    }}
                    className="w-full text-[#5C4033] hover:text-[#3E2A21] font-semibold py-3 border border-gray-200 rounded-lg transition duration-300 hover:bg-gray-50"
                  >
                    Voltar para login
                  </button>
                </form>
              ) : (
                // Formulário de Código de Verificação
                <form onSubmit={handleValidarCodigo} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                      Código de Verificação
                    </label>
                    <input
                      type="text"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                      className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4D35E] focus:border-transparent bg-white text-gray-800 placeholder-gray-500 transition duration-200 text-center text-2xl tracking-widest font-semibold"
                      placeholder="000000"
                      maxLength={6}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-[#6B7280] mt-3 text-center">
                      Insira o código de 6 dígitos enviado para seu email
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#F4D35E] hover:bg-[#F6E7A1] text-[#3E2A21] font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#3E2A21] border-t-transparent rounded-full animate-spin"></div>
                        Validando...
                      </span>
                    ) : (
                      "Criar Conta"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEtapa("cadastro");
                      setCodigo("");
                    }}
                    className="w-full text-[#5C4033] hover:text-[#3E2A21] font-semibold py-3 border border-gray-200 rounded-lg transition duration-300 hover:bg-gray-50"
                  >
                    Voltar para cadastro
                  </button>
                </form>
              )}

              {/* Rodapé */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-[#6B7280] text-center">
                  Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}