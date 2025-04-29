const { spawn } = require('child_process');
const path = require('path');

async function startService() {
  console.log('서버를 시작합니다...');
  
  // 여기에 실제 서버 파일의 경로를 입력하세요
  // 예: app.js, server.js, index.js 등
  const serverFile = 'server.js';
  
  try {
    const server = spawn('node', [serverFile]);
    
    server.stdout.on('data', (data) => {
      console.log(`서버 출력: ${data}`);
    });

    server.stderr.on('data', (data) => {
      console.error(`서버 에러: ${data}`);
    });

    server.on('error', (error) => {
      console.error(`서버 시작 실패: ${error.message}`);
      process.exit(1);
    });

    console.log('서버가 시작되길 기다립니다...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('ngrok을 시작합니다...');
    const ngrok = spawn('ngrok', ['http', '3001']);  // 포트를 8080에서 3001로 변경
    
    ngrok.stdout.on('data', (data) => {
      console.log(`ngrok 출력: ${data}`);
    });

    ngrok.stderr.on('data', (data) => {
      console.error(`ngrok 에러: ${data}`);
    });

    ngrok.on('error', (error) => {
      console.error(`ngrok 시작 실패: ${error.message}`);
      server.kill();
      process.exit(1);
    });
    
    process.on('SIGINT', () => {
      console.log('서비스를 종료합니다...');
      server.kill();
      ngrok.kill();
      process.exit();
    });
  } catch (error) {
    console.error(`예기치 않은 오류 발생: ${error.message}`);
    process.exit(1);
  }
}

startService();
