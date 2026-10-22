/** A picked sample stores shifted WGS84 map degrees and relative map z separately
 * from raw SfM degrees and source altitude (meters, datum unverified). Never nudge raw data.
 */
export interface MeasurementPoint { mapLon: number; mapLat: number; mapZ: number; rawLon: number; rawLat: number; alt: number; }
export interface MeasurementReference { lng: number; lat: number; alt: number; }
export interface MeasurementLabel { innerText: string; style: { display: string; left: string; top: string }; }
type MeasurementGL = WebGLRenderingContext | WebGL2RenderingContext;
export interface MeasurementRendererCallbacks {
  id: string; renderPass: number;
  onAdd(viewer: unknown, reference: MeasurementReference, context: MeasurementGL): void;
  onReference(viewer: unknown, reference: MeasurementReference): void;
  onRemove(viewer: unknown, context: MeasurementGL): void;
  render(context: MeasurementGL, viewMatrix: number[] | Float32Array, projectionMatrix: number[] | Float32Array): void;
}
export interface MeasurementViewer {
  addCustomRenderer(renderer: MeasurementRendererCallbacks): unknown;
  removeCustomRenderer(id: string): unknown;
  resize(): void;
}
export interface MeasurementViewerDependencies {
  readPoints(): readonly MeasurementPoint[];
  readLabel(): MeasurementLabel | null;
  readCanvas(): { clientWidth: number; clientHeight: number } | null;
  readPixelRatio(): number;
  toEnu(lon: number, lat: number, altitude: number, referenceLon: number, referenceLat: number, referenceAltitude: number): number[];
  warn(...args: unknown[]): void;
}
interface MeasurementRendererState extends MeasurementRendererCallbacks {
  _gl: MeasurementGL | null; _program: WebGLProgram | null;
  _positionBuffer: WebGLBuffer | null; _colorBuffer: WebGLBuffer | null;
  _modelMatrix: Float32Array; _currentReference: MeasurementReference | null; _vertexCount: number;
  _uViewMatrixLoc: WebGLUniformLocation | null; _uProjectionMatrixLoc: WebGLUniformLocation | null;
  _uModelMatrixLoc: WebGLUniformLocation | null; _uPixelRatioLoc: WebGLUniformLocation | null;
  _uIsPointLoc: WebGLUniformLocation | null; _aPositionLoc: number; _aColorLoc: number;
  updatePositions(points: readonly MeasurementPoint[]): void;
}

/** Owns the measurement GL registration on its creating viewer. SDK callbacks own
 * GL creation/deletion; this class adds no animation loop, timer or point-cloud copy.
 */
export class MeasurementViewerRenderer {
  private viewer: MeasurementViewer | null = null;
  private renderer: MeasurementRendererState | null = null;
  /** Bind lazy readers once; React state and DOM nodes are borrowed only when needed. */
  constructor(private readonly dependencies: MeasurementViewerDependencies) {}

  /** Preserve empty/add/update/resize behavior; a replaced viewer gets a fresh registration. */
  sync(viewer: MeasurementViewer | null): void {
    if (this.viewer && this.viewer !== viewer) this.detach(false);
    if (!viewer) return;
    const points = this.dependencies.readPoints();
    if (!points.length) { this.detach(); return; }
    if (!this.renderer) this.attach(viewer);
    else { this.renderer.updatePositions(points); viewer.resize(); }
  }

  /** Remove from the original viewer even after its host reference is lost/replaced.
   * Normal clear redraws; viewer teardown skips resize. SDK invokes onRemove for GL deletion.
   */
  detach(resize = true): void {
    const viewer = this.viewer;
    if (viewer && this.renderer) {
      try { viewer.removeCustomRenderer('measurement-line-renderer'); } catch (_) {}
      this.viewer = null; this.renderer = null;
      if (resize) viewer.resize();
    }
    const label = this.dependencies.readLabel();
    if (label) label.style.display = 'none';
  }

