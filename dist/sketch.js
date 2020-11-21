/// <reference path="../p5.global-mode.d.ts" />
document.addEventListener('contextmenu', event => event.preventDefault());
class Bit {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.value = false;
        this.connect = [];
        this.type = type;
    }
    overlap(x, y) {
        return sq(x - this.x) + sq(y - this.y) <= sq(10);
    }
    draw() {
        stroke(40, 40, 40);
        if (this.value) {
            fill(220, 40, 60);
            stroke(190, 78, 78);
        }
        else {
            fill(20, 20, 20);
            stroke(30, 30, 30);
        }
        if (this.connect.length > 0) {
            this.connect.forEach(_l => {
                line(this.x, this.y, _l.x, _l.y);
            });
        }
        noStroke();
        ellipse(this.x, this.y, 10);
    }
    /** Destroy all connections with this Bit */
    destroy() {
        this.connect.forEach(_b => {
            _b.connect.splice(_b.connect.indexOf(this), 1);
        });
    }
}
class Gate {
    constructor(x, y, struct) {
        this.x = x;
        this.y = y;
        this.struct = struct;
        this.cx = x + struct.w / 2;
        this.cy = y + struct.h / 2;
        this.inputs = [];
        this.outputs = [];
        let _baseY = this.cy - (struct.inputs - 1) * 12.5;
        for (let i = 0; i < struct.inputs; i++) {
            this.inputs.push(new Bit(this.x + 10, _baseY + i * 23, "in"));
        }
        _baseY = this.cy - struct.outputs * 12.5;
        for (let i = 0; i < struct.outputs; i++) {
            this.outputs.push(new Bit(this.x + this.struct.w - 10, _baseY + i * 23, "out"));
        }
    }
    move(x, y) {
        let _x = x - this.x;
        let _y = y - this.y;
        this.x = x;
        this.y = y;
        this.cx += _x;
        this.cy += _y;
        this.inputs.forEach(i => {
            i.x += _x;
            i.y += _y;
        });
        this.outputs.forEach(o => {
            o.x += _x;
            o.y += _y;
        });
    }
    /** Allows checking with the mouse easily */
    overlap(x, y) {
        return this.x < x &&
            this.y < y &&
            this.x + this.struct.w > x &&
            this.y + this.struct.h > y;
    }
    draw() {
        fill(color(this.struct.color));
        noStroke();
        rect(this.x, this.y, this.struct.w, this.struct.h);
        textAlign(CENTER, CENTER);
        fill(0, 0, 0);
        text(this.struct.name, this.cx, this.cy);
        this.bits.forEach(_b => {
            _b.draw();
        });
    }
    calculate() {
        let _bits = [];
        this.inputs.forEach(i => {
            if (i.connect[0])
                i.value = i.connect[0].value;
            else
                i.value = false;
            _bits.push(i.value);
        });
        _bits = this.struct.logic(_bits);
        _bits.forEach((_b, i) => {
            this.outputs[i].value = _b;
        });
        return _bits;
    }
    /** Returns both the inputs and outputs of the gate */
    get bits() {
        return [...this.inputs, ...this.outputs];
    }
}
class GateStruct {
    constructor(inputs, outputs, name, func) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.logic = func;
        this.name = name;
        let _color = hsvToRgb(Math.round(Math.random() * 255), 200, 255);
        this.color = `rgb(${_color[0]},${_color[1]},${_color[2]})`;
        this.w = 60 + this.name.length * 12;
        this.h = Math.max(inputs, outputs) * 23 + 10;
    }
}
/** All values are between 0 and 255 */
function hsvToRgb(hue, saturation, value) {
    hue *= 360 / 255;
    saturation /= 255;
    value /= 255;
    let _C = value * saturation;
    let _X = _C * (1 - Math.abs((hue / 60) % 2 - 1));
    let _m = value - saturation;
    let rgbP = [];
    if (hue < 60)
        rgbP = [_C, _X, 0];
    else if (hue < 120)
        rgbP = [_X, _C, 0];
    else if (hue < 180)
        rgbP = [0, _C, _X];
    else if (hue < 240)
        rgbP = [0, _X, _C];
    else if (hue < 300)
        rgbP = [_X, 0, _C];
    else
        rgbP = [_C, 0, _X];
    return [(rgbP[0] + _m) * 255, (rgbP[1] + _m) * 255, (rgbP[2] + _m) * 255];
}
//#endregion
let dragging = null;
let draggingPos = { x: 0, y: 0 };
let entryBits = [];
let and = new GateStruct(2, 1, "AND", (input) => {
    return [input[0] && input[1]];
});
let gates = [new Gate(200, 200, and)];
function setup() {
    createCanvas(1200, 800);
    ellipseMode("radius");
}
function draw() {
    background(40);
    noStroke();
    fill(70, 70, 70);
    rect(0, 0, 1200, 80);
    rect(0, 760, 1200, 40);
    rect(0, 0, 40, 800);
    if (dragging instanceof Bit) {
        stroke(200, 200, 200);
        strokeWeight(5);
        line(draggingPos.x, draggingPos.y, mouseX, mouseY);
    }
    entryBits.forEach((e) => {
        e.draw();
    });
    gates.forEach((g) => {
        g.draw();
        g.calculate();
    });
}
function keyPressed() {
    if (keyCode === 67) ///c
     {
        gates.forEach(g => g.calculate());
    }
}
function mousePressed() {
    switch (mouseButton) {
        case LEFT:
            if (mouseX > 20 && mouseX < 60) //Check for entrybits
             {
                for (let i = 0; i < entryBits.length; i++) {
                    let e = entryBits[i];
                    if (abs(e.y - mouseY) < 10) {
                        dragging = e;
                        draggingPos = { x: mouseX, y: mouseY };
                        break;
                    }
                }
            }
            else //Check for gate bits
             {
                for (let i = 0; i < gates.length; i++) {
                    let _bits = gates[i].bits;
                    for (let j = 0; j < _bits.length; j++) {
                        let _b = _bits[j];
                        if (_b === dragging)
                            continue;
                        if (!_b.overlap(mouseX, mouseY))
                            continue;
                        dragging = _b;
                        draggingPos = { x: mouseX, y: mouseY };
                        break;
                    }
                }
                if (dragging === null) //No results
                 {
                    for (let i = 0; i < gates.length; i++) //Loop over gates
                     {
                        let g = gates[i];
                        if (g.overlap(mouseX, mouseY)) {
                            dragging = g;
                            break;
                        }
                    }
                }
            }
            break;
        case RIGHT:
            if (mouseX > 20 && mouseX < 60) {
                for (let i = 0; i < entryBits.length; i++) {
                    let e = entryBits[i];
                    if (abs(e.y - mouseY) < 10) {
                        e.value = !e.value;
                        break;
                    }
                }
            }
            break;
        case CENTER:
            if (mouseX > 20 && mouseX < 60) {
                existingBitSpliced: {
                    for (let i = 0; i < entryBits.length; i++) {
                        let e = entryBits[i];
                        if (abs(e.y - mouseY) < 15) {
                            e.destroy();
                            entryBits.splice(i, 1);
                            break existingBitSpliced;
                        }
                    }
                    entryBits.push(new Bit(40, mouseY, "out"));
                }
            }
            else {
                for (let i = 0; i < gates.length; i++) {
                    let g = gates[i];
                    if (g.overlap(mouseX, mouseY)) {
                        gates.push(new Gate(mouseX, mouseY, g.struct));
                        dragging = gates[gates.length - 1];
                        break;
                    }
                }
            }
            break;
    }
}
function mouseReleased() {
    switch (mouseButton) {
        case LEFT:
            {
                if (dragging instanceof Bit) {
                    for (let i = 0; i < gates.length; i++) {
                        let _bits = gates[i].bits;
                        for (let j = 0; j < _bits.length; j++) {
                            let _b = _bits[j];
                            if (_b === dragging)
                                continue; //If the bit is the same as the one we're dragging
                            if (!_b.overlap(mouseX, mouseY))
                                continue;
                            if (_b.type === dragging.type)
                                continue; //Can not connect an input with an input or an output with an output
                            if (_b.type === "in") {
                                _b.destroy();
                                _b.connect[0] = dragging;
                            }
                            else
                                _b.connect.push(dragging);
                            if (dragging.type === 'in') {
                                dragging.destroy();
                                dragging.connect[0] = _b;
                            }
                            else
                                dragging.connect.push(_b);
                            break;
                        }
                    }
                }
                break;
            }
    }
    dragging = null;
}
function mouseDragged() {
    if (dragging instanceof Gate) {
        dragging.move(mouseX - dragging.struct.w / 2, mouseY - dragging.struct.h / 2);
    }
}
