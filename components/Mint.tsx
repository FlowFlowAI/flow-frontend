import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as ipfsClient from 'ipfs-http-client';
import {
  FaHatCowboy,
  FaFrog,
  FaRocket,
  FaTrashAlt,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { TbWorld } from 'react-icons/tb';
import { FiExternalLink } from 'react-icons/fi';
import { FaDog } from 'react-icons/fa';
import { MdAddCircle } from 'react-icons/md';
import { BsFillCheckCircleFill } from 'react-icons/bs';
import Select from 'react-select';
import { collections } from '../data/collections';
import { NetworkContext, TronWebContext } from '../pages/_app';
import {
  ensureIpfsUriPrefix,
  generateImageURI,
  generateMetadataURI,
} from '../helpers/ipfs';

import mayurimg from "./mayur.jpg"
// import NFT from '../contracts/out/NFT.sol/NFT.json';
import { backendClient } from "../src/graphql/backendClient"
import {
  UploadNftContentMutation,
  UploadNftContentMutationVariables,
} from "../generated/graphql"

export const imagesOptions = [
  {
    value: '1',
    label: (
      <div className="p-3 rounded-lg">
        <span>1 image</span>
      </div>
    ),
  },
  {
    value: '4',
    label: (
      <div className="p-3">
        <span>4 images</span>
      </div>
    ),
  },
];

export const modelOptions = [
  {
    value: 'stable-diffusion',
    label: (
      <div className="p-3 rounded-lg">
        <span>Stable Diffusion</span>
      </div>
    ),
  },
  {
    value: 'dall-e-2',
    label: (
      <div className="p-3">
        <span>DALL-E 2</span>
      </div>
    ),
  },
  {
    value: 'imagen',
    label: (
      <div className="p-3">
        <span>Imagen</span>
      </div>
    ),
  },
];

export const collectionOptions = [
  {
    value: 'the-random-collection',
    label: (
      <div className="flex gap-2 items-center p-3">
        <TbWorld />
        <span>The Random Collection</span>
      </div>
    ),
  },
  {
    value: 'the-dog-collection',
    label: (
      <div className="flex gap-2 items-center p-3">
        <FaDog />
        <span>The Dog Collection</span>
      </div>
    ),
  },
  {
    value: 'the-space-collection',
    label: (
      <div className="flex gap-2 items-center p-3">
        <FaRocket />
        <span>The Space Collection</span>
      </div>
    ),
  },
  {
    value: 'the-walter-white-collection',
    label: (
      <div className="flex gap-2 items-center p-3">
        <FaHatCowboy />
        <span>The Walter White Collection</span>
      </div>
    ),
  },
];

const customStyles = {
  option: (provided: any, state: any) => ({
    ...provided,
    // borderBottom: '2px solid grey',
    color: state.isSelected ? 'grey' : 'white',
    backgroundColor: '#27272a',
    // backgroundColor: state.isSelected ? 'grey' : 'black',
    ':hover': {
      cursor: 'pointer',
      backgroundColor: state.isSelected ? '' : '#3f3f46',
    },
  }),
  input: (provided: any) => ({
    ...provided,
    color: 'white',
  }),
  control: (provided: any) => ({
    ...provided,
    margin: 0,
    backgroundColor: '#27272a',
    border: 0,
    outline: 'none',
    // This line disable the blue border
    boxShadow: 'none',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'white',
    // backgroundColor: 'green',
  }),
  menuList: (provided: any) => ({
    ...provided,
    backgroundColor: '#27272a',
    paddingTop: 0,
    paddingBottom: 0,
    border: `1px solid black`,
    // height: '100px',
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    backgroundColor: '#27272a',
  }),
};

const modelIdToModelName: { [key: string]: string } = {
  'stable-diffusion': 'Stable Diffusion',
  'dall-e-2': 'DALL-E 2',
  imagen: 'Imagen',
};

export default function Mint() {
  const network = useContext(NetworkContext);
  const tronWeb = useContext(TronWebContext);
  const [collection, setCollection] = useState('the-random-collection');
  const [model, setModel] = useState('stable-diffusion');
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm();
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [chosenIndex, setChosenIndex] = useState(0);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generateError, setGenerateError] = useState(false);
  const [nextTokenId, setNextTokenId] = useState('0');
  const [viewRules, setViewRules] = useState(false);
  const [mintingStatus, setMintingStatus] = useState('mint');
  const [nftLink, setNftLink] = useState('https://apenft.io');
  const [bannerImages, setBannerImages] = useState(
    collections['shasta']['the-space-collection'].banner
  );
  const [numberOfImages, setNumberOfImages] = useState<'1' | '4'>('1');

  const onSubmit = async ({ prompt }: any) => {
    setGenerateError( false );
          console.log("----process.env.NEXT_PUBLIC_api_ke2y-",process.env.NEXT_PUBLIC_api_key)

    if (prompt === 'test') {
      // setError('words', { type: 'custom', message: 'custom message' });
      setGeneratedImages(['/generated/space1.png']);
      setGeneratedPrompt('test prompt');
      return;
    }

    const valid = validatePrompt(prompt, collection, model);
    if (!valid) {
      setError('rules', {
        type: 'custom',
        message: 'Prompt does not adhere to the collection rules',
      });
      setTimeout(() => {
        clearErrors('rules');
      }, 5000);
      return;
    }

    // setGeneratedImage('');
    setGeneratedImages([]);
    setChosenIndex(0);
    setGeneratedPrompt('');
    setMintingStatus('mint');

    let result = { images: [], error: '' };

    const x = numberOfImages === '1' ? 75 : 140;

    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 90) {
          if (result.images.length === 0) {
            let progresses = [70, 75, 80];
            oldProgress = progresses[Math.floor(Math.random() * 3)];
          }
        }
        if (oldProgress === 100) {
          clearInterval(timer);
          return 0;
        }

        return oldProgress + 1;
      });
    }, x);
        console.log("----process.env.NEXT_PUBLIC_api_ke2y-",process.env.NEXT_PUBLIC_api_key)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_api_key}/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            prompt,
            outputs: numberOfImages,
          }),
        }
      );
      result = await response.json();
    } catch (e) {
      console.log(e);
      result.error = 'connection error';
    }

    console.log(result);

    if (result.error) {
      setGenerateError(true);
      clearInterval(timer);
      setProgress(0);
      return;
    }

    // setGeneratedImage(result.images[0]);
    setGeneratedImages(result.images);
    setGeneratedPrompt(prompt);

    try {
      const chosenCollection = collections[network][collection];
      const nftContract = await tronWeb.contract(
        NFT.abi,
        chosenCollection.address
      );
      const nextTokenID = await nftContract.tokenId().call();

      setNextTokenId(nextTokenID.toString());
    } catch (e) {
      console.log(e);
    }
  };

  const validatePrompt = (
    prompt: string,
    collection: string,
    model: string
  ) => {
    let lowerCasePrompt = prompt.toLowerCase();
    let rules = collections[network][collection].rules;
    return (
      rules.length === 0 ||
      rules.some((substring) => lowerCasePrompt.includes(substring))
    );
  };

  const handleChangeCollection = (selectedOption: any) => {
    setChosenIndex(0);
    setGeneratedImages([]);
    setCollection(selectedOption.value);
    setMintingStatus('mint');
  };

  const handleChangeModel = (selectedOption: any) => {
    setModel(selectedOption.value);
  };

  const handleChangeNumberOfImages = (selectedOption: any) => {
    setNumberOfImages(selectedOption.value);
  };

  const mintNft = async () => {
    if (!tronWeb || generatedImages.length === 0) return;
    const generatedImage = generatedImages[chosenIndex];
    try {
      setMintingStatus('minting');


      const creator = tronWeb.defaultAddress.base58;
      const name = collections[network][collection].name + ' #' + nextTokenId;
      const imageURI = await generateImageURI(generatedImage, true);
      const metadataURI = await generateMetadataURI(
        imageURI,
        name,
        generatedPrompt,
        'Stable Diffusion',
        creator,
        true
      );

        const { uploadNFTContent } = await backendClient<
          UploadNftContentMutation,
          UploadNftContentMutationVariables
        >("fileUpload", {
          name: "file.name",
          description: "Created using Mintme by Niftory",
          contentType: "image/jpeg",
          posterContentType: "image/jpeg",
        })

      // s

      // address, date, creator, tokenId
      setTimeout(() => {
        setMintingStatus('minted');

        setNftLink(
          `https://testnet.flowscan.org/${
            chosenCollection.address
          }/${nextTokenId}`
        );
      }, 7500);
    } catch (e) {
      console.log(e);
      setMintingStatus('mint');
    }
  };

  useEffect(() => {
    if (!collection || !network || !tronWeb) return;
    const getNextId = async () => {
      try {
        const chosenCollection = collections[network][collection];
        const nftContract = await tronWeb.contract(
          NFT.abi,
          chosenCollection.address
        );
        const nextTokenID = await nftContract.tokenId().call();

        setNextTokenId(nextTokenID.toString());
      } catch (e) {
        console.log(e);
      }
    };
    getNextId();
  }, [collection, network, tronWeb]);

  // if (network && collection) {
  // bannerImages = collections[network][collection].banner;
  // }

  useEffect(() => {
    if (!network || !collection) return;
    setBannerImages(collections[network][collection].banner);
  }, [network, collection]);

  return (
    <>
      <div className="w-3/4 lg:w-[48rem] flex flex-col gap-4">
        <label className="text-xl">Choose collection</label>
        <Select
          className="w-full"
          defaultValue={{
            label: collectionOptions[0].label,
            value: collectionOptions[0].value,
          }}
          options={collectionOptions}
          styles={customStyles}
          onChange={handleChangeCollection}
          autoFocus={true}
        />
      </div>
      {/* <div className="m-5 md:m-10 flex overflow-x-scroll gap-3"> */}
      <div
        className="w-full px-4 grid items-center justify-between gap-3 grid-rows-1 overflow-y-hidden 
      grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 3xl:grid-cols-9 my-5"
      >
        {[...Array(3)].map((_, i) => (
          <a
            key={i}
            href={bannerImages[i]?.nft}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer"
          >
            <img
              src={bannerImages[i]?.image}
              alt="generated image"
              className="rounded-xl "
            ></img>
          </a>
        ))}
        <a
          className="cursor-pointer hidden sm:block"
          href={bannerImages[3]?.nft}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={bannerImages[3]?.image}
            alt="generated image"
            className="rounded-xl "
          ></img>
        </a>
        <a
          className="cursor-pointer hidden md:block"
          href={bannerImages[4]?.nft}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={bannerImages[4]?.image}
            alt="generated image"
            className="rounded-xl "
          ></img>
        </a>
        <a
          className="cursor-pointer hidden lg:block"
          href={bannerImages[5]?.nft}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={bannerImages[5]?.image}
            alt="generated image"
            className="rounded-xl "
          ></img>
        </a>
        <a
          className="cursor-pointer hidden xl:block"
          href={bannerImages[6]?.nft}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={bannerImages[6]?.image}
            alt="generated image"
            className="rounded-xl "
          ></img>
        </a>
        <a
          className="cursor-pointer hidden 2xl:block"
          href={bannerImages[0]?.nft}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={bannerImages[0]?.image}
            alt="generated image"
            className="rounded-xl "
          ></img>
        </a>
        <a
          className="cursor-pointer hidden 3xl:block"
          href={bannerImages[1]?.nft}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={bannerImages[1]?.image}
            alt="generated image"
            className="rounded-xl "
          ></img>
        </a>
      </div>
      {/* className="h-40 w-40 lg:h-52 lg:w-52 rounded-lg" */}
      <div className="w-3/4 lg:w-[48rem] flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:gap-4 items-center mb-3">
          <h1 className="text-2xl md:text-3xl text-center flex gap-4 items-center">
            {collections[network][collection].name}{' '}
            <BsFillCheckCircleFill className="h-7 w-7 mt-1 text-green-400" />
          </h1>
          <p className="text-center text-zinc-300 w-full md:w-5/6 text-sm md:text-base">
            {collections[network][collection].description}{' '}
          </p>
          {collections[network][collection].rules.length > 0 && (
            <div className="flex flex-col gap-2 border-4 border-zinc-800 w-full md:w-5/6 rounded-lg">
              <p
                onClick={() => setViewRules(!viewRules)}
                className="flex justify-between items-center px-4 py-3 font-semibold cursor-pointer"
              >
                Collection Rules
                {viewRules ? <FaChevronDown /> : <FaChevronUp />}
              </p>
              {viewRules && (
                <div className="flex flex-col gap-2 py-2 px-5 mb-2">
                  <p className="text-lg font-semibold">
                    The prompt needs to contain atleast one of the following
                    words:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {collections[network][collection].rules.map((word) => (
                      <p
                        key={word}
                        className="py-2 px-4 bg-zinc-800 rounded-lg hover:bg-green-400 hover:text-black cursor-pointer"
                      >
                        {word}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <div className="flex gap-2">
            <Select
              className="w-2/3"
              defaultValue={{
                label: modelOptions[0].label,
                value: modelOptions[0].value,
              }}
              options={modelOptions}
              styles={customStyles}
              onChange={handleChangeModel}
            />
            <Select
              className="w-1/3"
              defaultValue={{
                label: imagesOptions[0].label,
                value: imagesOptions[0].value,
              }}
              options={imagesOptions}
              styles={customStyles}
              onChange={handleChangeNumberOfImages}
            />
          </div>

          {model !== 'stable-diffusion' && (
            <p className="px-2 py-2 text-red-400">
              Unfortunately, we don&apos;t support {modelIdToModelName[model]}{' '}
              at the moment.
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            className="bg-zinc-800 lg:text-lg px-4 py-3.5 w-4/6 md:w-4/6 lg:w-4/5 rounded-l-md outline-none mb-2"
            placeholder="Enter your prompt..."
            {...register('prompt', { required: true })}
          />
          <button
            type="submit"
            className={
              'bg-green-400 text-black text-base lg:text-lg font-semibold px-4 py-[0.85rem] w-2/6 md:w-2/6 lg:w-1/5 rounded-r-md outline-none hover:bg-white ' +
              (model !== 'stable-diffusion' ? 'cursor-not-allowed' : '')
            }
            disabled={model !== 'stable-diffusion'}
          >
            Generate
          </button>
          {errors.prompt && (
            <span className="px-2 text-red-400">This field is required</span>
          )}
          {errors.rules && (
            <span className="px-2 text-red-400">
              Prompt does not follow to the collection rules
            </span>
          )}
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-12 mt-3">
          <div className="flex flex-col gap-4">
            {generatedImages.length === 0 || progress !== 0 ? (
              <div className="relative mb-4 w-full h-64 md:h-80 bg-zinc-900 rounded-lg ">
                <div
                  className="h-64 md:h-80 bg-zinc-800 rounded-lg"
                  style={{ width: Math.floor(progress) + '%' }}
                ></div>
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">
                  {generateError
                    ? 'Problem generating image. Try again!'
                    : progress === 0
                    ? 'Ready!'
                    : `${Math.floor(progress)}%`}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <img
                  src={`${generatedImages[chosenIndex]}`}
                  alt="generated image"
                  className="h-64 md:h-80 rounded-lg"
                ></img>
                <div className="flex gap-1 justify-center">
                  {generatedImages &&
                    generatedImages.length > 1 &&
                    generatedImages?.map((image, i) => {
                      return (
                        <img
                          key={image}
                          onClick={() => setChosenIndex(i)}
                           src={`${image}`}
                          
                          alt="generated image"
                          className={
                            'h-8 md:h-12 cursor-pointer rounded-lg border-2 ' +
                            (i === chosenIndex
                              ? 'border-green-400'
                              : 'border-black')
                          }
                        ></img>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 font-semibold">
              <div className="flex flex-col gap-2 bg-zinc-800 rounded-md p-4">
                <p className="text-sm">Model</p>
                <p className="text-xs md:text-sm overflow-x-scroll">
                  Stable Diffusion
                </p>
              </div>
              <div className="flex flex-col gap-2 bg-zinc-800 rounded-md p-4">
                <p className="text-sm">Creator</p>
                <p className="text-xs md:text-sm overflow-x-scroll">
                  {tronWeb ? tronWeb.defaultAddress.base58 : '0x0'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold mt-5">
              {collections[network][collection].name} #{nextTokenId}
            </h1>
            <p className="text-lg">{watch('prompt')}</p>
            <p className="text-xl font-semibold mt-2">Collection</p>
            <div className="flex items-center gap-5">
              <img
                src={collections[network][collection].image}
                alt="generated image"
                className="h-12 w-12 rounded-md"
              ></img>
              <p>{collections[network][collection].name}</p>
            </div>
            <p className="font-semibold text-xl mt-3">Details</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg">Minted</p>
                <p className="text-lg text-gray-400">
                  {mintingStatus === 'minted'
                    ? new Date().toISOString().split('T')[0]
                    : 'Not minted yet'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg">Owned by</p>
                <p className="text-lg text-gray-400">
                  {mintingStatus === 'minted' ? 'You' : 'No one'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg">Network</p>
                <p className="text-lg text-gray-400">
                  {network === 'mainnet' ? 'Tron mainnet' : 'Shasta testnet'}
                </p>
              </div>
            </div>
            {mintingStatus === 'minted' ? (
              <>
                <a
                  className="mt-4 border border-green-400 text-green-400 flex justify-center items-center gap-2 font-semibold px-4 py-3 rounded-md outline-none hover:bg-green-400 hover:text-black cursor-pointer"
                  href={nftLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>View on Apenft</span>
                  <FiExternalLink />
                </a>
                <p className="text-xs text-gray-400">
                  * it will take a couple of minutes for apenft to index your
                  nft
                </p>
              </>
            ) : mintingStatus === 'minting' ? (
              <button className="mt-4 bg-green-400 text-black font-semibold px-4 py-3 rounded-md outline-none hover:bg-white">
                Minting...
              </button>
            ) : (
              <button
                type="submit"
                className="mt-4 bg-green-400 text-black font-semibold px-4 py-3 rounded-md outline-none hover:bg-white"
                onClick={mintNft}
              >
                Mint NFT
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
