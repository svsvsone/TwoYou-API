const http = require('http');
const url = require('url');

let currentPIN = null;
let generatedAt = null;

function generatePIN() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function parseJSONBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch {
                resolve({});
            }
        });
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
    }

    // Rota principal
    if (pathname === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: "🔐 API 2FA Simples",
            endpoints: {
                "GET /generate": "Gera novo PIN",
                "POST /verify": "Verifica PIN",
                "GET /status": "Status atual"
            }
        }));
        return;
    }

    // Gerar PIN
    if (pathname === '/generate' && method === 'GET') {
        currentPIN = generatePIN();
        generatedAt = new Date().toISOString();
        
        console.log(`📱 NOVO PIN GERADO: ${currentPIN}`);
        console.log(`⏰ Horário: ${generatedAt}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            pin: currentPIN,
            generated_at: generatedAt,
            message: "PIN gerado! Veja nos logs do Render."
        }));
        return;
    }

    // Verificar PIN
    if (pathname === '/verify' && method === 'POST') {
        const body = await parseJSONBody(req);
        const { pin } = body;
        
        if (!pin) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ valid: false, message: "PIN não fornecido" }));
            return;
        }
        
        if (!currentPIN) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ valid: false, message: "Nenhum PIN foi gerado ainda" }));
            return;
        }

        if (pin === currentPIN) {
            console.log(`✅ PIN VÁLIDO: ${pin}`);
            const validPIN = currentPIN;
            currentPIN = null;
            generatedAt = null;
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ valid: true, message: "PIN válido! Acesso concedido." }));
        } else {
            console.log(`❌ PIN INVÁLIDO: ${pin} (esperado: ${currentPIN})`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ valid: false, message: "PIN inválido!" }));
        }
        return;
    }

    // Status
    if (pathname === '/status' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            has_pin: currentPIN !== null,
            generated_at: generatedAt
        }));
        return;
    }

    // Rota não encontrada
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Rota não encontrada" }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 API 2FA rodando na porta ${PORT}`);
    console.log(`📝 Endpoints:`);
    console.log(`   GET  /generate - Gera novo PIN`);
    console.log(`   POST /verify   - Verifica PIN`);
    console.log(`   GET  /status   - Status atual`);
});
