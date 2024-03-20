import { Duration, SecretValue } from "aws-cdk-lib";
import { ApiDestination, Authorization, Connection, EventBus, EventField, HttpMethod, Rule, RuleTargetInput } from "aws-cdk-lib/aws-events";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import * as targets from "aws-cdk-lib/aws-events-targets";

export interface ApiDestinationProps  {
  apiUrl?: string;
  eventBus: EventBus;
}
export class ApiDestinations extends Construct {
  constructor(scope: Construct, id: string, props: ApiDestinationProps) {
    super(scope, id);
    

    const secret = new Secret(this, Secret.name, { });

    const connection = new Connection(this, Connection.name, {
      authorization: Authorization.apiKey('x-api-key', SecretValue.secretsManager(secret.secretArn)),
    });

    const apiDestination = new ApiDestination(this, 'api-destination', {
        httpMethod: HttpMethod.POST,
        endpoint: props.apiUrl!,
        connection: connection,
        rateLimitPerSecond: 1,
    });

    const dlq = new Queue(this, 'dlq', { retentionPeriod: Duration.minutes(5) });

    new Rule(this, 'rule', {
        eventBus: props.eventBus,
        eventPattern: {
            detail: {
                partner: ['mypartner'],
            },
        },
        targets: [
            new targets.ApiDestination(apiDestination, {
                deadLetterQueue: dlq,
                retryAttempts: 1,
                event: RuleTargetInput.fromObject({
                    datas: EventField.fromPath('$.detail'),
                    type: EventField.fromPath('$.detail-type'),
                    id: EventField.fromPath('$.id'),

                }),
            }),
        ]
    });
  }
}