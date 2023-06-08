/// <reference path="moduleBase.ts" />


class RCTRArchipelago extends ModuleBase {
    FirstEntry(): void {
        info("Module to handle connecting and communicating with Archipelago");
        return;
    }
}

if(context.apiVersion >= 75)
    registerModule(new RCTRArchipelago());
