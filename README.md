# UnAPI — Controle de Presença

Site estático para leitura de QR Code e registro de presença em planilha Google.

## Funcionalidades

- leitura de QR Code pela câmera do navegador
- registro manual de ID do QR Code
- geração de QR Codes para participantes
- download dos códigos em imagem e texto
- envio de presença para Google Apps Script
- persistência da URL do Apps Script no navegador

## Estrutura do projeto

- `index.html` — estrutura da página
- `style.css` — estilos do site
- `script.js` — lógica de QR Code, câmera e integração com Apps Script
- `jsQR.js` — biblioteca de leitura de QR Code

## Como usar

1. Abra o arquivo `index.html` no navegador ou publique em um host estático.
2. Copie a URL do Google Apps Script gerada no Apps Script.
3. Cole a URL no campo indicado.
4. Clique em "Iniciar câmera" e aponte para o QR Code.
5. A presença será enviada para a planilha.

## Publicação no GitHub Pages

Como o projeto é um site estático, ele pode ser publicado diretamente no GitHub Pages sem necessidade de build.

### Passos

1. Suba os arquivos para um repositório GitHub.
2. Vá em `Settings` → `Pages`.
3. Selecione `Deploy from a branch`.
4. Escolha a branch principal e a pasta `/root`.
5. Salve.

A URL final será algo como:

```txt
https://seu-usuario.github.io/unapi-presenca/
```

## Importante

- O site deve ser acessado via HTTPS em produção.
- O GitHub Pages já fornece HTTPS.
- A URL do Google Apps Script deve estar correta para o envio funcionar.

## Licença

Este projeto foi desenvolvido para uso local e institucional. Ajustes e melhorias são bem-vindos.
