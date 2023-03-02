import Link from 'next/link';
import React, { useState, useEffect } from "react";

import { useRouter } from 'next/router';
import { useContext } from 'react';
import { ConnectedContext, NetworkContext } from '../pages/_app';
import * as fcl from '@onflow/fcl';
import * as types from '@onflow/types';
import { useAuthContext } from "../src/hooks/useAuthContext"





fcl.config({
  "flow.network": "testnet",
  "app.detail.title": "BottomShot", // Change the title!
  "accessNode.api": "https://rest-testnet.onflow.org",
  "app.detail.icon": "https://placekitten.com/g/200/200",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
});

export default function Header ()
{

  

  const [ user, setUser ] = useState( { loggedIn: null } )
  const { session, signIn, isLoading } = useAuthContext()
  let onClick = () => {
    signIn("/create") 
    
  }


  useEffect( () => fcl.currentUser.subscribe( setUser ), [] )
  
  const AuthedState = () => {
    return (
      <div>
        {/* <div>Address: {user?.addr ?? "No Address"}</div> */}
        {/* <button onClick={ fcl.unauthenticate }>Log Out</button> */}
        <button className="cta-button logout-btn" onClick={ fcl.unauthenticate }>
            ❎ {"  "}
            {user.addr.substring(0, 6)}...{user.addr.substring(user.addr.length - 4)}
          </button>
      </div>
    )
  }

  const UnauthenticatedState = () => {
    return (
      <div>
        <button className="border border-white-500 text-white-500 text-base font-semibold py-2 px-4 rounded-lg hover:bg-white hover:text-black" onClick={fcl.logIn}>Connect Wallet</button>
        {/* <button className="border border-white-500 text-white-500 text-base font-semibold py-2 px-4 rounded-lg hover:bg-white hover:text-black" onClick={fcl.signUp}>Sign Up</button> */}
      </div>
    )
  }

  const RenderLogout = () => {
    if (user && user.addr) {
      return (
        <div className="logout-container">
          <button className="cta-button logout-btn" onClick={() => logOut()}>
            ❎ {"  "}
            {user.addr.substring(0, 6)}...{user.addr.substring(user.addr.length - 4)}
          </button>
        </div>
      );
    }
    return undefined;
  };

  const logIn = () => {
    fcl.authenticate();
  };

  const logOut = () => {
    fcl.unauthenticate();
  };
  
  // useEffect(() => {
  //   // This listens to changes in the user objects
  //   // and updates the connected user
  //   fcl.currentUser().subscribe(setUser);
  // }, [])



  
  const { connected, setConnected } = useContext(ConnectedContext);
  const network = useContext(NetworkContext);
  const router = useRouter();
  
  
  const onConnect = async () => {
    try {
      let response = await window.tronLink.request({
        method: 'tron_requestAccounts',
      });
      console.log(response);
      if (response.code === 200) {
        setConnected(true);
      }
    } catch (e) {
      console.log(e);
    }
  };


  const page =
    router.asPath === '/create'
      ? 'create'
      : router.asPath === '/gallery'
      ? 'gallery'
      : '';

  return (
    <div className="sticky top-0 z-10 bg-black flex justify-center">
      <div className="justify-self-center flex justify-between items-center px-6 sm:px-12 py-6 bg-black text-white	w-full max-w-screen-xl">
        <div className="flex items-center text-2xl">
          <Link href="/">
            <a>
              XPROMPT <span className="text-green-400"> NFT</span>
            </a>
          </Link>
        </div>
        <div className="flex items-center gap-4 md:gap-8 text-lg">
          <Link href="/create">
            <a
              className={
                page === 'create'
                  ? 'border-b-4 border-green-400'
                  : 'border-b-4 border-black'
              }
            >
              Create
            </a>
          </Link>
          <Link href="gallery">
            <a
              className={
                page === 'gallery'
                  ? 'border-b-4 border-green-400'
                  : 'border-b-4 border-black'
              }
            >
              Gallery
            </a>
          </Link>
          {/* {connected ? (
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
          ) : (
            <button
              className="border border-white-500 text-white-500 text-base font-semibold py-2 px-4 rounded-lg hover:bg-white hover:text-black"
              onClick={
                connected ? () => console.log('already connected') : onConnect
              }
            >
              Connect
            </button>
          ) } */}
          

          
          {/* <button
              className="border border-white-500 text-white-500 text-base font-semibold py-2 px-4 rounded-lg hover:bg-white hover:text-black"
              onClick={() => logIn()}
            >
              Connect Now!
            </button> */}
          
          <button
              
             
             
              onClick={onClick}
            
            >
              Sign in with Google
          </button>
          
          {user.loggedIn
        ? <AuthedState />
        : <UnauthenticatedState />
      }
        </div>
      </div>
    </div>
  );
}
