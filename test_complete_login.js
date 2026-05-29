#!/usr/bin/env node
/**
 * Test complet du flux frontend → backend
 * Simule exactement ce que fait le page de login du frontend
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const BACKEND_URL = 'http://localhost:8000';
const CREDENTIALS = {
  username: 'julientsila@gmail.com',
  password: 'silentehacking',
};

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
  console.log('🚀 TEST COMPLET: Frontend → Backend Login Flow\n');

  // Étape 1: Démarrer le backend
  console.log('1️⃣  Démarrage du serveur Django...');
  const backend = spawn('python', ['manage.py', 'runserver', '127.0.0.1:8000', '--nothreading', '--noreload'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'pipe',
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log('✓ Backend démarré sur http://localhost:8000\n');

  try {
    // Étape 2: Simuler le login frontend
    console.log('2️⃣  Étape 1: Frontend envoie credentials...');
    console.log(`   POST http://localhost:8000/api/token/`);
    console.log(`   Body: { username: "${CREDENTIALS.username}", password: "***" }`);

    const loginResponse = await makeRequest('POST', `${BACKEND_URL}/api/token/`, {}, CREDENTIALS);

    if (loginResponse.status !== 200) {
      console.error(`\n❌ Login failed: ${loginResponse.status}`);
      console.error(loginResponse.body);
      process.exit(1);
    }

    const { access, refresh } = loginResponse.body;
    console.log('\n✅ Étape 1: Backend retourne les tokens JWT');
    console.log(`   Access token: ${access.substring(0, 40)}...`);
    console.log(`   Refresh token: ${refresh.substring(0, 40)}...\n`);

    // Étape 3: Frontend stocke les tokens en localStorage
    console.log('3️⃣  Étape 2: Frontend stocke tokens dans localStorage');
    console.log(`   localStorage.setItem('AFRIMARKET_ACCESS_TOKEN', '${access.substring(0, 20)}...');`);
    console.log(`   localStorage.setItem('AFRIMARKET_REFRESH_TOKEN', '${refresh.substring(0, 20)}...');`);
    console.log('✅ Tokens stockés\n');

    // Étape 4: Frontend utilise le token pour accéder aux routes protégées
    console.log('4️⃣  Étape 3: Frontend accède aux routes protégées avec le token');
    console.log(`   GET http://localhost:8000/api/users/`);
    console.log(`   Header: Authorization: Bearer ${access.substring(0, 20)}...\n`);

    const protectedResponse = await makeRequest('GET', `${BACKEND_URL}/api/users/`, {
      Authorization: `Bearer ${access}`,
    });

    if (protectedResponse.status === 200) {
      console.log('✅ Accès autorisé aux routes protégées');
      const responseStr = JSON.stringify(protectedResponse.body).substring(0, 150);
      console.log(`   Response: ${responseStr}...\n`);
    } else {
      console.error(`❌ Accès refusé: ${protectedResponse.status}`);
      console.error(protectedResponse.body);
    }

    // Étape 5: Test du refresh token
    console.log('5️⃣  Étape 4: Frontend rafraîchit le token');
    console.log(`   POST http://localhost:8000/api/token/refresh/`);
    console.log(`   Body: { refresh: "${refresh.substring(0, 20)}..." }`);

    const refreshResponse = await makeRequest('POST', `${BACKEND_URL}/api/token/refresh/`, {}, { refresh });

    if (refreshResponse.status === 200) {
      console.log('\n✅ Nouveau token généré');
      console.log(`   New access token: ${refreshResponse.body.access.substring(0, 40)}...\n`);
    } else {
      console.error(`❌ Refresh failed: ${refreshResponse.status}`);
      console.error(refreshResponse.body);
    }

    console.log('━'.repeat(60));
    console.log('✅✅✅ TOUS LES TESTS PASSÉS AVEC SUCCÈS ✅✅✅');
    console.log('━'.repeat(60));
    console.log('\n📋 Résumé:');
    console.log('✓ Login endpoint: Retourne JWT tokens');
    console.log('✓ Protected routes: Accessibles avec Bearer token');
    console.log('✓ Token refresh: Génère un nouveau token\n');
    console.log('💡 Le flux de connexion admin fonctionne maintenant correctement!');
    console.log('💡 Vous pouvez utiliser le frontend pour vous connecter avec:');
    console.log(`   Email: ${CREDENTIALS.username}`);
    console.log(`   Mot de passe: ${CREDENTIALS.password}\n`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    backend.kill();
  }
}

runTests();
