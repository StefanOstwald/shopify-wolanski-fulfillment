import basicFtp from 'basic-ftp';
import fs from 'fs';

export class WolanskiFtp {
  constructor(
    host = process.env.WOLANSKI_FTP_HOST,
    port = process.env.WOLANSKI_FTP_PORT,
    user = process.env.WOLANSKI_FTP_USER,
    pw = process.env.WOLANSKI_FTP_PW,
  ) {
    this.host = host;
    this.port = port;
    this.user = user;
    this.pw = pw;

    // basicFtp doesn't allow Let's Encrypt certificates which Wolanski uses
    this.rejectUnauthorized = false;
    this.ftp = new basicFtp.Client();
  }

  async connect() {
    const serverMessage = await this.ftp.access({
      host: this.host,
      port: Number.parseInt(this.port, 10),
      user: this.user,
      password: this.pw,
      secure: true,
      secureOptions: { rejectUnauthorized: this.rejectUnauthorized },
    });
    return serverMessage;
  }

  uploadFile(diskFilePath, ftpFilePath) {
    const fileStream = fs.createReadStream(diskFilePath);
    return this.ftp.upload(fileStream, ftpFilePath);
  }

  downloadFile(diskFilePath, ftpFilePath) {
    const fileStream = fs.createWriteStream(diskFilePath);
    return this.ftp.download(fileStream, ftpFilePath);
  }

  async fileExists(folder, filename) {
    await this.ftp.cd(folder);
    const files = await this.ftp.list();
    return !!files.find(fileInfo => fileInfo.name === filename);
  }

  disconnect() {
    return this.ftp.close();
  }
}
