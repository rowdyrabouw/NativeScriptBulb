import { Component, NgZone, OnInit } from "@angular/core";
import {
    SpeechRecognition,
    SpeechRecognitionTranscription,
} from "nativescript-speech-recognition";

@Component({
    moduleId: module.id,
    selector: "Bulb",
    templateUrl: "bulb.component.html",
})
export class BulbComponent implements OnInit {
    hex: string;
    rgb: string;
    userText: string;
    microphoneEnabled: boolean = false;
    private speechRecognition: SpeechRecognition = new SpeechRecognition();
    recording: boolean = false;
    lastTranscription: string = null;
    spoken: boolean = false;
    showingTips: boolean = false;
    recognizedText: string;
    private recordingAvailable: boolean;

    constructor(private zone: NgZone) {}

    ngOnInit() {
        this.checkSpeechRecognitionAvailability();
        setTimeout(() => {
            this.speechRecognition
                .requestPermission()
                .then((granted: boolean) => {
                    this.microphoneEnabled = granted;
                });
        }, 1000);
    }

    onColorSelected($event) {
        const hex = String($event.object.color);
        this.hex = hex;
        this.rgb = this.hexToRGB(String(hex).substr(1, 6)).join(", ");
    }

    checkSpeechRecognitionAvailability() {
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
                console.log("stop");
                console.log(this.lastTranscription);
                this.colorNameToHex(this.lastTranscription);
            }
        }
    }
    private startListening(): void {
        if (!this.recordingAvailable) {
            alert({
                title: "Not supported",
                message:
                    "Speech recognition not supported on this device. Try a different device please.",
                okButtonText: "Oh, bummer",
            });
            this.recognizedText = "No support 😟, but try the tips below!";
            this.recording = false;
            this.showingTips = true;
            return;
        }

        this.clearScreen();
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
                    this.userText = transcription.text;
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
        console.log(text);
        this.colorNameToHex(text);
    }

    private hexToRGB(hex) {
        if (hex.length != 6) {
            throw "Only six-digit hex colors are allowed.";
        }
        const aRgbHex = hex.match(/.{1,2}/g);
        const aRgb = [
            parseInt(aRgbHex[0], 16),
            parseInt(aRgbHex[1], 16),
            parseInt(aRgbHex[2], 16),
        ];
        return aRgb;
    }

    private colorNameToHex(name: string) {
        const acceptedColors = [
            { name: "red", hex: "#FF0000", rgb: "255, 0 ,0" },
            { name: "purple", hex: "#800080", rgb: "128, 0, 128" },
            { name: "yellow", hex: "#FFFF00", rgb: "255, 255, 0" },
        ];

        const foundColor = acceptedColors.find(
            (color) => color.name === name.toLowerCase()
        );

        if (foundColor) {
            this.hex = foundColor.hex;
            this.rgb = foundColor.rgb;
            console.log(JSON.stringify(foundColor));
        } else {
            alert({
                title: `${name}`,
                message:
                    "Sorry, this color is not present in the list of accepted colors.",
                okButtonText: "Try again",
            });
        }
    }

    private clearScreen() {
        this.hex = null;
        this.rgb = null;
        this.userText = null;
    }
}