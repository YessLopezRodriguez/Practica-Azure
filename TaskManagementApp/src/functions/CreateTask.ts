const { CosmosClient } = require("@azure/cosmos");
const endpoint = "https://localhost:8081";
const key = "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";
const client = new CosmosClient({ endpoint, key });
const databaseId = "TaskDB";
const tasksContainerId = "Tasks";
const eventsContainerId = "Events";
const { EventGridPublisherClient, AzureKeyCredential } = require("@azure/eventgrid");
const eventGridEndpoint = process.env.EVENT_GRID_ENDPOINT;
const eventGridKey = process.env.EVENT_GRID_KEY;
const publisher = new EventGridPublisherClient(eventGridEndpoint, new AzureKeyCredential(eventGridKey));


module.exports = async function (context, req) {
    const newTask = req.body;
    const event = {
        entityId: newTask.id,
        eventType: "TaskCreated",
        data: newTask,
        timestamp: new Date().toISOString()
    };
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container: eventsContainer } = await database.containers.createIfNotExists({ id: eventsContainerId });
    const { container: tasksContainer } = await database.containers.createIfNotExists({ id: tasksContainerId });
    // Guardar el evento
    await eventsContainer.items.create(event);
    
    // Actualizar el estado actual
    await tasksContainer.items.upsert(newTask);
    context.res = {
        status: 201,
        body: newTask
    };
    await publishEvent(event, context.res);
};

async function publishEvent(eventType, data) {
    await publisher.send([
        {
            eventType: eventType,
            subject: `tasks/${data.id}`,
            dataVersion: "1.0",
            data: data,
            eventTime: new Date()
        }
    ]);
}