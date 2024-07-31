module.exports = async function (context, req) {
    const updatedTask = req.body;
    const event = {
        entityId: updatedTask.id,
        eventType: "TaskUpdated",
        data: updatedTask,
        timestamp: new Date().toISOString()
    };

    const { EventGridPublisherClient, AzureKeyCredential } = require("@azure/eventgrid");
    const eventGridEndpoint = process.env.EVENT_GRID_ENDPOINT;
    const eventGridKey = process.env.EVENT_GRID_KEY;
    const publisher = new EventGridPublisherClient(eventGridEndpoint, new AzureKeyCredential(eventGridKey));

    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container: eventsContainer } = await database.containers.createIfNotExists({ id: eventsContainerId });
    const { container: tasksContainer } = await database.containers.createIfNotExists({ id: tasksContainerId });

    // Guardar el evento
    await eventsContainer.items.create(event);

    // Actualizar el estado actual
    await tasksContainer.items.upsert(updatedTask);

    context.res = {
        status: 200,
        body: updatedTask
    };
    await publishEvent(event, context.res);
};
