const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');
const winston = require('winston');

// log
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'categorization.log'
    })
  ]
});

function normalizeTitle(title) {
  logger.debug(`[ProductCategorizer] - normalizeTitle - Título original: ${title}`);

  // Remove acentos
  let normalized = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Converte para minúsculas
  normalized = normalized.toLowerCase();

  // Normaliza unidades
  normalized = normalized.replace(/(\d+)\s*(litro|litros|l)/gi, '$1l');
  normalized = normalized.replace(/(\d+)\s*(quilo|quilos|kg|kilo|kilos)/gi, '$1kg');

  // Remove hífens e substitui por espaços
  normalized = normalized.replace(/-/g, ' ');

  logger.debug(`[ProductCategorizer] - normalizeTitle - Título normalizado: ${normalized}`);
  return normalized;
}

function extractProductFeatures(title) {
  logger.debug(`[ProductCategorizer] - extractProductFeatures - Título: ${title}`);

  const normalizedTitle = normalizeTitle(title);
  const words = normalizedTitle.split(' ');

  // Identificar marcas conhecidas
  const knownBrands = ['piracanjuba', 'italac', 'parmalat', 'tio joao', 'tio joão', 'camil']; // Não conheço mai nenhuma papai
  let brand = null;
  for (const knownBrand of knownBrands) {
    if (normalizedTitle.includes(knownBrand)) {
      brand = knownBrand;
      break;
    }
  }

  // Identificar tipos de produto
  const types = {
    leite: ['integral', 'desnatado', 'semi desnatado', 'semi-desnatado'],
    arroz: ['branco', 'integral', 'parboilizado'],
    feijao: ['carioca', 'preto', 'vermelho']
  };

  let productType = null;
  let productCategory = null;

  for (const category in types) {
    if (normalizedTitle.includes(category)) {
      productCategory = category;
      for (const type of types[category]) {
        if (normalizedTitle.includes(type)) {
          productType = type;
          break;
        }
      }
      break;
    }
  }

  // Identificar tamanho/quantidade
  const sizeRegex = /(\d+)\s*(l|kg)/i;
  const sizeMatch = normalizedTitle.match(sizeRegex);
  const size = sizeMatch ? sizeMatch[0] : null;

  const features = {
    brand,
    productCategory,
    productType,
    size
  };

  logger.debug(`[ProductCategorizer] - extractProductFeatures - Características extraídas: ${JSON.stringify(features)}`);
  return features;
}

function areProductsEquivalent(product1, product2) {
  logger.debug(`[ProductCategorizer] - areProductsEquivalent - Comparando: "${product1.title}" e "${product2.title}"`);

  const features1 = extractProductFeatures(product1.title);
  const features2 = extractProductFeatures(product2.title);

  const equivalentBrand = features1.brand === features2.brand;
  const equivalentType = features1.productType === features2.productType;
  const equivalentSize = features1.size === features2.size;
  const equivalentCategory = features1.productCategory === features2.productCategory;

  // Se (característica principal) for !=, os produtos não são equivalentes
  if (!equivalentBrand || !equivalentType || !equivalentSize || !equivalentCategory) {
    logger.debug(`[ProductCategorizer] - areProductsEquivalent - Produtos diferentes - Motivo: marca: ${equivalentBrand}, tipo: ${equivalentType}, tamanho: ${equivalentSize}, categoria: ${equivalentCategory}`);
    return false;
  }

  const norm1 = normalizeTitle(product1.title);
  const norm2 = normalizeTitle(product2.title);
  const similarity = stringSimilarity.compareTwoStrings(norm1, norm2);

  logger.debug(`[ProductCategorizer] - areProductsEquivalent - Similaridade: ${similarity}`);

  return similarity > 0.7;
}

function categorizeProducts(products) {
  logger.debug(`[ProductCategorizer] - categorizeProducts - Iniciando categorização de ${products.length} produtos`);

  const categories = [];
  const processedProductIds = new Set();

  for (let i = 0; i < products.length; i++) {
    const currentProduct = products[i];

    // Pula-pula dos produtos
    if (processedProductIds.has(currentProduct.id)) {
      continue;
    }

    // Criar categoria com o produto atual
    const category = {
      category: currentProduct.title,
      count: 1,
      products: [{
        title: currentProduct.title,
        supermarket: currentProduct.supermarket
      }]
    };

    // Marcar o produto como processado
    processedProductIds.add(currentProduct.id);

    // Procurar produtos equivalentes
    for (let j = 0; j < products.length; j++) {
      const otherProduct = products[j];

      // Pular o mesmo produto ou produtos já processados
      if (otherProduct.id === currentProduct.id || processedProductIds.has(otherProduct.id)) {
        continue;
      }

      // Verificar se os produtos são equivalentes
      if (areProductsEquivalent(currentProduct, otherProduct)) {
        category.products.push({
          title: otherProduct.title,
          supermarket: otherProduct.supermarket
        });

        category.count++;

        processedProductIds.add(otherProduct.id);
      }
    }

    categories.push(category);
  }

  logger.debug(`[ProductCategorizer] - categorizeProducts - Categorização concluída. ${categories.length} categorias encontradas`);
  return categories;
}

function main() {
  logger.debug(`[ProductCategorizer] - main - Iniciando processamento`);

  try {
    const inputFile = process.argv[2] || 'data01.json';

    const dataFilePath = path.join(__dirname, inputFile);
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    const products = JSON.parse(rawData);

    logger.debug(`[ProductCategorizer] - main - Dados carregados de ${inputFile}: ${products.length} produtos`);

    const categorizedProducts = categorizeProducts(products);

    const outputFileName = inputFile.replace('.json', '_categorized.json');
    const outputFilePath = path.join(__dirname, outputFileName);

    fs.writeFileSync(outputFilePath, JSON.stringify(categorizedProducts, null, 2), 'utf8');

    logger.debug(`[ProductCategorizer] - main - Processamento concluído. Resultado salvo em: ${outputFilePath}`);
    console.log(`Processamento concluído. Resultado salvo em: ${outputFilePath}`);

    console.log(`Total de produtos processados: ${products.length}`);
    console.log(`Total de categorias encontradas: ${categorizedProducts.length}`);

  } catch (error) {
    logger.error(`[ProductCategorizer] - main - Erro: ${error.message}`);
    console.error(`Erro: ${error.message}`);
  }
}

main();