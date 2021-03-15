import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular/common";

import { BulbRoutingModule } from "./bulb-routing.module";
import { BulbComponent } from "./bulb.component";


@NgModule({
  imports: [NativeScriptCommonModule, BulbRoutingModule],
  declarations: [BulbComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class BulbModule {}
