const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const { generateSampleData } = require('./utils/sampleGenerator');
const MercadoLivreScraper = require('./scrapers/MercadoLivreScraper');
const AmericanasScraper = require('./scrapers/AmericanasScraper');
const MagaluScraper = require('./scrapers/MagaluScraper');

/**
 * Função para combinar dados de diferentes supermercados
 */
async function combineData(scrapers) {
  logger.debug(`[DataCombiner] - combineData - Combinando dados de ${scrapers.length} supermercados`);

  try {
    const allProducts = [];
    let productId = 1;

    for (const scraper of scrapers) {
      const scraperName = scraper.name;
      const filename = `${scraperName.toLowerCase()}_products.json`;
      const filePath = path.join(__dirname, filename);

      if (fs.existsSync(filePath)) {
        logger.debug(`[DataCombiner] - combineData - Lendo dados de: ${filePath}`);

        const rawData = fs.readFileSync(filePath, 'utf8');
        const products = JSON.parse(rawData);

        // Adicionar produtos à lista combinada com novos IDs
        products.forEach(product => {
          allProducts.push({
            id: productId++,
            title: product.title,
            supermarket: product.supermarket
          });
        });

        logger.debug(`[DataCombiner] - combineData - Adicionados ${products.length} produtos de ${scraperName}`);
      } else {
        logger.warn(`[DataCombiner] - combineData - Arquivo não encontrado: ${filePath}`);
      }
    }

    // Salvar dados combinados
    const combinedFilePath = path.join(__dirname, 'combined_products.json');
    fs.writeFileSync(combinedFilePath, JSON.stringify(allProducts, null, 2), 'utf8');

    logger.debug(`[DataCombiner] - combineData - Dados combinados salvos em: ${combinedFilePath}`);
    console.log(`Dados combinados salvos em: ${combinedFilePath}`);
    console.log(`Total de produtos combinados: ${allProducts.length}`);

    return combinedFilePath;

  } catch (error) {
    logger.error(`[DataCombiner] - combineData - Erro: ${error.message}`);
    console.error('Erro ao combinar dados:', error);
    return null;
  }
}

/**
 * Função principal
 */
async function main() {
  logger.debug(`[Main] - Iniciando processo de scraping leve`);

  try {
    // Criar instâncias dos scrapers
    const mercadoLivreScraper = new MercadoLivreScraper();
    const americanasScraper = new AmericanasScraper();
    const magaluScraper = new MagaluScraper();

    // Array com todos os scrapers
    const scrapers = [mercadoLivreScraper, americanasScraper, magaluScraper];

    // Executar scraping em paralelo
    console.log('Iniciando scraping de supermercados...');

    let scrapingSuccess = false;
    const scrapingPromises = scrapers.map(scraper => {
      console.log(`Iniciando scraping do ${scraper.name}...`);
      return scraper.scrape()
        .then(products => {
          if (products.length > 0) {
            scrapingSuccess = true;
          }
          return products;
        })
        .catch(error => {
          logger.error(`[Main] - Erro no scraping do ${scraper.name}: ${error.message}`);
          console.error(`Erro no scraping do ${scraper.name}:`, error);
          return [];
        });
    });

    // Aguardar conclusão de todos os scrapers
    await Promise.all(scrapingPromises);
    console.log('Tentativa de scraping concluída!');

    let dataFilePath;

    // Se o scraping falhou, gerar dados de exemplo
    if (!scrapingSuccess) {
      console.log('Nenhum dado foi obtido através do scraping. Gerando dados de exemplo...');
      dataFilePath = generateSampleData();
    } else {
      // Combinar dados
      console.log('Combinando dados de todos os supermercados...');
      dataFilePath = await combineData(scrapers);
    }

    if (dataFilePath) {
      console.log(`\nPróximos passos:`);
      console.log(`1. Execute 'node main.js ${path.basename(dataFilePath)}' para categorizar os produtos.`);
    }

    logger.debug(`[Main] - Processo de scraping concluído com sucesso`);

  } catch (error) {
    logger.error(`[Main] - Erro: ${error.message}`);
    console.error('Erro no processo de scraping:', error);

    // Em caso de erro, gerar dados de exemplo
    console.log('Erro no processo de scraping. Gerando dados de exemplo...');
    const sampleFilePath = generateSampleData();

    if (sampleFilePath) {
      console.log(`\nPróximos passos:`);
      console.log(`1. Execute 'node main.js ${path.basename(sampleFilePath)}' para categorizar os produtos de exemplo.`);
    }
  }
}

// Executar função principal
main();
