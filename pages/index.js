// import React from "react";
import { Navbar, Button, Link, Text, Card, Radio, Snippet, Grid, Row, Spacer} from "@nextui-org/react";
import { Layout } from "./Layout.js";
import { AcmeLogo } from "./AcmeLogo.js";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { BigNumber, providers, utils } from "ethers";
import { getAddress } from "../utils/getAddress";


export default function App() {



  const [loading, setLoading] = useState(false);
  const zero = BigNumber.from(0);
  const [ethBalance, setEtherBalance] = useState(zero);
  const [userAddress, setUserAddress] = useState("");
  const web3ModalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      
      connectWallet();
      // getAmounts();
    }
  }, [walletConnected]);

  
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };


    /**
   * connectWallet: Connects the MetaMask wallet
   */
     const connectWallet = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // When used for the first time, it prompts the user to connect their wallet
        const signer = await getProviderOrSigner(true);
        const address = await signer.getAddress();
        setUserAddress(address);
        console.log(address);
        setWalletConnected(true);
      } catch (err) {
        console.error(err);
      }
    };

    const renderButton = () => {
      if (!walletConnected) {
        return (         
           <Button onClick={connectWallet} auto flat as={Link} href="#">
            Connect wallet
          </Button>
          )
      } else {
        return (
          <Button auto flat as={Link} href="#">
            {userAddress.substring(0,6).toUpperCase() + '...' + userAddress.substring(userAddress.length-4).toUpperCase()}
          </Button>
          )
      }
    };
  return (
    <Layout>
      <Navbar>
        <Navbar.Brand>
          <AcmeLogo />
          <Text b color="inherit" hideIn="xs">
            LAEDOS
          </Text>
        </Navbar.Brand>
        <Navbar.Content hideIn="xs">
          <Navbar.Link isActive href="#">Home</Navbar.Link>
          {/* <Navbar.Link isActive href="#">Swap</Navbar.Link>
          <Navbar.Link href="#">Game</Navbar.Link> */}
          <Navbar.Link href="#">About</Navbar.Link>
        </Navbar.Content>
        <Navbar.Content>
          {/* <Navbar.Link color="inherit" href="#">
            ConnectWallet
          </Navbar.Link> */}
    
          <Navbar.Item>  
            <div>
            {renderButton()}
            </div>
          </Navbar.Item>
        </Navbar.Content>
      </Navbar>

    </Layout>
  )
}
