import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from '@azure/cosmos';
import axios from 'axios';
import  * as dotenv from "dotenv";

dotenv.config();

const endpoint = process.env.COSMOS_DB_ENDPOINT
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = process.env.COSMOS_DB_CONTAINER_ID;
// const eventGridTopicEndpoint = process.env.EVENT_GRID_TOPIC_ENDPOINT!;
// const eventGridTopicKey = process.env.EVENT_GRID_TOPIC_KEY!;

const client = new CosmosClient({ endpoint, key });

export async function CreateTask(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    
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
        
        const { resource: createdTask } = await container.items.create({ id, title, description });

        const event = {
            id,
            subject: `New task created: ${id}`,
            data: createdTask,
            eventType: "TaskCreated",
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
            operation: 'create',
            status: 'success',
            data: createdTask
        });

        return  {
            status: 201,
            body: JSON.stringify(createdTask)
        };
        
    } catch (error) {
        // await axios.post(`${process.env.FUNCTIONS_URL}/api/SagaCoordinator`, {
        //     sagaId,
        //     operation: 'create',
        //     status: 'failure',
        //     error: error
        // });

        return {
            status: 500,
            body: `Task creation failed. Error: ${error}`
        };
    }
};

app.http('CreateTask', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: CreateTask
});
