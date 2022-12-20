import React, { useEffect, useRef, useState } from "react";
import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import { Box } from "./Box.js"
import { Text, Spacer, Card, CardHeader, CardBody, CardFooter,Grid,Row, Link, Radio, Button, Loading, Input } from "@nextui-org/react"
import { abi, RANDOM_GAME_NFT_CONTRACT_ADDRESS } from "../constants";
import Web3Modal from "web3modal";







const CardBoxList = () => {
  const list = [
    {
      title: "Orange",
      img: "/images/fruit-1.jpeg",
      price: "$5.50",
    },
    {
      title: "Tangerine",
      img: "/images/fruit-2.jpeg",
      price: "$3.00",
    },
    {
      title: "Cherry",
      img: "/images/fruit-3.jpeg",
      price: "$10.00",
    },
    {
      title: "Lemon",
      img: "/images/fruit-4.jpeg",
      price: "$5.30",
    },
   
  ];

  const zero = BigNumber.from("0");

  const [entryFee, setEntryFee] = useState(zero);
  // maxPlayers is the max number of players that can play the game
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [fees, setFees] = useState(0);
  const [valueNative, setValueNative] = useState(zero);
  const [loading, setLoading] = useState(false);

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
      getFees();
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
  const getFees = async () => {
    const signer = await getProviderOrSigner(true);
      const predictGame = new Contract(
        RANDOM_GAME_NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
    
      const getFee =  await predictGame.fees();
      console.log(getFee);
      setFees(getFee);
  }
  const createGame = async () => {
    try {
      // Get the signer from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const signer = await getProviderOrSigner(true);
      // We connect to the Contract using a signer because we want the owner to
      // sign the transaction
      const predictGame = new Contract(
        RANDOM_GAME_NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      setLoading(true);
      // call the startGame function from the contract
      console.log(`maxPlayers ${maxPlayers}`);
      console.log(`entryFee ${entryFee}`);
      const getFee =  await predictGame.fees();
      console.log(`getFee : ${getFee.toString()}`);
      const fees = BigNumber.from(getFee.toString());
      console.log(`fees : ${fees}`);
      const value = fees.add(BigNumber.from(entryFee.toString()).mul(maxPlayers));
      setValueNative(value);

        
        
        console.log(`entryFee : ${entryFee}`);
        console.log(`value : ${value}`);
      const tx = await predictGame.createGame(maxPlayers, entryFee, {value: value});
      await tx.wait();
      setLoading(false);
      setEntryFee("");
      setMaxPlayers("");
      setValueNative(0);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };
  function createButton() {
    if(loading) {
      return (
        <Button shadow color="primary" auto>
           Pending Transaction..<Loading color="currentColor" size="sm" />
        </Button>
      );
    } else {
      return (
        <Button shadow color="primary" auto onClick={createGame}>
          Create Game  
        </Button>
      );
    }

  }

  return (
    <Grid.Container gap={2} justify="flex-start">
      <Spacer/>
      <Row justify="center">
      <Card css={{ marginTop:"$6",marginLeft: "$6",p: "$6", mw: "800px" }}>
      <Card.Header>
        <img
          alt="nextui logo"
          src="../dice.png"
          width="34px"
          height="34px"
        />
        <Grid.Container css={{ pl: "$6" }}>
          <Grid xs={12}>
            <Text h4 css={{ lineHeight: "$xs" , textGradient: "45deg, $red600 -20%, $green600 50%",}}>
              Game setup
            </Text>
          </Grid>
          <Grid xs={12}>
            <Text css={{ color: "$accents8" , textGradient: "45deg, $blue600 -20%, $pink600 50%",}}>Your must create game with number of players and amount</Text>
          </Grid>
        </Grid.Container>
      </Card.Header>
      <Card.Body css={{ py: "$2" }}>
      <Grid.Container css={{ pl: "$6" }}>
      <Grid>
        <Input 
          labelLeft="Players" 
          placeholder="0" 
          onChange={(e) => {
            // The user will enter the value in ether, we will need to convert
            // it to WEI using parseEther
            setMaxPlayers(
              e.target.value >= 0 && e.target.value.length > 0
                ? parseInt(e.target.value)
                : zero
            );

            if(e.target.value && entryFee >= 0) {
              console.log(`setValueNative`);
              setValueNative(fees.add(BigNumber.from(entryFee).mul(e.target.value)));
            }
            console.log(`maxPlayers: ${e.target.value}`);
          }}
        />
        <Spacer y={0.5}/>
        <Input 
            labelLeft="Amount" 
            placeholder="0" 
            onChange={(e) => {
              // The user will enter the value in ether, we will need to convert
              // it to WEI using parseEther
              setEntryFee(
                e.target.value >= 0 && e.target.value.length > 0 && maxPlayers > 0
                  ? utils.parseEther((e.target.value).toString())
                  : zero
              );
       
              if(maxPlayers >= 0 && e.target.value) {
                console.log(`setValueNative`);
                setValueNative(fees.add(BigNumber.from(utils.parseEther((e.target.value).toString())).mul(maxPlayers)));
              }
              console.log(`EntryFee ${e.target.value}`);
            }}
          />        
      </Grid>
      <Spacer x={3} />
      <Grid>
        <Text>Your must pay {valueNative/10e17.toString()} matics for create game include pool and fees</Text>       
      </Grid>
      </Grid.Container>
      </Card.Body>
      <Card.Footer>
      <Spacer x={0.5} />
            {createButton()}
      </Card.Footer>
    </Card>
      </Row>

  </Grid.Container>
  );
}

export default function Content()  {

  return (
    <Box css={{px: "$12", mt: "$8", "@xsMax": {px: "$10"}}}>
    {CardBoxList()}
   </Box>
  );

 

};
