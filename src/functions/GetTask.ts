import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import * as dotenv from "dotenv";

dotenv.config();

export async function GetTask(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const id = req.query.get('id')
    if (!id) {
        return {
            status: 400,
            body: "Please provide an id."
        };
    }

    try {
        
        const client = new CosmosClient({
            endpoint: process.env.COSMOS_DB_ENDPOINT,
            key: process.env.COSMOS_DB_KEY
        });
        context.log();
        const { database } = await client.databases.createIfNotExists({ id: process.env.COSMOS_DB_DATABASE_ID });
        
        const { container } = await database.containers.createIfNotExists({ id: process.env.COSMOS_DB_CONTAINER_ID, partitionKey: process.env.COSMOS_DB_PARTITION_KEY })
        
        const { resource: task } = await container.item(id, id).read(); 
        
        if (!task) {
            return {
                status: 404,
                body: `Task with id ${id} not found.`
            };
        }

        return {
            status: 200,
            body: task
        };
    } catch (error) {
        return {
            status: 500,
            body: `Failed to retrieve task. Error: ${error}`
        };
    }

};

app.http('GetTask', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetTask
});
