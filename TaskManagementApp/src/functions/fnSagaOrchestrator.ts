const { app } = require('@azure/functions');
const df = require('durable-functions');

const activityName = 'fnSagaOrchestrator';

df.app.orchestration('fnSagaOrchestratorOrchestrator', function* (context) {
    const outputs = [];
    outputs.push(yield context.df.callActivity(activityName, 'Tokyo'));
    outputs.push(yield context.df.callActivity(activityName, 'Seattle'));
    outputs.push(yield context.df.callActivity(activityName, 'Cairo'));

    return outputs;
});

df.app.activity(activityName, {
    handler: (input) => {
        return `Hello, ${input}`;
    },
});

app.http('fnSagaOrchestratorHttpStart', {
    route: 'orchestrators/{orchestratorName}',
    extraInputs: [df.input.durableClient()],
    handler: async (request, context) => {
        const client = df.getClient(context);
        const body = await request.text();
        const instanceId = await client.startNew(request.params.orchestratorName, { input: body });

        context.log(`Started orchestration with ID = '${instanceId}'.`);

        return client.createCheckStatusResponse(request, instanceId);
    },
});