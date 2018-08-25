import basicFtp from 'basic-ftp';
import stringToStream from 'string-to-stream';
import { Readable } from 'stream';
import fs from 'fs';

export class WolanskiFtp {
  constructor(
    host = process.env.WOLANSKI_FTP_HOST,
    port = process.env.WOLANSKI_FTP_PORT,
    user = process.env.WOLANSKI_FTP_USER,
    pw = process.env.WOLANSKI_FTP_PW,
    rootPath = process.env.WOLANSKI_FTP_ROOT_PATH
  ) {
    this.host = host;
    this.port = port;
    this.user = user;
    this.pw = pw;
    this.rootPath = rootPath;

    this.ftp = new basicFtp.Client();
  }


  async uploadOrders(file, filename) {
    await this.connect();
    await this.uploadFile(file, filename);
    await this.disconnect();
  }

  async connect() {
    const serverMessage = await this.ftp.access({
      host: this.host,
      port: Number.parseInt(this.port),
      user: this.user,
      password: this.pw,
      secure: true,
    });
    return serverMessage;
  }

  uploadFile(fileString, filename) {
    const filePath = this.rootPath + filename;
    // const fileStream = stringToStream(fileString);

    const fileStream = fs.createReadStream('./latestExport-latin1.csv');

    // const fileStream = new Readable();
    // fileStream._read = () => {}; // needed for node compatibility
    // fileStream.push(fileString);
    // fileStream.push(null);
    // fileStream.setEncoding('latin1');
    return this.ftp.upload(fileStream, filePath);
  }

  disconnect() {
    return this.ftp.close();
  }
}
