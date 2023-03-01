import { useState } from 'react';
import Select from 'react-select';
import { useForm } from 'react-hook-form';

export const blockchains = [
  {
    value: 'shasta-testnet',
    label: (
      <div className="p-2 rounded-lg">
        <span>Shasta Testnet</span>
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

export default function Create() {
  const [progress, setProgress] = useState(0);
  const [blockchain, setBlockchain] = useState('shasta-testnet');
  const [generateError, setGenerateError] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const {
    register: registerGenerate,
    handleSubmit: handleGenerate,
    formState: { errors },
  } = useForm();
  const {
    register: registerCreate,
    handleSubmit: handleCreate,
    formState,
  } = useForm();

  const onSubmitGenerate = async ( { prompt }: any ) =>
  {
          console.log("----process.env.NEXT_PUBLIC_api_key-1",process.env.NEXT_PUBLIC_api_key)

    setGeneratedImages([]);
      console.log("----process.env.NEXT_PUBLIC_api_ke2y-",process.env.NEXT_PUBLIC_api_key)

    let result = { images: [], error: '' };

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
    }, 75);

    try
    {
      console.log("----process.env.NEXT_PUBLIC_api_key-",process.env.NEXT_PUBLIC_api_key)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_api_key}/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'stable-diffusion',
            prompt,
            outputs: 1,
          }),
        }
      );
      result = await response.json();
    } catch (e) {
      console.log(e);
      result.error = 'connection error';
    }

    if (result.error) {
      setGenerateError(true);
      clearInterval(timer);
      setProgress(0);
      return;
    }

    console.log(result);
    setGeneratedImages(result.images);
  };

  const onSubmitCreate = async (data: any) => {
    console.log(data);
  };

  const handleChangeBlockchain = (selectedOption: any) => {
    setBlockchain(selectedOption.value);
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center mb-10">
      <div className="lg:w-[27rem]">
        {(generatedImages && generatedImages.length === 0) || progress !== 0 ? (
          <div className="relative bg-zinc-900 rounded-lg w-[27rem] h-[27rem]">
            <div
              className="h-[27rem] bg-zinc-800 rounded-lg"
              style={{ width: Math.floor(progress) + '%' }}
            ></div>
            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">
              {generateError
                ? 'Problem generating image. Try again!'
                : progress === 0
                ? 'Ready to generate image!'
                : `${Math.floor(progress)}%`}
            </p>
          </div>
        ) : generatedImages && generatedImages.length > 0 ? (
          <div className="relative bg-zinc-900 rounded-lg w-[27rem] h-[27rem]">
            <img
              src={generatedImages[0]}
              alt="generated image"
              className=" rounded-lg"
            ></img>
          </div>
        ) : null}
      </div>
      <div className="w-3/4 lg:w-[48rem] flex flex-col gap-4">
        <label className="text-xl ">Collection Image</label>
        <form onSubmit={handleGenerate(onSubmitGenerate)}>
          <input
            className="bg-zinc-800 lg:text-lg px-4 py-3 w-4/6 md:w-4/6 lg:w-4/5 rounded-l-md outline-none mb-2"
            placeholder="Enter your prompt..."
            {...registerGenerate('prompt', { required: true })}
          />
          <button
            type="submit"
            className="bg-green-400 text-black text-base lg:text-lg font-semibold px-4 py-3 w-2/6 md:w-2/6 lg:w-1/5 rounded-r-md outline-none hover:bg-white"
          >
            Generate
          </button>
          {errors.prompt && (
            <span className="px-2 text-red-400">This field is required</span>
          )}
        </form>
        <p className="text-3xl mt-3">Contract Information</p>
        <form onSubmit={handleCreate(onSubmitCreate)}>
          <div className="grid grid-cols-2 gap-8 mt-3">
            <div className="flex flex-col gap-2">
              <p className="text-xl font-semibold">Name</p>
              <p className="text-zinc-300">
                The name of your collection. Examples are TRONBAYC,
                TronBullClub, etc.{' '}
              </p>
              <div className="flex flex-col">
                <input
                  className="bg-zinc-800 px-4 py-3 rounded-md outline-none mb-2 mt-2"
                  placeholder="Enter collection name..."
                  {...registerCreate('name', { required: true })}
                />
                {formState.errors.name && (
                  <span className="px-1 text-red-400">Name is required</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xl font-semibold">Symbol</p>
              <p className="text-zinc-300">
                The token symbol of your collection. Examples are TBAYC, TBC,
                etc.
              </p>
              <div className="flex flex-col">
                <input
                  className="bg-zinc-800 px-4 py-3 rounded-md outline-none mb-2 mt-2"
                  placeholder="Enter collection symbol..."
                  {...registerCreate('symbol', { required: true })}
                />
                {formState.errors.symbol && (
                  <span className="px-1 text-red-400">Symbol is required</span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 mt-3">
            <div className="flex flex-col gap-2">
              <p className="text-xl font-semibold">Description</p>
              <p className="text-zinc-300">
                The description of your collection. Write in some words what the
                projects is about.
              </p>
              <div className="flex flex-col">
                <input
                  className="bg-zinc-800 px-4 py-3 rounded-md outline-none mb-2 mt-2"
                  placeholder="Enter collection description..."
                  {...registerCreate('description', { required: true })}
                />
                {formState.errors.description && (
                  <span className="px-1 text-red-400">
                    Description is required
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xl font-semibold">Website (optional)</p>
              <p className="text-zinc-300">
                The website for your collection. Where can people go to find
                more information?
              </p>
              <div className="flex flex-col">
                <input
                  className="bg-zinc-800 px-4 py-3 rounded-md outline-none mb-2 mt-2"
                  placeholder="Enter website domain..."
                  {...registerCreate('website')}
                />
              </div>
            </div>
          </div>
          <div className="gap-8 mt-3">
            <div className="flex flex-col gap-2">
              <p className="text-xl font-semibold">Rules (optional)</p>
              <p className="text-zinc-300">
                When your users generate images, you can configure so that the
                prompt must contain atleast one of the word in a list configured
                by you. Set the words below (comma separated):
              </p>
              <input
                className="bg-zinc-800 px-4 py-3 rounded-md outline-none mb-2 mt-2"
                placeholder="Enter collection rules..."
                {...registerCreate('rules')}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-3 items-end">
            <div className="col-span-2 flex flex-col gap-2">
              <p className="text-xl font-semibold">Blockchain</p>
              <p className="text-zinc-300">
                What blockchain should the collection be on?
              </p>
              <Select
                className="w-full mt-1"
                defaultValue={{
                  label: blockchains[0].label,
                  value: blockchains[0].value,
                }}
                options={blockchains}
                styles={customStyles}
                onChange={handleChangeBlockchain}
              />
            </div>
            <div className="col-span-1 flex flex-col">
              <p className="pb-2">*available soon</p>
              <button
                type="submit"
                className="bg-green-400 text-black text-base lg:text-lg font-semibold w-full h-11 rounded-md outline-none hover:bg-white cursor-not-allowed"
                disabled
              >
                Create collection
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
