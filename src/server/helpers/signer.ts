import fcl from "@onflow/fcl";
import elliptic from "elliptic";
import { SHA3 } from "sha3";

const ec = new elliptic.ec("p256");

class FlowSigner {
  private flowAddress: string;
  private privateKeyHex: string;
  private accountIndex: number;

  constructor(
    flowAddress: string,
    privateKeyHex: string,
    accountIndex: number
  ) {
    this.flowAddress = flowAddress;
    this.privateKeyHex = privateKeyHex;
    this.accountIndex = accountIndex;
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
  async sendTransaction(code: string, args: fcl.ArugmentFunction) {
    let transactionId: string;
    const authz = this._buildAuthorization();

    try {
      transactionId = await fcl.mutate({
        cadence: code,
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
    args: fcl.ArugmentFunction,
    defaultValue: any
  ): Promise<any> {
    try {
      const queryResult = await fcl.query({ cadence: code, args });
      return queryResult ?? defaultValue;
    } catch (e) {
      console.error(e);
    }
  }
}

export default FlowSigner;
