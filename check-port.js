const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

async function main() {
  const isPortInUse = await checkPort(8080);
  console.log(isPortInUse ? '포트 8080이 사용 중입니다' : '포트 8080을 사용할 수 있습니다');
  process.exit(isPortInUse ? 1 : 0);
}

main();
