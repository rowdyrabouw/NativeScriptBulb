import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "@nativescript/angular";
import { NativeScriptColorWheelModule } from "@sergeymell/nativescript-color-wheel/angular";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { BulbComponent } from "./bulb/bulb.component";

@NgModule({
    bootstrap: [AppComponent],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NativeScriptColorWheelModule,
    ],
    declarations: [AppComponent, HomeComponent, BulbComponent],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
