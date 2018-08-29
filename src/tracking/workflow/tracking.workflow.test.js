// import moment from 'moment-timezone';
// import fs from 'fs';
// import { WolanskiFtp } from '../../util/ftp';
// import { WorkflowTracking } from './tracking.workflow';

// describe('WorkflowNewOrderUpload', () => {
//   let env;

//   beforeEach(() => {
//     // eslint-disable-next-line
//     env = process.env;
//   });

//   afterEach(() => {
//     process.env = env;
//   });

//   test('update tracking', () => {
//     mockGetLocalTime();
//     mockFtpCsvDownload();
//   });

//   function mockFtpCsvDownload() {
//     const filePath = new WorkflowNewOrderUpload().csvFilePathOnDisk;
//     const ftpMock = jest.mock('../../util/ftp');
//     ftpMock.downloadFile = jest.fn().mockImplementation(() => {
//       const fixtureFilePath = './tracking/workflow/fixtures/trackingFixture.csv';
//       const localFilePathWorkflow = new WorkflowTracking().csvFilePathOnDisk;
//       fs.writeFileSync(localFilePathWorkflow, fs.readFileSync(fixtureFilePath));
//     });
//   }

//   function mockGetLocalTime() {
//     jest.mock('../../util/timeHelper', () => ({
//       __esModule: true, // this property makes it work
//       getLocalTime: genMockForGetLocalTime(),
//     }));
//   }

//   function genMockForGetLocalTime() {
//     const getTimeMock = jest.fn();
//     process.env.TRACKING_EXECUTION_TIME_MIN = '0';
//     process.env.TRACKING_EXECUTION_TIME_HOUR = '18';
//     const workflowExecutionTime = moment()
//       .tz('Europe/Berlin')
//       .hour(parseInt(process.env.TRACKING_EXECUTION_TIME_HOUR, 10))
//       .min(parseInt(process.env.TRACKING_EXECUTION_TIME_MIN, 10));
//     getTimeMock.mockReturnValue(workflowExecutionTime);
//   }
// });
