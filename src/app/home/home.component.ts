import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Page } from "@nativescript/core/ui/page";

import { Version } from "nativescript-version";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
    version: string;

    constructor(private router: Router, private page: Page) {}

    ngOnInit(): void {
        this.page.actionBarHidden = true;
        this.version = new Version().getVersion();
    }

    goToBulbDemo() {
        this.router.navigate(["/bulb"]);
    }
}
