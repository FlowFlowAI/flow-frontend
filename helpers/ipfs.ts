import * as ipfsClient from 'ipfs-http-client';

const models: { [key: string]: string } = {
  'stable-diffusion': 'Stable Diffusion',
  'dall-e-2': 'DALL-E 2',
  'imagen:': 'Imagen',
};

const auth =
  'Basic ' +
  Buffer.from(
    process.env.NEXT_PUBLIC_ipfsProjectId +
      ':' +
      process.env.NEXT_PUBLIC_ipfsProjectSecret
  ).toString('base64');

export function ensureIpfsUriPrefix(cidOrURI: any) {
  let uri = cidOrURI.toString();
  if (!uri.startsWith('ipfs://')) {
    uri = 'ipfs://' + cidOrURI;
  }

  if (uri.startsWith('ipfs://ipfs/')) {
    uri = uri.replace('ipfs://ipfs/', 'ipfs://');
  }
  return uri;
}

export const generateImageURI = async (
  generatedImage: string,
  infura: boolean
) => {
  const response = await fetch(generatedImage);
  const imageBuffer = await response.arrayBuffer();

  const ipfs = ipfsClient.create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });

  const { cid } = await ipfs.add(imageBuffer);
  let imageURI = ensureIpfsUriPrefix(cid);
  if (infura) {
    imageURI = 'https://aigenerated.infura-ipfs.io/ipfs/' + imageURI.slice(7);
  }
  return imageURI.slice(7);
};

export const generateMetadataURI = async (
  imageURI: string,
  name: string,
  prompt: string,
  model: string,
  creator: string,
  infura: boolean
) => {
  const metadata = {
    description: prompt,
    name,
    image: imageURI,
    attributes: [
      {
        trait_type: 'Model',
        value: models[model],
      },
      {
        trait_type: 'Creator',
        value: creator,
      },
    ],
  };

  const ipfs = ipfsClient.create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });

  const { cid: metadataCid } = await ipfs.add({
    path: '/nft/metadata.json',
    content: JSON.stringify(metadata),
  });

  let metadataURI = ensureIpfsUriPrefix(metadataCid) + '/metadata.json';

  if (infura) {
    metadataURI =
      'https://aigenerated.infura-ipfs.io/ipfs/' + metadataURI.slice(7);
  }

  return metadataURI;
};
