import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const ordersFile = path.join(dataDir, 'orders.json');
const port = Number(process.env.PORT || 3000);

const menu = [
  {id:'ghee-podi-idli',name:'Ghee Podi Idli',category:'Tiffin',price:189,description:'Soft mini idlis tossed in house podi, ghee and curry leaves.',tag:'Guest favourite'},
  {id:'masala-dosa',name:'Annam Signature Masala Dosa',category:'Tiffin',price:229,description:'Golden fermented dosa, spiced potato masala and coconut chutneys.',tag:'Signature'},
  {id:'thatte-idli',name:'Thatte Idli',category:'Tiffin',price:169,description:'Karnataka-style, cloud-soft idli with sambar and chutney.'},
  {id:'medu-vada',name:'Medu Vada',category:'Tiffin',price:159,description:'Crisp golden lentil fritters, served with warm sambar.'},
  {id:'annam-thali',name:'Annam Grand Thali',category:'Meals',price:399,description:'A generous banana-leaf inspired spread of seasonal South Indian delicacies.',tag:'Chef curated'},
  {id:'mini-meals',name:'South Indian Mini Meals',category:'Meals',price:279,description:'Rice, sambar, rasam, poriyal, kootu, curd and pickle.'},
  {id:'bisibelebath',name:'Bisi Bele Bath',category:'Meals',price:249,description:'Slow-cooked rice and lentils with Karnataka spice blend.'},
  {id:'curd-rice',name:'Temple-Style Thayir Sadam',category:'Meals',price:179,description:'Comforting curd rice finished with a fragrant tempering.'},
  {id:'filter-kaapi',name:'Traditional Filter Kaapi',category:'Beverages',price:99,description:'Fresh decoction, frothy milk and a lingering coffee aroma.'},
  {id:'panakam',name:'Panakam',category:'Beverages',price:89,description:'A refreshing jaggery, dry ginger and cardamom cooler.'},
  {id:'payasam',name:'Ada Pradhaman',category:'Desserts',price:149,description:'Kerala-style payasam with jaggery, coconut milk and cashews.'},
  {id:'kesari',name:'Pineapple Kesari',category:'Desserts',price:129,description:'Silky semolina sweet with pineapple, saffron and ghee.'}
];

await mkdir(dataDir, { recursive: true });
try { await readFile(ordersFile, 'utf8'); }
catch { await writeFile(ordersFile, '[]\n', 'utf8'); }

async function readOrders() {
  try { return JSON.parse(await readFile(ordersFile, 'utf8')); }
  catch { return []; }
}
async function saveOrders(orders) {
  const temp = `${ordersFile}.tmp`;
  await writeFile(temp, JSON.stringify(orders, null, 2) + '\n', 'utf8');
  const { rename } = await import('node:fs/promises');
  await rename(temp, ordersFile);
}
function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error('Request body too large');
  }
  return raw ? JSON.parse(raw) : {};
}
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (req.method === 'GET' && url.pathname === '/api/health') return sendJson(res, 200, {ok:true,service:'ANNAM order service'});
    if (req.method === 'GET' && url.pathname === '/api/menu') return sendJson(res, 200, menu);
    if (req.method === 'POST' && url.pathname === '/api/orders') {
      let body;
      try { body = await readBody(req); }
      catch { return sendJson(res, 400, {error:'Please send valid JSON.'}); }
      const {customerName,phone,orderType='takeaway',items,notes=''} = body;
      if (typeof customerName !== 'string' || !customerName.trim() || !/^\+?[0-9 ()-]{8,16}$/.test(phone ?? '') || !Array.isArray(items) || !items.length) {
        return sendJson(res, 400, {error:'Please provide your name, a valid phone number and at least one menu item.'});
      }
      const normalized = [];
      for (const line of items) {
        const product = menu.find(x => x.id === line.id);
        const qty = Number(line.quantity);
        if (!product || !Number.isInteger(qty) || qty < 1 || qty > 30) return sendJson(res, 400, {error:'One or more order items are invalid.'});
        normalized.push({id:product.id,name:product.name,price:product.price,quantity:qty});
      }
      const total = normalized.reduce((sum,x) => sum + x.price*x.quantity,0);
      const orderCode = `AN-${randomBytes(3).toString('hex').toUpperCase()}`;
      const orders = await readOrders();
      orders.push({id:orders.length ? orders[orders.length-1].id+1 : 1,order_code:orderCode,customer_name:customerName.trim(),phone:phone.trim(),order_type:['takeaway','dine-in','delivery'].includes(orderType) ? orderType : 'takeaway',items:normalized,total,notes:String(notes).slice(0,500),status:'received',created_at:new Date().toISOString()});
      await saveOrders(orders);
      return sendJson(res, 201, {orderCode,total,status:'received',message:'Your order has been received by Annam.'});
    }
    if (req.method === 'GET' && url.pathname === '/api/staff/orders') {
      if (!process.env.STAFF_API_KEY || req.headers['x-staff-key'] !== process.env.STAFF_API_KEY) return sendJson(res, 401, {error:'Unauthorized'});
      const orders = await readOrders();
      return sendJson(res, 200, orders.slice(-100).reverse());
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 404, {error:'Not found'});
    const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const filePath = path.resolve(publicDir, `.${requested}`);
    if (!filePath.startsWith(publicDir + path.sep) && filePath !== path.join(publicDir, 'index.html')) return sendJson(res, 403, {error:'Forbidden'});
    const content = await readFile(filePath);
    res.writeHead(200, {'Content-Type':mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream'});
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    if (error.code === 'ENOENT') return sendJson(res, 404, {error:'Not found'});
    console.error(error);
    if (!res.headersSent) sendJson(res, 500, {error:'Something went wrong on the server.'});
    else res.end();
  }
});
server.listen(port, () => console.log(`ANNAM is ready at http://localhost:${port}`));
