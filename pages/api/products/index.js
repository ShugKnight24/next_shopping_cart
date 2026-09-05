import products from '../../../data/products.json';
import {
  normalizeProduct,
  validateProductContract,
} from '../../../utils/contractResilience';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
      contractValid: false,
    });
  }

  const { category, search, simulateContractBreak, limit } = req.query;

  res.setHeader('X-API-Version', '2.0.0');
  res.setHeader('X-Contract-Status', 'Enforced');

  try {
    let result = products;

    // Filter by category if provided
    if (typeof category === 'string' && category.trim().length > 0) {
      const lowerCat = category.toLowerCase();
      result = result.filter((p) =>
        p.category?.toLowerCase().includes(lowerCat)
      );
    }

    // Filter by search query if provided
    if (typeof search === 'string' && search.trim().length > 0) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.productName?.toLowerCase().includes(query) ||
          p.manufacturer?.toLowerCase().includes(query) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Contract drift simulation mode (for resilience verification & testing)
    if (simulateContractBreak === 'true') {
      result = result.map((item, index) => {
        if (index % 2 === 0) {
          // Corrupted entry: missing ID, string price, missing images array
          return {
            title: item.productName,
            brand: item.manufacturer,
            price: `$${item.price}.00`,
            stock: item.available,
            img: item.image,
          };
        }
        return item;
      });
    }

    // Resiliently normalize every item against the contract
    const normalizedData = result.map(normalizeProduct);

    // Run contract validation diagnostics
    const contractDiagnostics = normalizedData.map((item) =>
      validateProductContract(item)
    );
    const hasContractErrors = contractDiagnostics.some((d) => !d.valid);

    const parsedLimit = parseInt(limit, 10);
    const finalData =
      !Number.isNaN(parsedLimit) && parsedLimit > 0
        ? normalizedData.slice(0, parsedLimit)
        : normalizedData;

    return res.status(200).json({
      version: '2.0.0',
      contractValid: !hasContractErrors,
      simulatedBreak: simulateContractBreak === 'true',
      total: normalizedData.length,
      count: finalData.length,
      data: finalData,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error while retrieving product catalog',
      message: error.message,
      contractValid: false,
    });
  }
}
