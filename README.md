# EventBridge Api Destinations

The example is a showcase of EventBridge Api Destinations feature to elaborate on how different components interact collaboratively.

## Caution

The stack will expose the lambda function URL publicly, it s recommended to destroy the stack as soon as the experimentation ends or remove the Lambda Api Destination resource if not required.

## Deploy the stack

To deploy the stack first you need a name aws profile configured or a default one.
change the profile in `package.json` file

```json
{
  ...
  "scripts": {
    ...
    "cdk": "cdk --app 'ts-node --prefer-ts-exts cdk/bin/cdk.ts'",
    "cdk:dev": "npm run cdk -- --profile serverless -c env=dev"
  },
  ...
}
```

Run the deploy command

```shell
npm run cdk:dev deploy 
```

Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npm run cdk:dev deploy`  deploy this stack to your default AWS account/region
* `npm run cdk:dev diff`    compare deployed stack with current state
* `npm run cdk:dev synth`   emits the synthesized CloudFormation template

## How it works

The stack will deploy the following components

- EventBus: A custom event bus will be created as the event's entry point
- Lambda: A lambda function stack with publicly exposed and active function Url, the lambda function simulates a 20% rate of errors. 
- Lambda Api Destination: This is the Api destination targetting to the lambda FUrl, 
  - A secret is created just for demonstration purposes.
  - A connection with apiKey auth type will use the secret
  - A Dlq attached to the rule with custom retry attempts to override the large EB defaut retry policy
- Webhook.site Api Destination: This is the Api destination targetting to the webhook ephemeral endpoint 
  - A secret is created just for demonstration purposes.
  - A connection with apiKey auth type will use the secret
  - A Dlq attached to the rule with custom retry attempts to override the large EB defaut retry policy

## Send events
Run the following command to send the example events provided in [events.json](./data/events.json) file and contains a batch of 10 example events.
