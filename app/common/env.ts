


export const DATABASE_URL = process.env.DATABASE_URL ?? "mongodb://127.0.0.1:27017/";
export const BYTES_PER_ID = 48; // 48 bytes per ID seems reasonable. 2^48 = 1.84e19
export const MAX_NAME_LENGTH = 40;
export const MAX_SCOPE_LENGTH = 40;
console.log(`DATABASE_URL="${DATABASE_URL}"`);
console.log(`BYTES_PER_ID="${BYTES_PER_ID}"`);
console.log(`MAX_SCOPE_LENGTH="${MAX_SCOPE_LENGTH}"`);
console.log(`MAX_NAME_LENGTH="${MAX_NAME_LENGTH}"`);