  /** Keep shader source, transparent pass, ENU conversion and GL operation order intact. */
  private attach(viewer: MeasurementViewer): void {
    const vsSource = `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            varying vec3 vColor;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uModelMatrix;
            uniform float uPixelRatio;

            void main(void) {
                gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
                gl_PointSize = 16.0 * uPixelRatio;
                vColor = aColor;
            }
        `;

    const fsSource = `
            precision mediump float;
            uniform float uIsPoint;
            varying vec3 vColor;

            void main(void) {
                if (uIsPoint > 0.5) {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) discard;
                    if (dist > 0.35) {
                        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                    } else {
                        gl_FragColor = vec4(vColor, 1.0);
                    }
                } else {
                    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
                }
            }
        `;

    const dependencies = this.dependencies;

    const renderer: MeasurementRendererState = {
      id: "measurement-line-renderer",
      // RenderPass: 3 is Transparent Mode. It forces this renderer to draw
      // LAST, directly on top of the Opaque Point Cloud (Pass 2) and Image (Pass 1).
      renderPass: 3,
      _gl: null,
      _program: null,
      _positionBuffer: null,
      _colorBuffer: null,
      _modelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
      _currentReference: null,
      _vertexCount: 0,
      _uViewMatrixLoc: null, _uProjectionMatrixLoc: null, _uModelMatrixLoc: null,
      _uPixelRatioLoc: null, _uIsPointLoc: null, _aPositionLoc: -1, _aColorLoc: -1,

      onAdd(viewer: unknown, reference: MeasurementReference, context: WebGLRenderingContext) {
        const gl = context;
        this._gl = gl;
        this._currentReference = reference;

        const compile = (type: number, src: string) => {
          const s = gl.createShader(type)!;
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        };

        const vs = compile(gl.VERTEX_SHADER, vsSource);
        const fs = compile(gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        this._program = program;

        this._uViewMatrixLoc = gl.getUniformLocation(program, "uViewMatrix");
        this._uProjectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
        this._uModelMatrixLoc = gl.getUniformLocation(program, "uModelMatrix");
        this._uPixelRatioLoc = gl.getUniformLocation(program, "uPixelRatio");
        this._uIsPointLoc = gl.getUniformLocation(program, "uIsPoint");
        this._aPositionLoc = gl.getAttribLocation(program, "aPosition");
        this._aColorLoc = gl.getAttribLocation(program, "aColor");

        this._positionBuffer = gl.createBuffer()!;
        this._colorBuffer = gl.createBuffer()!;

        this.updatePositions(dependencies.readPoints());
      },

      onReference(viewer: unknown, reference: MeasurementReference) {
        this._currentReference = reference;
        this.updatePositions(dependencies.readPoints());
      },

      updatePositions(pts: readonly MeasurementPoint[]) {
        const gl = this._gl;
        if (!gl || !this._positionBuffer || !this._colorBuffer || !this._currentReference) return;

        this._vertexCount = pts.length;
        if (pts.length === 0) return;

        const positions = new Float32Array(pts.length * 3);
        const colors = new Float32Array(pts.length * 3);

        pts.forEach((pt, i) => {
          const enu = dependencies.toEnu(pt.rawLon, pt.rawLat, pt.alt, this._currentReference!.lng, this._currentReference!.lat, this._currentReference!.alt);
          positions[i * 3] = enu[0];
          positions[i * 3 + 1] = enu[1];
          positions[i * 3 + 2] = enu[2];

          if (i === 0) {
            colors[i * 3] = 0.0;
            colors[i * 3 + 1] = 1.0;
            colors[i * 3 + 2] = 1.0;
          } else {
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.0;
            colors[i * 3 + 2] = 1.0;
          }
        });

        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        // Switch to DYNAMIC_DRAW to stop graphics drivers from failing during fast updates
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
      },

      onRemove(viewer: any, context: WebGLRenderingContext) {
        const gl = context;
        if (this._program) gl.deleteProgram(this._program);
        if (this._positionBuffer) gl.deleteBuffer(this._positionBuffer);
        if (this._colorBuffer) gl.deleteBuffer(this._colorBuffer);
        this._gl = null;
      },

      render(context: WebGLRenderingContext, viewMatrix: number[] | Float32Array, projectionMatrix: number[] | Float32Array) {
        const gl = context;
        const program = this._program;
        if (!program || !this._positionBuffer || this._vertexCount === 0) return;

        gl.useProgram(program);

        gl.uniformMatrix4fv(this._uViewMatrixLoc, false, viewMatrix);
        gl.uniformMatrix4fv(this._uProjectionMatrixLoc, false, projectionMatrix);
        gl.uniformMatrix4fv(this._uModelMatrixLoc, false, this._modelMatrix);
        gl.uniform1f(this._uPixelRatioLoc, dependencies.readPixelRatio());

        gl.enableVertexAttribArray(this._aPositionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.vertexAttribPointer(this._aPositionLoc, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(this._aColorLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        gl.vertexAttribPointer(this._aColorLoc, 3, gl.FLOAT, false, 0, 0);

        // ROBUST RENDERING STATE
        // Disable depth testing completely so it draws ON TOP of the imagery and point cloud
        gl.disable(gl.DEPTH_TEST);

        // Enable Blending for crisp anti-aliased points
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // 1. Draw the connecting yellow line (Only if 2 points exist)
        if (this._vertexCount === 2) {
          gl.uniform1f(this._uIsPointLoc, 0.0);
          gl.lineWidth(3.0);
          gl.drawArrays(gl.LINES, 0, 2);
        }

        // 2. Draw the Cyan & Magenta anchor points on top
        gl.uniform1f(this._uIsPointLoc, 1.0);
        gl.drawArrays(gl.POINTS, 0, this._vertexCount);

        // RESTORE RENDERING STATE
        // Protects Mapillary JS from breaking after our draw cycle
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);

        gl.disableVertexAttribArray(this._aPositionLoc);
        gl.disableVertexAttribArray(this._aColorLoc);

        const label = dependencies.readLabel();
        // DYNAMIC HTML TEXT TRACKING
        if (this._vertexCount === 2 && label) {
          const pts = dependencies.readPoints();
          const p1 = pts[0];
          const p2 = pts[1];

          if (this._currentReference && p1 && p2) {
            const transform = (m: number[] | Float32Array, v: number[]) => [
              m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
              m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
              m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
              m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],
            ];

            const enu1 = dependencies.toEnu(p1.rawLon, p1.rawLat, p1.alt, this._currentReference!.lng, this._currentReference!.lat, this._currentReference!.alt);
            const enu2 = dependencies.toEnu(p2.rawLon, p2.rawLat, p2.alt, this._currentReference!.lng, this._currentReference!.lat, this._currentReference!.alt);

            const midX = (enu1[0] + enu2[0]) / 2;
            const midY = (enu1[1] + enu2[1]) / 2;
            const midZ = (enu1[2] + enu2[2]) / 2;

            const vView = transform(viewMatrix, [midX, midY, midZ, 1.0]);
            const vClip = transform(projectionMatrix, vView);

            if (vClip[3] > 0) {
              const ndcX = vClip[0] / vClip[3];
              const ndcY = vClip[1] / vClip[3];

              if (ndcX >= -1 && ndcX <= 1 && ndcY >= -1 && ndcY <= 1) {
                const canvas = dependencies.readCanvas();
                if (canvas) {
                  const screenX = ((ndcX + 1) * canvas.clientWidth) / 2;
                  const screenY = ((1 - ndcY) * canvas.clientHeight) / 2;

                  label.style.left = `${screenX}px`;
                  label.style.top = `${screenY}px`;
                  label.style.display = "block";
                }
              } else {
                label.style.display = "none";
              }
            } else {
              label.style.display = "none";
            }
          }
        } else if (label) {
          label.style.display = "none";
        }
      },
    };

    try {
      viewer.addCustomRenderer(renderer);
      this.viewer = viewer; this.renderer = renderer;
      viewer.resize();
    } catch (error) { this.dependencies.warn('Could not attach measurement renderer:', error); }
  }
}
