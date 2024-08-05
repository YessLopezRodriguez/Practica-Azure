import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from 'axios';
import { CosmosClient } from '@azure/cosmos';
import * as dotenv from "dotenv";

dotenv.config();
const endpoint = process.env.COSMOS_DB_ENDPOINT!;
const key = process.env.COSMOS_DB_KEY!;
const databaseId = process.env.COSMOS_DB_DATABASE_ID!;
const containerId = process.env.COSMOS_DB_CONTAINER_ID!;
//const eventGridTopicEndpoint = process.env.EVENT_GRID_TOPIC_ENDPOINT!;
//const eventGridTopicKey = process.env.EVENT_GRID_TOPIC_KEY!;

const client = new CosmosClient({ endpoint, key });


export async function DeleteTask(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const { id, sagaId }:any = req.query;
    if (!id || !sagaId) {
        return {
            status: 400,
            body: "Please provide an id and sagaId."
        };
    }

    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container } = await database.containers.createIfNotExists({ id: containerId });

    try {
        await container.item(id).delete();

        const event = {
            id,
            subject: `Task deleted: ${id}`,
            data: { id },
            eventType: "TaskDeleted",
            eventTime: new Date(),
            dataVersion: "1.0"
        };

        // await axios.post(eventGridTopicEndpoint, [event], {
        //     headers: {
        //         "aeg-sas-key": eventGridTopicKey,
        //         "Content-Type": "application/json"
        //     }
        // });

        await axios.post(`${process.env.FUNCTIONS_URL}/api/SagaCoordinator`, {
            sagaId,
            operation: 'delete',
            status: 'success',
            data: { id }
        });

        return {
            status: 204
        };
    } catch (error) {
        await axios.post(`${process.env.FUNCTIONS_URL}/api/SagaCoordinator`, {
            sagaId,
            operation: 'delete',
            status: 'failure',
            error: error
        });

        return {
            status: 500,
            body: `Task deletion failed. Error: ${error}`
        };
    }
};

app.http('DeleteTask', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: DeleteTask
});
