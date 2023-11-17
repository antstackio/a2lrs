import { Routes, Route } from "react-router-dom";
import DDBPage from "../../pages/Ddb";
import ChatGPTPage from "../../pages/Chatgpt";
import HomePage from "../../pages/Home";
import BedrockPage from "../../pages/Bedrock";

const Navigation = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/ddb" element={<DDBPage />} />
      <Route path="/chat" element={<ChatGPTPage />} />
      <Route path="/bedrock" element={<BedrockPage />} />
    </Routes>
  );
};
export default Navigation;
