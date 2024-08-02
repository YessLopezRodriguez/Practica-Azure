module.exports = async function (context, eventGridEvent) {
    context.log(eventGridEvent);
    switch (eventGridEvent.eventType) {
    case 'TaskCreated':
                context.log('Handle Task Created:', eventGridEvent.data);
                break;
                case 'TaskUpdated':
            context.log('Handle Task Updated:', eventGridEvent.data);
            break;
case 'TaskDeleted':
            context.log('Handle Task Deleted:', eventGridEvent.data);
            break;
default:
            context.log('Unhandled event type:', eventGridEvent.eventType);
            break;
    }
};