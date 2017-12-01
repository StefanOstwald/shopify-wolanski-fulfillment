import PromiseFtp from 'promise-ftp';

export class WolanskiFtp {
  constructor(host = process.env.WOLANSKI_FTP_HOST,
    port = process.env.WOLANSKI_FTP_PORT,
    user = process.env.WOLANSKI_FTP_USER,
    pw = process.env.WOLANSKI_FTP_PW,
    rootPath = process.env.WOLANSKI_FTP_ROOT_PATH) {
    this.host = host;
    this.port = port;
    this.user = user;
    this.pw = pw;
    this.rootPath = rootPath;

    this.ftp = new PromiseFtp();
  }


  async uploadOrders(file, filename) {
    await this.connect();
    await this.uploadFile(file, filename);
    await this.disconnect();
  }

  async connect() {
    const serverMessage = await this.ftp.connect({ host: this.host, port: this.port, user: this.user, password: this.pw, secure: true });
    return serverMessage;
  }

  uploadFile(file, filename) {
    const filePath = this.rootPath + filename;
    return this.ftp.put(file, filePath);
  }

  disconnect() {
    return this.ftp.end();
  }

}
