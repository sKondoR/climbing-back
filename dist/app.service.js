"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer_1 = require("puppeteer");
const BUTTON_SELECTOR = '.load-more';
function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
let AppService = class AppService {
    async getClimberById(id) {
        const browser = await puppeteer_1.default.launch();
        const page = await browser.newPage();
        let result = [];
        let doRequests = true;
        let count = 0;
        try {
            await page.goto(`https://www.allclimb.com/ru/climber/${id}`);
            const button = await page.$$(BUTTON_SELECTOR);
            const getRoutes = async () => {
                const data = await page.$$eval('.news-preview', (elements) => {
                    return elements.map((element) => ({
                        isBoulder: element.textContent.includes('Боулдер'),
                        grade: element.querySelector('h4').textContent.trim(),
                        name: element.querySelector('b').textContent.trim(),
                        date: element
                            .querySelector('.news-preview-date')
                            .textContent.trim(),
                    }));
                });
                return data;
            };
            result = await getRoutes();
            while (doRequests) {
                await button[0].click();
                await page.waitForSelector('#wall', { visible: true });
                await page.waitForSelector('#wall', { visible: false });
                await timeout(1000);
                const data = await getRoutes();
                doRequests = data.length > result.length;
                result = data;
                count = count + 1;
            }
            return [...result, count];
        }
        catch (error) {
            console.error('Error while scraping job listings:', error);
        }
        finally {
            await browser.close();
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map