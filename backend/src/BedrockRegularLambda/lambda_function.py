import json, boto3

client = boto3.client("bedrock-runtime")

def lambda_handler(event, context):

    response_body = client.invoke_model(
        body=json.dumps({"prompt": event["body"]}),
        modelId="meta.llama2-13b-chat-v1",
        accept="application/json",
        contentType="application/json",
    )
    output = response_body["body"].read().decode("utf-8")
    output = json.loads(output)
    return output["generation"]

