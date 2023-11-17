#! /usr/bin/env python

import json, boto3

client = boto3.client("bedrock-runtime")


def handler(event, context):
    response_stream = client.invoke_model_with_response_stream(
        body=json.dumps({"prompt": event["body"], "max_tokens": 400, "stream": True}),
        modelId="cohere.command-text-v14",
        accept="application/json",
        contentType="application/json",
    )
    status_code = response_stream["ResponseMetadata"]["HTTPStatusCode"]
    if status_code != 200:
        raise ValueError(f"Error invoking Bedrock API: {status_code}")
    for response in response_stream["body"]:
        json_response = json.loads(response["chunk"]["bytes"])
        if "text" in json_response.keys():
            if json_response["text"] != "<EOS_TOKEN>":
                yield json_response["text"].encode()
