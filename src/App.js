import logo from './logo.svg';
import './App.css';
import { Box } from "@mui/material";
import ChatRoom from './chatRoom';
function App() {
  return (
    <div className="App">
      
      <Box sx={{ position: "relative", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <ChatRoom></ChatRoom>
      
      </Box>
    </div>
  );
}

export default App;
