const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Função para gerar dados de exemplo quando o scraping falhar
 */
function generateSampleData() {
  logger.debug(`[SampleGenerator] - generateSampleData - Gerando dados de exemplo`);

  const sampleProducts = [
    // Leites
    {
      id: 1,
      title: "Leite Integral Piracanjuba 1L",
      supermarket: "MercadoLivre"
    },
    {
      id: 2,
      title: "Leite Piracanjuba Integral 1L",
      supermarket: "Americanas"
    },
    {
      id: 3,
      title: "Leite Integral Italac 1L",
      supermarket: "Magalu"
    },
    {
      id: 4,
      title: "Leite Italac Integral 1L",
      supermarket: "MercadoLivre"
    },
    {
      id: 5,
      title: "Leite Parmalat Integral 1L",
      supermarket: "Americanas"
    },
    {
      id: 6,
      title: "Leite Desnatado Piracanjuba 1L",
      supermarket: "Magalu"
    },
    {
      id: 7,
      title: "Piracanjuba Leite Desnatado 1L",
      supermarket: "MercadoLivre"
    },
    {
      id: 8,
      title: "Leite Semi-Desnatado Piracanjuba 1L",
      supermarket: "Americanas"
    },
    {
      id: 9,
      title: "Leite Piracanjuba Semi Desnatado 1 Litro",
      supermarket: "Magalu"
    },

    // Arroz
    {
      id: 10,
      title: "Arroz Branco Tio João 5kg",
      supermarket: "MercadoLivre"
    },
    {
      id: 11,
      title: "Arroz Tio João Branco 5kg",
      supermarket: "Americanas"
    },
    {
      id: 12,
      title: "Arroz Tio João Integral 5kg",
      supermarket: "Magalu"
    },
    {
      id: 13,
      title: "Arroz Camil Branco 5kg",
      supermarket: "MercadoLivre"
    },
    {
      id: 14,
      title: "Arroz Branco Camil Tipo 1 Pacote 5kg",
      supermarket: "Americanas"
    },

    // Feijão
    {
      id: 15,
      title: "Feijão Carioca Camil 1kg",
      supermarket: "Magalu"
    },
    {
      id: 16,
      title: "Feijão Camil Tipo Carioca 1kg",
      supermarket: "MercadoLivre"
    },
    {
      id: 17,
      title: "Feijao Carioca Camil 1 Quilo",
      supermarket: "Americanas"
    },
    {
      id: 18,
      title: "Feijão Preto Camil 1kg",
      supermarket: "Magalu"
    },
    {
      id: 19,
      title: "Feijão Camil Preto Tipo 1 Pacote 1kg",
      supermarket: "MercadoLivre"
    },
    {
      id: 20,
      title: "Feijão Kicaldo Carioca 1kg",
      supermarket: "Americanas"
    }
  ];

  // Salvar dados de exemplo
  const sampleFilePath = path.join(__dirname, '..', 'sample_products.json');
  fs.writeFileSync(sampleFilePath, JSON.stringify(sampleProducts, null, 2), 'utf8');

  logger.debug(`[SampleGenerator] - generateSampleData - Dados de exemplo salvos em: ${sampleFilePath}`);
  console.log(`Dados de exemplo salvos em: ${sampleFilePath}`);
  console.log(`Total de produtos de exemplo: ${sampleProducts.length}`);

  return sampleFilePath;
}

module.exports = { generateSampleData };
