
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let currentPIN = null;
let generatedAt = null;

app.use(express.json());

// Permitir CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

function generatePIN() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Rota principal
app.get('/', (req, res) => {
    res.json({
        message: "🔐 API 2FA Simples",
        endpoints: {
            "GET /generate": "Gera novo PIN",
            "POST /verify": "Verifica PIN", 
            "GET /status": "Status atual"
        }
    });
});

// Gerar PIN
app.get('/generate', (req, res) => {
    currentPIN = generatePIN();
    generatedAt = new Date().toISOString();
    
    console.log(`📱 NOVO PIN GERADO: ${currentPIN}`);
    console.log(`⏰ Horário: ${generatedAt}`);
    
    res.json({ 
        pin: currentPIN,
        generated_at: generatedAt,
        message: "PIN gerado! Veja nos logs do Render."
    });
});

// Verificar PIN
app.post('/verify', (req, res) => {
    const { pin } = req.body;
    
    if (!pin) {
        return res.status(400).json({ valid: false, message: "PIN não fornecido" });
    }
    
    if (!currentPIN) {
        return res.status(400).json({ valid: false, message: "Nenhum PIN foi gerado ainda" });
    }

    if (pin === currentPIN) {
        console.log(`✅ PIN VÁLIDO: ${pin}`);
        const validPIN = currentPIN;
        currentPIN = null;
        generatedAt = null;
        
        res.json({ valid: true, message: "PIN válido! Acesso concedido." });
    } else {
        console.log(`❌ PIN INVÁLIDO: ${pin} (esperado: ${currentPIN})`);
        res.json({ valid: false, message: "PIN inválido!" });
    }
});

// Status
app.get('/status', (req, res) => {
    res.json({ 
        has_pin: currentPIN !== null,
        generated_at: generatedAt,
        pin: currentPIN // ⚠️ Só para teste, remova em produção
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API 2FA rodando na porta ${PORT}`);
    console.log(`📝 Acesse: https://sua-api.onrender.com`);
});
