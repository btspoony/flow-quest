/**
 * get a ipfs gateway url from ipfs hash
 * @param ipfsHash
 */
export function getIPFSUrl(ipfsHash: string) {
  return `https://nftstorage.link/ipfs/${ipfsHash}`;
}
