// import { app, EventGridEvent, InvocationContext } from "@azure/functions";
// import * as dotenv from "dotenv";

// dotenv.config();

// export async function HandleTaskEvent(event: EventGridEvent, context: InvocationContext): Promise<void> {
//     context.log('Event grid function processed event:', event);
//     const { eventType, data, id }: any = event;
//     switch (eventType) {
//         case "TaskCreated":
//             context.log(`Task Created Event: ${data.id}`);
//             // Procesar evento de tarea creada
//             break;
//         case "TaskUpdated":
//             context.log(`Task Updated Event: ${data.id}`);
//             // Procesar evento de tarea actualizada
//             break;
//         case "TaskDeleted":
//             context.log(`Task Deleted Event: ${data.id}`);
//             // Procesar evento de tarea eliminada
//             break;
//         default:
//             context.log(`Unknown Event Type: ${eventType}`);
//             break;
//     }

// }

// app.eventGrid('HandleTaskEvent', {
//     handler: HandleTaskEvent
// });
