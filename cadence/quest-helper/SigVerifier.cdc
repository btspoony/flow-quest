/**
## The contract of signature verifier

> Author: Bohao Tang<tech@btang.cn>

*/
import Crypto

pub contract SigVerifier {

    /**    ____ ___ ____ ___ ____
       *   [__   |  |__|  |  |___
        *  ___]  |  |  |  |  |___
         ************************/

    access(self) let domainSeparationTagFlowUser: String
    access(self) let domainSeparationTagAccountProof: String

    /**    ____ _  _ ____ _  _ ___ ____
       *   |___ |  | |___ |\ |  |  [__
        *  |___  \/  |___ | \|  |  ___]
         ******************************/

    pub event ContractInitialized()

    /**    ____ _  _ _  _ ____ ___ _ ____ _  _ ____ _    _ ___ _   _
       *   |___ |  | |\ | |     |  | |  | |\ | |__| |    |  |   \_/
        *  |    |__| | \| |___  |  | |__| | \| |  | |___ |  |    |
         ***********************************************************/

    access(self) fun verifyAnySignatureWithWeight(
        publicKeys: [String],
        keyWeights: [UFix64],
        signatureAlgos: [SignatureAlgorithm],
        hashAlgos: [HashAlgorithm],
        message: String,
        signatures: [String],
        domainSeparationTag: String,
    ): Bool {
        pre {
            publicKeys.length == keyWeights.length && publicKeys.length == signatureAlgos.length && publicKeys.length == hashAlgos.length
                : "Key length is miss match"
        }
        let messageBytes = message.decodeHex()

        var totalWeight: UFix64 = 0.0
        let seenKeyIndices: {Int: Bool} = {}

        // setup key list
        let keyLen = publicKeys.length
        var i = 0
        while i < keyLen {
            let signature = signatures[i].decodeHex()

            // Ensure this key index has not already been seen
            if seenKeyIndices[i] ?? false {
                return false
            }

            // Record the key index was seen
            seenKeyIndices[i] = true

            let pubKey = PublicKey(
                publicKey: publicKeys[i].decodeHex(),
                signatureAlgorithm: signatureAlgos[i],
            )

            // Ensure the signature is valid
            if !pubKey.verify(
                signature: signature,
                signedData: messageBytes,
                domainSeparationTag: domainSeparationTag,
                hashAlgorithm: hashAlgos[i]
            ) {
                return false
            }

            totalWeight = totalWeight + keyWeights[i]
            i = i + 1
        }

        // Non-custodial users can only generate a weight of 999
        return totalWeight >= 999.0
    }

    // Verify account proof
    pub fun verifyAccountProofSignatures(
        publicKeys: [String],
        keyWeights: [UFix64],
        signatureAlgos: [SignatureAlgorithm],
        hashAlgos: [HashAlgorithm],
        message: String,
        signatures: [String]
    ): Bool {
        return self.verifyAnySignatureWithWeight(
            publicKeys: publicKeys,
            keyWeights: keyWeights,
            signatureAlgos: signatureAlgos,
            hashAlgos: hashAlgos,
            message: message,
            signatures: signatures,
            domainSeparationTag: self.domainSeparationTagAccountProof,
        ) ||
        self.verifyAnySignatureWithWeight(
            publicKeys: publicKeys,
            keyWeights: keyWeights,
            signatureAlgos: signatureAlgos,
            hashAlgos: hashAlgos,
            message: message,
            signatures: signatures,
            domainSeparationTag: self.domainSeparationTagFlowUser,
        )
    }

    init() {
        self.domainSeparationTagFlowUser = "FLOW-V0.0-user"
        self.domainSeparationTagAccountProof = "FCL-ACCOUNT-PROOF-V0.0"

        emit ContractInitialized()
    }
}
