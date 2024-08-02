require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');
const axios = require('axios');

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = process.env.COSMOS_DB_CONTAINER_ID;
const eventGridTopicEndpoint = process.env.EVENT_GRID_TOPIC_ENDPOINT;
const eventGridTopicKey = process.env.EVENT_GRID_TOPIC_KEY;

const client = new CosmosClient({ endpoint, key });
module.exports = async function (context, req) {
    const { id, title, description } = req.body;

    if (!id || !title || !description) {
        context.res = {
            status: 400,
            body: "Please provide id, title, and description."
        };
        return;
    }
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container } = await database.containers.createIfNotExists({ id: databaseId });
    const { resource: createdTask } = await container.items.create({ id, title, description });

    // Publicar evento en Event Grid
    const event = {
        id: id,
        subject: `New task created: ${id}`,
        data: createdTask,
        eventType: "TaskCreated",
        eventTime: new Date(),
        dataVersion: "1.0"
    };
    
    await axios.post(eventGridTopicEndpoint, [event], {
        headers: {
            "aeg-sas-key": eventGridTopicKey,
            "Content-Type": "application/json"
        }
    });
    context.res = {
        status: 201,
        body: createdTask
    };
};

