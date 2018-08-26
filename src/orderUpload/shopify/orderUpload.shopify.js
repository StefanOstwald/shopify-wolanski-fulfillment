import { Shopify } from '../../shopify';

/**
   *
   * @param startDate type moment
   * @param endDate type moment
   */
export async function getOrdersInTimespane(startDate, endDate) {
  const queryParameter = {
    created_at_min: startDate.format(),
    created_at_max: endDate.format(),
  };
  const path = '/admin/orders.json';

  const shopify = new Shopify();
  const apiReturn = await shopify.get(path, queryParameter);
  return apiReturn.orders;
}
