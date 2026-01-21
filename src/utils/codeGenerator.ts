import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface Project {
  id: string;
  name: string;
  type: string;
  description?: string;
  objective?: string;
  audience?: string;
  style?: string;
  frontend?: string;
  styling?: string;
  backend?: string;
  database?: string;
  language?: string;
  primaryColor?: string;
  subdomain?: string;
}

export class CodeGenerator {
  private templatesDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.templatesDir = path.join(__dirname, '..', '..', 'templates');
  }

  async generateSite(project: Project): Promise<{
    html: string;
    css: string;
    js: string;
    fullCode: string;
  }> {
    try {
      // Determinar qual template usar baseado no tipo
      const templateName = this.getTemplateForType(project.type);

      // Carregar templates
      const htmlTemplate = await this.loadTemplate(`${templateName}.html`);
      const cssTemplate = await this.loadTemplate(`${templateName}.css`);
      const jsTemplate = await this.loadTemplate(`${templateName}.js`);

      // Aplicar dados do projeto nos templates
      const html = this.applyTemplateData(htmlTemplate, project);
      const css = this.applyTemplateData(cssTemplate, project);
      const js = this.applyTemplateData(jsTemplate, project);

      // Combinar tudo em um arquivo HTML completo
      const fullCode = html.replace('{{css}}', css).replace('{{js}}', js);

      return {
        html,
        css,
        js,
        fullCode
      };
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      throw new Error('Falha ao gerar código do site');
    }
  }

  private getTemplateForType(type: string): string {
    const templateMap: Record<string, string> = {
      'landing': 'landing-page',
      'blog': 'blog',
      'portfolio': 'portfolio',
      'ecommerce': 'ecommerce',
      'institutional': 'institutional',
      'saas': 'landing-page', // usa landing page como base
      'webapp': 'webapp',
      'dashboard': 'dashboard'
    };

    return templateMap[type] || 'landing-page';
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(this.templatesDir, templateName);

    try {
      return await fs.promises.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Template não encontrado: ${templatePath}`);
      // Retornar template básico se o específico não existir
      return this.getBasicTemplate(templateName);
    }
  }

  private applyTemplateData(template: string, project: Project): string {
    let result = template;

    // Substituir variáveis do projeto
    result = result.replace(/\{\{project\.(\w+)\}\}/g, (match, key) => {
      const value = (project as any)[key];
      return value || '';
    });

    // Substituir cores
    if (project.primaryColor) {
      result = result.replace(/\{\{project\.primaryColor.*?\}\}/g, project.primaryColor);
    }

    return result;
  }

  private getBasicTemplate(type: string): string {
    // Template básico como fallback
    if (type.endsWith('.html')) {
      return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{project.name}}</title>
    <style>{{css}}</style>
</head>
<body>
    <header>
        <h1>{{project.name}}</h1>
        <p>{{project.description}}</p>
    </header>

    <main>
        <section>
            <h2>{{project.objective}}</h2>
            <p>Conteúdo do site será gerado aqui...</p>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 {{project.name}}</p>
    </footer>

    <script>{{js}}</script>
</body>
</html>`;
    }

    if (type.endsWith('.css')) {
      return `:root {
  --primary: {{project.primaryColor || '#007bff'}};
}

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

header {
  background: var(--primary);
  color: white;
  padding: 2rem;
  text-align: center;
}

main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 1rem;
}`;
    }

    if (type.endsWith('.js')) {
      return `console.log('{{project.name}} carregado!');

// Função básica para interações
document.addEventListener('DOMContentLoaded', function() {
  console.log('Site inicializado');
});`;
    }

    return '';
  }

  // Método para gerar preview (versão simplificada)
  async generatePreview(project: Project): Promise<string> {
    const { fullCode } = await this.generateSite(project);
    return fullCode;
  }
}