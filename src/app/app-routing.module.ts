import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "@nativescript/angular";

import { BulbComponent } from "./bulb/bulb.component";

const routes: Routes = [
    { path: "", redirectTo: "/bulb", pathMatch: "full" },
    { path: "bulb", component: BulbComponent },
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
