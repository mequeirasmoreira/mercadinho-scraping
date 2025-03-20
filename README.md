# 🛒 Mercadinho Scraping

> *"Me dê papai - Chorume"*

## 🤔 O que é isso?

Este projeto é um algoritmo inteligente que categoriza produtos de supermercado, mesmo quando eles têm descrições diferentes. Imagine que você quer saber se o "Leite Integral Piracanjuba 1L" do Mercado Livre é o mesmo que o "Piracanjuba Leite Integral 1 Litro" do Magalu.

## 🧠 Como o algoritmo principal funciona?

O algoritmo de categorização é o coração do projeto e funciona assim:

1. **Leitura de dados**: Carrega uma lista de produtos de um arquivo JSON
2. **Comparação inteligente**: Usa a biblioteca `string-similarity` para identificar produtos equivalentes, mesmo com:
   - Palavras em ordem diferente
   - Variações de capitalização
   - Pequenas diferenças de escrita

3. **Agrupamento**: Cria categorias de produtos equivalentes
4. **Resultado**: Gera um arquivo JSON com todos os produtos organizados por categoria

### 💡 Exemplo prático:

```
"Leite Integral Piracanjuba 1L" (Mercado Livre)
"Leite Piracanjuba Integral 1L" (Americanas)
"Piracanjuba Leite Integral 1 Litro" (Magalu)
```

Todos estes produtos serão agrupados na mesma categoria, permitindo comparação de preços!

## 🚀 Para instanciar o categorizador

```bash
# Instalar dependências
npm install

# Executar o algoritmo de categorização com o arquivo de exemplo
npm start

# Ou especificar um arquivo personalizado
node main.js meu_arquivo.json
```

## 🕸️ Web Scraping: O bônus do projeto!

Além do categorizador (exigido), este projeto também inclui um sistema de web scraping (Apenas para demonstrar conhecimentos sólidos das tech utilizadas e de algoritmos) para coletar dados de produtos automaticamente de vários supermercados online.

### 🏗️ Arquitetura modular

O sistema de scraping foi construído com uma arquitetura modular visando clean code e técnicas de SOLID:

- **Classe base**: `SupermarketScraper` define a estrutura comum
- **Classes específicas**: Implementações para cada supermercado
  - `MercadoLivreScraper`
  - `AmericanasScraper`
  - `MagaluScraper`

### 🔍 How???

1. O scraper acessa as páginas de produtos de cada supermercado
2. Extrai informações como título e preço
3. Salva os dados em arquivos JSON
4. Se o scraping falhar (por proteções anti-bot), gera dados de exemplo

## 🛠️ Arquitetura

- **Node.js**: Plataforma de execução (exigido no post)
- **string-similarity**: Para comparação de textos, é uma lib que usa matemática para dar com textos
- **axios** e **cheerio**: Para web scraping, tentei utilizar o puppeteer, mas não deu certo por questões de compatibilidade
- **winston**: Para log, pois sou de QA e isso está na veia
