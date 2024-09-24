import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getClimberById(id?: string): Promise<Array<string>>;
}
