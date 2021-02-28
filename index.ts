const w : number = window.innerWidth 
const h : number = window.innerHeight
const lines : number = 4 
const parts : number = 2 + lines 
const scGap : number = 0.02 / parts 
const strokeFactor : number = 90 
const sizeFactor : number = 3.4 
const delay : number = 20
const lineSizeFactor : number = 0.8 
const boxYFactor : number = 0.2 
const colors : Array<string> = [
    "#1abc9c",
    "#c0392b",
    "#8e44ad",
    "#d35400",
    "#2ecc71"
]
const backColor : string = "#ecf0f1"

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawLinesInABox(context : CanvasRenderingContext2D, scale : number) {
        const boxSize : number = Math.min(w, h) / sizeFactor 
        const lineSize : number = Math.min(w, h) / lineSizeFactor 
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, parts)
        const offset : number = (boxSize - lineSize) / 2
        const lineGap : number = boxSize / (2 * lines + 1) 
        context.save()
        context.translate((w - boxSize) * sf2, h *  boxYFactor)
        context.fillRect(0, 0, boxSize * sf1, boxSize)
        for (let j = 0; j < lines; j++) {
            const sfj : number = ScaleUtil.divideScale(sf, 2 + j, parts)
            context.save()
            context.translate(offset, (2 * j + 1) * lineGap)
            DrawingUtil.drawLine(context, 0, 0, lineSize * sfj, 0) 
            context.restore()           
        }
        context.restore()
    }

    static drawLIBNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = backColor 
        context.fillStyle = colors[i]
        DrawingUtil.drawLinesInABox(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }
    
    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0

    update(cb : Function) {
        this.scale += this.dir * scGap 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0
            this.prevScale = this.scale 
            cb()
        } 
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {
    
    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}