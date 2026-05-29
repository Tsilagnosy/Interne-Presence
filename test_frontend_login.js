#!/usr/bin/env node
/**
 * Test complet du flux frontend → proxy → backend
 */

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKEND_URL = 'http://127.0.0.1:8000';
const FRONTEND_URL = 'http://127.0.0.1:3000';
const CREDENTIALS = {
  username: 'julientsila@gmail.com',
  password: 'silentehacking',
};

// Utilitaires HTTP
function makeRequest(method, url, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    let bodyStr = '';
    if (body) {
      bodyStr = JSON.stringify(body);
    }

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        ...headers,
      },
    };

    console.log(`📡 ${method} ${url}`);

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Network error: ${error.message}`);
      reject(error);
    });

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// Main test
async function runTests() {
  console.log('🚀 Démarrage du test complet frontend → proxy → backend\n');

  // Étape 1: Démarrer les serveurs
  console.log('1️⃣  Démarrage des serveurs...');

  const backend = spawn('python', ['manage.py', 'runserver', '127.0.0.1:8000', '--nothreading', '--noreload'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'pipe',
  });

  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'pipe',
  });

  await new Promise((resolve) => {
    console.log('⏳ Attendre le démarrage des serveurs (8 secondes)...');
    setTimeout(resolve, 8000);
  });

  try {
    // Étape 2: Test direct au backend
    console.log('\n2️⃣  Test LOGIN au backend (direct)...');
    const backendLogin = await makeRequest('POST', `${BACKEND_URL}/api/token/`, {}, CREDENTIALS);
    if (backendLogin.status === 200 && backendLogin.body.access) {
      console.log('✅ Backend login works');
    } else {
      console.error('❌ Backend login failed:', backendLogin.body);
      process.exit(1);
    }

    // Étape 3: Test via proxy Next.js
    console.log('\n3️⃣  Test LOGIN via proxy Next.js...');
    try {
      const proxyLogin = await makeRequest('POST', `${FRONTEND_URL}/api/token/`, {}, CREDENTIALS);
      if (proxyLogin.status === 200 && proxyLogin.body.access) {
        console.log('✅ Proxy login works');
        console.log(`   Access token: ${proxyLogin.body.access.substring(0, 30)}...`);
      } else {
        console.error('❌ Proxy login failed:', proxyLogin.status, proxyLogin.body);
      }
    } catch (err) {
      console.error('❌ Network error via proxy:', err.message);
      console.log('\n🔍 Debugging info:');
      console.log(`   Frontend URL: ${FRONTEND_URL}`);
      console.log(`   Backend URL: ${BACKEND_URL}`);
      console.log(`   Vérifiez que les deux serveurs tournent correctement\n`);
    }

    console.log('\n✅ Tests terminés!\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    // Arrêter les serveurs
    console.log('🛑 Arrêt des serveurs...');
    backend.kill();
    frontend.kill();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

runTests();
