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
exports.SagaCoordinator = void 0;
const functions_1 = require("@azure/functions");
const axios_1 = require("axios");
function SagaCoordinator(request, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { operation, taskId, data } = request.body;
        try {
            switch (operation) {
                case "get":
                    yield axios_1.default.delete('http://localhost:7071/api/GetTask', { params: { id: taskId } });
                    break;
                case 'create':
                    yield axios_1.default.post('http://localhost:7071/api/CreateTask', data);
                    break;
                case 'update':
                    yield axios_1.default.post('http://localhost:7071/api/UpdateTask', data);
                    break;
                case 'delete':
                    yield axios_1.default.delete('http://localhost:7071/api/DeleteTask', { params: { id: taskId } });
                    break;
                default:
                    throw new Error('Unsupported operation');
            }
            return {
                status: 200,
                body: "Operation completed successfully"
            };
        }
        catch (error) {
            // Aquí puedes implementar la lógica de compensación si la operación falla
            return {
                status: 500,
                body: `Operation failed: ${error}`
            };
        }
    });
}
exports.SagaCoordinator = SagaCoordinator;
;
functions_1.app.http('SagaCoordinator', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: SagaCoordinator
});
//# sourceMappingURL=SagaCoordinator.js.map