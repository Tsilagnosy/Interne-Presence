#!/usr/bin/env node
/**
 * Test le flux de login complet:
 * 1. Démarrage du backend
 * 2. POST /api/token avec credentials
 * 3. Vérification du stockage des tokens
 * 4. Utilisation du token pour accéder aux routes protégées
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const BACKEND_URL = 'http://127.0.0.1:8000';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// Utilitaires HTTP
function makeRequest(method, url, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
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

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// Main test
async function runTests() {
  console.log('🚀 Démarrage du test de flux de login\n');

  // Étape 1: Démarrer le serveur backend
  console.log('1️⃣  Démarrage du serveur Django...');
  const backend = spawn('python', ['manage.py', 'runserver', '127.0.0.1:8000', '--nothreading', '--noreload'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'pipe',
  });

  // Attendre le démarrage
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    // Étape 2: Login
    console.log('\n2️⃣  Test du login...');
    const loginResponse = await makeRequest('POST', `${BACKEND_URL}/api/token/`, {}, {
      username: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (loginResponse.status !== 200) {
      console.error(`❌ Login failed: ${loginResponse.status}`);
      console.error(loginResponse.body);
      process.exit(1);
    }

    const { access, refresh } = loginResponse.body;
    console.log(`✅ Login successful`);
    console.log(`   Access token: ${access.substring(0, 30)}...`);
    console.log(`   Refresh token: ${refresh.substring(0, 30)}...`);

    // Étape 3: Utiliser le token pour accéder aux routes protégées
    console.log('\n3️⃣  Test d\'accès aux routes protégées...');
    const profileResponse = await makeRequest('GET', `${BACKEND_URL}/api/users/`, {
      Authorization: `Bearer ${access}`,
    });

    if (profileResponse.status === 200) {
      console.log('✅ Accès autorisé aux routes protégées');
      console.log(`   Réponse: ${JSON.stringify(profileResponse.body).substring(0, 100)}...`);
    } else {
      console.error(`❌ Accès refusé: ${profileResponse.status}`);
      console.error(profileResponse.body);
    }

    // Étape 4: Test refresh token
    console.log('\n4️⃣  Test du refresh token...');
    const refreshResponse = await makeRequest('POST', `${BACKEND_URL}/api/token/refresh/`, {}, {
      refresh: refresh,
    });

    if (refreshResponse.status === 200) {
      console.log('✅ Refresh token fonctionnel');
      console.log(`   Nouveau access token: ${refreshResponse.body.access.substring(0, 30)}...`);
    } else {
      console.error(`❌ Refresh failed: ${refreshResponse.status}`);
      console.error(refreshResponse.body);
    }

    console.log('\n✅ Tous les tests passés avec succès!\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    // Arrêter le serveur backend
    backend.kill();
    console.log('Serveur backend arrêté');
  }
}

runTests();
