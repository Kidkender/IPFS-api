export const fixRouteAddFiles = (nameFolder: string, nameFile: string) => {
  if (!nameFolder && nameFolder == '') return nameFile;
  return nameFolder + '%2F' + nameFile;
};

export const getLinkIpfs = (cid: string): string => {
  if (!cid) return;
  return 'https://ipfs.io/ipfs/' + cid;
};
