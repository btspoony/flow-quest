import * as fcl from "@onflow/fcl";
import elliptic from "elliptic";
import { SHA3 } from "sha3";

const ec = new elliptic.ec("p256");

class FlowSigner {
  private flowAddress: string;
  private privateKeyHex: string;
  private accountIndex: number;
  private addressMapping: { [key: string]: string };

  constructor(
    flowAddress: string,
    privateKeyHex: string,
    accountIndex: number,
    addressMapping?: { [key: string]: string }
  ) {
    this.flowAddress = flowAddress;
    this.privateKeyHex = privateKeyHex;
    this.accountIndex = accountIndex;
    this.addressMapping = addressMapping ?? {};
  }

  _buildAuthorization() {
    console.log("Authz Addr:", this.flowAddress);
    return async (account: fcl.Account): Promise<fcl.AuthZ> => {
      const user = await this.getAccount(this.flowAddress);
      const key = user.keys[this.accountIndex];

      return {
        ...account,
        tempId: `${user.address}-${key.index}`,
        addr: fcl.sansPrefix(user.address),
        keyId: Number(key.index),
        signingFunction: (signable) => {
          return {
            addr: fcl.withPrefix(user.address),
            keyId: Number(key.index),
            signature: this._signWithKey(this.privateKeyHex, signable.message),
          };
        },
      };
    };
  }

  _signWithKey(privateKey: string, msg: string) {
    const key = ec.keyFromPrivate(Buffer.from(privateKey, "hex"));
    const sig = key.sign(this._hashMsg(msg));
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, "be", n);
    const s = sig.s.toArrayLike(Buffer, "be", n);
    return Buffer.concat([r, s]).toString("hex");
  }

  _hashMsg(msg: string) {
    const sha = new SHA3(256);
    sha.update(Buffer.from(msg, "hex"));
    return sha.digest();
  }

  async getAccount(addr: string): Promise<fcl.Account> {
    const account = await fcl.send([fcl.getAccount(addr)]).then(fcl.decode);
    return account;
  }

  /**
   * General method of sending transaction
   *
   * @param code
   * @param args
   */
  async sendTransaction(code: string, args: fcl.ArgumentFunction) {
    let transactionId: string;
    const authz = this._buildAuthorization();

    try {
      transactionId = await fcl.mutate({
        cadence: replaceImportAddresses(code, this.addressMapping),
        args: args,
        proposer: authz,
        payer: authz,
        authorizations: [authz],
      });
      console.log("Tx Sent:", transactionId);
      return transactionId;
    } catch (e: any) {
      console.log(e);
      return null;
    }
  }

  watchTransaction(
    transactionId: string,
    onSealed?: (txId: string, errorMsg?: string) => void,
    onStatusUpdated?: (code: fcl.TransactionStatus) => void,
    onErrorOccured?: (errorMsg: string) => void
  ) {
    fcl.tx(transactionId).subscribe((res) => {
      if (onStatusUpdated) {
        onStatusUpdated(res.status);
      }

      if (res.status === 4) {
        if (res.statusCode !== 0 && onErrorOccured) {
          onErrorOccured(res.errorMessage);
        }
        // on sealed callback
        if (typeof onSealed === "function") {
          onSealed(
            transactionId,
            res.statusCode === 0 ? undefined : res.errorMessage
          );
        }
      }
    });
  }

  async executeScript(
    code: string,
    args: fcl.ArgumentFunction,
    defaultValue: any
  ): Promise<any> {
    try {
      const queryResult = await fcl.query({
        cadence: replaceImportAddresses(code, this.addressMapping),
        args,
      });
      return queryResult ?? defaultValue;
    } catch (e) {
      console.error(e);
    }
  }
}

export default FlowSigner;

/**
 * Returns Cadence template code with replaced import addresses
 *
 * @param code - Cadence template code.
 * @param addressMap - name/address map or function to use as lookup table for addresses in import statements.
 * @param byName - lag to indicate whether we shall use names of the contracts.
 */
export function replaceImportAddresses(
  code: string,
  addressMap: ((key: string) => string) | { [key: string]: string },
  byName = true
): string {
  const REGEXP_IMPORT = /(\s*import\s*)([\w\d]+)(\s+from\s*)([\w\d"-.\\/]+)/g;

  return code.replace(
    REGEXP_IMPORT,
    (match, imp: string, contract: string, _, address: string) => {
      const key = byName ? contract : address;
      const newAddress =
        addressMap instanceof Function ? addressMap(key) : addressMap[key];

      // If the address is not inside addressMap we shall not alter import statement
      const validAddress = newAddress || address;
      return `${imp}${contract} from ${validAddress}`;
    }
  );
}
