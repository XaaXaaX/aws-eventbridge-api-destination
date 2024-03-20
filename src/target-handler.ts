import { Context, LambdaFunctionURLEvent, LambdaFunctionURLResult } from "aws-lambda";

export const handler = async (event: LambdaFunctionURLEvent, context: Context): Promise<LambdaFunctionURLResult> => {
  console.log(event);
  console.log(context);
  const body = JSON.parse(event.body!);
  const random = Math.random();
  if (random < 0.2) {
    console.log({
      id: body.id,
      type: body.type,
      status: 'Error'
    });
    return {
      statusCode: 429
    };
  }
  console.log({
    id: body.id,
    type: body.type,
    status: 'success'
  });
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Lambda!'
    })
  };
}