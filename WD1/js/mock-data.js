/**
 * Mock data — simula les sol·licituds de compra que vindrien de SAP Business One.
 * En producció, aquestes dades es recuperarien via SAP Service Layer API.
 */

const MOCK_SUPPLIERS = [
    { code: "P10000", name: "Ferreteria Martínez S.L." },
    { code: "P10001", name: "Suministros Eléctricos BCN" },
    { code: "P10002", name: "Plàstics Industrials Girona" },
    { code: "P10003", name: "Components Metàl·lics SA" },
    { code: "P10004", name: "Embalatges Europa S.L." },
];

const MOCK_ITEMS = [
    { code: "A00001", desc: "Cargol inox M8x40", unit: "CX", unitPrice: 0.12 },
    { code: "A00002", desc: "Cable elèctric 2.5mm² (m)", unit: "ML", unitPrice: 1.85 },
    { code: "A00003", desc: "Tub PVC 110mm (barra 3m)", unit: "UT", unitPrice: 14.50 },
    { code: "A00004", desc: "Planxa acer 2mm 1000x2000", unit: "UT", unitPrice: 65.00 },
    { code: "A00005", desc: "Film retràctil 500mm (rotlle)", unit: "UT", unitPrice: 8.90 },
    { code: "A00006", desc: "Femella hex M10 zincat", unit: "CX", unitPrice: 0.08 },
    { code: "A00007", desc: "Interruptor diferencial 40A", unit: "UT", unitPrice: 42.30 },
    { code: "A00008", desc: "Colze PVC 90° 110mm", unit: "UT", unitPrice: 3.75 },
    { code: "A00009", desc: "Perfil alumini L 30x30", unit: "ML", unitPrice: 5.20 },
    { code: "A00010", desc: "Cinta adhesiva embalatge", unit: "UT", unitPrice: 2.10 },
];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack) {
    const d = new Date();
    d.setDate(d.getDate() - randomInt(1, daysBack));
    return d.toISOString().split("T")[0];
}

function generatePurchaseRequests(count) {
    const requests = [];
    for (let i = 0; i < count; i++) {
        const supplier = MOCK_SUPPLIERS[randomInt(0, MOCK_SUPPLIERS.length - 1)];
        const lineCount = randomInt(1, 5);
        const lines = [];

        const usedItems = new Set();
        for (let j = 0; j < lineCount; j++) {
            let item;
            do {
                item = MOCK_ITEMS[randomInt(0, MOCK_ITEMS.length - 1)];
            } while (usedItems.has(item.code));
            usedItems.add(item.code);

            const qty = randomInt(10, 500);
            lines.push({
                lineNum: j,
                itemCode: item.code,
                itemDesc: item.desc,
                quantity: qty,
                unit: item.unit,
                unitPrice: item.unitPrice,
                lineTotal: Math.round(qty * item.unitPrice * 100) / 100,
            });
        }

        const total = lines.reduce((sum, l) => sum + l.lineTotal, 0);
        const status = Math.random() < 0.75 ? "pending" : "partial";

        requests.push({
            docNum: 1200 + i,
            docDate: randomDate(45),
            supplierCode: supplier.code,
            supplierName: supplier.name,
            lines: lines,
            total: Math.round(total * 100) / 100,
            status: status,
        });
    }

    // Sort by date descending
    requests.sort((a, b) => b.docDate.localeCompare(a.docDate));
    return requests;
}

// Generate 18 mock purchase requests
const PURCHASE_REQUESTS = generatePurchaseRequests(18);
