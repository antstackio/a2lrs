import json, boto3

client = boto3.client("bedrock-runtime")

def lambda_handler(event, context):

    response_body = client.invoke_model(
        body=json.dumps({"prompt": event.body, "max_tokens": 400}),
        modelId="cohere.command-text-v14",
        accept="application/json",
        contentType="application/json",
    )
    return response_body["completions"][0]["data"]["text"]

