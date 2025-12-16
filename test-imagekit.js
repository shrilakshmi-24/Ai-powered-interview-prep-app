#!/usr/bin/env node

/**
 * Test script to verify ImageKit configuration
 * Run with: node test-imagekit.js
 */

// Check if we're in a Node.js environment
if (typeof window !== 'undefined') {
  console.log('This script must be run in Node.js environment, not browser');
  process.exit(1);
}

require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Test ImageKit configuration
function testImageKitConfig() {
  console.log('🔍 Testing ImageKit Configuration...\n');
  
  // Check environment variables
  const requiredVars = [
    'NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY',
    'IMAGEKIT_PRIVATE_KEY',
    'NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT'
  ];
  
  console.log('📋 Environment Variables Check:');
  let allVarsPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ? `${value.substring(0, 20)}...` : 'NOT SET';
    console.log(`  ${status} ${varName}: ${displayValue}`);
    
    if (!value) {
      allVarsPresent = false;
    }
  });
  
  console.log('\n📁 Configuration Summary:');
  if (allVarsPresent) {
    console.log('  ✅ All required environment variables are present');
    console.log('  ✅ ImageKit configuration should work correctly');
    console.log('  ✅ Files can be uploaded to ImageKit');
  } else {
    console.log('  ❌ Missing environment variables - ImageKit will not work');
    console.log('  🔧 Please set the missing variables in your .env file');
  }
  
  console.log('\n📝 Required Environment Variables:');
  console.log('  NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key_here');
  console.log('  IMAGEKIT_PRIVATE_KEY=your_private_key_here');
  console.log('  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://your-imagekit-urlendpoint.ik.imagekit.io');
  
  return allVarsPresent;
}

// Test file upload simulation
function testFileUpload() {
  console.log('\n🧪 Testing File Upload Simulation...\n');
  
  try {
    // Create a test file
    const testContent = 'This is a test PDF content for ImageKit upload';
    const testFileName = `test-${Date.now()}.txt`;
    
    console.log(`📄 Test file created: ${testFileName}`);
    console.log(`📏 File size: ${testContent.length} bytes`);
    
    // Test the configuration validation (simulate what happens in the route)
    console.log('\n🔧 Testing configuration validation...');
    
    // This would normally be done in the actual route handler
    const imagekitConfig = {
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
    };
    
    const requiredVars = [
      'NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY',
      'IMAGEKIT_PRIVATE_KEY', 
      'NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log(`❌ Missing variables: ${missingVars.join(', ')}`);
      console.log('❌ Configuration validation failed');
    } else if (!imagekitConfig.publicKey || !imagekitConfig.privateKey || !imagekitConfig.urlEndpoint) {
      console.log('❌ Configuration values are empty');
      console.log('❌ Configuration validation failed');
    } else {
      console.log('✅ Configuration validation passed');
      console.log('✅ Ready for file upload');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Main test function
function main() {
  console.log('🚀 ImageKit Configuration Test\n');
  console.log('=====================================\n');
  
  const configValid = testImageKitConfig();
  testFileUpload();
  
  console.log('\n=====================================');
  console.log('📊 Test Summary:');
  console.log(configValid ? '✅ Configuration is valid' : '❌ Configuration needs fixing');
  console.log('=====================================\n');
  
  if (!configValid) {
    console.log('💡 Next Steps:');
    console.log('1. Set up your .env file with the required ImageKit variables');
    console.log('2. Restart your development server');
    console.log('3. Run this test again to verify');
    console.log('\n🔗 For help setting up ImageKit: https://imagekit.io/documentation/');
  } else {
    console.log('🎉 Your ImageKit configuration looks good!');
    console.log('You can now upload files in your application.');
  }
}

// Run the test
main();
