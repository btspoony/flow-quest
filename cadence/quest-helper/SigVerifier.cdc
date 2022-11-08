/**
## The contract of signature verifier

> Author: Bohao Tang<tech@btang.cn>

*/
import Crypto

pub contract SigVerifier {

    /**    ____ _  _ ____ _  _ ___ ____
       *   |___ |  | |___ |\ |  |  [__
        *  |___  \/  |___ | \|  |  ___]
         ******************************/

    pub event ContractInitialized()

    /**    ____ _  _ _  _ ____ ___ _ ____ _  _ ____ _    _ ___ _   _
       *   |___ |  | |\ | |     |  | |  | |\ | |__| |    |  |   \_/
        *  |    |__| | \| |___  |  | |__| | \| |  | |___ |  |    |
         ***********************************************************/

    pub fun valifyAnySignatureRaw(
        publicKeys: [String],
        keyWeights: [UFix64],
        signatureAlgos: [SignatureAlgorithm],
        hashAlgos: [HashAlgorithm],
        signatureSet: [Crypto.KeyListSignature],
        message: [UInt8],
    ): Bool {
        pre {
            publicKeys.length == keyWeights.length && publicKeys.length == signatureAlgos.length && publicKeys.length == hashAlgos.length
                : "Key length is miss match"
        }
        let keyList = Crypto.KeyList()

        // setup key list
        let keyLen = publicKeys.length
        var i = 0
        while i < keyLen {
            keyList.add(
                PublicKey(
                    publicKey: publicKeys[i].decodeHex(),
                    signatureAlgorithm: signatureAlgos[i],
                ),
                hashAlgorithm: hashAlgos[i],
                weight: keyWeights[i]
            )
            i = i + 1
        }

        return keyList.verify(
            signatureSet: signatureSet,
            signedData: message
        )
    }

    init() {
        emit ContractInitialized()
    }
}
