#! /usr/bin/env python

import json, boto3

client = boto3.client("bedrock-runtime")

def handler(event, context):
    llmType = "meta.llama2-13b-chat-v1"

    response_stream = client.invoke_model_with_response_stream(
        body=json.dumps({"prompt": event["body"],"max_gen_len": 512}),
        modelId=llmType,
        accept="application/json",
        contentType="application/json",
    )
    status_code = response_stream["ResponseMetadata"]["HTTPStatusCode"]
    if status_code != 200:
        raise ValueError(f"Error invoking Bedrock API: {status_code}")
    for response in response_stream["body"]:
        json_response = json.loads(response["chunk"]["bytes"])
        if llmType == "meta.llama2-13b-chat-v1":
            print(json_response["generation"])
            yield json_response["generation"].encode()
        elif llmType == "cohere.command-text-v14":
            if "text" in json_response.keys():
                if json_response["text"] != "<EOS_TOKEN>":
                    yield json_response["text"].encode()
 

    
