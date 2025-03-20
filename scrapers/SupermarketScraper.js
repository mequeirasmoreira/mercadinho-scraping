const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Classe base para scrapers de supermercados
 */
class SupermarketScraper {
  constructor(name) {
    this.name = name;
    logger.debug(`[${this.name}Scraper] - Inicializando scraper`);
  }

  async scrape() {
    throw new Error('Método scrape() deve ser implementado pelas subclasses');
  }

  async saveData(data) {
    const filename = `${this.name.toLowerCase()}_products.json`;
    const filePath = path.join(__dirname, '..', filename);

    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      logger.debug(`[${this.name}Scraper] - saveData - Dados salvos em: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error(`[${this.name}Scraper] - saveData - Erro ao salvar dados: ${error.message}`);
      throw error;
    }
  }
}

module.exports = SupermarketScraper;
