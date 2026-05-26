import { Calculator } from './components/Calculator';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="w-full bg-white border-b border-gray-200 px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-center">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Acessibilidade <span className="text-blue-600 font-black">NBR 9050</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-8">
        <Calculator />
      </main>

      <footer className="w-full px-4 py-6 text-center text-sm text-gray-400">
        <p>Criado seguindo as normas da NBR 9050</p>
      </footer>
    </div>
  );
}

export default App;
