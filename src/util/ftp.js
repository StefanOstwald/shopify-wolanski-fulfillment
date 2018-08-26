import basicFtp from 'basic-ftp';
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


  async uploadOrders(sourceFilePath, ftpFilename) {
    await this.connect();
    await this.uploadFile(sourceFilePath, ftpFilename);
    await this.disconnect();
  }

  async connect() {
    const serverMessage = await this.ftp.access({
      host: this.host,
      port: Number.parseInt(this.port, 10),
      user: this.user,
      password: this.pw,
      secure: true,
    });
    return serverMessage;
  }

  uploadFile(sourceFilePath, ftpFilename) {
    const filePath = this.rootPath + ftpFilename;
    const fileStream = fs.createReadStream(sourceFilePath);
    return this.ftp.upload(fileStream, filePath);
  }

  disconnect() {
    return this.ftp.close();
  }
}
