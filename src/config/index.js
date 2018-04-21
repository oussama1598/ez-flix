import flavors from 'flavors';
import path from 'path';
import fs from 'fs';

const CWD = path.join(__dirname, '..');
const CONFIG_FILE = 'config.json';
const CONFIG_DIR = path.join(CWD, 'config');
const CONFIG_FULL_PATH = path.join(CONFIG_DIR, CONFIG_FILE);
const defaultOptions = {
  transmissionOptions: {
    host: '127.0.0.1',
    port: 9091
  },
  utorrentOptions: {
    host: '127.0.0.1',
    port: 8888,
    username: 'admin',
    password: 'admin'
  }
};

if (!fs.existsSync(CONFIG_FULL_PATH))
  fs.writeFileSync(
    CONFIG_FULL_PATH,
    JSON.stringify(defaultOptions, null, '  '),
    'utf8'
  );

export default flavors('config', {
  workingDir: CWD
});
