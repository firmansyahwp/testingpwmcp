export class RuntimeConfig {

    private static _headless = true;

    static get headless(): boolean {
        return this._headless;
    }

    static set headless(value: boolean) {
        this._headless = value;
    }

}