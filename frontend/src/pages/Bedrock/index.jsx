import { Col, Row } from "antd";
import { useState, useRef, useLayoutEffect } from "react";
import GenericHeader from "../../containers/Header";
import {
  chatGPTapiCallStreamingResponse,
  chatGPTapiCallRegularResponse,
} from "../../utils/api";
import GenericStatistic from "../../components/statistics";

import { PlayCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { Input, Typography, Space } from "antd";
const { Search } = Input;
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./Bedrock.css";
const BedrockPage = () => {
  const [data, setData] = useState([]); // Bedrock
  const [dataLoader, setDataLoader] = useState(false);
  const [data2, setData2] = useState([]); // ChatGPT
  const [data2Loader, setData2Loader] = useState(false);
  const [init, setInit] = useState(true);

  const [regularTTFB, setRegularTTFB] = useState([]);
  const [streamingTTFB, setStreamingTTFB] = useState([]);
  const [regularApiTime, setRegularApiTime] = useState([]);
  const [streamingApiTime, setStreamingApiTime] = useState([]);

  const dataAutoScroll = useRef(null);
  const data2AutoScroll = useRef(null);

  useLayoutEffect(() => {
    const contentElement = dataAutoScroll.current;
    contentElement.scrollTop = contentElement.scrollHeight;
  }, [data]);

  useLayoutEffect(() => {
    const contentElement = data2AutoScroll.current;
    contentElement.scrollTop = contentElement.scrollHeight;
  }, [data2]);

  // to do : Update the variable names
  const onSearch = (value) => {
    setInit(false);
    chatGPTapiCallStreamingResponse(
      setData,
      value,
      setDataLoader,
      setStreamingTTFB,
      setStreamingApiTime,
      "Bedrock"
    );
    chatGPTapiCallStreamingResponse(
      setData2,
      value,
      setData2Loader,
      setRegularTTFB,
      setRegularApiTime,
      "ChatGPT"
    );
  };

  const chatIcon = () => {
    if (dataLoader === false && data2Loader === false)
      return <PlayCircleOutlined />;
    else return <LoadingOutlined spin />;
  };

  const initContent = {
    bedrock: "Bedrock with Llama on Custom Lambda Python Runtime",
    chatgpt: "ChatGPT on NodeJs Runtime",
  };

  const markdownContent = (dataLoader, data, type) => {
    if (dataLoader === false && init === false) {
      return <ReactMarkdown children={data} remarkPlugins={[remarkGfm]} />;
    } else if (init === true)
      return (
        <Typography.Title level={1}> {initContent[type]} </Typography.Title>
      );
    else
      return (
        <LoadingOutlined
          spin
          style={{
            fontSize: 75,
          }}
        />
      );
  };

  return (
    <>
      <GenericHeader Title="Streaming AI, Amazon Bedrock vs OpenAI" />
      <Row style={{ padding: "8px" }}>
        <Search
          placeholder="ask me anything"
          enterButton={chatIcon()}
          size="large"
          onSearch={onSearch}
          className="input-box"
        />
      </Row>

      <Row className="row-style ">
        <Col
          span={12}
          className="ant-col-chatgpt columnStyle columnLeft"
          ref={dataAutoScroll}
          style={{
            justifyContent: init || dataLoader ? "center" : "normal",
            alignItems: init || dataLoader ? "center" : "normal",
            height: "calc(100vh - 180px)",
          }}
        >
          {markdownContent(dataLoader, data, "bedrock")}
        </Col>
        <Col
          span={12}
          className="ant-col-chatgpt columnStyle columnRight"
          ref={data2AutoScroll}
          style={{
            justifyContent: init || data2Loader ? "center" : "normal",
            alignItems: init || data2Loader ? "center" : "normal",
            height: "calc(100vh - 180px)",
          }}
        >
          {markdownContent(data2Loader, data2, "chatgpt")}
        </Col>
      </Row>
      <Row>
        <Col span={12} className="columnStyle columnLeft">
          <Space>
            <GenericStatistic {...{ title: "ttfb", value: streamingTTFB }} />
            <GenericStatistic
              {...{ title: "apiTime", value: streamingApiTime }}
            />
          </Space>
        </Col>
        <Col span={12} className="columnStyle columnRight">
          <Space>
            <GenericStatistic {...{ title: "ttfb", value: regularTTFB }} />
            <GenericStatistic
              {...{ title: "apiTime", value: regularApiTime }}
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
export default BedrockPage;
