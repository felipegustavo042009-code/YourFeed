import { useState } from "react";

export default function Login({ onLogin, onVoltar, showToast }) {
  const [etapa, setEtapa] = useState("login");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState("");

  const [textErroNome, setTextErroNome] = useState('');
  const [textErroEmail, setTextErroEmail] = useState('');
  const [textErroSenha, setTextErroSenha] = useState('');

  const [loading, setLoading] = useState(false);

  const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,60}$/;
  const regexEmail = /^[A-Za-z0-9._%+-]+@(gmail\.com|outlook\.com)$/;
  const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,50}$/;

  const validarCadastro = () => {
    if (!regexNome.test(nome)) {
      setTextErroNome("✗ Nome inválido. Use apenas letras e espaços (2–60 caracteres)");
      return false;
    }
    setTextErroNome("✓ Nome válido");

    if (!email.trim()) {
      setTextErroEmail("✗ Email é obrigatório");
      return false;
    }

    if (!regexEmail.test(email) || email.length > 100) {
      setTextErroEmail("✗ Email inválido ou muito longo (máx. 100 caracteres)");
      return false;
    }
    setTextErroEmail("✓ Email válido");

    if (!regexSenha.test(senha)) {
      setTextErroSenha("✗ Senha inválida. Deve ter 6–50 caracteres, 1 maiúscula, 1 minúscula e 1 número");
      return false;
    }
    setTextErroSenha("✓ Senha válida");
    return true;
  };

  const handleEnviarToken = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (etapa === "cadastro") {
      if (!validarCadastro()) {
        showToast("Corrija os erros antes de continuar", "error");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`http://192.168.100.58:5000/enviar-token?email=${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Token enviado com sucesso!", "success");
        setEtapa("codigo");
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !senha) {
      showToast("Preencha email e senha", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://192.168.100.58:5000/LoginUsuario?Email=${email}&Senha=${senha}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Login realizado com sucesso!", "success");
        onLogin(data);
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

  const handleValidarCodigo = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://192.168.100.58:5000/RegisterUsuarios-validarToken?email=${email}&senha=${senha}&nome=${nome}&token=${codigo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Conta criada com sucesso! Faça login", "success");
        setEtapa("login");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <button
          onClick={onVoltar}
          className="text-gray-600 hover:text-gray-800 mb-6 flex items-center justify-center"
          style={{
            background: "#f0f0f0",
            borderRadius: "50%",
            fontSize: "20px",
            width: "30px",
            height: "30px",
          }}
        >
          ←
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {etapa === "login"
            ? "Entrar"
            : etapa === "cadastro"
              ? "Cadastro"
              : "Validar Código"}
        </h2>

        {etapa === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite sua senha"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50 mb-3"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
            
            <button
              type="button"
              onClick={handleEnviarToken}
              disabled={loading}
              className="w-full text-blue-600 hover:text-blue-800 font-semibold py-2"
            >
              Esqueci minha senha
            </button>
            
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
              className="w-full text-blue-600 hover:text-blue-800 font-semibold py-2 mt-2"
            >
              Cadastrar nova conta
            </button>
          </form>
        ) : etapa === "cadastro" ? (
          <form onSubmit={handleEnviarToken}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Seu nome completo"
                required
                disabled={loading}
              />
              <span className={`text-sm mt-1 ${textErroNome.includes("✓") ? "text-green-600" : "text-red-600"}`}>
                {textErroNome}
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
              <span className={`text-sm mt-1 ${textErroEmail.includes("✓") ? "text-green-600" : "text-red-600"}`}>
                {textErroEmail}
              </span>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Senha1234"
                required
                disabled={loading}
              />
              <span className={`text-sm mt-1 ${textErroSenha.includes("✓") ? "text-green-600" : "text-red-600"}`}>
                {textErroSenha}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50 mb-3"
            >
              {loading ? "Enviando..." : "Enviar Código"}
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
              className="w-full text-blue-600 hover:text-blue-800 font-semibold py-2"
            >
              Já tenho conta (Login)
            </button>
          </form>
        ) : (
          <form onSubmit={handleValidarCodigo}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Código de Verificação
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                placeholder="XXXXXX"
                maxLength={6}
                required
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Insira o código enviado para seu email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? "Validando..." : "Criar Conta"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEtapa("cadastro");
                setCodigo("");
              }}
              className="w-full mt-3 text-gray-600 hover:text-gray-800 font-semibold py-2"
            >
              Voltar para cadastro
            </button>
          </form>
        )}
      </div>
    </div>
  );
}