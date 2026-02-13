import crypto from 'crypto';

/**
 * Generates the SHA-512 hash required by PayU.
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|...|udf10|salt)
 */
export function generatePayUHash(params: {
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
}) {
    const { txnid, amount, productinfo, firstname, email } = params;
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    if (!key || !salt) {
        throw new Error("PayU credentials missing in .env");
    }

    // Standard PayU Hash params (udf1-udf10 are empty)
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;

    console.log(`\n=== [PayU Hash Debug] ===`);
    console.log(`Input String: ${hashString}`);

    return crypto.createHash('sha512').update(hashString).digest('hex');
}

/**
 * Verifies the Reverse Hash sent by PayU in the callback.
 * Formula: sha512(salt|status||||||udf10|...|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayUHash(params: {
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    status: string;
    hash: string;
}) {
    const { txnid, amount, productinfo, firstname, email, status, hash } = params;
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    if (!key || !salt) throw new Error("PayU credentials missing");

    const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    return calculatedHash === hash;
}