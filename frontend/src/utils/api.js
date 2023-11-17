const apiCallStreamingResponse = (
  setData,
  setTtfb,
  setApiTime,
  setDdbItems,
  setDdbItemsSize
) => {
  let output = [];
  let tempChunk = "";
  const separator = "${Separator}";
  const apiStartTime = Date.now();

  let lambdaUrl = import.meta.env.VITE_LAMBDA_URL;
  lambdaUrl = lambdaUrl.replace(/['"]+/g, "");

  fetch(lambdaUrl, {
    method: "GET",
    redirect: "follow",
    responseType: "stream",
  })
    .then((response) => {
      // Stream reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      return new ReadableStream({
        start(controller) {
          function push() {
            reader
              .read()
              .then(({ done, value }) => {
                // decode stream value
                let chunk = decoder.decode(new Uint8Array(value));
                tempChunk += chunk;

                if (output.length === 0) {
                  setTtfb((Date.now() - apiStartTime).toString() + " ms");
                }

                if (tempChunk.includes("]")) {
                  let tempChunkSplit = tempChunk.split("]");
                  tempChunk = tempChunkSplit[1];
                  output = [...output, ...JSON.parse(tempChunkSplit[0] + "]")];
                  setData(output);
                  setDdbItems(output.length);
                  setDdbItemsSize(
                    Math.round(JSON.stringify(output).length / 1024)
                  );
                }

                if (done) {
                  controller.close();
                  setApiTime((Date.now() - apiStartTime).toString() + " ms");
                  return;
                }
                // iterate
                push();
              })
              .catch((error) => {
                console.error("Error reading response:", error);
                controller.error(error);
              });
          }
          push();
        },
      });
    })
    .catch((error) => console.log("api failed", error));
};

const apiCallRegularResponse = (
  setData,
  setTtfb,
  setApiTime,
  setDdbItems,
  setDdbItemsSize
) => {
  let apiId = import.meta.env.VITE_API_ID;
  let region = import.meta.env.VITE_REGION;
  let apiUrl = [
    "https://",
    apiId,
    ".execute-api.",
    region,
    ".amazonaws.com/prod/ddb_regular",
  ];
  apiUrl = apiUrl.join("").replace(/"([^"]+(?="))"/g, "$1");
  const apiStartTime = Date.now();
  fetch(apiUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      data.map((e) => {
        e.key = e.id;
      });
      setData(data);
      setTtfb((Date.now() - apiStartTime).toString() + " ms");
      setApiTime((Date.now() - apiStartTime).toString() + " ms");
      setDdbItems(data.length);
      setDdbItemsSize(Math.round(JSON.stringify(data).length / 1024));
    })
    .catch((error) => console.log("api failed", error));
};

const chatGPTapiCallRegularResponse = (
  setData,
  value,
  setDataLoader,
  currentData,
  setRegularTTFB,
  setRegularApiTime
) => {
  setDataLoader(true);
  let apiId = import.meta.env.VITE_API_ID;
  let region = import.meta.env.VITE_REGION;
  let apiUrl = [
    "https://",
    apiId,
    ".execute-api.",
    region,
    ".amazonaws.com/prod/chatgpt_regular",
  ];

  const apiStartTime = Date.now();
  apiUrl = apiUrl.join("").replace(/"([^"]+(?="))"/g, "$1");
  fetch(apiUrl, {
    method: "POST",
    body: value,
  })
    .catch((error) => console.log("api failed", error))
    .then((response) => {
      if (response.status === 504) {
        setData("## Request Timed Out");
        setDataLoader(false);
        throw "Timeout";
      }
      return response.json();
    })
    .then((data) => {
      setData(data);
      setDataLoader(false);
      setRegularTTFB((Date.now() - apiStartTime).toString() + " ms");
      setRegularApiTime((Date.now() - apiStartTime).toString() + " ms");
    });
};

const StreamingURLs = {
  ChatGPT: import.meta.env.VITE_CHAT_GPT_LAMBDA_URL.replace(/['"]+/g, ""),
  Bedrock: import.meta.env.VITE_BEDROCK_LAMBDA_URL.replace(/['"]+/g, ""),
};

const chatGPTapiCallStreamingResponse = (
  setData,
  value,
  setDataLoader,
  setStreamingTTFB,
  setStreamingApiTime,
  URL
) => {
  const apiStartTime = Date.now();
  setDataLoader(true);
  let tempChunk = "";

  let lambdaUrl = StreamingURLs[URL];
  fetch(lambdaUrl, {
    method: "POST",
    redirect: "follow",
    responseType: "stream",
    body: value,
  })
    .then((response) => {
      setDataLoader(false);
      // Stream reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      return new ReadableStream({
        start(controller) {
          function push() {
            reader
              .read()
              .then(({ done, value }) => {
                if (tempChunk === "") {
                  setStreamingTTFB(
                    (Date.now() - apiStartTime).toString() + " ms"
                  );
                }
                // decode stream value
                let chunk = decoder.decode(new Uint8Array(value));
                tempChunk += chunk;
                setData(tempChunk);
                // ending the iterative execution
                if (done) {
                  controller.close();

                  setStreamingApiTime(
                    (Date.now() - apiStartTime).toString() + " ms"
                  );
                  return;
                }
                // iterate
                push();
              })
              .catch((error) => {
                console.error("Error reading response:", error);
                controller.error(error);
              });
          }
          push();
        },
      });
    })
    .catch((error) => console.log("api failed", error));
};
export {
  apiCallStreamingResponse,
  apiCallRegularResponse,
  chatGPTapiCallStreamingResponse,
  chatGPTapiCallRegularResponse,
};
