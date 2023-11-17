import AWS from "aws-sdk";
AWS.config.update({ region: "ap-south-1" });
const cloudwatchlogs = new AWS.CloudWatchLogs({ region: "ap-south-1" });
const lambda = new AWS.Lambda();

const durationRegex = /Billed Duration: ([\d.]+) ms/;

async function getLambdaReportExecutionsByArn(functionArn, maxExecutions) {
  try {
    const items = [];
    const logGroupName = `/aws/lambda/${functionArn.split(":").pop()}`;

    let reportEntries = [];
    let nextToken = null;

    while (reportEntries.length < maxExecutions) {
      const params = {
        logGroupName: logGroupName,
        descending: true, // To get the most recent executions first
      };

      if (nextToken) {
        params.nextToken = nextToken;
      }

      const logStreamsResponse = await cloudwatchlogs
        .describeLogStreams(params)
        .promise();

      if (
        logStreamsResponse.logStreams &&
        logStreamsResponse.logStreams.length > 0
      ) {
        const logStreamNames = logStreamsResponse.logStreams.map(
          (logStream) => logStream.logStreamName
        );

        // Get the log events for each log stream
        for (const logStreamName of logStreamNames) {
          const logEventsResponse = await cloudwatchlogs
            .getLogEvents({
              logGroupName: logGroupName,
              logStreamName: logStreamName,
              limit: maxExecutions - reportEntries.length, // Limit based on remaining executions to retrieve
            })
            .promise();

          if (logEventsResponse.events && logEventsResponse.events.length > 0) {
            // Filter log events for "REPORT" entries
            const filteredEntries = logEventsResponse.events.filter((event) => {
              if (event.message.includes("REPORT")) {
                const match = event.message.match(durationRegex);
                // if (match && match.length >= 2) {
                // The matched value is in match[0], and the number is in match[1]
                const durationString = match[0];
                const durationValue = parseFloat(match[1]);

                items.push(durationValue);
                // }
              }
            });

            if (reportEntries.length >= maxExecutions) {
              break; // Stop fetching when the desired number of executions is reached
            }
          }
        }
      }

      // Check if there are more log streams to retrieve
      if (logStreamsResponse.nextToken) {
        nextToken = logStreamsResponse.nextToken;
      } else {
        break; // No more log streams to retrieve
      }
    }

    // return calculateAverage(items);
    return items;
  } catch (error) {
    console.error("Error retrieving Lambda executions:", error);
    throw error;
  }
}

const getFunctionData = (lambdaName, executionNo) => {
  const functionName = lambdaName;
  const numExecutionsToRetrieve = executionNo;

  const listFunctionsRecursive = async (marker = null, functions = []) => {
    try {
      const params = {
        Marker: marker,
        MaxItems: 100, // Adjust this value as needed
      };

      const data = await lambda.listFunctions(params).promise();

      if (data.Functions) {
        functions = functions.concat(data.Functions);
      }

      if (data.NextMarker) {
        // Recursively fetch the next set of functions
        return listFunctionsRecursive(data.NextMarker, functions);
      }

      return functions;
    } catch (error) {
      console.error("Error listing Lambda functions:", error);
      throw error;
    }
  };

  // Call the function to retrieve all Lambda functions
  listFunctionsRecursive()
    .then((functions) => {
      // 'functions' now contains the complete list of Lambda functions
      const functionData = functions.find(
        (func) => func.FunctionName === functionName
      );

      const functionArn = functionData.FunctionArn;
      console.log(functionData.FunctionName, functionArn);
      getLambdaReportExecutionsByArn(functionArn, numExecutionsToRetrieve).then(
        (data) => {
          console.log(data);
        }
      );
    })
    .catch((error) => {
      // Handle errors
    });
};

const regularFunctionData = getFunctionData(
  "lrs-apj-summitt-ChatGPTRegularLambda-8IUP4B0EF9by",
  5000
);
const streamingFunctionData = getFunctionData(
  "lrs-apj-summitt-ChatGPTStreamingFunction-rHiNaQ45FZ13",
  5000
);

const calculateAverage = (numbers) => {
  if (numbers.length === 0) {
    return 0; // Handle empty array
  }

  const sum = numbers.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  const average = sum / numbers.length;

  return Math.ceil(average);
};

console.log(regularFunctionData, streamingFunctionData);
export { getFunctionData };
