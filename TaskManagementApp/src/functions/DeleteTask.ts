
module.exports = async function (context, req) {
    const id = req.query.id;
    if (!id) {
        context.res = {
            status: 400,
            body: "Please provide an id."
        };
        return;
    }
    const { EventGridPublisherClient, AzureKeyCredential } = require("@azure/eventgrid");
const eventGridEndpoint = process.env.EVENT_GRID_ENDPOINT;
const eventGridKey = process.env.EVENT_GRID_KEY;
const publisher = new EventGridPublisherClient(eventGridEndpoint, new AzureKeyCredential(eventGridKey));
const event = {
        entityId: id,
        eventType: "TaskDeleted",
        timestamp: new Date().toISOString()
    };

    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container: eventsContainer } = await database.containers.createIfNotExists({ id: eventsContainerId });
    const { container: tasksContainer } = await database.containers.createIfNotExists({ id: tasksContainerId });

    // Guardar el evento
    await eventsContainer.items.create(event);

    // Eliminar el estado actual
    await tasksContainer.item(id).delete();

    context.res = {
        status: 200,
        body: `Task with id ${id} deleted`
    };
    await publishEvent(event, context.res);
};