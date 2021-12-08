const assert = require('assert');

const {
  createDiffieHellman,
  scrypt,
  randomFill,
  createCipheriv,
  scryptSync,
  createDecipheriv
} = require('crypto');

// Generate Alice's keys...
const alice = createDiffieHellman(128);
const aliceKey = alice.generateKeys();

// Generate Bob's keys...
const bob = createDiffieHellman(alice.getPrime(), alice.getGenerator());
const bobKey = bob.generateKeys();

// Exchange and generate the secret...
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

// OK
assert.strictEqual(aliceSecret.toString('hex'), bobSecret.toString('hex'));

console.log("DIFFIE KEY", aliceSecret)
console.log("DIFFIE KEY LENGHT BYTES", aliceSecret.length)

// =================
// =================
// Encrypted Comunicationm
// =================
// =================

// =================
// Alice sending message
// =================

console.log("ENCRYPTING")

const algorithm = 'aes-128-cbc';
let key = aliceSecret
// The IV must be randomly generated for each message and send along with the message
// It can be publicly seen in plain text 
let iv = "0123456789012345"  
let alice_message = "Hello Bob"
const cipher = createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(alice_message, 'utf8', 'hex');
encrypted += cipher.final('hex');

console.log("Encrypted Message", encrypted)


// =================
// Bob reading Alice message
// =================

// Bob recieve the iv but he already has his secret key
key = bobSecret

const decipher = createDecipheriv(algorithm, key, iv);
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');
console.log("Decrypted Message", decrypted);