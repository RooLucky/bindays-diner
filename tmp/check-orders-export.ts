import { writeFile } from 'node:fs/promises';
import { createOrdersWorkbook } from '../lib/orders-workbook';
(async () => {
 const bytes = await createOrdersWorkbook([{id:'export-test',fullName:'=HYPERLINK("https://example.com")',email:'sample@example.com',phone:'09929450802',deliveryAddress:'Example address',landmark:null,deliveryDate:'2026-10-05',deliveryTime:'12:00',notes:'Test only',items:[{name:'Sample dish',price:'P250',quantity:2}],subtotal:500,deliveryFee:50,total:550,status:'awaiting-verification',createdAt:'2026-10-05T00:00:00Z'}]);
 await writeFile('tmp/orders-export-check.xlsx',bytes);
})();
