const assert = require('assert');
const { time } = require('console');

const {
  createDiffieHellman,
  scrypt,
  randomFill,
  createCipheriv,
  scryptSync,
  createDecipheriv,
  createCipher,
  createHash
} = require('crypto');
const { type } = require('os');

const algorithm = 'aes-128-cbc';

// Sender
function createDiffieHellmanKey(){
    
    const diffieHellmanObject = createDiffieHellman(2048);
    const public_key = diffieHellmanObject.generateKeys('hex'); // This key should be transferred to the other party
    let prime = diffieHellmanObject.getPrime('hex')
    let generator = diffieHellmanObject.getGenerator('hex')

    let data_to_send = {'public_key': public_key,
                        'prime': prime,
                        'generator': generator}
    // TODO: Send to Socket
    await data = send_to_socket();

    const secret_key = diffieHellmanObject.computeSecret(data['public_key'], 'hex'); // Bobs does this


}

// Receiver
function receiveDiffieHellmanKey(data){

    const diffieHellmanObject = createDiffieHellman(data['prime'], 'hex', data['generator'], 'hex');
    const public_key = diffieHellmanObject.generateKeys('hex'); // This key should be transferred to the other party
    const secret_key = diffieHellmanObject.computeSecret(data['public_key'], 'hex'); // Bobs does this

    let data_to_send = {'public_key': public_key,
                        'prime': prime,
                        'generator': generator};
    // TODO: Send to Socket 
}

function encrypt(message){

    let key = secret_key.slice(0, 16) // 16 Bytes == 128 BITS   // secret_key TIENE QUE EXISTIR

    randomFill(new Uint8Array(16), (err, iv) => {
        if (err) throw err;

        // Once we have the key and iv, we can create and use the cipher...
        const cipher = createCipheriv(algorithm, key, iv); // Both need to be utf8

        let encrypted = cipher.update(alice_message, 'utf8', 'binary');
        encrypted += cipher.final('binary');
        
        let data_to_send = {'msg': encrypted,
                            'iv': iv};

        return data_to_send;
}

function decrypt(encrypted){
    key = bobSecret.slice(0, 16) // 16 Bytes == 128 BITS
    let decipher = createDecipheriv(algorithm, key, iv);

    // Encrypted using same algorithm, key and iv.
    let decrypted = decipher.update(encrypted, 'binary', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}


// Generate Alice's keys...

// p = 1024 - NSA can crack it - 128 Byes
// p = 2048 - common default these days - 256 Bytes

const alice = createDiffieHellman(2048);
const aliceKey = alice.generateKeys('hex'); // This key should be transferred to the other party

alice_prime = alice.getPrime('hex')
alice_generator = alice.getGenerator('hex')
// console.log("alice_prime", alice_prime)
// console.log("alice_generator", alice_generator)


// Generate Bob's keys...
const bob = createDiffieHellman(alice_prime, 'hex', alice_generator, 'hex');
const bobKey = bob.generateKeys('hex'); // This key should be transferred to the other party

// Exchange and generate the secret...
const aliceSecret = alice.computeSecret(bobKey, 'hex'); // Alices does this
const bobSecret = bob.computeSecret(aliceKey, 'hex'); // Bobs does this


// OK
assert.strictEqual(aliceSecret.toString(), bobSecret.toString());

console.log("LAS CLAVES SON IGUALES!!!!!")

console.log("DIFFIE KEY", aliceSecret) 
console.log("DIFFIE KEY TYPE", typeof aliceSecret) 
console.log("DIFFIE KEY LENGHT BYTES", aliceSecret.length)

// =================
// =================
// Encrypted Comunicationm
// =================
// =================

const algorithm = 'aes-128-cbc';

// =================
// Alice sending message
// =================



let alice_message = "Hello Bob!"
let new_iv = new Uint8Array(16)
let new_encrypted = ""
let key = aliceSecret.slice(0, 16) // 16 Bytes == 128 BITS
console.log("\nKEY LENGTH:", key.length)

randomFill(new_iv, (err, iv) => {
    if (err) throw err;

    console.log("\nKEY LENGTH:", key.length)
    // Once we have the key and iv, we can create and use the cipher...
    const cipher = createCipheriv(algorithm, key, iv); // Both need to be utf8

    let encrypted = cipher.update(alice_message, 'utf8', 'binary');
    encrypted += cipher.final('binary');


    console.log("\n\n\nEncrypted TYPE", typeof encrypted)
    console.log("KEY:", typeof key)
    console.log("Random IV:", typeof iv)
    console.log("Encrypted:", typeof encrypted);

    console.log("KEY:", key)
    console.log("Random IV:", iv)
    console.log("Encrypted:", encrypted);

    // =================
    // Bob reading Alice message
    // =================

    key = bobSecret.slice(0, 16) // 16 Bytes == 128 BITS
    let decipher = createDecipheriv(algorithm, key, iv);

    // Encrypted using same algorithm, key and iv.
    let decrypted = decipher.update(encrypted, 'binary', 'utf8');
    decrypted += decipher.final('utf8');
    console.log(decrypted);
});

// =================
// Bob reading Alice message
// =================

// key = bobSecret.slice(0, 16) // 16 Bytes == 128 BITS
// let decipher = createDecipheriv(algorithm, key, new_iv);

// // Encrypted using same algorithm, key and iv.
// let decrypted = decipher.update(new_encrypted, 'utf8');
// decrypted += decipher.final('utf8');
// console.log(decrypted);