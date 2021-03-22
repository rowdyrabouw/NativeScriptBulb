// NativeScript
import { Color } from "@nativescript/core/color";

// Angular
import {
    Component,
    NgZone,
    OnInit,
    AfterViewInit,
    ElementRef,
    ViewChild,
} from "@angular/core";

// RxJS
import { Observable } from "rxjs";
import { sampleTime } from "rxjs/operators";

// Plugins
import { Bluetooth, Peripheral } from "@nativescript-community/ble";
import {
    SpeechRecognition,
    SpeechRecognitionTranscription,
} from "nativescript-speech-recognition";
import {
    AccelerometerData,
    isListening,
    startAccelerometerUpdates,
    stopAccelerometerUpdates,
} from "@triniwiz/nativescript-accelerometer";

@Component({
    moduleId: module.id,
    selector: "Bulb",
    templateUrl: "bulb.component.html",
    styleUrls: ["bulb.component.css"],
})
export class BulbComponent implements OnInit, AfterViewInit {
    @ViewChild("colorBox") colorBox: ElementRef;

    // ui
    hex: string;
    rgb: string;
    recording: boolean = false;
    connected: boolean = false;

    // bluetooth
    private bluetooth = new Bluetooth();
    private serviceUUID: string = "cc02";
    private characteristicUUID: string = "ee03";
    private deviceUUID: string = "FC:58:FA:C1:76:47";

    // speech recognition
    private speechRecognition: SpeechRecognition = new SpeechRecognition();
    private recordingAvailable: boolean;
    private lastTranscription: string = null;
    private spoken: boolean = false;
    private recognizedText: string;

    // accelerometer
    private accelerometer$: Observable<AccelerometerData>;

    constructor(private zone: NgZone) {}

    ngOnInit() {
        this.checkSpeechRecognitionAvailability();
        setTimeout(() => {
            this.speechRecognition
                .requestPermission()
                .then((granted: boolean) => {
                    console.log("Microphone enabled?", granted);
                });
        }, 1000);
        this.bluetooth.isBluetoothEnabled().then((enabled) => {
            console.log("Bluetooth enabled? ", enabled);
        });
    }

    ngAfterViewInit() {
        this.clearColorData();
    }

    // ui
    onColorSelected($event) {
        this.clearColorData();
        const hex = String($event.object.color);
        this.writeColor(hex);
    }

    private writeColor(hex) {
        this.updateColorData(hex);
        this.writeColorToBulb(hex);
    }

    private updateColorData(hex) {
        this.hex = hex;
        this.rgb = this.hexToRgbString(hex);
        this.colorBox.nativeElement.style.backgroundColor = new Color(hex);
        this.colorBox.nativeElement.style.visibility = "visible";
    }

    private clearColorData() {
        this.hex = null;
        this.rgb = null;
        this.colorBox.nativeElement.style.visibility = "hidden";
    }

    // bluetooth
    connectLight() {
        this.bluetooth.connect({
            UUID: this.deviceUUID,
            onConnected: (peripheral: Peripheral) => {
                console.log("Connected");
                this.connected = true;
                // set bulb to black to emulate 'off'
                this.writeColorToBulb("#000000");
            },
            onDisconnected: (peripheral: Peripheral) => {
                this.connected = false;
                console.log("Disconnected");
            },
        });
    }

    disconnectLight() {
        this.bluetooth
            .disconnect({
                UUID: this.deviceUUID,
            })
            .then(
                () => {
                    console.log("disconnected successfully");
                    this.connected = false;
                    this.clearColorData();
                },
                (err) => {
                    // in this case you're probably best off treating this as a disconnected peripheral though
                    console.log("disconnection error: " + err);
                }
            );
    }

    private writeColorToBulb(color) {
        this.bluetooth.writeWithoutResponse({
            serviceUUID: this.serviceUUID,
            characteristicUUID: this.characteristicUUID,
            peripheralUUID: this.deviceUUID,
            value: this.hexToRgbUint8Array(color),
        });
    }

    // speech recognition
    private checkSpeechRecognitionAvailability() {
        this.speechRecognition.available().then(
            (available: boolean) => (this.recordingAvailable = available),
            (err: string) => console.log(err)
        );
    }

    toggleRecording(): void {
        this.recording = !this.recording;
        if (this.recording) {
            this.spoken = false;
            this.lastTranscription = null;
            this.startListening();
        } else {
            this.stopListening();
            if (!this.spoken && this.lastTranscription !== null) {
                console.log("User said?", this.lastTranscription);
                this.colorNameToHex(this.lastTranscription);
            }
        }
    }

