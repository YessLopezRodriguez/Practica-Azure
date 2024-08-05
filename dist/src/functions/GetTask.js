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
exports.GetTask = void 0;
const functions_1 = require("@azure/functions");
const cosmos_1 = require("@azure/cosmos");
const dotenv = require("dotenv");
dotenv.config();
function GetTask(req, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.query.get('id');
        if (!id) {
            return {
                status: 400,
                body: "Please provide an id."
            };
        }
        try {
            const client = new cosmos_1.CosmosClient({
                endpoint: process.env.COSMOS_DB_ENDPOINT,
                key: process.env.COSMOS_DB_KEY
            });
            context.log();
            const { database } = yield client.databases.createIfNotExists({ id: process.env.COSMOS_DB_DATABASE_ID });
            const { container } = yield database.containers.createIfNotExists({ id: process.env.COSMOS_DB_CONTAINER_ID, partitionKey: process.env.COSMOS_DB_PARTITION_KEY });
            const { resource: task } = yield container.item(id, id).read();
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
        }
        catch (error) {
            return {
                status: 500,
                body: `Failed to retrieve task. Error: ${error}`
            };
        }
    });
}
exports.GetTask = GetTask;
;
functions_1.app.http('GetTask', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetTask
});
//# sourceMappingURL=GetTask.js.map