import { Navbar, Button, Link, Text, Card, Radio, Snippet, Grid, Row, Spacer, useSSR} from "@nextui-org/react";
import Content  from "./Content.js"
import WaitingRoom from "./WaitingRoom.js";
import TimeOut from "./TimeOut.js"
import { Box } from "./Box.js";
import { useState } from "react";


function setUp () {
  let [curPage, setCurPage] = useState(0);

  return (
    <div>
    <Grid.Container>
    <Row justify="center">
    <Button.Group color="gradient" ghost>
    <Button  onPress={()=>setCurPage(0)}>Create</Button>
    <Button onPress={()=>setCurPage(1)}>Waiting Room</Button>
    <Button onPress={()=>setCurPage(2)}>Timeout</Button>
    </Button.Group>
    </Row>
    </Grid.Container>
    <div>
    {curPage === 0 ? <Content/> : curPage === 1 ? <WaitingRoom/> : curPage === 2 ? <TimeOut/> : ""}
    </div>
    </div>
  );
}

export const Layout = ({ children}) => (
  
  <Box
    css={{
      maxW: "100%"
    }}
  >
    {children}
    <Spacer y={2}/>

      {setUp()}
  </Box>
);
