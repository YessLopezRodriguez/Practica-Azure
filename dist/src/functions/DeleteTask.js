"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTask = void 0;
const functions_1 = require("@azure/functions");
const axios_1 = require("axios");
const cosmos_1 = require("@azure/cosmos");
const dotenv = require("dotenv");
dotenv.config();
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = process.env.COSMOS_DB_CONTAINER_ID;
//const eventGridTopicEndpoint = process.env.EVENT_GRID_TOPIC_ENDPOINT!;
//const eventGridTopicKey = process.env.EVENT_GRID_TOPIC_KEY!;
const client = new cosmos_1.CosmosClient({ endpoint, key });
function DeleteTask(req, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, sagaId } = req.query;
        if (!id || !sagaId) {
            return {
                status: 400,
                body: "Please provide an id and sagaId."
            };
        }
        const { database } = yield client.databases.createIfNotExists({ id: databaseId });
        const { container } = yield database.containers.createIfNotExists({ id: containerId });
        try {
            yield container.item(id).delete();
            const event = {
                id,
                subject: `Task deleted: ${id}`,
                data: { id },
                eventType: "TaskDeleted",
                eventTime: new Date(),
                dataVersion: "1.0"
            };
            // await axios.post(eventGridTopicEndpoint, [event], {
            //     headers: {
            //         "aeg-sas-key": eventGridTopicKey,
            //         "Content-Type": "application/json"
            //     }
            // });
            yield axios_1.default.post(`${process.env.FUNCTIONS_URL}/api/SagaCoordinator`, {
                sagaId,
                operation: 'delete',
                status: 'success',
                data: { id }
            });
            return {
                status: 204
            };
        }
        catch (error) {
            yield axios_1.default.post(`${process.env.FUNCTIONS_URL}/api/SagaCoordinator`, {
                sagaId,
                operation: 'delete',
                status: 'failure',
                error: error
            });
            return {
                status: 500,
                body: `Task deletion failed. Error: ${error}`
            };
        }
    });
}
exports.DeleteTask = DeleteTask;
;
functions_1.app.http('DeleteTask', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: DeleteTask
});
//# sourceMappingURL=DeleteTask.js.map