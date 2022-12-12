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
