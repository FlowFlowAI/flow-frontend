## Inspiration

There have been amazing progress in AI diffusion models recently, as you probably have seen with models such as DALL-E 2 and Stable Diffusion. How they work in essence is that you give them a prompt where you are describing an image, and they give you an image back. This made me think about the intersection of AI and crypto. I figured that letting users generate images with these AI models, and later mint them as NFTs would be an interesting application. I want users to be able to create collections that are completely AI generated.

## What it does

There are two parts, the first is about generating an image and minting it into an EXISTING collection. The second is creating a collection, where users can later generate image and mint NFTs into the NEWLY CREATED collection.

We are going to explain the first part here, because it is 100% finished.

It works like this:
You choose a collection, we have 4 test collections for the hackathon. They are - [The Random Collection](https://apenft.io/collections/the-random-collection) (no restrictions on what prompts are allowed) - [The Space Collection](https://apenft.io/collections/the-space-collection) (only allows space related promps) - [The Dog Collection](https://apenft.io/collections/the-dog-collection) (only allows dog related prompts) - [The Walter White](https://apenft.io/collections/the-walter-white-collection) (only allows promps that included Walter White)

If you choose "The Random Collection", you can write whatever you want in the prompt. For example, you can write something like "mad yoda eating a sandwich". This will trigger a request to our backend, where we run the model Stable Diffusion. Stable Diffusion will generate 1 or 4 images for you (depending on what you choose), and send them back to your browser. You can now choose to mint the Mad Yoda. When minting, the chosen Mad Yoda image will get uploaded to ipfs and then get minted on the chosen chain (Tron mainnet or Shasta testnet). When the minting is done, you can view the NFT at https://apenft.io. In fact, I did all of this, and here is the Mad Yoda I generated and minted: https://apenft.io/assets/TQNUyaZxpkYHUtk31LGXHtduanGrYnVau6/11

If you choose any of the other collections, then your prompt need to involve a word that is related to the connection. The words are shown on the page where you generate the images! You can test it for yourself here https://xpromptnft.xyz/create.

## How we built it

The project is a combination of on-chain code (the NFT contracts), client code and a python API. The client sends a request with the prompt to the API, which in turn responds with the generated image. The generated image then gets uploaded to IPFS from the client, and minted on the blockchain by calling the NFT contract.

**Contracts**:
Written in Solidity, can be found here: https://github.com/holma91/xpromptnft/tree/main/contracts
**Frontend**:
Written in Typescript with React, can be found here: https://github.com/holma91/xpromptnft/tree/main/frontend
**Backend**:
Written in Python with FastAPI, can be found here: https://github.com/holma91/xpromptnft/tree/main/backend

## Challenges we ran into

We wanted to support the other popular diffusion model aswell, DALL-E 2, but it isn't open sourced and OpenAI have not yet exposed an API to their service. We tried getting around this, but it was unclear if we would break their TOS if we did, so we didn't do it and instead went 100% in on Stable Diffusion (which is completely open source).

## Accomplishments that we're proud of

We think that the UI and UX is very good, and recommend you to test it! Apart from that, the project just came out good on a whole, and the image generation works perfectly.

## What we learned

That FastAPI is an awesome framework for building APIs quick in python. We also got to learn a little deeper how these diffusion models actually work, and this video was a good resource https://youtu.be/1CIpzeNxIhU .

## What's next for xpromptnft - AI generated NFTs

We want to support more models than we do currently! There are some open source models that we haven't integrated yet, but we are also eagerly waiting for Google to launch access to Imagen, and OpenAI to launch API access for DALL-E 2. We also want to finish the "Create a Collection" part of the website. It's also possible that we look into "image to image" generation, where users will be able to upload an image to the model, and the model will adjust it in some specified way and then return it.
