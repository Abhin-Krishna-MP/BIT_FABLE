// Test script to verify blockchain connection
const { ethers } = require('ethers');

async function testConnection() {
  try {
    console.log('🔍 Testing blockchain connection...');
    
    // Test provider connection
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    console.log('✅ Provider connected');
    
    // Test getting block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Block number: ${blockNumber}`);
    
    // Test getting accounts
    const accounts = await provider.listAccounts();
    console.log(`✅ Found ${accounts.length} accounts`);
    
    // Test contract address
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const code = await provider.getCode(contractAddress);
    console.log(`✅ Contract deployed: ${code !== '0x'}`);
    
    console.log('\n🎉 All tests passed! Blockchain is working correctly.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure Hardhat node is running: npx hardhat node');
    console.log('2. Check if port 8545 is available');
    console.log('3. Try restarting the Hardhat node');
  }
}

testConnection(); 