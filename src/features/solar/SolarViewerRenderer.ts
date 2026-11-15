/** Solar viewer-renderer registration and WebGL callbacks; solar calculations stay runtime-owned. */
export interface SolarViewer {
 addCustomRenderer(renderer: any): unknown;
 removeCustomRenderer(id: string): unknown;
 resize(): unknown;
}

export class SolarViewerRenderer {
 private active = false;
 private renderer: any = null;
 private readonly readOpaquePass: () => number;
 private readonly readPixelRatio: () => number;

 constructor(readOpaquePass: () => number, readPixelRatio: () => number) {
  this.readOpaquePass = readOpaquePass; this.readPixelRatio = readPixelRatio;
 }

 /** Register once or update the existing sun position, preserving the viewer resize order. */
 update(viewer: SolarViewer | null, azimuthDeg: number, altitudeDeg: number): void {
  if (!this.active) this.attach(viewer, azimuthDeg, altitudeDeg);
  else if (this.renderer) { this.renderer.updateSunPosition(azimuthDeg, altitudeDeg); viewer!.resize(); }
 }

 /** A replacement viewer has no registration yet; retain the original flag-only reset semantics. */
 resetRegistration(): void { this.active = false; }

 /** Unregister from the supplied viewer and release registration state using the existing error handling.
  * Mapillary invokes onRemove to delete the GL program and position buffer.
  */
 detach(viewer: SolarViewer | null): void {
  if (this.active && viewer) {
   try { viewer.removeCustomRenderer('solar-renderer'); } catch {}
   this.active = false; this.renderer = null; viewer.resize();
  }
  this.active = false; this.renderer = null;
 }

 /** Build the unchanged sun shader and its buffer lifecycle; dependencies are read from the host. */
 private attach(viewer: SolarViewer | null, azimuthDeg: number, altitudeDeg: number) {
    if (!viewer) return;

    const vsSource = `
            attribute vec3 aPosition;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform float uPixelRatio;

            void main(void) {
                // Push the sun very far away (infinity projection)
                gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition * 1000.0, 1.0);
                gl_PointSize = 200.0 * uPixelRatio; // Massive sun disc
            }
        `;

    const fsSource = `
            precision mediump float;
            void main(void) {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if (dist > 0.5) discard;

                // Hot White Core
                if (dist < 0.10) {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
                // Yellow/Orange Corona Glow
                else {
                    float alpha = (0.5 - dist) * 2.0;
                    gl_FragColor = vec4(1.0, 0.8, 0.1, alpha * 0.9);
                }
            }
        `;

    const readPixelRatio = this.readPixelRatio;
    const renderer: any = {
      id: "solar-renderer",
      renderPass: this.readOpaquePass(), // Draw behind UI tags
      _gl: null,
      _program: null,
      _positionBuffer: null,
      _az: azimuthDeg,
      _alt: altitudeDeg,

      /**
       * Update scene solar presentation from the selected time/location rather than altering imagery metadata.
       */
      updateSunPosition(az: number, alt: number) {
        this._az = az;
        this._alt = alt;
        const gl = this._gl;
        if (!gl || !this._positionBuffer) return;

        // Convert Az/Alt to Mapillary ENU Coordinate System (X=East, Y=North, Z=Up)
        const radAz = az * (Math.PI / 180);
        const radAlt = alt * (Math.PI / 180);

        const enuX = Math.sin(radAz) * Math.cos(radAlt);
        const enuY = Math.cos(radAz) * Math.cos(radAlt);
        const enuZ = Math.sin(radAlt);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([enuX, enuY, enuZ]), gl.DYNAMIC_DRAW);
      },

      onAdd(viewer: any, reference: any, context: WebGLRenderingContext) {
        const gl = context;
        this._gl = gl;

        const compile = (type: number, src: string) => {
          const s = gl.createShader(type)!;
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        };

        const program = gl.createProgram()!;
        gl.attachShader(program, compile(gl.VERTEX_SHADER, vsSource));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fsSource));
        gl.linkProgram(program);
        this._program = program;

        this._uViewMatrixLoc = gl.getUniformLocation(program, "uViewMatrix");
        this._uProjectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
        this._uPixelRatioLoc = gl.getUniformLocation(program, "uPixelRatio");
        this._aPositionLoc = gl.getAttribLocation(program, "aPosition");

        this._positionBuffer = gl.createBuffer()!;
        this.updateSunPosition(this._az, this._alt);
      },

      onRemove(viewer: any, context: WebGLRenderingContext) {
        if (this._program) context.deleteProgram(this._program);
        if (this._positionBuffer) context.deleteBuffer(this._positionBuffer);
      },

      render(context: WebGLRenderingContext, viewMatrix: Float32Array, projectionMatrix: Float32Array) {
        const gl = context;
        gl.useProgram(this._program);
        gl.uniformMatrix4fv(this._uViewMatrixLoc, false, viewMatrix);
        gl.uniformMatrix4fv(this._uProjectionMatrixLoc, false, projectionMatrix);
        gl.uniform1f(this._uPixelRatioLoc, readPixelRatio());

        gl.enableVertexAttribArray(this._aPositionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.vertexAttribPointer(this._aPositionLoc, 3, gl.FLOAT, false, 0, 0);

        // Enable Blending for the glowing corona effect
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);

        gl.drawArrays(gl.POINTS, 0, 1);

        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.disableVertexAttribArray(this._aPositionLoc);
      },
    };

    try {
      viewer.addCustomRenderer(renderer);
      this.active = true;
      this.renderer = renderer;
      viewer.resize();
    } catch (e) {}
  }
}
