export default function Home({ onEntrar, onVerSalas }) {
  // Cores usadas na página
  const brownMain = '#5C4033';
  const brownDark = '#3E2A21';
  const yellowCta = '#F4D35E';
  const yellowSoft = '#F6E7A1';
  const graySecondary = '#6B7280';

  // Componente que mostra uma prévia visual do sistema
  const MockupVisual = () => (
    <div className="relative p-4 md:p-8">
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-300/50"></div>
      
      <div className="relative h-64 md:h-96 border border-gray-200 rounded-2xl overflow-hidden shadow-inner">
        <div className="flex h-full">
          <div className="w-1/4 bg-gray-50 p-3">
            <div className="h-2 w-3/4 bg-gray-300 rounded mb-4"></div>
            <div className="h-2 w-1/2 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 w-2/3 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 w-1/3 bg-gray-200 rounded"></div>
          </div>
          <div className="w-3/4 p-4">
            <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 bg-yellow-cta/70 rounded"></div>
              <div className="h-16 bg-yellow-cta/70 rounded"></div>
              <div className="h-16 bg-yellow-cta/70 rounded"></div>
            </div>
            <div className="mt-4 h-24 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente para cada card de funcionalidade
  const FeatureCard = ({ icon, title, description }) => (
    <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100">
      <div className="mb-4 w-10 h-10 flex items-center justify-center rounded-full" style={{ backgroundColor: yellowSoft }}>
        <span className="text-xl" style={{ color: brownMain }}>{icon}</span>
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: brownMain }}>{title}</h3>
      <p className="text-base" style={{ color: graySecondary }}>{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Seção principal com título e botões */}
      <section className="relative pt-20 pb-40 md:pt-32 md:pb-56 overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-full" 
          style={{ 
            backgroundColor: yellowSoft, 
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0% 100%)',
            zIndex: 0,
            opacity: 0.3
          }}
        ></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4" style={{ color: brownMain }}>
                Sistema de <br className="hidden sm:inline"/>
                <span className="relative inline-block">
                  <span className="z-10 relative">Reservas</span>
                  <span className="absolute bottom-0 left-0 w-full h-2 md:h-3" style={{ backgroundColor: yellowCta, opacity: 0.6, transform: 'translateY(-2px)' }}></span>
                </span>
              </h1>
              
              <p className="mt-6 text-xl max-w-lg mx-auto md:mx-0" style={{ color: graySecondary }}>
                Gerencie salas, eventos e reservas de forma **simples e eficiente**, transformando a organização do seu espaço.
              </p>
              
              {/* Botões principais */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={onEntrar}
                  className="py-3 px-8 text-lg font-bold rounded-xl transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  style={{ 
                    backgroundColor: yellowCta, 
                    color: brownDark, 
                    border: `2px solid ${brownDark}` 
                  }}
                >
                  Entrar
                </button>
                <button
                  onClick={onVerSalas}
                  className="py-3 px-8 text-lg font-semibold rounded-xl transition duration-300 shadow-md hover:shadow-lg"
                  style={{ 
                    backgroundColor: 'white', 
                    color: brownMain, 
                    border: `2px solid ${brownMain}` 
                  }}
                >
                  Ver Salas sem Login
                </button>
              </div>
            </div>
            
            {/* Mostra a prévia visual em telas grandes */}
            <div className="hidden md:block">
              <MockupVisual />
            </div>
            
          </div>
        </div>
      </section>

      {/* Seção de funcionalidades */}
      <section className="relative z-20 -mt-20 md:-mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-gray-300/50 border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: brownDark }}>
            Recursos que Impulsionam sua Organização
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="📅" 
              title="Reservas Fáceis" 
              description="Faça reservas de salas e espaços com apenas alguns cliques, através de uma interface intuitiva e rápida." 
            />
            <FeatureCard 
              icon="🏢" 
              title="Gestão Completa" 
              description="Visualize a disponibilidade e gerencie a ocupação de todos os seus recursos em tempo real, evitando conflitos." 
            />
            <FeatureCard 
              icon="👥" 
              title="Controle de Acesso" 
              description="Implemente um sistema robusto com diferentes níveis de permissão para usuários e administradores." 
            />
          </div>
        </div>
      </section>
      
      <div className="h-20"></div>
    </div>
  );
}