    private startListening(): void {
        if (!this.recordingAvailable) {
            alert({
                title: "Not supported",
                message: "Speech recognition not supported on this device.",
                okButtonText: "Oh, bummer",
            });
            this.recording = false;
            return;
        }
        this.clearColorData();
        this.recording = true;
        this.speechRecognition
            .startListening({
                // optional, uses the device locale by default
                locale: "en-US",
                // set to true to get results back continuously
                returnPartialResults: true,
                // this callback will be invoked repeatedly during recognition
                onResult: (transcription: SpeechRecognitionTranscription) => {
                    this.zone.run(
                        () => (this.recognizedText = transcription.text)
                    );
                    console.log(`User said: ${transcription.text}`);
                    console.log(`User finished?: ${transcription.finished}`);
                },
            })
            .then(
                (started: boolean) => {
                    console.log(`started listening`);
                },
                (errorMessage: string) => {
                    console.log(`Error: ${errorMessage}`);
                }
            );
    }

    private stopListening() {
        this.recording = false;
        this.speechRecognition.stopListening().then(
            () => {
                console.log(`stopped listening`);
                this.processSpokenTextInput();
            },
            (errorMessage: string) => {
                console.log(`Stop error: ${errorMessage}`);
            }
        );
    }

    private processSpokenTextInput() {
        let text = this.recognizedText;
        console.log("recognizedText", text);
        this.colorNameToHex(text);
    }

    // accelerometer
    toggleAccelerometer() {
        if (this.isAccelerometerListening()) {
            this.stopAccelerometer();
        } else {
            this.startAccelerometer();
        }
    }

    private startAccelerometer() {
        this.clearColorData();
        this.accelerometer$ = new Observable((observer) => {
            startAccelerometerUpdates(
                (data: AccelerometerData) => {
                    observer.next(data);
                },
                { sensorDelay: "normal" }
            );
        });
        this.accelerometer$.pipe(sampleTime(500)).subscribe((data) => {
            this.accelerometerToRgb(data);
        });
    }

    private stopAccelerometer() {
        stopAccelerometerUpdates();
    }

    isAccelerometerListening() {
        return isListening();
    }

    private accelerometerToRgb(data) {
        const r = this.coordinateToRgbInteger(data.x);
        const g = this.coordinateToRgbInteger(data.y);
        const b = this.coordinateToRgbInteger(data.z);
        const hex = this.rgbToHex(r, g, b);
        this.writeColorToBulb(hex);
    }

    // utilities
    private rgbToHex(red, green, blue): string {
        var rgb = blue | (green << 8) | (red << 16);
        return "#" + (0x1000000 + rgb).toString(16).slice(1);
    }

    private hexToRgbString(hex: string): string {
        const rgbArray = hex.substr(1, 6).match(/.{1,2}/g);
        return `rgb(${parseInt(rgbArray[0], 16)}, ${parseInt(
            rgbArray[1],
            16
        )}, ${parseInt(rgbArray[2], 16)})`;
    }

    private hexToRgbUint8Array(color) {
        var c = parseInt(color.substring(1), 16);
        var r = (c >> 16) & 255;
        var g = (c >> 8) & 255;
        var b = c & 255;
        return new Uint8Array([
            0x01,
            g,
            0x01,
            0x00,
            0x01,
            b,
            0x01,
            r,
            0x01,
            0x00,
        ]);
    }

    private colorNameToHex(name: string) {
        const acceptedColors = [
            { name: "magenta", hex: "#800080", rgb: "128, 0, 128" },
            { name: "yellow", hex: "#FFFF00", rgb: "255, 255, 0" },
            { name: "blue", hex: "#030CFF", rgb: "3, 12, 255" },
        ];

        const foundColor = acceptedColors.find(
            (color) => color.name === name.toLowerCase()
        );

        if (foundColor) {
            this.hex = foundColor.hex;
            this.rgb = foundColor.rgb;
            this.updateColorData(this.hex);
            this.writeColorToBulb(this.hex);
        } else {
            alert({
                title: `${name}`,
                message:
                    "Sorry, this color is not present in the list of accepted colors.",
                okButtonText: "Try again",
            });
        }
    }

    private coordinateToRgbInteger(value) {
        // convert value between -1 and +1 to value between 0 and 255
        return Math.round((value + 1) / 0.00784313725490196);
    }
}
