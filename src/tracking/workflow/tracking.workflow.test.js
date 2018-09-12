import moment from 'moment-timezone';
import fs from 'fs';
import { WolanskiFtp } from '../../util/ftp';
import { WorkflowTracking } from './tracking.workflow';
import { TrackingTimeKeeper } from '../timeKeeper/orderUpload.timeKeeper';

describe('WorkflowNewOrderUpload', () => {
  let env;
  const shopifyBaseUrlReference = 'https://shop.myshopify.com';
  const informCustomerAboutTrackingInfoReference = true;
  const shopifyLocationIdReference = 905684977;

  beforeEach(() => {
    jest.resetModules();
    // eslint-disable-next-line
    env = process.env;

    process.env.SHOPIFY_BASE_URL = shopifyBaseUrlReference;
    process.env.TRACKING_INFORM_CUSTOMER_ABOUT_TRACKING_INFO = informCustomerAboutTrackingInfoReference.toString();
    process.env.SHOPIFY_LOCATION_ID = shopifyLocationIdReference.toString();
  });

  afterEach(() => {
    process.env = env;
  });

  test('setting env', () => {
    process.env.test1 = 'foo';
    expect(process.env.test1).toBe('foo');
    expect(process.env.SHOPIFY_BASE_URL).toBe(shopifyBaseUrlReference);
  });

  test('update tracking', async () => {
    const workflow = new WorkflowTracking();
    workflow.shopify.initWithProcessEnvValues();
    workflow.shopify.post = getMockForShopifyPost();
    workflow.trackingTimeKeeper.isTimeForTask = () => true;
    workflow.ftp = genFtpMock();

    await workflow.trigger();

    expect(workflow.ftp.downloadFile).toBeCalled();
    expect(workflow.shopify.post).toHaveBeenCalledTimes(2);
    expect(workflow.shopify.post).toBeCalledWith(...getShopifyPostReferenceArgumentsFirstOrder({ informCustomerAboutTrackingInfo: informCustomerAboutTrackingInfoReference, shopifyLocationId: shopifyLocationIdReference }));
    expect(workflow.shopify.post).toBeCalledWith(...getShopifyPostReferenceArgumentsSecondOrder({ informCustomerAboutTrackingInfo: informCustomerAboutTrackingInfoReference, shopifyLocationId: shopifyLocationIdReference }));
  });

  function getShopifyPostReferenceArgumentsFirstOrder({ informCustomerAboutTrackingInfo, shopifyLocationId }) {
    return ['/admin/orders/8050/fulfillments.json',
      null,
      {
        fulfillment: {
          location_id: shopifyLocationId,
          tracking_number: '09905846',
          notify_customer: informCustomerAboutTrackingInfo,
        },
      },
    ];
  }
  function getShopifyPostReferenceArgumentsSecondOrder({ informCustomerAboutTrackingInfo, shopifyLocationId }) {
    return [
      '/admin/orders/8049/fulfillments.json',
      null,
      {
        fulfillment: {
          location_id: shopifyLocationId,
          tracking_number: '321049432755',
          tracking_urls: [
            'http://nolp.dhl.de/nextt-online-public/set_identcodes.do?lang=de&idc=321049432755',
          ],
          notify_customer: informCustomerAboutTrackingInfo,
        },
      },
    ];
  }

  function getMockForShopifyPost() {
    return jest.fn().mockResolvedValue(null);
  }

  function genFtpMock() {
    const ftpMock = {};
    ftpMock.downloadFile = jest.fn().mockImplementation(() => {
      const fixtureFilePath = './src/tracking/workflow/fixtures/trackingFixture.csv';
      const localFilePathWorkflow = WorkflowTracking.defaultCsvFilePath();
      fs.writeFileSync(localFilePathWorkflow, fs.readFileSync(fixtureFilePath));
    });
    ftpMock.connect = jest.fn();
    ftpMock.disconnect = jest.fn();
    ftpMock.fileExists = jest.fn().mockResolvedValue(true);
    return ftpMock;
  }

  function genMockForGetLocalTime() {
    const getTimeMock = jest.fn();
    process.env.TRACKING_EXECUTION_TIME_MIN = '0';
    process.env.TRACKING_EXECUTION_TIME_HOUR = '18';
    const workflowExecutionTime = moment()
      .tz('Europe/Berlin')
      .hour(parseInt(process.env.TRACKING_EXECUTION_TIME_HOUR, 10))
      .min(parseInt(process.env.TRACKING_EXECUTION_TIME_MIN, 10));
    getTimeMock.mockReturnValue(workflowExecutionTime);
  }
});
