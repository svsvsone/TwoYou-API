export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Variáveis em memória (para demo)
  let currentPIN = null;
  let generatedAt = null;

  function generatePIN() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  if (req.method === 'GET' && req.url === '/api/2fa') {
    // Rota principal - mostra informações
    res.status(200).json({
      message: "API 2FA Simples",
      endpoints: {
        "GET /api/2fa/generate": "Gera um novo PIN",
        "POST /api/2fa/verify": "Verifica um PIN",
        "GET /api/2fa/status": "Status atual"
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/api/2fa/generate') {
    // Gerar novo PIN
    currentPIN = generatePIN();
    generatedAt = new Date().toISOString();
    
    console.log(`📱 NOVO PIN GERADO: ${currentPIN} - ${generatedAt}`);
    
    res.status(200).json({ 
      pin: currentPIN,
      generated_at: generatedAt,
      message: "PIN gerado com sucesso! Veja nos logs do console."
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/2fa/verify') {
    const { pin } = req.body;
    
    if (!currentPIN) {
      return res.status(400).json({ valid: false, message: "Nenhum PIN foi gerado ainda" });
    }

    if (pin === currentPIN) {
      // PIN válido - limpar após uso
      const validPIN = currentPIN;
      currentPIN = null;
      generatedAt = null;
      
      res.status(200).json({ valid: true, message: "PIN válido! Acesso concedido." });
    } else {
      res.status(200).json({ valid: false, message: "PIN inválido!" });
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/api/2fa/status') {
    res.status(200).json({ 
      has_pin: currentPIN !== null,
      generated_at: generatedAt
    });
    return;
  }

  // Se chegou aqui, rota não encontrada
  res.status(404).json({ error: "Rota não encontrada" });
}
