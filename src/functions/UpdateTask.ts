import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from '@azure/cosmos';
import axios from 'axios';
import * as dotenv from "dotenv";

dotenv.config();
const endpoint = process.env.COSMOS_DB_ENDPOINT!;
const key = process.env.COSMOS_DB_KEY!;
const databaseId = process.env.COSMOS_DB_DATABASE_ID!;
const containerId = process.env.COSMOS_DB_CONTAINER_ID!;
//const eventGridTopicEndpoint = process.env.EVENT_GRID_TOPIC_ENDPOINT!;
//const eventGridTopicKey = process.env.EVENT_GRID_TOPIC_KEY!;

const client = new CosmosClient({ endpoint, key });

export async function UpdateTask(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  
    const { id, title, description, sagaId }: any = req.body;
    if (!id || !title || !description || !sagaId) {
        return {
            status: 400,
            body: "Please provide id, title, description, and sagaId."
        };
        
    }

    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container } = await database.containers.createIfNotExists({ id: containerId });

    try {
        const { resource: updatedTask } = await container.item(id).replace({ id, title, description });

        const event = {
            id,
            subject: `Task updated: ${id}`,
            data: updatedTask,
            eventType: "TaskUpdated",
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
            operation: 'update',
            status: 'success',
            data: updatedTask
        });

        return {
            status: 200,
            body: JSON.stringify(updatedTask)
        };
    } catch (error) {
        await axios.post(`${process.env.FUNCTIONS_URL}/api/SagaCoordinator`, {
            sagaId,
            operation: 'update',
            status: 'failure',
            error: error
        });

        return {
            status: 500,
            body: `Task update failed. Error: ${error}`
        };
    }
    //return { body: `Hello` };

};

app.http('UpdateTask', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: UpdateTask
});
