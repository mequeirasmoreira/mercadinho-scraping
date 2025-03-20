const axios = require('axios');
const cheerio = require('cheerio');
const SupermarketScraper = require('./SupermarketScraper');
const logger = require('../utils/logger');

/**
 * Scraper para o site do Americanas (categoria de supermercado)
 */
class AmericanasScraper extends SupermarketScraper {
  constructor() {
    super('Americanas');
    this.baseUrl = 'https://www.americanas.com.br';
    this.categories = [{
        name: 'Leite',
        url: '/categoria/mercado/mercearia/leites/'
      },
      {
        name: 'Arroz',
        url: '/categoria/mercado/alimentos-basicos/arroz/'
      },
      {
        name: 'Feijão',
        url: '/categoria/mercado/alimentos-basicos/feijao/'
      }
    ];
  }

  async scrape() {
    logger.debug(`[${this.name}Scraper] - scrape - Iniciando scraping`);

    const allProducts = [];
    let productId = 1;

    try {
      for (const category of this.categories) {
        logger.debug(`[${this.name}Scraper] - scrape - Processando categoria: ${category.name}`);

        // Configurar o user agent para simular um navegador
        const config = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
          }
        };

        // Fazer a requisição HTTP
        const url = `${this.baseUrl}${category.url}`;
        logger.debug(`[${this.name}Scraper] - scrape - Acessando URL: ${url}`);

        const response = await axios.get(url, config);

        // Verificar se a requisição foi bem-sucedida
        if (response.status !== 200) {
          logger.warn(`[${this.name}Scraper] - scrape - Falha ao acessar URL: ${url}, Status: ${response.status}`);
          continue;
        }

        // Carregar o HTML na biblioteca Cheerio
        const $ = cheerio.load(response.data);

        // Extrair informações dos produtos
        const products = [];

        // Seletor para os itens de produto no Americanas
        $('[data-testid="product-card-container"]').each((index, element) => {
          try {
            const titleElement = $(element).find('[data-testid="product-card-name"]');
            if (titleElement.length > 0) {
              const title = titleElement.text().trim();
              products.push({
                title,
                supermarket: this.name
              });
            }
          } catch (error) {
            logger.error(`[${this.name}Scraper] - scrape - Erro ao extrair produto: ${error.message}`);
          }
        });

        // Adicionar IDs aos produtos e adicioná-los à lista
        products.forEach(product => {
          allProducts.push({
            id: productId++,
            ...product
          });
        });

        logger.debug(`[${this.name}Scraper] - scrape - Extraídos ${products.length} produtos da categoria: ${category.name}`);
      }

      logger.debug(`[${this.name}Scraper] - scrape - Scraping concluído. Total de produtos: ${allProducts.length}`);

      // Salvar dados
      const filePath = await this.saveData(allProducts);
      console.log(`Dados do ${this.name} salvos em: ${filePath}`);

      return allProducts;

    } catch (error) {
      logger.error(`[${this.name}Scraper] - scrape - Erro: ${error.message}`);
      console.error(`Erro ao fazer scraping do ${this.name}:`, error);
      return [];
    }
  }
}

module.exports = AmericanasScraper;
