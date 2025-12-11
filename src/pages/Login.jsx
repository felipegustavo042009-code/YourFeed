import { use, useState } from "react";
import { mockUsuarios } from "../data/mockData";

export default function Login({ onLogin, onVoltar, showToast }) {
  const [etapa, setEtapa] = useState("login");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [senha, setsenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState("");
  const [loginOuCadastro, setLoadingOuCadastro] = useState(false);

  const handleEnviarEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    showToast("Enviando código...", "info");

    setTimeout(() => {
      const codigoGerado = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      setCodigoEnviado(codigoGerado);
      setEtapa("codigo");
      setLoading(false);
      showToast(`Código enviado: ${codigoGerado}`, "success");
    }, 1500);
  };

  async function criarUsuario() {}

  const handleValidarCodigo = async (e) => {
    e.preventDefault();
    setLoading(true);
    showToast("Validando código...", "info");

    setTimeout(() => {
      if (codigo === codigoEnviado) {
        const usuario = mockUsuarios.find((u) => u.email === email);
        if (usuario) {
          showToast("Login realizado com sucesso!", "success");
          onLogin(usuario);
        } else {
          showToast("Usuário não encontrado", "error");
        }
      } else {
        showToast("Código inválido", "error");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <button
          onClick={onVoltar}
          className="text-gray-600 hover:text-gray-800 mb-6 flex items-center"
          style={{
            background: "#2334",
            borderRadius: 60,
            fontSize: 20,
            width: 30,
            height: 30,
            textAlign: "center",
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
          <form onSubmit={handleEnviarEmail}>
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
                value={email}
                onChange={(e) => setsenha(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Código"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setEtapa("cadastro")}
              style={{ textAlign: "center", width: "100%" }}
            >
              Cadastrar
            </button>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Usuários de teste:</p>
              <p className="text-xs text-gray-500">admin@exemplo.com (Admin)</p>
              <p className="text-xs text-gray-500">
                joao@exemplo.com (Funcionário)
              </p>
              <p className="text-xs text-gray-500">
                maria@exemplo.com (Usuário)
              </p>
            </div>
          </form>
        ) : etapa === "cadastro" ? (
          <form onSubmit={handleEnviarEmail}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Nome</label>
              <input
                type="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Seu nome"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
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
              <label className="block text-gray-700 font-semibold mb-2">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setsenha(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ssenha1234"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Código"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEtapa("login");
                console.log(etapa);
              }}
              style={{ textAlign: "center", width: "100%" }}
            >
              Login
            </button>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Usuários de teste:</p>
              <p className="text-xs text-gray-500">admin@exemplo.com (Admin)</p>
              <p className="text-xs text-gray-500">
                joao@exemplo.com (Funcionário)
              </p>
              <p className="text-xs text-gray-500">
                maria@exemplo.com (Usuário)
              </p>
            </div>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? "Validando..." : "Confirmar"}
            </button>

            <button
              type="button"
              onClick={() => setEtapa("login")}
              className="w-full mt-3 text-gray-600 hover:text-gray-800 font-semibold py-2"
            >
              Alterar e-mail
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
