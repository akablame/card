# Gerador de Carteirinha

Aplicação web para geração de carteirinhas/crachás personalizados com foto. O usuário preenche os dados (nome, foto, cargo, etc.) e o sistema gera uma carteirinha pronta para impressão em PDF.

## Funcionalidades

- Upload de foto do colaborador
- Preenchimento manual dos dados da carteirinha
- Geração de PDF com jsPDF
- Layout frente e verso
- Tudo compilado em um único arquivo HTML (self-contained)

## Tecnologias

- **React 19** — biblioteca de UI
- **TypeScript** — tipagem estática
- **Vite 6** — bundler
- **Tailwind CSS v4** — estilização
- **jsPDF** — geração de PDF
- **vite-plugin-singlefile** — tudo em um único HTML

## Como usar

### Desenvolvimento

```bash
npm install
npm run dev
```

### Produção (single-file)

```bash
npm run build
npm run preview
```

Ou execute `start.bat` para construir e abrir automaticamente no navegador (porta 3030).

## Estrutura

```
card/
├── src/               # Código fonte (React + TypeScript)
│   ├── components/    # Componentes da UI
│   ├── hooks/         # Hooks personalizados
│   ├── utils/         # Utilitários
│   └── assets/        # Imagens e recursos
├── server.js          # Servidor HTTP simples (Node.js raw)
├── start.bat          # Script de inicialização (Windows)
├── vite.config.ts     # Configuração do Vite
└── dist/              # Build de produção (gerado)
```
