module.exports = async function (context, req) {
    const id = req.query.id;
        if (!id) {
            context.res = {
                status: 400,
                body: "Please provide an id."
            };
            return;
        }
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
        const { container } = await database.containers.createIfNotExists({ id: tasksContainerId });
        const { resource: task } = await container.item(id).read();
        const { EventGridPublisherClient, AzureKeyCredential } = require("@azure/eventgrid");
const eventGridEndpoint = process.env.EVENT_GRID_ENDPOINT;
const eventGridKey = process.env.EVENT_GRID_KEY;
const publisher = new EventGridPublisherClient(eventGridEndpoint, new AzureKeyCredential(eventGridKey));
    context.res = {
            status: 200,
            body: task
        };
        await publishEvent(event, context.res);
    };