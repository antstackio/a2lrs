//Dump data code
const jsonData = JSON.parse(fileContents).results;
let counter = 0;
for (const item of jsonData) {
  item.id = Date.now().toString();
  item.category = "random";
  const params = {
    Item: AWS.DynamoDB.Converter.marshall(item),
    TableName: tableName,
  };
  await dynamodb.putItem(params).promise();
  counter += 1;
  console.log(counter);
}
return counter;
