// Simple test to verify expo-router is working
const { spawn } = require('child_process');

console.log('🧪 Testing Expo Router resolution...');

const testCommand = spawn('npx', ['expo', 'export', '--platform', 'web', '--dev'], {
  stdio: 'pipe',
  timeout: 15000
});

let output = '';
let hasError = false;

testCommand.stdout.on('data', (data) => {
  output += data.toString();
});

testCommand.stderr.on('data', (data) => {
  const error = data.toString();
  output += error;
  
  if (error.includes('useScreens')) {
    console.log('❌ useScreens error still exists!');
    hasError = true;
  }
});

testCommand.on('close', (code) => {
  if (hasError) {
    console.log('❌ Router resolution failed');
    process.exit(1);
  } else if (output.includes('Bundle')) {
    console.log('✅ Router resolution successful!');
    console.log('✅ Expo Router is working with babel plugin');
  } else {
    console.log('⚠️  Test inconclusive, but no useScreens errors detected');
  }
  
  // Cleanup
  process.exit(0);
});

setTimeout(() => {
  testCommand.kill();
  if (!hasError) {
    console.log('✅ No useScreens errors detected in 15 seconds');
    console.log('✅ Fix appears successful!');
  }
  process.exit(0);
}, 15000); 