import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from 'axios';

export async function SagaCoordinator(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const { operation, taskId, data }: any = request.body;

    try {
        switch (operation) {
            case "get":
                await axios.delete('http://localhost:7071/api/GetTask', { params: { id: taskId } });
            break;
            case 'create':
                await axios.post('http://localhost:7071/api/CreateTask', data);
                break;
            case 'update':
                await axios.post('http://localhost:7071/api/UpdateTask', data);
                break;
            case 'delete':
                await axios.delete('http://localhost:7071/api/DeleteTask', { params: { id: taskId } });
                break;
            default:
                throw new Error('Unsupported operation');
        }

        return  {
            status: 200,
            body: "Operation completed successfully"
        };
    } catch (error) {
        // Aquí puedes implementar la lógica de compensación si la operación falla
        return {
            status: 500,
            body: `Operation failed: ${error}`
        };
    }
};

app.http('SagaCoordinator', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: SagaCoordinator
});
