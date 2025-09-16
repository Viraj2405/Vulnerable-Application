const http = require('http');
const { performance } = require('perf_hooks');

// Test configurations
const config = {
  fibonacci: {
    normal: 10,
    malicious: 45,
    requests: 5
  },
  processData: {
    normal: { data: Array(100).fill('test') },
    malicious: { data: Array(10000).fill('x'.repeat(100)) },
    requests: 3
  }
};

// Test runner function
async function runTests() {
  console.log('Starting vulnerability tests...\n');
  
  // Test Fibonacci endpoint with normal input
  await testEndpoint('/fibonacci', { n: config.fibonacci.normal }, 'Normal Fibonacci', config.fibonacci.requests);
  
  // Test Fibonacci endpoint with malicious input
  await testEndpoint('/fibonacci', { n: config.fibonacci.malicious }, 'Malicious Fibonacci', config.fibonacci.requests);
  
  // Test Process Data endpoint with normal input
  await testEndpoint('/process-data', config.processData.normal, 'Normal Process Data', config.processData.requests, 'POST');
  
  // Test Process Data endpoint with malicious input
  await testEndpoint('/process-data', config.processData.malicious, 'Malicious Process Data', config.processData.requests, 'POST');
}

// Generic endpoint tester
function testEndpoint(path, params, testName, count, method = 'GET') {
  return new Promise((resolve) => {
    console.log(`=== Testing ${testName} (${count} requests) ===`);
    let completed = 0;
    const startTime = performance.now();
    
    for (let i = 0; i < count; i++) {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: method === 'GET' ? `${path}?${new URLSearchParams(params).toString()}` : path,
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {}
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log(`[${testName}] Request ${i+1}/${count}: Status ${res.statusCode} - ${data.length > 100 ? 'Large response' : data.trim()}`);
          if (++completed === count) {
            const endTime = performance.now();
            console.log(`Completed in ${((endTime - startTime)/1000).toFixed(2)}s\n`);
            resolve();
          }
        });
      }).on('error', (err) => {
        console.error(`[${testName}] Request ${i+1}/${count} failed:`, err.message);
        if (++completed === count) {
          const endTime = performance.now();
          console.log(`Completed with errors in ${((endTime - startTime)/1000).toFixed(2)}s\n`);
          resolve();
        }
      });
      
      if (method === 'POST') {
        req.write(JSON.stringify(params));
      }
      req.end();
    }
  });
}

// Run all tests
runTests().then(() => {
  console.log('All tests completed');
  process.exit();
});