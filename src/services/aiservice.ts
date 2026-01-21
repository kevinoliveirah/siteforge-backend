
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

// Inicializar o Gemini se a chave existir
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const aiService = {
  async generateSite(prompt: string, type: string, style: string) {
    // 1. MODO SIMULAÇÃO (Sem chave)
    if (!genAI) {
      console.log("⚠️ Sem chave de API. Usando modo simulação.");
      const mockResult = generateMockSite(type);
      console.log("[AI SERVICE] Mock site gerado.");
      return mockResult;
    }

    console.log("[AI SERVICE] Iniciando chamada real para o Gemini...");

    // 2. MODO REAL (Com chave)
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const systemPrompt = `
        Você é um Arquiteto de Software e Designer UI/UX Sênior especializado em ${type}.
        Sua tarefa é gerar um site completo, profissional e pronto para produção em um ÚNICO ARQUIVO HTML.
        
        CONTEXTO DO PROJETO:
        - Nome: ${prompt.split('.')[0]}
        - Tipo: ${type}
        - Estilo Visual: ${style}
        - Tecnologias: ${prompt}
        
        REQUISITOS TÉCNICOS OBRIGATÓRIOS:
        1. Framework: Tailwind CSS (via CDN).
        2. Ícones: Lucide Icons ou Font Awesome (via CDN).
        3. Scripts: Use Vanilla JS para interatividade necessária.
        4. Design: Premium, moderno, com gradientes suaves, sombras sutis e tipografia elegante (use Google Fonts: Inter ou Outfit).
        5. Mobile-First: O site deve ser 100% responsivo.
        6. Componentes: Navbar fixa, Hero Section impactante, Features, Prova Social/Depoimentos, FAQ e Rodapé.
        7. Sem explicações: Retorne APENAS o código HTML bruto, sem markdown.
        
        INSTRUÇÃO DE ESTILO:
        Se o estilo for "Moderno", use glassmorphism e cores vibrantes.
        Se for "Minimalista", use muito espaço em branco e tipografia forte.
        Se for "Corporativo", use tons de azul/cinza e layout estruturado.
      `;

      console.log("[AI SERVICE] Enviando prompt para o modelo...");
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      let text = response.text();
      console.log(`[AI SERVICE] Resposta recebida. Tamanho: ${text.length} chars`);

      // Limpar formatação markdown se houver
      text = text.replace(/```html/g, "").replace(/```/g, "");

      return text;
    } catch (error) {
      console.error("Erro ao gerar site com IA:", error);
      throw new Error("Falha ao gerar o site com IA.");
    }
  },

  async refineSite(currentCode: string, adjustmentPrompt: string) {
    if (!genAI) {
      console.log("⚠️ Sem chave de API. Modo simulação não suporta refinamento real.");
      return currentCode; 
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const systemPrompt = `
        Você é um Arquiteto de Software Sênior. Sua tarefa é MODIFICAR um código HTML existente baseado em um pedido do usuário.
        
        CÓDIGO ATUAL:
        ${currentCode}
        
        PEDIDO DE AJUSTE:
        "${adjustmentPrompt}"
        
        REGRAS:
        1. Retorne o arquivo HTML COMPLETO com as modificações aplicadas.
        2. Mantenha a mesma estrutura de tecnologias (Tailwind, etc).
        3. Não adicione explicações ou markdown.
        4. O código deve continuar sendo um único arquivo pronto para rodar.
      `;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```html/g, "").replace(/```/g, "");
      return text;
    } catch (error) {
      console.error("Erro ao refinar site com IA:", error);
      throw new Error("Falha ao ajustar o site com IA.");
    }
  }
};

// Site de exemplo para quando não houver chave
function generateMockSite(type: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Gerado (Modo Demo)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '#3B82F6',
              secondary: '#10B981',
            }
          }
        }
      }
    </script>
</head>
<body class="bg-gray-50 font-sans">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm fixed w-full z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
                <span class="text-2xl font-bold text-primary">SiteDemo</span>
                <div class="hidden md:flex space-x-8">
                    <a href="#" class="text-gray-700 hover:text-primary">Início</a>
                    <a href="#" class="text-gray-700 hover:text-primary">Sobre</a>
                    <a href="#" class="text-gray-700 hover:text-primary">Serviços</a>
                    <a href="#" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">Contato</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Site Gerado via IA (${type})
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Este é um exemplo gerado no modo de simulação. Para gerar um site real personalizado, configure sua chave da API do Gemini.
        </p>
        <button class="bg-primary text-white text-lg px-8 py-3 rounded-xl shadow-lg hover:bg-blue-600 transition transform hover:-translate-y-1">
            Começar Agora
        </button>
    </section>

    <!-- Features -->
    <section class="py-20 px-4 max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 text-2xl">⚡</div>
                <h3 class="text-xl font-bold mb-2">Rápido</h3>
                <p class="text-gray-600">Carregamento instantâneo e otimizado para performance.</p>
            </div>
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 text-2xl">🎨</div>
                <h3 class="text-xl font-bold mb-2">Bonito</h3>
                <p class="text-gray-600">Design moderno usando Tailwind CSS.</p>
            </div>
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 text-2xl">📱</div>
                <h3 class="text-xl font-bold mb-2">Responsivo</h3>
                <p class="text-gray-600">Funciona perfeitamente em mobile e desktop.</p>
            </div>
        </div>
    </section>

    <footer class="bg-gray-900 text-white py-12 text-center">
        <p>&copy; 2024 Site Gerado por IA. Todos os direitos reservados.</p>
    </footer>
</body>
</html>`;
}
