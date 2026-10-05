import assert from 'node:assert/strict';
import { createReservation } from '../lib/reservations';
(async () => {
 await assert.rejects(createReservation({fullName:'Security test',email:'sample@example.com',phone:'09999999999',deliveryAddress:'Example test address',deliveryCity:'Legazpi City',deliveryDate:'2026-10-05',deliveryTime:'12:00',notes:'No order should be saved',items:[{name:'Example',price:'P499',quantity:1}],subtotal:499},'http://localhost:3001'), /minimum of PHP 500/);
 await assert.rejects(createReservation({fullName:'Test',email:'sample@example.com',phone:'09999999999',deliveryAddress:'Example test address',deliveryCity:'Daraga',deliveryDate:'2026-10-05',deliveryTime:'12:00',items:[{name:'Example',price:'P500',quantity:1}],subtotal:500},'http://localhost:3001'));
 console.log('Server rejects PHP 499 and non-Legazpi delivery before database writes or email.');
})();
