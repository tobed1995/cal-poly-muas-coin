const VerifyErrorCode = {
    OK: 0,
    HASH_FAULT: -1,
    TOO_MANY_SIGNATURES: -2,
    SIGNATURES_INVALID: -3,
    INPUTS_INVALID: -4,
    COIN_INBALANCE: -5,
    ALREADY_IN_CHAIN: -6,
    DUPLICATE_INPUT: -7
};

module.exports = VerifyErrorCode;