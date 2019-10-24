import _ from 'lodash';
import { slack } from '../../util/slack';

export function getEmptyOrder() {
  const base = {
    // T_KontoNr Immer die selbe Nummer (Diese erhalten Sie von Ihren Sachbearbeiter)
    T_KontoNr: process.env.WOLANSKI_ACCOUNT_NUMBER,
    // T_FFNR Immer die selbe Nummer (Diese erhalten Sie von Ihren Sachbearbeiter)
    T_FFNR: process.env.WOLANSKI_FULFILLMENT_NUMBER,
    // LFD Nummer
    T_Nummer: 0,
    T_Name1: '',
    T_Name2: '',
    T_Name3: '',
    T_Name4: '',
    T_Name5: '',
    // Länderkennzeichen wird nur eingetragen, wenn die Bestellung aus dem Ausland kommt.
    T_LKZ: '',
    // PLZ - Ostdeutsche mit der führenden "0" z.B. 04103 für Leipzig.
    PLZ: '',
    Strasse: '',
    T_Ort: '',
    // Versandinformationen an Kunden.
    Mail: '',
    T_Versandcode: '',
    // Versand: Nachnahmegebühren "x,xx"
    T_Nachnahme: '',
    T_ReferenzNummer: '',
    Auftrag: '',
    T_AufDat: '',
    KstSt: '',
    T_Termin: '',
    T_Bemerkung1: '',
    T_Bemerkung2: '',
    T_Bemerkung3: '',
    T_Versicher: '',
    Sortfeld: '',
    // Reserve, in diesem Feld können Sie Ihre persönliche Daten hinterlegen, dieses Feld wird zurück übermittelt.
    Reserve: '',
  };

  for (let i = 0; i < 25; i += 1) {
    base[`T_Artikel ${i}`] = '';
    base[`T_Menge ${i}`] = '';
  }
  return base;
}


function orderIsExpressDelivery(order) {
  if (Array.isArray(order.shipping_lines)) {
    return false;
  }
  const shippingLineIsExpress = iShippingLine => iShippingLine.title === process.env.SHOPIFY_EXPRESS_DELIVERY_NAME;
  const expressShippingLine = order.shipping_lines.find(shippingLineIsExpress);
  return !!expressShippingLine;
}


function generateWolanskiOrderFromShopifyOrder(sOrder, wolanskiOrderIndex) {
  const wOrder = getEmptyOrder();
  wOrder.T_Nummer = wolanskiOrderIndex;
  wOrder.T_Name1 = sOrder.shipping_address.name;
  wOrder.T_Name2 = sOrder.shipping_address.company;
  if (sOrder.shipping_address.country_code !== 'DE') {
    wOrder.T_LKZ = sOrder.shipping_address.country_code;
  }
  wOrder.PLZ = sOrder.shipping_address.zip;
  wOrder.Strasse = sOrder.shipping_address.address2 ?
    `${sOrder.shipping_address.address1} - ${sOrder.shipping_address.address2}` :
    sOrder.shipping_address.address1;
  wOrder.T_Ort = sOrder.shipping_address.city;
  wOrder.Reserve = `shopifyOrderId:${sOrder.id}`;

  const comments = [];
  if (orderIsExpressDelivery(sOrder)) {
    comments.push('## Express Versands ##');
  }
  if (sOrder.note) {
    comments.push(sOrder.note);
  }
  wOrder.T_Bemerkung1 = comments.join('/n');

  _.forEach(sOrder.line_items, (lineItem, lineItemIndex) => {
    wOrder[`T_Artikel ${lineItemIndex}`] = lineItem.sku;
    wOrder[`T_Menge ${lineItemIndex}`] = lineItem.quantity;
  });

  return wOrder;
}

export function convertShopifyOrdersToWolanskiStructure(shopifyOrders) {
  console.log(`shopifyOrders: Amount ${shopifyOrders && shopifyOrders.length} `);

  let ordersWithErrors = 0;
  const wolanski = [];

  shopifyOrders.forEach((sOrder, orderIndex) => {
    if (!sOrder.shipping_address) {
      ordersWithErrors += 1;
      slack.error(`shopify Order contains no sOrder.shipping_address: \`\`\` \n${JSON.stringify(sOrder, null, 2)}\n \`\`\``);
      console.log(`sOrder no sOrder.shipping_address: ${JSON.stringify(sOrder, null, 2)} `);
    } else {
      const wolanskiOrderIndex = (orderIndex + 1) - ordersWithErrors;
      wolanski.push(generateWolanskiOrderFromShopifyOrder(sOrder, wolanskiOrderIndex));
    }
  });

  return wolanski;
}
