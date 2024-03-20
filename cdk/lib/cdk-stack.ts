import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, FunctionUrlAuthType, LoggingFormat, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { resolve } from 'path';
import { ApiDestinations } from './api-destination';

export class ApiDestinationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const webhooksiteUrl = 'https://webhook.site/57d1a4ca-04fa-4734-b92e-235711f2d6d8';

    const functionRole = new Role(this, 'FunctionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });
    const lambdaFunction = new NodejsFunction(this, NodejsFunction.name, {
      entry:  resolve(__dirname, '../../src', 'target-handler.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      memorySize: 256,
      timeout: Duration.seconds(10),
      architecture: Architecture.ARM_64,
      logRetention: 1,
      loggingFormat: LoggingFormat.JSON,
      awsSdkConnectionReuse: false,
      reservedConcurrentExecutions: 1,
      bundling: {
          platform: 'node',
          format: OutputFormat.ESM,
          mainFields: ['module', 'main'],
          minify: true,
          sourceMap: true,
          sourcesContent: false,
          externalModules: [ '@aws-sdk' ],
          metafile: true 
      }
    });

    const funcUrl = lambdaFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });
    funcUrl.grantInvokeUrl(functionRole);

    const eventBus = new EventBus(this, EventBus.name, {  });

    new ApiDestinations(this, 'LambdaUrlApiDestinations', {
      eventBus,
      apiUrl: funcUrl.url
    });

    new ApiDestinations(this, 'WebhookApiDestinations', {
      eventBus,
      apiUrl: webhooksiteUrl
    });

  }
}
