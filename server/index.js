const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

// ENV
const PORT = process.env.PORT || 8787;
const RPC_URL = process.env.RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY; // REQUIRED

// IncidentManager minimal ABI
const INCIDENT_MANAGER_ADDRESS = '0x34b6921bfe6c4933a1Af79b5f36A5b6e28B1a081';
const INCIDENT_MANAGER_ABI = [
  { "type": "function", "name": "reportIncident", "inputs": [{ "name": "_description", "type": "string", "internalType": "string" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "getLastIncidentId", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
  { "type": "function", "name": "getIncident", "inputs": [{ "name": "_id", "type": "uint256", "internalType": "uint256" }], "outputs": [
    { "name": "", "type": "uint256", "internalType": "uint256" },
    { "name": "", "type": "string", "internalType": "string" },
    { "name": "", "type": "address", "internalType": "address" },
    { "name": "", "type": "uint256", "internalType": "uint256" },
    { "name": "", "type": "bool", "internalType": "bool" }
  ], "stateMutability": "view" }
];

if (!PRIVATE_KEY) {
  console.error('[server] PRIVATE_KEY env is required. Exiting.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.JsonRpcProvider(RPC_URL, 11142220);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI, wallet);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/reportIncident', async (req, res) => {
  try {
    const { pdfCID } = req.body || {};
    if (!pdfCID || typeof pdfCID !== 'string') {
      return res.status(400).json({ error: 'pdfCID required' });
    }

    const tx = await contract.reportIncident(pdfCID);
    const receipt = await tx.wait();

    // Optionally read last id
    let incidentId = null;
    try {
      const lastId = await contract.getLastIncidentId();
      incidentId = lastId?.toString?.() || String(lastId);
    } catch {}

    return res.json({ txHash: tx.hash, blockNumber: receipt.blockNumber, incidentId });
  } catch (e) {
    console.error('[server] reportIncident failed', e);
    return res.status(500).json({ error: e?.message || 'internal_error' });
  }
});

app.listen(PORT, () => {
  console.log(`[server] listening on ${PORT}`);
});


