import React, { useEffect, useRef, useState } from "react";
import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import { Box } from "./Box.js"
import { Text, Spacer, Card, CardHeader, CardBody, CardFooter,Grid,Row, Link, Radio, Button, Loading, Input, Modal } from "@nextui-org/react"
import { abi, RANDOM_GAME_NFT_CONTRACT_ADDRESS } from "../constants";
import Web3Modal from "web3modal";
import { FETCH_CREATED_GAME } from "../queries/activeGame.js";
import { subgraphQuery } from "../utils/subQuery.js";



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
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [idGameActive, setIdGameActive] = useState([]);
  const [gameInfo, setGameInfo] = useState([]);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [idJoinGame, setIdJoinGame] = useState(0);
  const web3ModalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({})
  const [cardVisible, setCardVisible] = useState(false);
  const [messageLoading, setMessageLoading] = useState("Waiting for comfirmation");

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
      queryActiveGame();
      getFees();
    }
  }, [walletConnected]);

  const getNonDuplicatedValues = (arr) => 
    arr.filter((item,index) => {
      arr.splice(index,1)
      const unique = !arr.includes(item)
      arr.splice(index,0,item)
      return unique
  })
  const queryActiveGame = async () => {
    const _gameArray = await subgraphQuery(FETCH_CREATED_GAME());
    const _gameStart = _gameArray.createGames;
    const _gameEnd = _gameArray.gameEndeds;
    setGameInfo(_gameStart);
    
    let arraySet = [];
    
    for(let i=0; i < _gameStart.length; i++) {
        arraySet.push(_gameStart[i].round);    
    }
    for(let i=0; i < _gameEnd.length; i++) {
        arraySet.push(_gameEnd[i].round);
    }
    console.log(_gameStart);
    const unique = getNonDuplicatedValues(arraySet);
    console.log(unique);
    const isActive = await getDeadLine(unique);
    console.log(isActive);
    const getCurPlay = await getCountPlayer(isActive);
    console.log(getCurPlay);

    const timer = setInterval(async () => {
        await await getCountPlayer(isActive);
    }, 10000);
    setIdGameActive(isActive);

  }

  const getDeadLine = async (values) => {
    const signer = await getProviderOrSigner(true);
    const provider = await getProviderOrSigner();
    const predictGame = new Contract(
      RANDOM_GAME_NFT_CONTRACT_ADDRESS,
      abi,
      signer
    );
    let newArr = [];
    let curBlock = await provider.getBlockNumber();
    let timestampInSeconds = await provider.getBlock(curBlock);
    // const timestampInSeconds = Math.round(new Date().getTime() / 1000).toString()
    const hexToDecimal = hex => parseInt(hex, 16);
    console.log(timestampInSeconds.timestamp);
   
    for(let i=0;i < values.length; i++){
        let isDeadLine =  await predictGame.gameRound(values[i]);
        console.log(`isDeadLine : ${isDeadLine.deadline}`);
        if(isDeadLine.deadline > timestampInSeconds.timestamp) {
            newArr.push(values[i]);
        }
    }
    return newArr;
  }

  const getCountPlayer = async (round) => {
    const signer = await getProviderOrSigner(true);
    const predictGame = new Contract(
      RANDOM_GAME_NFT_CONTRACT_ADDRESS,
      abi,
      signer
    );
    let players = [];
    for(let i=0;i < round.length; i++) {
        let currentPlayer = await predictGame.gameRound(round[i]);
        console.log(`round ${round[i]}`);
        console.log(`palye in round ${currentPlayer.currentPlayers}`);
        console.log(`max player in round ${currentPlayer.maxPlayers}`);
        players.push(currentPlayer.currentPlayers);

        // if(currentPlayer.currentPlayers < currentPlayer.maxPlayers){
        //     
        // } else {
        //     for (var i=idGameActive.length-1; i>=0; i--) {
        //         if (idGameActive[i] === round[i]) {
        //             idGameActive.splice(i, 1);
        //             setIdGameActive(idGameActive);
        //             break;       //<-- Uncomment  if only the first term has to be removed
        //         }
        //     }
        // }
        
    }
    console.log('interval');
    setGamePlayers(players.reverse())
    return players;
  }
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
      setFees(getFee);
  }

  
  
  const joinGame = async (id) => {
    console.log(`joinGame id is ${id}`);
    try {

      const signer = await getProviderOrSigner(true);

      const predictGame = new Contract(
        RANDOM_GAME_NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      setMessageLoading("Waiting for confirmation");
      setCardVisible(true);
      let gameData = await predictGame.gameRound(id);
      let amount = gameData.amount;
      console.log(`amount in game ${amount}`);
      const tx = await predictGame.joinGame(id, selectedOptions, {value: amount});
      setMessageLoading("Transaction Submitted");
      await tx.wait();
      setCardVisible(false);
    } catch (err) {
      console.error(err);
      setCardVisible(false);
    }
  };
  const joinButton = (id) => {
    console.log('id');
 
    if(loadingJoin) {
      return (
        <Button shadow color="primary" auto>
           Pending Transaction..<Loading color="currentColor" size="sm" />
        </Button>
      );
    } else {
      return (
        <Button shadow color="primary" auto onClick={() => joinGame(id)}>
          Join Game  
        </Button>
      );
    }

  }
 
  const handleOptionChange = (event) => {
    console.log(event);
    // const { name, value } = event.target
    // setSelectedOptions((prevState) => ({ ...prevState, [name]: value }))
    // console.log(selectedOptions);
    setSelectedOptions(event);
  }
  return (
    <Grid.Container gap={2} justify="flex-start">
      <Spacer/>
      <Row>
      {cardVisible && (
            <div>
            <Modal
            aria-labelledby="modal-title"
            open={cardVisible}
            >
            <Modal.Header>
                <Text id="modal-title" size={18}>
                <Spacer y={2}/>
                <Loading>{messageLoading}</Loading>;
                </Text>
            </Modal.Header>
            <Modal.Body>
                
                <Row justify="space-between">
           
                </Row>
            </Modal.Body>
            <Modal.Footer>
             
            </Modal.Footer>
            </Modal>
            </div>
        )}
      <Grid.Container>
    {idGameActive?.map((item, index) => (
       
      <Card css={{ marginTop:"$6",marginLeft: "$6",p: "$6", mw: "400px" }}>
      <Card.Header>
        <img
          alt="nextui logo"
          src="../dice.png"
          width="34px"
          height="34px"
        />
        <Grid.Container css={{ pl: "$6" }}>
          <Grid xs={12}>
            <Text h4 css={{ lineHeight: "$xs" }}>
              Join Id Game: {item}
            </Text>
          </Grid>
          <Grid xs={12}>
            <Text css={{ color: "$accents8" }}>EntryFee : {gameInfo[item].amount/10e17} Matic {gamePlayers[index].toString()}/{gameInfo[item].maxPlayers} players</Text>
          </Grid>
        </Grid.Container>
      </Card.Header>
      <Card.Body css={{ py: "$2" }}>
      <Radio.Group key={item} name={item} orientation="horizontal" label="Prediction" defaultValue="primary" onChange={handleOptionChange} >
      <Radio value="1" color="primary">
        High
      </Radio>
      <Radio value="0" color="secondary">
        Low
      </Radio>
      </Radio.Group>
      </Card.Body>
      { gamePlayers[index] == gameInfo[item].maxPlayers && (
              <Card.Footer>
              Game End
            </Card.Footer>
      ) }
    { gamePlayers[index] < gameInfo[item].maxPlayers && (
              <Card.Footer>
              {joinButton(item)}
        </Card.Footer>
      ) }
      
    </Card>
  
    ))}
      </Grid.Container>
    </Row>
  </Grid.Container>
  );
}

export default function WaitingRoom()  {

  return (
    <Box css={{px: "$12", mt: "$8", "@xsMax": {px: "$10"}}}>
    {CardBoxList()}
   
   </Box>
  );

 

};
