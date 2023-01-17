import type { RouteLocationRaw } from "vue-router";

/**
 * get a ipfs gateway url from ipfs hash
 * @param ipfsHash
 */
export function getIPFSUrl(ipfsHash: string) {
  if (ipfsHash.startsWith("http")) {
    return ipfsHash;
  } else {
    return `https://nftstorage.link/ipfs/${ipfsHash}`;
  }
}

export function getShortAddress(address: string) {
  return (
    address.substring(0, 5) +
    "..." +
    address.substring(address.length - 3, address.length)
  );
}

export function geneReferralLink(uri: string): string {
  const store = useReferralCode();
  if (typeof store.value === "string") {
    uri += `?referral=${store.value}`;
  }
  return uri;
}

export function geneReferralLinkObject(uri: string): RouteLocationRaw {
  const result: RouteLocationRaw = { path: uri };
  const store = useReferralCode();
  if (typeof store.value === "string") {
    result.query = {
      referral: store.value,
    };
  }
  return result;
}

export function shorten(str: string, max = 10): string {
  return str.length <= max ? str : `${str.slice(0, max)}...`;
}

export function isSameArray(strA: string[], strB: string[]) {
  return strA.sort().join(",") === strB.sort().join(",");
}
